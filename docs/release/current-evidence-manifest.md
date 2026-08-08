# Current release evidence manifest

- Authorization: `TEOYUBE-ACCELERATED-RELEASE-2026-08-21-001`
- Generated: `2026-08-08T00:38:04.692Z`
- Commit: `228f50f37bb8517530565654b03a3604110e53a6`
- Production build ID: `teoyube-cbc850690383bff13ed154b9`

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
| Final 216-cell parity/performance gate | REGENERATE | Pending clean release commit |
| Vercel Preview/Production proof | REGENERATE | Pending deployment |

Historical evidence is preserved. No paid API call is needed to refresh commit metadata. Current runtime, dependency, CSS, accessibility-delta, route, and deployment proof is generated at the release candidate boundary.
