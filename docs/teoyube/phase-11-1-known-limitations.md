# Phase 11.1 Known Limitations

- `teoyube-app` is not present in this workspace, so Next.js routes and App Router API routes are not real current runtime surfaces.
- The root package has no `typecheck`, `lint`, `build`, or `test` scripts.
- No root TypeScript compiler dependency is available, so TypeScript smoke files are source-verified only.
- Prayer, Journal, Personalization, and TIG Graph are represented through existing static surfaces and smoke support, not as separate sidebar routes.
- The Promise Table still includes media-heavy UI sections, but external media lookup/playback is disabled and labeled as local preview.
- Export buttons are not uniformly implemented across every view; session data remains in memory.
- The app uses session memory only; refreshing the page resets generated entries.
- Some older historical docs still mention a previous Next app state. The Phase 11.1 docs now describe the current static app.

## Preserved Boundaries

- No external AI calls.
- No analytics.
- No accounts or payments.
- No database persistence.
- No public URL fetching.
- No hidden personalization.
- No raw private text storage requirement.
- No automatic testimony fulfillment.
- No divine-certainty claims.
