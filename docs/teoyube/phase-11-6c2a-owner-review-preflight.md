# Phase 11.6C.2A Owner Review Preflight

## Starting state

- The Phase 11.6C.1 draft contains 3,974 supported records from 3,975 protected source files.
- The protected source is 106,288,074,235 bytes. `originals/` remains immutable.
- The C.1 review page could filter records and export two in-memory fields, but it could not play masters, probe metadata, capture frames, resolve duplicate groups, curate sequences, or enforce a pilot gate.
- Technical duration, dimensions, orientation, codecs, bitrate, frame rate, rotation, and audio state were unknown because FFprobe and FFmpeg are unavailable.
- There are 98 exact duplicate groups, seven probable sequence groups, zero confirmed Scripture mappings, and zero runtime records.

## C.2A requirements and risks

Protected playback must resolve a known manifest ID, enforce loopback plus QA mode, contain the target under `media-source/teoyubeworld/originals/`, support byte ranges, and never reveal a filesystem path. Owner edits must be checksum-bound patches, not changes to the scan manifest. Scripture hints cannot become confirmed without owner action. Duplicate decisions cannot delete or move files. Sequence order cannot be inferred from timestamps. Pilot selection must remain blocked until 12-30 shorts, at most two long forms, one confirmed sequence, confirmed Scripture, safety, copyright, review, and duplicate decisions are present.

## Work completed

C.2A adds secure ID playback, browser metadata probing, manual frame capture, a three-rail owner workspace, local metadata selectors, batch preview and undo, five review patch types, duplicate and sequence staging, pilot planning, derivative dry-run planning, QA sequence playback, runtime-gated media-card helpers, HTTP smoke coverage, and owner handoff documentation. No owner approval was inferred.
