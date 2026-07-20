# Scripture corpus readiness

Status: **BLOCKED_NO_COMPLETE_APPROVED_FULL_TEXT_CORPUS**

## Passing prerequisites

- The 66-book parser inventory and approved aliases are deterministic.
- Local reference metadata is hash-bound and reference-only.
- Corpus paths are fixed and cannot be selected by request input.
- No external Scripture API, web scrape, model, embedding, vector store, or persistence was introduced.
- Unknown-license text is explicitly blocked.

## Blocking prerequisites

- No complete local translation corpus exists.
- No translation source/version is approved.
- No full-text display-rights or attribution record exists.
- Per-chapter verse bounds are unavailable.
- Source-defined paragraph/pericope boundaries are unavailable.
- Exact quotation validation and deterministic verse-text search cannot run.
- Existing displayed quotations cannot be field-by-field checked against an approved corpus.

Prompt 15 cannot be marked complete and Prompt 16 remains locked. Resolution requires a narrowly documented owner corpus/licensing decision and a separately verified local corpus import; an internet download or silent corpus replacement is forbidden.
