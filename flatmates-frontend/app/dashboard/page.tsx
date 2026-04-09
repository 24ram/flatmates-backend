"use client";

import { useEffect, useState } from "react";
import { getUsers, swipeUser, getScore, getListings } from "@/lib/api";
import ProfileCard from "../components/features/ProfileCard";
import { ProfilePromptCard, ProfileDetailsCard } from "../components/features/ProfileCards";
import BottomNav from "../components/BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { LogOut, X, Heart } from "lucide-react";


// Unsplash room photos for users who haven't posted a listing
const ROOM_PHOTOS: Record<number, string[]> = {
  0: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80"],
  1: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80"],
  2: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80"],
  3: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80"],
  4: ["https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=600&q=80"],
};

export default function Dashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<Record<number, { score: number; explanation: string }>>({});
  const [matchedUser, setMatchedUser] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [userListings, setUserListings] = useState<Record<number, any[]>>({});

  const currentUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "null")
      : null;

  useEffect(() => {
    (async () => {
      try {
        const data = await getUsers();
        if (!data || !Array.isArray(data)) return;
        const filtered = data.filter((u: any) => u.id !== currentUser?.id);
        setUsers(filtered);

        // Scores
        const scoreResults = await Promise.allSettled(filtered.map((u: any) => getScore(u.id)));
        const scoreMap: Record<number, any> = {};
        scoreResults.forEach((res, i) => {
          if (res.status === "fulfilled" && res.value?.score !== undefined)
            scoreMap[filtered[i].id] = res.value;
        });
        setScores(scoreMap);

        // Listings per user
        try {
          const allListings = await getListings();
          if (Array.isArray(allListings)) {
            const listingMap: Record<number, any[]> = {};
            allListings.forEach((l: any) => {
              if (!listingMap[l.owner_id]) listingMap[l.owner_id] = [];
              listingMap[l.owner_id].push(l);
            });
            setUserListings(listingMap);
          }
        } catch {}
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleNext = async (action: "like" | "skip") => {
    const user = users[index];
    try {
      const res = await swipeUser({ swiped_id: user.id, liked: action === "like" });
      if (res?.match) setMatchedUser(user);
    } catch (err) { console.error(err); }
    setIndex((prev) => prev + 1);
  };

  const handleLogout = () => { localStorage.clear(); router.push("/login"); };

  const person = users[index];
  const currentScore = person ? scores[person.id] : undefined;
  const personListings = person ? (userListings[person.id] || []) : [];

  // Collect room photos from their listings or fallback
  const roomPhotos: string[] = personListings.flatMap((l: any) => l.images || []).slice(0, 4);
  if (roomPhotos.length === 0 && person) {
    const fallback = ROOM_PHOTOS[index % 5] || ROOM_PHOTOS[0];
    roomPhotos.push(...fallback);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-7 h-7 border-2 rounded-full animate-spin"
          style={{ borderColor: "#111", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#F2F2EF", paddingBottom: "90px" }}>

      {/* ── Content ── */}
      <AnimatePresence mode="wait">
        {person ? (
          <motion.div
            key={person.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
          >
            {/* 1️⃣ Profile photo card + floating U button overlay */}
            <div className="px-3 pt-3 relative">
              <ProfileCard user={person} onNext={handleNext} score={currentScore?.score} />

              {/* ── Floating avatar / menu — top-right of the photo ── */}
              <div style={{ position: "absolute", top: 24, right: 24, zIndex: 20 }}>
                <button
                  onClick={() => setShowMenu(m => !m)}
                  style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: "linear-gradient(135deg,#7C3AED,#EC4899)",
                    border: "2px solid rgba(255,255,255,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 14, color: "#fff",
                    cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
                  }}
                >
                  {currentUser?.name?.[0]?.toUpperCase() || "?"}
                </button>

                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92 }}
                      style={{
                        position: "absolute", top: 48, right: 0,
                        width: 176, background: "#fff", borderRadius: 16,
                        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                        border: "1px solid rgba(0,0,0,0.07)",
                        overflow: "hidden", zIndex: 50,
                      }}
                    >
                      <div style={{ padding: "14px 16px", borderBottom: "1px solid #F0F0F0" }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>{currentUser?.name}</p>
                        <p style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>{currentUser?.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", gap: 10,
                          padding: "12px 16px", fontSize: 14, color: "#EF4444",
                          background: "transparent", border: "none", cursor: "pointer",
                        }}
                      >
                        <LogOut size={14} /> Log out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* 2️⃣ Prompt card */}
            <ProfilePromptCard
              prompt="As a flatmate, I am"
              answer={person.bio || (person.lifestyle ? `${person.lifestyle} and easy to live with` : "Clean, friendly and respectful")}
              onLike={() => handleNext("like")}
            />

            {/* 3️⃣ Info card */}
            <ProfileDetailsCard
              user={{
                age: person.age,
                gender: person.gender,
                location: person.location || person.city,
                lifestyle: person.lifestyle,
                religion: null,
                ethnicity: null,
                relationship_type: (person.smoking === true || person.smoking === "true") ? "Smoker" : "Non-smoker",
                intent: person.occupation ? `Works as ${person.occupation}` : "Looking for flatmate",
              }}
            />

            {/* 4️⃣ Budget card */}
            {person.budget && (
              <div style={{
                background: "#fff", borderRadius: 20,
                margin: "10px 12px 0", padding: "20px",
              }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Monthly Budget</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: "#111", letterSpacing: "-0.5px" }}>
                  ₹{Number(person.budget).toLocaleString()}
                  <span style={{ fontSize: 14, fontWeight: 400, color: "#aaa", marginLeft: 4 }}>/month</span>
                </p>
              </div>
            )}

            {/* 5️⃣ Room section */}
            {roomPhotos.length > 0 && (
              <div style={{ marginTop: 10 }}>

                {/* ── Room info header card ── */}
                <div style={{
                  background: "#fff", borderRadius: 20, margin: "0 12px 10px",
                  padding: "20px 20px 18px",
                }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Room</p>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <p style={{ fontSize: 20, fontWeight: 800, color: "#111", letterSpacing: "-0.3px", flex: 1 }}>
                      {personListings.length > 0 ? personListings[0].title : `${person.name}'s Room`}
                    </p>
                    {personListings.length > 0 && (
                      <p style={{ fontSize: 18, fontWeight: 800, color: "#111", whiteSpace: "nowrap" }}>
                        ₹{Number(personListings[0].rent).toLocaleString()}
                        <span style={{ fontSize: 12, fontWeight: 400, color: "#aaa" }}>/mo</span>
                      </p>
                    )}
                  </div>
                  {personListings[0]?.location && (
                    <p style={{ fontSize: 13, color: "#999", marginTop: 6 }}>
                      📍 {personListings[0].location}
                    </p>
                  )}
                </div>

                {/* ── Room photos — full bleed with side margin ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "0 12px" }}>
                  {roomPhotos.map((url: string, i: number) => (
                    <div key={i} style={{ borderRadius: 20, overflow: "hidden", height: 260 }}>
                      <img
                        src={url.startsWith("http") ? url : `http://localhost:5000${url}`}
                        alt={`Room ${i + 1}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                  ))}

                  {/* Amenity chips — own white card */}
                  {personListings[0]?.amenities?.length > 0 && (
                    <div style={{
                      background: "#fff", borderRadius: 20,
                      padding: "16px 18px", display: "flex", flexWrap: "wrap", gap: 8
                    }}>
                      {personListings[0].amenities.map((a: string, i: number) => (
                        <span key={i} style={{
                          fontSize: 14, fontWeight: 500, color: "#333",
                          padding: "8px 16px", borderRadius: 50,
                          background: "#F5F5F3", border: "1px solid #EBEBEB"
                        }}>
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Action Buttons — lower, more breathing room ── */}
            <div style={{ display: "flex", justifyContent: "center", gap: 40, padding: "40px 0 16px" }}>
              <motion.button
                whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.08 }}
                onClick={() => handleNext("skip")}
                style={{
                  width: 68, height: 68, borderRadius: "50%",
                  background: "#fff", border: "1.5px solid #E5E5E5",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                }}>
                <X size={26} strokeWidth={2} color="#aaa" />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.08 }}
                onClick={() => handleNext("like")}
                style={{
                  width: 68, height: 68, borderRadius: "50%",
                  background: "#fff", border: "1.5px solid #E5E5E5",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                }}>
                <Heart size={26} strokeWidth={2} fill="#EC4899" color="#EC4899" />
              </motion.button>
            </div>

          </motion.div>

        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="m-4 mt-8 bg-white rounded-3xl p-12 flex flex-col items-center gap-4 text-center"
            style={{ border: "1px solid #F0F0F0" }}>
            <div className="text-6xl">🎉</div>
            <h2 className="text-xl font-bold text-gray-900">You&apos;ve seen everyone!</h2>
            <p className="text-sm text-gray-400">Check back later for new flatmates.</p>
            <button onClick={() => setIndex(0)}
              className="mt-2 px-8 py-3 rounded-2xl text-sm font-semibold text-white"
              style={{ background: "#111" }}>
              Start Over
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Match Modal ── */}
      <AnimatePresence>
        {matchedUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: "rgba(0,0,0,0.5)", maxWidth: "430px", left: "50%", transform: "translateX(-50%)" }}
            onClick={() => setMatchedUser(null)}>
            <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-t-3xl px-8 pt-8 pb-14 text-center w-full"
              style={{ boxShadow: "0 -8px 40px rgba(0,0,0,0.12)" }}>
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">It&apos;s a Match!</h2>
              <p className="text-base font-semibold text-gray-800">{matchedUser.name}</p>
              {scores[matchedUser.id] && (
                <p className="text-sm mt-0.5 mb-1" style={{ color: "#7C3AED" }}>
                  {scores[matchedUser.id].score}% compatible
                </p>
              )}
              <p className="text-sm text-gray-400 mb-6">You both liked each other!</p>
              <button className="w-full py-3.5 rounded-2xl font-semibold text-white"
                style={{ background: "#111" }} onClick={() => setMatchedUser(null)}>
                Keep Swiping
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}