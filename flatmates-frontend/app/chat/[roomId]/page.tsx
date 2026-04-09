"use client";

import { useEffect, useRef, useState, use } from "react";
import socket from "@/lib/socket";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

type Message = {
  id: string;
  senderId: number;
  receiverId: number;
  message: string;
  status: "sent" | "delivered";
};

export default function ChatPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId: roomIdParam } = use(params);
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<number[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const userId = Number(roomIdParam);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setCurrentUser(JSON.parse(user));
  }, []);

  const roomId = currentUser && userId ? [currentUser.id, userId].sort().join("_") : "";

  useEffect(() => {
    if (!currentUser || !roomId) return;
    socket.emit("user_online", currentUser.id);
    socket.emit("join_room", roomId);

    // ✅ Other person's message arrives → show it + emit seen
    const handleReceive = (data: Message) => {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.message === data.message && last.senderId === data.senderId) return prev;
        return [...prev, { ...data, id: data.id || Date.now().toString() }];
      });

      // Tell sender we received it
      if (data.senderId !== currentUser.id) {
        socket.emit("message_seen", {
          senderId: data.senderId,
          messageId: data.id,
          roomId,
        });
      }
    };

    // ✅ Our message was seen by recipient → upgrade to ✓✓
    const handleDelivered = ({ messageId }: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, status: "delivered" } : m))
      );
    };

    const handleTyping = () => { setTyping(true); setTimeout(() => setTyping(false), 1500); };
    const handleOnline = (users: number[]) => setOnlineUsers(users);

    socket.on("receive_message", handleReceive);
    socket.on("message_delivered", handleDelivered);
    socket.on("typing", handleTyping);
    socket.on("online_users", handleOnline);

    return () => {
      socket.off("receive_message", handleReceive);
      socket.off("message_delivered", handleDelivered);
      socket.off("typing", handleTyping);
      socket.off("online_users", handleOnline);
    };
  }, [roomId, currentUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim() || !currentUser) return;
    const id = Date.now().toString();
    const msgData: Message = {
      id,
      senderId: currentUser.id,
      receiverId: userId,
      message: message.trim(),
      status: "sent",
    };
    // Add locally immediately with single tick ✓
    setMessages((prev) => [...prev, msgData]);
    socket.emit("send_message", { ...msgData, roomId });
    setMessage("");
  };

  const isOnline = onlineUsers.includes(userId);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>

      {/* Header */}
      <div className="glass border-b px-4 py-4 flex items-center gap-3"
        style={{ borderColor: "var(--border)" }}>
        <button onClick={() => router.back()}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-70"
          style={{ background: "rgba(255,255,255,0.05)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>

        <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
          style={{ background: "linear-gradient(135deg, #7C3AED, #EC4899)" }}>
          {String(userId)}
        </div>

        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Flatmate #{String(userId)}</p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: isOnline ? "var(--success)" : "var(--muted)" }} />
            <span className="text-xs" style={{ color: isOnline ? "var(--success)" : "var(--muted)" }}>
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="text-4xl mb-3">👋</div>
            <p className="text-sm font-medium text-white">Say hello!</p>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Start the conversation</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMe = msg.senderId === currentUser.id;
          return (
            <motion.div
              key={msg.id || i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className="max-w-[72%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                style={isMe ? {
                  background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                  color: "white",
                  borderBottomRightRadius: "4px",
                } : {
                  background: "var(--surface2)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                  borderBottomLeftRadius: "4px",
                }}
              >
                {msg.message}
                {isMe && (
                  <div className="text-[10px] text-right mt-1" style={{ opacity: 0.75 }}>
                    {msg.status === "delivered" ? "✓✓" : "✓"}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {typing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1 items-center px-1 py-2">
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{ background: "var(--muted)", animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
            <span className="text-xs ml-1" style={{ color: "var(--muted)" }}>typing...</span>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 glass border-t flex gap-2 items-center"
        style={{ borderColor: "var(--border)" }}>
        <input
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            socket.emit("typing", { roomId, userId: currentUser.id });
          }}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="input-field flex-1 px-4 py-3 rounded-xl text-sm"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="w-11 h-11 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          style={{ background: "linear-gradient(135deg, #7C3AED, #EC4899)", boxShadow: "0 0 16px rgba(124,58,237,0.3)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}