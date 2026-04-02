const pool = require("../config/db"); // keep this OR "../db" (only one)

exports.swipeUser = async (req, res) => {
  const swiper_id = req.user.id;
  const { swiped_id, liked } = req.body;

  try {
    // 1. Save swipe
    await pool.query(
      `INSERT INTO swipes (swiper_id, swiped_id, liked)
       VALUES ($1, $2, $3)`,
      [swiper_id, swiped_id, liked]
    );

    // 2. If liked → check reverse like
    if (liked) {
      const checkMatch = await pool.query(
        `SELECT * FROM swipes
         WHERE swiper_id = $1
         AND swiped_id = $2
         AND liked = true`,
        [swiped_id, swiper_id]
      );

      // 3. If mutual → create match
      if (checkMatch.rows.length > 0) {
        const user1 = Math.min(swiper_id, swiped_id);
        const user2 = Math.max(swiper_id, swiped_id);

        await pool.query(
          `INSERT INTO matches (user1_id, user2_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [user1, user2]
        );

        return res.json({
          match: true,
          matchedUserId: swiped_id
        });
      }
    }

    return res.json({ match: false });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};