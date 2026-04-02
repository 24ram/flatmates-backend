"use client";

import { useEffect, useState } from "react";
import { getUsers, swipeUser } from "@/lib/api";
import ProfileCard from "@/components/features/ProfileCard";

export default function Dashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [index, setIndex] = useState(0);

  const currentUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "null")
      : null;

  // 🔥 FETCH USERS
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();

        // remove current user
        const filtered = data.filter((u: any) => u.id !== currentUser?.id);

        setUsers(filtered);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, []);

  // 🔥 HANDLE SWIPE
  const handleNext = async (action: "like" | "skip") => {
    const user = users[index];

    try {
      await swipeUser({
        swipedId: user.id,
        action,
      });
    } catch (err) {
      console.error(err);
    }

    setIndex((prev) => prev + 1);
  };

  if (!users.length) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading users...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">

      {/* HEADER */}
      <h1 className="text-2xl font-semibold mb-6">
        Find Your Flatmate 🏡
      </h1>

      {/* CARD */}
      <div className="w-full max-w-sm">
        {users[index] && (
          <ProfileCard user={users[index]} onNext={handleNext} />
        )}
      </div>

    </div>
  );
}