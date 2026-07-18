# Phase 11.6C.2B.2 Controlled Pilot Publication

## Result

The exact owner response `AUTHORIZE APPROVED PILOT PUBLICATION` authorized and completed the checksum-bound pilot publication.

- Lifecycle: `published`
- Canonical revision: `pilot-r120-583481b46fb0`
- Owner approval checksum: `41856ce2093afb055a2b0253666415b3ade5b3709292d1cf4edeb28db7deb96a`
- Publication plan checksum: `dcef427b416d775e502e866c0388e02aa3b37a838dcf90679c36dde2a285e4c6`
- Publication authorization checksum: `f6fc3bd46eae9bd9d6632481a7700c5bd17cae2320b9e1282ad233943cd7c498`
- Publication receipt checksum: `b1d141499b23ce1b0850c43e19af59e46caf520f369b07deafb01c9aa265e84a`
- Approved records: 12 shorts
- Approved Scripture sequences: 1
- Ordered sequence segments: 12
- Approved long-form records: 0
- Published derivatives: 48
- Published manifests: 1
- Published files: 49
- Published bytes: 12,058,862
- Runtime manifest: `/media/teoyubeworld/pilot-v1/runtime-manifest.json`

## Execution Boundary

Publication used an isolated staging directory and promoted the complete verified directory into `public/media/teoyubeworld/pilot-v1` only after a second gate check. Every staged and public file was checked against the approved byte size and SHA-256 checksum. No existing public file was overwritten or removed.

The publication did not copy source masters, modify source files, regenerate derivatives, invoke FFmpeg, include long-form media, include unapproved records, upload externally, connect services, add analytics, add persistence, add live AI, or add a service worker.

## Manifest Integrity

The public runtime manifest is byte-identical to the manifest preview approved in the 49-file plan. Its preview-origin state fields were not rewritten after authorization because doing so would invalidate the approved checksum. The checksum-bound publication receipt is the authoritative record that the files are published.

## Owner Gate

No publication command, control, shortcut, URL parameter, or client-side bypass was added to the browser. Direct browser authorization and publication requests still return structured `409` responses. The local commands are separately scoped to authorization, execution, and validation.

