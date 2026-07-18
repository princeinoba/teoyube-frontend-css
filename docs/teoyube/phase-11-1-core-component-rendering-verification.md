# Phase 11.1 - Core Component Rendering Verification

## Corrected Component Boundary

The runnable product surface is the static app in `index.html`, `app.js`, and `styles.css`. Previous notes that referenced `teoyube-app/components/**` are historical and do not describe this workspace state.

## Static Surfaces Verified

| Surface | Source | Data / behavior | Status |
| --- | --- | --- | --- |
| Sidebar shell | `index.html`, `app.js`, `styles.css` | Static hash navigation and active route state | Repaired |
| Today / Daily Word | `app.js`, `src/data/**` | Daily word, Scripture badges, assignment, local media | Runtime reachable |
| Promise Search | `app.js`, `src/data/promiseClusters.json` | Local promise cards, Scripture anchors, journey buttons | Runtime reachable |
| Promise Table | `app.js`, local data helpers | Promise rows and featured promise context | Runtime reachable |
| Calling Compass | `app.js`, local preview records | Cautious calling copy, local media notice, action/prayer prompts | Runtime reachable |
| Teo Guide | `app.js` | Local Scripture-grounded guidance preview and safe fallback copy | Runtime reachable |
| Book / Journal-style activity | `app.js` | Session-style examples, filters, export/clear-style actions | Runtime reachable |
| TIG / graph-style explanation | `app.js`, `src/lib/teoyube/**` support files | Explanation copy, confidence/fallback/safety language, graph/list fallback in support checks | Source-supported |

## Rendering Safeguards

- Missing or disconnected media now shows local source-status copy instead of attempting external embeds.
- In-memory/session-only state avoids sensitive browser persistence by default.
- Scripture, confidence, fallback, and safety labels remain visible in the current product flow.

## Remaining Warning

There is no installed browser automation or TypeScript build tool in this workspace, so verification used source inspection, Node syntax checks, and HTTP reachability.
