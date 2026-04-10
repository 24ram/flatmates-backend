"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const steps = ["Account", "About You", "Preferences"];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "", email: "", password: "",
    gender: "", age: "", city: "",
    budget: "", lifestyle: "", smoking: "false", pets: "false", bio: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSignup = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          budget: Number(form.budget),
          smoking: form.smoking === "true",
          pets: form.pets === "true",
        }),
      });
      const data = await res.json();
      if (!data.token || !data.user) { setError(data.message || "Signup failed"); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userId", data.user.id.toString());
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 0 && (!form.name || !form.email || !form.password)) { setError("Please fill in all fields"); return; }
    if (step === 1 && (!form.gender || !form.city)) { setError("Please fill in all fields"); return; }
    setError("");
    if (step < 2) setStep(s => s + 1);
    else handleSignup();
  };

  const ToggleChip = ({ label, value, field }: { label: string; value: string; field: string }) => (
    <button
      type="button"
      onClick={() => set(field, value)}
      className="px-4 py-2 rounded-xl text-sm font-medium border transition-all"
      style={{
        background: (form as any)[field] === value ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.04)",
        borderColor: (form as any)[field] === value ? "var(--accent)" : "var(--border)",
        color: (form as any)[field] === value ? "#A78BFA" : "var(--muted)",
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "var(--bg)" }}>
      <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full opacity-20 blur-[120px]"
        style={{ background: "var(--accent)" }} />
      <div className="absolute bottom-[-80px] left-[-80px] w-[350px] h-[350px] rounded-full opacity-15 blur-[100px]"
        style={{ background: "var(--accent2)" }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass w-full max-w-sm rounded-3xl p-8 flex flex-col gap-5 relative z-10"
      >
        {/* Header */}
        <div className="text-center">
          <div className="text-3xl mb-2">🏠</div>
          <h1 className="text-xl font-bold gradient-text">Create Account</h1>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Step {step + 1} of {steps.length} — {steps[step]}</p>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{ background: i <= step ? "var(--accent)" : "var(--border)" }} />
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="text-xs text-center px-3 py-2 rounded-xl"
            style={{ background: "rgba(239,68,68,0.1)", color: "#FCA5A5", border: "1px solid rgba(239,68,68,0.2)" }}>
            {error}
          </div>
        )}

        {/* Step 0 — Account */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-3">
              <input placeholder="Full Name" className="input-field w-full px-4 py-3 rounded-xl text-sm" value={form.name} onChange={e => set("name", e.target.value)} />
              <input type="email" placeholder="Email Address" className="input-field w-full px-4 py-3 rounded-xl text-sm" value={form.email} onChange={e => set("email", e.target.value)} />
              <input type="password" placeholder="Password" className="input-field w-full px-4 py-3 rounded-xl text-sm" value={form.password} onChange={e => set("password", e.target.value)} />
            </motion.div>
          )}

          {/* Step 1 — About You */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-3">
              <input placeholder="City (e.g. Mumbai)" className="input-field w-full px-4 py-3 rounded-xl text-sm" value={form.city} onChange={e => set("city", e.target.value)} />
              <input type="number" placeholder="Age" className="input-field w-full px-4 py-3 rounded-xl text-sm" value={form.age} onChange={e => set("age", e.target.value)} />
              <input type="number" placeholder="Monthly Budget (₹)" className="input-field w-full px-4 py-3 rounded-xl text-sm" value={form.budget} onChange={e => set("budget", e.target.value)} />
              <div>
                <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>Gender</p>
                <div className="flex gap-2">
                  {["male", "female", "other"].map(g => <ToggleChip key={g} label={g.charAt(0).toUpperCase() + g.slice(1)} value={g} field="gender" />)}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2 — Preferences */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
              <div>
                <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>Lifestyle</p>
                <div className="flex gap-2 flex-wrap">
                  {["early bird", "night owl", "social", "quiet"].map(l => <ToggleChip key={l} label={l} value={l} field="lifestyle" />)}
                </div>
              </div>
              <div>
                <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>Smoking</p>
                <div className="flex gap-2">
                  <ToggleChip label="Yes" value="true" field="smoking" />
                  <ToggleChip label="No" value="false" field="smoking" />
                </div>
              </div>
              <div>
                <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>Pets OK?</p>
                <div className="flex gap-2">
                  <ToggleChip label="Yes 🐾" value="true" field="pets" />
                  <ToggleChip label="No" value="false" field="pets" />
                </div>
              </div>
              <textarea
                placeholder="Short bio (optional)"
                className="input-field w-full px-4 py-3 rounded-xl text-sm resize-none"
                rows={2}
                value={form.bio}
                onChange={e => set("bio", e.target.value)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex gap-2">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="flex-1 py-3 rounded-xl text-sm font-medium border transition-all"
              style={{ border: "1px solid var(--border)", color: "var(--muted)" }}>
              Back
            </button>
          )}
          <button onClick={nextStep} disabled={loading} className="btn-gradient flex-1 py-3 rounded-xl text-sm font-semibold">
            {loading ? "Creating..." : step < 2 ? "Continue →" : "Create Account"}
          </button>
        </div>

        <p className="text-center text-xs" style={{ color: "var(--muted)" }}>
          Already have an account?{" "}
          <button onClick={() => router.push("/login")} className="font-semibold" style={{ color: "#A78BFA" }}>Sign in</button>
        </p>
      </motion.div>
    </div>
  );
}
