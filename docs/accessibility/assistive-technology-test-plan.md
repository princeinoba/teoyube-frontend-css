# Assistive-technology test plan

## Required matrix

| Platform | Browser | Assistive technology/input | Priority scenarios |
| --- | --- | --- | --- |
| Windows 11 | Chrome and Edge | Narrator; NVDA when installed; keyboard; 200% zoom; Windows High Contrast | Shell/navigation, Today carousel, Canon media, Search, Promise Search, forms, dialogs, status messages |
| macOS | Safari | VoiceOver; keyboard; zoom | Reading order, rotor landmarks/headings, forms, dialogs, media labels |
| iOS | Safari | VoiceOver; touch exploration; dynamic text | Mobile navigation, carousels, search, consent, reversible actions |
| Android | Chrome | TalkBack; switch access where available; font scaling | Mobile navigation, media grids, tables, form errors |
| Windows/macOS | Supported browser | Screen magnifier; speech input; switch control | focus obscuration, label-in-name, target size, reflow |
| Physical tablet/mobile | Native browser | touch, orientation, external keyboard | target size, swipe/drag alternatives, landscape/portrait reflow |

## Scripted task set

1. Reach main content using the skip link.
2. Navigate the sidebar and mobile navigation without pointer input.
3. Change Today carousel slides and verify inactive controls are absent from the AT cursor and tab order.
4. Operate every Canon media item; confirm concise unique names, state announcement, focus order, and return focus.
5. Submit TeoyubeSearch and Promise Search independently; verify result count/status announcements.
6. Operate the Promise Table player, Calling Compass playlist, Embedded Videos tabs, and expanded Tables media rows.
7. Enter synthetic data in Prayer, Journal, Testimony, consent, and settings flows; verify labels, errors, confirmations, and reversibility.
8. Validate headings, landmarks, Teoyube-word/Scripture distinctions, confidence, limitations, and no false divine certainty.
9. Repeat at 200% and 400% zoom where applicable, increased text spacing, forced colors, reduced motion, and mobile font scaling.

Use synthetic content only. Do not enter private prayer, journal, testimony, health, trauma, abuse, relationship, crisis, or memory disclosures. Do not enable live AI or external recording for this audit.

