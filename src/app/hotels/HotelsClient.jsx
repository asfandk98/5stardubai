"use client"
// src/app/hotels/HotelsClient.jsx

import { useFilters } from "@/app/context/FiltersContext"
import { useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import HotelListing from "@/components/hotels/HotelListing"
import MobileSearchBar from "@/components/hotels/MobileSearchBar"
import FilterModal from "@/components/hotels/FilterModal"

export default function HotelsClient() {
  const { filters, setFilters } = useFilters()
  const searchParams = useSearchParams()
  const [filterOpen, setFilterOpen] = useState(false)

  // Read URL params from header search and merge into FiltersContext
  useEffect(() => {
    const location  = searchParams.get("location")
    const guests    = searchParams.get("guests")
    const check_in  = searchParams.get("check_in")
    const check_out = searchParams.get("check_out")

    if (location || guests || check_in || check_out) {
      setFilters(prev => ({
        ...prev,
        ...(location  && { location }),
        ...(guests    && { guests: Number(guests) }),
        ...(check_in  && { check_in }),
        ...(check_out && { check_out }),
      }))
    }
  }, [searchParams])

  const stableFilters = useMemo(() => filters, [JSON.stringify(filters)])

  return (
    <main>

      {/* MOBILE ONLY: Search bar + Filter button */}
      <div className="md:hidden fixed top-[60px] left-0 right-0 z-40 bg-white border-b border-gray-100 px-4 py-3 shadow-sm">
        <MobileSearchBar onOpenFilters={() => setFilterOpen(true)} />
      </div>

      {/* FILTER MODAL */}
      <FilterModal
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={(newFilters) => {
          setFilters(prev => ({ ...prev, ...newFilters }))
          setFilterOpen(false)
        }}
      />

      {/* HOTEL LISTING */}
      <div className="pt-[280px] md:pt-[160px] px-4 md:px-6 max-w-7xl mx-auto">
        <HotelListing filters={stableFilters} />
      </div>

    </main>
  )
}
