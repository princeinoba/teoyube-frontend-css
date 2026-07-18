# Phase 11.7 Data Safety Classification

Phase 11.7 adds `classifyTeoyubeRecord`, `sanitizeTeoyubeRecordForExport`, and `sanitizeTeoyubeRecordForVault` to separate static/devotional data from user-authored or personalization-derived data.

| Classification | Examples | Default treatment |
| --- | --- | --- |
| Public static | Scripture anchors, promise cluster labels, Teoyube word names | Export structured fields. |
| User-controlled session | Promise Table rows, journey memory, completed actions | Export structured fields and metadata. |
| Sensitive user-authored | Book reflections, testimony body, journal text, prayer/challenge text | Redact raw text unless explicit full personal export review is enabled. |
| Derived structured signal | Preference hints, feedback signals | Export structured signal labels and explanations, not raw private text. |

## Safety Rules Preserved

- Scripture anchors stay visible where available.
- Raw journal/testimony/reflection/prayer text is redacted by default.
- Optional local vault records use sanitized in-memory preview records only.
- No browser persistence API, database client, analytics call, external upload, or live AI call was added.
- No testimony is automatically marked fulfilled or shared.

## Follow-Up For Phase 11.8

Manual browser QA should confirm the redaction labels are understandable to beta testers and that private/draft testimony records remain safe in every export path.
