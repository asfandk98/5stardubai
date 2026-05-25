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
  return `https://api.alainhotel.com/backend/storage/${src}`
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
    />
  )
}

export default function HotelDetails({ hotel }) {
  const [selectedRoom,    setSelectedRoom]    = useState(null)
  const [bookingOpen,     setBookingOpen]     = useState(false)   // mobile booking drawer
  const [galleryOpen,     setGalleryOpen]     = useState(false)   // mobile gallery modal
  const [galleryIndex,    setGalleryIndex]    = useState(0)

  const handleSelectRoom = (room) => {
    setSelectedRoom(prev => prev?.id === room.id ? null : room)
  }

  const amenities = Array.isArray(hotel?.amenities) ? hotel.amenities : []

  const rooms = (hotel?.rooms || []).map(room => ({
    ...room,
    images: (room.images ?? []).map(img => ({
      ...img,
      url: img.url ?? resolveImage(img.path),
    })),
  }))

  const nearby  = hotel?.nearby || []
  const mainSrc = hotel?.image_url || hotel?.image

  const galleryImages = hotel?.images?.length
    ? hotel.images.map(img => img.path ?? img.image ?? img.url ?? "")
    : [mainSrc, mainSrc, mainSrc]

  while (galleryImages.length < 3) galleryImages.push(galleryImages[0])

  const basePrice = Number(selectedRoom?.price ?? hotel?.price ?? 0)

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-32 md:pb-10">

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <div className="mb-4 md:mb-6">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">{hotel?.title}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{hotel?.location}</p>
          {hotel?.stars && (
            <p className="text-xs text-gray-400 mt-0.5">{hotel.stars} ★ hotel</p>
          )}
          {hotel?.description && (
            <p className="text-sm text-gray-500 mt-2 leading-relaxed line-clamp-3 md:line-clamp-none">
              {hotel.description}
            </p>
          )}
        </div>

        {/* ── GALLERY ────────────────────────────────────────────────────── */}
        {/* Mobile: single image with overlay count */}
        <div className="md:hidden relative rounded-2xl overflow-hidden h-56 mb-6"
          onClick={() => { setGalleryIndex(0); setGalleryOpen(true) }}
        >
          <HotelImage src={galleryImages[0]} alt={hotel?.title} className="w-full h-full object-cover" />
          {galleryImages.length > 1 && (
            <button className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full font-medium">
              +{galleryImages.length - 1} photos
            </button>
          )}
        </div>

        {/* Desktop: 2-col grid */}
        <div className="hidden md:grid grid-cols-2 gap-3 rounded-2xl overflow-hidden h-80 mb-0">
          <HotelImage
            src={galleryImages[0]}
            alt={hotel?.title}
            className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition"
            onClick={() => { setGalleryIndex(0); setGalleryOpen(true) }}
          />
          <div className="grid grid-rows-2 gap-3">
            <HotelImage
              src={galleryImages[1]}
              alt={hotel?.title}
              className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition"
              onClick={() => { setGalleryIndex(1); setGalleryOpen(true) }}
            />
            <div className="relative">
              <HotelImage
                src={galleryImages[2]}
                alt={hotel?.title}
                className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition"
                onClick={() => { setGalleryIndex(2); setGalleryOpen(true) }}
              />
              {galleryImages.length > 3 && (
                <button
                  onClick={() => { setGalleryIndex(2); setGalleryOpen(true) }}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm font-semibold rounded-br-2xl"
                >
                  +{galleryImages.length - 3} more
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT + BOOKING SIDEBAR ─────────────────────────────── */}
        <div className="mt-8 md:mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">

          {/* Left: amenities + rooms */}
          <div className="md:col-span-2 space-y-8 md:space-y-10">

            {/* AMENITIES */}
            <div>
              <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Amenities</h2>
              {amenities.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3">
                  {amenities.map((amenity, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm text-gray-700"
                    >
                      <span className="text-rose-400 shrink-0">✓</span>
                      <span className="line-clamp-1">{amenity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No amenities listed</p>
              )}
            </div>

            {/* ROOMS */}
            <div>
              <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Bedrooms &amp; Room Types</h2>
              {rooms.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  {rooms.map(room => (
                    <RoomTypeCard
                      key={room.id}
                      room={room}
                      onSelect={(r) => {
                        handleSelectRoom(r)
                        // On mobile, open booking drawer when room is selected
                        if (window.innerWidth < 768) setBookingOpen(true)
                      }}
                      isSelected={selectedRoom?.id === room.id}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No rooms available</p>
              )}
            </div>

          </div>

          {/* Right: booking card — desktop only (sticky sidebar) */}
          <div className="hidden md:block">
            <div className="sticky top-32">
              <BookingCard hotel={hotel} selectedRoom={selectedRoom} />
            </div>
          </div>

        </div>

        {/* NEARBY */}
        {nearby.length > 0 && (
          <div className="mt-12 md:mt-16">
            <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Hotels Nearby</h2>
            <NearbyHotels hotels={nearby} />
          </div>
        )}
      </div>

      {/* ── MOBILE: sticky bottom reserve bar ─────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between gap-3 shadow-lg">
        <div>
          <p className="text-xs text-gray-400">
            {selectedRoom ? selectedRoom.name : "Select a room"}
          </p>
          <p className="text-base font-bold text-gray-900">
            AED {basePrice.toLocaleString()}
            <span className="text-xs text-gray-400 font-normal"> / night</span>
          </p>
        </div>
        <button
          onClick={() => setBookingOpen(true)}
          className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition shrink-0"
        >
          Reserve
        </button>
      </div>

      {/* ── MOBILE: booking drawer (slides up) ────────────────────────────── */}
      {bookingOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setBookingOpen(false)}
          />

          {/* Drawer */}
          <div className="relative bg-white rounded-t-3xl max-h-[92vh] overflow-y-auto shadow-2xl">
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            {/* Close button */}
            <button
              onClick={() => setBookingOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <X size={16} className="text-gray-600" />
            </button>

            <div className="px-4 pb-8 pt-2">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Reserve your stay</h3>
              <BookingCard hotel={hotel} selectedRoom={selectedRoom} />
            </div>
          </div>
        </div>
      )}

      {/* ── GALLERY MODAL (all screen sizes) ──────────────────────────────── */}
      {galleryOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0">
            <p className="text-white text-sm font-medium">
              {galleryIndex + 1} / {galleryImages.length}
            </p>
            <button
              onClick={() => setGalleryOpen(false)}
              className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center"
            >
              <X size={16} className="text-white" />
            </button>
          </div>

          {/* Main image */}
          <div className="flex-1 flex items-center justify-center px-4 relative">
            <button
              onClick={() => setGalleryIndex(i => (i - 1 + galleryImages.length) % galleryImages.length)}
              className="absolute left-2 w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-lg transition"
            >‹</button>

            <img
              src={resolveImage(galleryImages[galleryIndex])}
              alt={hotel?.title}
              className="max-h-full max-w-full object-contain rounded-lg"
            />

            <button
              onClick={() => setGalleryIndex(i => (i + 1) % galleryImages.length)}
              className="absolute right-2 w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-lg transition"
            >›</button>
          </div>

          {/* Thumbnail strip */}
          <div className="flex gap-2 px-4 py-3 overflow-x-auto shrink-0">
            {galleryImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setGalleryIndex(i)}
                className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition ${
                  i === galleryIndex ? "border-rose-500" : "border-transparent opacity-60"
                }`}
              >
                <img src={resolveImage(img)} className="w-full h-full object-cover" alt="" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
