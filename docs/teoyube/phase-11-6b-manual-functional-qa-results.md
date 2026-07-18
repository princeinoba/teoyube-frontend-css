# Phase 11.6B Manual Functional QA Results

## Execution Status
Manual browser QA was run against the local static app at `http://localhost:4173/index.html?qa=1` on July 11, 2026.

## Flows To Test
| Flow | Expected result | Result |
| --- | --- | --- |
| Today journey flow | Generate/start/complete/reflection/prayer/graph update visible state. | Pass. Generate, start, and complete render synced word, Scripture, promise, action, explanation path, and Book updates. |
| Promise search flow | Search returns scored local results; save/table/prayer/graph actions work. | Pass. Local scored results rendered; save-to-Book, add-to-Promise-Table, graph, and prayer-to-Guide were exercised. |
| Promise Table flow | Manual add, filter, sort, status, notes, detail, prayer/action, remove work. | Partial. Real rows from Today/Search supported detail, status/action/book/prayer paths; manual add button/form was hardened but did not activate through the in-app browser click path. |
| Calling Compass flow | Guided questions produce cautious result with Scripture/prayer/action. | Pass. Result language remained suggestive/counsel-aware and preserved Scripture/prayer/action. |
| Teo Guide flow | Prompt produces local structured response with save/prayer/reflection controls. | Pass. Local response context, save response, and save prayer controls were exercised. |
| Graph Explorer flow | Active graph opens from selected response; node/edge update rail. | Pass. Command palette opened graph with list fallback, relationship labels, Scripture, prayer/action nodes, and graph action controls. |
| Book/Journal save flow | Saved items appear and can be opened/removed. | Pass. Journal entry saved into Book/Journal memory with Scripture reference. |
| Testimony flow | Create, label, delete, filter, export access work. | Pass for create/list. A safe draft testimony was submitted and listed with existing label/delete controls visible. |
| Lexicon study flow | Select word, pray, save, add table, graph, complete study work. | Pass. Study mode selected a word, saved to Book, added table context, and saved a study session. |
| Command palette flow | Contextual commands run or show disabled reason. | Pass. Command palette opened, filtered graph commands, and executed the Phase 11.6B current graph command. |
| Mobile 390px flow | Major actions remain reachable. | Limited by tool. Browser viewport override requested 390px but the backend continued reporting 1280px; Today action controls remained visible. |

## Issues Found
- Phase 11.4 QA helper initially overlapped left navigation and then right-side action controls during `?qa=1` browser testing.
- Today completion rendered `Started` after complete because overlapping QA UI prevented the complete click; after layout fixes, the completed state rendered correctly.
- Scripture objects leaked as `[object Object]` in some rendered anchors before normalization.
- The in-app browser click path did not activate the manual Promise Table add form even after pointer/click/submit hardening; real Promise Table rows from Today/Search remained functional.
- The in-app browser viewport override did not report a 390px width in this session.

## Fixes Made
- Normalized rendered Scripture references through `phase116bScriptureReference()`.
- Reasserted Today completed state across active/generated/selected journey aliases.
- Repositioned and compacted the QA helper so it does not block live app controls.
- Added Promise Table local form, submit fallback, pointer/click capture fallback, and detail-context prayer handoff hardening.
- Updated `index.html` cache tokens so the running app loads the latest Phase 11.6B assets.
