# Scripture retrieval acceptance evidence

## Executable reference-only evidence

- 66 canonical book names and every declared alias parse deterministically.
- Numbered books, chapter-only references, verses, ranges, punctuation, Unicode dashes, whitespace, and reference lists are covered.
- Ambiguity, zero/bounds checks, reversal, unsupported cross-chapter retrieval, query length, result limit, translation mismatch, source failure, licensing block, and quote mismatch use typed errors.
- The registry verifies 18 source assets by byte length and SHA-256.
- Reference search is local, deterministic, version-aware, bounded, cacheable without raw logging, and returns no excerpt.
- Tests replace `fetch` with a failing spy and prove retrieval does not call it.
- Architecture and built-client guards prohibit the server repository, corpus registry, reference index, and blocked KJV seed from client bundles.

Measured on the dedicated local Windows/Node 24 test process: combined corpus-module load 672.04 ms; reference-index construction 16.36 ms; exact-reference fallback p50/p95 0.0003/0.0026 ms; context fallback p50/p95 0.0003/0.0008 ms; lexical cache-miss p50/p95 0.5169/0.9357 ms; lexical cache-hit p50/p95 0.0017/0.0074 ms. A deliberately contended run beside recovery verification loaded the module in 2,700.44 ms and still kept index construction at 67.29 ms and search-miss p95 at 5.57 ms. The documented 5,000 ms module-load budget covers that local concurrency. These are reference-only measurements, not production network benchmarks or full-corpus performance claims.

## Acceptance intentionally unavailable

Exact verse retrieval, multi-verse retrieval, context, translation separation, per-verse bounds, exact/whitespace quote matching, wrong-verse comparison, mixed-translation detection, verse-text lexical search, index-version rebuilds against full text, TIG citation promotion, and product-wide quotation validation require a complete approved corpus. Those checks must not be simulated with promise summaries, prayers, generated fixtures, PDFs, or three isolated seed excerpts.
