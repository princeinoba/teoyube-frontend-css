# Legacy removal ledger

Phase 11.7A-R establishes capability boundaries without removing, relocating, or rewriting legacy behavior. The approved static runtime and its markup remain canonical.

| Capability | Compatibility adapter | Current legacy owners | Removal status | Required removal evidence |
| --- | --- | --- | --- | --- |
| today | `features/today/legacy-adapter.ts` | Phase 11/11.2 productization | RETAIN | Six-viewport visual, DOM/class, asset, functional, accessibility, and owner parity approval |
| search | `features/search/legacy-adapter.ts` | screenshot application; local data access | RETAIN | Same parity evidence for Search |
| scripture | `features/scripture/legacy-adapter.ts` | screenshot application; Scripture data access | RETAIN | Same parity evidence for Canon/Scripture |
| promises | `features/promises/legacy-adapter.ts` | Promise Table screenshot; promise engine | RETAIN | Same parity evidence for Promise Table |
| prayer | `features/prayer/legacy-adapter.ts` | Prayer Companion; existing prayer adapter | RETAIN | Same parity evidence for Prayer |
| calling | `features/calling/legacy-adapter.ts` | Calling Compass screenshot; calling engine | RETAIN | Same parity evidence for Calling Compass |
| journey | `features/journey/legacy-adapter.ts` | journey page integration; orchestrator | RETAIN | Same parity evidence for Journey |
| journal | `features/journal/legacy-adapter.ts` | Phase 11 panels; app-state provider | RETAIN | Same parity evidence for Journal |
| testimony | `features/testimony/legacy-adapter.ts` | testimony screenshot; app-state provider | RETAIN | Same parity evidence for Testimony |
| book | `features/book/legacy-adapter.ts` | Book screenshot; app-state provider | RETAIN | Same parity evidence for Book of the Saint |
| lexicon | `features/lexicon/legacy-adapter.ts` | Lexicon screenshot; local data access | RETAIN | Same parity evidence for Lexicon |
| teo-guide | `features/teo-guide/legacy-adapter.ts` | Teo Guide screenshot; Phase 11.2 response behavior | RETAIN | Same parity evidence for Teo Guide |
| media | `features/media/legacy-adapter.ts` | embedded-media screenshot; local media search | RETAIN | Same parity evidence for media views and controls |
| settings | `features/settings/legacy-adapter.ts` | settings page; app-state provider | RETAIN | Same parity evidence for Settings |
| consent | `features/consent/legacy-adapter.ts` | public notices; app-state provider | RETAIN | Consent, privacy, reversibility, and parity evidence |
| memory | `features/memory/legacy-adapter.ts` | TIG data manager; app-state provider | RETAIN | Explicit-write, edit/export/delete, and parity evidence |

No removal is authorized by this ledger. A row may change only in the feature-specific parity task after executable evidence and owner sign-off.

## Prompt 18 Teo Guide migration note

The server-owned deterministic orchestrator now sits behind the approved Teo Guide view and existing compatibility message builder. No legacy Teo Guide, static runtime, protected view, stylesheet, asset, baseline, TIG implementation, Scripture implementation, safety implementation, or Prompt 16 memory implementation was deleted. The compatibility builder remains `RETAIN` until a later owner-authorized removal gate proves it has no production consumer and re-runs visual, functional, safety, and content parity.

## Prompt 15 Scripture migration note

`src/features/scripture/infrastructure/local-scripture-repository.ts` remains a compatibility export to the canonical server-owned repository. Prompt 15B activated the owner-approved `engwebp` corpus and remediated the 17 visible quotation records through an exact source/content-delta overlay. No legacy file was deleted.

The following debt remains `RETAIN_QUARANTINED`: 15 unreachable `clientsPromiseRows` entries in `app.js`, three unknown-provenance KJV TIG excerpt seeds, one noncanonical offline fallback, and one dormant historical fallback. The five prayer/paraphrase records remain typed prayer content rather than removal candidates. `scripts/recovery/verifyNonVisibleScriptureQuarantine.cjs` prevents all 20 legacy records from entering canonical Scripture DTOs or visible output. Removal requires independent consumer, parity, and owner evidence.
