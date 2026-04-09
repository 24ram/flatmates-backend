"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getListings } from "@/lib/api";
import ListingCard from "../components/ListingCard";
import BottomNav from "../components/BottomNav";
import { motion } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";

const CITIES = ["All", "Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad", "Chennai"];

export default function ListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("All");
  const [maxRent, setMaxRent] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getListings();
        const arr = Array.isArray(data) ? data : [];
        setListings(arr);
        setFiltered(arr);
      } catch { setListings([]); }
      finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    let result = [...listings];
    if (city !== "All") result = result.filter(l => l.city?.toLowerCase() === city.toLowerCase());
    if (maxRent) result = result.filter(l => l.rent <= Number(maxRent));
    setFiltered(result);
  }, [city, maxRent, listings]);

  return (
    <div className="min-h-screen pb-28" style={{ background: "#F2F2EF" }}>

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100">

        {/* Row 1: Title + Filter + Post */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: "#111", letterSpacing: "-0.3px" }}>
              Rooms &amp; Flats
            </h1>
            <p style={{ fontSize: 12, color: "#aaa", marginTop: 1 }}>{filtered.length} rooms available</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilter(v => !v)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 50,
                border: `1px solid ${showFilter ? "#111" : "#E5E5E5"}`,
                background: showFilter ? "#111" : "#fff",
                color: showFilter ? "#fff" : "#555",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              <SlidersHorizontal size={13} />
              Filter
            </button>
            <button
              onClick={() => router.push("/listings/create")}
              style={{
                padding: "8px 16px", borderRadius: 50,
                background: "#111", color: "#fff",
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                border: "none",
              }}
            >
              + Post
            </button>
          </div>
        </div>

        {/* Row 2: City chips */}
        <div style={{ overflowX: "auto", display: "flex", gap: 8, padding: "0 16px 12px", scrollbarWidth: "none" }}>
          {CITIES.map(c => (
            <button key={c} onClick={() => setCity(c)} style={{
              flexShrink: 0, padding: "7px 16px", borderRadius: 50,
              border: `1px solid ${city === c ? "#111" : "#E8E8E8"}`,
              background: city === c ? "#111" : "#fff",
              color: city === c ? "#fff" : "#666",
              fontSize: 13, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap",
            }}>
              {c}
            </button>
          ))}
        </div>

        {/* Row 3: Budget filter (collapsible) */}
        {showFilter && (
          <div style={{ padding: "12px 16px 14px", borderTop: "1px solid #F0F0F0" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
              Max Rent
            </p>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">₹</span>
                <input
                  type="number" placeholder="e.g. 20000" value={maxRent}
                  onChange={e => setMaxRent(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border text-sm text-gray-800 outline-none"
                  style={{ borderColor: "#E5E5E5" }}
                />
              </div>
              {maxRent && (
                <button onClick={() => setMaxRent("")}
                  className="px-4 py-2.5 rounded-xl border text-sm text-gray-500"
                  style={{ borderColor: "#E5E5E5" }}>
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Grid ── */}
      <div className="px-3 pt-4">
        {loading ? (
          <div className="flex justify-center pt-20">
            <div className="w-6 h-6 rounded-full border-2 animate-spin"
              style={{ borderColor: "#111", borderTopColor: "transparent" }} />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center pt-16 gap-4">
            <div className="text-5xl">🏘️</div>
            <div>
              <p className="text-base font-bold text-gray-900">No rooms here yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Be the first to post in {city === "All" ? "your city" : city}!
              </p>
            </div>
            <button onClick={() => router.push("/listings/create")}
              className="px-6 py-3 rounded-2xl font-semibold text-sm text-white mt-2"
              style={{ background: "#111" }}>
              Post a Room
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((listing, i) => (
              <ListingCard key={listing.id} listing={listing} index={i} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
