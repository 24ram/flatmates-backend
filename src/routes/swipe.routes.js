const express = require("express");
const router = express.Router();

const { swipeUser } = require("../controllers/swipe.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/", authMiddleware, swipeUser);

module.exports = router;