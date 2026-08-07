# A11Y-008 contrast measurements

- Outcome: **BLOCKED_INCONCLUSIVE**
- Applicable cells: **708**
- Not applicable cells: **876**
- Total matrix cells: **1584**
- Passing/failing/unknown: **563/145/7**
- Lowest computed ratio: **6.9851:1**
- Lowest reliable rendered-sample ratio: **5.5411:1**
- Scoped axe failures: **144**
- Harness errors: **0**
- Static: **282/354 pass**
- Next: **281/354 pass**

The complete matrix is inconclusive because forced-colors axe results report the historical authored 1.01:1 pair while computed forced colors are 21:1 and rendered samples are predominantly high contrast; seven rendered samples are unavailable. This conflict is preserved rather than converted into a pass or product failure.

Raw screenshots remain ignored and disposable under .tmp/accessibility/a11y008-retest/screenshots/. Their paths and SHA-256 hashes are recorded in the tracked JSON evidence; no screenshot baseline was written.
