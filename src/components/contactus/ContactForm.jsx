"use client"
// src/components/contactus/ContactForm.jsx

import { useState } from "react"
import { toast } from "react-hot-toast"
import { Send, Loader2, CheckCircle } from "lucide-react"

const API = "https://api.alainhotel.com/backend/api" 

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", message: ""
  })
  const [loading,   setLoading]   = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors,    setErrors]    = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    // Clear error on change
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim())         errs.name    = "Name is required"
    if (!form.email.trim())        errs.email   = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email"
    if (!form.message.trim())      errs.message = "Message is required"
    else if (form.message.length < 10) errs.message = "Message must be at least 10 characters"
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    try {
      const res = await fetch(`${API}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? "Failed to send")

      setSubmitted(true)
      toast.success("Message sent! We'll get back to you soon.")
    } catch (err) {
      toast.error(err.message ?? "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="bg-white shadow-xl rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[400px] space-y-4">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900">Message Sent!</h2>
        <p className="text-gray-500 max-w-xs">
          Thank you for reaching out. We've sent a confirmation to <strong>{form.email}</strong> and will get back to you within 24 hours.
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", message: "" }) }}
          className="mt-4 text-sm text-rose-500 hover:text-rose-600 underline transition"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-xl rounded-2xl p-8">
      <h2 className="text-2xl font-semibold mb-2">Send us a Message</h2>
      <p className="text-gray-400 text-sm mb-6">We typically reply within 24 hours.</p>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Name */}
        <div>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name *"
            className={`w-full border rounded-xl p-3 text-sm outline-none transition focus:border-rose-400
              ${errors.name ? "border-red-400 bg-red-50" : "border-gray-200"}`}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1 ml-1">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email Address *"
            className={`w-full border rounded-xl p-3 text-sm outline-none transition focus:border-rose-400
              ${errors.email ? "border-red-400 bg-red-50" : "border-gray-200"}`}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1 ml-1">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone Number (optional)"
            className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none transition focus:border-rose-400"
          />
        </div>

        {/* Message */}
        <div>
          <textarea
            rows={5}
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Your Message *"
            className={`w-full border rounded-xl p-3 text-sm outline-none transition focus:border-rose-400 resize-none
              ${errors.message ? "border-red-400 bg-red-50" : "border-gray-200"}`}
          />
          <div className="flex items-center justify-between mt-1 px-1">
            {errors.message
              ? <p className="text-xs text-red-500">{errors.message}</p>
              : <span />
            }
            <p className="text-xs text-gray-400 ml-auto">{form.message.length} / 1000</p>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl transition font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Sending…
            </>
          ) : (
            <>
              <Send size={15} />
              Send Message
            </>
          )}
        </button>

        <p className="text-xs text-gray-400 text-center">
          By submitting, you agree to our privacy policy.
        </p>

      </form>
    </div>
  )
}
