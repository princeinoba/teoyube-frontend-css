# ADR-004: Partitioned local hybrid retrieval

Status: Accepted for Prompt 20 preview infrastructure.

Decision: use a provider-neutral embedding gateway, a local Node SQLite vector repository, explicit trust partitions, exact + lexical + vector + TIG fusion, and Prompt 16 consent/encryption for user summaries.

Reasons:

- exact WEB Scripture must remain authoritative;
- hosted provider vector state is not authorized;
- source, consent, deletion, rollback, and cost must be inspectable;
- generated vectors must remain ignored and local;
- the existing static and Next preview interfaces must not change.

Consequences:

- local cosine search is bounded but not production-scale distributed infrastructure;
- worst-case 31,098-verse scan measured 3.02–3.53 seconds locally and stays below the 5-second gate;
- the 296,927,232-byte public index remains under the 600 MB active-index cap;
- production deployment, multi-region vector storage, operational key management, and Prompt 21 remain separate owner gates.

Rollback: disable `TEOYUBE_VECTOR_RETRIEVAL_ENABLED`, run `npm run retrieval:rollback` if required, and revert the Prompt 20 commits. No visual rollback is needed.
