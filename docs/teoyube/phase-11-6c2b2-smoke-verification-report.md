# Phase 11.6C.2B.2 Smoke Verification

`npm run phase116c2b2:smoke` passed all 37 checks.

The complete `npm run check` quality gate also passed with exit code 0 after publication.

Verified:

- publication scripts and server parse
- exact owner authorization phrase and checksum bindings
- 49-file plan, 49-file public tree, and 12,058,862-byte total
- checksum-valid authorization, result, receipt, and validation artifacts
- lifecycle state `published`
- 12 unique runtime records in one ordered Scripture sequence
- source checksums unchanged
- zero source masters copied
- zero source files modified
- zero unapproved files published
- zero FFmpeg commands during publication
- zero external uploads or services
- no browser publication control or bypass
- manifest, poster, and MP4 byte-range routes
- unknown public file rejection
- protected source and generated root rejection
- direct browser authorization and publication rejection

The affected Phase 11.6C.2A.2, 11.6C.2A.3, 11.6C.2A.4, 11.6C.2B, and 11.6C.2B.1 regressions also pass in the valid terminal `published` state. Historical planning checks continue to prove that planning itself creates no media and performs no public write.

Post-check runtime verification returned HTTP 200 for `/media/teoyubeworld/pilot-v1/runtime-manifest.json` with a 28,966-byte response.
