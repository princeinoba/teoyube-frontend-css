# Local runtime cutover

## Scope

This procedure implements only owner decision
`TEOYUBE-OWNER-RUNTIME-CUTOVER-LOCAL-2026-07-24`. It changes the
repository/local command contract. It does not deploy Teoyube.

## Preconditions

1. Confirm branch `recovery/visual-source-of-truth` and a clean reviewed
   descendant of the authorized starting commit.
2. Confirm Node `v24.18.0` and npm `10.2.4`.
3. Run `npm run recovery:verify` and
   `npm run safety:gate:orchestration`.
4. Confirm all checked-in external feature defaults are false.
5. Confirm no required test listener is active.
6. Confirm the annotated pre-cutover tag and pre-cutover manifest exist.

## Build and verification

```powershell
$Npm = "C:\Program Files\nodejs\npm.cmd"
& $Npm run app:build
& $Npm run runtime:verify
& $Npm run runtime:dual:verify
& $Npm run test:e2e
```

`runtime:dual:verify` starts the Next candidate, stops it, starts the original
static runtime, stops it, and starts Next again. It uses dedicated local ports,
checks the retained routes and compatibility contracts, and verifies that it
released its listeners.

## Safe status

`npm run runtime:status` reports only safe metadata: runtime identities, owner
decision ID, build readiness and ID, gate status, deployment scope, rollback
command, and checked-in feature defaults. It never reports secrets, database
URLs, account data, or private provider errors.

## Kill switches

```text
TEOYUBE_LIVE_AI_ENABLED=false
TEOYUBE_VECTOR_RETRIEVAL_ENABLED=false
```

These checked-in defaults remain false. Deterministic Teo Guide, exact/lexical
Scripture retrieval, and TIG continue to work without external services.

## Production boundary

Gate C-Production remains closed. No public runtime, domain, TLS, DNS, or
hosting endpoint is created by this procedure.
