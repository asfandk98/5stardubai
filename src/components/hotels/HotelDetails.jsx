"use client"
// src/components/hotels/HotelDetails.jsx

import { useState } from "react"
import BookingCard from "./BookingCard"
import RoomTypeCard from "./RoomTypeCard"
import NearbyHotels from "./NearbyHotels"
import { X } from "lucide-react"

function resolveImage(src) {
  if (!src) return null
  if (src.startsWith("http")) return src
  return `https://api.alainhotel.com/storage/${src}`
}

function HotelImage({ src, alt, className }) {
  const [failed, setFailed] = useState(false)
  const url = resolveImage(src)

  if (!url || failed) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center text-gray-300 text-sm`}>
        🏨
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  )
}

export default function HotelDetails({ hotel }) {
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)

  const amenities = Array.isArray(hotel?.amenities) ? hotel.amenities : []

  const rooms = (hotel?.rooms || []).map(room => ({
    ...room,
    images: (room.images ?? []).map(img => ({
      ...img,
      url: img.url ?? resolveImage(img.path),
    })),
  }))

  const nearby = hotel?.nearby || []
  const mainSrc = hotel?.image_url || hotel?.image

  const galleryImages = hotel?.images?.length
    ? hotel.images.map(img => img.path ?? img.image ?? img.url ?? "")
    : [mainSrc, mainSrc, mainSrc]

  while (galleryImages.length < 3) galleryImages.push(galleryImages[0])

  const basePrice = Number(selectedRoom?.price ?? hotel?.price ?? 0)

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-32 md:pb-10">

        {/* HEADER */}
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            {hotel?.title}
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            {hotel?.location}
          </p>

          {hotel?.stars && (
            <p className="text-xs text-gray-400 mt-1">
              {hotel.stars} star hotel
            </p>
          )}

          {/* SEO TEXT */}
          <p className="text-sm text-gray-600 mt-3 leading-relaxed">
            Book your stay at {hotel.title} in {hotel.location}. Discover comfortable rooms, premium amenities, and the best hotel deals. Whether you're looking for luxury hotels, budget stays, or family-friendly accommodations in {hotel.location}, {hotel.title} offers a perfect experience for every traveler.
          </p>

          {/* TRUST BULLETS */}
          <ul className="text-sm text-gray-600 mt-3 list-disc ml-5">
            <li>Best price guarantee</li>
            <li>Free cancellation options</li>
            <li>Secure online booking</li>
          </ul>
        </header>

        {/* GALLERY */}
        <div className="md:hidden relative rounded-2xl overflow-hidden h-56 mb-6"
          onClick={() => { setGalleryIndex(0); setGalleryOpen(true) }}
        >
          <HotelImage src={galleryImages[0]} alt={hotel?.title} className="w-full h-full object-cover" />
        </div>

        <div className="hidden md:grid grid-cols-2 gap-3 rounded-2xl overflow-hidden h-80">
          <HotelImage src={galleryImages[0]} alt={hotel?.title} className="w-full h-full object-cover" />
          <div className="grid grid-rows-2 gap-3">
            <HotelImage src={galleryImages[1]} alt={hotel?.title} className="w-full h-full object-cover" />
            <HotelImage src={galleryImages[2]} alt={hotel?.title} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* MAIN */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* LEFT */}
          <div className="md:col-span-2 space-y-10">

            {/* AMENITIES */}
            <section>
              <h2 className="text-xl font-semibold mb-4">
                Hotel Amenities at {hotel.title}
              </h2>

              {amenities.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {amenities.map((amenity, i) => (
                    <div key={i} className="flex items-center gap-2 bg-gray-50 border rounded-xl px-4 py-3 text-sm">
                      ✓ {amenity}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No amenities listed</p>
              )}
            </section>

            {/* ROOMS */}
            <section>
              <h2 className="text-xl font-semibold mb-4">
                Rooms & Suites at {hotel.title}
              </h2>

              {rooms.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-6">
                  {rooms.map(room => (
                    <RoomTypeCard
                      key={room.id}
                      room={room}
                      onSelect={(r) => {
                        setSelectedRoom(r)
                        if (window.innerWidth < 768) setBookingOpen(true)
                      }}
                      isSelected={selectedRoom?.id === room.id}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No rooms available</p>
              )}
            </section>

          </div>

          {/* RIGHT */}
          <aside className="hidden md:block">
            <div className="sticky top-32">
              <BookingCard hotel={hotel} selectedRoom={selectedRoom} />
            </div>
          </aside>

        </div>

        {/* NEARBY */}
        {nearby.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-semibold mb-4">
              Hotels Near {hotel.location}
            </h2>

            {/* SEO TEXT */}
            <p className="text-sm text-gray-600 mb-4">
              Explore top-rated hotels near {hotel.location}, including luxury stays,
              budget-friendly options, and family accommodations.
            </p>

            <NearbyHotels hotels={nearby} />
          </section>
        )}
      </div>

      {/* MOBILE BOOKING BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 flex justify-between">
        <div>
          <p className="text-xs text-gray-400">
            {selectedRoom ? selectedRoom.name : "Select a room"}
          </p>
          <p className="font-bold">
            AED {basePrice.toLocaleString()}
          </p>
        </div>

        <button
          onClick={() => setBookingOpen(true)}
          className="bg-rose-500 text-white px-6 py-2 rounded-xl"
        >
          Reserve
        </button>
      </div>

      {/* BOOKING DRAWER */}
      {bookingOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setBookingOpen(false)} />
          <div className="bg-white rounded-t-3xl p-4 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setBookingOpen(false)} className="mb-4">
              <X />
            </button>
            <BookingCard hotel={hotel} selectedRoom={selectedRoom} />
          </div>
        </div>
      )}

    </>
  )
}