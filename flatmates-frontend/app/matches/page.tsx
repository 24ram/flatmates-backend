"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import BottomNav from "../components/BottomNav";

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { window.location.href = "/login"; return; }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/matches`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) { setMatches([]); return; }
        const data = await res.json();
        setMatches(Array.isArray(data) ? data : []);
      } catch { setMatches([]); }
      finally { setLoading(false); }
    };
    fetchMatches();
  }, []);

  return (
    <div className="min-h-screen pb-28 pt-8 px-4" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div className="max-w-sm mx-auto mb-6">
        <h1 className="text-xl font-bold text-gray-900">Your Matches</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
          {matches.length > 0 ? `${matches.length} match${matches.length !== 1 ? "es" : ""}` : "No matches yet"}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center mt-20">
          <div className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
        </div>
      ) : matches.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="max-w-sm mx-auto glass rounded-3xl p-10 text-center mt-8"
        >
          <div className="text-5xl mb-4">💜</div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">No matches yet</h2>
          <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>Keep swiping — your perfect flatmate is out there!</p>
          <button onClick={() => router.push("/dashboard")} className="btn-gradient px-6 py-2.5 rounded-xl text-sm font-semibold">
            Start Swiping
          </button>
        </motion.div>
      ) : (
        <div className="max-w-sm mx-auto grid grid-cols-2 gap-3">
          {matches.map((user: any, i: number) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => router.push(`/chat/${user.id}`)}
              className="glass rounded-2xl p-4 flex flex-col items-center gap-3 cursor-pointer transition-all hover:scale-105"
              style={{ border: "1px solid var(--border)" }}
            >
              {/* Avatar */}
              <div className="relative">
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  className="w-16 h-16 rounded-full object-cover"
                  style={{ border: "2px solid rgba(124,58,237,0.4)" }}
                />
                {/* Online dot placeholder */}
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                  style={{ background: "var(--success)", borderColor: "var(--surface)" }} />
              </div>

              <div className="text-center">
                <p className="text-sm font-semibold text-gray-900 leading-tight">{user.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                  {user.city || "Unknown"}
                </p>
              </div>

              <button className="w-full py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{ background: "rgba(124,58,237,0.15)", color: "#A78BFA", border: "1px solid rgba(124,58,237,0.3)" }}>
                Message
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
}