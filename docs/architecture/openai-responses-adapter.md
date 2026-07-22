# OpenAI Responses adapter

The only production module that imports the official OpenAI SDK is `src/server/live-ai/openai-responses-adapter.ts`. The exact dependency is `openai@6.48.0` with reviewed lock integrity `sha512-KhVp+FyV50QrXNextvL9hIU5l6ox5HYuKQjGVk7lIqprgJol90+dQXWONV6S1lRWsKA1bXjrow8RsUT14M1hNA==`.

Adapter invariants:

- Responses API only;
- server-only API key;
- `store: false` on every request;
- provider-hosted conversation state is not used;
- strict final JSON Schema;
- strict function schemas, `additionalProperties: false`, all fields required;
- `parallel_tool_calls: false`;
- zero or one prepared read-only tool result at a time;
- at most two owner-approved tool rounds;
- no web search, file search, code interpreter, computer use, hosted shell, MCP, connectors, tool search, background mode, or Realtime API;
- SDK retries disabled; Teoyube owns the one bounded transient retry;
- no user-controlled base URL, model, prompt, or tool list;
- raw text deltas and raw provider errors never reach the client.

The approved snapshots are `gpt-5.4-mini-2026-03-17` for the light route and `gpt-5.4-2026-03-05` for the standard route. Advanced routing is disabled.

Official capability references were checked on 2026-07-22: [GPT-5.4 mini](https://developers.openai.com/api/docs/models/gpt-5.4-mini), [GPT-5.4](https://developers.openai.com/api/docs/models/gpt-5.4), and [model catalog](https://developers.openai.com/api/docs/models).
