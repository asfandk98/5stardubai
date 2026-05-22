"use client"
// src/app/payment/result/page.jsx

import { useEffect, useState, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"

function PaymentResultInner() {
  const params          = useSearchParams()
  const orderId         = params.get("order_id")
  const resultIndicator = params.get("resultIndicator") // only present on SUCCESS from MPGS

  const printRef = useRef(null)
  const [status, setStatus] = useState("verifying")
  const [order,  setOrder]  = useState(null)

  useEffect(() => {
    if (!orderId) { setStatus("failed"); return }

    // ── If MPGS didn't send resultIndicator → payment was cancelled/failed ──
    if (!resultIndicator) {
      setStatus("failed")
      return
    }

    const token = localStorage.getItem("token") ?? ""

    // 1.5s grace period so MPGS finishes processing before we verify
    const timer = setTimeout(() => {
      fetch(`/api/payments/verify?order_id=${orderId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept":        "application/json",
        },
      })
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            setOrder({
              id:          orderId,
              booking_id:  data.booking_id,
              amount:      data.amount      ?? "0",
              currency:    data.currency    ?? "AED",
              hotel_name:  data.hotel_name  ?? "—",
              room_name:   data.room_name   ?? "—",
              check_in:    data.check_in    ?? "—",
              check_out:   data.check_out   ?? "—",
              nights:      data.nights      ?? "—",
              guests:      data.guests      ?? "—",
              email:       data.email       ?? "—",
              subtotal:    data.subtotal    ?? "0",
              tax:         data.tax         ?? "0",
              tourism_fee: data.tourism_fee ?? "0",
              paid_at:     new Date().toLocaleString("en-AE", {
                dateStyle: "long", timeStyle: "short",
              }),
            })
            setStatus("success")
          } else {
            setStatus("failed")
          }
        })
        .catch(() => setStatus("failed"))
    }, 1500)

    return () => clearTimeout(timer)
  }, [orderId, resultIndicator])

  // ── Print / Download ────────────────────────────────────────────────────
  const openPrintWindow = () => {
    const w = window.open("", "_blank", "width=720,height=960")
    w.document.write(`<!DOCTYPE html><html><head>
      <title>Receipt — ${orderId}</title>
      <style>
        body{font-family:Georgia,serif;padding:48px;color:#111;max-width:640px;margin:0 auto}
        @media print{body{padding:32px}}
        .hdr{text-align:center;border-bottom:2px solid #111;padding-bottom:20px;margin-bottom:28px}
        .brand{font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#888;margin-bottom:8px}
        .ttl{font-size:26px;font-weight:700}
        .dt{font-size:13px;color:#666;margin-top:6px}
        .tag{text-align:center;background:#f0faf4;border-radius:8px;padding:14px;margin-bottom:28px;color:#1a7a40;font-weight:700;font-size:13px;letter-spacing:2px;text-transform:uppercase}
        table{width:100%;border-collapse:collapse;margin-bottom:24px}
        td{padding:10px 0;border-bottom:1px solid #eee;font-size:14px}
        td:first-child{color:#999;font-size:11px;text-transform:uppercase;letter-spacing:1px;width:42%}
        td:last-child{font-weight:600}
        .pbox{background:#fafafa;border:1px solid #eee;border-radius:8px;padding:20px;margin-bottom:24px}
        .pr{display:flex;justify-content:space-between;font-size:13px;color:#666;padding:5px 0}
        .tr{display:flex;justify-content:space-between;font-weight:700;font-size:20px;border-top:2px solid #111;margin-top:12px;padding-top:12px}
        .ftr{text-align:center;font-size:11px;color:#aaa;border-top:1px solid #eee;padding-top:20px;margin-top:24px}
      </style>
      </head><body>
      ${printRef.current?.innerHTML ?? ""}
      <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close()}<\/script>
      </body></html>`)
    w.document.close()
  }

  // ── Verifying ─────────────────────────────────────────────────────────
  if (status === "verifying") return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-14 h-14 border-4 border-stone-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-5" />
        <p className="text-stone-600 text-sm font-semibold tracking-wide uppercase">Confirming your payment…</p>
        <p className="text-stone-400 text-xs mt-2">Please wait, do not close this page</p>
      </div>
    </div>
  )

  // ── Failed ────────────────────────────────────────────────────────────
  if (status === "failed") return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-stone-900 mb-2">Payment Failed</h1>
        <p className="text-stone-500 text-sm mb-8">
          You have not been charged. Please try again or contact support.
        </p>
        <div className="flex flex-col gap-3">
          {/* Goes to hotels — NOT history.back() which loops back to MPGS page */}
          <a href="/hotels"
            className="w-full bg-rose-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-rose-600 transition text-center block">
            ← Try Again
          </a>
          <a href="/"
            className="w-full border border-stone-200 text-stone-600 py-3 rounded-xl text-sm font-semibold hover:bg-stone-50 transition text-center block">
            Back to Home
          </a>
        </div>
      </div>
    </div>
  )

  // ── Success ───────────────────────────────────────────────────────────
  const detailRows = [
    { label: "Order Reference", value: order.id,        mono: true  },
    { label: "Hotel",           value: order.hotel_name             },
    { label: "Room",            value: order.room_name              },
    { label: "Check-in",        value: order.check_in               },
    { label: "Check-out",       value: order.check_out              },
    { label: "Duration",        value: `${order.nights} night${order.nights !== 1 ? "s" : ""}` },
    { label: "Guests",          value: order.guests                 },
    { label: "Email",           value: order.email                  },
    { label: "Paid at",         value: order.paid_at                },
  ]

  return (
    <>
      {/* Hidden print template — uses inline styles so they survive the new window */}
      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <div className="hdr">
            <div className="brand">Search Dubai Hotels</div>
            <div className="ttl">Booking Confirmation</div>
            <div className="dt">{order.paid_at}</div>
          </div>
          <div className="tag">✓ Payment Successful</div>
          <table>
            <tbody>
              {detailRows.map(r => (
                <tr key={r.label}>
                  <td>{r.label}</td>
                  <td style={r.mono ? { fontFamily: "monospace" } : {}}>{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pbox">
            {[["Room subtotal", order.subtotal], ["Tax (5%)", order.tax], ["Tourism fee", order.tourism_fee]].map(([l, v]) => (
              <div key={l} className="pr"><span>{l}</span><span>AED {Number(v).toLocaleString()}</span></div>
            ))}
            <div className="tr"><span>Total Paid</span><span>AED {Number(order.amount).toLocaleString()}</span></div>
          </div>
          <div className="ftr">
            <div>Secured by Mastercard Payment Gateway Services</div>
            <div style={{ marginTop: 4 }}>Official payment receipt — please keep for your records.</div>
          </div>
        </div>
      </div>

      {/* Screen UI */}
      <div className="min-h-screen bg-stone-50">

        <div className="bg-emerald-600 text-white text-center py-3 text-sm font-semibold tracking-wide">
          ✓ &nbsp; Payment Confirmed — Your booking is secured!
        </div>

        <div className="max-w-2xl mx-auto px-4 py-10 space-y-5">

          {/* Hero card */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl px-8 py-10 text-white text-center shadow-lg">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-1">Booking Confirmed!</h1>
            <p className="text-emerald-100 text-sm">{order.paid_at}</p>
            <div className="mt-5 bg-white/20 rounded-xl px-6 py-3 inline-block">
              <p className="text-xs text-emerald-100 uppercase tracking-wider mb-1">Total Paid</p>
              <p className="text-3xl font-bold">AED {Number(order.amount).toLocaleString()}</p>
            </div>
          </div>

          {/* Booking details */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Booking Details</p>
            </div>
            <div className="divide-y divide-stone-100">
              {detailRows.map(row => (
                <div key={row.label} className="flex justify-between items-center px-6 py-3.5">
                  <span className="text-xs text-stone-400 uppercase tracking-wide">{row.label}</span>
                  <span className={`text-sm font-semibold text-stone-800 text-right max-w-xs truncate ${row.mono ? "font-mono text-xs" : ""}`}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Price breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Price Breakdown</p>
            </div>
            <div className="px-6 py-5 space-y-3">
              {[
                ["Room subtotal", order.subtotal],
                ["Tax (5%)",      order.tax],
                ["Tourism fee",   order.tourism_fee],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-sm text-stone-600">
                  <span>{label}</span>
                  <span>AED {Number(val).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between text-base font-bold text-stone-900 pt-3 border-t border-stone-100">
                <span>Total Paid</span>
                <span className="text-emerald-700">AED {Number(order.amount).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* 3 action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button onClick={openPrintWindow}
              className="flex items-center justify-center gap-2 bg-stone-900 text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-stone-800 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              Download Receipt
            </button>

            <button onClick={openPrintWindow}
              className="flex items-center justify-center gap-2 bg-white border border-stone-200 text-stone-800 py-3.5 rounded-xl text-sm font-semibold hover:bg-stone-50 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
              </svg>
              Print Receipt
            </button>

            <a href={order.booking_id ? `/dashboard/bookings/${order.booking_id}` : "/dashboard"}
              className="flex items-center justify-center gap-2 bg-rose-500 text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-rose-600 transition text-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              {order.booking_id ? "View Booking" : "My Dashboard"}
            </a>
          </div>

          {/* Back to home — always visible */}
          <a href="/"
            className="flex items-center justify-center w-full border border-stone-200 text-stone-600 py-3 rounded-xl text-sm font-semibold hover:bg-stone-100 transition">
            ← Back to Home
          </a>

          <p className="text-center text-xs text-stone-400 flex items-center justify-center gap-1.5 pb-6">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            Secured by Mastercard Payment Gateway Services
          </p>
        </div>
      </div>
    </>
  )
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-stone-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    }>
      <PaymentResultInner />
    </Suspense>
  )
}
