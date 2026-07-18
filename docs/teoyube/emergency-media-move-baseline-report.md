# Emergency Media Move Baseline Report

## Status

**Blocked before copy.** No media was copied, moved, renamed, transcoded, or deleted during Emergency Recovery 2.

Recorded: 2026-07-15 (America/Toronto)

## Audited Source Identity

- Project root: `C:\Users\royce\Downloads\TeoyubePrompt\Teoyube Phase 1`
- Audited source relative path: `media-source/teoyubeworld/originals`
- Previously audited file count: 3,975
- Previously audited bytes: 106,288,074,235 (98.99 GiB)
- Previously audited metadata digest: `a97d30a0db75ad3ab8f8f072e861477df4491120b15a98f09d31341c052139da`
- Required destination free capacity with 15% margin: 122,231,285,371 bytes (113.84 GiB)

## Current Source Verification

- `media-source/teoyubeworld/originals`: **missing**
- `media-source`: **missing**
- Source resolved inside project: not possible
- Source file count verification: not possible
- Source byte verification: not possible
- Reparse-point/junction verification: not possible
- Pre-move integrity manifest created: no; creating one without the protected source would be invalid

The project currently measures 960,777,291 bytes (about 0.89 GiB) across 6,380 files. This indicates the large source tree is no longer in the active project, but it does not prove where it was moved or whether a complete verified copy exists.

## Destination Verification

Preferred destination: `D:\TeoyubeWorld-Media-Library`

- D: available: **no**
- Destination exists: no
- Destination writable: not tested because the drive does not exist
- Destination outside project/public/generated: not verifiable
- Capacity gate: failed

Ready filesystem volumes detected:

| Drive | Filesystem | Free space | Total size | Decision |
| --- | --- | ---: | ---: | --- |
| C: | NTFS | 194,201,550,848 bytes (180.86 GiB) | 510,793,871,360 bytes (475.71 GiB) | Not selected; owner has not accepted same-drive storage |

## Gate Decision

Robocopy was not started. Destination manifests, copy logs, configuration changes, source deletion, and cache deletion were not performed.

Two blockers must be resolved:

1. Provide or locate the complete protected master library that matches the audited 3,975-file, 106,288,074,235-byte source and metadata digest.
2. Provide a destination outside C: with at least 122,231,285,371 bytes free, or explicitly accept a named C: destination with the understanding that it will reduce project size but will not recover C: disk space.

After both values are supplied, rerun the baseline, create a complete integrity manifest, copy with resumable semantics, verify every relative path/size/checksum, activate owner-only local configuration, and test both runtimes before considering deletion of any source copy.

