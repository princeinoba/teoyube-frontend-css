# Phase 11.5 Personalization Browser QA Checklist

1. Open app at `http://localhost:4173/?qa=1`.
2. Open Personalization Center from the sidebar/profile card.
3. Confirm personalization is off by default.
4. Enable session-only personalization.
5. Generate Today's Journey.
6. Save Scripture from a feedback control.
7. Save Word from a feedback control.
8. Click More like this.
9. Click Less like this.
10. Open right insight rail and verify preference hints.
11. Run baseline vs personalized preview.
12. Confirm Scripture anchor remains visible.
13. Reset preferences.
14. Export personalization data.
15. Confirm raw text is not exported.
16. Delete session data.
17. Disable personalization.
18. Confirm app returns to Standard Scripture Path.
19. Test mobile personalization panel.
20. Test keyboard accessibility, including Control/Command K and Escape.

Expected result: all steps complete without external services, browser persistence, analytics, live AI, database persistence, hidden memory, or raw private text export.
