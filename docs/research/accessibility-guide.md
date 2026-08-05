# Teoyube formative pilot accessibility research guide

Status: **DRAFT - DOES NOT CLAIM WCAG CONFORMANCE**

## Purpose

This guide records lived task barriers alongside current automated parity evidence. It does not turn visual parity into an accessibility-conformance claim and does not authorize protected DOM, copy, focus, or visual changes.

## Coverage

For applicable participants and devices, assess:

- keyboard-only navigation and visible focus;
- sequential focus order, including current Canon media-control behavior;
- drawers, modals, backdrops, focus entry, focus trap, and focus return;
- accessible names, roles, states, landmarks, and heading structure;
- screen-reader announcements and reading order;
- zoom at 200% and 400% where applicable;
- responsive reflow and avoidance of two-dimensional scrolling except where essential;
- user text-spacing overrides;
- reduced motion and carousel behavior;
- video, audio, carousel, and other media controls;
- error identification and recovery;
- source and explanation drawers;
- consent grant, inspection, revocation, and deletion controls;
- Teo Guide loading, streaming, fallback, error, and completion status;
- live-AI consent and mode distinction;
- memory export and deletion.

## Procedure

1. Record participant ID, task, route, browser/device, viewport/zoom, and volunteered assistive technology.
2. Let the participant attempt the task before intervention.
3. Record the barrier and observable consequence, not a diagnosis.
4. Record any workaround and whether it changes the intended outcome.
5. Identify whether a protected element is affected and whether owner approval would be required for a fix.
6. Apply the severity model below.

## Severity

- Critical: blocks a safety-, consent-, deletion-, citation-, or essential-journey task with no usable workaround.
- High: blocks an important task or creates a material authority/privacy misunderstanding; workaround is burdensome or unreliable.
- Medium: causes substantial delay, confusion, or repeated errors but has a reliable workaround.
- Low: noticeable friction that does not prevent completion.
- Observation: preference or enhancement without a demonstrated barrier.

High-impact accessibility blockers must be resolved before broad launch; visible or protected fixes remain separately owner-gated.

## Finding format

| Field | Required value |
| --- | --- |
| Finding ID | Stable de-identified identifier |
| Participant ID | Research ID only |
| Route | Current Teoyube route |
| Task | Task number and capability |
| Assistive technology | Volunteered study setup; no diagnosis |
| Barrier | Observable, non-sensitive description |
| Severity | Critical / high / medium / low / observation |
| Workaround | None or tested workaround |
| Protected element affected | Yes / no / unknown, with selector only when safe |
| Owner approval required | Yes / no / to be determined |
| Evidence | Minimal de-identified note; no private content |

The current known Canon focus-order discrepancy and inherited `aria-hidden` debt are observations to test, not approved differences or pre-judged participant outcomes.
