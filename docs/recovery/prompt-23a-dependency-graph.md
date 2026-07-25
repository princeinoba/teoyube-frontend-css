# Prompt 23A dependency and reachability graph

Generated: 2026-07-25T12:31:24.126Z

## Summary

- Nodes: **3516**
- Edges: **10690**
- Next-reachable: **589**
- Static rollback-reachable: **465**
- Shared runtime: **328**
- Test-reachable: **1947**
- CI/build/tooling-reachable: **1780**
- Documentation/evidence-reachable: **2163**
- Unresolved string/path risks: **487**

## Edge coverage

| Edge type | Count |
|---|---:|
| api-route-string | 173 |
| commonjs-require | 147 |
| css-url | 1036 |
| dynamic-import | 3 |
| html-reference | 11 |
| package-script | 120 |
| public-url | 65 |
| static-import | 5973 |
| string-path | 3162 |

## Candidate proof

### P23A-D001 — diagnostic probe

- Next production: NO
- Static rollback: NO
- Shared runtime: NO
- Tests: NO
- CI/build: NO
- Documentation/evidence: NO
- Dynamic/string risk: NO
- Protected/owner dependency: NONE
- Incoming parsed references: 0
- Decision: `PENDING`

### P23A-R001 — open lint dependency chain

The chain is active build tooling. It is retained and classified `REFACTOR_LATER_NOT_ARCHIVE`; production reachability is none, but lint/CI/build-gate reachability is current. Full audit remains blocked at nine highs.

### P23A-K001 — protected rollback aggregate

Static rollback, protected visual source, immutable baselines, owner-approved baselines, owner references, legacy hash mappings, assets, and rollback tests are retained. `STATIC_ROLLBACK_ARCHIVE_ELIGIBLE: NO`.

The JSON graph contains every parsed edge and candidate proof record. Unresolved strings remain conservative risk markers and cannot support archive or deletion.

## Prompt 23A-D scoped delta

Generated: 2026-07-25T19:43:04.511Z

- Gate-execution source commit: `ff925572a8117e21d0532f7127cc3111cc297d1b`
- Nodes: **3521**
- Edges: **10726**
- Added nodes: **5**
- Added edges: **36**
- Next-reachable: **1866**
- Static rollback-reachable: **465**
- Shared runtime: **432**
- Test-reachable: **2012**
- CI/build/tooling-reachable: **1805**
- Documentation/evidence-reachable: **2229**
- Unresolved string/path risk records: **487**

The scoped scan considered only added dependency-bearing lines in the
15 files changed from the authorized starting commit and
deduplicated them against the frozen graph. It added only edges whose source
and target are inventory nodes. Report-only artifacts outside the frozen node
set were not backfilled. Candidate reachability did not change, and no runtime
tooling file became an archive/delete candidate.
