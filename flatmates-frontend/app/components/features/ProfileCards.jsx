import {
  MapPin, BookOpen, Home, Landmark, Globe, Search, Users,
  Ruler, User, Calendar, Heart, Wine
} from "lucide-react";

// ─────────────────────────────────────────────────────────
// Each row in the details list
// ─────────────────────────────────────────────────────────
export function DetailRow({ icon: Icon, value, last = false }) {
  if (!value) return null;
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "17px 20px" }}>
        <Icon size={22} strokeWidth={1.5} color="#999" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 17, fontWeight: 400, color: "#111", letterSpacing: "-0.2px" }}>
          {value}
        </span>
      </div>
      {!last && <div style={{ height: 1, background: "#F0F0F0", margin: "0 20px" }} />}
    </>
  );
}

// ─────────────────────────────────────────────────────────
// ProfilePromptCard — "Together, we could…"
// ─────────────────────────────────────────────────────────
export function ProfilePromptCard({ prompt = "Together, we could", answer, onLike }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 20,
      margin: "12px 12px 0",
      padding: "22px 20px 18px",
      position: "relative",
    }}>
      {/* Small label */}
      <p style={{ fontSize: 13, fontWeight: 600, color: "#888", marginBottom: 10 }}>
        {prompt}
      </p>

      {/* Big bold answer — Hinge style */}
      <p style={{
        fontSize: 24,
        fontWeight: 800,
        color: "#111",
        lineHeight: 1.25,
        letterSpacing: "-0.5px",
        paddingRight: 40,   // space for heart button
      }}>
        {answer || "Easy-going and tidy"}
      </p>

      {/* Heart button — bottom right */}
      <button
        onClick={onLike}
        style={{
          position: "absolute",
          bottom: 18,
          right: 18,
          width: 42,
          height: 42,
          borderRadius: "50%",
          border: "1.5px solid #E5E5E5",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <Heart size={18} strokeWidth={1.8} color="#ccc" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// ProfileDetailsCard — compact top strip + icon rows
// ─────────────────────────────────────────────────────────
export function ProfileDetailsCard({ user }) {
  const { age, gender, location, city, lifestyle, religion, ethnicity, relationship_type, intent } = user || {};

  const rows = [
    { icon: BookOpen, value: religion },
    { icon: Home,     value: location || city },
    { icon: Landmark, value: lifestyle },
    { icon: Globe,    value: ethnicity },
    { icon: Search,   value: relationship_type },
    { icon: Users,    value: intent },
  ].filter(r => r.value);

  return (
    <div style={{
      background: "#fff",
      borderRadius: 20,
      margin: "10px 12px 0",
      overflow: "hidden",
    }}>
      {/* ── Compact top strip: age | gender | location pin ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid #F0F0F0",
      }}>
        {age && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "14px 16px" }}>
              <Calendar size={16} strokeWidth={1.5} color="#888" />
              <span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{age}</span>
            </div>
            <div style={{ width: 1, height: 20, background: "#E8E8E8" }} />
          </>
        )}
        {gender && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "14px 16px" }}>
              <User size={16} strokeWidth={1.5} color="#888" />
              <span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{gender}</span>
            </div>
            <div style={{ width: 1, height: 20, background: "#E8E8E8" }} />
          </>
        )}
        {(location || city) && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "14px 16px" }}>
            <MapPin size={16} strokeWidth={1.5} color="#888" />
            <span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{location || city}</span>
          </div>
        )}
      </div>

      {/* ── Detail rows ── */}
      {rows.map((row, i) => (
        <DetailRow key={i} icon={row.icon} value={row.value} last={i === rows.length - 1} />
      ))}
    </div>
  );
}
