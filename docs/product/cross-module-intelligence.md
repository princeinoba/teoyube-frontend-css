# Cross-module intelligence

The read-only cross-module retrieval service maps existing capability boundaries without changing any approved view.

| Surface | Primary partitions |
|---|---|
| Search | Scripture, context, promises, lexicon, prayer, theology, consent-eligible testimony/calling |
| Promise Search | Scripture, context, Promise Clusters |
| Today/Journey | Scripture, promises, prayer, consent-eligible journey/calling |
| Prayer | Scripture, context, reviewed prayer resources |
| Calling | Scripture, promises, consent-eligible calling/journey |
| Lexicon | Scripture, context, lexicon |
| Testimony/Book | Scripture, consent-eligible testimony/journey |
| Teo Guide | all policy-authorized partitions |
| Product help | theology/safety and reviewed product help |

Search and Promise Search remain distinct. The adapter declares `stateMutation=false`, `visibleCopyChanged=false`, and `defaultViewChanged=false`.

TIG remains the deterministic explanation and graph layer. Retrieval cannot silently mutate journey state, determine calling as fact, claim fulfillment, publish testimony, or persist a result. Any write still requires an explicit user-confirmed application action.

The feature flag defaults keep all existing user-visible behavior unchanged. No route, DOM, CSS, class, copy, asset, focus order, or visual baseline changed.
