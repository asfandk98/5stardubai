'use client'
// src/app/dashboard/bookings/[id]/page.jsx

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, Download, Printer, XCircle,
  CheckCircle, Clock, AlertCircle, MapPin, BedDouble
} from "lucide-react"

const API = "https://5stardubai.com/backend/api"
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
})

const statusConfig = {
  confirmed:              { label: "Confirmed",        color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle  },
  pending:                { label: "Pending",          color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20",     icon: Clock        },
  cancelled:              { label: "Cancelled",        color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20",         icon: XCircle      },
  cancellation_requested: { label: "Cancel Requested", color: "text-orange-400",  bg: "bg-orange-500/10 border-orange-500/20",   icon: AlertCircle  },
}

export default function BookingDetailPage() {
  const { id }   = useParams()
  const router   = useRouter()
  const printRef = useRef(null)

  const [booking,    setBooking]    = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [cancelled,  setCancelled]  = useState(false)

  useEffect(() => {
    fetch(`${API}/user/bookings/${id}`, { headers: authHeaders() })
      .then(r => r.json())
      .then(data => { setBooking(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to request cancellation?")) return
    setCancelling(true)
    try {
      const res = await fetch(`${API}/user/bookings/${id}/cancel`, {
        method: "POST",
        headers: authHeaders(),
      })
      const data = await res.json()
      if (res.ok) {
        setBooking(prev => ({ ...prev, status: "cancellation_requested" }))
        setCancelled(true)
      } else {
        alert(data.error ?? "Could not cancel booking.")
      }
    } catch {
      alert("Network error. Please try again.")
    }
    setCancelling(false)
  }

  const handlePrint = () => {
    const w = window.open("", "_blank", "width=700,height=900")
    w.document.write(`<!DOCTYPE html><html><head>
      <title>Receipt — ${booking.reference}</title>
      <style>
        body { font-family: Georgia, serif; padding: 40px; color: #111; }
        @media print { body { margin: 0; } }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 10px 0; border-bottom: 1px solid #eee; font-size: 14px; }
        td:first-child { color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; width: 40%; }
        .total { font-weight: 700; font-size: 18px; border-top: 2px solid #111; border-bottom: none; }
      </style>
      </head><body>
      ${printRef.current.innerHTML}
      <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close()}<\/script>
      </body></html>`)
    w.document.close()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!booking) return (
    <div className="text-center text-gray-500 py-20">
      Booking not found.
      <Link href="/dashboard/bookings" className="block mt-3 text-rose-400 hover:underline text-sm">← Back to bookings</Link>
    </div>
  )

  const cfg = statusConfig[booking.status] ?? statusConfig.pending
  const StatusIcon = cfg.icon
  const canCancel = ["confirmed", "pending"].includes(booking.status) && !cancelled
  const now = new Date().toLocaleString("en-AE", { dateStyle: "long", timeStyle: "short" })

  return (
    <>
      {/* Hidden print template */}
      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <div style={{ textAlign: "center", borderBottom: "2px solid #111", paddingBottom: 20, marginBottom: 28 }}>
            <div style={{ fontSize: 11, letterSpacing: 3, color: "#888", textTransform: "uppercase", marginBottom: 8 }}>Search Dubai Hotels</div>
            <div style={{ fontSize: 26, fontWeight: 700 }}>Booking Receipt</div>
            <div style={{ fontSize: 13, color: "#666", marginTop: 6 }}>{now}</div>
          </div>
          <div style={{ textAlign: "center", background: "#f0faf4", borderRadius: 8, padding: "16px 0", marginBottom: 24 }}>
            <div style={{ color: "#1a7a40", fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: "uppercase" }}>✓ {cfg.label}</div>
          </div>
          <table>
            <tbody>
              {[
                ["Reference",   booking.reference],
                ["Hotel",       booking.hotel_name],
                ["Room",        booking.room_name],
                ["Check-in",    booking.check_in],
                ["Check-out",   booking.check_out],
                ["Nights",      booking.nights],
                ["Adults",      booking.adults],
                ["Children",    booking.children],
                ["Guest Name",  booking.guest_name  || "—"],
                ["Guest Email", booking.guest_email || "—"],
                ["Guest Phone", booking.guest_phone || "—"],
              ].map(([l, v]) => (
                <tr key={l}><td>{l}</td><td style={{ fontWeight: 600 }}>{v ?? "—"}</td></tr>
              ))}
              <tr><td>Room subtotal</td><td>AED {Number(booking.subtotal).toLocaleString()}</td></tr>
              <tr><td>Tax (5%)</td><td>AED {Number(booking.tax).toLocaleString()}</td></tr>
              <tr><td>Tourism fee</td><td>AED {Number(booking.tourism_fee).toLocaleString()}</td></tr>
              <tr className="total"><td>Total Paid</td><td>AED {Number(booking.total_price).toLocaleString()}</td></tr>
            </tbody>
          </table>
          <div style={{ textAlign: "center", fontSize: 11, color: "#aaa", borderTop: "1px solid #eee", paddingTop: 20, marginTop: 24 }}>
            Secured by Mastercard Payment Gateway Services
          </div>
        </div>
      </div>

      {/* Screen UI */}
      <div className="space-y-6 max-w-2xl">

        {/* Back + actions */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link href="/dashboard/bookings" className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm">
            <ArrowLeft size={16} /> Back to bookings
          </Link>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-gray-300 hover:text-white text-xs font-semibold transition"
            >
              <Printer size={14} /> Print
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-gray-300 hover:text-white text-xs font-semibold transition"
            >
              <Download size={14} /> Download
            </button>
          </div>
        </div>

        {/* Status header */}
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Booking Reference</p>
              <p className="text-white font-mono font-bold text-lg">{booking.reference}</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${cfg.bg} ${cfg.color}`}>
              <StatusIcon size={14} />
              {cfg.label}
            </div>
          </div>
        </div>

        {/* Hotel info */}
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
          {booking.hotel_image && (
            <div className="h-40 overflow-hidden">
              <img src={booking.hotel_image} className="w-full h-full object-cover" alt={booking.hotel_name} />
            </div>
          )}
          <div className="p-5">
            <h2 className="text-white font-bold text-lg">{booking.hotel_name}</h2>
            <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
              <BedDouble size={13} /> {booking.room_name}
            </p>
          </div>
        </div>

        {/* Booking details */}
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl">
          <div className="px-5 py-4 border-b border-white/5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Booking Details</p>
          </div>
          <div className="divide-y divide-white/5">
            {[
              ["Check-in",  booking.check_in],
              ["Check-out", booking.check_out],
              ["Duration",  `${booking.nights} night${booking.nights !== 1 ? "s" : ""}`],
              ["Guests",    `${booking.adults} adult${booking.adults !== 1 ? "s" : ""}${booking.children > 0 ? `, ${booking.children} child${booking.children !== 1 ? "ren" : ""}` : ""}`],
              ["Booked on", booking.created_at?.split("T")[0] ?? "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center px-5 py-3.5">
                <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
                <span className="text-sm text-white font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price breakdown */}
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl">
          <div className="px-5 py-4 border-b border-white/5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Price Breakdown</p>
          </div>
          <div className="px-5 py-4 space-y-3">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Room subtotal</span>
              <span>AED {Number(booking.subtotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>Tax (5%)</span>
              <span>AED {Number(booking.tax).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>Tourism fee</span>
              <span>AED {Number(booking.tourism_fee).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-white font-bold text-base pt-3 border-t border-white/10">
              <span>Total Paid</span>
              <span className="text-emerald-400">AED {Number(booking.total_price).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Cancel button */}
        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition text-sm font-semibold disabled:opacity-50"
          >
            {cancelling
              ? <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              : <XCircle size={16} />
            }
            {cancelling ? "Submitting..." : "Request Cancellation"}
          </button>
        )}

        {cancelled && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 text-center text-orange-400 text-sm font-medium">
            ✓ Cancellation request submitted. Our team will be in touch.
          </div>
        )}
      </div>
    </>
  )
}
