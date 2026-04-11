"use client";

import { useEffect, useState } from "react";
import BottomNav from "../components/BottomNav";
import { useRouter } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import { ProfilePromptCard, ProfileDetailsCard } from "../components/features/ProfileCards";

export default function ProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  if (!currentUser) return null;

  // Collect room photos from user_images
  let roomPhotos: string[] = [];
  if (currentUser.user_images && currentUser.user_images.length > 0) {
    roomPhotos = currentUser.user_images
      .filter((img: any) => img.type === "house")
      .map((img: any) => img.url);
  }

  // Fallback to avatar if it exists but no valid user_images yet
  const profilePhotoUrl = currentUser.avatar && currentUser.avatar.startsWith("http") 
    ? currentUser.avatar 
    : `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5000'}${currentUser.avatar || ''}`;

  return (
    <div className="min-h-screen" style={{ background: "#F2F2EF", paddingBottom: "90px" }}>
      
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 py-3">
        <h1 style={{ fontSize: 18, fontWeight: 800, color: "#111", letterSpacing: "-0.3px" }}>My Profile</h1>
        <button
          style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#000",
            cursor: "pointer",
          }}
        >
          <Settings size={20} color="#666" />
        </button>
      </div>

      {/* ── Content ── */}
      <div className="pt-4 px-3 pb-6 flex flex-col gap-4">
        
        {/* 1️⃣ Profile Header Card (Static non-swipeable) */}
        <div style={{ position: "relative", height: "520px", borderRadius: "20px", overflow: "hidden" }}>
          {currentUser.avatar ? (
            <img src={profilePhotoUrl} alt="Me" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-4xl">📸</div>
          )}
          
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.05) 50%, transparent 100%)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px" }}>
            <h2 style={{ color: "#fff", fontSize: 26, fontWeight: 700, lineHeight: 1.2 }}>
              {currentUser.name}{currentUser.age ? `, ${currentUser.age}` : ""}
            </h2>
            <p style={{ color: "#D1D5DB", fontSize: 13, marginTop: 4 }}>
              📍 {currentUser.location || currentUser.city || "India"}
            </p>
          </div>
        </div>

        {/* 2️⃣ Prompt card */}
        <ProfilePromptCard
          prompt="As a flatmate, I am"
          answer={currentUser.bio || (currentUser.lifestyle ? `${currentUser.lifestyle} and easy to live with` : "Clean, friendly and respectful")}
        />

        {/* 3️⃣ Info card */}
        <ProfileDetailsCard
          user={{
            age: currentUser.age,
            gender: currentUser.gender,
            location: currentUser.location || currentUser.city,
            lifestyle: currentUser.lifestyle,
            religion: null,
            ethnicity: null,
            relationship_type: (currentUser.smoking === true || currentUser.smoking === "true") ? "Smoker" : "Non-smoker",
            intent: currentUser.occupation ? `Works as ${currentUser.occupation}` : "Looking for flatmate",
          }}
        />

        {/* 4️⃣ Room section */}
        {roomPhotos.length > 0 && (
          <div style={{ marginTop: 10 }}>
            {/* ── Room info header card ── */}
            <div style={{ background: "#fff", borderRadius: 20, margin: "0 12px 10px", padding: "20px" }}>
               <p style={{ fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>My Room Photos</p>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "0 12px" }}>
              {roomPhotos.map((url: string, i: number) => {
                const absoluteUrl = url.startsWith("http") ? url : `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5000'}${url}`;
                return (
                  <div key={i} style={{ borderRadius: 20, overflow: "hidden", height: "260px" }}>
                    <img src={absoluteUrl} alt={`Room ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5️⃣ Settings / Logout */}
        <div style={{ padding: "16px 12px", marginTop: 20 }}>
          <button
            onClick={handleLogout}
            style={{
              width: "100%", padding: "16px", borderRadius: 16,
              background: "#fff", border: "1px solid #FFE4E6",
              color: "#E11D48", fontSize: "16px", fontWeight: "700",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 4px 12px rgba(225, 29, 72, 0.05)",
              cursor: "pointer"
            }}
          >
            <LogOut size={18} strokeWidth={2.5} /> Log Out
          </button>
        </div>

      </div>

      <BottomNav />
    </div>
  );
}
