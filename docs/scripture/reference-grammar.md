# Scripture reference grammar

## Supported forms

- Full names: `Ephesians 1:18`
- Approved abbreviations: `Eph. 1:18`
- Numbered books: `1 John 1:1`, `First John 1:1`, `2Cor. 5:17`
- Chapter only: `Psalms 23`
- Single verse: `John 3:16`
- Same-chapter range: `Proverbs 3:5-6`
- Punctuation variants: `John 3.16`
- ASCII hyphen, en dash, and em dash ranges
- Repeated whitespace
- Semicolon-separated references and comma-separated references when the comma is followed by another book name

Cross-chapter syntax such as `John 3:36-4:2` is parseable only with an explicit corpus capability. It is rejected by the current reference-only repository because no corpus confirms coverage or verse bounds.

## Refusal behavior

The parser returns typed errors for unknown books, ambiguous abbreviations, chapter zero, verse zero, chapters outside the 66-book metadata, reversed ranges, and unsupported cross-chapter ranges. `Jo` and `J` are deliberately ambiguous and return candidates rather than guessing.

Positive verse upper bounds cannot be claimed without corpus metadata. A syntactically positive verse that is not in the reference index remains unresolved/missing coverage; it is not treated as validated Scripture.

The original input is retained in the in-process result for diagnostics. Production telemetry must not log raw spiritual queries.
