const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authMiddleware = require("../middleware/auth.middleware");
const { computeCompatibility } = require("../utils/matchingEngine");

// GET ALL USERS (excluding self + already swiped) — with ML columns
router.get("/", authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const result = await pool.query(
      `SELECT id, name, email, gender, budget, city, lifestyle, smoking, pets,
              bio, avatar, age, location,
              sleep_time, cleanliness, social_level, occupation
       FROM users
       WHERE id != $1
       AND id NOT IN (
         SELECT swiped_id FROM swipes WHERE swiper_id = $1 AND swiped_id IS NOT NULL
       )`,
      [currentUserId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET USERS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/users/score/:targetId — Compute compatibility score
router.get("/score/:targetId", authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const targetId = Number(req.params.targetId);

    // Fetch both users
    const [meResult, themResult] = await Promise.all([
      pool.query("SELECT * FROM users WHERE id = $1", [currentUserId]),
      pool.query("SELECT * FROM users WHERE id = $1", [targetId]),
    ]);

    if (!meResult.rows[0] || !themResult.rows[0]) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = computeCompatibility(meResult.rows[0], themResult.rows[0]);

    res.json({
      userId: targetId,
      score: result.score,
      explanation: result.explanation,
    });
  } catch (err) {
    console.error("SCORE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// PUT /api/users/profile — Update user profile (like avatar)
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { avatar, bio } = req.body;
    const currentUserId = req.user.id;

    const result = await pool.query(
      `UPDATE users 
       SET avatar = COALESCE($1, avatar),
           bio = COALESCE($2, bio)
       WHERE id = $3 RETURNING *`,
      [avatar, bio, currentUserId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;