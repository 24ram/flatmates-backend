"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";

const SEED_PHOTOS = [
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80",
  "https://images.unsplash.com/photo-1507081323647-4d250478b919?w=600&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80",
];

function getPhoto(user) {
  if (user.avatar && user.avatar.startsWith("http")) return user.avatar;
  if (user.photo_url) return user.photo_url;
  return SEED_PHOTOS[(user.id || 0) % SEED_PHOTOS.length];
}

export default function ProfileCard({ user, onNext, score }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const likeOpacity = useTransform(x, [30, 120], [0, 1]);
  const skipOpacity = useTransform(x, [-120, -30], [1, 0]);

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 100) onNext("like");
    else if (info.offset.x < -100) onNext("skip");
  };

  const photo = getPhoto(user);

  const scoreColor =
    !score ? "#94A3B8" :
    score >= 75 ? "#10B981" :
    score >= 50 ? "#7C3AED" : "#EC4899";

  return (
    <motion.div
      drag="x"
      style={{ x, rotate, height: "520px", position: "relative", borderRadius: "20px", overflow: "hidden" }}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.75}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 0.99 }}
      className="cursor-grab active:cursor-grabbing select-none"
    >
      {/* Photo */}
      <img
        src={photo}
        alt={user.name}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />

      {/* Bottom gradient */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.05) 50%, transparent 100%)"
      }} />

      {/* LIKE stamp */}
      <motion.div
        style={{ opacity: likeOpacity, position: "absolute", top: 32, left: 20 }}
        className="px-4 py-2 rounded-xl font-black text-2xl border-4 border-green-400 text-green-400 -rotate-12"
      >
        LIKE
      </motion.div>

      {/* NOPE stamp */}
      <motion.div
        style={{ opacity: skipOpacity, position: "absolute", top: 32, right: 20 }}
        className="px-4 py-2 rounded-xl font-black text-2xl border-4 border-red-400 text-red-400 rotate-12"
      >
        NOPE
      </motion.div>

      {/* Match badge */}
      {score !== undefined && (
        <div style={{
          position: "absolute", top: 16, left: 16,
          background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)",
          border: `1.5px solid ${scoreColor}`,
          borderRadius: 16, padding: "6px 12px"
        }}>
          <span style={{ color: scoreColor, fontWeight: 900, fontSize: 14 }}>{score}%</span>
          <span style={{ color: "#9CA3AF", fontSize: 10, marginLeft: 4 }}>match</span>
        </div>
      )}

      {/* Name + location — bottom overlay */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px" }}>
        <h2 style={{ color: "#fff", fontSize: 26, fontWeight: 700, lineHeight: 1.2 }}>
          {user.name}{user.age ? `, ${user.age}` : ""}
        </h2>
        <p style={{ color: "#D1D5DB", fontSize: 13, marginTop: 4 }}>
          📍 {user.location || user.city || "India"}
        </p>
      </div>
    </motion.div>
  );
}