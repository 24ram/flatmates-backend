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
  const [userListings, setUserListings] = useState<Record<number, any[]>>({});
  
  // Photo Onboarding
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [files, setFiles] = useState<{ profile: File | null; house1: File | null; house2: File | null }>({ profile: null, house1: null, house2: null });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const currentUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "null")
      : null;

  useEffect(() => {
    (async () => {
      try {
        if (currentUser && (!currentUser.user_images || currentUser.user_images.length < 3)) {
          setShowPhotoUpload(true);
        }

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

  // Collect room photos from their listings or user_images
  let roomPhotos: string[] = [];
  if (person?.user_images && person.user_images.length > 0) {
    roomPhotos = person.user_images.filter((img: any) => img.type === "house").map((img: any) => img.url);
  } else {
    roomPhotos = personListings.flatMap((l: any) => l.images || []).slice(0, 4);
    if (roomPhotos.length === 0 && person) {
      const fallback = ROOM_PHOTOS[index % 5] || ROOM_PHOTOS[0];
      roomPhotos.push(...fallback);
    }
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
            {/* 1️⃣ Profile photo card */}
            <div className="px-3 pt-3 relative">
              <ProfileCard user={person} onNext={handleNext} score={currentScore?.score} />
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
                        src={url.startsWith("http") ? url : `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5000'}${url}`}
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

      <AnimatePresence>
        {showPhotoUpload && (
          <motion.div initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }}
            className="fixed inset-0 z-[100] flex flex-col bg-white overflow-y-auto"
            style={{ maxWidth: "430px", left: "50%", transform: "translateX(-50%)" }}>
            
            <div className="flex-1 flex flex-col p-6 pt-12 pb-12">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Build your profile</h2>
              <p className="text-gray-500 mb-6 text-sm">Upload 1 Profile Photo and 2 House Photos to continue.</p>

              <div className="flex flex-col gap-4">
                {/* Profile Photo */}
                <div className="w-full">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Profile Photo (Required)</p>
                  <label className="block w-full aspect-square max-h-[220px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden"
                    style={{ borderColor: files.profile ? "#111" : "#D1D5DB", background: files.profile ? "#fff" : "#F9FAFB" }}>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFiles(p => ({...p, profile: f})); }} />
                    {files.profile ? <img src={URL.createObjectURL(files.profile)} alt="profile preview" className="w-full h-full object-cover" /> : <div className="text-gray-400 flex flex-col items-center"><span className="text-3xl mb-1">👤</span><span className="text-sm font-semibold">Tap to upload</span></div>}
                  </label>
                </div>

                <div className="w-full flex gap-3">
                  {/* House 1 */}
                  <div className="flex-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">House Photo 1</p>
                    <label className="block w-full aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden"
                      style={{ borderColor: files.house1 ? "#111" : "#D1D5DB", background: files.house1 ? "#fff" : "#F9FAFB" }}>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFiles(p => ({...p, house1: f})); }} />
                      {files.house1 ? <img src={URL.createObjectURL(files.house1)} alt="preview" className="w-full h-full object-cover" /> : <div className="text-gray-400 flex flex-col items-center"><span className="text-2xl mb-1">🏠</span></div>}
                    </label>
                  </div>
                  {/* House 2 */}
                  <div className="flex-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">House Photo 2</p>
                    <label className="block w-full aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden"
                      style={{ borderColor: files.house2 ? "#111" : "#D1D5DB", background: files.house2 ? "#fff" : "#F9FAFB" }}>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFiles(p => ({...p, house2: f})); }} />
                      {files.house2 ? <img src={URL.createObjectURL(files.house2)} alt="preview" className="w-full h-full object-cover" /> : <div className="text-gray-400 flex flex-col items-center"><span className="text-2xl mb-1">🏠</span></div>}
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <button 
                  onClick={async () => {
                    if (!files.profile || !files.house1 || !files.house2) return;
                    setUploadingPhoto(true);
                    try {
                      const formData = new FormData();
                      formData.append("images", files.profile);
                      formData.append("images", files.house1);
                      formData.append("images", files.house2);
                      const backendUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5000';
                      
                      const uploadRes = await fetch(`${backendUrl}/api/upload`, {
                        method: "POST",
                        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                        body: formData
                      });
                      
                      const uploadData = await uploadRes.json();
                      if (!uploadRes.ok) {
                        throw new Error(uploadData.error || "Upload failed from server");
                      }
                      if (uploadData.urls && uploadData.urls.length >= 3) {
                        const avatarUrl = uploadData.urls[0];
                        const user_images = [
                          { url: uploadData.urls[0], type: "profile" },
                          { url: uploadData.urls[1], type: "house" },
                          { url: uploadData.urls[2], type: "house" }
                        ];
                        
                        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/profile`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
                            body: JSON.stringify({ avatar: avatarUrl, user_images })
                        });
                        
                        const updatedUser = { ...currentUser, avatar: avatarUrl, user_images };
                        localStorage.setItem("user", JSON.stringify(updatedUser));
                        setShowPhotoUpload(false);
                      }
                    } catch (e: any) {
                      alert(`Upload failed: ${e.message}`);
                    } finally {
                      setUploadingPhoto(false);
                    }
                  }}
                  disabled={!files.profile || !files.house1 || !files.house2 || uploadingPhoto}
                  className="btn-gradient w-full py-4 rounded-2xl font-bold text-white text-lg transition-transform"
                  style={{ opacity: (!files.profile || !files.house1 || !files.house2) ? 0.6 : 1 }}
                >
                  {uploadingPhoto ? "Uploading..." : "Save Profile"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}