# Research operator guide

Phase 4B tooling is local, synthetic-only, and absent from normal navigation.

## Commands

```powershell
$Npm = "$env:APPDATA\npm\npm.cmd"
& $Npm run research:study:status
& $Npm run research:verify
```

The following commands exist to lock the future workflow, but in Phase 4B they perform a non-persisting synthetic dry-run only and require explicit confirmation:

```powershell
& $Npm run research:session:prepare -- --confirm-synthetic
& $Npm run research:event:record -- --confirm-synthetic
& $Npm run research:session:complete -- --confirm-synthetic
& $Npm run research:participant:delete -- --confirm-synthetic
& $Npm run research:study:export -- --confirm-synthetic
```

Do not place secrets, contact data, consent signatures, raw spiritual content, or participant identifiers in command arguments. Do not create an actual participant or enable an actual study until Phase 4C is explicitly started by the owner.

`research:verify` fails if the mode is enabled with an unknown study, the checked-in default is not false, the registry is incomplete, local paths are not ignored, a normal research route exists, an external vendor import appears, or a non-synthetic participant directory exists.

The mode status output is aggregate and safe. It never prints the configured study ID, secret, envelope, contact data, or event content.
