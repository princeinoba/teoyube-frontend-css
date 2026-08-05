# Phase 5B manual accessibility evidence plan

Status: **PENDING OWNER DECISIONS**. Unavailable environments remain **NOT TESTED**. No private user content is permitted.

## A11Y-MANUAL-001 - Complex-background and forced-colors contrast review

- Related issues: A11Y-009
- Platform: Windows 11; exact build recorded at execution
- Browser: Edge and Chrome; exact versions recorded
- Assistive technology: Windows Forced Colors plus a calibrated contrast-measurement tool
- Version rule: No version was available or claimed in Phase 5B; the runner must record exact installed versions before testing.
- Routes: /, /search, /canon, /promise-table, /calling-compass, /book, /lexicon, /testimony, /teo-guide, /embedded-videos, /tables, /prayer, /journey, /journal, /settings, /privacy, /consent, /terms, /profile, /personalization, /daily-word, /explore, /promise-search
- States: default, hover, focus, selected, disabled, expanded, forced-colors
- Script: Measure representative text, icons, focus indicators, boundaries, and controls over imagery/gradients at all six viewports; record foreground/background samples and ratios.
- Expected result: Every tested control/content path satisfies the related WCAG criteria with no fabricated or inferred result; unavailable coverage remains NOT TESTED.
- Safe evidence fields: task ID; issue IDs; date/time; tester role; OS/device/browser/AT versions; route; state; viewport; selector or public control label; expected result; observed result; PASS/FAIL/NOT_TESTED; sanitized note; evidence hash
- Prohibited content: participant identity; email/account identifiers; private prayer, journal, testimony, health, trauma, abuse, relationship, crisis, or memory content; credentials or tokens; personal filenames; recordings without separate consent
- Pass/fail: PASS only when the exact environment was used and every scripted result is observed; FAIL on any criterion violation; NOT_TESTED when the environment or result is unavailable.
- Who may run: The owner or an owner-appointed trained accessibility tester using synthetic scenarios only.
- Product source before completion: Issue-specific approved fixes may proceed, but this task must be rerun against the final candidate and remains required before any WCAG conformance claim.
- Blocks: Blocks WCAG conformance and Phase 5 closeout; it does not automatically block unrelated, already approved fixes.
- Task hash: `fccac54b66ccb80145cdbbaed860392a218dc860d874c8c5743c17fc9745de02`
- Owner decision: **PENDING**
- Recommendation: **APPROVE_MANUAL_EVIDENCE_TASK**

## A11Y-MANUAL-002 - Keyboard focus visibility and obscuration review

- Related issues: A11Y-010
- Platform: Windows 11 and one physical small-screen device; exact versions recorded
- Browser: Edge, Chrome, and Firefox; exact versions recorded
- Assistive technology: Keyboard only; screen magnifier optional and version recorded
- Version rule: No version was available or claimed in Phase 5B; the runner must record exact installed versions before testing.
- Routes: /, /search, /canon, /promise-table, /calling-compass, /book, /lexicon, /testimony, /teo-guide, /embedded-videos, /tables, /prayer, /journey, /journal, /settings, /privacy, /consent, /terms, /profile, /personalization, /daily-word, /explore, /promise-search
- States: default, carousel-advanced, drawer-open, modal-open, validation-error
- Script: Traverse forward and backward without a pointer; record every focused selector, visible indicator, scroll position, and whether sticky/overlay content entirely obscures it.
- Expected result: Every tested control/content path satisfies the related WCAG criteria with no fabricated or inferred result; unavailable coverage remains NOT TESTED.
- Safe evidence fields: task ID; issue IDs; date/time; tester role; OS/device/browser/AT versions; route; state; viewport; selector or public control label; expected result; observed result; PASS/FAIL/NOT_TESTED; sanitized note; evidence hash
- Prohibited content: participant identity; email/account identifiers; private prayer, journal, testimony, health, trauma, abuse, relationship, crisis, or memory content; credentials or tokens; personal filenames; recordings without separate consent
- Pass/fail: PASS only when the exact environment was used and every scripted result is observed; FAIL on any criterion violation; NOT_TESTED when the environment or result is unavailable.
- Who may run: The owner or an owner-appointed trained accessibility tester using synthetic scenarios only.
- Product source before completion: Issue-specific approved fixes may proceed, but this task must be rerun against the final candidate and remains required before any WCAG conformance claim.
- Blocks: Blocks WCAG conformance and Phase 5 closeout; it does not automatically block unrelated, already approved fixes.
- Task hash: `186d9c8fd501df3ebf16852e5299f96b4e1d6b1f7148369347d4f2b6d419b369`
- Owner decision: **PENDING**
- Recommendation: **APPROVE_MANUAL_EVIDENCE_TASK**

