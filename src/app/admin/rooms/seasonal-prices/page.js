'use client'
// src/app/admin/rooms/seasonal-prices/page.js

import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { Plus, Trash2, Tag } from "lucide-react"

const API = "https://api.alainhotel.com/backend/api/admin"

export default function SeasonalPrices() {
  const [hotels,        setHotels]        = useState([])
  const [selectedHotel, setSelectedHotel] = useState("")
  const [rooms,         setRooms]         = useState([])
  const [selectedRoom,  setSelectedRoom]  = useState("")
  const [prices,        setPrices]        = useState([])
  const [loading,       setLoading]       = useState(false)
  const [saving,        setSaving]        = useState(false)
  const [showForm,      setShowForm]      = useState(false)
  const [form,          setForm]          = useState({
    price: "", start_date: "", end_date: ""
  })

  const token = () => localStorage.getItem("token")

  // Load hotels
  useEffect(() => {
    fetch(`${API}/hotels`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(data => setHotels(Array.isArray(data) ? data : data.data ?? []))
      .catch(() => toast.error("Failed to load hotels"))
  }, [])

  // Load rooms when hotel changes
  useEffect(() => {
    if (!selectedHotel) { setRooms([]); setSelectedRoom(""); setPrices([]); return }
    fetch(`${API}/hotels/${selectedHotel}/rooms`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(data => { setRooms(Array.isArray(data) ? data : []); setSelectedRoom(""); setPrices([]) })
      .catch(() => toast.error("Failed to load rooms"))
  }, [selectedHotel])

  // Load seasonal prices when room changes
  useEffect(() => {
    if (!selectedRoom) { setPrices([]); return }
    setLoading(true)
    fetch(`${API}/rooms/${selectedRoom}/seasonal-prices`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(data => { setPrices(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => { toast.error("Failed to load prices"); setLoading(false) })
  }, [selectedRoom])

  const selectedRoomData = rooms.find(r => r.id == selectedRoom)

  const handleSave = async () => {
    if (!form.price || !form.start_date || !form.end_date) {
      toast.error("All fields are required"); return
    }
    if (new Date(form.end_date) <= new Date(form.start_date)) {
      toast.error("End date must be after start date"); return
    }
    setSaving(true)
    try {
      const res = await fetch(`${API}/rooms/${selectedRoom}/seasonal-prices`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setPrices(prev => [...prev, data])
      setForm({ price: "", start_date: "", end_date: "" })
      setShowForm(false)
      toast.success("Seasonal price added!")
    } catch {
      toast.error("Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Delete this seasonal price?")) return
    await fetch(`${API}/seasonal-prices/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token()}` },
    })
    setPrices(prev => prev.filter(p => p.id !== id))
    toast.success("Deleted")
  }

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric"
  }) : "—"

  const discount = (original, seasonal) => {
    if (!original || !seasonal) return null
    const pct = Math.round((1 - seasonal / original) * 100)
    return pct > 0 ? pct : null
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Seasonal Prices</h1>
        <p className="text-gray-500 text-sm mt-1">Set special pricing for rooms during specific date ranges</p>
      </div>

      {/* Hotel + Room selectors */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-400">Select Hotel</label>
          <select
            value={selectedHotel}
            onChange={e => setSelectedHotel(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-500"
          >
            <option value="">— Choose hotel —</option>
            {hotels.map(h => <option key={h.id} value={h.id}>{h.title}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-400">Select Room</label>
          <select
            value={selectedRoom}
            onChange={e => setSelectedRoom(e.target.value)}
            disabled={!selectedHotel || rooms.length === 0}
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-500 disabled:opacity-40"
          >
            <option value="">— Choose room —</option>
            {rooms.map(r => <option key={r.id} value={r.id}>{r.name} — AED {r.price}/night</option>)}
          </select>
        </div>
      </div>

      {/* Content */}
      {selectedRoom && (
        <>
          {/* Room info bar */}
          {selectedRoomData && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{selectedRoomData.name}</p>
                <p className="text-gray-500 text-xs mt-0.5">Base price: AED {selectedRoomData.price}/night</p>
              </div>
              <button
                onClick={() => setShowForm(p => !p)}
                className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
              >
                <Plus size={14} /> Add Seasonal Price
              </button>
            </div>
          )}

          {/* Add form */}
          {showForm && (
            <div className="bg-gray-900 border border-rose-500/30 rounded-2xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white">New Seasonal Price</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-medium">Price (AED) *</label>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                    placeholder="e.g. 3500"
                    className="input"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-medium">Start Date *</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))}
                    className="input"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-medium">End Date *</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))}
                    className="input"
                  />
                </div>
              </div>

              {/* Preview discount */}
              {form.price && selectedRoomData && discount(selectedRoomData.price, form.price) !== null && (
                <p className="text-xs text-emerald-400">
                  ✓ {discount(selectedRoomData.price, form.price)}% discount from base price
                </p>
              )}
              {form.price && selectedRoomData && form.price > selectedRoomData.price && (
                <p className="text-xs text-amber-400">
                  ⚠ Price is higher than base price (peak season surcharge)
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={() => { setShowForm(false); setForm({ price: "", start_date: "", end_date: "" }) }}
                  className="text-gray-500 hover:text-gray-300 text-sm transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Prices list */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                Seasonal Prices ({prices.length})
              </h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : prices.length === 0 ? (
              <div className="text-center py-12 text-gray-600 text-sm">
                No seasonal prices yet. Add one above.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="text-left px-5 py-3">Period</th>
                    <th className="text-left px-5 py-3">Seasonal Price</th>
                    <th className="text-left px-5 py-3">vs Base</th>
                    <th className="text-right px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {prices.map(p => {
                    const disc = discount(selectedRoomData?.price, p.price)
                    const isSurcharge = selectedRoomData && p.price > selectedRoomData.price
                    return (
                      <tr key={p.id} className="hover:bg-gray-800/40 transition">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Tag size={13} className="text-rose-400 shrink-0" />
                            <div>
                              <p className="text-white font-medium">{fmt(p.start_date)}</p>
                              <p className="text-gray-500 text-xs">to {fmt(p.end_date)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-white font-semibold">
                          AED {p.price}
                          <span className="text-gray-500 font-normal text-xs">/night</span>
                        </td>
                        <td className="px-5 py-4">
                          {disc !== null && (
                            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-full">
                              -{disc}% off
                            </span>
                          )}
                          {isSurcharge && (
                            <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded-full">
                              +surcharge
                            </span>
                          )}
                          {!disc && !isSurcharge && (
                            <span className="text-gray-600 text-xs">same</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="p-2 text-gray-500 hover:text-red-400 hover:bg-gray-700 rounded-lg transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

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
        input[type="date"].input::-webkit-calendar-picker-indicator { filter: invert(0.5); }
      `}</style>
    </div>
  )
}