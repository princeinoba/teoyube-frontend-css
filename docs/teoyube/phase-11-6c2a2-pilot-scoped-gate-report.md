# Phase 11.6C.2A.2 Pilot-Scoped Gate Report

Date: 2026-07-13

## Scope

The gate merges checksum-bound technical, owner, duplicate, sequence, and pilot patches, then validates only records with `pilotSelected: true`. Duplicate checks compare selected records only. Sequence checks evaluate only the one owner-approved sequence among selected records. Source existence and SHA-256 checks run only for selected records.

Unrelated library records, unselected long-form records, unrelated duplicate groups, unrelated sequence candidates, and missing metadata outside the pilot do not add blockers. `scripts/phase116c2a2GateSmoke.cjs` proves this with a valid 12-record fixture plus an unrelated blocked, unsafe, unsupported long-form record.

## First-pilot contract

- Exactly 12 selected shorts.
- Exactly zero selected long-form records.
- Exactly one owner-confirmed sequence.
- Contiguous unique sequence order beginning at one.
- A checksum-bound owner metadata operation for each selected record.
- Confirmed title, description, media kind, Scripture fields, source channel, rights, safety, owner review, and technical metadata.
- Confirmed rights, Scripture/sequence, and safety declarations with timestamps.
- Existing source file and unchanged SHA-256 for every selected record.
- No absolute path in app-facing metadata.

## Current result

The gate is `blocked` with 88 blockers. Twelve records are technically prepared, but owner record review, sequence confirmation, Scripture confirmation, rights, safety, and the three declarations remain intentionally incomplete. Approval markup is absent, and a direct approval POST returns HTTP 409 with structured blockers.

