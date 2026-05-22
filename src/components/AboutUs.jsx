'use client'

import { Building2, Users, Globe, Award, Shield, Heart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function AboutPage() {
  const stats = [
    { label: "Hotels Listed", value: "500+", icon: Building2 },
    { label: "Happy Customers", value: "50,000+", icon: Users },
    { label: "Cities Covered", value: "25+", icon: Globe },
    { label: "Years Experience", value: "10+", icon: Award },
  ]

  const values = [
    {
      icon: Shield,
      title: "Trust & Security",
      description: "Your booking details and payments are protected with bank-level security encryption."
    },
    {
      icon: Heart,
      title: "Customer First",
      description: "24/7 support and personalized recommendations to make your stay unforgettable."
    },
    {
      icon: Award,
      title: "Quality Standards",
      description: "Every hotel is verified and reviewed to ensure you get the best experience."
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Access to premium hotels across UAE and expanding to new destinations."
    },
  ]

  const team = [
    {
      name: "Ahmed Al Mazroui",
      role: "Founder & CEO",
      image: "https://via.placeholder.com/300x300?text=CEO",
      bio: "Hospitality veteran with 15+ years of experience"
    },
    {
      name: "Sarah Johnson",
      role: "Chief Technology Officer",
      image: "https://via.placeholder.com/300x300?text=CTO",
      bio: "Tech innovator passionate about seamless experiences"
    },
    {
      name: "Omar Hassan",
      role: "Head of Operations",
      image: "https://via.placeholder.com/300x300?text=COO",
      bio: "Ensuring excellence in every booking"
    },
    {
      name: "Layla Ahmed",
      role: "Customer Experience Lead",
      image: "https://via.placeholder.com/300x300?text=CXO",
      bio: "Dedicated to making every stay memorable"
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-rose-500 to-rose-600 text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Your Gateway to Unforgettable Stays
          </h1>
          <p className="text-lg md:text-xl text-rose-100 max-w-2xl mx-auto">
            We connect travelers with the finest hotels across the UAE, making luxury accommodation accessible and booking effortless.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-b">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-rose-100 rounded-full mb-3">
                  <stat.icon className="w-6 h-6 text-rose-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Story</h2>
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
            <p>
              Founded in 2014, Search Dubai Hotels began with a simple mission: to make finding and booking the perfect hotel as easy as a few clicks. What started as a small team passionate about hospitality has grown into the UAE's leading hotel booking platform.
            </p>
            <p>
              We understand that where you stay defines your travel experience. That's why we've partnered with over 500 premium hotels across Dubai, Abu Dhabi, Sharjah, and beyond—from luxurious five-star resorts to charming boutique properties.
            </p>
            <p>
              Today, we're proud to have helped over 50,000 travelers discover their perfect stay. Our platform combines cutting-edge technology with personalized service, ensuring every booking is seamless, secure, and tailored to your needs.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">What We Stand For</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-rose-100 rounded-lg mb-4">
                  <value.icon className="w-6 h-6 text-rose-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Meet Our Team</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            A diverse group of hospitality and technology experts committed to revolutionizing hotel booking
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="relative w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">{member.name}</h3>
                <p className="text-rose-600 text-sm mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-rose-500 to-rose-600 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Perfect Stay?</h2>
          <p className="text-rose-100 mb-8 text-lg">
            Join thousands of happy travelers who trust us with their hotel bookings
          </p>
          
          <Link
            href="/hotels"
            className="inline-block bg-white text-rose-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
          >
            Browse Hotels
          </Link>
        </div>
      </section>

    </div>
  )
}
