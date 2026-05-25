'use client'
import { Heart, Star } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Carousel from "./Carousel"
import { SkeletonCard } from "./SkeletonCard"
import { addToWishlist, removeFromWishlist, getWishlist } from "../../lib/wishlist"

function toUrlSlug(slug) {
  return slug?.toLowerCase().replace(/\s+/g, "-") ?? ""
}

function resolveImage(item) {
  if (item?.image_url?.startsWith("http")) return item.image_url
  if (item?.image?.startsWith("http")) return item.image
  if (item?.image) return `https://api.alainhotel.com/storage/${item.image}`
  return null
}

export default function ProductCard({ title, subtitle, properties, loading }) {
  const router = useRouter()
  const [wishlist, setWishlist] = useState({})

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getWishlist()
        const items = Array.isArray(res) ? res : res?.data ?? []
        const obj = {}
        items.forEach(i => { obj[i.hotel_id] = true })
        setWishlist(obj)
      } catch {}
    }
    load()
  }, [])

  const toggleWishlist = async (e, item) => {
    e.preventDefault()
    e.stopPropagation()

    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    if (wishlist[item.id]) {
      await removeFromWishlist(item.id)
      setWishlist(prev => ({ ...prev, [item.id]: false }))
    } else {
      await addToWishlist(item.id)
      setWishlist(prev => ({ ...prev, [item.id]: true }))
    }
  }

  if (loading) {
    return (
      <div className="px-4">
        <Carousel>
  {[...Array(4)].map((_, i) => (
    <SkeletonCard key={i} />
  ))}
</Carousel>
      </div>
    )
  }

  if (!properties?.length) return null

  return (
    <section className="py-4 px-4">

      {/* HEADER */}
      <div className="mb-4">
        {subtitle && (
          <p className="text-rose-500 text-xs font-semibold uppercase">
            {subtitle}
          </p>
        )}
        <h2 className="text-lg font-bold">{title}</h2>
      </div>

      {/* CAROUSEL */}
      <Carousel>
        {properties.map(item => {
          const img = resolveImage(item)

          const isOnOffer = item.is_on_offer === true
          const activePrice = isOnOffer
            ? Number(item.active_price ?? item.price)
            : Number(item.price)

          const origPrice = isOnOffer
            ? Number(item.original_price ?? item.price)
            : null

          return (
            <Link
              key={item.id}
              href={`/hotels/${toUrlSlug(item.slug)}`}
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm w-full">

                {/* IMAGE */}
                <div className="relative aspect-[4/3] bg-gray-100">

                  {img ? (
                    <img
                      src={img}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover blur-sm scale-105 transition-all duration-500"
                      onLoad={(e) => {
                        e.target.classList.remove("blur-sm", "scale-105")
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-3xl text-gray-300">
                      🏨
                    </div>
                  )}

                  {/* Wishlist */}
                  <button
                    onClick={(e) => toggleWishlist(e, item)}
                    className="absolute top-2 right-2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center"
                  >
                    <Heart
                      size={14}
                      className={
                        wishlist[item.id]
                          ? "fill-rose-500 text-rose-500"
                          : "text-gray-400"
                      }
                    />
                  </button>
                </div>

                {/* CONTENT */}
                <div className="p-3">

                  <div className="flex justify-between">
                    <h3 className="text-sm font-semibold line-clamp-1">
                      {item.title}
                    </h3>

                    {item.rating && (
                      <div className="flex items-center gap-1 text-xs">
                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                        {item.rating}
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 line-clamp-1">
                    {item.location}
                  </p>

                  <div className="mt-2">
                    <span className="font-bold text-sm">
                      AED {activePrice}
                    </span>

                    {origPrice && (
                      <span className="text-xs text-gray-400 line-through ml-2">
                        AED {origPrice}
                      </span>
                    )}
                  </div>

                </div>
              </div>
            </Link>
          )
        })}
      </Carousel>

    </section>
  )
}