'use client'
// src/app/admin/bookings/page.js

import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { Search, Eye, X, ChevronDown } from "lucide-react"

const API = "https://5stardubai.com/backend/api/admin"

const STATUS_COLORS = {
  pending:   "bg-amber-500/10 text-amber-400 border-amber-500/30",
  confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  paid:      "bg-sky-500/10 text-sky-400 border-sky-500/30",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/30",
  refunded:  "bg-violet-500/10 text-violet-400 border-violet-500/30",
}

const STATUSES = ["", "pending", "confirmed", "paid", "cancelled", "refunded"]

export default function AdminBookings() {
  const [bookings,  setBookings]  = useState([])
  const [meta,      setMeta]      = useState({})
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState("")
  const [status,    setStatus]    = useState("")
  const [page,      setPage]      = useState(1)
  const [selected,  setSelected]  = useState(null) // booking detail modal
  const [updating,  setUpdating]  = useState(false)
  const [newStatus, setNewStatus] = useState("")

  const token = () => localStorage.getItem("token")

  const fetchBookings = () => {
    setLoading(true)
    const params = new URLSearchParams({ page })
    if (search) params.append("search", search)
    if (status) params.append("status", status)

    fetch(`${API}/bookings?${params}`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(data => {
        setBookings(data.data ?? data)
        setMeta(data.meta ?? {})
        setLoading(false)
      })
  }

  useEffect(() => { fetchBookings() }, [search, status, page])

  const openDetail = (booking) => {
    setSelected(booking)
    setNewStatus(booking.status)
  }

  const updateStatus = async () => {
    if (!newStatus || newStatus === selected.status) return
    setUpdating(true)
    try {
      const res = await fetch(`${API}/bookings/${selected.id}/status`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      const updated = await res.json()
      setSelected(updated)
      setBookings(prev => prev.map(b => b.id === updated.id ? updated : b))
      toast.success("Status updated")
    } catch {
      toast.error("Failed to update")
    } finally {
      setUpdating(false)
    }
  }

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Bookings</h1>
        <p className="text-gray-500 text-sm mt-1">Track and manage all guest reservations</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search reference or guest name…"
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1) }}
              className={`px-4 py-2 rounded-xl text-sm border transition capitalize
                ${status === s
                  ? "bg-rose-500 text-white border-rose-500"
                  : "border-gray-700 text-gray-400 hover:border-gray-500"}`}>
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
              <th className="text-left px-6 py-4">Reference</th>
              <th className="text-left px-6 py-4">Guest</th>
              <th className="text-left px-6 py-4">Hotel</th>
              <th className="text-left px-6 py-4">Check-in</th>
              <th className="text-left px-6 py-4">Nights</th>
              <th className="text-left px-6 py-4">Amount</th>
              <th className="text-left px-6 py-4">Status</th>
              <th className="text-right px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-16">
                  <div className="w-6 h-6 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-16 text-gray-600">No bookings found</td>
              </tr>
            ) : bookings.map(b => (
              <tr key={b.id} className="hover:bg-gray-800/50 transition">
                <td className="px-6 py-4 font-mono text-xs text-gray-300">{b.reference ?? `#${b.id}`}</td>
                <td className="px-6 py-4">
                  <p className="text-white font-medium">{b.user?.name ?? b.guest_name ?? "—"}</p>
                  <p className="text-xs text-gray-500">{b.user?.email ?? b.guest_email ?? ""}</p>
                </td>
                <td className="px-6 py-4 text-gray-300">{b.hotel?.title ?? "—"}</td>
                <td className="px-6 py-4 text-gray-400">{fmt(b.check_in)}</td>
                <td className="px-6 py-4 text-gray-400">{b.nights ?? "—"}</td>
                <td className="px-6 py-4 text-gray-300 font-medium">AED {Number(b.total_price ?? 0).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${STATUS_COLORS[b.status] ?? "bg-gray-700 text-gray-400"}`}>
                    {b.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => openDetail(b)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition">
                    <Eye size={15} />
                  </button>
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

      {/* ── BOOKING DETAIL MODAL ── */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-0.5">Booking</p>
                <h2 className="text-lg font-bold text-white">#{selected.reference ?? selected.id}</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${STATUS_COLORS[selected.status]}`}>
                  {selected.status}
                </span>
                <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white transition">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5">

              {/* Guest info */}
              <DetailSection title="Guest Information">
                <DetailRow label="Name"  value={selected.user?.name ?? selected.guest_name ?? "—"} />
                <DetailRow label="Email" value={selected.user?.email ?? selected.guest_email ?? "—"} />
                <DetailRow label="Phone" value={selected.user?.phone ?? selected.guest_phone ?? "—"} />
              </DetailSection>

              {/* Stay details */}
              <DetailSection title="Stay Details">
                <DetailRow label="Hotel"     value={selected.hotel?.title ?? "—"} />
                <DetailRow label="Room"      value={selected.room?.name ?? "—"} />
                <DetailRow label="Check-in"  value={fmt(selected.check_in)} />
                <DetailRow label="Check-out" value={fmt(selected.check_out)} />
                <DetailRow label="Nights"    value={selected.nights ?? "—"} />
                <DetailRow label="Guests"    value={`${selected.adults ?? 1} adult(s), ${selected.children ?? 0} child(ren)`} />
              </DetailSection>

              {/* Price breakdown */}
              <DetailSection title="Price Breakdown">
                <DetailRow label="Room price / night"  value={`AED ${Number(selected.room_price ?? selected.room?.price ?? 0).toLocaleString()}`} />
                <DetailRow label={`Subtotal (${selected.nights ?? 1} night)`} value={`AED ${Number(selected.subtotal ?? 0).toLocaleString()}`} />
                {selected.tax && <DetailRow label="Tax (5%)" value={`AED ${Number(selected.tax).toLocaleString()}`} />}
                {selected.tourism_fee && <DetailRow label="Tourism Fee" value={`AED ${Number(selected.tourism_fee).toLocaleString()}`} />}
                <div className="flex justify-between pt-2 border-t border-gray-800 font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-white">AED {Number(selected.total_price ?? 0).toLocaleString()}</span>
                </div>
              </DetailSection>

              {/* Update status */}
              <DetailSection title="Update Status">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <select
                      value={newStatus}
                      onChange={e => setNewStatus(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-500 appearance-none"
                    >
                      {["pending","confirmed","paid","cancelled","refunded"].map(s => (
                        <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                  <button
                    onClick={updateStatus}
                    disabled={updating || newStatus === selected.status}
                    className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-40"
                  >
                    {updating ? "Saving…" : "Update"}
                  </button>
                </div>
              </DetailSection>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailSection({ title, children }) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-4 space-y-2.5">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">{title}</p>
      {children}
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-200 font-medium text-right max-w-[60%] truncate">{value}</span>
    </div>
  )
}