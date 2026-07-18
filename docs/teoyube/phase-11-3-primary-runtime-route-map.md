# Phase 11.3 Primary Runtime Route Map

Primary runtime: static Node app.

| Static route/view | Primary surface | Data source |
| --- | --- | --- |
| `#today` | Daily Word and assignment | Local promise clusters, vocabulary, Scripture references |
| `#roadmap` | Implementation roadmap | Local project roadmap data |
| `#search` | TeoyubeSearch | Local vocabulary, promise clusters, Scripture anchors |
| `#canon` | Teoyube Canon | Local canon, journey, archetype, and Scripture data |
| `#table` | Promise Table | Local promise clusters and user-driven session actions |
| `#calling` | Calling Compass | Local calling profile, Scripture, and media preview records |
| `#book` | Book of the Saint | In-memory session entries |
| `#lexicon` | Lexicon | Local Teoyube vocabulary |
| `#testimony` | Testimony Archive | User-recorded session/test fixture entries |
| `#guide` | Teo Guide | Local rule-based response helper |
| `#ui-elements` | Embedded Videos | Local media preview records, source disconnected |
| `#teoyube-tables` | Tables | Local table data and filters |

Next migration routes were repaired under `src/app/**`, but they are not the primary runtime until dependencies and build tooling are approved and installed.
