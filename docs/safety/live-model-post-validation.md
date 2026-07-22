# Live model post-validation

No raw provider text is displayable. A complete strict object is parsed and then checked against deterministic state:

- every section source ID exists;
- model-generated Scripture text is prohibited;
- every citation exactly matches supplied source ID, canonical label, WEB translation, and corpus version;
- action proposal IDs already exist in Prompt 18 output;
- final text passes Prompt 17 prohibited-claim, care-replacement, coercion, authority, citation, and sensitive-topic validation;
- critical and prompt-injection cases bypass the model entirely.

Unknown sources, invented citations, altered Scripture metadata, divine certainty, calling overreach, automatic testimony/fulfillment, coercion, unsafe care replacement, invalid schema, refusal, timeout, cancellation, budget/rate block, or provider failure produces a typed deterministic fallback. The rejected content is not streamed or logged.
