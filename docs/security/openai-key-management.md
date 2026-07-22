# OpenAI key management

`OPENAI_API_KEY` is server-only. It must come from the process environment, an ignored local secret file chosen by the owner, or a production secret manager. It must never use a `NEXT_PUBLIC_` name or enter source, Git, logs, errors, tests, screenshots, telemetry, client chunks, or build artifacts.

The current owner decision reuses the existing process key; no repository or `.env.local` write was made. Presence and authenticated model availability were checked without displaying the key. The key is lazily read by the server adapter. Missing or invalid credentials disable/fallback live mode without affecting deterministic Teo Guide. Rotation requires no code change.

The adapter does not accept a client-supplied base URL, model ID, system prompt, schema, tool list, or provider metadata. Safe health output reports only configured/disabled state, approved model identifiers, feature flags, consent state, `store: false`, and that no secret was exposed. Production key custody and rotation remain deployment blockers.
