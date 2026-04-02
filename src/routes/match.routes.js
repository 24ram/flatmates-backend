const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authMiddleware = require("../middleware/auth.middleware");

router.get("/", authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `
      SELECT users.id, users.name, users.avatar
      FROM matches
      JOIN users ON users.id = 
        CASE 
          WHEN matches.user1_id = $1 THEN matches.user2_id
          ELSE matches.user1_id
        END
      WHERE matches.user1_id = $1 OR matches.user2_id = $1
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;