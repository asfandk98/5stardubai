"use client";

import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";

export default function Footer() {
  const navLinks = ["Home","Hotels","About Us","Blog","Careers","Contact"];
  const destinations = ["Jumeirah Beach Road","Gold Souk & Al Ras","Umm Suqeim","Al Sufouh","Bluewaters Island"];
  const bottomLinks = ["Privacy Policy","Terms & Conditions","Wishlist"];

  return (
    <footer className="bg-gray-100 text-gray-700 mt-16">
      
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* About */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">CG Dubai Hotel Resorts</h2>
          <p className="text-sm text-gray-600">
            Discover luxury stays across the UAE. From beachfront resorts to desert retreats, we curate unforgettable hotel experiences.
          </p>
          <div className="mt-4 space-y-1 text-sm text-gray-700">
            <p>⭐ 4.9 Rating</p>
            <p>🏨 500+ Hotels</p>
            <p>👥 10k+ Guests</p>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="font-semibold mb-3">Navigation</h3>
          <ul className="space-y-2 text-sm">
            {navLinks.map((item, i) => (
              <li key={i}>
                <Link 
                  href={`/${item.toLowerCase().replace(/\s+/g,'')}`} 
                  className="flex items-center gap-2 hover:text-rose-500 transition duration-200 group"
                >
                  <FiChevronRight className="text-rose-500 transition-transform duration-200 group-hover:translate-x-1" />
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Destinations */}
        <div>
          <h3 className="font-semibold mb-3">Destinations</h3>
          <ul className="space-y-2 text-sm">
            {destinations.map((item, i) => (
              <li key={i}>
                <Link 
                  href={`#${item.toLowerCase().replace(/\s+/g,'')}`} 
                  className="flex items-center gap-2 hover:text-rose-500 transition duration-200 group"
                >
                  <FiChevronRight className="text-rose-500 transition-transform duration-200 group-hover:translate-x-1" />
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold mb-3">Get in Touch</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="tel:+97143339900" className="flex items-center gap-2 hover:text-rose-500 transition duration-200 group">
                <FiChevronRight className="text-rose-500 transition-transform duration-200 group-hover:translate-x-1" />
                Call Us: +971 4 333 9900
              </Link>
            </li>
            <li>
              <Link href="mailto:info@dubaihotelresorts.com" className="flex items-center gap-2 hover:text-rose-500 transition duration-200 group">
                <FiChevronRight className="text-rose-500 transition-transform duration-200 group-hover:translate-x-1" />
                Email: info@dubaihotelresorts.com
              </Link>
            </li>
            <li>
              <Link href="#" className="flex items-center gap-2 hover:text-rose-500 transition duration-200 group">
                <FiChevronRight className="text-rose-500 transition-transform duration-200 group-hover:translate-x-1" />
                Address: Jumeirah Beach Road, Umm Suqeim, Dubai, UAE
              </Link>
            </li>
            <li>
              <span className="flex items-center gap-2 hover:text-rose-500 transition duration-200 cursor-pointer group">
                <FiChevronRight className="text-rose-500 transition-transform duration-200 group-hover:translate-x-1" />
                Support: 24/7 Available
              </span>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-300 py-6 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
        <p>© 2026 Dubai Hotel Resorts. All rights reserved.</p>
        <div className="flex gap-6 mt-2 md:mt-0">
          {bottomLinks.map((item, i) => (
            <Link key={i} href={`/${item.toLowerCase().replace(/\s+/g,'')}`} className="flex items-center gap-1 hover:text-rose-500 transition duration-200 group">
              <FiChevronRight className="text-rose-500 transition-transform duration-200 group-hover:translate-x-1" />
              {item}
            </Link>
          ))}
        </div>
      </div>

    </footer>
  );
}