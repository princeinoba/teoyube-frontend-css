CREATE INDEX IF NOT EXISTS memories_expiry_idx ON memories(status, expires_at);
CREATE INDEX IF NOT EXISTS consent_projection_expiry_idx ON consent_projection(status, expires_at);
CREATE INDEX IF NOT EXISTS consent_history_idx ON consent_events(user_id, occurred_at DESC, sequence DESC);
CREATE INDEX IF NOT EXISTS deletion_status_user_idx ON deletion_status(user_id, completed_at DESC);
