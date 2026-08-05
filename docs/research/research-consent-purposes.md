# Research consent purposes

Phase 4B reuses the Prompt 16 consent ledger and adds six independent, default-off purposes:

| Purpose | Scope | Implies another purpose? |
|---|---|---|
| `research_participation` | participate or withdraw | No |
| `research_product_events` | write/export/delete fixed research events | No |
| `research_accessibility_observation` | observe volunteered accessibility mode/barrier | No diagnosis required |
| `research_optional_recording` | optional recording capture | No; separate from participation/events |
| `research_optional_live_ai_task` | optional research live-AI task | No; also requires `external_ai_processing` |
| `research_follow_up_contact` | separate follow-up contact workflow | No; never enters event storage |

No purpose is pre-granted. Participation does not imply event, recording, accessibility, live-AI, or follow-up consent. Terms acceptance is not research consent. Effective participation and product-event consent are checked before every write. Event-specific consent is then checked. Revocation blocks subsequent writes immediately.

The signed envelope holds the consent-record IDs current when issued; an ID mismatch fails as stale consent. Denial leaves deterministic Teoyube use unchanged. Withdrawal and deletion do not require the user to grant new collection consent.
