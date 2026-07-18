# Phase 11.6C.2A.3 Blocker Dashboard

The canonical dashboard reports deterministic counts for revision `pilot-r1-4e4af913faac`:

| Category | Count |
| --- | ---: |
| Technical | 0 |
| Record metadata | 12 |
| Owner review | 13 |
| Scripture | 25 |
| Rights | 13 |
| Safety | 13 |
| Sequence | 1 |
| Duplicate | 0 |
| Checksum/source | 0 |
| Pilot count | 0 |
| Approval artifact | 0 |

Each blocker carries a deterministic ID, category, record/sequence scope, plain-language action, technical-fix flag, owner-confirmation flag, and an `Open` route to the exact control. `Fix All Technical Blockers` can only re-read and normalize technical state; it cannot confirm owner decisions. `Fix Next Blocker` uses a stable category priority.

The UI, API, and persisted report all show 77 blockers for this revision. The approval control is absent.
