# Scripture citation validation

A quotation is valid only when its reference resolves, translation is explicit, source is registered, display policy allows text, corpus version/checksum are present, and displayed wording exactly matches corpus text after safe whitespace normalization.

The current repository cannot satisfy those conditions. It therefore:

- returns normalized citations with `validationStatus: "unresolved"`;
- returns `null` for passages and context;
- never emits a verse excerpt from the local reference index;
- returns `display_blocked_by_license` for the legacy KJV seed;
- returns `quote_mismatch` when text is submitted because no approved text can establish an exact match;
- returns `missing_corpus_coverage`, `translation_mismatch`, or `unresolved_source` where applicable;
- never silently corrects or rewrites displayed wording.

Promise levels, prayers, calling explanations, personalized actions, and user-authored reflections remain separate types and are not accepted as Scripture text.
