'use client';

import { useState, useEffect, useRef } from "react";
import { FiSearch, FiMenu, FiHeart } from "react-icons/fi";
import { SlidersHorizontal, MapPin, Calendar, Users, X } from "lucide-react";
import FilterModal from "./hotels/FilterModal";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useFilters } from "@/app/context/FiltersContext";

const API = "https://api.alainhotel.com/api"

const tabs = [
  { label: "Home",    href: "/" },
  { label: "Hotels",  href: "/hotels" },
  { label: "About",   href: "/about-us" },
  { label: "Blog",    href: "/blog" },
  { label: "Careers", href: "/career" },
  { label: "Contact", href: "/contact" },
];

const HIDE_SEARCH_PAGES = [
  "/login",
  "/register",
  "/forgot-password",
  "/auth/signin",
  "/auth/register",
];

function getUserFromStorage() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export default function Header() {
  const { setFilters } = useFilters();
  const [filterOpen,    setFilterOpen]    = useState(false);
  const [activeField,   setActiveField]   = useState(null);
  const [wishlistOpen,  setWishlistOpen]  = useState(false);
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [scrollingDown, setScrollingDown] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [user,          setUser]          = useState(null);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [locations,     setLocations]     = useState([]);
  const [whereQuery,    setWhereQuery]    = useState("");
  const [filteredLocs,  setFilteredLocs]  = useState([]);
  const [checkIn,       setCheckIn]       = useState("");
  const [checkOut,      setCheckOut]      = useState("");
  const [guests,        setGuests]        = useState(1);

  const router       = useRouter();
  const path         = usePathname();
  const isHotelsPage = path === "/hotels";
  const hideSearch   = HIDE_SEARCH_PAGES.includes(path);
  const searchRef    = useRef(null);

  useEffect(() => {
    if (path !== "/hotels") {
      setWhereQuery("");
      setCheckIn("");
      setCheckOut("");
      setGuests(1);
      setActiveField(null);
      setFilters({});
    }
  }, [path]);

  useEffect(() => { setUser(getUserFromStorage()); }, []);

  useEffect(() => {
    const handler = () => setUser(getUserFromStorage());
    window.addEventListener("storage",     handler);
    window.addEventListener("auth-change", handler);
    return () => {
      window.removeEventListener("storage",     handler);
      window.removeEventListener("auth-change", handler);
    };
  }, []);

  useEffect(() => {
    fetch(`${API}/hotels/filters`)
      .then(r => r.json())
      .then(data => setLocations(data.locations ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!whereQuery.trim()) {
      setFilteredLocs(locations);
    } else {
      setFilteredLocs(
        locations.filter(l => l.toLowerCase().includes(whereQuery.toLowerCase()))
      );
    }
  }, [whereQuery, locations]);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setActiveField(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API}/wishlist`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(setWishlistItems)
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    const onScroll = () => {
      const cur = window.pageYOffset;
      setScrollingDown(cur > lastScrollTop && cur > 50);
      setLastScrollTop(cur <= 0 ? 0 : cur);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastScrollTop]);

  const handleRemove = async (hotelId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API}/wishlist/${hotelId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlistItems(prev => prev.filter(item => item.hotel_id !== hotelId));
    } catch {}
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API}/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Logged out successfully 👋");
    } catch { toast.error("Logout failed"); }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setUser(null);
    setWishlistItems([]);
    window.dispatchEvent(new Event("auth-change"));
    router.push("/");
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (whereQuery.trim()) params.set("location", whereQuery.trim());
    if (checkIn)           params.set("check_in",  checkIn);
    if (checkOut)          params.set("check_out", checkOut);
    if (guests > 1)        params.set("guests",    guests);
    setActiveField(null);
    router.push(`/hotels?${params.toString()}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <>
      <section className="fixed w-full z-50 transition-all duration-300">
        <div className={`bg-white border-b border-gray-200 transition-transform duration-300 ${scrollingDown ? "-translate-y-full" : "translate-y-0"}`}>

          {/* ===== NAVBAR ===== */}
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">

            <Link href="/">
              <h1 className="text-xl font-semibold text-rose-500 tracking-tight cursor-pointer">
                Search<span className="text-gray-800">Dubai</span>
              </h1>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-8">
              {tabs.map((tab, i) => {
                const isActive = path === tab.href;
                return (
                  <Link key={i} href={tab.href}>
                    <button className="relative pb-2 text-sm font-medium">
                      <span className={`transition duration-200 ${isActive ? "text-black" : "text-gray-400 hover:text-black"}`}>
                        {tab.label}
                      </span>
                      {isActive && (
                        <span className="absolute left-0 bottom-0 w-full h-[2px] bg-black rounded-full" />
                      )}
                    </button>
                  </Link>
                );
              })}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3 relative">

              {/* Wishlist pill — desktop only */}
              {user && (
                <div className="relative">
                  <span
                    onClick={() => setWishlistOpen(!wishlistOpen)}
                    className="hidden md:flex items-center gap-1 text-sm font-medium cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-full transition"
                  >
                    <FiHeart size={16} className="text-red-500" />
                    Wishlist
                  </span>

                  {wishlistOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50">
                      <p className="text-sm font-semibold text-gray-700 mb-3">Saved Properties</p>
                      <ul className="space-y-2 max-h-64 overflow-y-auto">
                        {wishlistItems.length > 0 ? wishlistItems.map(item => (
                          <li key={item.id} className="flex items-center justify-between gap-3 hover:bg-gray-50 p-2 rounded-lg group">
                            <div className="flex items-center gap-3">
                              <img
                                src={`https://api.alainhotel.com/storage/${item.hotel?.image}`}
                                className="w-12 h-12 rounded-lg object-cover shrink-0"
                                onError={e => e.target.src = "/placeholder-hotel.jpg"}
                                alt={item.hotel?.title}
                              />
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{item.hotel?.title}</p>
                                <p className="text-xs text-gray-400 truncate">{item.hotel?.location}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemove(item.hotel_id)}
                              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition shrink-0"
                            >
                              <X size={14} />
                            </button>
                          </li>
                        )) : (
                          <p className="text-sm text-gray-400 text-center py-6">No saved hotels yet ❤️</p>
                        )}
                      </ul>
                      <Link href="/wishlist">
                        <button
                          onClick={() => setWishlistOpen(false)}
                          className="mt-3 w-full bg-rose-500 text-white py-2 rounded-lg hover:bg-rose-600 transition text-sm font-medium"
                        >
                          View All
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Hamburger menu */}
              <div className="relative">
                <div
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 border border-gray-300 rounded-full px-3 py-2 shadow-sm hover:shadow-md transition cursor-pointer"
                >
                  <FiMenu />
                </div>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-50">

                    {/* Mobile-only nav links */}
                    <div className="md:hidden border-b border-gray-100 pb-2 mb-2">
                      {tabs.map((tab, i) => {
                        const isActive = path === tab.href;
                        return (
                          <Link key={i} href={tab.href} onClick={() => setMenuOpen(false)}>
                            <button className={`w-full text-left text-sm px-3 py-2 rounded-md transition ${isActive ? "bg-rose-50 text-rose-500 font-medium" : "hover:bg-gray-100 text-gray-700"}`}>
                              {tab.label}
                            </button>
                          </Link>
                        );
                      })}
                    </div>

                    {/* ── LOGGED IN ── */}
                    {user ? (
                      <>
                        {/* Avatar + name */}
                        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 mb-1">
                          <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 text-xs font-bold shrink-0">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-800 truncate">{user.name}</span>
                        </div>

                        {/* Dashboard */}
                        <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                          <button className="w-full text-left text-sm px-3 py-2 hover:bg-gray-100 rounded-md flex items-center gap-2 text-gray-700">
                            <span>🏠</span> Dashboard
                          </button>
                        </Link>

                        {/* Wishlist */}
                        <Link href="/dashboard/wishlist" onClick={() => setMenuOpen(false)}>
                          <button className="w-full text-left text-sm px-3 py-2 hover:bg-gray-100 rounded-md flex items-center gap-2 text-gray-700">
                            <FiHeart size={14} className="text-red-500" /> Wishlist
                          </button>
                        </Link>

                        {/* Logout */}
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="w-full text-left text-sm px-3 py-2 hover:bg-red-50 rounded-md text-red-500 flex items-center gap-2"
                          >
                            <span>↩</span> Logout
                          </button>
                        </div>
                      </>
                    ) : (
                      /* ── LOGGED OUT ── */
                      <>
                        <Link href="/login" onClick={() => setMenuOpen(false)}>
                          <button className="w-full text-left text-sm px-3 py-2 hover:bg-gray-100 rounded-md">
                            Login
                          </button>
                        </Link>
                        <Link href="/register" onClick={() => setMenuOpen(false)}>
                          <button className="w-full text-left text-sm px-3 py-2 hover:bg-gray-100 rounded-md">
                            Signup
                          </button>
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ===== SEARCH BAR ===== */}
          {!hideSearch && (
            <div className={`flex justify-center gap-3 transition-all duration-300 px-4 ${scrollingDown ? "py-2 scale-95" : "py-4 scale-100"}`}>
              <div ref={searchRef} className="w-full max-w-3xl">

                {/* Desktop pill */}
                <div className="hidden md:flex bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition items-center relative">

                  {/* WHERE */}
                  <div
                    onClick={() => setActiveField("where")}
                    className={`flex-1 px-6 py-3 rounded-full cursor-pointer transition relative ${activeField === "where" ? "bg-gray-100" : "hover:bg-gray-50"}`}
                  >
                    <p className="text-xs font-semibold flex items-center gap-1">
                      <MapPin size={11} className="text-rose-400" /> Where
                    </p>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={whereQuery}
                        onChange={e => setWhereQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onClick={e => { e.stopPropagation(); setActiveField("where"); }}
                        placeholder="Search destinations"
                        className="text-sm text-gray-700 bg-transparent outline-none w-full placeholder-gray-400"
                      />
                      {whereQuery && (
                        <button
                          onClick={e => { e.stopPropagation(); setWhereQuery(""); setActiveField("where"); }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                    {activeField === "where" && filteredLocs.length > 0 && (
                      <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                        <p className="text-xs text-gray-400 font-medium px-4 pt-3 pb-1 uppercase tracking-wider">Destinations</p>
                        {filteredLocs.map((loc, i) => (
                          <div
                            key={i}
                            onClick={e => { e.stopPropagation(); setWhereQuery(loc); setActiveField("when"); }}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-rose-50 cursor-pointer transition"
                          >
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                              <MapPin size={14} className="text-rose-400" />
                            </div>
                            <span className="text-sm text-gray-700">{loc}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="h-6 w-px bg-gray-200 shrink-0" />

                  {/* CHECK-IN */}
                  <div
                    onClick={() => setActiveField("when")}
                    className={`flex-1 px-6 py-3 rounded-full cursor-pointer transition ${activeField === "when" ? "bg-gray-100" : "hover:bg-gray-50"}`}
                  >
                    <p className="text-xs font-semibold flex items-center gap-1">
                      <Calendar size={11} className="text-rose-400" /> Check-in
                    </p>
                    <input
                      type="date"
                      value={checkIn}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={e => { setCheckIn(e.target.value); setActiveField("checkout"); }}
                      onClick={e => e.stopPropagation()}
                      className="text-sm text-gray-500 bg-transparent outline-none w-full cursor-pointer"
                    />
                  </div>

                  <div className="h-6 w-px bg-gray-200 shrink-0" />

                  {/* CHECK-OUT */}
                  <div
                    onClick={() => setActiveField("checkout")}
                    className={`flex-1 px-6 py-3 rounded-full cursor-pointer transition ${activeField === "checkout" ? "bg-gray-100" : "hover:bg-gray-50"}`}
                  >
                    <p className="text-xs font-semibold flex items-center gap-1">
                      <Calendar size={11} className="text-rose-400" /> Check-out
                    </p>
                    <input
                      type="date"
                      value={checkOut}
                      min={checkIn || new Date().toISOString().split("T")[0]}
                      onChange={e => { setCheckOut(e.target.value); setActiveField("who"); }}
                      onClick={e => e.stopPropagation()}
                      className="text-sm text-gray-500 bg-transparent outline-none w-full cursor-pointer"
                    />
                  </div>

                  <div className="h-6 w-px bg-gray-200 shrink-0" />

                  {/* GUESTS */}
                  <div
                    onClick={() => setActiveField("who")}
                    className={`flex-1 px-6 py-3 rounded-full cursor-pointer transition relative ${activeField === "who" ? "bg-gray-100" : "hover:bg-gray-50"}`}
                  >
                    <p className="text-xs font-semibold flex items-center gap-1">
                      <Users size={11} className="text-rose-400" /> Who
                    </p>
                    <p className="text-sm text-gray-700">{guests} guest{guests !== 1 ? "s" : ""}</p>
                    {activeField === "who" && (
                      <div
                        onClick={e => e.stopPropagation()}
                        className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-800">Guests</p>
                            <p className="text-xs text-gray-400">How many guests?</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button onClick={() => setGuests(g => Math.max(1, g - 1))} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-500 transition text-sm">−</button>
                            <span className="text-sm font-semibold w-4 text-center">{guests}</span>
                            <button onClick={() => setGuests(g => Math.min(20, g + 1))} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-500 transition text-sm">+</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SEARCH BUTTON */}
                  <div className="pr-2">
                    <button
                      onClick={handleSearch}
                      className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-3 rounded-full transition shadow-md flex items-center gap-2 text-sm font-medium"
                    >
                      <FiSearch size={15} />
                      <span>Search</span>
                    </button>
                  </div>
                </div>

              </div>

              {isHotelsPage && (
                <button
                  onClick={() => setFilterOpen(true)}
                  className="hidden md:flex items-center gap-2 border border-gray-300 px-5 py-3 rounded-full hover:shadow-md hover:border-rose-400 hover:text-rose-500 transition bg-white text-sm font-medium text-gray-600 shrink-0"
                >
                  <SlidersHorizontal size={15} />
                  Filters
                </button>
              )}
            </div>
          )}

        </div>
      </section>

      <FilterModal
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={(filters) => {
          setFilters(filters);
          setFilterOpen(false);
        }}
      />
    </>
  );
}
