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

Framework build output is not claimed to be byte-identical. Two clean builds
are compared using normalized semantic route, client, and server manifests,
while raw hashes and byte counts remain recorded. Normalization is limited to
Next's exact generated `BUILD_ID`, its exact static path references, exact ISO
values assigned to `createdAt`, `updatedAt`, `generatedAt`, or `requestedAt`,
and the exact legacy internal `phase34_tig_<timestamp>_<nonce>` and
`tig_demo_request_<timestamp>` result-ID shapes. Equivalent JSON, React-flight,
and HTML-entity encodings of those exact fields are handled identically.
Trace, diagnostic, and cache directories are excluded as non-artifact runtime
data.

The prerender-only initial export timestamp is supplied through
`SOURCE_DATE_EPOCH` from the source commit. The comparison process also supplies
an evidence-only Next Server Actions encryption key derived from that commit;
the key value is never written to evidence. Deployment builds must use a
deployment-managed key and production signing identity. Ordinary runtime
timestamps and IDs remain current and nondeterministic.

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
