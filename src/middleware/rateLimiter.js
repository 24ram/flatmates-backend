// src/middleware/rateLimiter.js
// Protects login/register from brute-force attacks
// and APIs from general abuse

const rateLimit = require("express-rate-limit");

// Strict: 10 attempts per 15 min — for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: "Too many attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Relaxed: 100 requests per minute — for general API
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { error: "Too many requests. Slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Upload: 10 uploads per hour
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: "Upload limit reached. Try again later." },
});

module.exports = { authLimiter, apiLimiter, uploadLimiter };
