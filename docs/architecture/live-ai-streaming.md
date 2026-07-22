# Live AI streaming

The provider connection streams internally, but Teoyube withholds every raw delta. The adapter emits only typed lifecycle metadata. The guarded service waits for the complete strict object, validates citations and sources, runs post-model theological and Prompt 17 safety checks, and only then creates `approved_section` events.

`POST /api/teoyube/teo-guide/stream` returns newline-delimited JSON with four public event classes:

- bounded progress stages;
- validated approved sections;
- a typed deterministic fallback reason;
- one complete client DTO.

The endpoint never returns system prompts, model reasoning, raw deltas, raw tool arguments, private memory text, source file paths, secret configuration, or an unvalidated provider response. Browser disconnect and replacement requests propagate an abort signal. No durable write is performed on completion, cancellation, or disconnect.
