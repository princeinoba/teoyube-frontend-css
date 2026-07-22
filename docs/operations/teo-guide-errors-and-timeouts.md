# Teo Guide errors and timeouts

Limits are deterministic and typed:

- input: 8,000 characters;
- conversation: 20 turns;
- tools: at most 5 per ordinary turn;
- tool output: 24,000 characters;
- sources: at most 12;
- orchestration: 10 seconds;
- proposal expiry: 15 minutes;
- conversations: 100 per process.

Oversized input is bounded and disclosed in response limitations. A tool output over its limit becomes a typed safe fallback. Missing authentication, consent, records, Scripture, or datasets becomes a blocked tool or fallback rather than an unexplained failure. Tool exceptions are converted to a controlled failure without returning stack traces or raw input.

The browser aborts the same-origin orchestration request after 10 seconds and uses the existing deterministic local Scripture fallback. It does not retry an external service. The fallback performs no durable write.

Action confirmation uses expected revision and expiry. Missing, replayed, stale, or expired proposals fail closed. Authentication, CSRF, consent, same-user, source, or pre-write failures also fail closed.

Operational response errors use `cache-control: no-store` and safe messages. Secrets, filesystem paths, raw private text, and internal exceptions are not returned.
