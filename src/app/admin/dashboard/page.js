'use client'
// src/app/admin/dashboard/page.js

import { useEffect, useState } from "react"
import { Hotel, BedDouble, TrendingUp, DollarSign, Clock, CheckCircle } from "lucide-react"

const API = "https://5stardubai.com/backend/api/admin"

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    fetch(`${API}/stats`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const cards = stats ? [
    { label: "Total Hotels",   value: stats.hotels,        icon: Hotel,       color: "from-rose-500/20 to-rose-600/10",     accent: "text-rose-400",    border: "border-rose-500/20"    },
    { label: "Active Hotels",  value: stats.active_hotels, icon: CheckCircle, color: "from-emerald-500/20 to-emerald-600/10", accent: "text-emerald-400", border: "border-emerald-500/20" },
    { label: "Total Rooms",    value: stats.rooms,         icon: BedDouble,   color: "from-sky-500/20 to-sky-600/10",       accent: "text-sky-400",     border: "border-sky-500/20"     },
    { label: "Total Bookings", value: stats.bookings,      icon: TrendingUp,  color: "from-violet-500/20 to-violet-600/10", accent: "text-violet-400",  border: "border-violet-500/20"  },
    { label: "Pending",        value: stats.pending,       icon: Clock,       color: "from-amber-500/20 to-amber-600/10",   accent: "text-amber-400",   border: "border-amber-500/20"   },
    { label: "Revenue (AED)",  value: Number(stats.revenue).toLocaleString(), icon: DollarSign, color: "from-teal-500/20 to-teal-600/10", accent: "text-teal-400", border: "border-teal-500/20" },
  ] : []

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your hotel platform</p>
      </div>

      {/* Responsive grid: 1 col mobile → 2 col sm → 3 col lg */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon
          return (
            <div key={i} className={`bg-gradient-to-br ${card.color} border ${card.border} rounded-2xl p-4 md:p-5`}>
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 leading-tight">
                  {card.label}
                </p>
                <Icon size={16} className={card.accent} />
              </div>
              <p className={`text-2xl md:text-3xl font-bold ${card.accent}`}>{card.value}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
