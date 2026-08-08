# Current release evidence manifest

- Authorization: `TEOYUBE-ACCELERATED-RELEASE-2026-08-21-001`
- Generated: `2026-08-08T00:11:40.0985624-04:00`
- Commit: `72644c45d3e7f2c1918bf4ece21705e75ed4d786`
- Production build ID: `teoyube-da329e07a71145eaf7677099`

| Evidence | Classification | Result |
| --- | --- | --- |
| Runtime and build identity | CURRENT_RUNTIME | PASS |
| Complete recovery contract | CURRENT_RUNTIME | PASS |
| Full and production dependency audits | CURRENT_RUNTIME | PASS — zero vulnerabilities |
| A11Y-008 owner disposition | STRICT_DESCENDANT_REUSABLE | PASS — exact hash-bound disposition; no product remediation |
| 72 immutable screenshots / 12 DOM snapshots | STRICT_DESCENDANT_REUSABLE | PASS |
| Owner-approved support baselines | STRICT_DESCENDANT_REUSABLE | PASS |
| Prompt 19 live-AI proof | HISTORICAL | Preserved; feature is disabled for Production |
| Prompt 20 retrieval proof | HISTORICAL | Preserved; feature is disabled for Production |
| Historical 948,538-byte source-CSS total | OBSOLETE_FOR_CURRENT_GATE | Replaced by measured production request graph |
| Final performance/accessibility gate | CURRENT_RUNTIME | PASS - 216/216, zero violations, max 4,921.9 ms |
| Legacy static raster comparison | CURRENT_RUNTIME | 9 differences fully classified; zero unclassified regression; no baseline write |
| Vercel target binding | CURRENT_ACCOUNT_DISCOVERY | BLOCKED - exact target is ambiguous |
| Vercel Preview/Production proof | REGENERATE | Pending exact target selection and deployment |

Historical evidence is preserved. No paid API call was made. Current runtime, dependency, CSS, accessibility-delta, route, and 216-cell proof is generated at the release-candidate boundary. Deployment is paused only at the owner-authorized target-ambiguity hard stop.
