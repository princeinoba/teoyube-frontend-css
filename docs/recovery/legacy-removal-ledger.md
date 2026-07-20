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

## Prompt 15 Scripture migration note

`src/features/scripture/infrastructure/local-scripture-repository.ts` is now a compatibility export to the canonical server-owned repository. The approved Canon view still uses its original reference-only view model and output. Legacy Scripture anchors, hard-coded visible quotations, TIG seed excerpts, and interpretation datasets remain retained because no complete approved text corpus exists. No legacy consumer may be removed or promoted to corpus authority until exact-text, licensing, integration, and parity evidence passes.
