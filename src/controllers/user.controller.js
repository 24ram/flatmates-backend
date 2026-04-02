const pool = require("../config/db");

// Get potential matches
const getMatches = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Get current user
    const userResult = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [currentUserId]
    );

    const currentUser = userResult.rows[0];

    // Find similar users
    const matches = await pool.query(
      `SELECT id, name, city, budget, lifestyle 
       FROM users 
       WHERE id != $1 AND city = $2`,
      [currentUserId, currentUser.city]
    );

    res.json(matches.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getMatches };