'use client'
// src/app/dashboard/layout.jsx

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import UserSidebar from "./components/UserSidebar"

const HEADER_HEIGHT = 140

export default function DashboardLayout({ children }) {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const role  = localStorage.getItem("role")
    if (!token) {
      sessionStorage.setItem("redirect_after_login", window.location.pathname)
      router.push("/login")
      return
    }
    if (role === "admin") router.push("/admin/dashboard")
  }, [])

  return (
    <div
      className="flex bg-[#0d1117] min-h-screen"
      style={{ paddingTop: HEADER_HEIGHT }}
    >
      {/* Sidebar — desktop: sticky column | mobile: fixed drawer */}
      <UserSidebar />

      {/* Main content
          md:ml-60 = clear expanded desktop sidebar (w-60)
          On mobile sidebar is a fixed drawer so no ml needed (ml-0) */}
      <main className="flex-1 ml-0 md:ml-60 overflow-x-hidden transition-all duration-300">
        <div className="p-4 pt-14 md:p-6 md:pt-6 lg:p-8 max-w-6xl pb-24">
          {children}
        </div>
      </main>
    </div>
  )
}
