# Prompt 20 embedding owner decision

Owner choices recorded in the interactive Prompt 20 task:

- reuse the existing funded-project key from ignored `.env.local`;
- never display, fingerprint, or commit the key;
- default `text-embedding-3-small`;
- `text-embedding-3-large` locked candidate only if the default materially fails;
- raw sensitive user text prohibited;
- total Prompt 20 cap: $1.00;
- full public index cap: $0.25;
- candidate evaluation cap: $0.50;
- query evaluation cap: $0.25;
- maximum automatic full public reindexes: one.

Project availability was checked read-only before calls. The funded project exposed `text-embedding-3-small`, `text-embedding-3-large`, and legacy `text-embedding-ada-002`. The legacy model stayed disabled.

The default passed the locked gate, so the candidate was not called or promoted.

The public-run checkpoint recorded $0.01926196 through chunk 31,232. A deterministic duplicate-inventory repair replaced the disposable checkpoint with a zero-cost cached replay before final manifest generation, so the exact terminal provider total is not recoverable from the repaired local checkpoint. The pre-call estimate was $0.04082660, the conservative estimate was $0.04899192, every paid batch enforced the $0.25 cap, and the final replay used 33,563 cache hits with zero provider calls. This accounting limitation is retained rather than inventing an exact total.

Two passing evaluation executions used 286 total input tokens, estimated at $0.00000572. Total spend remained far below the $1.00 owner cap.
