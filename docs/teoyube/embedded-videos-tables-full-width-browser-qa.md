# Embedded Videos, Tables, and Full-Width Browser QA

## Runtime and scope

- Runtime: static Node application at `http://127.0.0.1:4173`
- Browser surface: in-app browser
- Wide desktop viewport: 1920 x 1080
- Responsive viewports: 1024 x 900, 768 x 900, 430 x 900, and 390 x 844
- Protected source media, owner approval artifacts, derivative artifacts, and publication artifacts were not changed.

## Full-width application results

At 1920px the sidebar measured 240px, the main application region measured 1645px, and normal page content measured 1592-1605px. No tested normal route produced document-level horizontal overflow.

| Route | Active title | Content width | Horizontal overflow |
| --- | --- | ---: | --- |
| Today | Today's Promise Animation | 1592px | No |
| TeoyubeSearch | TeoyubeSearch | 1605px | No |
| Canon | Teoyube Canon | 1595px | No |
| Promise Table | Promise Table | 1605px | No |
| Calling Compass | Calling Compass | 1605px | No |
| Book of the Saint | Book of the Saint | 1605px | No |
| Lexicon | Teoyube Lexicon | 1605px | No |
| Testimony | Testimony Archive | 1605px | No |
| Teo Guide | Teo Guide | 1605px | No |
| Embedded Videos | Embedded Videos | 1605px | No |
| Tables | Tables | 1605px | No |

Direct navigation to `#teoyube-tables` opened Tables at scroll position zero. View changes update the title and reset prior page scroll instead of carrying a clipped position into the next page.

## Embedded Videos results

### Structure and original source

- The page exposes exactly seven contained tabs: All Videos, Teachings, Worship, Messages, Documentaries, Shorts, and TeoyubeWorld Media.
- The original local library contains 8 records. All Videos initially renders 4 and Load More expands the grid to all 8.
- Original category results observed: Teachings 3, Worship 1, Messages 2, Documentaries 1, and Shorts 1.
- Original preview records are labeled `Original local preview` and do not claim live analytics or connected playback.
- Filters focuses the filter controls; category selection, text search, and sort selection update the shared grid.
- Wide desktop uses two 772px card columns. Each closed card measures about 349px high, with a compact 270px `21:7.35` media stage and a 78px summary row.
- Multi-record results expose visible Previous and Next controls on every panel. All Videos reports `1 / 8` through `4 / 8` initially; Next changes the selected panel and Previous restores it.
- Foreground artwork uses `object-fit: contain` over a softened cover backdrop. Text and composition baked into the source artwork remain visible instead of being cropped to the card frame.
- Worship, Documentaries, and Shorts each currently contain one original record, so those tabs correctly omit inactive carousel controls.

### TeoyubeWorld Media containment

- The contained TeoyubeWorld Media tab loaded exactly 12 runtime-approved Galatians records from the public runtime manifest and presents four bounded carousel panels rather than twelve oversized cards at once.
- The first approved panel reported `1 / 12`; Next advanced to Segment 02 and Previous returned to Segment 01.
- Search for `Galatians 1:2` returned the two matching sequence records.
- Scripture sorting preserved sequence-aware records and Scripture labels.
- Approved playback created a real local `<video controls>` element using the public pilot URL.
- Details opened in the shared card, Save to Book created a normal Book entry, and Open Scripture routed to TeoyubeSearch with the selected reference.
- No owner approval controls, checksums, source paths, FFmpeg controls, derivative data, or publication lifecycle data appeared.
- Returning to any original tab restored the original source; pilot records did not leak into the original categories.

## Tables results

### UI Table Demonstrations

- Normal sidebar navigation and direct `#teoyube-tables` routing work.
- The original searchable, sortable, expandable, paginated table presentation is retained.
- Sorting changed the first rendered record as expected.
- Page 2 reported `Showing 11 to 20 of 24 entries` for the current local demonstration data.
- A non-matching search produced the scoped empty state and `Showing 0 to 0 of 0 entries`.
- Row selection toggled the checkbox and selected-row presentation.
- The contained action menu exposed View details, Save to Book, and category filtering.
- Save to Book produced a `Table Demonstration` Book entry.
- The action filter selected the row category and reduced the observed result to 10 matching Promise rows.

### Teoyube Data Management

| View | Observed local records | Result |
| --- | ---: | --- |
| Promises | 12 | Search, sort, status, open, and Book actions rendered |
| Scriptures | 324 | Flattened canon references rendered with open/save actions |
| Journeys | 3 | Local active/generated journey state rendered with continue/save actions |
| Videos - Original | 8 | Original library adapter and normal video actions rendered |
| Videos - Approved | 12 | Approved manifest adapter rendered without source paths |
| Saved Book Entries | Session-dependent | Current Book records rendered with open/remove actions |

Selecting Details on an approved video row returned to Embedded Videos, selected TeoyubeWorld Media, filtered to that record, and opened its detail region. On narrow screens the management table scrolls inside `.data-table-scroll`; it does not widen the document.

## Responsive results

| Viewport | Sidebar behavior | Embedded grid | Document overflow | Tables behavior |
| --- | --- | --- | --- | --- |
| 1024px | Visible, 224px desktop sidebar | 2 columns, about 328px each | No | Internal table scrolling available |
| 768px | Off-canvas drawer; Menu visible | 1 column, about 689px | No | Internal horizontal scrolling |
| 430px | Off-canvas drawer; Menu visible | 1 column, about 368px | No | Internal horizontal scrolling |
| 390px | Off-canvas drawer; Menu visible | 1 column, about 328px; 271px closed card | No | Internal horizontal scrolling |

At 390px the Menu control opened the drawer, set `aria-expanded="true"`, showed the backdrop, and moved the sidebar on-screen. Clicking the backdrop closed the drawer, restored `aria-expanded="false"`, and moved the sidebar off-screen. No document-level horizontal overflow was observed.

The mobile media stage uses a stable `16:9` frame with the same contained foreground fit; the measured 328px card used a 183px poster and retained both carousel arrows without widening the document.

## Roadmap result

- Normal `#roadmap` navigation resolves to Today and no normal Roadmap sidebar item exists.
- `?qa=1#roadmap` still opens the preserved Implementation Roadmap source.
- Classification remains B: owner/developer-only.

## Console and limitations

A fresh browser tab completed the table save and Book verification with zero application errors. The in-app browser logged its known `MutationObserver.observe` instrumentation message; repository search found no matching observer in the normal application, and the existing Phase 11.6C browser recorder already identifies this as browser-instrumentation noise.

Original library entries without a connected local stream remain honest preview records. Approved TeoyubeWorld records use real local published media. No external service, analytics, upload, persistence service, or protected source-media path is required.

## Automated checks

- `npm run recovery:videos-tables:smoke`: passed all focused recovery, route, source-separation, Tables, documentation, and exact published-pilot checks.
- `npm run check:imports`: passed across 1,376 checked files with zero missing imports.
- `npm run check:runtime`: passed with HTTP 200 from the existing static Node server.
- `node --check app.js`: passed.
- `npm run build`: unavailable because this static application has no build script.
- `npm run emergency:recovery:smoke`: all interface and public-pilot checks passed, but its protected-source metadata check could not pass because the protected source tree is not present in this workspace.
- `npm run phase116c3:smoke`: the immutable 12-record/49-file public pilot passed the focused recovery checksum baseline, but the older smoke stopped at its current protected-source baseline for the same unavailable source-tree condition. No approval, derivative, publication, or public media artifact was changed to bypass that gate.
