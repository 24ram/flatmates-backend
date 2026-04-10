"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token && token !== "undefined" && token !== "null") router.push("/dashboard");
  }, []);

  const handleLogin = async () => {
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.user || !data.token) { setError(data.message || "Login failed"); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userId", data.user.id.toString());
      router.push("/dashboard");
    } catch { setError("Something went wrong. Try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5"
      style={{ background: "#F7F7F5" }}>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="text-5xl mb-3">🏠</div>
        <h1 className="text-3xl font-bold text-gray-900">Flatmates</h1>
        <p className="text-sm text-gray-400 mt-1">Find your perfect flatmate</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-sm"
      >
        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-2xl text-sm text-center"
            style={{ background: "#FEF2F2", color: "#EF4444", border: "1px solid #FEE2E2" }}>
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 mb-5">
          <input
            type="email"
            placeholder="Email address"
            className="input-field w-full px-4 py-4 rounded-2xl text-sm"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
          />
          <input
            type="password"
            placeholder="Password"
            className="input-field w-full px-4 py-4 rounded-2xl text-sm"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="btn-gradient w-full py-4 rounded-2xl font-semibold text-[15px] mb-6"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="text-center text-sm text-gray-400">
          New here?{" "}
          <button
            onClick={() => router.push("/signup")}
            className="font-semibold"
            style={{ color: "#7C3AED" }}
          >
            Create an account
          </button>
        </p>
      </motion.div>
    </div>
  );
}