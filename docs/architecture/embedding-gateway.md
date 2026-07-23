# Embedding gateway

`EmbeddingGateway` owns provider-neutral document and query embedding contracts. The only OpenAI implementation is the server-only `OpenAiEmbeddingGateway`.

Approved Prompt 20 profile:

- default: `text-embedding-3-small`, 1,536 returned dimensions;
- candidate: `text-embedding-3-large`, 3,072 dimensions, locked sample only if the default materially fails;
- legacy `text-embedding-ada-002`: disabled;
- raw sensitive user text: prohibited;
- SDK: exactly `openai@6.48.0`;
- provider retries: disabled; at most two application-owned attempts;
- provider vector stores, file search, web search, and model-generated retrieval reasoning: disabled.

The adapter checks content hashes, sensitivity, character count, batch count, batch-token estimates, model/dimension allowlists, and remaining cost before every call. Provider usage is checked again after the response.

Price basis at the owner decision:

- [`text-embedding-3-small`](https://developers.openai.com/api/docs/models/text-embedding-3-small): $0.02 per million input tokens.
- [`text-embedding-3-large`](https://developers.openai.com/api/docs/models/text-embedding-3-large): $0.13 per million input tokens.
- [Embeddings guide](https://developers.openai.com/api/docs/guides/embeddings): 8,192 maximum input tokens for the approved models.
- [API data controls](https://developers.openai.com/api/docs/guides/your-data#default-usage-policies-by-endpoint): embeddings are not used to train models; endpoint data controls remain provider-account policy.

Aliases are bound in each local index manifest to model ID, returned dimension, adapter version, source hashes, and generation time. A model or dimension change produces a different index contract.
