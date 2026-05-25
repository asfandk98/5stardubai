'use client'
// src/app/admin/hotels/[id]/edit/page.js

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "react-hot-toast"
import { Plus, Trash2, Upload, X, Pencil, Check } from "lucide-react"
import Link from "next/link"

const API = "https://api.alainhotel.com/api"

const AMENITY_OPTIONS = [
  "Free WiFi", "Swimming Pool", "Spa", "Gym", "Restaurant",
  "Bar", "Room Service", "Airport Shuttle", "Parking", "Concierge",
  "Business Center", "Laundry", "Kids Club", "Private Beach", "Valet Parking",
]

const ROOM_AMENITIES = [
  "King Size Bed", "Ocean View", "Balcony", "Mini Bar",
  "Jacuzzi", "Living Room", "Butler Service", "Private Pool",
  "City View", "Twin Beds", "Free WiFi", "Smart TV",
]

const HOTEL_TYPES = ["Luxury", "Resort", "Boutique", "Business", "Budget", "Apartment", "Villa"]

export default function EditHotelPage() {
  const router  = useRouter()
  const params  = useParams()
  const hotelId = params?.id

  const [form, setForm] = useState({
    title: "", location: "", price: "", type: "Luxury",
    guests: "2", rating: "", description: "",
    status: "draft", featured: false, amenities: [],
  })
  const [imageFile,    setImageFile]    = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [saving,       setSaving]       = useState(false)
  const [loading,      setLoading]      = useState(true)
  const [rooms,        setRooms]        = useState([])

  // Add room state
  const [showAddRoom,  setShowAddRoom]  = useState(false)
  const [savingRoom,   setSavingRoom]   = useState(false)
  const [roomForm,     setRoomForm]     = useState({
    name: "", size: "", beds: "1", price: "", description: "", amenities: []
  })

  // Edit room state
  const [editingRoom,     setEditingRoom]     = useState(null) // room object being edited
  const [editRoomForm,    setEditRoomForm]    = useState({})
  const [savingEditRoom,  setSavingEditRoom]  = useState(false)

  const token = () => localStorage.getItem("token")

  useEffect(() => {
    if (!hotelId) return
    fetch(`${API}/hotels/${hotelId}`, {
      headers: { Authorization: `Bearer ${token()}` }
    })
      .then(r => r.json())
      .then(data => {
        setForm({
          title:       data.title       ?? "",
          location:    data.location    ?? "",
          price:       data.price       ?? "",
          type:        data.type        ?? "Luxury",
          guests:      data.guests      ?? "2",
          rating:      data.rating      ?? "",
          description: data.description ?? "",
          status:      data.status      ?? "draft",
          featured:    !!data.featured,
          amenities:   Array.isArray(data.amenities) ? data.amenities : [],
        })
        if (data.image) setImagePreview(`https://api.alainhotel.com/backend/storage/${data.image}`)
        setRooms(data.rooms ?? [])
        setLoading(false)
      })
      .catch(() => { toast.error("Failed to load hotel"); setLoading(false) })
  }, [hotelId])

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
    fd.append("_method", "PUT")
    if (imageFile) fd.append("image", imageFile)

    try {
      const res = await fetch(`${API}/hotels/${hotelId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
        body: fd,
      })
      if (!res.ok) throw new Error()
      toast.success("Hotel updated!")
      router.push("/admin/hotels")
    } catch {
      toast.error("Failed to update hotel")
    } finally {
      setSaving(false)
    }
  }

  // ── ADD ROOM ──────────────────────────────────────────────────────────────
  const toggleRoomAmenity = (a) => setRoomForm(prev => ({
    ...prev,
    amenities: prev.amenities.includes(a)
      ? prev.amenities.filter(x => x !== a)
      : [...prev.amenities, a],
  }))

  const saveRoom = async () => {
    if (!roomForm.name.trim()) { toast.error("Room name required"); return }
    if (!roomForm.price)       { toast.error("Price required"); return }
    setSavingRoom(true)
    try {
      const res = await fetch(`${API}/hotels/${hotelId}/rooms`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify(roomForm),
      })
      if (!res.ok) throw new Error()
      const room = await res.json()
      setRooms(prev => [...prev, room])
      setRoomForm({ name: "", size: "", beds: "1", price: "", description: "", amenities: [] })
      setShowAddRoom(false)
      toast.success("Room added!")
    } catch {
      toast.error("Failed to add room")
    } finally {
      setSavingRoom(false)
    }
  }

  // ── EDIT ROOM ─────────────────────────────────────────────────────────────
  const openEditRoom = (room) => {
    setEditingRoom(room.id)
    setEditRoomForm({
      name:        room.name        ?? "",
      size:        room.size        ?? "",
      beds:        room.beds        ?? "1",
      price:       room.price       ?? "",
      description: room.description ?? "",
      amenities:   Array.isArray(room.amenities) ? room.amenities : [],
    })
    setShowAddRoom(false) // close add form if open
  }

  const toggleEditRoomAmenity = (a) => setEditRoomForm(prev => ({
    ...prev,
    amenities: prev.amenities.includes(a)
      ? prev.amenities.filter(x => x !== a)
      : [...prev.amenities, a],
  }))

  const saveEditRoom = async (roomId) => {
    setSavingEditRoom(true)
    try {
      const res = await fetch(`${API}/rooms/${roomId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify(editRoomForm),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setRooms(prev => prev.map(r => r.id === roomId ? updated : r))
      setEditingRoom(null)
      toast.success("Room updated!")
    } catch {
      toast.error("Failed to update room")
    } finally {
      setSavingEditRoom(false)
    }
  }

  const deleteRoom = async (roomId) => {
    if (!confirm("Delete this room?")) return
    await fetch(`${API}/rooms/${roomId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token()}` },
    })
    setRooms(prev => prev.filter(r => r.id !== roomId))
    toast.success("Room deleted")
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Hotel</h1>
          <p className="text-gray-500 text-sm mt-1">{form.title}</p>
        </div>
        <Link href="/admin/hotels">
          <button className="text-sm text-gray-500 hover:text-white transition">← Back to Hotels</button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        <Section title="Basic Information">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Title *">
              <input name="title" value={form.title} onChange={handleChange} required className="input" />
            </Field>
            <Field label="Location *">
              <input name="location" value={form.location} onChange={handleChange} required className="input" />
            </Field>
            <Field label="Price / night (AED) *">
              <input name="price" type="number" value={form.price} onChange={handleChange} required className="input" />
            </Field>
            <Field label="Max Guests *">
              <input name="guests" type="number" value={form.guests} onChange={handleChange} required className="input" />
            </Field>
            <Field label="Hotel Type">
              <select name="type" value={form.type} onChange={handleChange} className="input">
                {HOTEL_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Star Rating">
              <input name="rating" type="number" step="0.1" min="1" max="5" value={form.rating} onChange={handleChange} className="input" placeholder="4.5" />
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
            <div className="border-2 border-dashed border-gray-700 hover:border-rose-500 rounded-xl p-6 text-center transition">
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
                <div className="text-gray-500">
                  <Upload size={22} className="mx-auto mb-2" />
                  <p className="text-sm">Click to upload image</p>
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

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50">
            {saving ? "Saving…" : "Update Hotel"}
          </button>
          <button type="button" onClick={() => router.push("/admin/hotels")}
            className="px-6 py-3 border border-gray-700 text-gray-400 rounded-xl hover:bg-gray-800 transition">
            Cancel
          </button>
        </div>
      </form>

      {/* ── ROOMS ─────────────────────────────────────────────────────────── */}
      <div className="space-y-4 pb-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Rooms ({rooms.length})</h2>
          <button
            onClick={() => { setShowAddRoom(p => !p); setEditingRoom(null) }}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm transition"
          >
            <Plus size={15} /> Add Room
          </button>
        </div>

        {/* Room list */}
        <div className="space-y-3">
          {rooms.map(room => (
            <div key={room.id}>
              {/* View mode */}
              {editingRoom !== room.id ? (
                <div className="bg-[#0f1117] border border-white/5 rounded-xl p-4 flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-white">{room.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {room.size && `${room.size} · `}{room.beds} bed(s) · AED {room.price}/night
                    </p>
                    {room.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-1">{room.description}</p>
                    )}
                    {Array.isArray(room.amenities) && room.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {room.amenities.slice(0, 4).map((a, i) => (
                          <span key={i} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{a}</span>
                        ))}
                        {room.amenities.length > 4 && (
                          <span className="text-xs text-gray-600">+{room.amenities.length - 4}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-4 shrink-0">
                    <button
                      onClick={() => openEditRoom(room)}
                      className="p-2 text-gray-500 hover:text-white hover:bg-gray-700 rounded-lg transition"
                      title="Edit room"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => deleteRoom(room.id)}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-gray-700 rounded-lg transition"
                      title="Delete room"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                /* Edit mode */
                <div className="bg-[#0f1117] border border-rose-500/30 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white text-sm">Edit Room</h3>
                    <button onClick={() => setEditingRoom(null)} className="text-gray-500 hover:text-white transition">
                      <X size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Name *">
                      <input value={editRoomForm.name}
                        onChange={e => setEditRoomForm(p => ({ ...p, name: e.target.value }))}
                        className="input" placeholder="Room name" />
                    </Field>
                    <Field label="Size">
                      <input value={editRoomForm.size}
                        onChange={e => setEditRoomForm(p => ({ ...p, size: e.target.value }))}
                        className="input" placeholder="50m²" />
                    </Field>
                    <Field label="Beds">
                      <input type="number" min="1" value={editRoomForm.beds}
                        onChange={e => setEditRoomForm(p => ({ ...p, beds: e.target.value }))}
                        className="input" />
                    </Field>
                    <Field label="Price (AED/night) *">
                      <input type="number" value={editRoomForm.price}
                        onChange={e => setEditRoomForm(p => ({ ...p, price: e.target.value }))}
                        className="input" placeholder="2500" />
                    </Field>
                  </div>

                  <Field label="Description">
                    <textarea value={editRoomForm.description}
                      onChange={e => setEditRoomForm(p => ({ ...p, description: e.target.value }))}
                      className="input resize-none" rows={2} placeholder="Room description…" />
                  </Field>

                  <div>
                    <p className="text-xs text-gray-500 mb-2">Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {ROOM_AMENITIES.map(a => (
                        <button key={a} type="button" onClick={() => toggleEditRoomAmenity(a)}
                          className={`px-2.5 py-1 rounded-full text-xs border transition
                            ${editRoomForm.amenities?.includes(a)
                              ? "bg-rose-500 text-white border-rose-500"
                              : "border-gray-700 text-gray-400 hover:border-gray-500"}`}>
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => saveEditRoom(room.id)}
                      disabled={savingEditRoom}
                      className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50"
                    >
                      <Check size={14} />
                      {savingEditRoom ? "Saving…" : "Save Changes"}
                    </button>
                    <button onClick={() => setEditingRoom(null)} className="text-gray-500 hover:text-gray-300 text-sm transition">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {rooms.length === 0 && !showAddRoom && (
            <p className="text-gray-600 text-sm py-4">No rooms added yet</p>
          )}
        </div>

        {/* Add room form */}
        {showAddRoom && (
          <div className="bg-[#0f1117] border border-rose-500/20 rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-white">New Room</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Name *">
                <input value={roomForm.name}
                  onChange={e => setRoomForm(p => ({ ...p, name: e.target.value }))}
                  className="input" placeholder="Deluxe Suite" />
              </Field>
              <Field label="Size">
                <input value={roomForm.size}
                  onChange={e => setRoomForm(p => ({ ...p, size: e.target.value }))}
                  className="input" placeholder="50m²" />
              </Field>
              <Field label="Beds">
                <input type="number" min="1" value={roomForm.beds}
                  onChange={e => setRoomForm(p => ({ ...p, beds: e.target.value }))}
                  className="input" />
              </Field>
              <Field label="Price (AED/night) *">
                <input type="number" value={roomForm.price}
                  onChange={e => setRoomForm(p => ({ ...p, price: e.target.value }))}
                  className="input" placeholder="2500" />
              </Field>
            </div>
            <Field label="Description">
              <textarea value={roomForm.description}
                onChange={e => setRoomForm(p => ({ ...p, description: e.target.value }))}
                className="input resize-none" rows={2} placeholder="Room description…" />
            </Field>
            <div>
              <p className="text-xs text-gray-500 mb-2">Room Amenities</p>
              <div className="flex flex-wrap gap-2">
                {ROOM_AMENITIES.map(a => (
                  <button key={a} type="button" onClick={() => toggleRoomAmenity(a)}
                    className={`px-2.5 py-1 rounded-full text-xs border transition
                      ${roomForm.amenities.includes(a)
                        ? "bg-rose-500 text-white border-rose-500"
                        : "border-gray-700 text-gray-400 hover:border-gray-500"}`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={saveRoom} disabled={savingRoom}
                className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50">
                {savingRoom ? "Saving…" : "Save Room"}
              </button>
              <button onClick={() => setShowAddRoom(false)} className="text-gray-500 hover:text-gray-300 text-sm transition">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

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