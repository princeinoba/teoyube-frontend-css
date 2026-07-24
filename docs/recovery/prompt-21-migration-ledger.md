# Prompt 21 migration ledger

Starting commit: `d7aefa3f62c107e1806f3b90ea7963e39c8bc59f`.

| Capability | Prior state | Prompt 21 owner | Compatibility/removal |
| --- | --- | --- | --- |
| Gate inventory | Distributed scripts and reports | `scripts/release/gate-inventory.cjs` | Existing scripts retained |
| Release command evidence | Manual command lists | `scripts/release/command-runner.cjs` | Existing commands invoked, not replaced |
| Release manifest | Phase-specific reports | `scripts/release/release-evidence.cjs` | Reports retained and classified |
| Observability | Narrow privacy-safe events | Domain contract plus bounded server service | Existing event helper retained |
| Security evidence | Several focused verifiers | `scripts/release/security-gate.cjs` | Focused verifiers remain executable |
| Supply chain | Lockfile and ad hoc install checks | `scripts/release/supply-chain.cjs` | npm remains package manager |
| Performance | Prompt 17S 216-cell controller | `scripts/release/performance-gate.cjs` | Controller remains canonical |
| Accessibility | Parity and focus evidence | `scripts/release/accessibility-gate.cjs` | Inherited debt remains explicit |

No production runtime was replaced, no historical artifact was deleted, and no
protected visual or baseline file is in scope. Removal requires a later,
separately authorized archive review.
