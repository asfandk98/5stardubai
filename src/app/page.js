// ❌ REMOVE "use client"

import ProductCard from "@/components/ProductCard";

const API = "https://api.alainhotel.com/api";

// ✅ SEO metadata (NOW VALID)
export const metadata = {
  title: "Best Hotels in Dubai | Book Cheap Hotels UAE",
  description:
    "Find and book hotels in Dubai, Abu Dhabi, and Sharjah at best prices.",
  keywords: ["hotels in dubai", "cheap hotels UAE", "abu dhabi hotels"],
};

// ✅ Fetch on SERVER (SEO BOOST)
async function getHotels() {
  try {
    const [f, r1, r2, r3] = await Promise.all([
      fetch(`${API}/hotels/featured`, { next: { revalidate: 60 } }),
      fetch(`${API}/hotels?location=AbuDhabi`, { next: { revalidate: 60 } }),
      fetch(`${API}/hotels?location=Sharjah`, { next: { revalidate: 60 } }),
      fetch(`${API}/hotels?location=Dubai`, { next: { revalidate: 60 } }),
    ]);

    const featured = await f.json();
    const abuDhabi = await r1.json();
    const sharjah = await r2.json();
    const dubai = await r3.json();

    return {
      featured: featured.data ?? featured ?? [],
      abuDhabi: abuDhabi.data ?? abuDhabi ?? [],
      sharjah: sharjah.data ?? sharjah ?? [],
      dubai: dubai.data ?? dubai ?? [],
    };
  } catch (err) {
    console.log(err);
    return { featured: [], abuDhabi: [], sharjah: [], dubai: [] };
  }
}

// ✅ Server Component
export default async function Home() {
  const { featured, abuDhabi, sharjah, dubai } = await getHotels();

  return (
    <main className="pt-[300px] md:pt-[200px] pb-10 space-y-10 max-w-7xl mx-auto px-4">

      {/* ✅ MAIN SEO HEADING */}
      <h1 className="text-2xl font-bold">
        Best Hotels in Dubai, Abu Dhabi & Sharjah
      </h1>

      {/* ✅ SEO CONTENT */}
      <section className="mt-6 text-gray-600">
        <h2 className="text-xl font-semibold">Book Hotels in Dubai</h2>
        <p>
          Discover the best hotels in Dubai with affordable prices, luxury stays,
          and family-friendly accommodations. Compare deals and book instantly.
        </p>
      </section>

      {/* ✅ DATA SECTIONS */}
      {featured.length > 0 && (
        <ProductCard
          subtitle="Handpicked for you"
          title="Featured Hotels"
          properties={featured}
        />
      )}

      <ProductCard title="Stay in Dubai" properties={dubai} />
      <ProductCard title="Popular homes in Abu Dhabi" properties={abuDhabi} />
      <ProductCard title="Available in Sharjah this weekend" properties={sharjah} />

    </main>
  );
}