"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          window.location.href = "/login";
          return;
        }

        const res = await fetch("http://localhost:5000/api/matches", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error("API ERROR:", await res.text());
          setMatches([]);
          return;
        }

        const data = await res.json();
        setMatches(data);

      } catch (err) {
        console.error("FETCH FAILED:", err);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">

      <h1 className="text-xl mb-6">Your Matches 💬</h1>

      {matches.length === 0 ? (
        <p className="text-gray-400">No matches yet</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {matches.map((user) => (
            <div
              key={user.id}
              onClick={() => router.push(`/chat/${user.id}`)}
              className="bg-gray-900 p-4 rounded-xl cursor-pointer"
            >
              <img
                src={user.avatar || "https://via.placeholder.com/150"}
                className="w-20 h-20 rounded-full mb-2"
              />
              <p>{user.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}