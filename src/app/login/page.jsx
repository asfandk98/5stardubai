'use client'
// src/app/login/page.jsx
// Adds redirect-back-after-login using sessionStorage

import { useState } from "react"
import { loginUser } from "../../../lib/auth"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import Link from "next/link"


export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await loginUser(form)
      const { token, user } = res.data

      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))
      localStorage.setItem("role", user.role)

      window.dispatchEvent(new Event("auth-change"))

      toast.success(`Welcome back, ${user.name}! 🎉`)

      if (user.role === "admin") {
        router.push("/admin/dashboard")
        return
      }

      const redirectTo = sessionStorage.getItem("redirect_after_login")
      sessionStorage.removeItem("redirect_after_login")
      router.push(redirectTo ?? "/")

    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 relative">
      {/* Add padding top to account for fixed header */}
      <div className="w-full max-w-md pt-20">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-bold">
              <span className="text-rose-500">Search</span>
              <span className="text-gray-900">Dubai</span>
            </span>
          </Link>
        </div>

        {/* Form Card */}
        <form 
          onSubmit={handleLogin} 
          className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border relative z-10"
        >
          
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center text-gray-900">
            Welcome Back
          </h2>
          <p className="text-center text-sm text-gray-500 mb-6">
            Sign in to complete your booking
          </p>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition text-sm sm:text-base"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <a href="/forgot-password" className="text-xs text-rose-500 hover:text-rose-600 transition">
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition text-sm sm:text-base"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 sm:py-3.5 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/register" className="text-rose-500 hover:text-rose-600 font-semibold transition">
              Sign up
            </Link>
          </p>
        </form>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}