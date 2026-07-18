# Phase 11.6B.1 Action Registry Report

`phase116b1.js` provides `registerTeoyubeAction`, `unregisterTeoyubeAction`, `dispatchTeoyubeAction`, `getTeoyubeAction`, `getAvailableTeoyubeActions`, `getTeoyubeActionDisabledReason`, `recordTeoyubeActionOutcome`, and `renderTeoyubeActionStatus`.

Definitions carry ID, label, description, category, shortcut, allowed pages, required state, disabled reason, handler, success/error copy, reversibility, and safety note. The command palette rewires its principal commands to registry IDs and adds Promise Add, Undo, Search Everything, Media Readiness, and Responsive QA Lab.

Migrated controls cover Today's journey/action/reflection, Scripture/word/promise save, Promise Table add and Book save, Calling Compass, journey start, Teo Guide, graph, personalization preview, guardrails, data/export, reset, continuation, collections, media readiness, and QA. Existing handlers remain the fallback for controls not yet migrated.

Action outcomes store bounded, sanitized labels and status only. Raw journal, testimony, prayer, and Promise note text is excluded from generic history.
