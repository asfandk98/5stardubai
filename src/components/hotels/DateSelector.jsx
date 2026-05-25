"use client"
// src/components/hotels/DateSelector.jsx

import { DateRange } from "react-date-range"
import { useState, useEffect, useCallback, useRef } from "react"
import "react-date-range/dist/styles.css"
import "react-date-range/dist/theme/default.css"

const API = "https://api.alainhotel.com/backend/api"

const today = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export default function DateSelector({ setDates, roomId }) {
  const [open,             setOpen]             = useState(false)
  const [range,            setRange]            = useState([{
    startDate: today(),
    endDate:   null,          // ← FIX: null so BookingCard knows no range chosen yet
    key:       "selection",
  }])
  const [unavailableDates, setUnavailableDates] = useState(new Set())
  const [loading,          setLoading]          = useState(false)
  const fetchedRef = useRef(new Set())

  // ── Fetch one month's blocked/booked dates ────────────────────────────────
  const fetchMonth = useCallback(async (year, month) => {
    if (!roomId) return
    const key = `${year}-${String(month).padStart(2, "0")}`
    if (fetchedRef.current.has(key)) return

    fetchedRef.current.add(key)
    setLoading(true)

    try {
      const res = await fetch(
        `${API}/rooms/${roomId}/availability?year=${year}&month=${month}`
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()

      const dateStrings = new Set([
        ...(data.blocked_dates     ?? []),
        ...(data.booked_dates      ?? []),
        ...(data.unavailable_dates ?? []),
      ])

      setUnavailableDates(prev => {
        const next = new Set(prev)
        dateStrings.forEach(d => next.add(d))
        return next
      })
    } catch (err) {
      console.error("Availability fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [roomId])

  // Fetch current + next 5 months on mount
  useEffect(() => {
    if (!roomId) return
    fetchedRef.current = new Set()
    setUnavailableDates(new Set())

    const now = new Date()
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
      fetchMonth(d.getFullYear(), d.getMonth() + 1)
    }
  }, [roomId, fetchMonth])

  const handleShownDateChange = useCallback((shownDate) => {
    const y = shownDate.getFullYear()
    const m = shownDate.getMonth() + 1
    fetchMonth(y, m)
    const next = new Date(y, m, 1)
    fetchMonth(next.getFullYear(), next.getMonth() + 1)
  }, [fetchMonth])

  // ── Convert "YYYY-MM-DD" strings → Date at LOCAL midnight ────────────────
  const disabledDates = Array.from(unavailableDates).map(str => {
    const [y, mo, d] = str.split("-").map(Number)
    return new Date(y, mo - 1, d)
  })

  // ── Validate entire range has no blocked dates ────────────────────────────
  const isRangeValid = (start, end) => {
    if (!start || !end) return true
    const cur  = new Date(start.getFullYear(), start.getMonth(), start.getDate())
    const endD = new Date(end.getFullYear(),   end.getMonth(),   end.getDate())
    while (cur <= endD) {
      const key = [
        cur.getFullYear(),
        String(cur.getMonth() + 1).padStart(2, "0"),
        String(cur.getDate()).padStart(2, "0"),
      ].join("-")
      if (unavailableDates.has(key)) return false
      cur.setDate(cur.getDate() + 1)
    }
    return true
  }

  const fmt = (date) =>
    date
      ? date.toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" })
      : "Select date"

  // ── nights — safe: endDate may be null ───────────────────────────────────
  const nights = (() => {
    const s = range[0].startDate
    const e = range[0].endDate
    if (!s || !e) return 0
    return Math.max(0, Math.ceil((e - s) / (1000 * 60 * 60 * 24)))
  })()

  // ── Handle calendar change ────────────────────────────────────────────────
  const handleChange = (item) => {
    const { startDate, endDate } = item.selection

    if (!isRangeValid(startDate, endDate)) {
      alert("Some selected dates are unavailable. Please choose different dates.")
      return
    }

    const newRange = [{ startDate, endDate, key: "selection" }]
    setRange(newRange)

    // ── FIX: only propagate to BookingCard when a full valid range is chosen ─
    const validNights = startDate && endDate
      ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
      : 0

    if (validNights > 0) {
      setDates({ startDate, endDate })   // both are Date objects — BookingCard can subtract directly
    } else {
      setDates(null)                     // reset BookingCard if user clears or picks same day
    }
  }

  const handleDone = () => {
    if (nights > 0) setOpen(false)
  }

  return (
    <div className="relative">

      {/* Trigger button */}
      <div
        onClick={() => setOpen(o => !o)}
        className={`border rounded-xl p-3 cursor-pointer transition ${
          open ? "border-rose-400 ring-1 ring-rose-200" : "hover:border-rose-400"
        }`}
      >
        <div className="grid grid-cols-2 divide-x text-sm">
          <div className="pr-3">
            <p className="text-gray-400 text-xs uppercase font-medium tracking-wider">Check-in</p>
            <p className={`font-semibold mt-0.5 ${range[0].startDate ? "text-gray-900" : "text-gray-300"}`}>
              {fmt(range[0].startDate)}
            </p>
          </div>
          <div className="pl-3">
            <p className="text-gray-400 text-xs uppercase font-medium tracking-wider">Check-out</p>
            <p className={`font-semibold mt-0.5 ${range[0].endDate ? "text-gray-900" : "text-gray-300"}`}>
              {fmt(range[0].endDate)}
            </p>
          </div>
        </div>

        {nights > 0 ? (
          <p className="text-xs text-rose-500 font-medium mt-2 text-center">
            {nights} night{nights !== 1 ? "s" : ""}
          </p>
        ) : (
          <p className="text-xs text-gray-400 mt-2 text-center">
            Tap to select dates
          </p>
        )}
      </div>

      {/* Calendar dropdown */}
      {open && (
        <div className="mt-2 z-50 relative">

          {loading && (
            <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center rounded-lg">
              <div className="w-5 h-5 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          <DateRange
            ranges={range}
            onChange={handleChange}
            onShownDateChange={handleShownDateChange}
            minDate={today()}
            disabledDates={disabledDates}
            moveRangeOnFirstSelection={false}
            rangeColors={["#f43f5e"]}
            months={1}
            direction="horizontal"
            className="rounded-lg shadow-lg border border-gray-200 w-full"
          />

          {unavailableDates.size > 0 && (
            <p className="text-xs text-gray-400 mt-1 px-1">
              ⚠️ Greyed-out dates are unavailable or blocked
            </p>
          )}

          {process.env.NODE_ENV === "development" && (
            <p className="text-xs text-blue-400 px-1 mt-1">
              🔒 {unavailableDates.size} date(s) blocked
            </p>
          )}

          <button
            onClick={handleDone}
            disabled={nights === 0}
            className="w-full mt-2 bg-rose-500 text-white py-2.5 rounded-xl hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold transition"
          >
            {nights > 0
              ? `Done — ${nights} night${nights !== 1 ? "s" : ""}`
              : "Pick a check-out date"}
          </button>
        </div>
      )}
    </div>
  )
}
