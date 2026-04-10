"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getListingById } from "@/lib/api";
import BottomNav from "../../components/BottomNav";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Wifi, Wind, Car, Dumbbell, UtensilsCrossed, Shield, WashingMachine, Waves, Star, MessageCircle } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : "http://localhost:5000";

const amenityIcons: Record<string, any> = {
  wifi: Wifi, ac: Wind, parking: Car, gym: Dumbbell,
  kitchen: UtensilsCrossed, security: Shield, laundry: WashingMachine, pool: Waves,
};

function getAmenityIcon(name: string) {
  return amenityIcons[name.toLowerCase()] || Star;
}

function imgUrl(url: string) {
  return url?.startsWith("http") ? url : `${BACKEND_URL}${url}`;
}

export default function ListingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const data = await getListingById(params.id as string);
        setListing(data);
      } catch {
        setError("Room not found");
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-7 h-7 border-2 rounded-full animate-spin"
          style={{ borderColor: "#111", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white px-8 text-center">
        <div className="text-5xl">🏘️</div>
        <h2 className="text-xl font-bold text-gray-900">Room not found</h2>
        <p className="text-sm text-gray-400">This listing may have been removed.</p>
        <button onClick={() => router.push("/listings")}
          className="px-6 py-3 rounded-2xl text-sm font-semibold text-white mt-2"
          style={{ background: "#111" }}>
          Back to Listings
        </button>
      </div>
    );
  }

  const images: string[] = Array.isArray(listing.images) ? listing.images : [];
  const amenities: string[] = Array.isArray(listing.amenities) ? listing.amenities : [];

  return (
    <div className="min-h-screen pb-28" style={{ background: "#F2F2EF" }}>

      {/* ── Photo carousel ── */}
      <div className="relative" style={{ height: "340px", background: "#111" }}>
        {images.length > 0 ? (
          <>
            <img src={imgUrl(images[activeImg])} alt="Room"
              className="w-full h-full object-cover" />
            {/* Gradient */}
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)" }} />
            {/* Slide dots */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                {images.map((_: string, i: number) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className="rounded-full transition-all"
                    style={{ width: i === activeImg ? 20 : 6, height: 6, background: i === activeImg ? "#fff" : "rgba(255,255,255,0.4)" }} />
                ))}
              </div>
            )}
            {/* Tap zones for prev/next */}
            {activeImg > 0 && (
              <button className="absolute left-0 inset-y-0 w-1/3" onClick={() => setActiveImg(p => p - 1)} />
            )}
            {activeImg < images.length - 1 && (
              <button className="absolute right-0 inset-y-0 w-1/3" onClick={() => setActiveImg(p => p + 1)} />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl">🏠</span>
          </div>
        )}

        {/* Back button */}
        <button onClick={() => router.back()}
          className="absolute top-5 left-4 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}>
          <ArrowLeft size={18} color="#fff" />
        </button>

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute top-5 right-4 px-3 py-1 rounded-full text-xs font-semibold text-white"
            style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}>
            {activeImg + 1}/{images.length}
          </div>
        )}

        {/* Message / Chat button */}
        <button onClick={() => router.push(`/chat/${listing.owner_id}`)}
          className="absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 z-10"
          style={{ background: "linear-gradient(135deg,#7C3AED,#EC4899)", border: "2px solid rgba(255,255,255,0.2)" }}>
          <MessageCircle size={22} color="#fff" />
        </button>
      </div>

      {/* ── Thumbnail strip ── */}
      {images.length > 1 && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar" style={{ background: "#fff" }}>
          {images.map((url: string, i: number) => (
            <button key={i} onClick={() => setActiveImg(i)}
              className="shrink-0 rounded-xl overflow-hidden transition-all"
              style={{ width: 72, height: 52, outline: i === activeImg ? "2px solid #111" : "none", outlineOffset: 1 }}>
              <img src={imgUrl(url)} className="w-full h-full object-cover" alt="" />
            </button>
          ))}
        </div>
      )}

      {/* ── Main info card ── */}
      <div style={{ background: "#fff", margin: "10px 12px", borderRadius: 20, padding: "22px 20px" }}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111", letterSpacing: "-0.4px", lineHeight: 1.2, flex: 1 }}>
            {listing.title}
          </h1>
          <div className="text-right shrink-0">
            <p style={{ fontSize: 22, fontWeight: 800, color: "#111" }}>
              ₹{Number(listing.rent).toLocaleString()}
            </p>
            <p style={{ fontSize: 12, color: "#aaa", marginTop: 1 }}>/month</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <MapPin size={13} color="#999" />
          <p style={{ fontSize: 14, color: "#888" }}>{listing.location || listing.city}</p>
        </div>

        {listing.description && (
          <p style={{ fontSize: 15, color: "#444", marginTop: 14, lineHeight: 1.6 }}>
            {listing.description}
          </p>
        )}

        {/* Prefs pills */}
        <div className="flex gap-2 mt-4">
          <span style={{ fontSize: 13, padding: "6px 14px", borderRadius: 50, background: "#F5F5F3", color: "#555", border: "1px solid #EBEBEB" }}>
            {listing.smoking_ok ? "🚬 Smoking OK" : "🚭 No smoking"}
          </span>
          <span style={{ fontSize: 13, padding: "6px 14px", borderRadius: 50, background: "#F5F5F3", color: "#555", border: "1px solid #EBEBEB" }}>
            {listing.pets_ok ? "🐾 Pets OK" : "🚫 No pets"}
          </span>
        </div>
      </div>

      {/* ── Amenities card ── */}
      {amenities.length > 0 && (
        <div style={{ background: "#fff", margin: "0 12px 10px", borderRadius: 20, padding: "20px" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>
            Amenities
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {amenities.map((a: string, i: number) => {
              const Icon = getAmenityIcon(a);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F5F5F3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={16} color="#555" strokeWidth={1.8} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500, color: "#333" }}>{a}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Owner card ── */}
      {listing.owner_name && (
        <div style={{ background: "#fff", margin: "0 12px 10px", borderRadius: 20, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#7C3AED,#EC4899)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>{listing.owner_name[0]}</span>
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>{listing.owner_name}</p>
            <p style={{ fontSize: 13, color: "#999", marginTop: 2 }}>Posted this room</p>
          </div>
        </div>
      )}

      {/* ── CTA ── */}
      <div className="px-3 mt-2">
        <button
          className="w-full py-4 rounded-2xl font-bold text-base text-white"
          style={{ background: "#111" }}
          onClick={() => router.push("/matches")}
        >
          Request to View
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
