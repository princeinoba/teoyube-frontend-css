# Emergency Workspace Cleanup Plan

Generated: 2026-07-15T03:57:00.055Z

**Dry run only. Cleanup execution is not authorized.**

| Path | Category | Current size | Proposed action | Safety |
| --- | --- | --- | --- | --- |
| media-source/teoyubeworld/originals | protected master media | 98.99 GB | Move to an owner-selected external library on another drive; replace only with ignored local configuration. | owner authorization required; immutable source |
| .next | build cache | 464.65 MB | Remove recreatable Next build/development cache. | safe after exact owner authorization |
| .tmp | temporary project artifacts | 190.98 MB | Remove only reviewed stale handoff and temporary output. | review each child, then exact owner authorization |
| generated/teoyubeworld-media | generated media and owner artifacts | 55.88 MB | Preserve manifests, approval artifacts, checksums, review metadata, derivative plans, and publication receipts; consider only specifically inventoried obsolete previews/contact sheets later. | preserve by default |
| public/media/teoyubeworld/pilot-v1 | published pilot | 11.50 MB | Preserve the approved runtime manifest and 48 derivatives (49 publication files total). | must remain |
| ../.git | Git history | 894.84 MB | Preserve. No clean, reset, gc, filter-repo, or history rewrite is authorized. | must remain |

## Required Verification

- **media-source/teoyubeworld/originals:** Confirm destination free space, copy without transformation, compare file count/size/SHA-256, then obtain separate deletion approval. Rollback: Keep the source copy until every destination checksum and owner spot check passes.
- **.next:** Confirm no active process uses the folder; rerun the relevant build when needed. Rollback: Recreate with the project build command.
- **.tmp:** Confirm artifacts are generated copies and are not the only copy of owner work. Rollback: Recreate from source and scripts where documented.
- **generated/teoyubeworld-media:** Owner-by-owner artifact review; never bulk remove this folder. Rollback: Not applicable until an exact file list is separately approved.
- **public/media/teoyubeworld/pilot-v1:** Validate 49-file publication tree and immutable fingerprint. Rollback: Restore only from the approved publication artifact set.
- **../.git:** No action. Rollback: Not applicable.

## Authorization Gate

No deletion or move may occur until the owner replies with exactly:

`AUTHORIZE TEOYUBE WORKSPACE CLEANUP`
