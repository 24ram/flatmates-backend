const BASE_URL = "http://localhost:5000/api";

// 🔐 COMMON FETCH
export const apiFetch = async (endpoint, options = {}) => {
  let token = null;

  if (typeof window !== "undefined") {
    token = localStorage.getItem("token");
  }

  console.log("TOKEN USED:", token); // 🔥 DEBUG

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("API ERROR:", text);
    throw new Error(text);
  }

  return res.json();
};

// USERS
export const getUsers = () => apiFetch("/users");

// MATCHES
export const getMatches = () => apiFetch("/matches");

// SWIPE
export const swipeUser = (data) =>
  apiFetch("/swipes", {
    method: "POST",
    body: JSON.stringify(data),
  });