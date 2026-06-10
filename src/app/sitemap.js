// src/app/sitemap.js

const BASE_URL = "https://www.alainhotel.com"
const API      = "https://api.alainhotel.com/api"

// ── Force dynamic — don't try to build at compile time ──────────────────────
export const dynamic        = "force-dynamic"
export const revalidate     = 3600 // rebuild every 1 hour

export default async function sitemap() {
  // ── Static pages ────────────────────────────────────────────────────────────
  const staticPages = [
    { url: `${BASE_URL}`,         priority: 1.0, changeFrequency: "daily"   },
    { url: `${BASE_URL}/hotels`,  priority: 0.9, changeFrequency: "daily"   },
    { url: `${BASE_URL}/blog`,    priority: 0.8, changeFrequency: "weekly"  },
    { url: `${BASE_URL}/contact`, priority: 0.5, changeFrequency: "monthly" },
  ]

  // ── Hotels ───────────────────────────────────────────────────────────────────
  let hotelPages = []
  try {
    const res = await fetch(`${API}/hotels?per_page=500`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(10000), // 10s timeout
    })
    const data   = await res.json()
    const hotels = Array.isArray(data) ? data : data.data ?? []

    hotelPages = hotels.map(h => ({
      url:             `${BASE_URL}/hotels/${h.slug}`,
      lastModified:    h.updated_at ? new Date(h.updated_at) : new Date(),
      priority:        0.8,
      changeFrequency: "weekly",
    }))
  } catch (e) {
    console.error("Sitemap hotels failed:", e.message)
  }

  // ── Blog posts ────────────────────────────────────────────────────────────────
  let blogPages = []
  try {
    const res = await fetch(`${API}/blog/posts?per_page=500&status=published`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(10000), // 10s timeout
    })
    const data  = await res.json()
    const posts = Array.isArray(data) ? data : data.data ?? []

    blogPages = posts.map(p => ({
      url:             `${BASE_URL}/blog/${p.slug}`,
      lastModified:    p.updated_at ? new Date(p.updated_at) : new Date(),
      priority:        0.6,
      changeFrequency: "monthly",
    }))
  } catch (e) {
    console.error("Sitemap blog failed:", e.message)
  }

  return [...staticPages, ...hotelPages, ...blogPages]
}