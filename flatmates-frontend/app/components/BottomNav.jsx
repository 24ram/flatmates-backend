"use client";

import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Home, Heart, MessageCircle, User } from "lucide-react";

const navItems = [
  { label: "Discover", route: "/dashboard",  Icon: Search },
  { label: "Listings",  route: "/listings",   Icon: Home },
  { label: "Matches",   route: "/matches",    Icon: Heart },
  { label: "Chat",      route: "/matches",    Icon: MessageCircle }, // Chat could be a separate route, mapped to matches for now
  { label: "Profile",   route: "/profile",    Icon: User },
];

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    /*
      KEY FIX: fixed + left-50% + translateX(-50%) + maxWidth 430px
      This keeps the nav pinned to the BOTTOM of our centered container,
      not the full browser viewport.
    */
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: "680px",
        background: "#fff",
        borderTop: "1px solid #F0F0F0",
        zIndex: 50,
      }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ label, route, Icon }) => {
          const active = pathname === route || (route !== "/matches" && pathname.startsWith(route));
          return (
            <button
              key={label}
              onClick={() => router.push(route)}
              className="relative flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all"
            >
              {active && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: "rgba(0,0,0,0.05)" }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
                />
              )}
              <Icon
                size={22}
                strokeWidth={active ? 2.2 : 1.6}
                className="relative z-10 transition-colors"
                style={{ color: active ? "#111" : "#BBBBBB" }}
              />
              <span
                className="text-[10px] font-semibold relative z-10 transition-colors"
                style={{ color: active ? "#111" : "#BBBBBB" }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}