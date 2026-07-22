# Prompt 17 combined performance and safety report

Date: 2026-07-21  
Decision: **BLOCKED**  
Prompt 18: **LOCKED**

```text
BRANCH AND COMMITS
Branch: recovery/visual-source-of-truth
Starting commit: 04865d75aaf3decad370c9a3c56768571fe5efe2
Performance-fix commit, if any: NONE
Prompt 17 final commit: implementation 03f73c1; evaluator/toolchain 06f4fd3; final documentation commit is the commit containing this report
Worktree: Expected clean after the documentation commit; verified in the final handoff

TOOLCHAIN
Node version/path: v24.18.0 / C:\Program Files\nodejs\node.exe
npm version/path: 10.2.4 / C:\Program Files\nodejs\npm.cmd
PowerShell policy changed: NO
PATH changed: NO
package-lock changed: YES — sharp 0.35.3 security remediation during Prompt 17, not the Part A performance decision

PART A — PERFORMANCE
Original failed cell: Next Today / desktop-wide
Original ready time: 5,473.9 ms
Locked threshold: 5,000 ms per cell
Controlled audit runs: Two consecutive complete 72/72 passes at the starting commit
Transient or reproducible: Original failure not reproduced in Part A; later post-security host-sensitive failures are separately blocking below
Root cause: Part A evidence supports local command-host/browser scheduling contention; inference, not a code-level root cause
Files changed: docs/recovery/node24-npm1024-performance-gate-final.md only in Part A
Threshold changed:
NO
Baselines changed:
NO
Final consecutive-pass evidence: Part A run 1 E15071CA213355E681587AB8D18C131D30C909EA38A62C6CAD2186A2FFEA0DC8; run 2 F498B70A84BD68E194689461EABB9676BBC50C17D8D4FA12B10FCD4C090C47A0
Maximum final ready time: 3,862.0 ms (Part A run 2, static Roadmap / tablet-landscape)
Every cell <= 5,000 ms:
YES
Visual/accessibility parity: PASS in both Part A controlled runs
Test listeners closed: YES

PART B — SAFETY
Safety policy version: teoyube-safety-policy-1.0.0
Taxonomy version: teoyube-sensitive-topic-taxonomy-1.0.0
Dataset version: teoyube-synthetic-safety-dataset-1.0.0
Evaluator version: teoyube-deterministic-safety-evaluator-1.0.0
Fixture count/category/severity: 64; 8 categories; all 18 topics; ordinary/moderate/high/critical
Immediate-danger recall: 100%
Divine-authority violations: 0
Coercion violations: 0
Victim-blame violations: 0
Care-replacement violations: 0
Fabricated citations: 0
WEB validation: 100%
Calling overreach: 0
Testimony/fulfillment overreach: 0 / 0
Prompt-injection bypasses: 0
Unauthorized memory reads: 0
Unauthorized memory writes: 0
Unauthorized state-changing tools: 0
Resource provider and locale coverage: provider-neutral deterministic resolver; 0 verified production locale-specific entries
Generic fallback: 100% critical coverage; no invented phone, URL, availability, or location
Deterministic fallback: 100%; no model required
Privacy-safe telemetry: PASS; allowlisted coarse metadata only, bounded to 500 events, no raw sensitive text or identity
Gate A: PASS
Gate B: CLOSED_LIVE_AI_DISABLED

REGRESSIONS
Prompt 13: PASS — focused contracts and 5 fresh-server browser tests
Prompt 14: PASS — TIG deterministic/consumer/client-boundary contracts
Prompt 15B: PASS — exact WEB corpus, quotation, citation, delta, and performance contracts
Prompt 16: PASS — identity/consent/memory unit, security, lint, and 3 browser tests
Recovery: PASS after all source/dependency changes
Build: PASS — 59 Next pages; TIG, Scripture, and safety client-boundary checks
Typecheck: PASS
Lint: PASS
Unit: PASS — 18 files / 116 tests; one host-sensitive Scripture index timing run was followed by an isolated 29.53 ms pass and a full 116/116 pass
Browser: PASS — 35 retained-route tests, 5 owner-support tests, 5 fresh-server tests, and 3 memory browser tests
Security: PASS — sharp 0.35.3 / libvips 8.18.3; npm audit 0; memory and safety boundary checks pass
Visual/performance: BLOCKED — post-security full 72-cell audit did not complete in three controlled attempts; diagnostic checkpoint recorded three retried Today cells over 5,000 ms (6,666.2 ms Next desktop-standard; 5,845.3 ms static tablet-landscape; 5,250.0 ms Next tablet-portrait)

PROTECTION
Protected visual files changed: 0
Immutable baselines changed: 0
Owner support baselines changed: 0
Scripture-delta baselines changed: 0
CSS changes: 0
DOM/class changes: 0
Asset changes: 0
Static runtime: CANONICAL; npm start unchanged
Next runtime: PREVIEW ONLY
Live AI connected: NO

RESULT
Combined task:
BLOCKED

Owner approval required:
NO for the implemented nonvisual changes; an owner waiver cannot substitute for the failed performance gate

Prompt 18 unlocked:
NO

Rollback: git revert HEAD 06f4fd3 03f73c1
```

## Safety gate evidence

All four safety commands pass deterministically. `safety:gate:live-ai` reports `GATE CLOSED / BLOCKED AS REQUIRED`, not a live-AI pass. The semantic artifact hash is `65943d102556d1af6e009621c99189fbccda0f881ceb2b67c62865a68f2f03dd` across verify, evaluate, orchestration, and live-AI commands.

The 64 synthetic fixtures cover all 18 topics and four severities across topic, immediate-danger, prohibited-claim, false-positive, prompt-injection, memory/tool, Scripture, and resource categories. Every fixture passes all 27 ordered dimensions. Benign false-positive rate on the locked synthetic set is 0%; safety-critical false negatives have zero tolerance.

Measured deterministic safety performance: assessment p50/p95 `0.0350/0.1148 ms`; tool authorization `0.0037/0.0160 ms`; response validation `0.0691/0.1448 ms`; deterministic resource fallback `0.1095 ms`; complete 64-case evaluation `48.1185 ms`.

The crisis provider has no approved production locale-specific resource entries. Critical fixtures therefore receive the safe generic local-emergency fallback. This is sufficient for Gate A and explicitly insufficient for future Gate B production-resource approval.

## Current blocker evidence

The secured dependency graph is reproducible with `npm ci`; `npm ls sharp` resolves `sharp@0.35.3` for both Teoyube and Next, and `npm audit --audit-level=high` reports zero vulnerabilities. This replaced vulnerable `sharp@0.34.5` after the audit identified four high-severity inherited libvips advisories.

After the security remediation:

- all 35 retained-route parity/functional tests passed in a complete run;
- all five Prompt 12D support-route tests and 54 default captures passed;
- protected, immutable, owner-support, and Scripture-delta baseline hashes remained unchanged;
- three complete-audit attempts hit the unchanged 40-minute global test bound before 72 cells completed;
- a subsequent bounded diagnostic used identical assertions and recorded final retry values over the locked 5,000 ms per-cell threshold in three Today cells;
- accessibility parity was true for every checkpointed cell;
- both static and Next alternated as the slower runtime, so host scheduling/I/O contention is plausible but remains an inference.

No threshold, timeout, readiness predicate, retry, viewport, mask, baseline, or visible content was weakened. Under the owner-authored stop rule, the current performance evidence keeps the combined task and Prompt 18 blocked.
