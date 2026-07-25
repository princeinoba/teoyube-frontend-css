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

## Strict commit lineage

Release evidence distinguishes the runtime source commit, gate execution
commit, evidence commit, report commit, and current checked commit. Exact
source equality is required for a full gate. A descendant may reuse that gate
only when the runtime source is an ancestor, every intervening path is
classified, every existing evidence hash still matches, and all changes are
limited to exact owner records, exact evidence records, exact report files, or
verified non-behavioral runtime-manifest metadata.

The policy has no directory-wide documentation allowlist. A new source,
package, lockfile, route, API, runtime launcher, visual asset, baseline, test,
gate, or unknown path returns `REGENERATION_REQUIRED` or
`BLOCKED_UNKNOWN_CHANGE`. Hash-bound descendant records cannot be modified
after binding.

The verifier reports one of:

- `FULL_GATE_EXECUTED_AT_CURRENT_SOURCE`;
- `STRICT_EVIDENCE_ONLY_DESCENDANT_REUSE`;
- `REGENERATION_REQUIRED`;
- `BLOCKED_UNKNOWN_CHANGE`.

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
npm run release:evidence:bind
npm run release:evidence:lineage
npm run release:evidence:verify
npm run release:gate:preview
```
