CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT,
  email TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teoyube_words (
  id SERIAL PRIMARY KEY,
  word TEXT UNIQUE NOT NULL,
  meaning TEXT NOT NULL,
  category TEXT,
  level TEXT,
  rank TEXT,
  glyph TEXT,
  promise_statement TEXT
);

CREATE TABLE IF NOT EXISTS scriptures (
  id SERIAL PRIMARY KEY,
  reference TEXT NOT NULL,
  theme TEXT,
  text_summary TEXT
);

CREATE TABLE IF NOT EXISTS word_scriptures (
  word_id INT REFERENCES teoyube_words(id),
  scripture_id INT REFERENCES scriptures(id),
  relationship_type TEXT,
  PRIMARY KEY (word_id, scripture_id)
);

CREATE TABLE IF NOT EXISTS cluster_words (
  cluster_id TEXT REFERENCES promise_clusters(cluster_id),
  word_id INT REFERENCES teoyube_words(id),
  PRIMARY KEY (cluster_id, word_id)
);

CREATE TABLE IF NOT EXISTS prayers (
  id TEXT PRIMARY KEY,
  name TEXT,
  category TEXT,
  scripture_anchor TEXT,
  declaration TEXT,
  prayer_text TEXT,
  duration TEXT,
  difficulty TEXT
);

CREATE TABLE IF NOT EXISTS prayer_words (
  prayer_id TEXT REFERENCES prayers(id),
  word_id INT REFERENCES teoyube_words(id),
  sequence_order INT,
  PRIMARY KEY (prayer_id, word_id)
);

CREATE TABLE IF NOT EXISTS user_journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  word_id INT REFERENCES teoyube_words(id),
  scripture_reference TEXT,
  reflection TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  growth_level TEXT,
  current_path TEXT,
  current_journey TEXT,
  score INT,
  updated_at TIMESTAMP DEFAULT NOW()
);
