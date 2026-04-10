"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createListing } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "../../components/BottomNav";
import { X, Upload, Check } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : "http://localhost:5000";
const AMENITY_OPTIONS = ["WiFi", "AC", "Furnished", "Parking", "Gym", "Laundry", "Pool", "Kitchen", "Balcony", "Security"];

export default function CreateListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "", description: "", rent: "", city: "", location: "",
    smoking_ok: false, pets_ok: false, occupation_pref: "",
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const toggleAmenity = (a: string) =>
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    const fd = new FormData();
    Array.from(e.target.files).slice(0, 5).forEach(f => fd.append("images", f));

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (data.urls) setUploadedImages(prev => [...prev, ...data.urls].slice(0, 5));
    } catch { setError("Image upload failed. Try again."); }
    finally { setUploading(false); }
  };

  const removeImage = (i: number) =>
    setUploadedImages(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (!form.title || !form.rent || !form.city) {
      setError("Title, rent and city are required"); return;
    }
    setLoading(true); setError("");
    try {
      await createListing({
        ...form,
        rent: Number(form.rent),
        amenities,
        images: uploadedImages,
      });
      router.push("/listings");
    } catch { setError("Failed to post. Make sure you're logged in."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen pb-28" style={{ background: "#F7F7F5" }}>

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 pt-5 pb-4 flex items-center gap-3">
        <button onClick={() => router.back()}
          className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 bg-white">
          <X size={15} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-base font-bold text-gray-900">Post a Room</h1>
          <p className="text-xs text-gray-400">Fill in the details below</p>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">

        {error && (
          <div className="px-4 py-3 rounded-2xl text-sm text-center"
            style={{ background: "#FEF2F2", color: "#EF4444", border: "1px solid #FEE2E2" }}>
            {error}
          </div>
        )}

        {/* Photo Upload */}
        <div className="bg-white rounded-2xl p-4" style={{ border: "1px solid #F0F0F0" }}>
          <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Photos</p>

          {/* Preview grid */}
          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {uploadedImages.map((url, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden" style={{ height: "80px" }}>
                  <img
                    src={url.startsWith("http") ? url : `${BACKEND_URL}${url}`}
                    className="w-full h-full object-cover"
                    alt={`Room ${i + 1}`}
                  />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center">
                    <X size={10} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className={`flex flex-col items-center gap-2 py-5 rounded-xl border-2 border-dashed cursor-pointer transition-all
            ${uploading ? "opacity-50 pointer-events-none" : "hover:border-gray-400"}`}
            style={{ borderColor: "#E0E0E0" }}>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
            {uploading ? (
              <div className="w-5 h-5 border-2 rounded-full animate-spin"
                style={{ borderColor: "#7C3AED", borderTopColor: "transparent" }} />
            ) : (
              <Upload size={20} className="text-gray-400" />
            )}
            <p className="text-sm font-medium text-gray-600">
              {uploading ? "Uploading..." : uploadedImages.length > 0 ? "Add more photos" : "Upload room photos"}
            </p>
            <p className="text-xs text-gray-400">Up to 5 photos, 5MB each</p>
          </label>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-2xl p-4 flex flex-col gap-3"
          style={{ border: "1px solid #F0F0F0" }}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Basic Info</p>
          <input placeholder="Listing title *" className="w-full px-4 py-3 rounded-xl border text-sm text-gray-900 outline-none focus:border-gray-400 transition-colors"
            style={{ borderColor: "#EBEBEB" }} value={form.title} onChange={e => set("title", e.target.value)} />
          <textarea placeholder="Describe the room, neighbourhood, rules..." rows={3}
            className="w-full px-4 py-3 rounded-xl border text-sm text-gray-900 outline-none focus:border-gray-400 transition-colors resize-none"
            style={{ borderColor: "#EBEBEB" }} value={form.description} onChange={e => set("description", e.target.value)} />
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">₹</span>
            <input type="number" placeholder="Monthly rent *"
              className="w-full pl-8 pr-4 py-3 rounded-xl border text-sm text-gray-900 outline-none focus:border-gray-400 transition-colors"
              style={{ borderColor: "#EBEBEB" }} value={form.rent} onChange={e => set("rent", e.target.value)} />
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl p-4 flex flex-col gap-3"
          style={{ border: "1px solid #F0F0F0" }}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</p>
          <input placeholder="City *" className="w-full px-4 py-3 rounded-xl border text-sm text-gray-900 outline-none focus:border-gray-400 transition-colors"
            style={{ borderColor: "#EBEBEB" }} value={form.city} onChange={e => set("city", e.target.value)} />
          <input placeholder="Area / locality" className="w-full px-4 py-3 rounded-xl border text-sm text-gray-900 outline-none focus:border-gray-400 transition-colors"
            style={{ borderColor: "#EBEBEB" }} value={form.location} onChange={e => set("location", e.target.value)} />
        </div>

        {/* Amenities */}
        <div className="bg-white rounded-2xl p-4" style={{ border: "1px solid #F0F0F0" }}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Amenities</p>
          <div className="flex flex-wrap gap-2">
            {AMENITY_OPTIONS.map(a => {
              const on = amenities.includes(a);
              return (
                <button key={a} type="button" onClick={() => toggleAmenity(a)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border font-medium transition-all"
                  style={{
                    background: on ? "#111" : "#fff",
                    color: on ? "#fff" : "#666",
                    borderColor: on ? "#111" : "#E5E5E5",
                  }}>
                  {on && <Check size={11} />}
                  {a}
                </button>
              );
            })}
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-2xl p-4 flex flex-col gap-3"
          style={{ border: "1px solid #F0F0F0" }}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Preferences</p>
          <div className="flex gap-2">
            {([["smoking_ok", "🚬 Smoking OK"], ["pets_ok", "🐾 Pets OK"]] as const).map(([key, label]) => {
              const on = (form as any)[key];
              return (
                <button key={key} type="button" onClick={() => set(key, !on)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all"
                  style={{
                    background: on ? "#111" : "#fff",
                    color: on ? "#fff" : "#666",
                    borderColor: on ? "#111" : "#E5E5E5",
                  }}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <button onClick={handleSubmit} disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-base text-white transition-all active:scale-98"
          style={{ background: loading ? "#888" : "#111" }}>
          {loading ? "Posting..." : "Post Listing"}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
