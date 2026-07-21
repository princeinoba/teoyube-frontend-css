# Legacy Scripture Quotation Owner Review

Status: **RESOLVED BY OWNER DECISION `TEOYUBE-OWNER-SCRIPTURE-QUOTATION-2026-07-20-P15B`**

Prepared: 2026-07-20

Owner corpus decision: `TEOYUBE-OWNER-SCRIPTURE-CORPUS-2026-07-20-WEBP`
Authorized starting commit: `792b37a5995bbf4621edcac2e3da6e11710612a5`

This remains the immutable Prompt 15A review narrative. The formal approval and mandatory 17-row outcome table are recorded in `docs/owner-approvals/scripture/TEOYUBE-OWNER-SCRIPTURE-QUOTATION-2026-07-20-P15B.md`. The bound JSON inventory remains byte-identical at SHA-256 `F6108E8617786464888DCBABB3F48899ED5A113D4D3851AF947CED776D91D68C`.

## Resolution

All 17 visible records were replaced with their exact selected WEB wording and labeled through the existing citation treatment. The separate source-delta contract replays those exact changes without weakening historical visual contracts. The 20 non-visible legacy records remain executable-quarantined, and the five prayer/paraphrase records remain non-Scripture content without WEB labels. Historical screenshots were not overwritten.

## Why Prompt 15A stopped

The owner-selected archive safely identifies itself as the World English Bible, 66-book Protestant edition. Comparing its exact text with existing product copy found visible canonical quotations that do not match WEB. Prompt 15A names this as a hard stop. The quotations remain unchanged and are not labeled WEB.

Audit totals:

- 17 distinct visible product quotation records: `LEGACY_NON_WEB_WORDING`
- 0 visible quotation records: `EXACT_WEB_MATCH`
- 0 audited quotation references: `UNRESOLVED_REFERENCE`
- 5 TIG prayer phrases: `NOT_SCRIPTURE_QUOTATION` because they are devotional prayer/paraphrase text, not verse text
- reference-only product areas remain reference-only and were not promoted to quotations

The machine-readable occurrence inventory, full current wording, exact WEB comparison text, source locations, route states, and non-visible legacy debt are in [legacy-quotation-owner-review.json](legacy-quotation-owner-review.json).

## Exact requested scope if the owner elects to change content

No option has been selected. Any later implementation must be limited to the exact owner-selected record IDs.

- Routes/views: Today (`#today`, `/`), Canon (`#canon`, `/canon`), Calling Compass (`#calling`, `/calling-compass`), Book of the Saint (`#book`, `/book`), Lexicon (`#lexicon`, `/lexicon`), Teo Guide (`#guide`, `/teo-guide`), Promise Table (`#table`, `/promise-table`), and Tables (`#teoyube-tables`, `/tables`).
- Exact protected source families: `index.html`, `app.js`, `scripts/seedDB.js`, `src/app/_today/ApprovedTodayView.tsx`, and the derived approved-view markup used by the Next preview.
- Exact selectors/components: `.daily-inspiration-card blockquote`, `.canon-profile-widget blockquote`, `.calling-daily-inspiration p`, `.book-encouragement-card p`, `.book-journey-scripture p`, `.book-lantern-card h4`, `.lexicon-inspiration-card p:not(.eyebrow)`, `.lexicon-scripture-art p`, `.guide-wisdom-banner p`, `.promise-search-item p`, and `.table-detail-copy p`.
- Assets: none.
- Viewports/states: all six required viewports; default states for every affected route; Promise/Table default, expanded-row, filtered, pagination, API-success, and local-fallback states.

## Visible canonical records

| ID | Route/state | Reference | Finding |
| --- | --- | --- | --- |
| `UI-TODAY-001` | Today default | Psalm 121:7 | Existing “harm / watch over your life” wording differs from WEB “evil / keep your soul.” |
| `UI-CANON-001` | Canon default | Ephesians 1:18 | Existing prayer-style sentence is not the WEB verse text. |
| `UI-CALLING-001` | Calling Compass default | Ephesians 1:18 | Existing prayer-style sentence is not the WEB verse text. |
| `UI-BOOK-001` | Book default | Proverbs 3:5-6 | Existing wording uses “Lord,” “submit,” and different punctuation; it is not exact WEB. |
| `UI-BOOK-002` | Book default | Psalm 77:11 | Existing wording differs from WEB’s “LORD’s deeds” and “wonders of old.” |
| `UI-BOOK-003` | Book default | Luke 16:10 | Existing sentence is a devotional paraphrase, not the WEB verse. |
| `UI-LEXICON-001` | Lexicon default | Colossians 3:16 | Existing partial sentence removes WEB punctuation and the remainder of the verse. |
| `UI-LEXICON-002` | Lexicon default | Proverbs 9:10 | Existing sentence changes `LORD` and omits the second WEB sentence. |
| `UI-GUIDE-001` | Teo Guide default | Psalm 119:105 | Existing wording uses “light to my path”; WEB uses “a light for my path.” |
| `UI-PROMISE-001` | Promise/Table API-success and fallback | Ephesians 1:18 | KJV-like legacy wording; not WEB. |
| `UI-PROMISE-002` | Promise/Table API-success and fallback | 2 Corinthians 6:1 | KJV-like legacy wording; not WEB. |
| `UI-PROMISE-003` | Promise/Table API-success and fallback | 2 Corinthians 6:2 | KJV-like legacy wording; not WEB. |
| `UI-PROMISE-004` | Promise/Table local fallback | 2 Corinthians 6:3 | KJV-like legacy wording; not WEB. |
| `UI-PROMISE-005` | Promise/Table local fallback | 2 Corinthians 6:4 | KJV-like legacy wording; not WEB. |
| `UI-PROMISE-006` | Promise/Table local fallback | 2 Corinthians 6:5 | KJV-like legacy wording; not WEB. |
| `UI-PROMISE-007` | Promise/Table local fallback | 2 Corinthians 6:6 | KJV-like legacy wording; not WEB. |
| `UI-PROMISE-008` | Promise/Table local fallback | 2 Corinthians 6:7 | KJV-like legacy wording; not WEB. |

