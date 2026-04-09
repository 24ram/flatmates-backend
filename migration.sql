-- ================================================================
-- Flatmates App — Full Database Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ================================================================

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(100) NOT NULL,
  email           VARCHAR(150) NOT NULL UNIQUE,
  password        TEXT NOT NULL,
  age             INTEGER,
  gender          VARCHAR(20),
  city            VARCHAR(100),
  location        VARCHAR(150),
  budget          NUMERIC(10, 2),
  lifestyle       VARCHAR(50),
  occupation      VARCHAR(100),
  bio             TEXT,
  avatar          TEXT,
  smoking         BOOLEAN DEFAULT FALSE,
  pets            BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- 2. LISTINGS
CREATE TABLE IF NOT EXISTS listings (
  id              SERIAL PRIMARY KEY,
  owner_id        INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title           VARCHAR(150) NOT NULL,
  description     TEXT,
  rent            NUMERIC(10, 2) NOT NULL,
  city            VARCHAR(100) NOT NULL,
  location        VARCHAR(150),
  images          TEXT[],          -- array of image URLs
  amenities       TEXT[],          -- e.g. {WiFi, AC, Gym}
  smoking_ok      BOOLEAN DEFAULT FALSE,
  pets_ok         BOOLEAN DEFAULT FALSE,
  occupation_pref VARCHAR(100),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- 3. SWIPES
CREATE TABLE IF NOT EXISTS swipes (
  id          SERIAL PRIMARY KEY,
  swiper_id   INTEGER REFERENCES users(id) ON DELETE CASCADE,
  swiped_id   INTEGER REFERENCES users(id) ON DELETE CASCADE,
  liked       BOOLEAN NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE (swiper_id, swiped_id)     -- prevent duplicate swipes
);

-- 4. MATCHES
CREATE TABLE IF NOT EXISTS matches (
  id          SERIAL PRIMARY KEY,
  user1_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  user2_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE (user1_id, user2_id)
);

-- 5. MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  id          SERIAL PRIMARY KEY,
  match_id    INTEGER REFERENCES matches(id) ON DELETE CASCADE,
  sender_id   INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  status      VARCHAR(20) DEFAULT 'sent',  -- sent | delivered | read
  created_at  TIMESTAMP DEFAULT NOW()
);

-- ================================================================
-- Indexes for performance
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_swipes_swiper  ON swipes(swiper_id);
CREATE INDEX IF NOT EXISTS idx_swipes_swiped  ON swipes(swiped_id);
CREATE INDEX IF NOT EXISTS idx_matches_u1     ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_u2     ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_messages_match ON messages(match_id);
CREATE INDEX IF NOT EXISTS idx_listings_owner ON listings(owner_id);
CREATE INDEX IF NOT EXISTS idx_listings_city  ON listings(city);

-- ================================================================
-- Verify: should return all 5 table names
-- ================================================================
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
