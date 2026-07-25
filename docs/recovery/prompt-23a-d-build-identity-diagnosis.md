# Prompt 23A-D build-identity diagnosis

Branch: `recovery/visual-source-of-truth`

Authorized starting commit:
`8039edaf69b5fc5261716c0f784ad99f0d2e6ad0`

## Historical mismatch

Prompt 22 protected the artifact ID `I1g8n9KHFcruCq_ERB1C1`. A later
independent build produced `ScebDgB9WUecs9EA8cic3`, so `runtime:verify`
correctly stopped with `BLOCKED_BUILD_ID_MISMATCH`.

Two clean characterization builds, with no manifest change between them,
produced:

- `tN95MP87UZng8-trvmg12`
- `pkxDK78kvksKZQH5CTaxl`

They differed because `next.config.mjs` had no `generateBuildId` and Next used
its default random production-build identity. Neither random value was
hardcoded or treated as the permanent rebuild identity.

## Deterministic resolution

Next now uses its supported `generateBuildId` option. The ID comes from an
explicit, versioned source manifest and a normalized SHA-256 digest:

- manifest: `config/runtime/runtime-source-manifest.json`
- helper: `scripts/runtime/runtime-source-identity.cjs`
- generator: `teoyube-runtime-source-digest-2026-07-25.1`
- runtime source commit:
  `2f8b55cb904a84ac129a26c9f2f50a6747b44d5e`
- digest:
  `466f4dec9876dbb7d8c6dfd364079014168b5df92fe7e581c36dffbc62d24305`
- build ID: `teoyube-466f4dec9876dbb7d8c6dfd3`

Two clean post-fix builds produced that same ID. Runtime/API/config/package,
lockfile, public-asset, and other classified runtime changes invalidate the
digest. Report, evidence, owner-approval, and inventory-report changes do not.
Missing, duplicate, malformed, stale, unknown, dirty-runtime, and arbitrary
override inputs fail closed.

The Prompt 22 random ID remains valid historical artifact evidence. It is not
the identity of a deterministic rebuild.

## Evidence and protection

All requested pre-change evidence was hashed before implementation. The
historical `prompt-23a-release-lineage-repair-report.*` pattern was absent at
the authorized start and was not fabricated.

Dependencies, lockfile, protected visual source, immutable and owner-approved
baselines, and static rollback files changed: **0**. Paid provider calls:
**0**.

The identity mismatch is resolved, but release readiness is not claimed:
Gate C-Preview remains `BLOCKED_SECURITY_ADVISORY` for nine high
development-only advisories, and Gate C-Production remains `CLOSED`.
