"use client"
// src/app/payment/cancelled/page.jsx
// MPGS redirects here when user clicks Cancel on the payment page

export default function PaymentCancelledPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-10 max-w-md w-full text-center">

        {/* Icon */}
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-stone-900 mb-2">Payment Cancelled</h1>
        <p className="text-stone-500 text-sm mb-8">
          You cancelled the payment. You have not been charged.
          Your booking has not been confirmed.
        </p>

        <div className="flex flex-col gap-3">
          <a
            href="/hotels"
            className="w-full bg-rose-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-rose-600 transition text-center block"
          >
            Browse Hotels
          </a>
          <a
            href="/dashboard/bookings"
            className="w-full border border-stone-200 text-stone-600 py-3 rounded-xl text-sm font-semibold hover:bg-stone-50 transition text-center block"
          >
            My Bookings
          </a>
          <a
            href="/"
            className="w-full text-stone-400 py-2 text-sm hover:text-stone-600 transition text-center block"
          >
            ← Back to Home
          </a>
        </div>

      </div>
    </div>
  )
}
