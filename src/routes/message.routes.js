const express = require("express");
const router = express.Router();

const { sendMessage, fetchMessages } = require("../controllers/message.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/", authMiddleware, sendMessage);
router.get("/:userId", authMiddleware, fetchMessages);

module.exports = router;