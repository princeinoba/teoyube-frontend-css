# Scripture retrieval acceptance

Prompt 15B is accepted only when these executable groups pass:

- `npm run recovery:scripture:verify`: registry assets, safe deterministic import, source/license evidence, 66/1,189/31,103 coverage, 356 references, exact owner content replay, non-visible quarantine, and hard-coded quotation boundary;
- parser/repository/performance tests: exact verses, ranges, cross-chapter ranges, chapters, context, lexical search, citation validation, 17 decisions, limits, cache, and no network;
- TIG and Prompt 13 tests: canonical anchor validation, unchanged ranking/graph/confidence, provenance, reversibility, and read-only safety;
- build and client-bundle guards: no corpus, lexical index, importer, source checksum, blocked KJV text, model, or server repository internals in browser chunks;
- content-delta visual replay: all affected static/Next routes and six viewports, including Promise expanded and fallback states, with full-text visibility and no clipping, ellipsis, horizontal overflow, overlap, CSS/DOM/class/asset change, or immutable baseline overwrite;
- full recovery, typecheck, lint, unit, build, fresh e2e, and route browser suites.

The security boundary uses fixed local paths, a 4 KiB API body limit, 200-character query limit, 50-result limit, 20-verse context-window limit, sanitized errors, no raw spiritual-query logging, and no network/model/database/persistence.
