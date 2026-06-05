// ─── src/app/layout.js ───────────────────────────────────────────────────────
// FIX: removed pt-47 from <main> — padding is handled per-page instead
'use client';

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import WhatsAppButton from "@/components/WhatsAppButton";
import { usePathname } from "next/navigation";
import { FiltersProvider } from "@/app/context/FiltersContext";
import AiTripPlanner from "@/components/AiTripPlanner"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <AiTripPlanner />
      </body>
    </html>
  )
}
export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <FiltersProvider>
          {!isAdminRoute && <Header />}
          <main className="flex-1">
            {children}
            <AiTripPlanner />
          </main>
          {!isAdminRoute && <Footer />}
          {!isAdminRoute && <WhatsAppButton />}
        </FiltersProvider>
        <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>
  );
}