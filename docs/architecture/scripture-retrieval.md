# Scripture retrieval architecture

## Current decision

The canonical capability is the server-owned `ScriptureRepository` contract in `src/domain/scripture/scripture-repository.ts`, implemented by `src/server/scripture/canonical-scripture-repository.ts`. The previous feature-level repository file is a compatibility export only.

The repository is intentionally operating in **reference-only blocked-readiness mode**. The workspace does not contain a complete local Scripture corpus with recorded source version and owner-approved display rights. It therefore returns normalized reference metadata and deterministic reference search, but it returns no verse text or context.

## Authority boundaries

The types keep these categories separate:

1. `ScripturePassage` and `ScriptureVerse` are reserved for exact corpus text with translation, source, version, checksum, display policy, and validation status.
2. `ScriptureContext` records its boundary source and limitations.
3. Promise principles, TIG explanations, calling connections, and Teoyube summaries remain interpretation, not corpus text.
4. Personalized actions remain application and may not change Scripture wording.
5. User reflections are never inputs to the corpus or lexical reference index.

## Runtime flow

```text
server feature/application service
  -> client-safe Scripture DTO/contract
  -> canonical ScriptureRepository
  -> fixed corpus registry
  -> approved local corpus/index assets only
```

The registry fixes source paths at build time. Request data cannot select a file. The implementation makes no network call, imports no model provider, and does not load the blocked KJV excerpt seed.

## Deterministic parsing and search

The parser owns a 66-book Protestant inventory, chapter counts, approved aliases, numbered-book handling, and canonical labels. It refuses ambiguous abbreviations. Cross-chapter syntax can be parsed only when an explicit corpus capability says it is supported; the current repository does not.

Reference search normalizes case and punctuation, performs exact phrase and token matching, ranks exact labels first, and uses canonical-label order as a stable tie-break. The cache key contains corpus version, translation identifier, result limit, and normalized query. The cache stores no prayers, reflections, journey context, or corpus text.

Local reference-only budgets are: combined server module/corpus load under 5,000 ms (including concurrent verifier contention), index construction under 250 ms, exact-reference and context fallback p95 under 25 ms, lexical cache-miss p95 under 100 ms, and cache-hit p95 under 25 ms. The acceptance test prints measured p50/p95 values; correctness is never weakened to satisfy these budgets.

## Context policy

No source-defined passage, paragraph, or verse-bound metadata exists locally. `getContext` therefore returns `null`; it does not invent a pericope. An approved corpus may later enable source-defined boundaries. Without such metadata, the only permissible fallback is an explicitly labeled chapter window or chapter context.

## Blocked work

Exact retrieval, positive verse-bound validation, exact quotation comparison, excerpts, context, TIG citation promotion to `validated`, and product integration are blocked until the owner supplies or approves a complete local corpus and its licensing/display record. Existing user-visible behavior remains unchanged rather than being silently rewritten.
