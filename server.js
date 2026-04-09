const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
require("dotenv").config();

const { apiLimiter } = require("./src/middleware/rateLimiter");

const app = express();
const server = http.createServer(app);

/* ─────────────────────────────────────────
   1. SECURITY HEADERS — helmet
   Protects against XSS, clickjacking, MIME sniffing
───────────────────────────────────────── */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // allow /uploads images to load in browser
  })
);

/* ─────────────────────────────────────────
   2. CORS — restricted to your frontend only
   Change FRONTEND_URL in .env for production
───────────────────────────────────────── */
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL || "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow same-origin requests (e.g. server-side or curl)
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
  })
);

/* ─────────────────────────────────────────
   3. BODY PARSING — with size limit
   Prevents large payload attacks
───────────────────────────────────────── */
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

/* ─────────────────────────────────────────
   4. GLOBAL API RATE LIMITER
   100 req/min per IP across all API routes
───────────────────────────────────────── */
app.use("/api", apiLimiter);

/* ─────────────────────────────────────────
   5. DB HEALTH CHECK — GET /test-db
───────────────────────────────────────── */
const pool = require("./src/config/db");
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS time, current_database() AS db");
    res.json({ status: "✅ Connected", ...result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: "❌ Failed", error: err.message });
  }
});

/* ─────────────────────────────────────────
   6. ROUTES
───────────────────────────────────────── */
app.use("/api/auth",     require("./src/routes/auth.routes"));
app.use("/api/users",    require("./src/routes/user.routes"));
app.use("/api/swipes",   require("./src/routes/swipe.routes"));
app.use("/api/matches",  require("./src/routes/match.routes"));
app.use("/api/messages", require("./src/routes/message.routes"));
app.use("/api/listings", require("./src/routes/listing.routes"));
app.use("/api/upload",   require("./src/routes/upload.routes"));

/* ─────────────────────────────────────────
   6. STATIC FILES — uploads
───────────────────────────────────────── */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ─────────────────────────────────────────
   7. GLOBAL ERROR HANDLER
───────────────────────────────────────── */
app.use((err, req, res, next) => {
  // Don't leak stack traces in production
  const isDev = process.env.NODE_ENV !== "production";
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    ...(isDev && { stack: err.stack }),
  });
});

/* ─────────────────────────────────────────
   8. SOCKET.IO — restricted origin
───────────────────────────────────────── */
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  socket.on("user_online", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("online_users", Array.from(onlineUsers.keys()));
  });

  socket.on("join_room", (roomId) => socket.join(roomId));

  socket.on("send_message", (data) => {
    socket.to(data.roomId).emit("receive_message", { ...data, status: "sent" });
  });

  socket.on("message_seen", ({ senderId, messageId }) => {
    const senderSocketId = onlineUsers.get(String(senderId));
    if (senderSocketId) io.to(senderSocketId).emit("message_delivered", { messageId });
  });

  socket.on("typing",      ({ roomId, userId }) => socket.to(roomId).emit("typing", userId));
  socket.on("stop_typing", ({ roomId })         => socket.to(roomId).emit("stop_typing"));

  socket.on("disconnect", () => {
    for (const [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) { onlineUsers.delete(userId); break; }
    }
    io.emit("online_users", Array.from(onlineUsers.keys()));
  });
});

/* ─────────────────────────────────────────
   9. START
───────────────────────────────────────── */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));