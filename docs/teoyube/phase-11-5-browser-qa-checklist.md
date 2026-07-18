# Phase 11.5 Browser QA Checklist

This checklist mirrors the personalization-specific browser QA checklist and is kept as the general Phase 11.5 QA entry.

Required run target: `http://localhost:4173/?qa=1`.

Core checks:

- Personalization Center opens from sidebar/profile card.
- Personalization is off by default.
- Session-only personalization can be enabled.
- Profile Preview personalization can be enabled.
- Personalization can be disabled.
- Preferences can be reset.
- Safe personalization data can be exported.
- Personalization data can be deleted.
- Feedback updates visible preference hints only when consent allows.
- Standard vs Personalized Preview panel works.
- Scripture anchor remains visible.
- Generate Today's Journey can use personalization safely.
- Book of the Saint shows Journey Memory Timeline.
- Right insight rail shows Personalization Preview.
- Mobile dialog layout remains usable.
- Command palette opens personalization actions.

Safety checks:

- No raw private text appears in safe export.
- No external service call is required.
- No analytics, database, live AI, service worker, or browser persistence is used.
