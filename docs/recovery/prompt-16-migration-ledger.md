# Prompt 16 Migration Ledger

| Capability | Previous state | Prompt 16 adapter | Removal status |
| --- | --- | --- | --- |
| Session state | In-memory `TeoyubeAppStateProvider` | Remains the consent-off/default path | Keep; visual and session fallback owner |
| Consent | Session-only personalization enum | Purpose-scoped server ledger, default-off | Keep compatibility adapter |
| Memory | Sanitized in-memory summaries | Typed server repository for explicitly approved records | Keep legacy until runtime cutover is separately authorized |
| Journey | Prompt 13 in-memory state machine | Structured continuity snapshot adapter; no private edit text | Keep Prompt 13 state machine unchanged |
| Teo Guide | Deterministic session turns | Authorized structured-memory reader with no write method | Keep deterministic behavior |
| Identity | None | Local/test provider plus server session repository | Production provider remains a dependency |

No legacy code, protected visual source, baseline, corpus, Scripture content-delta artifact, or historical archive is deleted in Prompt 16.