## A11Y-MANUAL-003 - NVDA and Chrome media/control announcement review

- Related issues: A11Y-003, A11Y-011
- Platform: Windows 11; exact build recorded
- Browser: Chrome current stable; exact version recorded
- Assistive technology: NVDA installed by tester; exact version recorded
- Version rule: No version was available or claimed in Phase 5B; the runner must record exact installed versions before testing.
- Routes: /, /canon, /promise-table, /calling-compass, /embedded-videos, /tables
- States: media-selected, playback-started, playback-error, status-announced
- Script: Navigate and activate every representative media control with keyboard commands; record name, role, state, focus order, status announcement, and whether control purpose is distinguishable.
- Expected result: Every tested control/content path satisfies the related WCAG criteria with no fabricated or inferred result; unavailable coverage remains NOT TESTED.
- Safe evidence fields: task ID; issue IDs; date/time; tester role; OS/device/browser/AT versions; route; state; viewport; selector or public control label; expected result; observed result; PASS/FAIL/NOT_TESTED; sanitized note; evidence hash
- Prohibited content: participant identity; email/account identifiers; private prayer, journal, testimony, health, trauma, abuse, relationship, crisis, or memory content; credentials or tokens; personal filenames; recordings without separate consent
- Pass/fail: PASS only when the exact environment was used and every scripted result is observed; FAIL on any criterion violation; NOT_TESTED when the environment or result is unavailable.
- Who may run: The owner or an owner-appointed trained accessibility tester using synthetic scenarios only.
- Product source before completion: Issue-specific approved fixes may proceed, but this task must be rerun against the final candidate and remains required before any WCAG conformance claim.
- Blocks: Blocks WCAG conformance and Phase 5 closeout; it does not automatically block unrelated, already approved fixes.
- Task hash: `84b99d36942904896986cf7eefb6ad909a715f55c1c89de0d202f0c8a7992c08`
- Owner decision: **PENDING**
- Recommendation: **APPROVE_MANUAL_EVIDENCE_TASK**

## A11Y-MANUAL-004 - NVDA and Firefox media/control announcement review

- Related issues: A11Y-003, A11Y-011
- Platform: Windows 11; exact build recorded
- Browser: Firefox current stable; exact version recorded
- Assistive technology: NVDA installed by tester; exact version recorded
- Version rule: No version was available or claimed in Phase 5B; the runner must record exact installed versions before testing.
- Routes: /, /canon, /promise-table, /calling-compass, /embedded-videos, /tables
- States: media-selected, playback-started, playback-error, status-announced
- Script: Repeat the media/control script in Firefox and record browser-specific differences without inferring equivalence from Chrome.
- Expected result: Every tested control/content path satisfies the related WCAG criteria with no fabricated or inferred result; unavailable coverage remains NOT TESTED.
- Safe evidence fields: task ID; issue IDs; date/time; tester role; OS/device/browser/AT versions; route; state; viewport; selector or public control label; expected result; observed result; PASS/FAIL/NOT_TESTED; sanitized note; evidence hash
- Prohibited content: participant identity; email/account identifiers; private prayer, journal, testimony, health, trauma, abuse, relationship, crisis, or memory content; credentials or tokens; personal filenames; recordings without separate consent
- Pass/fail: PASS only when the exact environment was used and every scripted result is observed; FAIL on any criterion violation; NOT_TESTED when the environment or result is unavailable.
- Who may run: The owner or an owner-appointed trained accessibility tester using synthetic scenarios only.
- Product source before completion: Issue-specific approved fixes may proceed, but this task must be rerun against the final candidate and remains required before any WCAG conformance claim.
- Blocks: Blocks WCAG conformance and Phase 5 closeout; it does not automatically block unrelated, already approved fixes.
- Task hash: `d954af1031f13887ea94aad68921e447615af9ab2d9aa8cc06b8a511e38fbff6`
- Owner decision: **PENDING**
- Recommendation: **APPROVE_MANUAL_EVIDENCE_TASK**

## A11Y-MANUAL-005 - Narrator and Edge media/control announcement review

