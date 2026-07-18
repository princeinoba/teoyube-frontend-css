# Phase 11.6C.2A.2 Duplicate Resolution Report

Date: 2026-07-13

## Pilot result

No selected candidate belongs to an exact SHA-256 duplicate group, so no selected record was excluded. The generated duplicate patch is valid and records that no selected exact duplicate required staging.

The candidate builder scopes duplicate work to groups involving selected records. When an exact group is present, it chooses a canonical record deterministically from the inventory's preferred copy or a stable ID order. It stages `duplicateOf`, `doNotPublish: true`, and `pilotSelected: false` for noncanonical copies without deleting, moving, renaming, or modifying source media.

Probable duplicates are not treated as exact duplicates. The current probable-duplicate report contains no groups. Any future non-byte-identical match involving a selected record remains an owner-review blocker.

The full library's unrelated duplicate groups do not block this pilot.

