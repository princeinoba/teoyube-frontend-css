# Phase 11.6B.1 Performance and Listener Hardening Report

- Removed Promise Table listeners created on every render and the competing pointer/click capture handlers.
- Added one guarded Phase 11.6B.1 initialization and one delegated click/submit/input/change/keydown set.
- Debounced universal search and rebuilds its index only when marked dirty.
- Capped action history at 40, undo at 30, Promise rows at existing limits, and collections at 100 references.
- Reuses existing render panels and updates content in place.
- Revokes collection export object URLs immediately after download dispatch.
- The responsive iframe is local, non-recursive, and reused within its dialog.
- Existing reduced-motion CSS and static runtime routing remain intact.

The large `app.js` was not split or migrated. New behavior lives in a safely loaded classic runtime module to reduce refactor risk.
