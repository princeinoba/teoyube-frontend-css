# Phase 5C-3A regression summary

The exact A11Y-007 remediation passes without expanding the owner-approved scope.

| Area | Result |
| --- | --- |
| Target matrix | 42 cells; 66 groups; 570/570 targets pass at minimum 24×24 |
| Center/overlap | 284/284 required center-hit checks pass; zero unintended overlap |
| Behavior | 42/42 comparisons and 66/66 interaction groups pass |
| A11Y-008 | Zero product changes; NEEDS_MORE_EVIDENCE retained |
| Current audit | 311 cells; zero harness errors; scoped A11Y-007 closed |
| Functional/browser | Integration 101/101; serial browser 61 runnable pass, 3 static skips |
| Build/type/lint | PASS |
| Security | Release gate 18 controls PASS; production audit zero; full tree has one separate high js-yaml advisory |
| Recovery | 72 screenshots, 12 DOM snapshots, all support baselines PASS and unchanged |
| Performance | 72/72 first-run cells below 5,000 ms; inherited broad parity and CSS-budget blockers remain |

No manual evidence task was performed and complete WCAG 2.2 AA conformance is not claimed.
