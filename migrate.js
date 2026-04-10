require("dotenv").config();
const pool = require("./src/config/db");

async function migrate() {
  console.log("🚀 Running migration v2...\n");

  try {
    // 1. Add ML columns to users
    await pool.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS sleep_time   INT          DEFAULT 22,
        ADD COLUMN IF NOT EXISTS cleanliness  INT          DEFAULT 3,
        ADD COLUMN IF NOT EXISTS social_level INT          DEFAULT 3,
        ADD COLUMN IF NOT EXISTS occupation   VARCHAR(100);
    `);
    console.log("✅ users table — ML columns added");

    // 2. Create listings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS listings (
        id               SERIAL PRIMARY KEY,
        title            VARCHAR(200)  NOT NULL,
        description      TEXT,
        rent             INT           NOT NULL,
        location         VARCHAR(200),
        city             VARCHAR(100),
        images           TEXT[]        DEFAULT '{}',
        amenities        TEXT[]        DEFAULT '{}',
        owner_id         INT           REFERENCES users(id) ON DELETE CASCADE,
        smoking_ok       BOOLEAN       DEFAULT false,
        pets_ok          BOOLEAN       DEFAULT false,
        occupation_pref  VARCHAR(100),
        created_at       TIMESTAMPTZ   DEFAULT NOW()
      );
    `);
    console.log("✅ listings table — created");

    // 3. Add match_score + explanation to matches
    await pool.query(`
      ALTER TABLE matches
        ADD COLUMN IF NOT EXISTS match_score INT  DEFAULT 0,
        ADD COLUMN IF NOT EXISTS explanation TEXT;
    `);
    console.log("✅ matches table — score columns added");

    // 4. Verify
    const users   = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name IN ('sleep_time','cleanliness','social_level','occupation')`);
    const listings = await pool.query(`SELECT COUNT(*) FROM information_schema.columns WHERE table_name='listings'`);
    const matches  = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name='matches' AND column_name IN ('match_score','explanation')`);

    console.log(`\n📊 Verification:`);
    console.log(`  users ML columns   : ${users.rows.map(r => r.column_name).join(", ")}`);
    console.log(`  listings columns   : ${listings.rows[0].count} columns`);
    console.log(`  matches ML columns : ${matches.rows.map(r => r.column_name).join(", ")}`);
    console.log("\n🎉 Migration complete! All tables are ready.");

  } catch (err) {
    console.error("❌ Migration failed:", err.message);
  } finally {
    await pool.end();
  }
}

migrate();
