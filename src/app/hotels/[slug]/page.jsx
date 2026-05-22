// src/app/hotels/[slug]/page.jsx

import HotelDetails from "@/components/hotels/HotelDetails"
import { notFound } from "next/navigation"

async function getHotel(slug) {
  const url = `https://5stardubai.com/backend/api/hotels/${slug}`
  console.log("🔍 Fetching hotel:", url)

  try {
    const res = await fetch(url, { cache: "no-store" })
    console.log("📡 Laravel response status:", res.status)

    if (!res.ok) {
      const text = await res.text()
      console.log("❌ Laravel error body:", text)
      return null
    }

    const data = await res.json()
    console.log("✅ Hotel found:", data?.title)
    return data
  } catch (err) {
    console.log("💥 Fetch threw:", err.message)
    return null
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const hotel = await getHotel(slug)
  if (!hotel) return { title: "Hotel Not Found" }
  return {
    title: hotel.title,
    description: `Book ${hotel.title} in ${hotel.location}. From AED ${hotel.price}/night.`,
  }
}

export default async function HotelDetailPage({ params }) {
  const { slug } = await params
  console.log("🏨 HotelDetailPage rendering for slug:", slug)

  const hotel = await getHotel(slug)

  if (!hotel) {
    console.log("🚫 Hotel not found, returning 404 for slug:", slug)
    return notFound()
  }

  return (
    <div className="py-10">
      <HotelDetails hotel={hotel} />
    </div>
  )
}
