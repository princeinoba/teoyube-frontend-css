# Retrieval evaluation

The locked synthetic set is `tests/fixtures/retrieval/locked-evaluation-set.json`.

- 8 exact-reference cases;
- 20 semantic cases;
- no real user content;
- exact expectation amendment `exact-02` documents the canonical `Psalms` normalization;
- semantic judgments were not changed after comparison.

Passing default-model results:

| Metric | Baseline | Hybrid | Gate |
|---|---:|---:|---|
| Exact-reference accuracy | — | 1.0000 | 1.0000 |
| Citation validity | — | 1.0000 | 1.0000 |
| Recall@5 | 0.8500 | 1.0000 | reported |
| Recall@10 | 0.9000 | 1.0000 | improvement >= 0.03 |
| MRR@10 | 0.642917 | 0.7725 | reported |
| nDCG@10 | 0.665387 | 0.803102 | improvement >= 0.05 |
| Source precision@10 | 0.36375 | 0.24375 | reported; broader relevant-source recall traded precision |
| Source diversity@10 | — | 1.0000 | reported |
| Trust/consent filter accuracy | — | 1.0000 | 1.0000 |
| Mean assembled context tokens | 1,664 | 2,536.95 | <= 4,000 per case |
| Hybrid latency p95 | — | 304.2182 ms | reported |
| Critical regressions | — | 0 | 0 |
| Source inspectability | — | 1.0000 | 1.0000 |
| Cross-user leakage | — | 0 | 0 |
| Prompt-injection bypass | — | 0 | 0 |

nDCG@10 improved `+0.137714`; Recall@10 improved `+0.10`. The large candidate model was therefore not called or promoted.

Hybrid retrieval increased mean assembled context by 872.95 estimated tokens while improving Recall@5 from 0.85 to 1.00, Recall@10 from 0.90 to 1.00, and nDCG@10 by 0.137714. Every assembled case remained within the 4,000-token context cap. The precision reduction is retained as a reported limitation rather than hidden or threshold-adjusted.

Run:

```text
npm run retrieval:verify
npm run retrieval:evaluate
npm run test:retrieval
npm run retrieval:boundaries:verify
```

The evaluation command writes only disposable output under `.var/retrieval`. Checked-in score evidence is `retrieval-evaluation-scorecard.json`.
