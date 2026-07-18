CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS scripture_canon (
  id TEXT PRIMARY KEY,
  teoyube_word TEXT NOT NULL,
  word TEXT,
  meaning TEXT,
  category TEXT,
  scripture_references TEXT[],
  scripture_themes TEXT[],
  promise_statement TEXT,
  archetype_links TEXT[],
  path_links TEXT[],
  cluster_links TEXT[],
  prayer_use TEXT,
  graph_tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scripture_linked_paths (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sequence TEXT[],
  scripture_flow TEXT[],
  path_prayer TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scripture_linked_archetypes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  teoyube_word TEXT,
  scriptural_models JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scripture_promise_clusters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  core_words TEXT[],
  scripture_anchor TEXT,
  supporting_references TEXT[],
  cluster_declaration TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scripture_graph_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT,
  source TEXT NOT NULL,
  relationship TEXT NOT NULL,
  target_type TEXT,
  target TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (source_type, source, relationship, target_type, target)
);

CREATE TABLE IF NOT EXISTS scripture_search_tags (
  tag TEXT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scripture_canon_word
  ON scripture_canon (teoyube_word);

CREATE INDEX IF NOT EXISTS idx_scripture_graph_source
  ON scripture_graph_relationships (source);

CREATE INDEX IF NOT EXISTS idx_scripture_graph_target
  ON scripture_graph_relationships (target);

-- Source of truth for seed rows:
-- src/data/scriptureCanon.json
-- src/data/scriptureLinkedPaths.json
-- src/data/scriptureLinkedArchetypes.json
-- src/data/scripturePromiseClusters.json
-- src/data/scriptureGraphRelationships.json
-- src/data/scriptureSearchTags.json
