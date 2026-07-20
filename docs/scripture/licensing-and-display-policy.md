# Scripture licensing and display policy

## Policies

- `FULL_TEXT_ALLOWED`: exact text may be returned only when the registry records the translation, source, version, checksum, attribution, and owner-approved display rights.
- `REFERENCE_ONLY`: bare canonical references may be returned; no verse text or excerpt may be inferred.
- `EXCERPT_LIMITED`: text may be returned only inside an explicit recorded excerpt limit and attribution policy.
- `DISPLAY_BLOCKED_LICENSE_UNKNOWN`: source or rights evidence is incomplete, so no text may be rendered, validated, indexed, or used as context.

## Current status

Only `REFERENCE_ONLY` behavior is active. The three KJV seed excerpts are `DISPLAY_BLOCKED_LICENSE_UNKNOWN`. The repository does not infer permission because KJV is named, because a string exists locally, or because a translation may be public domain in some jurisdictions.

An owner approval must identify the exact translation edition, upstream source, source version, territory considerations if applicable, corpus checksum, attribution wording, permitted display scope, excerpt limits, modification policy, and revocation/rollback process. Until then, full text, snippets, quote matching, and lexical verse-text indexing remain blocked.
