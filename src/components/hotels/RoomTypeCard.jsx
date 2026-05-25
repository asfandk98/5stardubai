"use client"
// src/components/hotels/RoomTypeCard.jsx
// Uses field names from HotelController::show():
//   room.active_price, room.original_price, room.is_on_offer, room.discount_percent

import { useState } from "react"
import { ChevronLeft, ChevronRight, BedDouble, Maximize2 } from "lucide-react"

const STORAGE = "https://api.alainhotel.com/storage/"

export default function RoomTypeCard({ room, onSelect, isSelected }) {
  const [imgIdx, setImgIdx] = useState(0)

  const amenities     = Array.isArray(room?.amenities) ? room.amenities : []
  const isOnOffer     = room?.is_on_offer === true
  const activePrice   = isOnOffer ? room.active_price   : room.price
  const originalPrice = isOnOffer ? room.original_price : room.price
  const discountPct   = isOnOffer ? (room.discount_percent ?? 0) : 0

  // images array from Laravel — each has { id, path, url }
  const images = Array.isArray(room?.images) ? room.images : []

  const prev = (e) => {
    e.stopPropagation()
    setImgIdx(i => (i - 1 + images.length) % images.length)
  }

  const next = (e) => {
    e.stopPropagation()
    setImgIdx(i => (i + 1) % images.length)
  }

  return (
    <div
      onClick={() => onSelect(room)}
      className={`
        border-2 rounded-2xl cursor-pointer transition-all duration-200 relative overflow-hidden
        ${isSelected
          ? "border-rose-500 shadow-md"
          : "border-gray-200 hover:border-rose-300 hover:shadow-sm bg-white"}
      `}
    >
      {/* ── Image carousel ─────────────────────────────────────────── */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {images.length > 0 ? (
          <>
            <img
              src={images[imgIdx].url ?? `${STORAGE}${images[imgIdx].path}`}
              alt={`${room.name} photo ${imgIdx + 1}`}
              className="w-full h-full object-cover"
              onError={e => { e.target.onerror = null; e.target.src = "/placeholder-room.jpg" }}
            />

            {/* Prev / Next — only if multiple images */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition z-10"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition z-10"
                >
                  <ChevronRight size={14} />
                </button>

                {/* Dots */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={e => { e.stopPropagation(); setImgIdx(i) }}
                      className={`w-1.5 h-1.5 rounded-full transition ${
                        i === imgIdx ? "bg-white scale-125" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>

                {/* Counter */}
                <span className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full z-10">
                  {imgIdx + 1}/{images.length}
                </span>
              </>
            )}
          </>
        ) : (
          /* No images placeholder */
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <BedDouble size={32} className="text-gray-300" />
            <span className="text-xs text-gray-400">No photos yet</span>
          </div>
        )}

        {/* Discount badge */}
        {isOnOffer && discountPct > 0 && (
          <span className="absolute top-2 left-2 bg-rose-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full z-10">
            -{discountPct}% OFF
          </span>
        )}

        {/* Selected tick */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center z-10">
            <span className="text-white text-xs font-bold">✓</span>
          </div>
        )}
      </div>

      {/* ── Room details ───────────────────────────────────────────── */}
      <div className="p-5">

        {/* Name */}
        <h3 className="font-semibold text-gray-900 text-base mb-2">{room.name}</h3>

        {/* Price */}
        <div className="mb-3">
          {isOnOffer ? (
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-xl font-bold text-rose-500">
                AED {Number(activePrice).toLocaleString()}
              </span>
              <span className="text-sm text-gray-400 line-through">
                AED {Number(originalPrice).toLocaleString()}
              </span>
              <span className="text-xs text-gray-400">/ night</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-rose-500">
                AED {Number(activePrice).toLocaleString()}
              </span>
              <span className="text-xs text-gray-400">/ night</span>
            </div>
          )}
          {isOnOffer && (
            <p className="text-xs text-emerald-600 font-medium mt-0.5">
              🏷️ Special Rate — Save AED {Number(originalPrice - activePrice).toLocaleString()}/night
            </p>
          )}
        </div>

        {/* Size + beds */}
        <div className="flex gap-4 text-sm text-gray-500 mb-3">
          {room.size && (
            <span className="flex items-center gap-1">
              <Maximize2 size={13} className="shrink-0" />
              {room.size}
            </span>
          )}
          {room.beds && (
            <span className="flex items-center gap-1">
              <BedDouble size={13} className="shrink-0" />
              {room.beds} {Number(room.beds) === 1 ? "bed" : "beds"}
            </span>
          )}
        </div>

        {/* Description */}
        {room.description && (
          <p className="text-xs text-gray-400 mb-3 line-clamp-2">{room.description}</p>
        )}

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {amenities.slice(0, 4).map((a, i) => (
              <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {a}
              </span>
            ))}
            {amenities.length > 4 && (
              <span className="text-xs text-gray-400">+{amenities.length - 4} more</span>
            )}
          </div>
        )}

        {/* Select button */}
        <button
          onClick={e => { e.stopPropagation(); onSelect(room) }}
          className={`
            w-full py-2.5 rounded-xl text-sm font-semibold transition
            ${isSelected
              ? "bg-rose-500 text-white hover:bg-rose-600"
              : "border border-gray-200 text-gray-700 hover:border-rose-400 hover:text-rose-500 hover:bg-rose-50"}
          `}
        >
          {isSelected ? "✓ Selected" : "Select Room"}
        </button>
      </div>
    </div>
  )
}
