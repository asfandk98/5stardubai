'use client'

import { useState } from "react"
import { MapPin, Calendar, Users, SlidersHorizontal, Search } from "lucide-react"
import { toast } from "react-hot-toast"

export default function FilterBars({ openFilters, onSearch }) {
  const [destination, setDestination] = useState("")
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState(1)

  const today = new Date().toISOString().split("T")[0]

  const handleSearch = () => {
    // ✅ Validation
    if (!destination.trim()) {
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

    onSearch?.({ destination, checkIn, checkOut, guests })
  }

  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-3 sm:p-4">

      {/* ===== DESKTOP LAYOUT ===== */}
      <div className="hidden md:flex items-center gap-2 lg:gap-3">

        {/* Destination */}
        <div className="flex items-center gap-2 border border-gray-200 bg-gray-50 rounded-xl px-3 lg:px-4 py-3 flex-1 min-w-0 focus-within:border-rose-400 focus-within:bg-white transition">
          <MapPin size={15} className="text-rose-500 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Where</p>
            <input
              type="text"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              placeholder="Search destinations"
              className="text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent w-full"
            />
          </div>
        </div>

        <div className="w-px h-8 bg-gray-200 shrink-0" />

        {/* Check-in */}
        <div className="flex items-center gap-2 border border-gray-200 bg-gray-50 rounded-xl px-3 py-3 w-40 lg:w-44 shrink-0 focus-within:border-rose-400 focus-within:bg-white transition">
          <Calendar size={15} className="text-rose-500 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Check in</p>
            <input
              type="date"
              value={checkIn}
              min={today}
              onChange={e => setCheckIn(e.target.value)}
              className="text-sm text-gray-700 outline-none bg-transparent w-full cursor-pointer"
            />
          </div>
        </div>

        <div className="w-px h-8 bg-gray-200 shrink-0" />

        {/* Check-out */}
        <div className="flex items-center gap-2 border border-gray-200 bg-gray-50 rounded-xl px-3 py-3 w-40 lg:w-44 shrink-0 focus-within:border-rose-400 focus-within:bg-white transition">
          <Calendar size={15} className="text-rose-500 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Check out</p>
            <input
              type="date"
              value={checkOut}
              min={checkIn || today}
              onChange={e => setCheckOut(e.target.value)}
              className="text-sm text-gray-700 outline-none bg-transparent w-full cursor-pointer"
            />
          </div>
        </div>

        <div className="w-px h-8 bg-gray-200 shrink-0" />

        {/* Guests */}
        <div className="flex items-center gap-2 border border-gray-200 bg-gray-50 rounded-xl px-3 py-3 shrink-0 focus-within:border-rose-400 focus-within:bg-white transition">
          <Users size={15} className="text-rose-500 shrink-0" />
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Guests</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setGuests(g => Math.max(1, g - 1))}
                className="w-5 h-5 rounded-full bg-gray-200 hover:bg-rose-100 text-gray-600 flex items-center justify-center text-xs font-bold"
              >
                −
              </button>
              <span className="text-sm font-medium w-4 text-center">{guests}</span>
              <button
                onClick={() => setGuests(g => Math.min(20, g + 1))}
                className="w-5 h-5 rounded-full bg-gray-200 hover:bg-rose-100 text-gray-600 flex items-center justify-center text-xs font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-3 rounded-xl transition font-semibold shadow-sm shrink-0 whitespace-nowrap"
        >
          <Search size={16} />
          <span>Search</span>
        </button>

        {/* Filters Button - ✅ Always visible on desktop */}
        <button
          onClick={openFilters}
          className="flex items-center justify-center gap-2 border border-gray-200 bg-white hover:border-rose-400 hover:text-rose-500 text-gray-600 px-3 py-3 rounded-xl transition shrink-0"
          title="Filters"
        >
          <SlidersHorizontal size={18} />
          <span className="text-sm font-medium hidden lg:block">Filters</span>
        </button>

      </div>

      {/* ===== MOBILE LAYOUT ===== */}
      <div className="md:hidden space-y-2.5">

        {/* Destination */}
        <div className="flex items-center gap-2 border border-gray-200 bg-gray-50 rounded-xl px-3 py-2.5 focus-within:border-rose-400 focus-within:bg-white transition">
          <MapPin size={15} className="text-rose-500 shrink-0" />
          <input
            type="text"
            value={destination}
            onChange={e => setDestination(e.target.value)}
            placeholder="Where are you going?"
            className="text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent w-full"
          />
        </div>

        {/* Dates - 2 columns */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5 border border-gray-200 bg-gray-50 rounded-xl px-2.5 py-2.5 focus-within:border-rose-400 focus-within:bg-white transition min-w-0">
            <Calendar size={14} className="text-rose-500 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-semibold text-gray-400 uppercase">Check in</p>
              <input
                type="date"
                value={checkIn}
                min={today}
                onChange={e => setCheckIn(e.target.value)}
                className="text-xs text-gray-700 outline-none bg-transparent w-full cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 border border-gray-200 bg-gray-50 rounded-xl px-2.5 py-2.5 focus-within:border-rose-400 focus-within:bg-white transition min-w-0">
            <Calendar size={14} className="text-rose-500 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-semibold text-gray-400 uppercase">Check out</p>
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

        {/* Guests row */}
        <div className="flex items-center gap-2 border border-gray-200 bg-gray-50 rounded-xl px-3 py-2.5">
          <Users size={14} className="text-rose-500 shrink-0" />
          <span className="text-sm text-gray-500 flex-1">Guests</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setGuests(g => Math.max(1, g - 1))}
              className="w-7 h-7 rounded-full bg-gray-200 hover:bg-rose-100 text-gray-600 flex items-center justify-center font-bold"
            >
              −
            </button>
            <span className="text-sm font-semibold w-4 text-center">{guests}</span>
            <button
              onClick={() => setGuests(g => Math.min(20, g + 1))}
              className="w-7 h-7 rounded-full bg-gray-200 hover:bg-rose-100 text-gray-600 flex items-center justify-center font-bold"
            >
              +
            </button>
          </div>
        </div>

        {/* Search + Filters buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleSearch}
            className="flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white py-2.5 rounded-xl transition font-semibold text-sm"
          >
            <Search size={15} />
            Search
          </button>

          {/* ✅ Filter button always visible on mobile too */}
          <button
            onClick={openFilters}
            className="flex items-center justify-center gap-2 border border-gray-200 bg-white hover:border-rose-400 hover:text-rose-500 text-gray-600 py-2.5 rounded-xl transition text-sm font-medium"
          >
            <SlidersHorizontal size={15} />
            Filters
          </button>
        </div>

      </div>
    </div>
  )
}