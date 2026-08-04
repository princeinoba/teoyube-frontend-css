# AI evaluation summary

## Current status

Teoyube's AI architecture is strong for a local preview and deliberately incomplete for production.

| Capability | Current evidence | Status |
| --- | --- | --- |
| Exact Scripture | 66 books, 1,189 chapters, 31,103 markers, 31,098 displayable verses; 356/356 locked references; exact wording validation | PASS |
| Deterministic TIG | Five characterization fixtures; fixed input/version determinism; ranking, traversal, explanation, source validation, cache and limit tests | PASS |
| Theological safety | Gate A 64/64; policy semantic hash `65943d...`; zero prohibited automatic writes in contracts | PASS |
| Teo Guide orchestration | Deterministic, sourced, provider-neutral, explicit-confirmation write path | PASS |
| Live provider preview | Prompt 19K: nine fixtures, seven provider calls, 7/7 strict/citable responses; critical and injection fixtures zero calls | PASS_REUSED_HASH_BOUND |
| Hybrid retrieval | 28 cases; exact/citation/Recall@5/10/filtering 1.0; MRR@10 0.7725; nDCG@10 0.803102; p95 304.2182 ms | PASS_REUSED_HASH_BOUND |
| Production AI | Checked-in flags off; Gate B Production closed | NOT_AUTHORIZED |
| Real-user AI usefulness | No participant evidence | NOT_YET_RUN |

Policy-defined live-AI and retrieval reuse paths have no diff from the Prompt 19K and Prompt 20 tagged commits. This permits honest reuse of bounded paid evidence; it does not turn historical evidence into production evidence. Prompt 24 made **zero** provider calls.

## Strengths

- Scripture retrieval and citation validation are deterministic and do not rely on an LLM.
- TIG cannot silently mutate journey, memory, testimony, promise, or Book state.
- Safety is evaluated before model use, with deterministic critical and prompt-injection paths.
- Structured outputs, source paths, confidence, limitations, fallbacks, and version identities are explicit.
- Retrieval partitions enforce trust, consent, deletion/revocation, source inspection, and cross-user isolation.
- Kill switches and budget admission default to safe/off.

## Material gaps

- Source precision at 10 is 0.24375; high recall does not by itself establish relevance quality.
- The locked set has 28 cases and cannot represent open-ended pastoral, cultural, multilingual, or adversarial use.
- Model/provider behavior has not been qualified for production, and Gate B Production remains closed.
- User comprehension and usefulness of AI explanations are unknown.
- No production vector store, managed key/identity layer, or production monitoring is connected.

## Next evidence gate

Expand the locked set with reviewed, de-identified pilot cases; target exact citation validity 1.0, critical safety recall 1.0, prompt-injection bypass 0, Recall@10 at least 0.95, source precision at least 0.50, and zero unauthorized writes. A new paid gate requires explicit authorization and a current source/model/provider binding.
