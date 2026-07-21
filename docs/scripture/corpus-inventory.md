# Local Scripture corpus and reference inventory

Verified: 2026-07-20  
Owner decision: `TEOYUBE-OWNER-SCRIPTURE-QUOTATION-2026-07-20-P15B`

The active corpus is the owner-supplied World English Bible archive registered as `engwebp`. The machine-readable source of truth is `src/server/scripture/corpus-registry.json`; its ordered asset composite checksum is `8f805bcedc37527099cd47f23fca4aed391c2721fd478349aab1945d960cddd4`.

| Source | Coverage | Integrity | Rights/display |
|---|---|---|---|
| `engwebp` WEB, Protestant Edition, 2020 stable text | 66 books; 1,189 chapter markers; 31,103 source verse markers; 31,098 displayable verses; five source-footnote-only markers | Archive SHA-256 `4253589697dc6b5e92695655f2f28792d50e7be7b9c8e212af4f4bd18e866c3b`; 68 USFM source hashes; 70/70 embedded checksums; corpus checksum `6e6b3f95b5d61c83c06534ee4281f10b6e4e02c878b75141dcdd4403bf42d77f` | Public domain; `FULL_TEXT_ALLOWED`; identify quotations as WEB; preserve exact wording |
| Teoyube local reference index | 356 normalized existing references | 17 hash-bound local metadata assets | `REFERENCE_ONLY`; Teoyube interpretation metadata is not Scripture |
| Legacy TIG KJV excerpt seed | Three isolated verses | Upstream source/version unknown | `DISPLAY_BLOCKED_LICENSE_UNKNOWN`; quarantined; never relabeled WEB |

The generated lexical index has 12,310 terms and checksum `544b67548c04a36e2445fa6601f07f6cdb7b8d044ae2691591629609b2eeeeb2`. The deterministic importer accounted for every source marker, rejected duplicate normalized keys, created no empty displayable verse, emitted zero warnings, and resolved all 356 Teoyube references.

Promise summaries, prayers, Teoyube words, assignments, user text, screenshots, and theology/product documents remain separate from the corpus.