The Promise/Table records are displayed by the protected static runtime and its approved Next reproduction. The separate owner-approved `/promise-search` support route displays references and interpretation fields only; it does not display these quotation records.

## Existing behavior and before evidence

The current wording is part of the protected composition. Representative immutable desktop-wide screenshots are:

- `tests/visual/baselines/static-runtime/desktop-wide/today.png`
- `tests/visual/baselines/static-runtime/desktop-wide/canon.png`
- `tests/visual/baselines/static-runtime/desktop-wide/calling.png`
- `tests/visual/baselines/static-runtime/desktop-wide/book.png`
- `tests/visual/baselines/static-runtime/desktop-wide/lexicon.png`
- `tests/visual/baselines/static-runtime/desktop-wide/guide.png`
- `tests/visual/baselines/static-runtime/desktop-wide/table.png`
- `tests/visual/baselines/static-runtime/desktop-wide/teoyube-tables.png`

All six viewport baselines remain immutable. No screenshot was recaptured or modified.

## Precise content mock-up options

No proposed-after option is selected. The owner must decide per record or explicitly approve a grouped scope.

1. `REPLACE_WITH_EXACT_WEB`: render the exact WEB wording recorded in the JSON and retain the reference. This visibly changes protected text and may change line wrapping, geometry, and screenshots.
2. `REFERENCE_ONLY`: remove the quotation and retain a validated reference using an already approved structure. This visibly changes composition and requires scoped visual approval.
3. `RETAIN_AS_NON_SCRIPTURE_COPY`: retain or edit the sentence as clearly labeled Teoyube interpretation/devotional language, not a quotation and not WEB. This requires owner-approved labels/copy and exact visual scope.
4. `RETAIN_UNCHANGED`: leave the historical wording unchanged and unvalidated. This does not unblock Prompt 15A because visible canonical quotation debt remains.

Exact WEB text is evidence for comparison, not permission to implement option 1.

## Non-visible and non-canonical debt

The audit also found:

- 15 unreachable `clientsPromiseRows` compatibility records in `app.js`; all are legacy non-WEB wording. They are after an unconditional `return` and were not treated as current visible output.
- 3 KJV TIG excerpt seeds; they remain blocked by the existing corpus registry and are not relabeled WEB.
- 1 offline KJV fallback excerpt and 1 dormant Psalm 119:105 fallback sentence; neither was promoted to canonical WEB text.
- 5 TIG prayer `scriptureAnchor` phrases that are devotional prayer/paraphrase language. They are classified `NOT_SCRIPTURE_QUOTATION` and must remain separate from verse text.
- The TIG prayer generator can interpolate blocked TIG seed text on internal/development surfaces. That inherited text remains unvalidated and is not a new source of Scripture truth.

## Module audit

- Today: visible legacy quotation (`UI-TODAY-001`).
- Search: reference-only results and interpretation; no canonical quote promoted.
- Promise Search: retained `/promise-search` route is reference-only; legacy Promise/Table seed quotations are separately inventoried.
- Canon: visible legacy quotation (`UI-CANON-001`).
- Promise Table and Tables: visible legacy quotation records (`UI-PROMISE-001` through `UI-PROMISE-008`).
- Prayer: visible prayer remains interpretation/prayer; TIG prayer paraphrases are not classified as Scripture text.
- Calling Compass: visible legacy quotation (`UI-CALLING-001`).
- Journey, Journal, and Testimony: references/provenance only; no canonical quotation promoted.
- Book of the Saint: three visible legacy records (`UI-BOOK-001` through `UI-BOOK-003`).
- Lexicon: two visible legacy records (`UI-LEXICON-001` and `UI-LEXICON-002`).
- Teo Guide: one visible legacy record (`UI-GUIDE-001`).
- TIG: three blocked KJV seed excerpts; no seed is relabeled WEB.
- API fixtures/tests: the static `/api/promises/seed` source contains the first three Promise/Table legacy records; boundary tests contain detection patterns, not approved quotation fixtures.

## Alternatives and effects

- Architecture cannot resolve this behind the current interface because the conflict is the visible wording itself.
- Exact WEB replacement preserves source fidelity but can change wrapping and geometry.
- Reference-only output reduces quotation risk but removes visible content.
- A labeled devotional interpretation can preserve the thought but adds or changes visible copy.
- Retaining the text unchanged preserves parity but leaves the exact-quotation gate blocked.
- Accessibility semantics may improve if quotation and interpretation are distinguished, but any markup or label change requires the same scoped review.
- Performance impact is expected to be negligible for copy-only choices. Runtime behavior, focus order, and interaction sequencing must remain unchanged.

## Rollback plan for any later approved implementation

Use a focused content commit and revert that commit with `git revert <approved-content-commit>`. Never restore or regenerate visual baselines as a rollback mechanism. The static source and all approved Next mirrors must be reverted together so parity remains honest.

## Decision needed from the owner

For each listed record ID, provide one option and exact scope. A decision must also state whether a later visual change request may be prepared for the affected selectors and all required viewport/state evidence. Silence is not approval.

> I have not approved this request, changed protected visual sources, or updated baselines. Work is stopped pending an owner decision.
