'use client'
// src/app/dashboard/wishlist/page.jsx

import { useEffect, useState } from "react"
import Link from "next/link"
import { Heart, Trash2, Star } from "lucide-react"

const API = "https://5stardubai.com/backend/api"
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
})

export default function WishlistPage() {
  const [items,    setItems]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [removing, setRemoving] = useState(null)

  useEffect(() => {
    fetch(`${API}/wishlist`, { headers: authHeaders() })
      .then(r => r.json())
      .then(data => { setItems(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleRemove = async (hotelId) => {
    setRemoving(hotelId)
    try {
      const res = await fetch(`${API}/wishlist/${hotelId}`, { method: "DELETE", headers: authHeaders() })
      if (res.ok) setItems(prev => prev.filter(h => h.id !== hotelId))
    } catch {}
    setRemoving(null)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-5 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white">Wishlist</h1>
        <p className="text-gray-500 text-sm mt-1">Hotels you've saved for later</p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-10 text-center">
          <Heart size={36} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">Your wishlist is empty</p>
          <Link href="/" className="mt-3 inline-block text-sm text-rose-400 hover:underline">Browse hotels →</Link>
        </div>
      ) : (
        /* 1 col mobile → 2 col sm → 3 col lg */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(hotel => (
            <div key={hotel.id}
              className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition group">
              {/* Image */}
              <div className="relative h-40 md:h-44 bg-white/5 overflow-hidden">
                {hotel.image
                  ? <img src={hotel.image} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt={hotel.name} />
                  : <div className="w-full h-full flex items-center justify-center text-4xl">🏨</div>
                }
                <button
                  onClick={() => handleRemove(hotel.id)}
                  disabled={removing === hotel.id}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-rose-400 hover:bg-red-500 hover:text-white transition"
                >
                  {removing === hotel.id
                    ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <Trash2 size={13} />
                  }
                </button>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-white font-semibold text-sm leading-tight">{hotel.name}</h3>
                  {hotel.stars && (
                    <div className="flex items-center gap-0.5 shrink-0">
                      {Array.from({ length: hotel.stars }).map((_, i) => (
                        <Star key={i} size={10} className="text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  )}
                </div>
                {hotel.location && <p className="text-gray-500 text-xs mt-1">{hotel.location}</p>}
                <div className="flex items-center justify-between mt-3">
                  <p className="text-white font-bold text-sm">
                    AED {Number(hotel.price).toLocaleString()}
                    <span className="text-gray-500 font-normal text-xs">/night</span>
                  </p>
                  <Link href={`/hotels/${hotel.slug}`}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold transition">
                    View →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
