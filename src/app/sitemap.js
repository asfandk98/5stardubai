// src/app/sitemap.js

const BASE_URL = "https://api.alainhotel.com"
const API      = process.env.NEXT_PUBLIC_API_URL 

export default async function sitemap() {
  // ── Static pages ────────────────────────────────────────────────────────────
  const staticPages = [
    { url: `${BASE_URL}`,          priority: 1.0,  changeFrequency: "daily"   },
    { url: `${BASE_URL}/hotels`,   priority: 0.9,  changeFrequency: "daily"   },
    { url: `${BASE_URL}/blog`,     priority: 0.8,  changeFrequency: "weekly"  },
    { url: `${BASE_URL}/contact`,  priority: 0.5,  changeFrequency: "monthly" },
    { url: `${BASE_URL}/about`,    priority: 0.5,  changeFrequency: "monthly" },
  ]

  // ── Dynamic hotel pages ──────────────────────────────────────────────────────
  let hotelPages = []
  try {
    const res   = await fetch(`${API}/hotels?per_page=500`)
    const data  = await res.json()
    const hotels = Array.isArray(data) ? data : data.data ?? []

    hotelPages = hotels.map(hotel => ({
      url:             `${BASE_URL}/hotels/${hotel.slug}`,
      lastModified:    hotel.updated_at ?? new Date(),
      priority:        0.8,
      changeFrequency: "weekly",
    }))
  } catch {
    console.error("Sitemap: failed to fetch hotels")
  }

  // ── Dynamic blog pages ───────────────────────────────────────────────────────
  let blogPages = []
  try {
    const res  = await fetch(`${API}/blog/posts?per_page=500&status=published`)
    const data = await res.json()
    const posts = Array.isArray(data) ? data : data.data ?? []

    blogPages = posts.map(post => ({
      url:             `${BASE_URL}/blog/${post.slug}`,
      lastModified:    post.updated_at ?? new Date(),
      priority:        0.6,
      changeFrequency: "monthly",
    }))
  } catch {
    console.error("Sitemap: failed to fetch blog posts")
  }

  return [...staticPages, ...hotelPages, ...blogPages]
}