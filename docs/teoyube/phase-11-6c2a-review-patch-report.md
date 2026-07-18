# Phase 11.6C.2A Review Patch Report

Five checksum-bound patch files isolate browser technical metadata, owner metadata, duplicate decisions, sequence curation, and pilot selection. Each patch records schema version, source checksum, generation time, reviewer, operation count, operations, and warnings. Each operation records media ID, changed fields, previous and new values, reason, and timestamp.

The localhost patch endpoint accepts only allowlisted patch types, valid JSON, the exact source checksum, bounded bodies, and no absolute or traversal paths. It creates timestamped backups before replacing an existing generated patch.

`scripts/applyTeoyubeWorldReviewPatches.cjs` validates IDs and fields, rejects unsafe text and paths, and defaults to dry-run. `--write` refuses an empty or invalid review set and can write only the generated reviewed manifest. It never writes the runtime manifest.
