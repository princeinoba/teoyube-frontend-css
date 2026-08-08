# Managed Memory Threat Model

Activation status: **DEFERRED**. Production memory remains disabled.

| Threat | Required control | Current evidence | Production disposition |
| --- | --- | --- | --- |
| Identity spoofing | server-verified identity; reject supplied user IDs | focused E2E passed | provider not approved |
| Cross-user disclosure | tenant-scoped queries and isolation tests | synthetic isolation passed | managed design missing |
| CSRF/forged mutation | origin/CSRF enforcement | focused E2E passed | revalidate in target runtime |
| Privilege escalation | deny client owner claims | focused E2E passed | operator roles undefined |
| Secret/key exposure | server-only keys, encryption, rotation | boundary prepared | production key plan missing |
| Excess retention | explicit purpose, TTL and deletion | contracts prepared | schedule/propagation missing |
| Backup resurrection | deletion carried into backups | none | procedure and test missing |
| Incomplete export/delete | user-visible review, export and erase | local/session controls exist | managed-store proof missing |
| Audit abuse | minimal tamper-evident audit and access review | local evidence only | owner/runbook missing |
| Outage/data loss | backup, restore, recovery objective | none | rehearsal missing |

No missing identity, deletion, encryption, backup or isolation control is marked PASS. Before activation, complete the missing controls in the Production target, run adversarial multi-user tests, rehearse deletion and restore, verify logs contain no private content, and obtain explicit owner approval.
