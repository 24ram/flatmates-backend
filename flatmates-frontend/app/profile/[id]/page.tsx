"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ProfilePromptCard, ProfileDetailsCard } from "../../components/features/ProfileCards";
import { X, Heart } from "lucide-react";

// Demo user — replace with real API data
const DEMO_USER = {
  name: "Priyal",
  age: 22,
  gender: "Woman",
  height: "5' 4\"",
  location: "Mumbai",
  city: "Mumbai",
  religion: "Agnostic",
  lifestyle: "Liberal",
  ethnicity: "South Asian",
  relationship_type: "Short-term stay",
  intent: "Looking for flatmate",
  budget: 15000,
  smoking: false,
  pets: true,
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priyal",
  prompt_answer: "make a banger playlist <3",
};

export default function ProfileViewPage() {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [user] = useState(DEMO_USER);

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: "#f5f5f0" }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-4 sticky top-0 z-20"
        style={{ background: "#f5f5f0" }}>
        <h1 className="text-[17px] font-semibold text-gray-900 tracking-tight">{user.name}</h1>

        {/* Three dots */}
        <button className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "white", border: "1px solid #e5e7eb" }}>
          <span className="text-gray-500 text-lg tracking-widest leading-none font-bold">···</span>
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {/* Hero photo */}
        <div className="mx-4 rounded-3xl overflow-hidden" style={{ height: "420px" }}>
          <img
            src={user.avatar}
            alt={user.name}
            className="w-full h-full object-cover"
            style={{ background: "#e5e7eb" }}
          />
        </div>

        {/* Prompt card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ProfilePromptCard
            prompt="Together, we could"
            answer={user.prompt_answer}
            onLike={() => setLiked(l => !l)}
          />
        </motion.div>

        {/* Details card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ProfileDetailsCard user={user} />
        </motion.div>

        {/* Second photo placeholder */}
        <div className="mx-4 rounded-3xl overflow-hidden bg-gray-200" style={{ height: "300px" }}>
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            More photos coming soon
          </div>
        </div>
      </div>

      {/* Bottom action bar — X and Heart like Hinge */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center gap-6 z-30">
        <button
          onClick={() => router.back()}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          style={{ background: "white", border: "1.5px solid #e5e7eb", boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}
        >
          <X size={22} strokeWidth={2} className="text-gray-500" />
        </button>

        <button
          onClick={() => setLiked(l => !l)}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          style={{
            background: liked ? "linear-gradient(135deg, #7C3AED, #EC4899)" : "white",
            border: "1.5px solid #e5e7eb",
            boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
          }}
        >
          <Heart
            size={22}
            strokeWidth={liked ? 0 : 2}
            fill={liked ? "white" : "none"}
            className={liked ? "text-white" : "text-rose-400"}
          />
        </button>
      </div>
    </div>
  );
}
