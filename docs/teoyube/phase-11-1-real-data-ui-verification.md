# Phase 11.1 - Real Data UI Verification

## Data Files Checked

| Data file | Location | UI usage |
| --- | --- | --- |
| `coreTeoyubeVocabulary.json` | `src/data/coreTeoyubeVocabulary.json` | Lexicon, daily word, word/search support |
| `coreTeoyubeVocabulary-part2.json` | `src/data/coreTeoyubeVocabulary-part2.json` | Extended vocabulary support |
| `coreTeoyubeVocabulary-part3.json` | `src/data/coreTeoyubeVocabulary-part3.json` | Extended vocabulary support |
| `promiseClusters.json` | `src/data/promiseClusters.json` | Promise Table, Promise Search, calling/promise cards |
| `scriptureCanon.json` | `src/data/scriptureCanon.json` | Scripture anchor badges and canon support |
| `promiseCategories.json` | `src/data/promiseCategories.json` | Promise filtering/category copy |
| `teoyubeSearchFramework.json` | `src/data/teoyubeSearchFramework.json` | Search/roadmap context |
| `onboardingFlow.json` | `src/data/onboardingFlow.json` | Personalization/onboarding preview support |

## Runtime Data Boundary

The static app loads local JSON data and local preview records. The compatibility `/api/youtube/teoyube` endpoint now returns local source-not-connected preview data only; it does not fetch YouTube or other external URLs.

## UI Data Findings

- Daily Word, Lexicon, Promise Table, Search, Canon, Calling, Book, Testimony, Teo Guide, and media preview surfaces all use local/static data or guarded local fallbacks.
- Missing media or disconnected services are shown as disabled/source-status states.
- The app does not invent unsupported Scripture references during media fallback.
- The app keeps Scripture labels and promise references visible where available.

## Remaining Warnings

- Data normalization and deeper TypeScript contract verification are represented in `src/lib/teoyube/**`, but this workspace lacks a compiler/script to run those checks.
- Future Phase 11.2 work should decide whether to keep the static app or restore a real app-router product root.
