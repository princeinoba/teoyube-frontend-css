# Model routing

Owner decision recorded in this Codex task:

| Route | Fixed model | Use |
| --- | --- | --- |
| light | `gpt-5.4-mini-2026-03-17` | product help and ambiguous low-complexity synthesis |
| standard | `gpt-5.4-2026-03-05` | ordinary Scripture-grounded Teo Guide synthesis |
| advanced | disabled | unavailable in Prompt 19 |
| deterministic-only | no model | critical safety, prompt injection, no consent, disabled flags, or fallback |

The model route is selected from deterministic intent and safety mode. The client cannot choose a model ID. A rate limit or outage never upgrades to a more expensive model. Fixed-input determinism belongs to Scripture/TIG/safety/planning; provider language is accepted only through strict validated contracts.
