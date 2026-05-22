// src/app/hotels/page.jsx
// NO 'use client' here — this is a server component wrapper
import { Suspense } from "react"
import HotelsClient from "./HotelsClient"

export default function HotelsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <HotelsClient />
    </Suspense>
  )
}
