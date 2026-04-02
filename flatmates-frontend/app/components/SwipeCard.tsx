"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";

type User = {
  id: number;
  name: string;
  avatar?: string;
};

export default function SwipeCard({
  user,
  onSwipe,
}: {
  user: User;
  onSwipe: (liked: boolean, user: User) => void;
}) {
  const x = useMotionValue(0);

  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, 0, 200], [0.6, 1, 0.6]);

  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x > 100) {
      onSwipe(true, user);
    } else if (info.offset.x < -100) {
      onSwipe(false, user);
    }
  };

  return (
    <motion.div
      className="absolute w-80 h-[420px] rounded-2xl overflow-hidden shadow-xl"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
    >
      {/* IMAGE */}
      <img
        src={
          user.avatar ||
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e"
        }
        className="w-full h-full object-cover"
      />

      {/* GRADIENT OVERLAY */}
      <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black via-transparent">
        <h2 className="text-white text-xl font-bold">{user.name}</h2>
      </div>

      {/* LIKE TEXT */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute top-5 left-5 text-green-500 text-3xl font-bold"
      >
        LIKE
      </motion.div>

      {/* NOPE TEXT */}
      <motion.div
        style={{ opacity: nopeOpacity }}
        className="absolute top-5 right-5 text-red-500 text-3xl font-bold"
      >
        NOPE
      </motion.div>
    </motion.div>
  );
}