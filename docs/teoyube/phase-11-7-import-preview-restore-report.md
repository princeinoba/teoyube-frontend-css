# Phase 11.7 Import Preview Restore Report

Phase 11.7 adds local JSON import preview and restore helpers:

- `parseImportFileSafely`
- `validateImportSchema`
- `validateTeoyubeImportBundle`
- `sanitizeImportedBundle`
- `summarizeImportPreview`
- `detectImportDuplicates`
- `previewTeoyubeImportBundle`
- `mergeImportedRecords`
- `mergeTeoyubeImportBundle`
- `renderImportPreviewDialog`

## Merge Strategies

| Strategy | Behavior |
| --- | --- |
| Preview only | Parses, validates, sanitizes, counts, and reports warnings without changing state. |
| Merge new only | Adds sanitized incoming records not already present. |
| Replace current session | Replaces current session collections with sanitized imported records. |
| Cancel | Makes no changes. |

## Safety

Imports never contact an external service. Incoming records are sanitized before merge. Unsupported schema versions are blocked. Bundles that claim raw private text receive visible warnings.
