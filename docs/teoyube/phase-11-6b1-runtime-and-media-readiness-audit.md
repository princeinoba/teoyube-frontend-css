# Phase 11.6B.1 Runtime and Media Readiness Audit

## Runtime

The primary app remains `index.html` + `styles.css` + `app.js` on `server.js` at port 4173. `phase116b1.js` is a classic script loaded after `app.js`; it reuses the existing global state and render helpers without moving the app to the Next migration layer.

The major state areas are profile/calling, active Scripture/word/promise/journey/TIG context, Book/Journal/Testimony, Promise Table, consent/personalization, graph/workflow, QA, and Phase 11.6B.1 action history, collections, continuation, search, responsive width, and zero-media records.

## Event and risk audit

The manual Promise form previously had per-render click and pointer listeners plus document capture listeners for pointer, click, and submit. A pointer-triggered render could detach the click target; other paths could dispatch twice. Phase 11.6B.1 removes that listener cluster and uses one native dialog form plus one delegated submit listener.

High-risk areas intentionally left structurally intact: the 12,000-line `app.js` render pipeline, hash routing, existing TIG/graph helpers, consent and personalization boundaries, safe export, fallback/confidence language, Scripture data adapters, and the Next migration layer.

## Media state

Existing TeoyubeWorld cards are local source-not-connected previews, not imported ZIP records. Phase 11.6B.1 adds only a sample schema, read-only scanner, validator, filename parser, surface-ranking rules, and an honest QA panel with actual media count zero.

Reusable Phase 11.6C foundations: `parseScriptureMediaFilename`, scanner draft records, manifest validation report, `rankMediaForCurrentContext`, universal index media adapter, Media Readiness panel, and Responsive QA Lab.

## Completed

Unified actions, Promise dialog reliability, session undo/history, Smart Collections, continuation, universal search, zero-media readiness, responsive constrained previews, listener caps/debouncing, object URL revocation, generated-output exclusion, smoke coverage, and browser QA were added without external services or persistence.
