# Preview managed-vector canary gate reconciliation

Evidence commit under test: `e93606129da5a0e96025be0ce1e2a625421028c5`

The exact LF-preserving validation clone passed the complete recovery gate, full lint, production build, dependency audit, supply-chain gate, all focused managed-vector tests, and all four secret controls.

The full suite produced 471 passes, one skip, and four accessibility-identity failures. The same four tests fail with the same messages on the untouched authorized parent `9226605ede0a2fd7196bc68fcfebf8d5f747b284`; therefore they are historical and not a canary regression.

The release security gate has one remaining high finding: `paid-evidence-reuse-boundary`. Its evidence reports valid locked Vector V2 paid evidence and no vector evidence failure. The block is the historical `liveAiDependenciesChanged` comparison against `teoyube-prompt19k-pass-f7d6385`. The same paid-evidence boundary fails on the untouched authorized parent; the canary changes no Live AI source, keeps Live AI off, and makes zero generation calls. The parent additionally lacks the canary lockfile's current audit identity, while the canary dependency audit passes with zero vulnerabilities.

No control was weakened or reclassified. The owner authorization explicitly permits this Preview-only vector canary, prohibits paid generation, and requires stopping for a security regression. This evidence establishes that there is no security regression: tracked secret scan, history secret scan, client/server bundle scan, local environment boundary, dependency scan, vector V2 evidence binding, recovery protection, and the new Preview route controls all pass.

