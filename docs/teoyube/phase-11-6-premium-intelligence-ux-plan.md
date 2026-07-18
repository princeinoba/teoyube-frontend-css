# Phase 11.6 Premium Intelligence UX Plan

## Current Surfaces
- Today's Journey uses local promise clusters, a Teoyube word, Scripture anchors, prayer, and a daily action.
- TeoyubeSearch, Canon, Promise Table, Calling Compass, Lexicon, Book, Teo Guide, and smart recommendations already expose local Scripture-grounded recommendations.
- Phase 11.5 added optional consent-first personalization preview, feedback controls, baseline comparison, and safe journey memory.

## Existing Explanation Features
- Phase 11.4 and 11.5 show basic explanation paths, confidence/fallback notices, and baseline-vs-preview comparison.
- The right rail shows active context and personalization preview.
- Command palette opens pages, guardrails, export, and personalization actions.

## UX Gaps
- Explanations were split across surfaces and not consistently rich enough for premium trust.
- Users could not inspect the recommendation graph/path in one place.
- Guided promise/prayer/calling workflows were not first-class.
- Teo Guide prompt categories were static and not page-aware.
- Recommendation quality was implied rather than visible.

## Planned Upgrades
- Add advanced collapsible "Why this?" panels to recommendation surfaces.
- Add a local graph/list explorer with path, nodes, relationships, Scripture evidence, and confidence breakdown modes.
- Upgrade the right rail into a Smart Recommendation Rail.
- Add contextual command palette actions.
- Add guided workflows for promise, prayer, calling clarity, growth journey, word study, and testimony.
- Add Teo Guide prompt groups and local response composition.
- Add recommendation quality scoring and smart search suggestions.
- Add a QA/dev Intelligence Health panel.

## Safety Constraints
- Static Node remains the primary runtime.
- No live AI, OpenAI calls, analytics, database persistence, accounts, service workers, payments, or public deployment.
- No browser persistence for sensitive personalization.
- Raw private text is not stored or exported.
- Scripture anchors, confidence labels, fallback notices, consent controls, and guardrails stay visible.
- Calling language remains cautious and never claims divine certainty.

## Success Criteria
- Phase 11.4, 11.5, and 11.6 smoke checks pass.
- Advanced "Why this?" panels, graph/list fallback, Smart Recommendation Rail, guided workflows, contextual commands, Teo Guide local companion, quality score, and search suggestions are visible in the static runtime.
- Mobile users retain readable graph/list and modal workflows.
