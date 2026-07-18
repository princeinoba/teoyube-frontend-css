# Phase 11.2 - Button Action Map

All Phase 11.2 actions are local-only. They either mutate React/session state, call local `/api/teoyube/*` routes, navigate within the app, export local JSON, or show a clear disabled/source-not-connected state.

| Button | Page | Handler | Expected behavior | Data source | Implemented | Disabled/fallback |
| --- | --- | --- | --- | --- | --- | --- |
| Guardrails | Global top bar | `openGuardrailsModal` | Opens guardrails modal | `getGuardrailsContent()` | Yes | Modal lists safety boundaries |
| Generate Today's Journey | Global top bar | `generateTodayJourney` | Generates local daily journey | canonical data + TIG | Yes | Inline local status |
| Settings | Global top bar | route push | Opens `/settings` | route map | Yes | None |
| Purpose Assessment | Sidebar | `next/link` | Opens Calling Compass | route map | Yes | None |
| Start Today's Journey | Today | `setStarted(true)` | Selects generated journey in session | `generateTodayJourney()` | Yes | Local state only |
| View My Journey | Today | `next/link` | Navigates to `/journey` | route map | Yes | None |
| Refresh Journey | Today | `generateTodayJourney()` | Regenerates local daily journey | local data | Yes | Inline status |
| Save Reflection | Today/Book | `setBookEntries` | Adds reflection to session book | component state | Yes | No persistence |
| Video Play | Today/Embedded Videos | `setSelected(video)` | Opens video modal | local media | Yes | Source-not-connected modal |
| Export | Roadmap/Book/Testimony | `downloadJson` | Exports safe local JSON | route/book/testimony state | Yes | Browser-only download |
| Route cards | Roadmap | `setExpanded` | Selects route detail | route map | Yes | None |
| Canon Search | Canon | `searchTeoyubeCanon` | Filters canon/word/journey data | canonical data | Yes | Empty state if no results |
| Canon quick chips | Canon | `setQuery` | Runs quick intent search | canonical data | Yes | None |
| Open Journey | Canon | `setSelected` | Updates right rail detail | local journey data | Yes | None |
| Open Full Journey | Canon | `next/link` | Opens `/journey` | route map | Yes | Existing journey route |
| View Journey Map | Canon/Compass | `next/link` | Opens `/graph` | route map | Yes | Existing graph route |
| Add to Promise Table | Canon/Search | route link or local add | Adds local promise row or navigates | promise clusters | Yes | Session only |
| Search Promise | TeoyubeSearch | `runTeoyubeSearch` | Runs local TIG/canon search | local TIG + canonical data | Yes | Guided empty state |
| Layout toggle | TeoyubeSearch | `setLayout` | Switches grid/list | component state | Yes | None |
| Sort | TeoyubeSearch | `setSort` | Reorders results | component state | Yes | Stable default relevance |
| Explore Journey | TeoyubeSearch | `setQuery` | Refocuses search by cluster theme | result data | Yes | None |
| Add Promise | Promise Table | `createPromiseTableRowFromSearch` | Adds local row | local search + clusters | Yes | Session only |
| Status chips | Promise Table | `setStatus` | Filters table | component state | Yes | All state fallback |
| Status select | Promise Table | `onStatus` | Updates row status | component state | Yes | Does not auto-testify |
| Save | Promise Table | `onSave` | Shows saved-to-Book preview status | component state | Yes | Session only |
| Remove | Promise Table | `onRemove` | Removes row locally | component state | Yes | None |
| Start Compass | Calling Compass | `runCallingCompassPreview` | Runs local cautious calling result | local TIG | Yes | Cautious fallback |
| Compass tab | Calling Compass | `setTab("compass")` | Shows compass flow | component state | Yes | None |
| TeoyubeWorld Videos tab | Calling Compass | `setTab("videos")` | Shows media tab | local media | Yes | Source-not-connected play fallback |
| Save Calling Reflection | Calling Compass | `setSaved(true)` | Records local save status | component state | Yes | Session only |
| Start Journey | Calling Compass | `next/link` | Opens `/journey` | route map | Yes | None |
| Book filters | Book | `setQuery`, `setType` | Filters entries | session entries | Yes | Empty list if no match |
| Entry click | Book | `setSelected` | Updates right rail | session entries | Yes | None |
| Export Journal | Book | `downloadJson` | Exports local entries | session entries | Yes | Browser-only |
| Lexicon search/filter | Lexicon | `getAllWords` filter | Filters word grid | canonical vocabulary | Yes | Empty page via filter |
| Pagination | Lexicon/Embedded Videos | `setPage` | Moves page | component state | Yes | Disabled at bounds |
| Word card | Lexicon | `setSelected` | Opens detail drawer | word data | Yes | Drawer fallback Scripture if missing |
| Pray Framework | Lexicon drawer | visible local control | Shows local control state | word data | Yes | Preview action only |
| Add to Book | Lexicon drawer | `next/link` | Opens `/book` | route map | Yes | Session book route |
| View Graph | Lexicon drawer | `next/link` | Opens `/graph` | route map | Yes | Existing graph route |
| Testimony media buttons | Testimony | disabled | Shows disabled feature | none | Yes | Explicit media upload disabled |
| Save Testimony | Testimony | `setRecords` | Adds user-recorded testimony | component state | Yes | User-recorded only |
| Delete Testimony | Testimony | `setRecords` | Deletes local record | component state | Yes | Session only |
| Export Archive | Testimony | `downloadJson` | Exports local records | component state | Yes | Browser-only |
| Suggested prompt | Teo Guide | `ask(suggestion)` | Runs local Teo Guide response | `/api/teoyube/teo-guide` | Yes | Local fallback if fetch fails |
| Ask | Teo Guide | `fetch("/api/teoyube/teo-guide")` | Adds user and guide messages | local API/TIG | Yes | Falls back to local function |
| Embedded category tabs | Embedded Videos | `setCategory` | Filters media | local media | Yes | None |
| Refresh TeoyubeWorld | Embedded Videos | `setQuery("")` | Refreshes local preview | local media | Yes | No external fetch |
| Consent segmented controls | Personalization/Settings | `setMode` | Changes preview mode | component state | Yes | No hidden persistence |
| Feedback buttons | Personalization/Settings | `setStatus("saved")` | Records local feedback status | component state | Yes | Session only |

## Safety Notes

- Testimony status must be changed by the user; Teoyube never automatically marks a promise fulfilled or testified.
- Video playback shows a source-not-connected state until reviewed sources are provided.
- Teo Guide is a local Scripture-grounded guide, not live AI.
- Personalization controls are visible and do not store raw private text or hidden profile data.

