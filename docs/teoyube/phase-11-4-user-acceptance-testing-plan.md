# Phase 11.4 User Acceptance Testing Plan

Current major milestone: TEOYUBE Phase 11 - Advanced Real App Productization, Functional UX Hardening, Mobile QA & Beta-Ready Polish.

Current step: Phase 11.4 - End-to-End User Acceptance Testing, Mobile QA, Accessibility Hardening & Beta-Ready Functional Polish.

Primary runtime: repository-root static Node app at `http://localhost:4173`.

## Global Acceptance Rules

- No external services, live AI, analytics, database persistence, service workers, accounts, payments, subscriptions, or automatic user contact.
- Scripture anchors, explanation paths, confidence/fallback notices, guardrails, consent boundaries, and cautious calling language must remain visible.
- User-entered reflection, prayer, testimony, and chat text stays session-only in the static app and is excluded from safe export content.
- All actions should give visible feedback through the save drawer, right rail, local status text, or QA helper panel.

## Page Checklist

| Surface | Expected sections | Expected controls | Local state change | Success feedback | Empty/fallback | Mobile/accessibility |
| --- | --- | --- | --- | --- | --- | --- |
| Today | carousel, daily word, Scripture strip, assignment, featured stories, feed | Generate, Pray Framework, Complete Assignment, carousel nav, search | generated journey, selected word, selected Scripture, Book entry | save drawer and right rail update | local media fallback notice | hero stacks, controls tappable, carousel keyboard arrows |
| Roadmap | KPI cards, phases, architecture panels | Back, Export, detail CTAs, Generate | route/action count only | export dialog or save drawer | preview-only notice for nonlocal details | cards stack, no overflow |
| TeoyubeSearch | hero search, chips, results, explanation path | Search Promise, Add to Promise Table, Save to Book, Explore Journey | selected word, promise row, Book entry | drawer, route to table or guide | smart empty state with Scripture anchor | cards stack, controls remain readable |
| Canon | hero search, KPI cards, featured journeys, recent cards, sidebar | search/chips, carousel controls, Open Full Journey, Add to Promise Table | selected journey preview | save drawer/right rail | fallback keeps Scripture anchor | detail rail collapses below desktop |
| Promise Table | saved local rows, status controls, media feed secondary | status select, save to Book, remove, export, search | savedPromiseTableItems, Book entry | drawer and table refresh | empty rows suggest generate/search | table scrolls horizontally |
| Calling Compass | search, assistant card, compass visual, videos, progress | search, chips, Ask Assistant, View Full Compass, Prayer Guide | selected media/calling preview | local media fallback or guide focus | source-not-connected notice | right rail stacks |
| Book of the Saint | hero, filters, timeline, right rail | Add Reflection, filters, export, pagination | Book/journal counts | drawer and filtered timeline | smart empty state | timeline remains readable |
| Lexicon | search, filters, word grid, overview rail, tools | search, filters, word cards, Read Reflection, tools | selected route/filter only | drawer for tool previews | filter empty state | large grid stacks/scrolls |
| Testimony | form, local archive, milestones, impact, quick actions | save, filters, write/export/media buttons | testimony draft and Book entry | drawer | media-disabled fallback | form labels visible |
| Teo Guide | local chat, prompts, input, safety note | prompt chips, Ask, attach/mic fallbacks, clear-style actions | chat messages | response and drawer | cautious local response | chat panel fits height |
| Embedded Videos | category tabs, filters, stats, search, cards | tabs, filters, search, play fallback, load more | video filter state | source-not-connected notice | local preview limit | grid stacks |
| Tables/UI Elements | table search/filter/sort/page, previews | filters, pagination, row expand, video fallback | expanded rows, filters | status text | no external media | table scrolls |
| Guardrails | modal with boundaries | open, close, Escape | none | focus restored | none | dialog fits screen |
| Command palette | action search | Ctrl/Cmd+K, arrows, Enter, Escape | action count, route/action | route/drawer updates | none | modal fits mobile |
| Right rail | active context, counts, safety, session summary | collapse/expand, Journey, Export | rail state only | visible summary | none | collapses near bottom |
| Save drawer | saved action details | View in Book, Add Reflection, Undo Save, Close | optional undo | drawer message | undo unavailable notice | stays within viewport |
| Safe export center | JSON/Markdown preview | format switch, close, Escape | no persisted export | sanitized preview | none | scrollable dialog |
| Purpose Assessment | dialog form | open, cancel, Generate Profile | session profile and journey | drawer and generated journey | cautious calling language | dialog scrolls |
| Generate Today's Journey | global action | topbar and command palette | word, Scripture, promise, prayer/action, Book | drawer/right rail | local fallback if data incomplete | works from every page |

## QA Helper

Open with Ctrl/Cmd+Shift+Q or `?qa=1` on localhost. The helper shows route, selected word, selected promise, selected journey, counts, personalization mode, panel status, last action, last error, last fallback, local-only status, and external services disabled.