- Related issues: A11Y-003, A11Y-011
- Platform: Windows 11; exact build recorded
- Browser: Edge current stable; exact version recorded
- Assistive technology: Windows Narrator; exact OS-provided version recorded
- Version rule: No version was available or claimed in Phase 5B; the runner must record exact installed versions before testing.
- Routes: /, /canon, /promise-table, /calling-compass, /embedded-videos, /tables
- States: media-selected, playback-started, playback-error, status-announced
- Script: Repeat the media/control script with scan and keyboard modes; record spoken names/roles/states and live-status behavior.
- Expected result: Every tested control/content path satisfies the related WCAG criteria with no fabricated or inferred result; unavailable coverage remains NOT TESTED.
- Safe evidence fields: task ID; issue IDs; date/time; tester role; OS/device/browser/AT versions; route; state; viewport; selector or public control label; expected result; observed result; PASS/FAIL/NOT_TESTED; sanitized note; evidence hash
- Prohibited content: participant identity; email/account identifiers; private prayer, journal, testimony, health, trauma, abuse, relationship, crisis, or memory content; credentials or tokens; personal filenames; recordings without separate consent
- Pass/fail: PASS only when the exact environment was used and every scripted result is observed; FAIL on any criterion violation; NOT_TESTED when the environment or result is unavailable.
- Who may run: The owner or an owner-appointed trained accessibility tester using synthetic scenarios only.
- Product source before completion: Issue-specific approved fixes may proceed, but this task must be rerun against the final candidate and remains required before any WCAG conformance claim.
- Blocks: Blocks WCAG conformance and Phase 5 closeout; it does not automatically block unrelated, already approved fixes.
- Task hash: `6e075829daaa6400a2c35e92838ef5d6658197e4466219709f4c8171beff5fe0`
- Owner decision: **PENDING**
- Recommendation: **APPROVE_MANUAL_EVIDENCE_TASK**

## A11Y-MANUAL-006 - VoiceOver and macOS Safari media/control review

- Related issues: A11Y-003, A11Y-011
- Platform: macOS physical device; exact version recorded
- Browser: Safari current stable for installed macOS; exact version recorded
- Assistive technology: VoiceOver; exact OS-provided version recorded
- Version rule: No version was available or claimed in Phase 5B; the runner must record exact installed versions before testing.
- Routes: /, /canon, /promise-table, /calling-compass, /embedded-videos, /tables
- States: media-selected, playback-started, playback-error, status-announced
- Script: Use VoiceOver navigation and keyboard activation; record discoverability, names, states, order, player entry/exit, and announcements.
- Expected result: Every tested control/content path satisfies the related WCAG criteria with no fabricated or inferred result; unavailable coverage remains NOT TESTED.
- Safe evidence fields: task ID; issue IDs; date/time; tester role; OS/device/browser/AT versions; route; state; viewport; selector or public control label; expected result; observed result; PASS/FAIL/NOT_TESTED; sanitized note; evidence hash
- Prohibited content: participant identity; email/account identifiers; private prayer, journal, testimony, health, trauma, abuse, relationship, crisis, or memory content; credentials or tokens; personal filenames; recordings without separate consent
- Pass/fail: PASS only when the exact environment was used and every scripted result is observed; FAIL on any criterion violation; NOT_TESTED when the environment or result is unavailable.
- Who may run: The owner or an owner-appointed trained accessibility tester using synthetic scenarios only.
- Product source before completion: Issue-specific approved fixes may proceed, but this task must be rerun against the final candidate and remains required before any WCAG conformance claim.
- Blocks: Blocks WCAG conformance and Phase 5 closeout; it does not automatically block unrelated, already approved fixes.
- Task hash: `bf703879160f666fdda3addf2baa9216e011ddd828711e193b695d3e8df6dffc`
- Owner decision: **PENDING**
- Recommendation: **APPROVE_MANUAL_EVIDENCE_TASK**

## A11Y-MANUAL-007 - VoiceOver and iOS Safari touch media review

- Related issues: A11Y-011
- Platform: Physical iPhone or iPad; exact model and iOS version recorded
- Browser: iOS Safari; exact version recorded
- Assistive technology: VoiceOver; exact OS-provided version recorded
- Version rule: No version was available or claimed in Phase 5B; the runner must record exact installed versions before testing.
- Routes: /, /canon, /promise-table, /calling-compass, /embedded-videos, /tables
- States: media-selected, playback-started, orientation-change, player-dismissed
- Script: Explore by touch and swipe; activate each representative player, verify focus returns predictably, and record captions/alternative access without account data.
- Expected result: Every tested control/content path satisfies the related WCAG criteria with no fabricated or inferred result; unavailable coverage remains NOT TESTED.
- Safe evidence fields: task ID; issue IDs; date/time; tester role; OS/device/browser/AT versions; route; state; viewport; selector or public control label; expected result; observed result; PASS/FAIL/NOT_TESTED; sanitized note; evidence hash
- Prohibited content: participant identity; email/account identifiers; private prayer, journal, testimony, health, trauma, abuse, relationship, crisis, or memory content; credentials or tokens; personal filenames; recordings without separate consent
- Pass/fail: PASS only when the exact environment was used and every scripted result is observed; FAIL on any criterion violation; NOT_TESTED when the environment or result is unavailable.
- Who may run: The owner or an owner-appointed trained accessibility tester using synthetic scenarios only.
- Product source before completion: Issue-specific approved fixes may proceed, but this task must be rerun against the final candidate and remains required before any WCAG conformance claim.
- Blocks: Blocks WCAG conformance and Phase 5 closeout; it does not automatically block unrelated, already approved fixes.
- Task hash: `82e0f445aa551b0f54c6a0a4ec77af8eea053c82d94d396f76cf4ec56ebc09ae`
- Owner decision: **PENDING**
- Recommendation: **APPROVE_MANUAL_EVIDENCE_TASK**

