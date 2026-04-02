const { io } = require("socket.io-client");

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("Connected:", socket.id);

  const roomId = "room1";

  // Join room
  socket.emit("join_room", roomId);

  console.log("Joined room:", roomId);

  // Send message AFTER delay
  setTimeout(() => {
    console.log("Sending message...");

    socket.emit("send_message", {
      roomId,
      sender: 2,   // or 3 (valid user ID),
      message: "Hello private chat!",
    });
  }, 1500);
});

// Listen for message
socket.on("receive_message", (data) => {
  console.log("Received:", data);
});