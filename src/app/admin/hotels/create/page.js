'use client'
// src/app/admin/hotels/create/page.js

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { Upload, X } from "lucide-react"
import Link from "next/link"

const API = "https://api.alainhotel.com/backend/api/admin"

const AMENITY_OPTIONS = [
  "Free WiFi", "Swimming Pool", "Spa", "Gym", "Restaurant",
  "Bar", "Room Service", "Airport Shuttle", "Parking", "Concierge",
  "Business Center", "Laundry", "Kids Club", "Private Beach", "Valet Parking",
]
const HOTEL_TYPES = ["Luxury", "Resort", "Boutique", "Business", "Budget", "Apartment", "Villa"]

export default function CreateHotelPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    title: "", location: "", price: "", type: "Luxury",
    guests: "2", rating: "", description: "",
    status: "draft", featured: false, amenities: [],
  })
  const [imageFile,    setImageFile]    = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [saving,       setSaving]       = useState(false)

  const token = () => localStorage.getItem("token")

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
  }

  const toggleAmenity = (a) => setForm(prev => ({
    ...prev,
    amenities: prev.amenities.includes(a)
      ? prev.amenities.filter(x => x !== a)
      : [...prev.amenities, a],
  }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => {
      if (k === "amenities") fd.append(k, JSON.stringify(v))
      else fd.append(k, v)
    })
    if (imageFile) fd.append("image", imageFile)

    try {
      const res = await fetch(`${API}/hotels`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
        body: fd,
      })
      if (!res.ok) throw new Error()
      toast.success("Hotel created!")
      router.push("/admin/hotels")
    } catch {
      toast.error("Failed to create hotel")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Add Hotel</h1>
          <p className="text-gray-500 text-sm mt-1">Create a new property listing</p>
        </div>
        <Link href="/admin/hotels">
          <button className="text-sm text-gray-500 hover:text-white transition">← Back</button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        <Section title="Basic Information">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Title *">
              <input name="title" value={form.title} onChange={handleChange} required
                className="input" placeholder="e.g. Burj Al Arab" />
            </Field>
            <Field label="Location *">
              <input name="location" value={form.location} onChange={handleChange} required
                className="input" placeholder="e.g. Dubai Marina" />
            </Field>
            <Field label="Price / night (AED) *">
              <input name="price" type="number" value={form.price} onChange={handleChange} required
                className="input" placeholder="1200" />
            </Field>
            <Field label="Max Guests *">
              <input name="guests" type="number" value={form.guests} onChange={handleChange} required
                className="input" placeholder="2" />
            </Field>
            <Field label="Hotel Type">
              <select name="type" value={form.type} onChange={handleChange} className="input">
                {HOTEL_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Star Rating">
              <input name="rating" type="number" step="0.1" min="1" max="5"
                value={form.rating} onChange={handleChange}
                className="input" placeholder="4.5" />
            </Field>
          </div>
        </Section>

        <Section title="Description">
          <textarea name="description" value={form.description} onChange={handleChange}
            rows={5} className="input resize-none" placeholder="Hotel description…" />
        </Section>

        <Section title="Visibility & Flags">
          <div className="flex items-center gap-8">
            <Toggle label="Active" description="Visible on frontend"
              active={form.status === "active"}
              onToggle={() => setForm(p => ({ ...p, status: p.status === "active" ? "draft" : "active" }))} />
            <Toggle label="Featured" description="Show in featured section"
              active={form.featured}
              onToggle={() => setForm(p => ({ ...p, featured: !p.featured }))} />
          </div>
        </Section>

        <Section title="Amenities">
          <div className="flex flex-wrap gap-2">
            {AMENITY_OPTIONS.map(a => (
              <button key={a} type="button" onClick={() => toggleAmenity(a)}
                className={`px-3 py-1.5 rounded-full text-sm border transition
                  ${form.amenities.includes(a)
                    ? "bg-rose-500 text-white border-rose-500"
                    : "border-gray-700 text-gray-400 hover:border-gray-500"}`}>
                {a}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Main Image">
          <label className="block cursor-pointer">
            <div className="border-2 border-dashed border-gray-700 hover:border-rose-500 rounded-xl p-8 text-center transition">
              {imagePreview ? (
                <div className="relative inline-block">
                  <img src={imagePreview} className="h-40 rounded-lg object-cover" />
                  <button type="button"
                    onClick={e => { e.preventDefault(); setImageFile(null); setImagePreview(null) }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white">
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="text-gray-600">
                  <Upload size={24} className="mx-auto mb-2" />
                  <p className="text-sm">Click to upload PNG, JPG, WebP</p>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" className="hidden"
              onChange={e => {
                const f = e.target.files?.[0]
                if (!f) return
                setImageFile(f)
                setImagePreview(URL.createObjectURL(f))
              }} />
          </label>
        </Section>

        <div className="flex gap-3 pb-10">
          <button type="submit" disabled={saving}
            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50">
            {saving ? "Creating…" : "Create Hotel"}
          </button>
          <button type="button" onClick={() => router.push("/admin/hotels")}
            className="px-6 py-3 border border-gray-700 text-gray-400 rounded-xl hover:bg-gray-800 transition">
            Cancel
          </button>
        </div>
      </form>

      <style jsx global>{`
        .input {
          width: 100%;
          background: #080a0f;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 0.75rem;
          padding: 0.6rem 0.875rem;
          color: #f9fafb;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s;
        }
        .input:focus { border-color: #f43f5e; }
        .input::placeholder { color: #4b5563; }
        select.input option { background: #0f1117; }
      `}</style>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5 space-y-4">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{title}</h2>
      {children}
    </div>
  )
}
function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-500">{label}</label>
      {children}
    </div>
  )
}
function Toggle({ label, description, active, onToggle }) {
  return (
    <div className="flex items-center gap-3 cursor-pointer" onClick={onToggle}>
      <div className={`w-10 h-5 rounded-full transition-colors relative ${active ? "bg-rose-500" : "bg-gray-700"}`}>
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${active ? "translate-x-5" : "translate-x-0.5"}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    </div>
  )
}