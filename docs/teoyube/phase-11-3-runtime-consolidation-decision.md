# Phase 11.3 Runtime Consolidation Decision

Current major milestone: TEOYUBE Phase 11 - Advanced Real App Productization, Runtime Consolidation, State-of-the-Art Functionality & Build-Ready App Architecture.

Decision: keep the static Node prototype as the primary runtime for Phase 11.3 and repair the Next.js App Router source as a migration layer.

Reason:

- The working app already runs through `server.js`, `index.html`, `app.js`, and `styles.css`.
- The workspace does not include installed Next/React dependencies, and Phase 11.3 must not break the working prototype.
- The App Router source had missing aliases, components, and local modules that prevented reliable migration work.

Primary runtime:

- `npm start`
- `npm run dev`
- `npm run prototype:start`

Migration layer:

- `src/app/**`
- `src/components/productization/**`
- `src/components/tig/**`
- `src/components/public/**`
- `tsconfig.json`
- `next.config.mjs`

Safety boundary:

- No external services were connected.
- No analytics, database persistence, accounts, payments, automatic contact, live AI orchestration, service workers, or browser persistence for sensitive personalization were added.
- Scripture anchors, explanation paths, confidence labels, fallback visibility, consent, and privacy copy remain visible.
