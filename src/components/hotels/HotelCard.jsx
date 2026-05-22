"use client"
// src/components/hotels/HotelCard.jsx

import Link from "next/link"
import { Star, Heart } from "lucide-react"
import { useState } from "react"
import { toast } from "react-hot-toast"

// "Burj Al Arab" → "burj-al-arab"
function toUrlSlug(slug) {
  return slug?.toLowerCase().replace(/\s+/g, "-") ?? ""
}

export default function HotelCard({ hotel }) {
  const [wishlisted, setWishlisted] = useState(hotel.wishlisted ?? false)
  const [toggling, setToggling] = useState(false)

  const imageUrl = hotel.image
    ? `https://5stardubai.com/backend/storage/${hotel.image}`
    : "/placeholder-hotel.jpg"

  // ✅ Detect if ANY room has an offer
  const hasOffer = hotel?.rooms?.some(room => room.is_on_offer)

  const handleWishlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (toggling) return
    setToggling(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) { toast.error("Login to save hotels"); return }
      if (wishlisted) {
        await fetch(`https://5stardubai.com/backend/api
/wishlist/${hotel.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success("Removed from wishlist")
        setWishlisted(false)
      } else {
        await fetch("https://5stardubai.com/backend/api/wishlist", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ hotel_id: hotel.id }),
        })
        toast.success("Saved to wishlist ❤️")
        setWishlisted(true)
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setToggling(false)
    }
  }

  return (
    <Link href={`/hotels/${toUrlSlug(hotel.slug)}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">

        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={imageUrl}
            alt={hotel.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform"
          >
            <Heart
              size={16}
              className={wishlisted ? "fill-rose-500 text-rose-500" : "text-gray-400"}
            />
          </button>

          {/* Hotel type */}
          {hotel.type && (
            <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-semibold px-2 py-1 rounded-full text-gray-700">
              {hotel.type}
            </span>
          )}

          {/* ✅ OFFER BADGE (new) */}
        {hotel.has_offer && hotel.max_discount > 0 && (
  <span className="absolute bottom-3 left-3 bg-rose-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
    -{hotel.max_discount}% OFF
  </span>
)}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 group-hover:text-rose-500 transition-colors">
              {hotel.title}
            </h3>

            {hotel.rating && (
              <div className="flex items-center gap-1 shrink-0">
                <Star size={13} className="fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium text-gray-700">
                  {hotel.rating}
                </span>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-400 mt-1 line-clamp-1">
            {hotel.location}
          </p>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm font-bold text-gray-900">
              AED {hotel.price}
              <span className="text-xs font-normal text-gray-400">
                {" "} / night
              </span>
            </p>

            {hotel.guests && (
              <span className="text-xs text-gray-400">
                👥 {hotel.guests} guests
              </span>
            )}
          </div>
        </div>

      </div>
    </Link>
  )
}