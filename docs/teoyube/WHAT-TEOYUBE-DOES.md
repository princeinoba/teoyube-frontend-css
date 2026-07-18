# What Teoyube Does

## In Simple Language

Teoyube is a local Scripture-centered reflection and calling companion. It helps a person move from a question or life situation to relevant Scripture, a carefully worded promise theme, prayer, reflection, and one practical next step. It offers guidance for consideration; it does not claim divine certainty or replace Scripture, prayer, wise counsel, pastoral care, or professional help.

## Normal Pages

- **Today:** creates a local daily journey with a Teoyube word, Scripture, promise theme, prayer, reflection, and action.
- **TeoyubeSearch:** searches local Scripture, words, promise clusters, and journey relationships. Results can be saved to Book or Promise Table.
- **Canon:** explores structured Scripture journeys and their related themes and paths.
- **Promise Table:** keeps user-selected promise rows and statuses. Teoyube never marks a promise fulfilled automatically.
- **Calling Compass:** asks guided questions and offers cautious, Scripture-anchored calling patterns and next steps.
- **Book of the Saint:** holds session-only saved reflections, Scripture references, promise rows, and published-video references.
- **Lexicon:** browses Teoyube words, meanings, related words, and Scripture sources.
- **Testimony:** lets the user record and review testimony in their own words.
- **Teo Guide:** produces a local, rule-based Scripture-grounded response, prayer frame, and action suggestion. It is not connected to live AI.
- **Embedded Videos:** browses the small approved local Scripture video collection. Users can search, filter, sort, play, inspect details, load more, and save a public-safe reference to Book.

## TIG Intelligence

The Teoyube Intelligence Graph (TIG) connects local words, Scripture references, promise clusters, calling themes, prayer patterns, and action steps. Its recommendations are deterministic and explainable. Confidence and fallback boundaries remain visible in the product flows. TIG does not fetch URLs, call a live model, contact users, or decide a person's calling.

## TeoyubeWorld Media

The normal app sees only the approved published pilot through Embedded Videos. The full source library, checksums, review states, derivative plans, and publication controls are owner concerns and are never exposed in normal navigation.

## Owner-Only Tools

`media-review.html` is the local owner Media Review workspace. It handles source inventory, metadata, Scripture confirmation, rights and safety review, duplicate and sequence decisions, approval gates, derivative authorization, validation, and publication authorization. These controls are separate from the user application.

## Local-Only Boundaries

User-created Book, Promise Table, reflection, testimony, and personalization preview state lives in the current browser session only. The static app has no database, analytics, service worker, live AI orchestration, automatic contact, or sensitive browser persistence.

The approved 12-video pilot is served locally from `public/media/teoyubeworld/pilot-v1`. The protected master media library is never publicly served.

## Not Yet Connected

- no hosted account system
- no cloud synchronization
- no external video service
- no live AI provider
- no database persistence
- no analytics
- no automatic publication or media processing

## Run The App

From the active workspace:

```powershell
npm start
```

Open the local URL printed by the server, normally `http://127.0.0.1:4173/`.

For the separate owner tool, open `http://127.0.0.1:4173/media-review.html`. The tool remains local and retains its owner gates.
