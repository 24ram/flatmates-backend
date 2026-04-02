"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useState } from "react";
import { swipeUser } from "../../lib/api";
import MatchPopup from "./MatchPopup";

export default function ProfileCard({ user, onNext }) {
  const x = useMotionValue(0);

  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0]);

  const [matchUser, setMatchUser] = useState(null);

  const handleDragEnd = async (_, info) => {
    if (info.offset.x > 120) await handleSwipe("like");
    else if (info.offset.x < -120) await handleSwipe("skip");
  };

  const handleSwipe = async (action) => {
    try {
      const res = await swipeUser({
        swipedId: user?.id,
        action,
      });

      if (res?.match) setMatchUser(user);

      onNext();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {matchUser && (
        <MatchPopup
          user={matchUser}
          onClose={() => setMatchUser(null)}
        />
      )}

      <motion.div
        drag="x"
        style={{ x, rotate, opacity }}
        dragElastic={0.8}
        dragConstraints={{ left: 0, right: 0 }}
        whileTap={{ scale: 0.96 }}
        onDragEnd={handleDragEnd}
        transition={{ type: "spring", stiffness: 250, damping: 18 }}
        className="absolute w-full rounded-3xl overflow-hidden bg-white/10 backdrop-blur-2xl border border-white/10 shadow-2xl"
      >
        <div className="relative">
          <img
            src={user?.avatar || "https://via.placeholder.com/400"}
            className="h-[400px] w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute bottom-5 left-5 text-white">
            <h2 className="text-2xl font-bold">
              {user?.name}, {user?.age || 21}
            </h2>
            <p className="text-sm opacity-80">
              {user?.location || user?.city || "India"}
            </p>
          </div>
        </div>

        <div className="p-5">
          <p className="text-gray-300 text-sm">
            {user?.bio || "Looking for a flatmate"}
          </p>
        </div>

        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={() => handleSwipe("skip")}
            className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition"
          >
            Skip
          </button>

          <button
            onClick={() => handleSwipe("like")}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 text-black font-semibold shadow-lg"
          >
            Like
          </button>
        </div>
      </motion.div>
    </>
  );
}