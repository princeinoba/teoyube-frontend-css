# Phase 11.6B.1 Manual Browser QA Results

Status: passed with two documented browser-tool limitations and non-blocking legacy touch-target warnings.

## Real browser checks passed

- Normal mouse activation opened the Promise Add dialog and focused a valid field.
- Mouse submission created `Browser QA Promise Alpha` with `Philippians 4:6-7`.
- Keyboard Enter submission created `Browser QA Promise Beta` with `James 1:5`.
- A duplicate Beta submission was rejected; the row count remained one and the reason stayed visible.
- Promise status updated to Acting. Save to Book created the expected Book entry.
- Undo restored the prior promise status through the command palette.
- Recent Actions rendered sanitized action summaries; generic history contained no raw journal or testimony text.
- Smart Collections added and removed the current promise from Saved for Prayer.
- Search Everything grouped results for `Ephesians 1:18`, `TIDUILOVP`, `Calling & Purpose`, and `journey`.
- Media-filtered search returned zero safely and reported `Media records: 0`.
- Media Readiness reported sample-only manifest data, two sample records, and zero actual imported records.
- The in-browser Phase 11.6B.1 runner passed 10 checks.
- The combined regression runner passed 24 checks covering Today, Search, Calling Compass, Teo Guide, Graph, Book/Journal, Testimony, Lexicon, Promise Table, personalization boundaries, and guardrails.
- Lexicon study completion retained its Scripture anchor.

## Constrained preview checks passed

- Responsive QA Lab opened a same-origin 390px preview with recursion protection.
- Diagnostics reported no horizontal overflow, sidebar drawer/off-canvas state, collapsed right rail, and no open modal before the test.
- Promise Add opened inside the 390px preview.
- `390px QA Promise` with `Psalm 119:105` submitted successfully and the dialog closed.
- Diagnostics honestly reported 112 undersized legacy touch targets. These warnings are visible for future polish and did not block the tested Promise workflow.

## Tool-limited checks

- On the very long Book page, the browser backend timed out while targeting the TeoyubeWorld collection tab. The implementation and smoke checks verify its required empty text: `No TeoyubeWorld media has been imported yet.` No media record was shown.
- The backend also timed out while targeting Continue Journey on the long Today page. The continuation panel, populated state, buttons, and structured in-browser continuation check all passed, but this one click was not independently completed.

These are browser-automation targeting limits on long rendered pages, not concealed product failures. The app remains session-only and no external service, persistence, analytics, live AI, upload, or actual media ingestion was exercised.
