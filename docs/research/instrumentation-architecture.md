# Privacy-safe research instrumentation architecture

Phase 4B adds one server-owned, provider-neutral research boundary for the approved formative pilot. It does not add analytics to the ordinary product runtime and does not authorize participant collection.

## Execution boundary

```text
checked-in research mode (false)
-> allowlisted study
-> signed short-lived synthetic session envelope
-> existing consent ledger
-> fixed event registry
-> prohibited-field and prohibited-value validation
-> participant isolation
-> hash-chain integrity
-> encrypted ignored local adapter
-> content-free operational signal
```

`ResearchActionObserver` is the only application-facing adapter. It records approved domain/application outcomes after a product action; it never watches the DOM, keystrokes, text input, mouse movement, or page content. Its failure-isolated method cannot change product state or make a successful product action fail.

The canonical implementation lives under `src/domain/research/` and `src/server/research/`. It imports neither React nor Next.js. There is no research page, route, client flag, client repository, external analytics SDK, session replay, heat map, or fingerprinting.

## Inert default

`TEOYUBE_RESEARCH_MODE_ENABLED=false` is checked in. Enabling the boolean alone is insufficient: the selected study must exist in `config/research-study-registry.json`, the signed envelope must match it, and effective participation plus product-event consent must exist. The only allowlisted Phase 4B study is synthetic-test-only and explicitly disallows real participant collection.

The static rollback runtime has no instrumentation integration. No visible output, DOM, CSS, asset, focus order, route, or baseline is changed.

## Product and theology boundary

Research records fixed outcomes about clarity, trust, source inspection, reversibility, continuity, safety, and accessibility. It never scores faith, holiness, spiritual rank, divine favor, promise fulfillment, testimony validity, or calling certainty. Exact Scripture remains a canonical source ID, not copied text. Understanding results come from the approved moderator rubric, not inferred navigation.

## Safety

`research_safety_stop` stores only a fixed event name, safe issue code, task, timestamp, and stopped result. It stores no disclosure. A critical safety case never authorizes live AI and the task must stop under the existing safety policy.
