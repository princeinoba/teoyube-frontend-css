# Retrieval context budget

The default assembled retrieval context is capped at 4,000 estimated tokens. Queries are capped at 500 characters; top-K is capped at 25; public indexing batches are capped at 256 inputs and 100,000 estimated tokens.

Context assembly preserves authority labels:

- Scripture;
- reviewed Scripture context;
- reviewed Teoyube content;
- system policy;
- user-approved record;
- product help.

Canonical Scripture text is discarded from the vector result and re-fetched by exact citation before context is returned. Invalid or unavailable canonical citations are omitted.

Segments that would exceed the context budget are skipped deterministically. No summarizing model is used to squeeze extra content into the budget.

Raw private prayer, reflection, crisis, or conversation text is not eligible for embedding or telemetry. Sensitive or critical requests disable vector query processing and use deterministic fallback.
