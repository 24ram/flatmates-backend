const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const {
  createListing,
  getAllListings,
  getListingById,
  deleteListing,
} = require("../controllers/listing.controller");

// Public
router.get("/", getAllListings);
router.get("/:id", getListingById);

// Protected (auth required)
router.post("/", authMiddleware, createListing);
router.delete("/:id", authMiddleware, deleteListing);

module.exports = router;
