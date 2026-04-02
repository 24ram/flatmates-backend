const express = require("express");
const router = express.Router();

const { getAllUsers } = require("../models/userModel");

// GET ALL USERS
router.get("/", async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    console.error("GET USERS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;