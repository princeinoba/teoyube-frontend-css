# Data Classification

The executable registry is `src/domain/memory/data-classification-registry.ts`.

| Class | Sensitivity | Default | Consent | Storage/encryption | Logs | Model/analytics |
| --- | --- | --- | --- | --- | --- | --- |
| 0 Public/reference | Scripture, citations, Promise Clusters, Lexicon, TIG datasets | Versioned public corpus | Not required | Public repository; ordinary at-rest controls | Identifiers only | Not user data; aggregate non-content only |
| 1 Low | Translation, response length, accessibility, reminders | Explicit only | Preference continuity | Server relational; at-rest controls | Identifiers only | Model use off; aggregate non-content only |
| 2 Structured spiritual | Journey status, citations, accepted/rejected action, TIG IDs | Explicit only | Journey or testimony/Book purpose | Server relational; at-rest controls | Identifiers only | Model use off; aggregate non-content only |
| 3 Sensitive spiritual | Prayer, journal, check-in, testimony draft, trauma/health/grief/crisis, private Teo Guide text | Ephemeral | Sensitive-content purpose plus explicit record approval | Server relational; application AEAD | Never raw content | Model and analytics off |
| 4 Security/identity | Account IDs, session hashes, authorization, key versions | Server authoritative | Authenticated session | Server session/relational; hashes or key references | Never raw content | Model and analytics off |

Class 3 content is never indexed, embedded, copied into analytics, placed in test snapshots, or logged. Scripture remains Class 0 and is not duplicated per user; a user record carries exact citation/version metadata only.
