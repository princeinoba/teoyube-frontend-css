# Research retention, withdrawal, and deletion

## Retention

Fixed formative-pilot events use `formative_pilot_180_days`. The executable repository deletes expired event files using event timestamps. Optional recordings are a distinct purpose and are not implemented or created in Phase 4B; the consent registry limits their intended retention to 30 days. Follow-up contact belongs in a separate future operator system and never in product-event storage.

## Withdrawal

Revoking participation or product-event consent blocks future collection on the next write. A withdrawn session envelope must be revoked by the operator. No raw reason for withdrawal is retained.

## Participant deletion

Deletion removes the participant event directory, so all active records and exported aggregates regenerated afterward exclude that participant. The operation is idempotent. A content-free receipt retains only study ID, a one-way deletion-key hash, completion time, and the truthful limitation `local_active_store_only`; it does not retain the participant ID.

## Study deletion

Study deletion removes active event and generated export paths for the study. Minimal content-free deletion receipts may remain for audit integrity. No claim is made about backups because Phase 4B implements no backup deletion system.

No actual participant event, recording, contact record, or export is created in this phase.
