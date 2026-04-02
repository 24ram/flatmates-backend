const express = require("express");
const http = require("http");
const cors = require("cors");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/auth", require("./src/routes/auth.routes"));
app.use("/api/users", require("./src/routes/user.routes"));
app.use("/api/swipes", require("./src/routes/swipe.routes"));
app.use("/api/matches", require("./src/routes/match.routes"));
app.use("/api/messages", require("./src/routes/message.routes"));

/* ================= SOCKET LOGIC (ULTRA) ================= */

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // 🟢 USER ONLINE
  socket.on("user_online", (userId) => {
    onlineUsers.set(userId, socket.id);

    // send updated list to everyone
    io.emit("online_users", Array.from(onlineUsers.keys()));
  });

  // 🏠 JOIN ROOM
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  // 💬 SEND MESSAGE
  socket.on("send_message", (data) => {
    console.log("Message:", data);

    io.to(data.roomId).emit("receive_message", {
      ...data,
      status: "delivered",
    });
  });

  // ⌨️ TYPING
  socket.on("typing", ({ roomId, userId }) => {
    socket.to(roomId).emit("typing", userId);
  });

  socket.on("stop_typing", ({ roomId }) => {
    socket.to(roomId).emit("stop_typing");
  });

  // ❌ DISCONNECT
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    for (let [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }

    io.emit("online_users", Array.from(onlineUsers.keys()));
  });
});

/* ================= SERVER START ================= */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});