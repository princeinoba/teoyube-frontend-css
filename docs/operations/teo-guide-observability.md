# Teo Guide observability

Prompt 18 emits allowlisted privacy-safe events:

- `teo_guide_request_started`;
- `teo_guide_intent_selected`;
- `teo_guide_tool_allowed`;
- `teo_guide_tool_blocked`;
- `teo_guide_fallback_used`;
- `teo_guide_response_validated`;
- `teo_guide_action_proposed`;
- `teo_guide_action_confirmed`;
- `teo_guide_action_rejected`.

Events may contain timestamp, hashed subject, result, count, intent/topic, mode, purpose, layer, and policy version. They do not contain raw input, prayer, reflection, response, draft, retrieved memory content, Scripture text, secrets, credentials, session tokens, CSRF tokens, or proposal payloads.

Prompt 17 safety events remain active for topic selection, safety mode, injection denial, tool/memory denial, citation failure, prohibited claims, fallback, and gate failure.

External monitoring remains disabled. The in-memory sink is used in tests; the null sink is the default. Enabling external telemetry requires a later owner-authorized prompt, a provider review, retention policy, consent analysis, and proof that raw sensitive text cannot leave the server.

The blocking gate verifies no provider SDK, network fetch, direct seeds/traversal, unchecked boundary assertion, client data leak, or canonical-runtime change.
