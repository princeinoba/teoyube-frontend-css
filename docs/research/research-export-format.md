# Research export format

Exports use schema `teoyube-research-study-export` version `1.0.0`. They are deterministic for fixed records, cohort, and supplied generation timestamp.

Ordinary and expert cohorts are exported separately. Phase 4B tests use the corresponding synthetic cohorts. Each export contains:

- registry, study, schema, and generation versions;
- one cohort;
- opaque participant IDs with active records only;
- content-free deletion receipts without participant IDs;
- fixed validated records;
- aggregate counts for sessions, tasks, completion without rescue, rescue, misunderstandings, source inspection, doctrinal-boundary comprehension, memory/consent, reject/undo, provider fallback, accessibility barriers, clarity, trust, safe issues, and adverse events.

It excludes contact information, application user IDs, raw content, Scripture text, queries, prompts, model/tool content, recordings, IP/location data, secrets, deleted participant IDs, and any faith/holiness/spiritual aggregate score. Deleting a participant and regenerating the export removes that participant and recalculates every aggregate.
