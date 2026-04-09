const express = require("express");
const router = express.Router();

const { signup, login } = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { authLimiter } = require("../middleware/rateLimiter");
const { registerRules, loginRules, handleValidation } = require("../middleware/validate");

// POST /api/auth/signup — rate limited + validated
router.post("/signup", authLimiter, registerRules, handleValidation, signup);

// POST /api/auth/login — rate limited + validated
router.post("/login", authLimiter, loginRules, handleValidation, login);

// GET /api/auth/me — protected
router.get("/me", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;