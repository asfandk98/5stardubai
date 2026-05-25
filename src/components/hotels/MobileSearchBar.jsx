'use client'

import { useState, useEffect, useRef } from "react"
import { MapPin, Calendar, Users, SlidersHorizontal, X } from "lucide-react"
import { FiSearch } from "react-icons/fi"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"

const API = "https://api.alainhotel.com/api"

export default function MobileSearchBar({ onOpenFilters }) {
  const router = useRouter()
  const [whereQuery,     setWhereQuery]     = useState("")
  const [checkIn,        setCheckIn]        = useState("")
  const [checkOut,       setCheckOut]       = useState("")
  const [guests,         setGuests]         = useState(1)
  const [locations,      setLocations]      = useState([])
  const [filteredLocs,   setFilteredLocs]   = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef(null)
  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    fetch(`${API}/hotels/filters`)
      .then(r => r.json())
      .then(data => setLocations(data.locations ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!whereQuery.trim()) {
      setFilteredLocs(locations)
    } else {
      setFilteredLocs(
        locations.filter(l => l.toLowerCase().includes(whereQuery.toLowerCase()))
      )
    }
  }, [whereQuery, locations])

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleSearch = () => {
    if (!whereQuery.trim()) {
      toast.error("Please enter a destination")
      return
    }
    if (!checkIn) {
      toast.error("Please select a check-in date")
      return
    }
    if (!checkOut) {
      toast.error("Please select a check-out date")
      return
    }
    if (checkOut <= checkIn) {
      toast.error("Check-out must be after check-in")
      return
    }

    const params = new URLSearchParams()
    params.set("location", whereQuery.trim())
    params.set("check_in",  checkIn)
    params.set("check_out", checkOut)
    if (guests > 1) params.set("guests", guests)

    setShowSuggestions(false)
    router.push(`/hotels?${params.toString()}`)
  }

  return (
    <div className="md:hidden w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-3 space-y-2.5">

      {/* WHERE */}
      <div className="relative" ref={inputRef}>
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100 focus-within:border-rose-300 transition">
          <MapPin size={14} className="text-rose-400 shrink-0" />
          <input
            type="text"
            value={whereQuery}
            onChange={e => { setWhereQuery(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Where are you going?"
            className="text-sm text-gray-700 bg-transparent outline-none w-full placeholder-gray-400"
          />
          {whereQuery && (
            <button onClick={() => { setWhereQuery(""); setShowSuggestions(false); }}>
              <X size={13} className="text-gray-400" />
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && filteredLocs.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden max-h-44 overflow-y-auto">
            {filteredLocs.slice(0, 6).map((loc, i) => (
              <div
                key={i}
                onClick={() => { setWhereQuery(loc); setShowSuggestions(false); }}
                className="flex items-center gap-2 px-3 py-2.5 hover:bg-rose-50 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-0 transition"
              >
                <MapPin size={12} className="text-rose-400 shrink-0" />
                {loc}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DATES */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100 focus-within:border-rose-300 transition">
          <Calendar size={14} className="text-rose-400 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Check in</p>
            <input
              type="date"
              value={checkIn}
              min={today}
              onChange={e => setCheckIn(e.target.value)}
              className="text-xs text-gray-700 outline-none bg-transparent w-full cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100 focus-within:border-rose-300 transition">
          <Calendar size={14} className="text-rose-400 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Check out</p>
            <input
              type="date"
              value={checkOut}
              min={checkIn || today}
              onChange={e => setCheckOut(e.target.value)}
              className="text-xs text-gray-700 outline-none bg-transparent w-full cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* GUESTS */}
      <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-rose-400" />
          <span className="text-sm text-gray-600">
            {guests} guest{guests !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setGuests(g => Math.max(1, g - 1))}
            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-rose-400 hover:text-rose-500 transition font-bold text-sm active:scale-95"
          >−</button>
          <span className="text-sm font-semibold w-4 text-center">{guests}</span>
          <button
            onClick={() => setGuests(g => Math.min(20, g + 1))}
            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-rose-400 hover:text-rose-500 transition font-bold text-sm active:scale-95"
          >+</button>
        </div>
      </div>

      {/* SEARCH + FILTERS */}
      <div className="grid grid-cols-2 gap-2 pt-0.5">
        <button
          onClick={handleSearch}
          className="flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white py-2.5 rounded-xl transition font-semibold text-sm shadow-sm"
        >
          <FiSearch size={15} />
          Search
        </button>

        <button
          onClick={onOpenFilters}
          className="flex items-center justify-center gap-2 border border-gray-200 bg-white hover:border-rose-400 hover:text-rose-500 active:scale-95 text-gray-600 py-2.5 rounded-xl transition text-sm font-medium"
        >
          <SlidersHorizontal size={15} />
          Filters
        </button>
      </div>

    </div>
  )
}