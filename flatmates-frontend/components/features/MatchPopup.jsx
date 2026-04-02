"use client";

import { motion } from "framer-motion";

export default function MatchPopup({ user, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-50">

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 w-[90%] max-w-sm text-center text-white"
      >
        <h1 className="text-2xl font-bold mb-2">
          🎉 It's a Match!
        </h1>

        <p className="text-gray-300 mb-4">
          You and {user?.name} liked each other
        </p>

        <img
          src={user?.avatar}
          className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20"
          >
            Continue
          </button>

          <button className="flex-1 py-2 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 text-black font-semibold">
            Chat
          </button>
        </div>
      </motion.div>
    </div>
  );
}