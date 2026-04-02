"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function MatchModal({ matchUser, onClose }) {
  const router = useRouter();

  const handleStartChat = () => {
    onClose(); // close modal
    router.push(`/chat/${matchUser.id}`); // navigate to chat
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl p-8 text-center shadow-lg"
      >
        <h1 className="text-4xl font-bold text-pink-500 mb-4">
          🎉 It's a Match!
        </h1>

        <p className="text-gray-600 mb-6">
          You and{" "}
          <span className="font-semibold">
            {matchUser?.name}
          </span>{" "}
          liked each other
        </p>

        <button
          onClick={handleStartChat}
          className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition"
        >
          Start Chat
        </button>
      </motion.div>
    </div>
  );
}