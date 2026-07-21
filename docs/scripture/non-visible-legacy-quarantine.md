# Non-visible legacy Scripture quarantine

Decision: `TEOYUBE-OWNER-SCRIPTURE-QUOTATION-2026-07-20-P15B`

The bound Prompt 15A inventory contains 20 non-visible `LEGACY_NON_WEB_WORDING` records:

- 15 `clientsPromiseRows` compatibility records remain behind the unconditional return in `renderClientsPromiseTable` and cannot render;
- three unknown-provenance KJV TIG excerpt seeds remain `DISPLAY_BLOCKED_LICENSE_UNKNOWN` and are not exposed as text by canonical TIG DTOs;
- one offline fallback and one dormant historical fallback remain outside canonical Scripture boundaries.

`scripts/recovery/verifyNonVisibleScriptureQuarantine.cjs` hash-binds the inventory, requires each source record and visibility classification, verifies the unconditional render barrier, rejects WEB labels, and scans canonical repository/API/DTO/derived-render boundaries for the legacy strings and forbidden imports.

The five `NOT_SCRIPTURE_QUOTATION` records remain typed `PrayerSequenceNode` content. Their `scriptureAnchor` field is devotional prayer/paraphrase language; `relatedScriptures` are grounding references. They are never exact-quote validated or labeled WEB.

Removal is deferred until no production or compatibility consumer depends on these sources and the applicable parity gates pass. Optional exact-WEB replacement remains a separate owner-reviewed migration.
