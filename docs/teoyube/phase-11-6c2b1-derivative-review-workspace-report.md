# Phase 11.6C.2B.1 Derivative Review Workspace Report

## Result

The owner-only derivative review workspace is available at:

`http://127.0.0.1:4174/media-review.html?qa=1&mode=derivative-review`

It reads only the validated 12-record runtime-manifest preview and derivative-validation artifacts. It does not publish media, expose source masters, or write into `public/media`.

## Review Surface

- 12 approved short records in owner-confirmed Scripture sequence order
- 12 card previews and 12 mobile previews
- 12 poster previews and 12 thumbnail previews
- one active, muted video element
- source-versus-derivative dimensions, duration, byte size, and compression ratio
- output checksum, codec, pixel format, source-integrity status, and per-operation QA
- generated operation log with protected source references only
- explicit publication boundary notice

## Local Access Boundary

- `GET` and `HEAD` are supported for validated derivative IDs and variants.
- MP4 byte ranges return `206 Partial Content` and `Accept-Ranges: bytes`.
- Only validated `card`, `mobile`, `poster`, and `thumbnail` variants resolve.
- Requests for `/media-source` and `/generated` return `404`.
- Directory traversal, directory listing, absolute paths, and arbitrary generated files are not exposed.
- Cache policy is private and no-store for owner review.
- The normal Teoyube app contains no execution, authorization, or publication control.

## Publication Boundary

- Publication authorized: no
- Public files written: 0
- Source masters copied: 0
- Main runtime manifest changed: no
- Lifecycle after publication planning: `publication_plan_ready`

