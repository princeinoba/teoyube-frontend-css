# Phase 11.6 Why This Reasoning Report

## Added
- `createPhase116WhyThisTrace()` builds a local explanation trace from selected context, intent, need/emotion, word, promise, Scripture, prayer, action, journey, calling, confidence, fallback, personalization preview, and stability notices.
- `renderPhase116WhyThisPanel()` renders a collapsible, readable panel without raw JSON by default.
- QA/dev mode can show a technical trace when `?qa=1` is present.
- `calculatePhase116QualityScore()` and `renderPhase116QualityScore()` show Excellent, Good, Partial, or Needs fallback.

## Surfaces Covered
- Today's Journey and Smart Recommendations through the Phase 11.5 recommendation section.
- TeoyubeSearch result cards.
- Canon detail rail.
- Promise Table feed items.
- Teo Guide responses.
- Lexicon featured word/detail.
- Book memory timeline.
- Smart Recommendation Rail.

## Safety
- The panel does not call external services.
- It does not persist raw user text.
- It keeps Scripture stable and visible.
- Fallback reasons and confidence labels remain visible.
- Personalization is described as optional preview only.

## Limitation
- The graph and reasoning are local structured explanations, not live model reasoning.
