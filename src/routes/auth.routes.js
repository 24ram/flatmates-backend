const express = require("express");
const router = express.Router();

const { signup, login } = require("../controllers/auth.controller");

// Signup route
router.post("/signup", signup);

// Login route
router.post("/login", login);

module.exports = router;

const authMiddleware = require("../middleware/auth.middleware");

// Protected route
router.get("/me", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user,
  });
});