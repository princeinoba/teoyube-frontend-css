# Teoyube formal stabilization toolkit

This Phase 3A toolkit records privacy-safe, owner-confirmed observations of the canonical Next application. It does not change Teoyube behavior, auto-complete stabilization, resolve Phase 2A blockers, or authorize Phase 3B.

## Owner workflow

1. Start canonical Next with `npm start`.
2. Complete a meaningful session that exercises at least one real capability.
3. Keep prayer, journal, testimony, reflection, health, crisis, relationship, and other private content out of the record.
4. Save a schema-shaped safe JSON draft, without `recordHash`, then run `npm run stabilization:record -- --file <path>`.
5. Run `npm run stabilization:status`.
6. If an issue occurred, create or explicitly update it with `npm run stabilization:incident -- --file <path>`.
7. Repeat across at least seven distinct days and ten meaningful owner-confirmed sessions until all required coverage is complete.
8. Do not run Phase 3B until status reports `READY_FOR_CLOSEOUT`; `stabilization:verify` will still report the non-passing `WAITING_OWNER_CLOSEOUT` gate until an owner closeout occurs in a separately authorized Phase 3B.

## Commands

| Command | Safe behavior |
| --- | --- |
| `npm run stabilization:record -- --file <safe-session.json>` | Validates and writes one unique owner-confirmed record; prints only its ignored path and deterministic hash. |
| `npm run stabilization:incident -- --file <safe-incident.json>` | Creates or explicitly updates one incident; never auto-closes it. |
| `npm run stabilization:status` | Reports days, sessions, coverage, incidents, blocker observations, eligibility date, and `WAITING_OWNER` without failing before completion. |
| `npm run stabilization:verify` | Fails closed until all mechanical criteria and the separate owner closeout are satisfied. |
| `npm run stabilization:export` | Writes a local redacted aggregate containing counts, coverage, gate state, and record hashes—not record text. |

Local records are stored only under `.var/stabilization/sessions/` and `.var/stabilization/incidents/`; redacted exports use `.var/stabilization/exports/`. All three locations are Git-ignored, outside `public/`, absent from product bundles, and not sent to telemetry or external services.

See the [stabilization policy](stabilization-policy.md), [privacy policy](privacy-and-redaction-policy.md), [coverage requirements](coverage-requirements.md), [session guide](session-recording-guide.md), and [incident guide](incident-recording-guide.md).
