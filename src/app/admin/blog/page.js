'use client'
// src/app/admin/blog/page.js

import { useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "react-hot-toast"
import { Plus, Pencil, Trash2, Star, Eye, EyeOff } from "lucide-react"

const API = "https://api.alainhotel.com/api"

const STATUS_COLORS = {
  published: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  draft:     "bg-gray-700 text-gray-400 border-gray-600",
  archived:  "bg-violet-500/10 text-violet-400 border-violet-500/30",
}

export default function BlogPosts() {
  const [posts,   setPosts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [page,    setPage]    = useState(1)
  const [meta,    setMeta]    = useState({})

  const token = () => localStorage.getItem("token")

  const fetchPosts = () => {
    setLoading(true)
    fetch(`${API}/blog/posts?page=${page}`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(data => {
        setPosts(data.data ?? data)
        setMeta(data.meta ?? {})
        setLoading(false)
      })
  }

  useEffect(() => { fetchPosts() }, [page])

  const remove = async (id) => {
    if (!confirm("Delete this post?")) return
    await fetch(`${API}/blog/posts/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token()}` },
    })
    setPosts(prev => prev.filter(p => p.id !== id))
    toast.success("Post deleted")
  }

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Blog Posts</h1>
          <p className="text-gray-500 text-sm mt-1">{meta.total ?? posts.length} posts</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/blog/categories">
            <button className="border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 px-4 py-2.5 rounded-xl text-sm font-medium transition">
              Categories
            </button>
          </Link>
          <Link href="/admin/blog/create">
            <button className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition">
              <Plus size={16} /> New Post
            </button>
          </Link>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
              <th className="text-left px-6 py-4">Title</th>
              <th className="text-left px-6 py-4">Category</th>
              <th className="text-left px-6 py-4">Status</th>
              <th className="text-left px-6 py-4">Featured</th>
              <th className="text-left px-6 py-4">Date</th>
              <th className="text-right px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-16">
                <div className="w-6 h-6 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </td></tr>
            ) : posts.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-16 text-gray-600">No posts yet</td></tr>
            ) : posts.map(post => (
              <tr key={post.id} className="hover:bg-gray-800/50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {post.featured_image ? (
                      <img src={`https://api.alainhotel.com/storage/${post.featured_image}`}
                        className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-xl">📝</div>
                    )}
                    <div>
                      <p className="font-medium text-white line-clamp-1">{post.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{post.excerpt ?? ""}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-400">{post.category?.name ?? "—"}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${STATUS_COLORS[post.status] ?? STATUS_COLORS.draft}`}>
                    {post.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {post.featured
                    ? <span className="flex items-center gap-1 text-rose-400 text-xs"><Star size={12} className="fill-rose-400" /> Featured</span>
                    : <span className="text-gray-600 text-xs">—</span>
                  }
                </td>
                <td className="px-6 py-4 text-gray-500 text-xs">{fmt(post.publish_date ?? post.created_at)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/blog/${post.id}/edit`}>
                      <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition">
                        <Pencil size={14} />
                      </button>
                    </Link>
                    <button onClick={() => remove(post.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm transition
                ${p === page ? "bg-rose-500 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}