'use client'
// src/app/dashboard/page.jsx — Overview

import { useEffect, useState } from "react"
import Link from "next/link"
import { CalendarCheck, Heart, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"

const API = "https://api.alainhotel.com/api"
function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem("token")}` }
}

const statusConfig = {
  confirmed:              { label: "Confirmed",   color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle },
  pending:                { label: "Pending",     color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20",     icon: Clock       },
  cancelled:              { label: "Cancelled",   color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20",         icon: XCircle     },
  cancellation_requested: { label: "Cancel Req.", color: "text-orange-400",  bg: "bg-orange-500/10 border-orange-500/20",   icon: AlertCircle },
}

export default function UserDashboard() {
  const [user,     setUser]     = useState(null)
  const [bookings, setBookings] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    try { setUser(JSON.parse(localStorage.getItem("user"))) } catch {}
    Promise.all([
      fetch(`${API}/user/bookings`, { headers: authHeaders() }).then(r => r.json()),
      fetch(`${API}/user/wishlist`, { headers: authHeaders() }).then(r => r.json()),
    ]).then(([b, w]) => {
      setBookings(Array.isArray(b) ? b : [])
      setWishlist(Array.isArray(w) ? w : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const upcoming  = bookings.filter(b => new Date(b.check_in) >= new Date() && b.status === "confirmed")
  const confirmed = bookings.filter(b => b.status === "confirmed").length
  const pending   = bookings.filter(b => b.status === "pending").length

  const stats = [
    { label: "Total Bookings", value: bookings.length, color: "from-rose-500/20 to-rose-600/10",        border: "border-rose-500/20",    accent: "text-rose-400",    icon: CalendarCheck },
    { label: "Confirmed",      value: confirmed,       color: "from-emerald-500/20 to-emerald-600/10",  border: "border-emerald-500/20", accent: "text-emerald-400", icon: CheckCircle   },
    { label: "Pending",        value: pending,         color: "from-amber-500/20 to-amber-600/10",      border: "border-amber-500/20",  accent: "text-amber-400",   icon: Clock         },
    { label: "Saved Hotels",   value: wishlist.length, color: "from-pink-500/20 to-pink-600/10",        border: "border-pink-500/20",   accent: "text-pink-400",    icon: Heart         },
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6 md:space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white">
          Welcome back, {user?.name?.split(" ")[0] ?? "there"} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here's a summary of your activity</p>
      </div>

      {/* Stats — 2 cols mobile, 4 cols desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className={`bg-gradient-to-br ${s.color} border ${s.border} rounded-2xl p-4 md:p-5`}>
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <p className="text-[10px] md:text-xs font-semibold uppercase tracking-widest text-gray-500 leading-tight">
                  {s.label}
                </p>
                <Icon size={14} className={s.accent} />
              </div>
              <p className={`text-2xl md:text-3xl font-bold ${s.accent}`}>{s.value}</p>
            </div>
          )
        })}
      </div>

      {/* Upcoming stays */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-sm md:text-base">Upcoming Stays</h2>
          <Link href="/dashboard/bookings" className="text-xs text-rose-400 hover:text-rose-300 transition">
            View all →
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-8 text-center">
            <CalendarCheck size={32} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No upcoming stays</p>
            <Link href="/" className="mt-3 inline-block text-xs text-rose-400 hover:underline">
              Browse hotels →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 3).map(b => {
              const cfg = statusConfig[b.status] ?? statusConfig.pending
              const StatusIcon = cfg.icon
              return (
                <Link key={b.id} href={`/dashboard/bookings/${b.id}`}>
                  <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4
                    flex items-center gap-3 md:gap-4
                    hover:bg-white/[0.05] hover:border-white/10 transition cursor-pointer">

                    {/* Hotel image */}
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white/5 overflow-hidden shrink-0">
                      {b.hotel_image
                        ? <img src={b.hotel_image} className="w-full h-full object-cover" alt="" />
                        : <div className="w-full h-full flex items-center justify-center text-gray-700 text-lg">🏨</div>
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{b.hotel_name}</p>
                      <p className="text-gray-500 text-xs mt-0.5 truncate">
                        {b.check_in} → {b.check_out} · {b.nights} night{b.nights !== 1 ? "s" : ""}
                      </p>
                    </div>

                    {/* Status — hide label on very small screens */}
                    <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold shrink-0 ${cfg.bg} ${cfg.color}`}>
                      <StatusIcon size={11} />
                      {cfg.label}
                    </div>

                    {/* Price */}
                    <p className="text-white font-bold text-sm shrink-0">
                      AED {Number(b.total_price).toLocaleString()}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Wishlist preview */}
      {wishlist.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-sm md:text-base">Saved Hotels</h2>
            <Link href="/dashboard/wishlist" className="text-xs text-rose-400 hover:text-rose-300 transition">
              View all →
            </Link>
          </div>
          {/* 2 cols mobile, 4 cols desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {wishlist.slice(0, 4).map(h => (
              <Link key={h.id} href={`/hotels/${h.slug}`}>
                <div className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition">
                  <div className="h-20 md:h-24 bg-white/5 overflow-hidden">
                    {h.image
                      ? <img src={h.image} className="w-full h-full object-cover" alt={h.name} />
                      : <div className="w-full h-full flex items-center justify-center text-2xl">🏨</div>
                    }
                  </div>
                  <div className="p-2.5 md:p-3">
                    <p className="text-white text-xs font-semibold truncate">{h.name}</p>
                    <p className="text-gray-500 text-[10px] mt-0.5">
                      AED {Number(h.price).toLocaleString()}/night
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
