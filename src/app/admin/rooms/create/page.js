'use client'
// src/app/admin/rooms/create/page.js

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { Upload, X, ImagePlus } from "lucide-react"

const API = "https://api.alainhotel.com/backend/api/admin"

const ROOM_AMENITIES = [
  "King Size Bed", "Twin Beds", "Ocean View", "Balcony", "Mini Bar",
  "Jacuzzi", "Living Room", "Butler Service", "Private Pool", "City View",
  "Free WiFi", "Air Conditioning", "Safe", "Smart TV", "Bathrobe & Slippers",
]

export default function CreateRoomPage() {
  const router   = useRouter()
  const fileRef  = useRef(null)

  const [hotels,   setHotels]   = useState([])
  const [saving,   setSaving]   = useState(false)
  const [previews, setPreviews] = useState([]) // { file, url }
  const [form,     setForm]     = useState({
    hotel_id:    "",
    name:        "",
    size:        "",
    beds:        "1",
    price:       "",
    description: "",
    amenities:   [],
  })

  const token = () => localStorage.getItem("token")

  useEffect(() => {
    fetch(`${API}/hotels`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(data => setHotels(Array.isArray(data) ? data : data.data ?? []))
      .catch(() => toast.error("Failed to load hotels"))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const toggleAmenity = (a) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(a)
        ? prev.amenities.filter(x => x !== a)
        : [...prev.amenities, a],
    }))
  }

  // ── Image handling ────────────────────────────────────────────────────────
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const newPreviews = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
    }))
    setPreviews(prev => [...prev, ...newPreviews])
    // reset input so same file can be re-added if removed
    e.target.value = ""
  }

  const removePreview = (idx) => {
    setPreviews(prev => {
      URL.revokeObjectURL(prev[idx].url)
      return prev.filter((_, i) => i !== idx)
    })
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.hotel_id)    { toast.error("Please select a hotel"); return }
    if (!form.name.trim()) { toast.error("Room name is required"); return }
    if (!form.price)       { toast.error("Price is required"); return }

    setSaving(true)
    try {
      // 1️⃣ Create room (JSON)
      const res = await fetch(`${API}/hotels/${form.hotel_id}/rooms`, {
        method: "POST",
        headers: {
          Authorization:  `Bearer ${token()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name:        form.name,
          size:        form.size,
          beds:        form.beds,
          price:       form.price,
          description: form.description,
          amenities:   form.amenities,
        }),
      })

      if (!res.ok) throw new Error("Failed to create room")
      const room = await res.json()

      // 2️⃣ Upload images if any (multipart)
      if (previews.length > 0) {
        const fd = new FormData()
        previews.forEach(p => fd.append("images[]", p.file))

        await fetch(`${API}/rooms/${room.id}/images`, {
          method:  "POST",
          headers: { Authorization: `Bearer ${token()}` },
          body:    fd,
        })
      }

      toast.success("Room created successfully!")
      router.push("/admin/hotels")
    } catch (err) {
      toast.error(err.message ?? "Failed to create room")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Add New Room</h1>
        <p className="text-gray-500 text-sm mt-1">Create a room and assign it to a hotel</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Hotel selector */}
        <Section title="Select Hotel">
          <Field label="Hotel *">
            <select
              name="hotel_id"
              value={form.hotel_id}
              onChange={handleChange}
              required
              className="input"
            >
              <option value="">— Choose a hotel —</option>
              {hotels.map(h => (
                <option key={h.id} value={h.id}>{h.title} — {h.location}</option>
              ))}
            </select>
          </Field>
        </Section>

        {/* Room details */}
        <Section title="Room Details">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Room Name *">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="e.g. Deluxe Suite"
                className="input"
              />
            </Field>
            <Field label="Size">
              <input
                name="size"
                value={form.size}
                onChange={handleChange}
                placeholder="e.g. 50m²"
                className="input"
              />
            </Field>
            <Field label="Number of Beds *">
              <input
                name="beds"
                type="number"
                min="1"
                value={form.beds}
                onChange={handleChange}
                required
                className="input"
              />
            </Field>
            <Field label="Price per Night (AED) *">
              <input
                name="price"
                type="number"
                min="0"
                value={form.price}
                onChange={handleChange}
                required
                placeholder="2500"
                className="input"
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Describe the room..."
              className="input resize-none"
            />
          </Field>
        </Section>

        {/* Room Images */}
        <Section title="Room Images">
          {/* Upload area */}
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-rose-500/50 hover:bg-rose-500/5 transition group"
          >
            <ImagePlus size={28} className="text-gray-600 group-hover:text-rose-400 mx-auto mb-2 transition" />
            <p className="text-sm text-gray-500 group-hover:text-gray-300 transition">
              Click to upload room photos
            </p>
            <p className="text-xs text-gray-600 mt-1">PNG, JPG up to 5MB each</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageSelect}
            />
          </div>

          {/* Previews grid */}
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-3">
              {previews.map((p, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden aspect-video bg-gray-800">
                  <img
                    src={p.url}
                    alt={`preview-${idx}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePreview(idx)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition hover:bg-red-500"
                  >
                    <X size={12} />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-rose-500 text-white px-1.5 py-0.5 rounded font-medium">
                      Cover
                    </span>
                  )}
                </div>
              ))}

              {/* Add more */}
              <div
                onClick={() => fileRef.current?.click()}
                className="aspect-video border-2 border-dashed border-gray-700 rounded-xl flex items-center justify-center cursor-pointer hover:border-rose-500/50 transition"
              >
                <Upload size={18} className="text-gray-600" />
              </div>
            </div>
          )}

          {previews.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {previews.length} image{previews.length !== 1 ? "s" : ""} selected · First image used as cover
            </p>
          )}
        </Section>

        {/* Amenities */}
        <Section title="Room Amenities">
          <div className="flex flex-wrap gap-2">
            {ROOM_AMENITIES.map(a => (
              <button
                key={a}
                type="button"
                onClick={() => toggleAmenity(a)}
                className={`px-3 py-1.5 rounded-full text-sm border transition
                  ${form.amenities.includes(a)
                    ? "bg-rose-500 text-white border-rose-500"
                    : "border-gray-700 text-gray-400 hover:border-gray-500"}`}
              >
                {a}
              </button>
            ))}
          </div>
          {form.amenities.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">{form.amenities.length} amenity(s) selected</p>
          )}
        </Section>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
              : "Create Room"
            }
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/hotels")}
            className="px-6 py-3 border border-gray-700 text-gray-400 rounded-xl hover:bg-gray-800 transition"
          >
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