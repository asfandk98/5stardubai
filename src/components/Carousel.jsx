'use client'
import { useRef, useState, useEffect } from "react"

export default function Carousel({ children, autoScroll = true }) {
  const rowRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const total = children.length

  // 👉 Duplicate for infinite illusion
  const items = [...children, ...children]

  // 👉 Detect active index
  const handleScroll = () => {
    const el = rowRef.current
    if (!el) return

    const cardWidth = el.firstChild?.offsetWidth || 1
    const index = Math.round(el.scrollLeft / cardWidth)

    setActiveIndex(index % total)

    // 👉 Infinite jump (no glitch)
    if (index >= total) {
      el.scrollLeft = 0
    }
  }

  // 👉 Auto scroll
  useEffect(() => {
    if (!autoScroll) return

    const el = rowRef.current
    if (!el) return

    const interval = setInterval(() => {
      if (isPaused) return

      const cardWidth = el.firstChild?.offsetWidth || 1
      el.scrollBy({ left: cardWidth, behavior: "smooth" })
    }, 2500)

    return () => clearInterval(interval)
  }, [isPaused, autoScroll])

  return (
    <div className="relative">

      {/* ROW */}
      <div
        ref={rowRef}
        onScroll={handleScroll}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth px-1"
      >
        {items.map((child, i) => (
          <div
            key={i}
            className="snap-start shrink-0 w-[75%] sm:w-[45%] md:w-[30%]"
          >
            {child}
          </div>
        ))}
      </div>

      {/* DOTS */}
      <div className="flex justify-center mt-2 gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              activeIndex === i
                ? "w-4 bg-rose-500"
                : "w-1.5 bg-gray-300"
            }`}
          />
        ))}
      </div>

    </div>
  )
}