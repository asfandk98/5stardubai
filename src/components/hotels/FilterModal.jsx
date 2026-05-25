"use client"

import { useEffect, useState } from "react"
import { X, SlidersHorizontal, Star } from "lucide-react"

const API = "https://api.alainhotel.com/backend/api"

/**
 * FilterModal
 * Props:
 *  - isOpen   : boolean
 *  - onClose  : () => void
 *  - onApply  : (filters: object) => void
 */
export default function FilterModal({ isOpen, onClose, onApply }) {
  // ── Options from /api/hotels/filters ──────────────────────────────────────
  const [options, setOptions] = useState({
    locations: [],
    types: [],
    max_price: 10000,
    ratings: [5, 4, 3, 2, 1],
  })
  const [loadingOptions, setLoadingOptions] = useState(false)

  // ── Selected values (multi-select where applicable) ───────────────────────
  const [selectedLocations, setSelectedLocations] = useState([])
  const [selectedTypes,     setSelectedTypes]     = useState([])
  const [selectedRatings,   setSelectedRatings]   = useState([])
  const [minPrice,          setMinPrice]          = useState("")
  const [maxPrice,          setMaxPrice]          = useState("")
  const [guests,            setGuests]            = useState("")

  // ── Fetch options whenever modal opens ────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return
    setLoadingOptions(true)
    fetch(`${API}/hotels/filters`)
      .then((r) => r.json())
      .then((data) => setOptions(data))
      .catch(console.error)
      .finally(() => setLoadingOptions(false))
  }, [isOpen])

  // ── Toggle a value in a multi-select list ─────────────────────────────────
  const toggle = (list, setList, value) =>
    setList((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )

  // ── Build filters object and send up ─────────────────────────────────────
  const handleApply = () => {
    const filters = {}
    if (selectedLocations.length) filters.location  = selectedLocations.join(",")
    if (selectedTypes.length)     filters.type      = selectedTypes.join(",")
    if (selectedRatings.length)   filters.rating    = selectedRatings.join(",")
    if (minPrice)                 filters.min_price = minPrice
    if (maxPrice)                 filters.max_price = maxPrice
    if (guests)                   filters.guests    = guests
    onApply(filters)
    onClose()
  }

  const handleReset = () => {
    setSelectedLocations([])
    setSelectedTypes([])
    setSelectedRatings([])
    setMinPrice("")
    setMaxPrice("")
    setGuests("")
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <div className="flex items-center gap-2 font-semibold text-lg text-gray-900">
            <SlidersHorizontal size={20} className="text-rose-500" />
            Filters
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">
          {loadingOptions ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
              Loading options…
            </div>
          ) : (
            <>
              {/* LOCATION */}
              <Section label="Location">
                <div className="flex flex-wrap gap-2">
                  {options.locations.map((loc) => (
                    <Chip
                      key={loc}
                      label={loc}
                      active={selectedLocations.includes(loc)}
                      onClick={() => toggle(selectedLocations, setSelectedLocations, loc)}
                    />
                  ))}
                </div>
              </Section>

              {/* TYPE */}
              <Section label="Property Type">
                <div className="flex flex-wrap gap-2">
                  {options.types.map((type) => (
                    <Chip
                      key={type}
                      label={type}
                      active={selectedTypes.includes(type)}
                      onClick={() => toggle(selectedTypes, setSelectedTypes, type)}
                    />
                  ))}
                </div>
              </Section>

              {/* PRICE RANGE */}
              <Section label="Price Range (AED / night)">
                <div className="flex gap-3 items-center">
                  <input
                    type="number"
                    min={0}
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                  <span className="text-gray-400 shrink-0">–</span>
                  <input
                    type="number"
                    min={0}
                    placeholder={`Max (${options.max_price})`}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </Section>

              {/* STAR RATING */}
              <Section label="Star Rating">
                <div className="flex gap-2 flex-wrap">
                  {options.ratings.map((r) => (
                    <button
                      key={r}
                      onClick={() => toggle(selectedRatings, setSelectedRatings, r)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition font-medium
                        ${
                          selectedRatings.includes(r)
                            ? "bg-rose-500 text-white border-rose-500"
                            : "border-gray-200 text-gray-600 hover:border-rose-400"
                        }`}
                    >
                      <Star
                        size={12}
                        className={
                          selectedRatings.includes(r)
                            ? "fill-white text-white"
                            : "fill-yellow-400 text-yellow-400"
                        }
                      />
                      {r}
                    </button>
                  ))}
                </div>
              </Section>

              {/* GUESTS */}
              <Section label="Minimum Guests">
                <input
                  type="number"
                  min={1}
                  placeholder="e.g. 2"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </Section>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t flex gap-3 shrink-0">
          <button
            onClick={handleReset}
            className="flex-1 border border-gray-300 text-gray-600 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 transition"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex-1 bg-rose-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-rose-600 transition"
          >
            Show Results
          </button>
        </div>

      </div>
    </>
  )
}

// ── Reusable sub-components ───────────────────────────────────────────────────

function Section({ label, children }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
        {label}
      </p>
      {children}
    </div>
  )
}

function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm border transition font-medium
        ${
          active
            ? "bg-rose-500 text-white border-rose-500"
            : "border-gray-200 text-gray-600 hover:border-rose-400"
        }`}
    >
      {label}
    </button>
  )
}
