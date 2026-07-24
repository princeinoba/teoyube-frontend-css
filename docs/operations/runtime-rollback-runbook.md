# Runtime rollback runbook

## Trigger

Use this runbook when the local Next runtime fails to build or start, a retained
route or legacy URL fails, a protected asset or media contract regresses, an
API/security/safety gate fails, or the owner rejects final cutover
confirmation.

## Immediate operational rollback

1. Stop only the owned Next process.
2. Verify the intended static port is unused.
3. Start the protected static runtime:

```powershell
$Npm = "C:\Program Files\nodejs\npm.cmd"
& $Npm run rollback:start
```

4. Open `/index.html` and a representative hash route such as
   `/index.html#canon`.
5. Run `npm run recovery:visual:verify`.

The static runtime is network-independent and does not require `.next`.

## Repository rollback

If the owner rejects the candidate, stop all verification servers and revert
only the candidate cutover commit identified in
`docs/recovery/prompt-22-runtime-cutover-candidate.json`. Do not reset or
rewrite history.

```powershell
git revert <candidate-cutover-commit>
```

Then verify:

```powershell
& $Npm run recovery:verify
& $Npm run safety:gate:orchestration
```

The rejected-candidate evidence remains retained. Protected source, baselines,
owner decisions, capability code, data, corpus, and retrieval artifacts must
not be removed.

## Recovery and verification

After a transient local issue is corrected:

```powershell
& $Npm run app:build
& $Npm run runtime:verify
& $Npm run runtime:dual:verify
```

Do not reopen Gate C-Production or enable external feature flags as part of
rollback recovery.
