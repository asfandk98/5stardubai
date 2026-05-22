'use client'
// src/app/admin/hotels/page.js

import { useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "react-hot-toast"
import { Plus, Pencil, Trash2, Star } from "lucide-react"

const API = "https://5stardubai.com/backend/api/admin"

const STATUS_COLORS = {
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  draft:  "bg-gray-700 text-gray-400 border-gray-600",
}

export default function HotelsPage() {
  const [hotels,  setHotels]  = useState([])
  const [loading, setLoading] = useState(true)

  const token = () => localStorage.getItem("token")

  const fetchHotels = () => {
    setLoading(true)
    fetch(`${API}/hotels`, {
      headers: { Authorization: `Bearer ${token()}` },
    })
      .then(r => r.json())
      .then(data => {
        // handles both plain array and paginated { data: [] }
        setHotels(Array.isArray(data) ? data : data.data ?? [])
        setLoading(false)
      })
      .catch(() => {
        toast.error("Failed to load hotels")
        setLoading(false)
      })
  }

  useEffect(() => { fetchHotels() }, [])

  const remove = async (id) => {
    if (!confirm("Delete this hotel?")) return
    await fetch(`${API}/hotels/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token()}` },
    })
    setHotels(prev => prev.filter(h => h.id !== id))
    toast.success("Hotel deleted")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Hotels</h1>
          <p className="text-gray-500 text-sm mt-1">{hotels.length} hotels</p>
        </div>
        <Link href="/admin/hotels/create">
          <button className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition">
            <Plus size={16} /> New Hotel
          </button>
        </Link>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
              <th className="text-left px-6 py-4">Hotel</th>
              <th className="text-left px-6 py-4">Location</th>
              <th className="text-left px-6 py-4">Type</th>
              <th className="text-left px-6 py-4">Price</th>
              <th className="text-left px-6 py-4">Status</th>
              <th className="text-left px-6 py-4">Featured</th>
              <th className="text-right px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-16">
                  <div className="w-6 h-6 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </td>
              </tr>
            ) : hotels.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-gray-600">No hotels yet</td>
              </tr>
            ) : hotels.map(hotel => (
              <tr key={hotel.id} className="hover:bg-gray-800/50 transition">
                {/* Hotel name + image */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {hotel.image ? (
                      <img
                        src={`https://5stardubai.com/backend/storage/${hotel.image}`}
                        className="w-10 h-10 rounded-lg object-cover"
                        onError={e => { e.target.style.display = 'none' }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-xl">🏨</div>
                    )}
                    <div>
                      <p className="font-medium text-white line-clamp-1">{hotel.title}</p>
                      {hotel.rating && (
                        <p className="text-xs text-gray-500">⭐ {hotel.rating}</p>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 text-gray-400">{hotel.location}</td>
                <td className="px-6 py-4 text-gray-400">{hotel.type}</td>
                <td className="px-6 py-4 text-gray-300">AED {hotel.price}</td>

                {/* Status badge */}
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border capitalize
                    ${STATUS_COLORS[hotel.status] ?? STATUS_COLORS.draft}`}>
                    {hotel.status}
                  </span>
                </td>

                {/* Featured */}
                <td className="px-6 py-4">
                  {hotel.featured
                    ? <span className="flex items-center gap-1 text-rose-400 text-xs"><Star size={12} className="fill-rose-400" /> Featured</span>
                    : <span className="text-gray-600 text-xs">—</span>
                  }
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/hotels/${hotel.id}/edit`}>
                      <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition">
                        <Pencil size={14} />
                      </button>
                    </Link>
                    <button onClick={() => remove(hotel.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}