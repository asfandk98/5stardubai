'use client'

import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { ChevronLeft, ChevronRight, Lock, Unlock } from "lucide-react"

const API = "https://api.alainhotel.com/backend/api/admin"

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]

export default function RoomAvailability() {

  const [hotels, setHotels] = useState([])
  const [rooms, setRooms] = useState([])

  const [selectedHotel, setSelectedHotel] = useState("")
  const [selectedRoom, setSelectedRoom] = useState("")

  const [blockedDates, setBlockedDates] = useState([])
  const [bookedDates, setBookedDates] = useState([]) // ✅ NEW

  const [selected, setSelected] = useState([])

  const [viewDate, setViewDate] = useState(new Date())
  const [loading, setLoading] = useState(false)

  const [isDragging, setIsDragging] = useState(false) // ✅ drag select

  const today = new Date()

  const token = () => localStorage.getItem("token")

  // ─────────────────────────────────────────
  // LOAD HOTELS
  // ─────────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/hotels`, {
      headers: { Authorization: `Bearer ${token()}` }
    })
      .then(r => r.json())
      .then(setHotels)
  }, [])

  // ─────────────────────────────────────────
  // LOAD ROOMS
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!selectedHotel) return

    setSelectedRoom("")
    setBlockedDates([])
    setBookedDates([])

    fetch(`${API}/hotels/${selectedHotel}/rooms`, {
      headers: { Authorization: `Bearer ${token()}` }
    })
      .then(r => r.json())
      .then(setRooms)

  }, [selectedHotel])

  // ─────────────────────────────────────────
  // LOAD AVAILABILITY
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!selectedRoom) return

    const year = viewDate.getFullYear()
    const month = viewDate.getMonth() + 1

    setLoading(true)

    fetch(`${API}/rooms/${selectedRoom}/availability?month=${month}&year=${year}`, {
      headers: { Authorization: `Bearer ${token()}` }
    })
      .then(r => r.json())
      .then(data => {
        setBlockedDates(data.blocked_dates || [])
        setBookedDates(data.booked_dates || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))

  }, [selectedRoom, viewDate])

  // ─────────────────────────────────────────
  // DATE HELPERS
  // ─────────────────────────────────────────
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const formatDate = (y, m, d) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`

  const dateStr = (d) => formatDate(year, month, d)

  const isPast = (d) =>
    new Date(year, month, d) <
    new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const isBlocked = (d) => blockedDates.includes(dateStr(d))
  const isBooked  = (d) => bookedDates.includes(dateStr(d))
  const isPicked  = (d) => selected.includes(dateStr(d))

  // ─────────────────────────────────────────
  // SELECT / DRAG
  // ─────────────────────────────────────────
  const toggleDay = (d) => {
    const date = dateStr(d)

    if (isBooked(d)) return // ❌ can't select booked

    setSelected(prev =>
      prev.includes(date)
        ? prev.filter(x => x !== date)
        : [...prev, date]
    )
  }

  const handleMouseDown = (d) => {
    if (isPast(d) || isBooked(d)) return
    setIsDragging(true)
    toggleDay(d)
  }

  const handleMouseEnter = (d) => {
    if (!isDragging) return
    if (isPast(d) || isBooked(d)) return
    toggleDay(d)
  }

  const handleMouseUp = () => setIsDragging(false)

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp)
    return () => window.removeEventListener("mouseup", handleMouseUp)
  }, [])

  // ─────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────
  const blockSelected = async () => {
    const valid = selected.filter(d => !bookedDates.includes(d))

    if (valid.length === 0) {
      toast.error("Cannot block booked dates")
      return
    }

    await fetch(`${API}/rooms/${selectedRoom}/availability/block`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ dates: valid })
    })

    setBlockedDates(prev => [...new Set([...prev, ...valid])])
    setSelected([])

    toast.success(`${valid.length} date(s) blocked`)
  }

  const unblockSelected = async () => {
    await fetch(`${API}/rooms/${selectedRoom}/availability/unblock`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ dates: selected })
    })

    setBlockedDates(prev => prev.filter(d => !selected.includes(d)))
    setSelected([])

    toast.success(`${selected.length} date(s) unblocked`)
  }

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1))

  // ─────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-3xl">

      <div>
        <h1 className="text-2xl font-bold text-white">Room Availability</h1>
        <p className="text-gray-500 text-sm mt-1">Block or unblock dates for specific rooms</p>
      </div>

      {/* SELECTS */}
      <div className="grid grid-cols-2 gap-4">

        <select
          value={selectedHotel}
          onChange={e => setSelectedHotel(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2.5"
        >
          <option value="">— Choose hotel —</option>
          {hotels.map(h => <option key={h.id} value={h.id}>{h.title}</option>)}
        </select>

        <select
          value={selectedRoom}
          onChange={e => setSelectedRoom(e.target.value)}
          disabled={!selectedHotel}
          className="bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2.5"
        >
          <option value="">— Choose room —</option>
          {rooms.map(r => (
            <option key={r.id} value={r.id}>
              {r.name} — AED {r.price}/night
            </option>
          ))}
        </select>
      </div>

      {/* CALENDAR */}
      {selectedRoom && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">

          {/* HEADER */}
          <div className="flex justify-between mb-5">
            <button onClick={prevMonth}><ChevronLeft /></button>
            <h2 className="text-white">{MONTHS[month]} {year}</h2>
            <button onClick={nextMonth}><ChevronRight /></button>
          </div>

          {/* DAYS */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => <div key={d} className="text-center text-xs text-gray-500">{d}</div>)}
          </div>

          {/* GRID */}
          {loading ? (
            <div className="h-40 flex items-center justify-center">Loading...</div>
          ) : (
            <div className="grid grid-cols-7 gap-1">

              {Array.from({ length: firstDay }).map((_, i) => <div key={i} />)}

              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {

                const past = isPast(day)
                const blocked = isBlocked(day)
                const booked = isBooked(day)
                const picked = isPicked(day)

                return (
                  <button
                    key={day}
                    disabled={past || booked}
                    onMouseDown={() => handleMouseDown(day)}
                    onMouseEnter={() => handleMouseEnter(day)}
                    className={`
                      aspect-square rounded-lg text-sm relative
                      ${past ? "text-gray-700" : ""}
                      ${booked ? "bg-yellow-500/20 text-yellow-400 cursor-not-allowed" : ""}
                      ${blocked ? "bg-red-500/20 text-red-400" : ""}
                      ${picked ? "bg-rose-500 text-white scale-105" : ""}
                    `}
                  >
                    {day}

                    {booked && <Lock size={10} className="absolute bottom-1 left-1/2 -translate-x-1/2" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ACTIONS */}
      {selected.length > 0 && (
        <div className="flex gap-3">
          <button onClick={blockSelected} className="bg-red-500 px-4 py-2 rounded">
            <Lock size={14}/> Block
          </button>

          <button onClick={unblockSelected} className="bg-green-600 px-4 py-2 rounded">
            <Unlock size={14}/> Unblock
          </button>
        </div>
      )}
    </div>
  )
}