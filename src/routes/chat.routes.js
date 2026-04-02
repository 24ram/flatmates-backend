const express = require("express");
const router = express.Router();

const { startChat } = require("../controllers/chat.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/start", authMiddleware, startChat);

module.exports = router;