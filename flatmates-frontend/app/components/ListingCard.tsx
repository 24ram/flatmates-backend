"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { MapPin, Wifi, Wind, Car, Dumbbell, MessageCircle } from "lucide-react";

const amenityIcons: Record<string, any> = {
  wifi: Wifi, ac: Wind, parking: Car, gym: Dumbbell,
};

const BACKEND_URL = "http://localhost:5000";

export default function ListingCard({ listing, index = 0 }: { listing: any; index?: number }) {
  const router = useRouter();

  const img = listing.images?.[0]
    ? (listing.images[0].startsWith("http") ? listing.images[0] : `${BACKEND_URL}${listing.images[0]}`)
    : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80";

  const amenities: string[] = listing.amenities || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      onClick={() => router.push(`/listings/${listing.id}`)}
      className="cursor-pointer group"
    >
      {/* Image */}
      <div className="relative rounded-2xl overflow-hidden mb-3" style={{ height: "220px" }}>
        <img
          src={img}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Amenity pill overlays */}
        {amenities.length > 0 && (
          <div className="absolute bottom-3 left-3 flex gap-1.5">
            {amenities.slice(0, 3).map((a: string, i: number) => (
              <span key={i}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                style={{ background: "rgba(0,0,0,0.6)", color: "#fff", backdropFilter: "blur(6px)" }}>
                {a}
              </span>
            ))}
            {amenities.length > 3 && (
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                style={{ background: "rgba(0,0,0,0.6)", color: "#fff", backdropFilter: "blur(6px)" }}>
                +{amenities.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Prefs top-right */}
        <div className="absolute top-3 right-3 flex gap-1">
          {!listing.smoking_ok && (
            <span className="text-[10px] px-2 py-1 rounded-full font-medium"
              style={{ background: "rgba(255,255,255,0.92)", color: "#555" }}>🚭</span>
          )}
          {listing.pets_ok && (
            <span className="text-[10px] px-2 py-1 rounded-full font-medium"
              style={{ background: "rgba(255,255,255,0.92)", color: "#555" }}>🐾</span>
          )}
        </div>

        {/* Message overlay bottom-right */}
        <button 
          onClick={(e) => { e.stopPropagation(); router.push(`/chat/${listing.owner_id}`); }}
          className="absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-10"
          style={{ background: "linear-gradient(135deg,#7C3AED,#EC4899)", color: "#fff" }}
        >
          <MessageCircle size={15} />
        </button>
      </div>

      {/* Info below image — Airbnb style */}
      <div className="px-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-gray-900 truncate leading-tight">{listing.title}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={11} className="text-gray-400 shrink-0" />
              <p className="text-[12px] text-gray-400 truncate">{listing.location || listing.city}</p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[13px] font-bold text-gray-900">₹{Number(listing.rent).toLocaleString()}</p>
            <p className="text-[10px] text-gray-400">/month</p>
          </div>
        </div>

        {listing.owner_name && (
          <div className="flex items-center gap-1.5 mt-2">
            <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
              style={{ background: "linear-gradient(135deg,#7C3AED,#EC4899)", flexShrink: 0 }}>
              {listing.owner_name[0]}
            </div>
            <p className="text-[11px] text-gray-400">{listing.owner_name}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
