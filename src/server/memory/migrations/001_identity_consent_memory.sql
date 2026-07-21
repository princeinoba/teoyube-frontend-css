PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  applied_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('user', 'owner', 'admin')),
  local_subject_hash TEXT UNIQUE,
  created_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  csrf_hash TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  rotated_at TEXT,
  invalidated_at TEXT
);

CREATE INDEX IF NOT EXISTS sessions_user_active_idx ON sessions(user_id, expires_at, invalidated_at);

CREATE TABLE IF NOT EXISTS consent_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose_id TEXT NOT NULL,
  scope_json TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('grant', 'revoke', 'expire')),
  policy_version TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('user_ui', 'import')),
  prior_status TEXT,
  resulting_status TEXT NOT NULL,
  sequence INTEGER NOT NULL,
  integrity_hash TEXT NOT NULL UNIQUE,
  UNIQUE(user_id, purpose_id, sequence)
);

CREATE TABLE IF NOT EXISTS consent_projection (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose_id TEXT NOT NULL,
  event_id TEXT NOT NULL REFERENCES consent_events(id),
  status TEXT NOT NULL,
  scope_json TEXT NOT NULL,
  policy_version TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('user_ui', 'import')),
  granted_at TEXT,
  revoked_at TEXT,
  expires_at TEXT,
  version INTEGER NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY(user_id, purpose_id)
);

CREATE TABLE IF NOT EXISTS memories (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  idempotency_key TEXT NOT NULL,
  layer TEXT NOT NULL,
  sensitivity TEXT NOT NULL,
  purpose_id TEXT NOT NULL,
  consent_record_id TEXT NOT NULL REFERENCES consent_events(id),
  provenance_json TEXT NOT NULL,
  content_json TEXT,
  ciphertext TEXT,
  nonce TEXT,
  auth_tag TEXT,
  key_version TEXT,
  user_approved INTEGER NOT NULL CHECK (user_approved IN (0, 1)),
  status TEXT NOT NULL CHECK (status IN ('active', 'revoked', 'deleted', 'expired')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  expires_at TEXT,
  version INTEGER NOT NULL,
  CHECK ((sensitivity = 'sensitive_spiritual' AND ciphertext IS NOT NULL AND nonce IS NOT NULL AND auth_tag IS NOT NULL AND key_version IS NOT NULL AND content_json IS NULL)
    OR (sensitivity <> 'sensitive_spiritual' AND content_json IS NOT NULL AND ciphertext IS NULL)),
  UNIQUE(user_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS memories_owner_status_idx ON memories(user_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS memories_owner_purpose_idx ON memories(user_id, purpose_id, status);
CREATE INDEX IF NOT EXISTS memories_consent_idx ON memories(user_id, consent_record_id, status);

CREATE TABLE IF NOT EXISTS deletion_status (
  request_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status = 'complete'),
  deleted_records INTEGER NOT NULL,
  ciphertext_deleted INTEGER NOT NULL,
  derivatives_deleted INTEGER NOT NULL,
  completed_at TEXT NOT NULL,
  UNIQUE(user_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS export_audit (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requested_at TEXT NOT NULL,
  completed_at TEXT NOT NULL,
  record_count INTEGER NOT NULL,
  bytes INTEGER NOT NULL
);
