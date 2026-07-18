# Phase 11.1 Button Behavior Map

All current app behavior is local-only and session-scoped. Buttons either update in-memory state, switch hash views, filter local data, add entries to session arrays, or show a clear source-disabled state.

| Button or surface | View/component | Handler | Data/state changed | Success state | Disabled/error state | Implemented |
| --- | --- | --- | --- | --- | --- | --- |
| Sidebar nav | Global | `setView(view)` | Active view/hash | View changes and nav highlights | Unknown view returns Today | Yes |
| Guardrails | Global top bar | `guardrailDialog.showModal()` | None | Safety modal opens | Close button dismisses | Yes |
| Generate Today's Journey | Global top bar | `generateJourney()` | `state.generatedWord`, `state.book`, `state.calling` | Today panels refresh | Safe fallback cluster | Yes |
| Purpose Assessment | Sidebar profile | `assessmentDialog.showModal()` | Form values hydrate | Assessment opens | Cancel closes | Yes |
| Generate Profile | Assessment | `saveAssessment()` | `state.profile`, `state.calling`, `state.book` | Profile/journey generated | Required fields can remain preview | Yes |
| Complete Assignment | Today | `completeAssignment()` | `state.completedAssignments`, `state.book` | Reflection saved to Book | Empty reflection saves completion note | Yes |
| Add Manual Entry | Today/Book | `addManualEntry()` | `state.book` | Reflection added | Prompt cancel does nothing | Yes |
| TeoyubeWorld search | Today media | `searchPromiseMovie()` | Local media arrays/status | Local previews filtered | Source-disabled notice | Yes |
| Featured story carousel | Today | `goToFeaturedStory()` | Selected media index | Carousel/card updates | Bounds wrap safely | Yes |
| Promise Search | Search | `runSearch()` | Results dataset/rendered cards | Scripture/promise/word cards appear | Empty state/suggestions | Yes |
| Save to Book | Search result | `saveSearchResultToBook()` | `state.book` | Book entry added | Missing result ignored | Yes |
| Add to Promise Table | Search result | `addSearchResultToPromiseTable()` | `state.generatedWord`, `state.book`, view | Switches to Promise Table | Missing result ignored | Yes |
| Explore Journey | Search result | `setView("guide")` with prompt | Chat prompt/result | Guide response appears | Missing result ignored | Yes |
| Canon tabs/cards/pages | Canon | Canon event handlers | Active category/page/selection | Detail rail updates | Disabled page buttons at bounds | Yes |
| Promise Table search | Promise Table | `renderPromiseTableSearchFeed()` | Query/filter render | Results update | Empty row appears | Yes |
| Promise media play | Promise Table | `showLocalMediaNotice()` | Status only | Source-not-connected notice | External embed disabled | Yes |
| Calling search/chips | Calling | `searchCompassVideos()` | Local media/status | Compass media previews update | Local fallback message | Yes |
| Calling video play | Calling | `showLocalMediaNotice()` | Status only | Source-not-connected notice | External embed disabled | Yes |
| Book filters/search | Book | `renderBook()` | Filtered timeline | Timeline updates | Empty state | Yes |
| Lexicon search/filter/tabs | Lexicon | `renderLexicon()` | Query/category/speech/letter | Grid and detail update | Empty grid/fallback featured word | Yes |
| Save Lexicon word | Lexicon | `state.book` update via existing action affordance | Book/session | View/action feedback | Preview-only where no persistence | Partial |
| Save Testimony | Testimony | `addTestimony()` | `state.testimonies`, `state.book` | Testimony and Book entry added | Missing title/body prevents save | Yes |
| Testimony tabs | Testimony | `renderTestimonies()` | Active filter | List filters | Empty state | Yes |
| Export Archive | Testimony | UI affordance | None yet | Visible quick action | Export flow pending | Disabled/pending |
| Teo Guide prompts | Guide | Prompt button listener | Chat input/result | Local response appears | No live AI call | Yes |
| Ask | Guide | `askTeo()` | `state.chat` | User and Teo messages render | Empty input ignored | Yes |
| Embedded video filters | Embedded Videos | `renderUiElementsVideos()` | Category/sort/query/count | Grid updates | Empty state | Yes |
| Refresh TeoyubeWorld | Embedded Videos | `loadUiElementsYoutubeFeed()` | Local preview records | Local preview refreshed | No external fetch | Yes |
| Load More Videos | Embedded Videos | `uiVideoVisibleCount += 4` | Visible count | More cards render | Hidden when exhausted | Yes |
| Table row expand | Tables | `expandedTeoyubeTableRows` | Row expansion state | Detail row appears | Safe if no media | Yes |
| Table pagination/filter/sort | Tables | `renderTeoyubeTablesPage()` | Query/category/sort/page | Table updates | Empty row | Yes |

## Safety Notes

- Testimony remains user-recorded only.
- Media play buttons do not fetch external sources.
- Teo Guide is local rule/data guidance, not live AI.
- The app does not require browser persistence for sensitive personalization.
