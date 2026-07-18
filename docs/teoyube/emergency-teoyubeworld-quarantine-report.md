# Emergency TeoyubeWorld Quarantine Report

## Normal App

The normal sidebar now contains only:

1. Today
2. TeoyubeSearch
3. Canon
4. Promise Table
5. Calling Compass
6. Book of the Saint
7. Lexicon
8. Testimony
9. Teo Guide
10. Embedded Videos

`TeoyubeWorld Media`, `Tables`, and `Roadmap` were removed from normal navigation. Roadmap and Teoyube Tables source sections remain available only to an explicit `?qa=1` route. Old `#media`, `#videos`, and `#embedded-videos` hashes resolve safely to the normal Embedded Videos view.

## Restored User Page

Embedded Videos uses the approved published runtime manifest and exposes only browse, search, category filter, sort, card, play, detail, load-more, empty-state, and safe Book-reference actions. Scripture remains visible. It exposes no source path, checksum, derivative, FFmpeg, approval, blocker, publication, or pilot lifecycle control.

## Preserved Owner Tool

The owner-only application remains at `media-review.html`. Its server routes, gate validation, review state, authorization artifacts, and publication history were not modified. It is not linked from the normal app.

## Quarantined Runtime Source

The normal app no longer loads:

- `teoyubeworld-media-experience.js`
- `teoyubeworld-media.css`
- `teoyubeworld-sequence-player.js`
- `teoyubeworld-playback-coordinator.js`

Those code files remain at the project root for rollback and owner review. `archive/teoyubeworld-runtime-page/README.md` records the quarantine; no media was copied into the archive.

The removed runtime page mixed a useful published-media loader with an advanced sequence player, cross-page recommendation surfaces, graph actions, diagnostics, smart collections, and technical lifecycle language. The useful approved loader and simple playback behavior were reused in Embedded Videos. The rest is preserved as inactive code pending a later owner decision.
