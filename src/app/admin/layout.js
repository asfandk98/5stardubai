// src/app/admin/layout.js
// NO 'use client' — Server Component

import AdminSidebar from "./components/AdminSidebar"
import AdminTopBar from "./components/AdminTopBar"

export const metadata = {
  title: "Admin — SearchDubaiHotels",
}

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#080a0f]">

      {/* ── LEFT: Sidebar ── */}
      <AdminSidebar />

      {/* ── RIGHT: TopBar + Page content stacked vertically ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* TopBar sits at the top of the right column */}
        <AdminTopBar />

        {/* Page content fills the rest */}
        <main className="flex-1 p-6 overflow-y-auto overflow-x-hidden">
          {children}
        </main>

      </div>
    </div>
  )
}