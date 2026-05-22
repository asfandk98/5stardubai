'use client'
// src/app/admin/components/AdminTopBar.jsx

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { LogOut } from "lucide-react"
import { toast } from "react-hot-toast"

function getBreadcrumb(pathname) {
  const parts = pathname.split("/").filter(Boolean)
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1))
}

export default function AdminTopBar() {
  const router   = useRouter()
  const pathname = usePathname()
  const [user,       setUser]       = useState(null)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user")
      if (raw) setUser(JSON.parse(raw))
    } catch {}
  }, [])

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch("https://5stardubai.com/backend/api/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      toast.success("Logged out successfully")
    } catch { toast.error("Logout failed") }
    localStorage.clear()
    window.dispatchEvent(new Event("auth-change"))
    router.replace("/login")
  }

  const crumbs  = getBreadcrumb(pathname)
  const initials = user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() ?? "AD"

  return (
    <header className="h-16 shrink-0 flex items-center justify-between
      bg-[#0d1117] border-b border-white/[0.06]
      px-4 md:px-8
    ">
      {/* Breadcrumb — left-pad on mobile to clear hamburger button */}
      <div className="flex items-center gap-2 text-xs text-gray-600 pl-10 md:pl-0">
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-2">
            <span className={i === crumbs.length - 1 ? "text-gray-300" : "text-gray-600"}>
              {crumb}
            </span>
            {i < crumbs.length - 1 && <span className="text-gray-700">/</span>}
          </span>
        ))}
      </div>

      {/* Right: user + logout */}
      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-white leading-tight">{user.name}</p>
              <p className="text-xs text-gray-600 leading-tight">{user.email}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
          </div>
        )}

        <div className="w-px h-5 bg-white/[0.08]" />

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm
            text-gray-500 hover:text-red-400 hover:bg-red-500/10
            border border-transparent hover:border-red-500/20
            transition-all disabled:opacity-50"
        >
          {loggingOut
            ? <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
            : <LogOut size={15} />
          }
          <span className="hidden sm:inline">{loggingOut ? "Logging out…" : "Logout"}</span>
        </button>
      </div>
    </header>
  )
}
