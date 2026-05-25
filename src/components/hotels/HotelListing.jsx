"use client"
// components/hotels/HotelListing.js

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import HotelCard from "./HotelCard"
import { X } from "lucide-react"

const LABEL_MAP = {
  location:  "Location",
  guests:    "Guests",
  check_in:  "Check-in",
  check_out: "Check-out",
  type:      "Type",
  min_price: "Min Price",
  max_price: "Max Price",
  rating:    "Rating",
}

export default function HotelListing({ filters = {}, onClearFilter }) {
  const [hotels,  setHotels]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const router = useRouter()

  useEffect(() => {
    setLoading(true)
    setError(null)

    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        params.append(key, value)
      }
    })

    const url = `https://api.alainhotel.com/api
/hotels${params.toString() ? `?${params}` : ""}`

    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error("Failed to fetch hotels")
        return r.json()
      })
      .then(data => {
        setHotels(Array.isArray(data) ? data : data.data ?? [])
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [filters])

  // Active filter chips — only show meaningful ones
  const activeFilters = Object.entries(filters).filter(
    ([, v]) => v !== "" && v !== null && v !== undefined
  )

  const clearAll = () => {
    router.push("/hotels") // clears URL params
    if (onClearFilter) onClearFilter()
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[40vh] text-gray-400 text-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
        <span>Finding hotels…</span>
      </div>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center min-h-[40vh] text-red-500 text-sm">
      {error}
    </div>
  )

  return (
    <section className="max-w-7xl mx-auto px-4 py-6">

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-sm text-gray-500 font-medium">Filters:</span>

          {activeFilters.map(([key, value]) => (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-600 text-xs font-medium px-3 py-1.5 rounded-full border border-rose-200"
            >
              <span className="text-rose-400">{LABEL_MAP[key] ?? key}:</span>
              {String(value)}
              {onClearFilter && (
                <button
                  onClick={() => onClearFilter(key)}
                  className="hover:text-rose-800 transition ml-0.5"
                >
                  <X size={11} />
                </button>
              )}
            </span>
          ))}

          <button
            onClick={clearAll}
            className="text-xs text-gray-400 hover:text-gray-700 underline transition ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-4">
        {hotels.length} hotel{hotels.length !== 1 ? "s" : ""} found
        {filters.location ? ` in ${filters.location}` : ""}
      </p>

      {hotels.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-gray-400 text-sm gap-3">
          <span className="text-4xl">🏨</span>
          <p>No hotels match your search.</p>
          <button
            onClick={clearAll}
            className="text-rose-500 hover:text-rose-600 text-sm font-medium underline transition"
          >
            Clear filters and show all hotels
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {hotels.map(hotel => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>
      )}
    </section>
  )
}