## A11Y-MANUAL-008 - TalkBack and Android Chrome touch media review

- Related issues: A11Y-011
- Platform: Physical Android device; exact model and Android version recorded
- Browser: Android Chrome current stable; exact version recorded
- Assistive technology: TalkBack; exact version recorded
- Version rule: No version was available or claimed in Phase 5B; the runner must record exact installed versions before testing.
- Routes: /, /canon, /promise-table, /calling-compass, /embedded-videos, /tables
- States: media-selected, playback-started, orientation-change, player-dismissed
- Script: Explore by touch and swipe; activate each representative player, verify focus return and announcements, and record exact failures.
- Expected result: Every tested control/content path satisfies the related WCAG criteria with no fabricated or inferred result; unavailable coverage remains NOT TESTED.
- Safe evidence fields: task ID; issue IDs; date/time; tester role; OS/device/browser/AT versions; route; state; viewport; selector or public control label; expected result; observed result; PASS/FAIL/NOT_TESTED; sanitized note; evidence hash
- Prohibited content: participant identity; email/account identifiers; private prayer, journal, testimony, health, trauma, abuse, relationship, crisis, or memory content; credentials or tokens; personal filenames; recordings without separate consent
- Pass/fail: PASS only when the exact environment was used and every scripted result is observed; FAIL on any criterion violation; NOT_TESTED when the environment or result is unavailable.
- Who may run: The owner or an owner-appointed trained accessibility tester using synthetic scenarios only.
- Product source before completion: Issue-specific approved fixes may proceed, but this task must be rerun against the final candidate and remains required before any WCAG conformance claim.
- Blocks: Blocks WCAG conformance and Phase 5 closeout; it does not automatically block unrelated, already approved fixes.
- Task hash: `f28f0723e2dfb549ae45d8ba1b1e79ac98b82a70471659d42086dc5714bfd2bd`
- Owner decision: **PENDING**
- Recommendation: **APPROVE_MANUAL_EVIDENCE_TASK**

## A11Y-MANUAL-009 - Exact media-alternatives inventory

- Related issues: A11Y-011
- Platform: Any owner-approved test workstation; exact OS recorded
- Browser: A supported browser; exact version recorded
- Assistive technology: Human media accessibility reviewer
- Version rule: No version was available or claimed in Phase 5B; the runner must record exact installed versions before testing.
- Routes: /, /canon, /promise-table, /calling-compass, /embedded-videos, /tables
- States: each exact mapped video, captions-on, captions-off, transcript-or-alternative-open
- Script: For every exact video mapping, verify prerecorded captions, transcript/media alternative, audio-description need and provision, keyboard player controls, language, synchronization, and failure fallback.
- Expected result: Every tested control/content path satisfies the related WCAG criteria with no fabricated or inferred result; unavailable coverage remains NOT TESTED.
- Safe evidence fields: task ID; issue IDs; date/time; tester role; OS/device/browser/AT versions; route; state; viewport; selector or public control label; expected result; observed result; PASS/FAIL/NOT_TESTED; sanitized note; evidence hash
- Prohibited content: participant identity; email/account identifiers; private prayer, journal, testimony, health, trauma, abuse, relationship, crisis, or memory content; credentials or tokens; personal filenames; recordings without separate consent
- Pass/fail: PASS only when the exact environment was used and every scripted result is observed; FAIL on any criterion violation; NOT_TESTED when the environment or result is unavailable.
- Who may run: The owner or an owner-appointed trained accessibility tester using synthetic scenarios only.
- Product source before completion: Issue-specific approved fixes may proceed, but this task must be rerun against the final candidate and remains required before any WCAG conformance claim.
- Blocks: Blocks WCAG conformance and Phase 5 closeout; it does not automatically block unrelated, already approved fixes.
- Task hash: `2dcafdae7e38febdd9f684933aed20e28ea897f9eb5299e93e4bbc729a1c5533`
- Owner decision: **PENDING**
- Recommendation: **APPROVE_MANUAL_EVIDENCE_TASK**
