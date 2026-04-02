"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";

export default function ProfileCard({ user, onNext }) {
  const x = useMotionValue(0);

  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 120) {
      onNext("like");
    } else if (info.offset.x < -120) {
      onNext("skip");
    }
  };

  return (
    <motion.div
      drag="x"
      style={{ x, rotate, opacity }}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 0.95 }}
      className="relative rounded-3xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing"
    >
      {/* IMAGE */}
      <img
        src={user.avatar || "https://via.placeholder.com/400"}
        className="h-[420px] w-full object-cover"
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      {/* INFO */}
      <div className="absolute bottom-6 left-4 text-white">
        <h2 className="text-2xl font-bold">
          {user.name}, {user.age || 21}
        </h2>
        <p className="text-sm text-gray-300">
          {user.location || user.city || "Unknown"}
        </p>
      </div>

      {/* BUTTONS */}
      <div className="absolute bottom-6 right-4 flex gap-3">
        <button
          onClick={() => onNext("skip")}
          className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full hover:bg-white/30"
        >
          ❌
        </button>

        <button
          onClick={() => onNext("like")}
          className="bg-teal-500 px-4 py-2 rounded-full hover:bg-teal-600"
        >
          ❤️
        </button>
      </div>
    </motion.div>
  );
}