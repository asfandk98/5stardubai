'use client'

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { FiShare2 } from "react-icons/fi"

const API = "https://5stardubai.com/backend/api"

export default function BlogDetail() {
  const { slug }           = useParams()
  const [post,     setPost]     = useState(null)
  const [related,  setRelated]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return

    // Fetch post by slug
    fetch(`${API}/blog/posts/slug/${slug}`)
      .then(r => {
        if (!r.ok) throw new Error("Not found")
        return r.json()
      })
      .then(data => {
        setPost(data)
        // Fetch related posts (same category or just latest)
        fetch(`${API}/blog/posts?limit=4`)
          .then(r => r.json())
          .then(all => {
            const list = Array.isArray(all) ? all : all.data ?? []
            setRelated(list.filter(p => p.slug !== slug).slice(0, 3))
          })
        setLoading(false)
      })
      .catch(() => {
        setNotFound(true)
        setLoading(false)
      })
  }, [slug])

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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: post.title, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied!")
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (notFound || !post) return (
    <div className="pt-24 text-center text-gray-500">Post not found</div>
  )

  return (
    <main className="bg-white text-gray-900 pt-24">

      {/* HERO */}
      <section className="max-w-4xl mx-auto px-6 md:px-12 py-10">

        {/* Category + date */}
        <div className="flex items-center gap-3 mb-3">
          {post.category && (
            <span className="text-xs font-medium bg-rose-50 text-rose-500 px-3 py-1 rounded-full">
              {post.category.name}
            </span>
          )}
          <p className="text-sm text-gray-400">
            {formatDate(post.publish_date ?? post.created_at)}
          </p>
        </div>

        <h1 className="text-3xl md:text-5xl font-semibold leading-tight mb-6">
          {post.title}
        </h1>

        {/* Author */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center text-white font-bold">
            A
          </div>
          <p className="text-sm font-medium">Admin</p>
        </div>

        {/* Cover Image */}
        {post.featured_image && (
          <div className="relative w-full h-[300px] md:h-[450px] rounded-xl overflow-hidden">
            <img
              src={getImageUrl(post.featured_image)}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={e => { e.target.src = "/images/hotel-dubai.webp" }}
            />
          </div>
        )}

        {/* Share */}
        <div className="flex justify-end mt-4">
          <button onClick={handleShare} className="flex items-center gap-2 text-gray-600 hover:text-black transition">
            <FiShare2 /> Share
          </button>
        </div>

      </section>

      {/* CONTENT */}
      <section className="max-w-3xl mx-auto px-6 md:px-12 pb-16">
        <div
          className="prose prose-lg max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </section>

      {/* TAGS */}
      {post.tags && (
        <section className="max-w-3xl mx-auto px-6 md:px-12 pb-10">
          <div className="flex flex-wrap gap-2">
            {post.tags.split(",").map((tag, i) => (
              <span key={i} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                #{tag.trim()}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* RELATED POSTS */}
      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 md:px-12 pb-20">
          <h2 className="text-2xl font-semibold mb-6">Related Posts</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((item) => (
              <Link key={item.slug} href={`/blog/${item.slug}`}>
                <div className="group cursor-pointer">
                  <div className="relative h-[200px] rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={getImageUrl(item.featured_image)}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={e => { e.target.src = "/images/hotel-dubai.webp" }}
                    />
                  </div>
                  <h3 className="mt-3 font-medium group-hover:underline line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {formatDate(item.publish_date ?? item.created_at)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

    </main>
  )
}
