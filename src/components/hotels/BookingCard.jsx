"use client"
// src/components/hotels/BookingCard.jsx

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import DateSelector from "./DateSelector"
import GuestSelector from "./GuestSelector"

const API = "https://api.alainhotel.com/backend/api"

// ── Safely parse anything into a Date at midnight ─────────────────────────
function toDate(val) {
  if (!val) return null
  if (val instanceof Date) return isNaN(val) ? null : val
  const d = new Date(val)
  return isNaN(d) ? null : d
}

function calcNights(start, end) {
  const s = toDate(start)
  const e = toDate(end)
  if (!s || !e) return 0
  const ms = e.getTime() - s.getTime()
  return ms > 0 ? Math.ceil(ms / (1000 * 60 * 60 * 24)) : 0
}

export default function BookingCard({ hotel, selectedRoom }) {
  const router = useRouter()

  const [dates,          setDates]          = useState(null)
  const [guests,         setGuests]         = useState({ adults: 1, children: 0 })
  const [loading,        setLoading]        = useState(false)
  const [error,          setError]          = useState(null)
  const [seasonalPrices, setSeasonalPrices] = useState([])
  const [activeSeasonal, setActiveSeasonal] = useState(null)

  const mpgsScriptRef = useRef(null)

  // ── Derive start / end robustly from whatever DateSelector passes ──────────
  const startDate = toDate(dates?.startDate ?? dates?.start ?? dates?.checkIn)
  const endDate   = toDate(dates?.endDate   ?? dates?.end   ?? dates?.checkOut)
  const nights    = calcNights(startDate, endDate)

  const hasValidDates = !!(startDate && endDate && nights > 0)

  // ── Load seasonal prices ───────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedRoom?.id) {
      setSeasonalPrices([])
      setActiveSeasonal(null)
      return
    }
    fetch(`${API}/rooms/${selectedRoom.id}/seasonal-prices-public`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setSeasonalPrices(Array.isArray(data) ? data : []))
      .catch(() => setSeasonalPrices([]))
  }, [selectedRoom?.id])

  // ── Match dates to seasonal period ────────────────────────────────────────
  useEffect(() => {
    if (!hasValidDates || seasonalPrices.length === 0) {
      setActiveSeasonal(null)
      return
    }
    const s = new Date(startDate); s.setHours(0,0,0,0)
    const e = new Date(endDate);   e.setHours(0,0,0,0)

    const match = seasonalPrices.find(sp => {
      const sStart = new Date(sp.start_date); sStart.setHours(0,0,0,0)
      const sEnd   = new Date(sp.end_date);   sEnd.setHours(0,0,0,0)
      return sStart <= s && sEnd >= e
    })
    setActiveSeasonal(match ?? null)
  }, [dates, seasonalPrices, hasValidDates])

  // ── Pricing ────────────────────────────────────────────────────────────────
  const basePrice     = Number(selectedRoom?.price ?? hotel.price)
  const seasonalPrice = activeSeasonal ? Number(activeSeasonal.price) : null
  const isOnOffer     = seasonalPrice !== null && seasonalPrice < basePrice
  const nightRate     = isOnOffer ? seasonalPrice : basePrice
  const discountPct   = isOnOffer
    ? Math.round(((basePrice - seasonalPrice) / basePrice) * 100)
    : 0

  const subtotal         = nights * nightRate
  const originalSubtotal = nights * basePrice
  const amountSaved      = originalSubtotal - subtotal
  const tax              = Math.round(subtotal * 0.05)
  const tourismFee       = nights > 0 ? 10 * nights : 0
  const total            = subtotal + tax + tourismFee
  const originalTotal    = originalSubtotal + Math.round(originalSubtotal * 0.05) + tourismFee

  const roomId = selectedRoom?.id ?? hotel.rooms?.[0]?.id

  // ── MPGS callbacks ─────────────────────────────────────────────────────────
  useEffect(() => {
    window.paymentError = (err) => {
      setError("Payment failed: " + (err?.cause ?? err?.explanation ?? "Unknown error"))
      setLoading(false)
    }
    window.paymentCancelled = () => {
      setError("Payment was cancelled. You have not been charged.")
      setLoading(false)
    }
    window.paymentComplete = () => {
      window.location.href = "/payment/result"
    }
    return () => {
      delete window.paymentError
      delete window.paymentCancelled
      delete window.paymentComplete
    }
  }, [])

  const loadMpgsAndPay = (sessionId, mpgsJsUrl) => {
    if (mpgsScriptRef.current) {
      mpgsScriptRef.current.remove()
      mpgsScriptRef.current = null
    }
    const script = document.createElement("script")
    script.src = mpgsJsUrl
    script.setAttribute("data-error",    "paymentError")
    script.setAttribute("data-cancel",   "paymentCancelled")
    script.setAttribute("data-complete", "paymentComplete")
    script.onload = () => {
      if (!window.Checkout) {
        setError("Payment gateway failed to load. Please try again.")
        setLoading(false)
        return
      }
      window.Checkout.configure({ session: { id: sessionId } })
      window.Checkout.showPaymentPage()
    }
    script.onerror = () => {
      setError("Could not connect to payment gateway. Please try again.")
      setLoading(false)
    }
    document.body.appendChild(script)
    mpgsScriptRef.current = script
  }

  // ── Reserve ────────────────────────────────────────────────────────────────
  const handleReserve = async () => {
    if (!hasValidDates || loading) return

    const token = localStorage.getItem("token")
    if (!token) {
      sessionStorage.setItem("redirect_after_login", window.location.pathname)
      router.push("/login")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const user = JSON.parse(localStorage.getItem("user") ?? "{}")

      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          total,
          email:             user?.email ?? "",
          hotel_id:          hotel.id,
          room_id:           selectedRoom?.id ?? null,
          check_in:          startDate.toISOString().split("T")[0],
          check_out:         endDate.toISOString().split("T")[0],
          guests,
          night_rate:        nightRate,
          seasonal_price_id: activeSeasonal?.id ?? null,
          description: `${hotel.title}${selectedRoom ? ` — ${selectedRoom.name}` : ""} · ${nights} night${nights !== 1 ? "s" : ""}`,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Payment initiation failed")

      loadMpgsAndPay(data.session_id, data.mpgs_js)

    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  // ── Button label ───────────────────────────────────────────────────────────
  const buttonLabel = () => {
    if (loading)        return null               // spinner shown separately
    if (!startDate)     return "Select dates to reserve"
    if (!endDate)       return "Select check-out date"
    if (nights === 0)   return "Check-out must be after check-in"
    return `Reserve — AED ${total.toLocaleString()}`
  }

  return (
    <div className="border rounded-2xl p-6 shadow-lg sticky top-32 bg-white">

      {/* Selected room banner */}
      {selectedRoom && (
        <div className="mb-4 bg-rose-50 border border-rose-200 rounded-xl p-3">
          <p className="text-xs text-rose-500 font-semibold uppercase tracking-wider">Selected Room</p>
          <p className="font-semibold text-gray-900 mt-0.5">{selectedRoom.name}</p>
          <p className="text-sm text-gray-500">
            {selectedRoom.size && `${selectedRoom.size} · `}
            {selectedRoom.beds} Bed(s)
          </p>
        </div>
      )}

      {/* Price display */}
      <div className="mb-5">
        {isOnOffer ? (
          <>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl font-bold text-gray-900">AED {nightRate.toLocaleString()}</span>
              <span className="text-base text-gray-400 line-through">AED {basePrice.toLocaleString()}</span>
              <span className="text-sm text-gray-400">/ night</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="bg-rose-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                -{discountPct}% OFF
              </span>
              <span className="text-xs text-emerald-600 font-medium">
                Save AED {(basePrice - nightRate).toLocaleString()}/night
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">🏷️ Seasonal rate applied for your selected dates</p>
          </>
        ) : (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">AED {basePrice.toLocaleString()}</span>
              <span className="text-sm text-gray-400 ml-1">/ night</span>
            </div>
            {seasonalPrices.length > 0 && hasValidDates && !isOnOffer && (
              <p className="text-xs text-amber-500 mt-1">💡 Special rates available — try different dates</p>
            )}
          </>
        )}
      </div>

      {/* Date selector */}
      <DateSelector setDates={setDates} roomId={roomId} />

      {/* Helpful hint when same-day selected */}
      {startDate && endDate && nights === 0 && (
        <p className="mt-2 text-xs text-rose-500 font-medium">
          ⚠️ Check-out must be at least 1 day after check-in
        </p>
      )}

      <div className="mt-4">
        <GuestSelector setGuests={setGuests} />
      </div>

      {/* Price breakdown */}
      {hasValidDates && (
        <div className="mt-5 space-y-2.5 text-sm border-t pt-4">
          <div className="flex justify-between text-gray-600">
            <span>AED {nightRate.toLocaleString()} × {nights} night{nights !== 1 ? "s" : ""}</span>
            <span>AED {subtotal.toLocaleString()}</span>
          </div>
          {isOnOffer && amountSaved > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold bg-emerald-50 px-3 py-2 rounded-xl">
              <span>🎉 You save</span>
              <span>AED {amountSaved.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>Tax (5%)</span>
            <span>AED {tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tourism fee</span>
            <span>AED {tourismFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 pt-2 border-t text-base">
            <span>Total</span>
            <span>AED {total.toLocaleString()}</span>
          </div>
          {isOnOffer && amountSaved > 0 && (
            <p className="text-xs text-gray-400 text-right">
              Without discount: <span className="line-through">AED {originalTotal.toLocaleString()}</span>
            </p>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
          <p className="text-xs text-rose-600 font-medium">{error}</p>
          <button onClick={() => setError(null)} className="text-xs text-rose-400 underline mt-1">Dismiss</button>
        </div>
      )}

      {/* Reserve button */}
      <button
        onClick={handleReserve}
        disabled={!hasValidDates || loading}
        className="mt-5 w-full bg-rose-500 text-white py-3 rounded-xl hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed transition font-semibold text-sm flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Connecting to payment...
          </>
        ) : (
          buttonLabel()
        )}
      </button>

      {hasValidDates && !loading && (
        <p className="mt-3 text-center text-xs text-gray-400 flex items-center justify-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Secured by Mastercard Payment Gateway
        </p>
      )}
    </div>
  )
}
