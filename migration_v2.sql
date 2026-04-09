-- ============================================================
-- FLATMATE PLATFORM — DATABASE MIGRATION v2.0
-- Run this in pgAdmin → Query Tool on your "flatmates" database
-- Safe to run multiple times (uses IF NOT EXISTS / IF EXISTS)
-- ============================================================


-- ============================================================
-- 1. USERS TABLE — Add ML columns
-- ============================================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS sleep_time    INT         DEFAULT 22,
  ADD COLUMN IF NOT EXISTS cleanliness   INT         DEFAULT 3,
  ADD COLUMN IF NOT EXISTS social_level  INT         DEFAULT 3,
  ADD COLUMN IF NOT EXISTS occupation    VARCHAR(100);

-- sleep_time   : 0–23 (hour they sleep, e.g. 22 = 10pm)
-- cleanliness  : 1–5 (1=messy, 5=very clean)
-- social_level : 1–5 (1=introvert, 5=very social)


-- ============================================================
-- 2. LISTINGS TABLE — New table for room/flat listings
-- ============================================================

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

-- Index for faster city-based queries
CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(city);
CREATE INDEX IF NOT EXISTS idx_listings_owner ON listings(owner_id);


-- ============================================================
-- 3. MATCHES TABLE — Add ML score columns
-- ============================================================

ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS match_score   INT    DEFAULT 0,
  ADD COLUMN IF NOT EXISTS explanation   TEXT;

-- match_score : 0–100 compatibility percentage
-- explanation : human-readable reason ("You're both night owls...")


-- ============================================================
-- 4. SWIPES TABLE — Ensure ON CONFLICT safe index exists
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_swipes_unique
  ON swipes(swiper_id, swiped_id);


-- ============================================================
-- 5. VERIFY — Run these SELECT statements to confirm
-- ============================================================

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'listings'
ORDER BY ordinal_position;

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'matches'
ORDER BY ordinal_position;
