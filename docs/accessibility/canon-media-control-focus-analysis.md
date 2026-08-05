# Canon media-control focus analysis

The current Next Canon controller converts 11 existing visual media regions—mappings `canon-map-D02` through `canon-map-D12`—into interactive controls at runtime. It adds `role="button"`, `tabindex="0"`, `aria-pressed`, an accessible label, and Enter/Space activation. The focused playback tests verify all 11 mappings.

The approved static markup contains no `data-canon-video-stage` controls. The Next runtime therefore adds 11 focus stops that the protected static focus contract did not contain. Keyboard operability is valuable, but Phase 5A cannot silently declare the focus-order difference acceptable. It is registered as A11Y-003 and requires an owner-scoped Phase 5B decision about the exact DOM/semantic treatment.

A second independent finding, A11Y-004, is a `button.canon-recent-merged-row` located within an `aria-hidden` subtree while remaining focusable.

No controller, markup, CSS, ARIA, media mapping, keyboard behavior, or baseline was changed in Phase 5A.
