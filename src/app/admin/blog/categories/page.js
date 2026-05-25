'use client'
// src/app/admin/blog/categories/page.js

import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { Plus, Pencil, Trash2, X, Check } from "lucide-react"

const API = "https://api.alainhotel.com/api"

export default function BlogCategories() {
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [editing,    setEditing]    = useState(null) // category being edited
  const [form,       setForm]       = useState({ name: "", description: "", status: "active" })
  const [saving,     setSaving]     = useState(false)

  const token = () => localStorage.getItem("token")

  useEffect(() => {
    fetch(`${API}/blog/categories`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(data => { setCategories(data); setLoading(false) })
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: "", description: "", status: "active" })
    setShowForm(true)
  }

  const openEdit = (cat) => {
    setEditing(cat)
    setForm({ name: cat.name, description: cat.description ?? "", status: cat.status ?? "active" })
    setShowForm(true)
  }

  const save = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return }
    setSaving(true)
    try {
      const url    = editing ? `${API}/blog/categories/${editing.id}` : `${API}/blog/categories`
      const method = editing ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (editing) {
        setCategories(prev => prev.map(c => c.id === data.id ? data : c))
        toast.success("Category updated")
      } else {
        setCategories(prev => [data, ...prev])
        toast.success("Category created")
      }
      setShowForm(false)
    } catch {
      toast.error("Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    if (!confirm("Delete this category? Posts in it won't be deleted.")) return
    await fetch(`${API}/blog/categories/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token()}` },
    })
    setCategories(prev => prev.filter(c => c.id !== id))
    toast.success("Category deleted")
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Blog Categories</h1>
          <p className="text-gray-500 text-sm mt-1">{categories.length} categories</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition">
          <Plus size={16} /> New Category
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-gray-900 border border-rose-500/30 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">{editing ? "Edit Category" : "New Category"}</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white transition"><X size={18} /></button>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 font-medium">Name *</label>
            <input
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Travel Tips"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 font-medium">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3}
              placeholder="Short description of this category…"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-500 resize-none"
            />
          </div>

          {/* Status toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setForm(p => ({ ...p, status: p.status === "active" ? "inactive" : "active" }))}
              className={`w-10 h-5 rounded-full transition-colors relative ${form.status === "active" ? "bg-rose-500" : "bg-gray-700"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.status === "active" ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
            <span className="text-sm text-gray-300">
              {form.status === "active" ? "Active" : "Inactive"}
            </span>
          </div>

          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50">
            <Check size={15} />
            {saving ? "Saving…" : editing ? "Update" : "Create"}
          </button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                <th className="text-left px-6 py-4">Name</th>
                <th className="text-left px-6 py-4">Description</th>
                <th className="text-left px-6 py-4">Posts</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-right px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {categories.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-600">No categories yet</td></tr>
              ) : categories.map(cat => (
                <tr key={cat.id} className="hover:bg-gray-800/50 transition">
                  <td className="px-6 py-4 font-medium text-white">{cat.name}</td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{cat.description ?? "—"}</td>
                  <td className="px-6 py-4 text-gray-400">{cat.posts_count ?? 0}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border
                      ${cat.status === "active"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-gray-700 text-gray-500 border-gray-600"}`}>
                      {cat.status ?? "active"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(cat)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => remove(cat.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}