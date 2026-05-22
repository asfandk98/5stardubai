"use client"
// src/components/hotels/NearbyHotels.jsx

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"

function resolveImage(hotel) {
  const src = hotel?.image_url || hotel?.image
  if (!src) return null
  if (src.startsWith("http")) return src
  return `https://5stardubai.com/backend/storage/${src}`
}

export default function NearbyHotels({ hotels = [] }) {
  const router    = useRouter()
  const rowRef    = useRef(null)
  const [page, setPage] = useState(1)

  if (!hotels.length) return null

  const ITEMS_PER_PAGE = 6
  const totalPages = Math.ceil(hotels.length / ITEMS_PER_PAGE)

  const scroll = (dir) => {
    if (!rowRef.current) return
    const amount = rowRef.current.offsetWidth * 0.75
    rowRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" })
    setPage(p => dir === "right" ? Math.min(p + 1, totalPages) : Math.max(p - 1, 1))
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-gray-900">More stays nearby</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{page} / {totalPages}</span>
          <button
            onClick={() => scroll("left")}
            disabled={page === 1}
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-500 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={page === totalPages}
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-500 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Scrollable row */}
      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
      >
        {hotels.map(hotel => (
          <NearbyCard
            key={hotel.id}
            hotel={hotel}
            onClick={() => router.push(`/hotels/${hotel.slug}`)}
          />
        ))}
      </div>
    </div>
  )
}

function NearbyCard({ hotel, onClick }) {
  const [imgFailed, setImgFailed] = useState(false)
  const imgSrc = resolveImage(hotel)

  return (
    <div
      onClick={onClick}
      className="flex-shrink-0 w-[220px] cursor-pointer group"
    >
      {/* Image */}
      <div className="w-full h-[180px] rounded-xl overflow-hidden bg-gray-100">
        {imgSrc && !imgFailed ? (
          <img
            src={imgSrc}
            alt={hotel.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">
            🏨
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-2.5">
        <p className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:underline">
          {hotel.title}
        </p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-gray-500">
            AED {Number(hotel.price).toLocaleString()}
            <span className="text-xs text-gray-400"> /night</span>
          </p>
          {hotel.rating && (
            <div className="flex items-center gap-1 text-xs text-gray-700">
              <Star size={11} className="fill-black" />
              {hotel.rating}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
