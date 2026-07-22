# Live model gateway

Prompt 19 adds one framework-independent `LiveModelGateway` contract under `src/domain/live-ai/`. Teo Guide depends on this contract, not on a vendor SDK. The gateway accepts a bounded `SafeModelInput`, fixed model route, versioned prompt/schema metadata, read-only strict tools, a timeout, an abort signal, and `store: false`.

The authoritative flow remains deterministic:

1. authenticate and bound input;
2. verify external-processing consent;
3. run Prompt 17 safety;
4. run Prompt 18 intent, tool planning, and deterministic tools;
5. construct minimum safe context;
6. optionally request language synthesis;
7. validate schema, sources, citations, theology, and safety;
8. expose only approved sections;
9. leave every write to the existing explicit action endpoint.

The model cannot select identity, consent, Scripture, TIG state, safety policy, memory authorization, calling, fulfillment, testimony, journey transitions, or writes. A disabled flag, missing consent, critical case, prompt injection, budget block, provider failure, refusal, invalid schema, invalid citation, unsafe language, timeout, or cancellation returns the Prompt 18 deterministic response.

Version: `teoyube-guarded-live-guide-2026-07-22.1`.
