# A11Y-008 contrast evidence model

Phase 5D-2 separates six evidence layers. A result from one layer must not be silently described as a result from another.

| Evidence layer | Meaning | Collection rule | Decision use |
| --- | --- | --- | --- |
| `AUTHORED_COLOR_EVIDENCE` | CSS declarations that match the exact D02/D05 status element before user-agent forced-color substitution. | Record matching selectors, declaration values, origins when exposed, inline declarations, and stylesheet access errors. | Explains the source colors axe may analyze. It is not proof of the pixels a user sees in forced-colors mode. |
| `COMPUTED_STYLE_EVIDENCE` | Browser `getComputedStyle` values for the target and contributing ancestors in the active context. | Record foreground, background, typography, opacity, images, blending, filters, `forced-color-adjust`, pseudo-elements, and geometry. | Establishes the browser-resolved CSSOM state. It is not by itself rendered-pixel evidence. |
| `USED_FORCED_COLOR_EVIDENCE` | Evidence that forced colors are active and the user agent has substituted system colors. | Record media-query state, resolved `Canvas`/`CanvasText` probes, forced-color adjustment, and emulation/native classification. | Establishes the effective forced-color context and substitution behavior. |
| `RENDERED_PIXEL_EVIDENCE` | Pixels captured from the exact target after layout, paint, antialiasing, compositing, and forced-color substitution. | Use fresh contexts, deterministic readiness, stable bounding boxes, padded element clips, dominant interior glyph/background clusters, alpha/edge exclusions, source-safe hashes, and repeat consistency. | Primary evidence for the contrast actually rendered to the user when the sampling reliability criteria pass. |
| `AXE_RULE_EVIDENCE` | axe-core `color-contrast` rule output, including the exact raw node payload and runner metadata. | Preserve violations, incomplete results, passes, node `any`/`all`/`none`, related nodes, data, HTML, target, failure summary, axe version, rule configuration, and context mode. | Identifies what axe evaluated. A forced-colors failure cannot override reliable rendered evidence unless the raw payload shows axe used the effective rendered pair. |
| `ACCESSIBILITY_TREE_EVIDENCE` | Browser accessibility-tree representation of the exact status element and its relatives. | Capture the Chromium accessibility tree through the DevTools protocol without changing the product DOM. | Confirms role/name/state exposure and whether the label remains perceivable. It does not calculate visual contrast. |

## Threshold and adjudication

The required minimum is `4.5:1`. Phase 5D-2 never converts an axe failure into a pass merely because a computed value is high. Reconciliation requires all of the following:

1. exact target and runtime identity;
2. deterministic context readiness and stable geometry;
3. reliable rendered foreground/background clusters;
4. repeat consistency;
5. preserved raw axe node evidence;
6. a direct determination of whether axe evaluated authored colors or effective forced colors;
7. no unresolved harness error or unexplained Next/static difference.

If reliable evidence cannot be obtained, the cell remains `UNKNOWN`. Native Windows high-contrast evidence is `NOT_AVAILABLE` unless the existing environment is already in a repeatable native high-contrast state; Phase 5D-2 does not change operating-system settings.

## Target scope

- D02: `[data-canon-item="canon-map-D02"] .canon-status.in-progress`
- D05: `[data-canon-item="canon-map-D05"] .canon-status.in-progress`
- Next route: `/canon?ownerQa=1`
- Static route: `/index.html?ownerQa=1#canon`
- Required threshold: `4.5:1`
