const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";


// 🔐 COMMON FETCH
export const apiFetch = async (endpoint, options = {}) => {
  let token = null;

  if (typeof window !== "undefined") {
    token = localStorage.getItem("token");
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();

    // 🔒 Auto-logout on expired/invalid token
    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return;
    }

    console.error("API ERROR:", text);
    throw new Error(text);
  }

  return res.json();
};

// USERS
export const getUsers = () => apiFetch("/users");
export const updateProfile = (data) =>
  apiFetch("/users/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });

// COMPATIBILITY SCORE
export const getScore = (targetId) => apiFetch(`/users/score/${targetId}`);

// MATCHES
export const getMatches = () => apiFetch("/matches");

// SWIPE
export const swipeUser = (data) =>
  apiFetch("/swipes", {
    method: "POST",
    body: JSON.stringify(data),
  });

// LISTINGS
export const getListings = (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return apiFetch(`/listings${params ? `?${params}` : ""}`);
};

export const getListingById = (id) => apiFetch(`/listings/${id}`);

export const createListing = (data) =>
  apiFetch("/listings", {
    method: "POST",
    body: JSON.stringify(data),
  });