const { saveMessage, getMessages } = require("../models/messageModel");

// SEND MESSAGE
const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, message } = req.body;

    const newMessage = await saveMessage({
      senderId,
      receiverId,
      message,
    });

    res.json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending message" });
  }
};

// GET CHAT HISTORY
const fetchMessages = async (req, res) => {
  try {
    const user1 = req.user.id;
    const user2 = req.params.userId;

    const messages = await getMessages(user1, user2);

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Error fetching messages" });
  }
};

module.exports = { sendMessage, fetchMessages };