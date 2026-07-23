# Retrieval partitions

| Partition | Trust label | Owner | Vector eligibility |
|---|---|---|---|
| `canonical_scripture` | `CANONICAL_SCRIPTURE` | reviewed public | Yes; display always re-fetched from WEB |
| `scripture_context` | `REVIEWED_SCRIPTURE_CONTEXT` | reviewed public | Yes |
| `promise_clusters` | `REVIEWED_TEOYUBE_CONTENT` | reviewed public | Yes |
| `lexicon` | `REVIEWED_TEOYUBE_CONTENT` | reviewed public | Yes |
| `prayer_resources` | `REVIEWED_TEOYUBE_CONTENT` | reviewed public | Yes |
| `theology_safety` | `SYSTEM_POLICY_REFERENCE` | reviewed public | Yes |
| `journal_summaries` | `USER_AUTHORED_APPROVED_SUMMARY` | one user | Dual consent, encryption, structured summary only |
| `testimonies` | `USER_CONFIRMED_TESTIMONY` | one user | Dual consent, encryption, user-confirmed only |
| `journey_history` | `USER_APPROVED_JOURNEY_STATE` | one user | Dual consent, encryption, approved state only |
| `calling_evidence` | `USER_APPROVED_CALLING_EVIDENCE` | one user | Dual consent, encryption, approved evidence only |
| `product_help` | `REVIEWED_PRODUCT_HELP` | reviewed public | Yes |

Every record has exactly one partition and one allowed trust label. Runtime metadata validation rejects cross-partition trust, missing source/version/checksum data, raw Class 3 text, public records with a user owner, and user records without owner plus consent provenance.

The public index contains seven public partitions. User partitions are empty by default and cannot be created until the public quality gate, authentication, owner, encryption, external-processing consent, and partition-purpose consent all pass.
