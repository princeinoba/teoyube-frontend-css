# Phase 11.7 Export Center Hardening Report

The Safe Export Center is now a Beta Export Center backed by `buildTeoyubeExportBundle()`.

## Export Formats

- Safe JSON backup bundle.
- Safe Markdown summary.
- Journey memory JSON through the structured bundle.
- Book Markdown through the summary output.
- Promise Table JSON through the structured bundle.
- Testimony Archive JSON through the structured bundle.
- Personalization Signals JSON through structured signal sections.
- Roadmap Snapshot Markdown through the summary output.

## Bundle Metadata

Every JSON bundle includes:

- `schemaVersion`
- `generatedAt`
- `appPhase`
- `primaryRuntime`
- local-only notice
- data mode
- included sections
- redaction mode
- record counts
- warnings
- no external upload notice

## Export Controls

The UI includes options for structured personalization signals, journey memory, excluding private reflections, Markdown summary, JSON backup bundle, explicit full personal export review, and raw text inclusion only after confirmation.

Downloads use Blob/object URL/revoke behavior and do not upload data.
