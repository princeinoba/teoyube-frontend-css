# Canon focus owner decision

Status: **APPROVED FOR EXACT PROPOSAL - NOT STARTED**
Issue: **A11Y-003**
Decision: **APPROVE_RECOMMENDED_PHASE5C_FIX**
Decision ID: `TEOYUBE-OWNER-ACCESSIBILITY-PHASE5B-2026-08-05-001`
Decided at: `2026-08-05T17:13:18.973Z`
Proposal hash: `512755ac81b5cf4961c9c548a8a7eea12c7677564762635d589d26de1656a1ca`

## Findings

- The eleven media stages are visible and independently playable, not one composite widget.
- Canonical Next supports pointer, Enter, Space, durable names, and pressed state.
- The tab sequence is verbose but logical because each media action is distinct.
- Roving tabindex is not appropriate: it would invent composite semantics and reduce normal Tab discovery.
- The static rollback omits those visible actions from keyboard access.
- Next is more accessible but is not focus-order parity-equivalent.
- A11Y-003 is not an aria-hidden/inert violation; A11Y-004 separately covers the hidden Canon row.

## Recommended product decision

**APPROVE_RECOMMENDED_PHASE5C_FIX** for the exact hash above: preserve the eleven Next controls and add equivalent named keyboard/playback semantics to the same visible static stages in Phase 5C batch 2. Preserve pixels; change only attributes and keyboard behavior. Do not delete controls, add hidden duplicates, use roving tabindex, or update a baseline.

## Required later gates

- 72 protected visual/parity cells
- 105 parity tests
- Three consecutive 216-cell performance/accessibility runs
- NVDA, Narrator, VoiceOver, and TalkBack tasks from the manual plan
