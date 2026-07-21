# Scripture citation validation

A valid quotation requires an unambiguous reference, registered `engwebp` translation/source, matching corpus version, `FULL_TEXT_ALLOWED`, corpus provenance, and exact WEB wording after whitespace-only normalization.

The canonical repository returns `validationStatus: validated`, source ID `engwebp`, corpus version `engwebp-2020-stable-2026-07-10.p15b.1`, and the corpus checksum with retrieved passages. It returns typed `quote_mismatch`, `translation_mismatch`, `unresolved_source`, `display_blocked_by_license`, or `missing_corpus_coverage` failures and never silently rewrites supplied text.

TIG validates its reference anchors through this canonical corpus without changing rankings, graph paths, confidence, or journey state. Promise interpretation levels, prayer/paraphrase, calling discernment, assignments, testimony, Book content, and user-authored text remain semantically separate and cannot be validated as WEB simply because they cite Scripture.

The 17 owner-approved visible quotations are additionally bound by `tests/visual/contracts/owner-approved-scripture-content-delta.json`, which records exact legacy and WEB hashes and replays every approved source replacement from the Prompt 15A evidence commit.
