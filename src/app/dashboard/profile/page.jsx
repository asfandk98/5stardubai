'use client'
// src/app/dashboard/profile/page.jsx

import { useEffect, useState } from "react"
import { User, Mail, Save, KeyRound } from "lucide-react"

const API = "https://api.alainhotel.com/api"
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
})

export default function ProfilePage() {
  const [form,    setForm]    = useState({ name: "", email: "" })
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    fetch(`${API}/user/profile`, { headers: authHeaders() })
      .then(r => r.json())
      .then(data => { setForm({ name: data.name ?? "", email: data.email ?? "" }); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const res  = await fetch(`${API}/user/profile`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        const stored = JSON.parse(localStorage.getItem("user") ?? "{}")
        localStorage.setItem("user", JSON.stringify({ ...stored, ...form }))
        window.dispatchEvent(new Event("auth-change"))
        setMessage({ type: "success", text: "Profile updated successfully." })
      } else {
        setMessage({ type: "error", text: data.message ?? "Update failed." })
      }
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." })
    }
    setSaving(false)
  }

  const initials = form.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() ?? "U"

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-5 md:space-y-6 max-w-lg">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white">Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account details</p>
      </div>

      {/* Avatar row */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-rose-500 flex items-center justify-center text-white text-lg md:text-xl font-bold shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-white font-semibold truncate">{form.name}</p>
          <p className="text-gray-500 text-sm truncate">{form.email}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 md:p-6 space-y-5">
        <div className="border-b border-white/5 pb-3 mb-1">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Personal Information</p>
        </div>

        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wide mb-2">Full Name</label>
          <div className="relative">
            <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="text" value={form.name} required
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-rose-500/50 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wide mb-2">Email Address</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="email" value={form.email} required
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-rose-500/50 transition"
            />
          </div>
        </div>

        {message && (
          <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
            message.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border border-red-500/20 text-red-400"
          }`}>
            {message.text}
          </div>
        )}

        <button type="submit" disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-semibold transition">
          {saving
            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <Save size={15} />
          }
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>

      {/* Password note */}
      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 md:p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
          <KeyRound size={18} className="text-gray-500" />
        </div>
        <div>
          <p className="text-white text-sm font-semibold">Password</p>
          <p className="text-gray-500 text-xs mt-0.5">Contact support to change your password</p>
        </div>
      </div>
    </div>
  )
}
