# Vector Retrieval Evaluation

Provider evaluation completed under `TEOYUBE-AUG21-VECTOR-EVALUATION-2026-08-09-001` using `text-embedding-3-small` at 1536 dimensions.

Result: **BLOCKED_QUALITY**.

- Dataset: `teoyube-vector-provider-evaluation-2026-08-09.1`, 43 locked cases
- Passed: 37; failed: 6
- Exact-reference recall@1/@5: 100% / 100%
- Paraphrase recall@5: 90%
- MRR: 0.714167
- Citation and displayed WEB accuracy: 100% / 100%
- Content-type precision: 85.71%
- No-answer precision: 0%
- Private retrieval and prompt override: 0% / 0%
- Deterministic fallback: 100%
- Actual bounded task cost: $0.04040528 of $0.25

The raw vector-only result is retained as ignored evidence with SHA-256 `06dd09181f86bfcf31c57db6c57ca64a0d9cab524c964f485e1e375a0bb74b45`. The final result evaluates the implemented hybrid query path and preserves all failed cases without threshold or expectation weakening.
