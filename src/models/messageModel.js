const db = require("../config/db");

const saveMessage = async ({ senderId, receiverId, message }) => {
  const result = await db.query(
    `INSERT INTO messages (sender_id, receiver_id, message)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [senderId, receiverId, message]
  );

  return result.rows[0];
};

const getMessages = async (user1, user2) => {
  const result = await db.query(
    `SELECT * FROM messages
     WHERE (sender_id=$1 AND receiver_id=$2)
        OR (sender_id=$2 AND receiver_id=$1)
     ORDER BY created_at ASC`,
    [user1, user2]
  );

  return result.rows;
};

module.exports = { saveMessage, getMessages };