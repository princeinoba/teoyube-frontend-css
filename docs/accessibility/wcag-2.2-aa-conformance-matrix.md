# WCAG 2.2 A/AA evidence matrix

**Conformance claim: NO.** Confirmed failures and incomplete assistive-technology/manual evidence prevent an A or AA claim.

| Criterion | Level | Result | Evidence summary |
| --- | --- | --- | --- |
| 1.1.1 Non-text Content | A | Partial | axe and DOM inventory; human meaning review remains. |
| 1.2.1 Audio-only/Video-only | A | Manual required | External media blocked; alternatives not verified. |
| 1.2.2 Captions (Prerecorded) | A | Manual required | YouTube caption tracks not loaded. |
| 1.2.3 Audio Description or Media Alternative | A | Manual required | Editorial review remains. |
| 1.2.4 Captions (Live) | AA | N/A observed | No live synchronized media observed. |
| 1.2.5 Audio Description | AA | Manual required | Prerecorded description not verified. |
| 1.3.1 Info and Relationships | A | Partial | A11Y-001 fixed in Phase 5C-1; manual relationship and AT reading-order review remains. |
| 1.3.2 Meaningful Sequence | A | Partial | DOM/keyboard sequences captured; AT reading order remains. |
| 1.3.3 Sensory Characteristics | A | Manual required | Human instruction review. |
| 1.3.4 Orientation | AA | Automation support | Portrait/landscape cells, no horizontal overflow. |
| 1.3.5 Identify Input Purpose | AA | Partial | Input inventory; autocomplete review remains. |
| 1.4.1 Use of Color | A | Manual required | Forced-colors evidence; meaning review remains. |
| 1.4.2 Audio Control | A | Partial | No autoplay loaded; third-party player not verified. |
| 1.4.3 Contrast (Minimum) | AA | **Needs more evidence** | A11Y-008 does not reproduce on actual Canon; A11Y-009 manual contrast review remains incomplete. |
| 1.4.4 Resize Text | AA | Partial | 200%-layout evidence; true browser zoom/manual readability remains. |
| 1.4.5 Images of Text | AA | Manual required | Artwork assessment remains. |
| 1.4.10 Reflow | AA | Automation support | 23 routes at 320 CSS pixels; zero overflow. |
| 1.4.11 Non-text Contrast | AA | Manual required | Control/focus contrast review remains. |
| 1.4.12 Text Spacing | AA | Automation support | 23 routes, no overflow under spacing override. |
| 1.4.13 Content on Hover or Focus | AA | Manual required | Dismiss/persist/hover review remains. |
| 2.1.1 Keyboard | A | Partial | A11Y-006 fixed; media and observable assistive-technology validation remains. |
| 2.1.2 No Keyboard Trap | A | Automation support | 81 traversal cells, no observed trap. |
| 2.1.4 Character Key Shortcuts | A | Partial | None exposed; listener review incomplete. |
| 2.2.1 Timing Adjustable | A | Manual required | Timeout behavior review remains. |
| 2.2.2 Pause, Stop, Hide | A | Partial | Carousel/media controls inventoried. |
| 2.3.1 Three Flashes | A | Manual required | Video/animation flash analysis remains. |
| 2.4.1 Bypass Blocks | A | Automation support | Skip link first in default keyboard order. |
| 2.4.2 Page Titled | A | Automation support | Titles captured in all cells. |
| 2.4.3 Focus Order | A | Partial | A11Y-002, A11Y-003, and A11Y-004 fixed; manual AT order review remains. |
| 2.4.4 Link Purpose | A | Partial | Names captured; context judgment remains. |
| 2.4.5 Multiple Ways | AA | Partial | Navigation/search exist; human findability remains. |
| 2.4.6 Headings and Labels | AA | Partial | A11Y-003 and A11Y-005 fixed; manual clarity review remains. |
| 2.4.7 Focus Visible | AA | Partial | No heuristic miss; visual confirmation remains. |
| 2.4.11 Focus Not Obscured | AA | Manual required | Hit-test candidates require human review. |
| 2.5.1 Pointer Gestures | A | Partial | Alternatives observed; touch inventory remains. |
| 2.5.2 Pointer Cancellation | A | Manual required | Physical input testing remains. |
| 2.5.3 Label in Name | A | Partial | Name inventory; speech-input comparison remains. |
| 2.5.4 Motion Actuation | A | N/A observed | No motion controls observed. |
| 2.5.7 Dragging Movements | AA | Partial | Carousel buttons exist; physical dragging review remains. |
| 2.5.8 Target Size (Minimum) | AA | **Partial evidence** | A11Y-007 scoped targets pass 570/570 at 24×24 with center-hit and behavior checks; manual physical-input/AT evidence remains incomplete. |
| 3.1.1 Language of Page | A | Automation support | HTML language captured. |
| 3.1.2 Language of Parts | AA | Manual required | Teoyube words/quotations review remains. |
| 3.2.1 On Focus | A | Partial | Keyboard traversal; human context-change observation remains. |
| 3.2.2 On Input | A | Partial | Search/filter states exercised. |
| 3.2.3 Consistent Navigation | AA | Automation support | Approved shell parity preserved. |
| 3.2.4 Consistent Identification | AA | Partial | Shared controls captured; human semantics remain. |
| 3.2.6 Consistent Help | A | Partial | Help controls inventoried. |
| 3.3.1 Error Identification | A | Manual required | Error states not exhausted. |
| 3.3.2 Labels or Instructions | A | Partial | A11Y-005 fixed; broader human instruction review remains. |
| 3.3.3 Error Suggestion | AA | Manual required | Validation workflows remain. |
| 3.3.4 Error Prevention | AA | Partial | Reversibility exists; destructive paths need confirmation. |
| 3.3.7 Redundant Entry | A | Manual required | Cross-module task review remains. |
| 3.3.8 Accessible Authentication | AA | N/A observed | No authentication challenge exposed. |
| 4.1.2 Name, Role, Value | A | Partial | Applicable A11Y-001 through A11Y-005 findings fixed; observable AT/media validation remains. |
| 4.1.3 Status Messages | AA | Partial | Live regions inventoried; observable AT test absent. |

`SUPPORTED_BY_AUTOMATION` is deliberately rendered as “Automation support,” not “Pass.” The machine-readable JSON contains the full evidence wording and status vocabulary.

## Phase 5C-2 update

The matrix remains a non-conformance evidence matrix. Phase 5C-3A closes the scoped A11Y-007 defect, but A11Y-008 needs more evidence and every manual/AT evidence gap remains. **Complete WCAG 2.2 AA conformance: NO.**

## Phase 5D-1 A11Y-008 retest (2026-08-07T12:30:10.264Z)

A11Y-008 completed its deterministic 1,584-cell retest with **BLOCKED_INCONCLUSIVE** outcome. Minimum computed and reliable rendered ratios are 6.9851:1 and 5.5411:1, but forced-colors axe evidence conflicts with computed/rendered evidence, seven rendered samples remain unknown, and one static/Next comparison contradicts. A11Y-008 remains **NEEDS_MORE_EVIDENCE**; product changes, manual task completions, and new owner decisions are zero.

Complete WCAG 2.2 AA conformance remains **NOT CLAIMED**.
