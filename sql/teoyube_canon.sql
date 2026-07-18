CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS kingdom_archetypes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  teoyube_word TEXT,
  category TEXT,
  identity_statement TEXT,
  primary_cluster TEXT,
  primary_path TEXT,
  scriptural_models TEXT[],
  core_words TEXT[],
  manifestation_goal TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS covenant_paths (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sequence TEXT[] NOT NULL,
  meaning TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS destiny_maps (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  archetype TEXT,
  archetype_name TEXT,
  path TEXT,
  path_name TEXT,
  destination TEXT,
  sequence TEXT[],
  meaning TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prayer_engine_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  category TEXT,
  structure TEXT[],
  example_sequence TEXT[],
  sequence TEXT[],
  scripture_anchor TEXT,
  declaration TEXT,
  prayer TEXT,
  duration TEXT,
  difficulty TEXT,
  translation TEXT[],
  prayer_meaning TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prayer_journeys (
  journey_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  days TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prayer_recommendation_map (
  user_state TEXT PRIMARY KEY,
  prayer_ids TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS glyph_definitions (
  word TEXT PRIMARY KEY,
  glyph TEXT,
  glyph_name TEXT,
  element TEXT,
  animation TEXT,
  meaning TEXT,
  symbol TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS graph_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  relationship TEXT NOT NULL,
  target TEXT NOT NULL,
  UNIQUE (source, relationship, target),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_graph_relationships_source
  ON graph_relationships (source);

CREATE INDEX IF NOT EXISTS idx_graph_relationships_target
  ON graph_relationships (target);

-- Source of truth for seed rows:
-- src/data/kingdomArchetypes.json
-- src/data/covenantPaths.json
-- src/data/destinyMaps.json
-- src/data/prayerEngineTemplates.json
-- src/data/glyphDefinitions.json
-- src/data/graphRelationships.json
