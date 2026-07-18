# Phase 11.6C.2A.4 Blocker Deduplication Report

## Canonical Model

The owner gate now separates unresolved requirements from their UI representations:

- `calculateCanonicalPilotRequirements()` creates one requirement per unresolved fact.
- `applyOwnerAttestationToRequirements()` satisfies only matching selected-record requirements when the checksum-bound pilot attestation is valid.
- `calculateDeduplicatedPilotBlockers()` emits one stable `requirement:<id>` blocker per unresolved requirement.
- `getCanonicalPilotGateResult()` produces the authoritative gate result.

Unselected records, unrelated duplicate groups, unrelated sequences, failed premature authorization audit events, and the not-yet-created approval artifact do not inflate the owner gate.

## Result

- Historical UI-reconciled blocker count: 77
- Deduplicated unresolved requirements at the recovery freeze: 29
- Blockers after attestation and persisted patch validation: 0
- Technical blockers: 0
- Metadata blockers: 0
- Scripture blockers: 0
- Rights blockers: 0
- Safety blockers: 0
- Sequence blockers: 0
- Checksum/source blockers: 0

The canonical count remains deterministic at zero for revision `pilot-r120-583481b46fb0`.

