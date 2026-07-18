CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS core_teoyube_vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lexicon_number INTEGER,
  word VARCHAR(100) NOT NULL UNIQUE,
  pronunciation VARCHAR(100),
  meaning TEXT,
  category VARCHAR(50),
  level VARCHAR(50),
  rank VARCHAR(10),
  symbol TEXT,
  scripture_theme TEXT,
  scripture_sources TEXT[],
  promise_category VARCHAR(50),
  prayer_use TEXT,
  animation_symbol TEXT,
  related_words TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE core_teoyube_vocabulary
  ADD COLUMN IF NOT EXISTS lexicon_number INTEGER,
  ADD COLUMN IF NOT EXISTS level VARCHAR(50),
  ADD COLUMN IF NOT EXISTS rank VARCHAR(10),
  ADD COLUMN IF NOT EXISTS symbol TEXT,
  ADD COLUMN IF NOT EXISTS scripture_theme TEXT;

CREATE INDEX IF NOT EXISTS idx_core_teoyube_vocabulary_word
  ON core_teoyube_vocabulary (word);

CREATE INDEX IF NOT EXISTS idx_core_teoyube_vocabulary_category
  ON core_teoyube_vocabulary (category);

CREATE INDEX IF NOT EXISTS idx_core_teoyube_vocabulary_promise_category
  ON core_teoyube_vocabulary (promise_category);

CREATE INDEX IF NOT EXISTS idx_core_teoyube_vocabulary_level
  ON core_teoyube_vocabulary (level);

CREATE INDEX IF NOT EXISTS idx_core_teoyube_vocabulary_rank
  ON core_teoyube_vocabulary (rank);

-- Source of truth for seed rows:
-- src/data/coreTeoyubeVocabulary.json
-- src/data/coreTeoyubeVocabulary-part3.json
--
-- Seed command:
-- npm run seed:vocabulary
