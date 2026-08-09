# Vector Retrieval Production Gate

Authorization: `TEOYUBE-AUG21-VECTOR-EVALUATION-2026-08-09-001`

Implementation: **PROVIDER_EVALUATED**

Public default: **OFF**
Activation: **BLOCKED_QUALITY**

The OpenAI `text-embedding-3-small` checkpoint completed within budget and passed Scripture integrity, citation, privacy, prompt-injection, cross-type and deterministic-fallback gates. It did not pass activation quality: paraphrase recall@5 is 90% versus the required 95%, and no-answer precision is 0%.

Production flags remain false. No Production environment variable changed, no Preview was promoted, and Production was not redeployed. The exact-WEB deterministic service remains authoritative and the local checkpoint is evaluation-only.

Blockers:

- Paraphrase recall@5 is 0.90, below the required 0.95.
- No-answer precision is 0.00; unsupported external-current-info and ambiguous queries return plausible but irrelevant Scripture instead of abstaining.
- Calling/Canon ranking misses para-16 and para-20 in the top five.
- The interpretation-as-Scripture trap does not surface the expected Canon record, although returned Scripture remains correctly typed.
