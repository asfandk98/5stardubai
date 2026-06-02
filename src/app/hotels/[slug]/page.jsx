import HotelDetails from "@/components/hotels/HotelDetails"

// Fetch hotel data
async function getHotel(slug) {
  const url = `https://api.alainhotel.com/api/hotels/${slug}`
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

// ✅ SEO Metadata
export async function generateMetadata({ params }) {
  const hotel = await getHotel(params.slug)

  if (!hotel) {
    return {
      title: "Hotel not found | Alain Hotel",
    }
  }

  return {
    title: `${hotel.title} in ${hotel.location} | Book Now`,
    description:
      hotel.description?.slice(0, 155) ||
      `Book ${hotel.title} in ${hotel.location}. Best price guaranteed.`,

    openGraph: {
      title: hotel.title,
      description: hotel.description,
      images: [hotel.image],
    },
  }
}

export default async function HotelPage({ params }) {
  const hotel = await getHotel(params.slug)

  if (!hotel) {
    return <div>Hotel not found</div>
  }

  return (
    <>
      {/* ✅ STRUCTURED DATA */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Hotel",
            name: hotel.title,
            image: hotel.image,
            description: hotel.description,
            address: {
              "@type": "PostalAddress",
              addressLocality: hotel.location,
              addressCountry: "AE",
            },
            aggregateRating: hotel.rating && {
              "@type": "AggregateRating",
              ratingValue: hotel.rating,
              reviewCount: hotel.reviews_count || 10,
            },
            offers: {
              "@type": "Offer",
              price: hotel.price,
              priceCurrency: "AED",
              availability: "https://schema.org/InStock",
            },
          }),
        }}
      />

      {/* ✅ SEO TEXT CONTENT */}
      <section className="max-w-7xl mx-auto px-4 mt-6 mb-6">
        <h1 className="text-2xl font-bold">
          {hotel.title} in {hotel.location}
        </h1>

        <p className="text-gray-600 mt-2">
          Book your stay at {hotel.title}, one of the best hotels in{" "}
          {hotel.location}. Enjoy comfortable rooms, great amenities,
          and competitive prices starting from AED{" "}
          {Number(hotel.price).toLocaleString()} per night.
        </p>
      </section>

      {/* ✅ YOUR EXISTING UI */}
      <HotelDetails hotel={hotel} />
    </>
  )
}