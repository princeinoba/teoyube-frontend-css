# Phase 11.2 - Screenshot Page Functionality Map

## Today / Today's Promise Animation

| Area | Implementation |
| --- | --- |
| Route | `/` |
| Components | `TodayScreenshotPage`, `GenerateTodayJourneyButton`, `TIGResponsePanel`, `ReflectionPromptCard`, `BookActivityList`, `VideoCard` |
| Data source | `generateTodayJourney()`, local TIG production, canonical words/promises/scriptures, action/prayer seeds |
| Buttons | Start Today's Journey, View My Journey, Refresh Journey, Save Reflection, video Play fallback |
| Status | Implemented with local session state and safe media fallback |
| Limitation | Reflection state is component/session only; no persistence was added |

## Implementation Roadmap

| Area | Implementation |
| --- | --- |
| Route | `/roadmap` |
| Components | `RoadmapScreenshotPage`, route tiles, `RightInsightRail`, `GenerateTodayJourneyButton` |
| Data source | Phase 11.2 route map, button map, local seed counts |
| Buttons | Export, route card select, Generate Today's Journey |
| Status | Implemented |
| Limitation | Progress is a preview calculation, labeled as local route/button/seed map based |

## Teoyube Canon

| Area | Implementation |
| --- | --- |
| Route | `/canon` |
| Components | `CanonScreenshotPage`, `HeroSearchPanel`, `JourneyCard`, `RightInsightRail`, `ScriptureAnchorCard` |
| Data source | `searchTeoyubeCanon()`, journeys, words, Scriptures, promise clusters |
| Buttons | Search, quick intent chips, Open Journey, Open Full Journey, View Journey Map, Add to Promise Table |
| Status | Implemented |
| Limitation | Maturity percentages are local preview values until account/profile persistence exists |

## TeoyubeSearch

| Area | Implementation |
| --- | --- |
| Route | `/promise-search` |
| Components | `TeoyubeSearchScreenshotPage`, `HeroSearchPanel`, `PromiseResultCard`, `ConfidenceBadge`, `FallbackNotice`, `ExplanationPathPanel` |
| Data source | `runTeoyubeSearch()`, local TIG promise search, canon search |
| Buttons | Search Promise, quick chips, layout toggle, sort, Add to Promise Table, Explore Journey |
| Status | Implemented |
| Limitation | Added promise rows are local to the page session |

## Promise Table

| Area | Implementation |
| --- | --- |
| Route | `/promise-table` |
| Components | `PromiseTableScreenshotPage`, `PromiseTable`, `FilterBar` |
| Data source | `promiseClusters.json` through `createPromiseTableRows()` |
| Buttons | Add Promise, status update, Save, Remove, status chips |
| Status | Implemented |
| Limitation | Status updates and saved rows are session-only |

## Calling Compass / TeoyubeWorld Hub

| Area | Implementation |
| --- | --- |
| Routes | `/calling-compass`, `/compass` |
| Components | `CallingCompassScreenshotPage`, `TIGResponsePanel`, `TIGGraphExplorer`, `VideoCard` |
| Data source | `runCallingCompassPreview()`, local Calling Compass TIG surface, archetype data, words/promises/scriptures |
| Buttons | Start Compass, Save Calling Reflection, Start Journey, View Graph, Compass tab, TeoyubeWorld Videos tab |
| Status | Implemented and mismatch repaired |
| Limitation | Calling language is intentionally cautious and not determinative |

## Book of the Saint

| Area | Implementation |
| --- | --- |
| Route | `/book` |
| Components | `BookOfTheSaintScreenshotPage`, `JournalEntryForm`, `BookActivityList`, `RightInsightRail` |
| Data source | Local/session book entry helpers |
| Buttons | Add Reflection, filters, entry select, Export Journal |
| Status | Implemented |
| Limitation | Streak is preview-labeled because persistence was not added |

## Lexicon

| Area | Implementation |
| --- | --- |
| Route | `/lexicon` |
| Components | `LexiconScreenshotPage`, `WordCard`, `WordDetailDrawer`, `PaginationControls` |
| Data source | `getAllWords()` from canonical vocabulary and Scripture canon |
| Buttons | Search, category filter, pagination, word card open, Pray Framework, Add to Book, View Graph |
| Status | Implemented |
| Limitation | Pray/Add/View controls navigate or preview locally; no persistence added |

## Testimony Archive

| Area | Implementation |
| --- | --- |
| Route | `/testimony` |
| Components | `TestimonyArchiveScreenshotPage`, `TestimonyForm`, `TestimonyList`, `DisabledFeatureNotice` |
| Data source | Local/session testimony records |
| Buttons | Save Testimony, disabled media buttons, Delete, Export Archive |
| Status | Implemented |
| Limitation | Media upload and sharing are disabled; testimony is user-recorded only |

## Teo Guide

| Area | Implementation |
| --- | --- |
| Route | `/teo-guide` |
| API | `POST /api/teoyube/teo-guide` |
| Components | `TeoGuideScreenshotPage`, `TeoGuideChat`, `TIGResponsePanel`, `SafetyNotice` |
| Data source | `createTeoGuideResponse()`, local TIG companion surface |
| Buttons | Suggested prompts, Ask |
| Status | Implemented |
| Limitation | Live AI is not connected; this is local Scripture-grounded preview guidance |

## Embedded Videos

| Area | Implementation |
| --- | --- |
| Route | `/embedded-videos` |
| Components | `EmbeddedVideosScreenshotPage`, `VideoCard`, `VideoModal`, `FilterBar`, `PaginationControls` |
| Data source | Local TeoyubeWorld media library through `searchMedia()` |
| Buttons | Category tabs, search, sort, Refresh TeoyubeWorld, Play, pagination |
| Status | Implemented |
| Limitation | External embeds are not connected; Play opens a source-not-connected modal |

## Global Sidebar and Header

| Area | Implementation |
| --- | --- |
| Components | `SidebarNav`, `TopActionBar`, `GuardrailsModal`, `GenerateTodayJourneyButton` |
| Data source | Phase 11.2 route map, guardrails content, `generateTodayJourney()` |
| Buttons | Navigation, Purpose Assessment, Guardrails, Generate Today's Journey, Settings |
| Status | Implemented |
| Limitation | Mobile drawer is CSS/React state only; full manual mobile QA remains for Phase 11.3 |

