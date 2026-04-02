"use client";

import { useEffect, useRef, useState } from "react";
import socket from "@/lib/socket";

type Message = {
  senderId: number;
  receiverId: number;
  message: string;
  status?: string;
};

export default function ChatPage({ params }: { params: { id: string } }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<number[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null); // ✅ FIX

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const userId = Number(params.id);

  // ✅ FIX: load user AFTER render (no hydration issue)
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const roomId =
    currentUser && userId
      ? [currentUser.id, userId].sort().join("_")
      : "";

  // 🔥 SOCKET SETUP
  useEffect(() => {
    if (!currentUser || !roomId) return;

    socket.emit("user_online", currentUser.id);
    socket.emit("join_room", roomId);

    const handleReceive = (data: Message) => {
      setMessages((prev) => [...prev, data]);
    };

    const handleTyping = () => {
      setTyping(true);
      setTimeout(() => setTyping(false), 1500);
    };

    const handleOnline = (users: number[]) => {
      setOnlineUsers(users);
    };

    socket.on("receive_message", handleReceive);
    socket.on("typing", handleTyping);
    socket.on("online_users", handleOnline);

    return () => {
      socket.off("receive_message", handleReceive);
      socket.off("typing", handleTyping);
      socket.off("online_users", handleOnline);
    };
  }, [roomId, currentUser]);

  // 🔥 AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 💬 SEND MESSAGE
  const sendMessage = () => {
    if (!message.trim() || !currentUser) return;

    const msgData: Message = {
      senderId: currentUser.id,
      receiverId: userId,
      message,
      status: "sent",
    };

    socket.emit("send_message", {
      ...msgData,
      roomId,
    });

    setMessages((prev) => [...prev, msgData]);
    setMessage("");
  };

  // 🟢 ONLINE CHECK
  const isOnline = onlineUsers.includes(userId);

  // ✅ FIX: prevent hydration mismatch
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-black">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">

      {/* HEADER */}
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Chat</h2>
        <span className={isOnline ? "text-green-400" : "text-gray-500"}>
          {isOnline ? "Online" : "Offline"}
        </span>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => {
          const isMe = msg.senderId === currentUser.id;

          return (
            <div
              key={i}
              className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                isMe
                  ? "bg-teal-500 text-white ml-auto"
                  : "bg-gray-800 text-white"
              }`}
            >
              {msg.message}

              {isMe && (
                <div className="text-[10px] text-right opacity-70 mt-1">
                  {msg.status === "delivered" ? "✔✔" : "✔"}
                </div>
              )}
            </div>
          );
        })}

        {/* ⌨️ TYPING */}
        {typing && (
          <p className="text-gray-400 text-sm">Typing...</p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="p-4 flex gap-2 border-t border-gray-800 bg-black">
        <input
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            socket.emit("typing", {
              roomId,
              userId: currentUser.id,
            });
          }}
          className="flex-1 p-3 rounded-full bg-gray-800 text-white outline-none"
          placeholder="Type message..."
        />

        <button
          onClick={sendMessage}
          className="bg-teal-500 px-5 py-2 rounded-full hover:bg-teal-600 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}