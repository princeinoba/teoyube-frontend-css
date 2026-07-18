CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS tkos_user_profiles (
  user_id TEXT PRIMARY KEY,
  display_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  archetype TEXT,
  primary_path TEXT,
  secondary_path TEXT,
  growth_level TEXT,
  current_journey TEXT,
  recommended_words TEXT[],
  recommended_prayers TEXT[]
);

CREATE TABLE IF NOT EXISTS tkos_growth_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  growth_level TEXT,
  score INTEGER,
  next_level TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tkos_path_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  path TEXT,
  completion INTEGER,
  completed_words TEXT[],
  next_word TEXT,
  stage TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tkos_daily_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  recommendation_date DATE,
  word TEXT,
  cluster TEXT,
  scripture TEXT,
  reflection_prompt TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tkos_destiny_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  identity_score INTEGER,
  prayer_score INTEGER,
  wisdom_score INTEGER,
  stewardship_score INTEGER,
  service_score INTEGER,
  influence_score INTEGER,
  legacy_score INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tkos_journal_entries (
  entry_id TEXT PRIMARY KEY,
  user_id TEXT,
  word TEXT,
  scripture TEXT,
  reflection TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tkos_prayer_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  prayer_id TEXT,
  times_prayed INTEGER DEFAULT 0,
  last_prayed DATE,
  favorite BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- TKOS reads from existing collections:
-- words, scriptures, archetypes, paths, clusters, prayers, journeys,
-- journals, assessments, recommendations, analytics
