# Release evidence architecture

Prompt 21 uses executable evidence, not a readiness statement.

`scripts/release/command-runner.cjs` runs the current gates and records the
exact command, timestamps, exit code, output hash, toolchain, source commit, and
failure tail. Passing full logs are deleted after hashing; failing logs are
retained under `.tmp/release-evidence/logs/`.

`scripts/release/release-evidence.cjs` assembles the compact package under
`artifacts/release-evidence/`. It verifies:

- source, lockfile, build, corpus, TIG, safety, prompt/schema, SDK, and index
  identities;
- every required current command result;
- artifact hashes and thresholds;
- checked-in kill-switch states;
- protected-source and baseline immutability;
- explicit Gate C-Preview and Gate C-Production states.

Historical Prompt 19K and Prompt 20 evidence can be reused only when the
configured relevant paths are unchanged from their owner tags. Reuse records
only hashes and summary metrics. Raw model content is never copied.

Framework build timestamps are not claimed to be byte-reproducible. Two clean
builds are compared using normalized semantic route and client-bundle
manifests. Raw hashes remain recorded. The only normalized value is Next's
exact generated `BUILD_ID`, including its `.next/static/<BUILD_ID>/` path
segment and exact references to that value; trace, diagnostic, and cache
directories are excluded as non-artifact runtime data.

The static runtime remains canonical. Gate C-Production remains closed until
the listed deployment dependencies and a separate owner cutover decision are
real.

Canonical commands:

```text
npm run release:commands:core
npm run release:commands:evidence
npm run release:evidence:generate
npm run release:evidence:verify
npm run release:gate:preview
```
