'use client'
// src/app/dashboard/components/UserSidebar.jsx

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Heart, CalendarCheck, LogOut, Menu, X, User } from "lucide-react"

const navItems = [
  { label: "Overview",    href: "/dashboard",          icon: LayoutDashboard },
  { label: "My Bookings", href: "/dashboard/bookings", icon: CalendarCheck   },
  { label: "Wishlist",    href: "/dashboard/wishlist", icon: Heart           },
  { label: "Profile",     href: "/dashboard/profile",  icon: User            },
]

const HEADER_HEIGHT = 140

export default function UserSidebar() {
  const router   = useRouter()
  const pathname = usePathname()

  const [user,       setUser]       = useState(null)
  const [collapsed,  setCollapsed]  = useState(false)  // desktop
  const [mobileOpen, setMobileOpen] = useState(false)  // mobile drawer

  useEffect(() => {
    try { setUser(JSON.parse(localStorage.getItem("user") ?? "null")) } catch {}
  }, [])

  // Close drawer on route change
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

  const initials = user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() ?? "U"

  // ── Shared nav content ────────────────────────────────────────────────────
  const NavContent = ({ slim = false }) => (
    <>
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href}>
              <div
                title={slim ? item.label : undefined}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer transition-colors
                  ${isActive
                    ? "text-white bg-white/5 border-r-2 border-rose-500"
                    : "text-gray-500 hover:text-white hover:bg-white/5"}`}
              >
                <Icon size={17} className="shrink-0" />
                {!slim && <span className="font-medium">{item.label}</span>}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* User + logout */}
      <div className="border-t border-white/5 p-3 shrink-0">
        {slim ? (
          <button onClick={handleLogout} title="Logout"
            className="w-full flex justify-center p-2 text-gray-500 hover:text-red-400 rounded-lg hover:bg-white/5 transition">
            <LogOut size={17} />
          </button>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name ?? "User"}</p>
              <p className="text-[10px] text-gray-500 truncate">{user?.email ?? ""}</p>
            </div>
            <button onClick={handleLogout} title="Logout"
              className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition">
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </>
  )

  return (
    <>
      {/* ── MOBILE: hamburger button ─────────────────────────────────────── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed z-50 w-9 h-9 bg-[#0f1117] border border-white/10 rounded-lg
          flex items-center justify-center text-gray-400 hover:text-white transition"
        style={{ top: HEADER_HEIGHT + 12, left: 12 }}
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

      {/* ── MOBILE: full drawer ──────────────────────────────────────────── */}
      <aside
        className={`md:hidden fixed left-0 bottom-0 z-50 w-64 flex flex-col
          bg-[#0f1117] border-r border-white/5
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ top: HEADER_HEIGHT }}
      >
        <div className="h-12 flex items-center justify-between px-4 border-b border-white/5 shrink-0">
          <span className="text-rose-500 font-bold text-sm">
            Search<span className="text-white">Dubai</span>
          </span>
          <button onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition">
            <X size={18} />
          </button>
        </div>
        <NavContent slim={false} />
      </aside>

      {/* ── DESKTOP: sticky sidebar ──────────────────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col shrink-0
          ${collapsed ? "w-16" : "w-60"}
          bg-[#0f1117] border-r border-white/5
          transition-all duration-300 ease-in-out`}
        style={{ position: "sticky", top: 0, height: `calc(100vh - ${HEADER_HEIGHT}px)` }}
      >
        <div className="h-12 flex items-center justify-between px-4 border-b border-white/5 shrink-0">
          {!collapsed && (
            <span className="text-rose-500 font-bold text-sm whitespace-nowrap">
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
