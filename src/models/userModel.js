const pool = require("../config/db");

// Create user
const createUser = async (userData) => {
  const { name, email, password, gender, budget, city, lifestyle, smoking, pets } = userData;

  const result = await pool.query(
    `INSERT INTO users 
    (name, email, password, gender, budget, city, lifestyle, smoking, pets) 
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [name, email, password, gender, budget, city, lifestyle, smoking, pets]
  );

  return result.rows[0];
};

// Find user by email
const findUserByEmail = async (email) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0];
};

// GET ALL USERS ✅
const getAllUsers = async () => {
  const result = await pool.query(`
  SELECT id, name, email, gender, budget, city, lifestyle, smoking, pets, bio, avatar, age, location 
  FROM users
`);
  return result.rows;
};

module.exports = {
  createUser,
  findUserByEmail,
  getAllUsers,
};