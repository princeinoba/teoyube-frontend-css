# Vector deletion and revocation

Vector deletion is part of the Prompt 16 derivative lifecycle.

- Revoking any embedding or semantic-index purpose deletes all current vectors for that user.
- Deleting memory deletes current user vectors.
- Account deletion deletes current user vectors.
- Source invalidation deletes vectors for the exact source/version.
- Expired records are excluded and may be invalidated in the retention path.

The deliberately broad user deletion on purpose revocation favors privacy over retaining unrelated semantic derivatives. A later re-consent can rebuild approved summaries.

Invalidation sets the record inactive, records deletion time, and destroys plaintext vector BLOB, content, or encrypted payload. Compaction then physically removes invalidated rows and vacuums the local database.

Operations return deleted/invalidated counts and retryable failures. Prompt 20 local tests prove immediate retrieval denial, ciphertext absence, cross-user exclusion, and lifecycle propagation.

The operational rollback command is `npm run retrieval:rollback`; the runtime kill switch is `TEOYUBE_VECTOR_RETRIEVAL_ENABLED=false`.
