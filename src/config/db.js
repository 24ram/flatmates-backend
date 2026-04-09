const { Pool } = require("pg");

// Validate that DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error("❌ FATAL: DATABASE_URL is not set in environment variables.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // SSL is required for Supabase (and most cloud Postgres providers)
  // rejectUnauthorized: false allows self-signed certs on free tiers
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false, // No SSL needed for local postgres
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Connected to PostgreSQL database");
    release();
  }
});

module.exports = pool;