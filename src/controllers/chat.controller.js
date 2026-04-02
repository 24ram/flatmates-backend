const pool = require("../config/db");

// Generate room ID
const getRoomId = (user1, user2) => {
  return [user1, user2].sort().join("_");
};

// Start chat
const startChat = async (req, res) => {
  try {
    const user1 = req.user.id;
    const { user2 } = req.body;

    // Check if matched
    const match = await pool.query(
      `SELECT * FROM swipes 
       WHERE swiper_id = $1 AND swiped_id = $2 AND action = 'like'`,
      [user1, user2]
    );

    const reverseMatch = await pool.query(
      `SELECT * FROM swipes 
       WHERE swiper_id = $1 AND swiped_id = $2 AND action = 'like'`,
      [user2, user1]
    );

    if (match.rows.length === 0 || reverseMatch.rows.length === 0) {
      return res.status(403).json({ message: "Not matched yet" });
    }

    const roomId = getRoomId(user1, user2);

    res.json({ roomId });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { startChat };