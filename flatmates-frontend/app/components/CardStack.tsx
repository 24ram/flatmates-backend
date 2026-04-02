"use client";

import { useState } from "react";
import SwipeCard from "./SwipeCard";

type User = {
  id: number;
  name: string;
  avatar?: string;
};

export default function CardStack({
  users,
  onSwipe,
}: {
  users: User[];
  onSwipe: (liked: boolean, user: User) => void;
}) {
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState<User[]>([]);

  const handleSwipe = (liked: boolean, user: User) => {
    onSwipe(liked, user);

    setHistory((prev) => [...prev, user]);
    setIndex((prev) => prev + 1);
  };

  const handleUndo = () => {
    if (history.length === 0) return;

    setHistory((prev) => prev.slice(0, -1));
    setIndex((prev) => Math.max(prev - 1, 0));
  };

  const currentUser = users[index];

  if (index >= users.length) {
    return (
      <div className="text-white text-center mt-10">
        <h2 className="text-xl font-semibold">No more users 😅</h2>
        <button
          onClick={handleUndo}
          className="mt-4 bg-yellow-500 text-black px-4 py-2 rounded"
        >
          ↩ Undo
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-80 h-[420px]">
        {users
          .slice(index)
          .map((user, i) => (
            <div
              key={user.id}
              style={{
                zIndex: users.length - i,
                transform: `scale(${1 - i * 0.05}) translateY(${i * 10}px)`,
              }}
            >
              <SwipeCard user={user} onSwipe={handleSwipe} />
            </div>
          ))
          .reverse()}
      </div>

      {/* 🔥 ACTION BUTTONS */}
      {currentUser && (
        <div className="flex gap-6 mt-6">
          <button
            onClick={() => handleSwipe(false, currentUser)}
            className="bg-red-500 text-white px-6 py-3 rounded-full shadow hover:bg-red-600 hover:scale-110 active:scale-95 transition transform"
          >
            ❌ Skip
          </button>

          <button
            onClick={() => handleSwipe(true, currentUser)}
            className="bg-green-500 text-white px-6 py-3 rounded-full shadow hover:bg-green-600 hover:scale-110 active:scale-95 transition transform"
          >
            ❤️ Like
          </button>

          {/* 🔥 UNDO BUTTON */}
          <button
            onClick={handleUndo}
            className="bg-yellow-400 text-black px-6 py-3 rounded-full shadow hover:scale-110 active:scale-95 transition transform"
          >
            ↩ Undo
          </button>
        </div>
      )}
    </div>
  );
}