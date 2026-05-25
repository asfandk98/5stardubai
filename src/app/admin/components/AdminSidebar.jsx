'use client'
// src/app/admin/components/AdminSidebar.jsx

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard, Hotel, BedDouble, CalendarX2,
  BookOpen, LogOut, ChevronRight, Menu, X,
  TrendingUp,
} from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  {
    label: "Hotels", icon: Hotel,
    children: [
      { label: "All Hotels", href: "/admin/hotels" },
      { label: "Add Hotel",  href: "/admin/hotels/create" },
    ],
  },
  {
    label: "Rooms", icon: BedDouble,
    children: [
      { label: "Add Room",         href: "/admin/rooms/create" },
      { label: "Seasonal Prices",  href: "/admin/rooms/seasonal-prices" },
      { label: "Availability",     href: "/admin/rooms/availability" },
    ],
  },
  { label: "Bookings", href: "/admin/bookings", icon: TrendingUp },
  {
    label: "Blog", icon: BookOpen,
    children: [
      { label: "All Posts",   href: "/admin/blog" },
      { label: "New Post",    href: "/admin/blog/create" },
      { label: "Categories",  href: "/admin/blog/categories" },
    ],
  },
]

export default function AdminSidebar() {
  const router   = useRouter()
  const pathname = usePathname()

  const [user,        setUser]        = useState(null)
  const [collapsed,   setCollapsed]   = useState(false)   // desktop collapse
  const [mobileOpen,  setMobileOpen]  = useState(false)   // mobile drawer
  const [expanded,    setExpanded]    = useState({})

  useEffect(() => {
    const token = localStorage.getItem("token")
    const role  = localStorage.getItem("role")
    if (!token || role !== "admin") { router.push("/login"); return }
    try { setUser(JSON.parse(localStorage.getItem("user") ?? "null")) } catch {}

    // Auto-expand active section
    navItems.forEach(item => {
      if (item.children?.some(c => pathname.startsWith(c.href))) {
        setExpanded(prev => ({ ...prev, [item.label]: true }))
      }
    })
  }, [pathname])

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  const handleLogout = async () => {
    try {
      await fetch("https://api.alainhotel.com/backend/api/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
    } catch {}
    localStorage.clear()
    window.dispatchEvent(new Event("auth-change"))
    router.push("/login")
  }

  const toggle = (label) =>
    setExpanded(prev => ({ ...prev, [label]: !prev[label] }))

  const initials = user?.name
    ?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() ?? "AD"

  // ── Shared nav content ──────────────────────────────────────────────────
  const NavContent = ({ slim = false }) => (
    <>
      <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {navItems.map(item => {
          const Icon     = item.icon
          const isActive = item.href
            ? pathname === item.href
            : item.children?.some(c => pathname.startsWith(c.href))
          const isExpanded = expanded[item.label]

          if (item.children) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggle(item.label)}
                  title={slim ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                    ${isActive ? "text-white" : "text-gray-500 hover:text-gray-200 hover:bg-white/5"}`}
                >
                  <Icon size={17} className="shrink-0" />
                  {!slim && (
                    <>
                      <span className="flex-1 text-left font-medium">{item.label}</span>
                      <ChevronRight size={13} className={`transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
                    </>
                  )}
                </button>

                {!slim && isExpanded && (
                  <div className="ml-8 mr-3 mt-0.5 mb-1 space-y-0.5">
                    {item.children.map(child => {
                      const childActive =
                        pathname === child.href ||
                        (child.href !== "/admin/hotels" &&
                         child.href !== "/admin/blog" &&
                         pathname.startsWith(child.href))
                      return (
                        <Link key={child.href} href={child.href}>
                          <div className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer
                            ${childActive ? "bg-rose-500/10 text-rose-400" : "text-gray-500 hover:text-gray-200 hover:bg-white/5"}`}>
                            {child.label}
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link key={item.href} href={item.href}>
              <div
                title={slim ? item.label : undefined}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer
                  ${pathname === item.href
                    ? "text-white bg-white/5 border-r-2 border-rose-500"
                    : "text-gray-500 hover:text-gray-200 hover:bg-white/5"}`}
              >
                <Icon size={17} className="shrink-0" />
                {!slim && <span>{item.label}</span>}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* User + logout */}
      <div className="border-t border-white/5 p-3 shrink-0">
        {slim ? (
          <button onClick={handleLogout} title="Logout"
            className="w-full flex justify-center p-2 text-gray-600 hover:text-red-400 transition rounded-lg hover:bg-white/5">
            <LogOut size={17} />
          </button>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name ?? "Admin"}</p>
              <p className="text-[10px] text-gray-600 truncate">{user?.email ?? ""}</p>
            </div>
            <button onClick={handleLogout} title="Logout"
              className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-white/5 rounded-lg transition">
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </>
  )

  return (
    <>
      {/* ── MOBILE: hamburger trigger (top-left) ─────────────────────────── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-9 h-9 bg-[#0f1117] border border-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition"
      >
        <Menu size={18} />
      </button>

      {/* ── MOBILE: backdrop ─────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── MOBILE: full sidebar drawer ──────────────────────────────────── */}
      <aside className={`
        md:hidden fixed top-0 left-0 bottom-0 z-50 w-64 flex flex-col
        bg-[#0f1117] border-r border-white/5
        transition-transform duration-300 ease-in-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/5 shrink-0">
          <span className="text-rose-500 font-bold text-base tracking-tight">
            Search<span className="text-white">Dubai</span>
          </span>
          <button onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition">
            <X size={18} />
          </button>
        </div>
        <NavContent slim={false} />
      </aside>

      {/* ── DESKTOP: static sidebar ──────────────────────────────────────── */}
      <aside className={`
        hidden md:flex flex-col shrink-0
        ${collapsed ? "w-16" : "w-60"}
        bg-[#0f1117] border-r border-white/5
        transition-all duration-300 ease-in-out
        sticky top-0 h-screen
      `}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/5 shrink-0">
          {!collapsed && (
            <span className="text-rose-500 font-bold text-base tracking-tight whitespace-nowrap">
              Search<span className="text-white">Dubai</span>
            </span>
          )}
          <button onClick={() => setCollapsed(p => !p)}
            className="ml-auto p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition">
            {collapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
        </div>
        <NavContent slim={collapsed} />
      </aside>
    </>
  )
}
