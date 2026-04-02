"use client";

import { useState } from "react";

export default function Filters({ onApply }) {
  const [city, setCity] = useState("");
  const [budget, setBudget] = useState(20000);

  return (
    <div
      id="filters"
      className="w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-4"
    >
      <h2 className="text-white font-semibold mb-3">Filters</h2>

      <input
        placeholder="City"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="w-full mb-3 px-3 py-2 rounded-lg bg-white/10 text-white outline-none"
      />

      <div className="mb-3">
        <p className="text-sm text-gray-300">Budget: ₹{budget}</p>
        <input
          type="range"
          min="5000"
          max="50000"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="w-full"
        />
      </div>

      <button
        onClick={() => onApply({ city, budget })}
        className="w-full py-2 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 text-black font-semibold"
      >
        Apply Filters
      </button>
    </div>
  );
}