'use client'
// src/app/dashboard/bookings/page.jsx

import { useEffect, useState } from "react"
import Link from "next/link"
import { CalendarCheck, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"

const API = "https://5stardubai.com/backend/api"
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` })

const statusConfig = {
  confirmed:              { label: "Confirmed",        color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle },
  pending:                { label: "Pending",          color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20",     icon: Clock       },
  cancelled:              { label: "Cancelled",        color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20",         icon: XCircle     },
  cancellation_requested: { label: "Cancel Req.",      color: "text-orange-400",  bg: "bg-orange-500/10 border-orange-500/20",   icon: AlertCircle },
}

const filters = ["all", "confirmed", "pending", "cancelled", "cancellation_requested"]

export default function BookingsPage() {
  const [bookings, setBookings] = useState([])
  const [filter,   setFilter]   = useState("all")
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    fetch(`${API}/user/bookings`, { headers: authHeaders() })
      .then(r => r.json())
      .then(data => { setBookings(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-5 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white">My Bookings</h1>
        <p className="text-gray-500 text-sm mt-1">All your past and upcoming reservations</p>
      </div>

      {/* Filter tabs — horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filters.map(f => {
          const label = f === "all" ? "All" : (statusConfig[f]?.label ?? f)
          const count = f === "all" ? bookings.length : bookings.filter(b => b.status === f).length
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border whitespace-nowrap shrink-0 ${
                filter === f
                  ? "bg-rose-500 text-white border-rose-500"
                  : "bg-white/[0.03] text-gray-400 border-white/10 hover:border-white/20 hover:text-white"
              }`}
            >
              {label}{count > 0 && <span className="ml-1 opacity-70">({count})</span>}
            </button>
          )
        })}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-10 text-center">
          <CalendarCheck size={36} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">No bookings found</p>
          <Link href="/" className="mt-3 inline-block text-sm text-rose-400 hover:underline">Browse hotels →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(b => {
            const cfg = statusConfig[b.status] ?? statusConfig.pending
            const StatusIcon = cfg.icon
            const isPast = new Date(b.check_out) < new Date()

            return (
              <Link key={b.id} href={`/dashboard/bookings/${b.id}`}>
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4
                  hover:bg-white/[0.05] hover:border-white/10 transition cursor-pointer">

                  <div className="flex items-start gap-3 md:gap-4">
                    {/* Image */}
                    <div className="w-14 h-14 rounded-xl bg-white/5 overflow-hidden shrink-0">
                      {b.hotel_image
                        ? <img src={b.hotel_image} className="w-full h-full object-cover" alt="" />
                        : <div className="w-full h-full flex items-center justify-center text-xl">🏨</div>
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="min-w-0">
                          <p className="text-white font-semibold text-sm truncate">{b.hotel_name}</p>
                          <p className="text-gray-500 text-xs mt-0.5 truncate">{b.room_name}</p>
                        </div>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold shrink-0 ${cfg.bg} ${cfg.color}`}>
                          <StatusIcon size={11} />
                          <span className="hidden sm:inline">{cfg.label}</span>
                        </div>
                      </div>

                      {/* Meta info — wraps on mobile */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-500">
                        <span>📅 {b.check_in} → {b.check_out}</span>
                        <span>🌙 {b.nights} night{b.nights !== 1 ? "s" : ""}</span>
                        <span className="hidden sm:inline">
                          👥 {b.adults} adult{b.adults !== 1 ? "s" : ""}
                          {b.children > 0 ? `, ${b.children} child${b.children !== 1 ? "ren" : ""}` : ""}
                        </span>
                        {isPast && <span className="text-gray-600">Past stay</span>}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0">
                      <p className="text-white font-bold text-sm">AED {Number(b.total_price).toLocaleString()}</p>
                      <p className="text-gray-600 text-[10px] mt-0.5 hidden sm:block">Ref: {b.reference?.slice(-8)}</p>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
