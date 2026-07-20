# Local Scripture corpus and reference inventory

Inventory date: 2026-07-20
Authorized starting commit: `715bd10a90abb0441c961f8d51166f7f89c74131`

## Finding

No complete local Scripture text corpus exists. The repository contains 356 normalized bare references across 53 of the approved 66 Protestant-canon books and three isolated KJV verse-text excerpts. Bare references carry no translation. The KJV excerpts do not record their upstream source, corpus version, attribution terms, or owner display approval.

The machine-readable source of truth is `src/server/scripture/corpus-registry.json`. Its composite checksum is `45dbec709a49fd5fe8a0c115c451ecf56ec5b2b538b72e31563606faa823bdf6`.

## Corpus-level inventory

| Source | Translation | Language | Coverage | Source/version | Rights evidence | Display policy |
| --- | --- | --- | --- | --- | --- | --- |
| Teoyube local reference index | None; references only | English metadata | 356 normalized references, 53/66 books, 0 verse texts | Original Teoyube datasets at starting commit | Translation rights not applicable to bare references | `REFERENCE_ONLY` |
| Legacy TIG excerpt seed | KJV label | English | Romans 8:28, Isaiah 40:31, Joshua 1:9 only | Upstream source/version unknown | Attribution, copyright status, and owner approval unknown | `DISPLAY_BLOCKED_LICENSE_UNKNOWN` |
| Complete approved full-text corpus | None | None | 0 books, 0 chapters, 0 verses | Not present | Not present | Unavailable |

## Reference-bearing local assets

The registry hash-binds 17 local JSON sources. `scriptureCanon.json` and `words.json` are byte-identical (`3bb4157f9a022bc080f270e67e846ba92adccbe73ce362213606241a47457205`) and each contains 108 Teoyube records, 324 reference occurrences, and 292 unique raw references. Other prayer, promise, lexicon, graph, architecture, and media-sample files expand aggregate normalized coverage to 356 references. These files contain Teoyube interpretation or application metadata; they are not Scripture corpora.

The only text-bearing candidate is `src/lib/tig/seed/scriptures.seed.ts`, SHA-256 `71ef56b788fa7857c2c0a86e55859808d2ea391442705ba1e317786800e30977`. It contains three KJV-labeled verses and is incomplete and display-blocked.

## Exclusions

Promise summaries, prayers, generated fixtures, PDF examples, screenshots, DOM baselines, Teoyube word meanings, user reflections, and static UI copy were not copied into the corpus. Their presence cannot establish translation provenance or display permission.
