# Accessibility route and state matrix

All 23 retained public routes were audited in their default state at all six protected viewports. Every route also received text-spacing, reduced-motion, forced-colors, 320-pixel reflow, and effective 200%-zoom layout checks. Focused states were exercised at desktop-wide and mobile.

| Route | Capability | Focused states beyond default | Registered findings |
| --- | --- | --- | --- |
| `/` | Today | carousel next; Guardrails dialog | A11Y-002, A11Y-007 |
| `/search` | TeoyubeSearch | query `calling` | None automated |
| `/canon` | Canon | alternate tab; media-control focus/play | A11Y-003, A11Y-004, A11Y-007, A11Y-008 |
| `/promise-table` | Promise Table | video selected | None automated |
| `/calling-compass` | Calling Compass | compass started | None automated |
| `/book` | Book of the Saint | memory search | A11Y-007 |
| `/lexicon` | Lexicon | category filter | A11Y-001, A11Y-005 |
| `/testimony` | Testimony | Drafts tab | A11Y-006 |
| `/teo-guide` | Teo Guide | synthetic deterministic prompt draft | None automated |
| `/embedded-videos` | Embedded Videos | Teachings, Worship, Messages, Documentaries, Shorts, and TeoyubeWorld Media tabs | A11Y-005 |
| `/tables` | Tables | expanded dual-media row | A11Y-005 |
| `/prayer` | Prayer | synthetic input | None automated |
| `/journey` | Journey | primary action | None automated |
| `/journal` | Journal | synthetic reflection draft | None automated |
| `/settings` | Settings | personalization disabled | None automated |
| `/privacy` | Privacy | default only | None automated |
| `/consent` | Consent | default only | None automated |
| `/terms` | Terms | default only | None automated |
| `/profile` | Profile | default only | None automated |
| `/personalization` | Personalization | wisdom signal | None automated |
| `/daily-word` | Daily Word | generated session | None automated |
| `/explore` | Explore | Clusters tab; Promise Table tab; wisdom filter | A11Y-007 |
| `/promise-search` | Promise Search | query `wisdom`; keyboard query `calling` | None automated |

“None automated” means the automated checks found no violation in the audited cells. It does not mean WCAG conformance or assistive-technology approval.

## Coverage totals

- Default route/viewport cells: 138
- Route/mode cells: 115
- Focused interaction-state cells: 58
- Keyboard traversal cells: 81
- Execution errors: 0
- Horizontal-overflow cells above one pixel: 0
- Positive-tabindex cells: 0
- Duplicate-ID cells: 0

Excluded from public conformance scope: owner-only `/roadmap`, internal `/graph`, development-only `/dashboard`, and redirect alias `/compass`.
