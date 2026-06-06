'use client'
// src/app/admin/blog/create/page.js

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "react-hot-toast"
import { Upload, X, Sparkles, Loader2 } from "lucide-react"

const API      = "https://api.alainhotel.com/api/admin"
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
const GROQ_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY

// ── AI Generator ──────────────────────────────────────────────────────────────
async function generateBlogPost(title, category) {
  const prompt = `You are an expert travel and hospitality content writer for a UAE hotel booking platform called Chain of Hotels.

Write a complete, SEO-optimized blog post for the following title:
"${title}"
${category ? `Category: ${category}` : ""}

Return ONLY a valid JSON object with NO markdown, NO backticks, NO preamble. Just the raw JSON:
{
  "excerpt": "A compelling 1-2 sentence summary under 160 characters",
  "content": "Full HTML blog post with <h2>, <p>, <ul>, <li> tags. Minimum 600 words. Include practical tips, local insights about UAE/Dubai/Abu Dhabi/Sharjah. Professional and engaging tone.",
  "meta_title": "SEO meta title under 60 characters",
  "meta_description": "SEO meta description under 160 characters",
  "meta_keywords": "keyword1, keyword2, keyword3, keyword4, keyword5",
  "tags": "tag1, tag2, tag3"
}`

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2000,
      temperature: 0.7,
    }),
  })

  if (!res.ok) throw new Error("Groq API error")
  const data = await res.json()
  const raw  = data.choices?.[0]?.message?.content ?? ""

  // Strip markdown fences if Groq wraps in ```json
  const clean = raw.replace(/```json|```/g, "").trim()
  return JSON.parse(clean)
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function BlogPostForm() {
  const router  = useRouter()
  const params  = useParams()
  const postId  = params?.id

  const [categories,   setCategories]   = useState([])
  const [generating,   setGenerating]   = useState(false)
  const [form, setForm] = useState({
    title:            "",
    blog_category_id: "",
    excerpt:          "",
    content:          "",
    status:           "draft",
    featured:         false,
    publish_date:     "",
    meta_title:       "",
    meta_description: "",
    meta_keywords:    "",
    canonical_url:    "",
    tags:             "",
  })
  const [featuredImage,   setFeaturedImage]   = useState(null)
  const [featuredPreview, setFeaturedPreview] = useState(null)
  const [ogImage,         setOgImage]         = useState(null)
  const [ogPreview,       setOgPreview]       = useState(null)
  const [saving,          setSaving]          = useState(false)
  const [loading,         setLoading]         = useState(!!postId)

  const token = () => localStorage.getItem("token")

  // Load categories
  useEffect(() => {
    fetch(`${API}/blog/categories`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  // Load existing post if editing
  useEffect(() => {
    if (!postId) return
    fetch(`${API}/blog/posts/${postId}`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(data => {
        setForm({
          title:            data.title ?? "",
          blog_category_id: data.blog_category_id ?? "",
          excerpt:          data.excerpt ?? "",
          content:          data.content ?? "",
          status:           data.status ?? "draft",
          featured:         !!data.featured,
          publish_date:     data.publish_date?.split("T")[0] ?? "",
          meta_title:       data.meta_title ?? "",
          meta_description: data.meta_description ?? "",
          meta_keywords:    data.meta_keywords ?? "",
          canonical_url:    data.canonical_url ?? "",
          tags:             data.tags ?? "",
        })
        if (data.featured_image) setFeaturedPreview(`https://api.alainhotel.com/storage/${data.featured_image}`)
        if (data.og_image)       setOgPreview(`https://api.alainhotel.com/storage/${data.og_image}`)
        setLoading(false)
      })
  }, [postId])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
  }

  // ── AI Generate ─────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!form.title.trim()) {
      toast.error("Enter a title first — the AI needs it to generate content")
      return
    }

    setGenerating(true)
    const toastId = toast.loading("✨ AI is writing your blog post…")

    try {
      const selectedCategory = categories.find(c => c.id == form.blog_category_id)
      const generated = await generateBlogPost(form.title, selectedCategory?.name)

      setForm(prev => ({
        ...prev,
        excerpt:          generated.excerpt          ?? prev.excerpt,
        content:          generated.content          ?? prev.content,
        meta_title:       generated.meta_title       ?? prev.meta_title,
        meta_description: generated.meta_description ?? prev.meta_description,
        meta_keywords:    generated.meta_keywords    ?? prev.meta_keywords,
        tags:             generated.tags             ?? prev.tags,
      }))

      toast.success("✨ Blog post generated! Review and edit before publishing.", { id: toastId })
    } catch (err) {
      console.error(err)
      toast.error("AI generation failed. Check your GROQ_API_KEY or try again.", { id: toastId })
    } finally {
      setGenerating(false)
    }
  }

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim())   { toast.error("Title is required"); return }
    if (!form.content.trim()) { toast.error("Content is required"); return }
    setSaving(true)

    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    if (featuredImage) fd.append("featured_image", featuredImage)
    if (ogImage)       fd.append("og_image", ogImage)
    if (postId)        fd.append("_method", "PUT")

    try {
      const res = await fetch(
        postId ? `${API}/blog/posts/${postId}` : `${API}/blog/posts`,
        { method: "POST", headers: { Authorization: `Bearer ${token()}` }, body: fd }
      )
      if (!res.ok) throw new Error()
      toast.success(postId ? "Post updated!" : "Post created!")
      router.push("/admin/blog")
    } catch {
      toast.error("Failed to save post")
    } finally {
      setSaving(false)
    }
  }

  const ImageUpload = ({ file, preview, setFile, setPreview, label, hint }) => (
    <div className="space-y-2">
      <label className="text-xs text-gray-400 font-medium block">{label}</label>
      {hint && <p className="text-xs text-gray-600">{hint}</p>}
      <label className="block cursor-pointer">
        <div className={`border-2 border-dashed rounded-xl p-5 text-center transition
          ${preview ? "border-gray-700" : "border-gray-700 hover:border-rose-500"}`}>
          {preview ? (
            <div className="relative inline-block">
              <img src={preview} className="h-32 rounded-lg object-cover" alt="preview" />
              <button type="button"
                onClick={(e) => { e.preventDefault(); setFile(null); setPreview(null) }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white">
                <X size={10} />
              </button>
            </div>
          ) : (
            <div className="text-gray-500">
              <Upload size={20} className="mx-auto mb-2" />
              <p className="text-xs">Click to upload PNG, JPG up to 2MB</p>
            </div>
          )}
        </div>
        <input type="file" accept="image/*" className="hidden"
          onChange={e => {
            const f = e.target.files?.[0]
            if (!f) return
            setFile(f)
            setPreview(URL.createObjectURL(f))
          }} />
      </label>
    </div>
  )

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{postId ? "Edit Post" : "New Blog Post"}</h1>
          <p className="text-gray-500 text-sm mt-1">Fill in the details or let AI write it for you</p>
        </div>

        {/* ── AI Generate Button ── */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-60 shadow-lg shadow-violet-900/30"
        >
          {generating
            ? <><Loader2 size={15} className="animate-spin" /> Generating…</>
            : <><Sparkles size={15} /> Generate with AI</>
          }
        </button>
      </div>

      {/* AI tip banner */}
      <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl px-4 py-3 flex items-start gap-3">
        <Sparkles size={16} className="text-violet-400 shrink-0 mt-0.5" />
        <p className="text-xs text-violet-300 leading-relaxed">
          <strong>How to use AI:</strong> Enter a title (and optionally select a category), then click <strong>"Generate with AI"</strong>.
          The AI will write the full post, excerpt, SEO fields and tags. Review everything before publishing.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* POST DETAILS */}
        <Section title="Post Details">
          <Field label="Title *">
            <input name="title" value={form.title} onChange={handleChange} required
              placeholder="e.g. Best Luxury Hotels in Dubai Marina 2026"
              className="input" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <select name="blog_category_id" value={form.blog_category_id} onChange={handleChange} className="input">
                <option value="">— No Category —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Publish Date">
              <input type="date" name="publish_date" value={form.publish_date} onChange={handleChange} className="input" />
            </Field>
          </div>

          <Field label="Excerpt">
            <textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows={2}
              placeholder="Short summary shown in listings… (AI will fill this)"
              className="input resize-none" />
          </Field>
        </Section>

        {/* CONTENT */}
        <Section title="Content">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500">AI generates HTML content — you can edit it below</p>
            {form.content && (
              <span className="text-xs text-emerald-400">
                ✓ {form.content.replace(/<[^>]*>/g, "").length} characters
              </span>
            )}
          </div>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            rows={16}
            placeholder="Write your blog post here… or click Generate with AI above ✨"
            className="input resize-none font-mono text-xs leading-relaxed"
          />
        </Section>

        {/* PUBLISH SETTINGS */}
        <Section title="Publish Settings">
          <div className="grid grid-cols-2 gap-6">
            <Field label="Status *">
              <select name="status" value={form.status} onChange={handleChange} className="input">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
            <Field label="Tags (comma separated)">
              <input name="tags" value={form.tags} onChange={handleChange}
                placeholder="AI will suggest tags… or add your own" className="input" />
            </Field>
          </div>

          <div className="flex items-center gap-8 pt-2">
            <Toggle
              label="Active"
              description="Visible to readers"
              active={form.status === "published"}
              onToggle={() => setForm(p => ({ ...p, status: p.status === "published" ? "draft" : "published" }))}
            />
            <Toggle
              label="Featured"
              description="Show in featured section"
              active={form.featured}
              onToggle={() => setForm(p => ({ ...p, featured: !p.featured }))}
            />
          </div>
        </Section>

        {/* IMAGES */}
        <Section title="Images">
          <div className="grid grid-cols-2 gap-6">
            <ImageUpload
              file={featuredImage} preview={featuredPreview}
              setFile={setFeaturedImage} setPreview={setFeaturedPreview}
              label="Featured Image" hint="PNG, JPG up to 2MB"
            />
            <ImageUpload
              file={ogImage} preview={ogPreview}
              setFile={setOgImage} setPreview={setOgPreview}
              label="OG Image" hint="Recommended: 1200×630px"
            />
          </div>
        </Section>

        {/* SEO */}
        <Section title="SEO Settings">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500">AI fills these automatically — review before publishing</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Meta Title">
              <input name="meta_title" value={form.meta_title} onChange={handleChange}
                placeholder="SEO page title…" className="input" />
            </Field>
            <Field label="Canonical URL">
              <input name="canonical_url" value={form.canonical_url} onChange={handleChange}
                placeholder="https://…" className="input" />
            </Field>
          </div>
          <Field label="Meta Description">
            <textarea name="meta_description" value={form.meta_description} onChange={handleChange} rows={2}
              placeholder="160 character description for search engines…"
              className="input resize-none" />
          </Field>
          <Field label="Meta Keywords">
            <input name="meta_keywords" value={form.meta_keywords} onChange={handleChange}
              placeholder="keyword1, keyword2…" className="input" />
          </Field>
        </Section>

        {/* SUBMIT */}
        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50">
            {saving ? "Saving…" : postId ? "Update Post" : "Publish Post"}
          </button>
          <button type="button" onClick={() => router.push("/admin/blog")}
            className="px-6 py-3 border border-gray-700 text-gray-400 rounded-xl hover:bg-gray-800 transition">
            Cancel
          </button>
        </div>

      </form>

      <style jsx global>{`
        .input {
          width: 100%;
          background: #111827;
          border: 1px solid #374151;
          border-radius: 0.75rem;
          padding: 0.625rem 0.875rem;
          color: #f9fafb;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s;
        }
        .input:focus { border-color: #f43f5e; }
        .input::placeholder { color: #6b7280; }
        select.input option { background: #111827; }
      `}</style>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-400">{label}</label>
      {children}
    </div>
  )
}

function Toggle({ label, description, active, onToggle }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer" onClick={onToggle}>
      <div className={`w-10 h-5 rounded-full transition-colors relative ${active ? "bg-rose-500" : "bg-gray-700"}`}>
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${active ? "translate-x-5" : "translate-x-0.5"}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </label>
  )
}
