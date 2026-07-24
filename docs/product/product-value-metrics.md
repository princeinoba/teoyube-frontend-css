# Product-value measurement

Teoyube measures clarity, voluntary action, continuity, trust, safety,
reversibility, and consent-safe movement between modules. It does not optimize
for time in app, streak pressure, compulsive notifications, or spiritual
scoring.

The typed recorder in
`src/domain/product-value/product-value-metrics.ts` requires the separate
`product_value_analytics` purpose consent before recording linked events. The
local summary reports counts only; raw spiritual content is not accepted.

Supported value signals include:

- clarity: source opened, Scripture/interpretation disclosure inspected,
  explanation inspected, limitations viewed, and optional user-reported
  understanding;
- voluntary action: proposed, accepted, edited, rejected, undone, and later
  reflected upon;
- continuity: reflection completed, prior reflection intentionally reused,
  tomorrow context accepted/rejected, and explicit carry-forward;
- trust/reversibility: source inspected, recommendation rejected, undo
  succeeded, memory inspected/deleted, consent revoked, fallback accepted,
  safety feedback, and citation correction report;
- cross-module transitions: Search to Promise Table, Scripture to Prayer,
  Prayer to Calling, Calling to accepted action, Action to Reflection,
  Reflection to testimony candidate, Testimony to Book review, and Today to
  Tomorrow;
- support: an explicit mentor prompt, trusted-person suggestion, or
  professional-support link action without inferring follow-through;
- safety/quality: deterministic fallback, safety/citation/memory/injection
  denial, provider outage, and user-reported unsafe or unhelpful guidance.

Prohibited metrics are enforced in code and tests: holiness/faith/spiritual
rank, guilt streak, divine favor, time-in-app objectives, compulsive
notification loops, hidden engagement profiles, and coercive retention
language.

This is an event schema and deterministic summary, not evidence that users
experienced value.
