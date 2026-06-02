"use client"

import Link from "next/link"
import Image from "next/image"
import { useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"

function resolveImage(hotel) {
  const src = hotel?.image_url || hotel?.image
  if (!src) return null
  if (src.startsWith("http")) return src
  return `https://api.alainhotel.com/storage/${src}`
}

export default function NearbyHotels({ hotels = [] }) {
  const rowRef = useRef(null)
  const [page, setPage] = useState(1)

  if (!hotels.length) return null

  const ITEMS_PER_PAGE = 6
  const totalPages = Math.ceil(hotels.length / ITEMS_PER_PAGE)

  const location = hotels[0]?.location || "this area"

  const scroll = (dir) => {
    if (!rowRef.current) return
    const amount = rowRef.current.offsetWidth * 0.75

    rowRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth"
    })

    setPage((p) =>
      dir === "right"
        ? Math.min(p + 1, totalPages)
        : Math.max(p - 1, 1)
    )
  }

  return (
    <section className="mt-12 md:mt-16">

      {/* SEO Heading */}
      <h2 className="text-lg md:text-xl font-semibold mb-2">
        Hotels Near {location}
      </h2>

      {/* SEO Description (IMPORTANT) */}
      <p className="text-sm text-gray-600 mb-4">
        Explore top-rated hotels near {location}, including luxury stays,
        budget-friendly options, and family accommodations.
      </p>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">
          {page} / {totalPages}
        </span>

        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={page === 1}
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            onClick={() => scroll("right")}
            disabled={page === totalPages}
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Scrollable Cards */}
      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide"
      >
        {hotels.map((hotel) => (
          <Link
            key={hotel.id}
            href={`/hotels/${hotel.slug}`}
            className="flex-shrink-0 w-[220px] group"
          >
            <NearbyCard hotel={hotel} />
          </Link>
        ))}
      </div>
    </section>
  )
}

function NearbyCard({ hotel }) {
  const [imgFailed, setImgFailed] = useState(false)
  const imgSrc = resolveImage(hotel)

  return (
    <article>
      {/* Image */}
      <div className="w-full h-[180px] rounded-xl overflow-hidden bg-gray-100">
        {imgSrc && !imgFailed ? (
          <Image
            src={imgSrc}
            alt={`${hotel.title} in ${hotel.location}`}
            width={300}
            height={200}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">
            🏨
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-2.5">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:underline">
          {hotel.title}
        </h3>

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
    </article>
  )
}