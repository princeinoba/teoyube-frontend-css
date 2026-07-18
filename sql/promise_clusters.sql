CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS promise_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  name TEXT,
  theme TEXT NOT NULL,
  description TEXT,
  promise_category TEXT NOT NULL,
  promise_level TEXT NOT NULL,
  scripture_references TEXT[] NOT NULL,
  anchor_scripture TEXT,
  summary TEXT,
  keywords TEXT[],
  core_words TEXT[],
  related_teoyube_words TEXT[],
  prayer_sequence TEXT[],
  declaration TEXT,
  prayer_framework TEXT,
  divine_assignment TEXT,
  calling_connection TEXT,
  animation_prompt TEXT,
  book_entry_template TEXT,
  journey_status_options TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promise_clusters_cluster_id
  ON promise_clusters (cluster_id);

CREATE INDEX IF NOT EXISTS idx_promise_clusters_category
  ON promise_clusters (promise_category);

CREATE INDEX IF NOT EXISTS idx_promise_clusters_level
  ON promise_clusters (promise_level);

-- Source of truth for seed rows:
-- src/data/promiseClusters.json
