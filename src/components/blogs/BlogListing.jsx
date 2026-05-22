'use client'

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

const API = "https://5stardubai.com/backend/api"

export default function BlogListing() {
  const [posts,   setPosts]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/blog/posts`)
      .then(r => r.json())
      .then(data => {
        setPosts(Array.isArray(data) ? data : data.data ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const getImageUrl = (path) => {
    if (!path) return "/images/hotel-dubai.webp"
    if (path.startsWith("http")) return path
    return `https://5stardubai.com/backend/storage/${path}`
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ""
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric"
    })
  }

  return (
    <main className="bg-white text-gray-900 pt-24">

      {/* HERO */}
      <section className="text-center px-6 md:px-12 py-16 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-semibold mb-4">Travel Blog</h1>
        <p className="text-gray-500 text-lg">Tips, guides & inspiration for your next stay</p>
      </section>

      {/* BLOG GRID */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-20">

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-400 py-20">No posts yet</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <div className="group cursor-pointer">

                  {/* Image */}
                  <div className="relative h-[240px] rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={getImageUrl(post.featured_image)}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={e => { e.target.src = "/images/hotel-dubai.webp" }}
                    />
                    {post.category && (
                      <span className="absolute top-3 left-3 bg-white text-xs font-medium px-3 py-1 rounded-full shadow">
                        {post.category.name}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="mt-4">
                    <p className="text-sm text-gray-400">
                      {formatDate(post.publish_date ?? post.created_at)}
                      {post.tags && ` • ${post.tags}`}
                    </p>

                    <h2 className="text-lg font-semibold mt-1 group-hover:underline line-clamp-2">
                      {post.title}
                    </h2>

                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                      {post.excerpt}
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-2 mt-3">
                      <div className="w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center text-white text-xs font-bold">
                        A
                      </div>
                      <span className="text-sm text-gray-600">Admin</span>
                    </div>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

    </main>
  )
}
