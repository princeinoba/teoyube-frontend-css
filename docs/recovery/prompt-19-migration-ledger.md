# Prompt 19 migration ledger

| Capability | Previous owner | Prompt 19 owner | Compatibility/removal status |
| --- | --- | --- | --- |
| deterministic intent/tools/safety | Prompt 17/18 services | unchanged | retained as authoritative |
| external processing decision | none/disabled | guarded live service | default off; no legacy removal |
| model contract | none | `src/domain/live-ai/model-gateway.ts` | provider-neutral public boundary |
| provider integration | none | OpenAI Responses adapter | only SDK import; Next server only |
| safe model context | none | safe input builder | excludes unauthorized/private context |
| live response schema | none | versioned strict domain schema | invalid output falls back |
| approved streaming | deterministic JSON response | validated NDJSON endpoint | deterministic endpoint retained |
| external consent | none | Prompt 16 purpose registry | four separate default-off grants |
| model cost/rate state | none | in-process guardrails | local preview only; production store pending |
| UI | approved Teo Guide structures | existing controller/rail/drawer | no CSS, asset, class, or default DOM redesign |

No TIG, Scripture, safety, journey, memory, action-proposal, static runtime, visual source, baseline, or historical module was deleted. Rollback can revert the Prompt 19 commits while leaving Prompt 18 deterministic orchestration intact.
