"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import axios from "axios";

const API = "https://5stardubai.com/backend/api";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [abuDhabi, setAbuDhabi] = useState([]);
  const [sharjah,  setSharjah]  = useState([]);
  const [dubai,    setDubai]    = useState([]);

  useEffect(() => { fetchHotels(); }, []);

  const fetchHotels = async () => {
    try {
      const [f, r1, r2, r3] = await Promise.all([
        axios.get(`${API}/hotels/featured`),
        axios.get(`${API}/hotels?location=AbuDhabi`),
        axios.get(`${API}/hotels?location=Sharjah`),
        axios.get(`${API}/hotels?location=Dubai`),
      ]);
      setFeatured(Array.isArray(f.data)  ? f.data  : f.data.data  ?? []);
      setAbuDhabi(Array.isArray(r1.data) ? r1.data : r1.data.data ?? []);
      setSharjah( Array.isArray(r2.data) ? r2.data : r2.data.data ?? []);
      setDubai(   Array.isArray(r3.data) ? r3.data : r3.data.data ?? []);
    } catch (err) { console.log(err); }
  };

  return (
    // pt-[240px] on mobile (stacked search is taller), pt-[160px] on md+
    <main className="pt-[300px] md:pt-[200px] pb-10 space-y-10 max-w-7xl mx-auto px-4">

      {featured.length > 0 && (
        <ProductCard
          subtitle="Handpicked for you"
          title="Featured Hotels"
          properties={featured}
          showAll
        />
      )}

      <ProductCard title="Stay in Dubai"                        properties={dubai}    showAll />
      <ProductCard title="Popular homes in Abu Dhabi"           properties={abuDhabi} showAll />
      <ProductCard title="Available in Sharjah this weekend"    properties={sharjah}  showAll />

    </main>
  );
}
