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
| Recall@10 | 0.9000 | 1.0000 | improvement >= 0.03 |
| MRR@10 | 0.642917 | 0.7725 | reported |
| nDCG@10 | 0.665387 | 0.803102 | improvement >= 0.05 |
| Critical regressions | — | 0 | 0 |
| Source inspectability | — | 1.0000 | 1.0000 |
| Cross-user leakage | — | 0 | 0 |
| Prompt-injection bypass | — | 0 | 0 |

nDCG@10 improved `+0.137714`; Recall@10 improved `+0.10`. The large candidate model was therefore not called or promoted.

Run:

```text
npm run retrieval:verify
npm run retrieval:evaluate
npm run test:retrieval
npm run retrieval:boundaries:verify
```

The evaluation command writes only disposable output under `.var/retrieval`. Checked-in score evidence is `retrieval-evaluation-scorecard.json`.
