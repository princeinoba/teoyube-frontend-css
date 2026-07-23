# Hybrid retrieval

Teoyube retrieval remains authority-first:

1. Parse and retrieve exact references from the canonical WEB repository.
2. Run deterministic lexical retrieval.
3. Add vector similarity only when the server kill switches, purpose consent, safety mode, budget, and active index permit it.
4. Apply partition, trust, ownership, consent, expiry, and deletion filters.
5. Add deterministic TIG graph evidence.
6. Fuse the signals deterministically, diversify by document, validate sources, and assemble a bounded context.

Vector similarity is a ranking signal, not spiritual authority. Exact Scripture never depends on an embedding. Displayed Scripture is re-fetched from the canonical repository after ranking.

`HybridRetriever` is provider-neutral. `HybridRetrievalService` depends on `EmbeddingGateway`, `VectorRepository`, `ScriptureRepository`, and `TigService`; it does not mutate journey, prayer, journal, testimony, calling, promise, Book, or memory state.

When vectors are disabled, unavailable, unsafe, over budget, or unauthorized, exact + lexical + TIG remains complete and deterministic. `TEOYUBE_VECTOR_RETRIEVAL_ENABLED=false` is the operational kill switch.

The production runtime remains closed. Static `npm start` is canonical and the Next runtime is preview-only.
