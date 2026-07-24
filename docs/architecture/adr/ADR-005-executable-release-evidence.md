# ADR-005: Executable, commit-bound release evidence

Status: Accepted for Prompt 21 preview evidence.

## Decision

Use one local/CI evidence runner and one canonical manifest. Every PASS is
bound to a source commit, exact toolchain, command, output hash, threshold,
timestamp, and artifact hash. Reuse of expensive prior evidence is allowed only
when configured dependency paths are unchanged from the owner-tagged commit.

## Consequences

- Static `npm start` remains canonical and Next remains preview-only.
- Gate C-Preview can pass locally and in CI without an external monitoring
  vendor.
- Gate C-Production cannot pass without real deployment identity,
  infrastructure, controls, drills, and owner cutover approval.
- Passing verbose artifacts are deleted after hashing; failures retain bounded
  diagnostics.
- Production signing remains unresolved until an owner signing identity exists.

## Rejected alternatives

- Treating prior Markdown reports as a green gate.
- Running paid providers on pull requests.
- Committing large logs or raw model outputs.
- Normalizing semantic build differences to claim byte reproducibility.
