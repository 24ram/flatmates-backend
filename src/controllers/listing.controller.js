const pool = require("../config/db");

// ─────────────────────────────────────────────
// POST /api/listings — Create a new listing
// ─────────────────────────────────────────────
const createListing = async (req, res) => {
  try {
    const owner_id = req.user.id;
    const {
      title, description, rent, location, city,
      images, amenities, smoking_ok, pets_ok, occupation_pref,
    } = req.body;

    if (!title || !rent) {
      return res.status(400).json({ message: "Title and rent are required" });
    }

    const result = await pool.query(
      `INSERT INTO listings
        (title, description, rent, location, city, images, amenities,
         owner_id, smoking_ok, pets_ok, occupation_pref)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        title,
        description || null,
        rent,
        location || null,
        city || null,
        images || [],
        amenities || [],
        owner_id,
        smoking_ok || false,
        pets_ok || false,
        occupation_pref || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("CREATE LISTING ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────
// GET /api/listings — All listings with owner info
// Optional query: ?city=Mumbai&maxRent=20000
// ─────────────────────────────────────────────
const getAllListings = async (req, res) => {
  try {
    const { city, maxRent } = req.query;

    let query = `
      SELECT l.*,
             u.name   AS owner_name,
             u.avatar AS owner_avatar,
             u.age    AS owner_age
      FROM listings l
      JOIN users u ON l.owner_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (city) {
      params.push(city);
      query += ` AND LOWER(l.city) = LOWER($${params.length})`;
    }

    if (maxRent) {
      params.push(Number(maxRent));
      query += ` AND l.rent <= $${params.length}`;
    }

    query += ` ORDER BY l.created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("GET LISTINGS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────
// GET /api/listings/:id — Single listing detail
// ─────────────────────────────────────────────
const getListingById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT l.*,
              u.name   AS owner_name,
              u.avatar AS owner_avatar,
              u.age    AS owner_age,
              u.city   AS owner_city,
              u.lifestyle AS owner_lifestyle
       FROM listings l
       JOIN users u ON l.owner_id = u.id
       WHERE l.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Listing not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("GET LISTING BY ID ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────
// DELETE /api/listings/:id — Owner can delete
// ─────────────────────────────────────────────
const deleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const listing = await pool.query(
      "SELECT * FROM listings WHERE id = $1",
      [id]
    );

    if (listing.rows.length === 0) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (listing.rows[0].owner_id !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await pool.query("DELETE FROM listings WHERE id = $1", [id]);
    res.json({ message: "Listing deleted" });
  } catch (err) {
    console.error("DELETE LISTING ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createListing, getAllListings, getListingById, deleteListing };
