import HotelDetails from "@/components/hotels/HotelDetails"

// Fetch hotel data
async function getHotel(slug) {
  const url = `https://api.alainhotel.com/api/hotels/${slug}`

  try {
    const res = await fetch(url, { cache: "no-store" })

    if (!res.ok) return null

    const json = await res.json()

    console.log("FULL API:", json)

    // ✅ FIX HERE
    return json?.data || json || null

  } catch (err) {
    console.log("ERROR:", err)
    return null
  }
}
// ✅ SEO Metadata
export async function generateMetadata({ params }) {
  const { slug } = await params
  const hotel = await getHotel(slug)

  if (!hotel) {
    return { title: "Hotel Not Found" }
  }

  const title = hotel.title || hotel.name || "Hotel in UAE"
  const location = hotel.location || "UAE"

  return {
    title: `${title} | Book Hotel in ${location}`,
    description: `Book ${title} in ${location}. Best price guaranteed. From AED ${hotel.price || 0}/night.`,
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