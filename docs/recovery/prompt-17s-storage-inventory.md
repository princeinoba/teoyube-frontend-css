# Prompt 17S storage inventory

Measured: 2026-07-22T12:11:07.728Z  
Commit: `ac86a6f83a76a20b58bf01fb7d97928cb0493a7d`  
Workspace: `C:\Users\royce\Downloads\Teoyube-Recovery-Clean-LF`

## Summary

- Workspace total: **5.880 GB** across **39,579 files**.
- Git total: **351.14 MB** across **1,877 files**.
- Tracked files: **3,290**.
- Scan errors: **0**.
- `git clean -ndX` was run in preview-only mode; no broad cleanup command was executed.

## Required path classification

| Path | Size | Files | Status | Class | Deletion authorization | Regeneration | Preservation reason |
|---|---|---|---|---|---|---|---|
| `.git` | 351.14 MB | 1,877 | untracked-or-directory | GIT_STORAGE | git gc only after capacity/fsck gate | `git gc` | Git history, refs, tags, and object database |
| `node_modules` | 457.93 MB | 21,374 | ignored | REPRODUCIBLE_DEPENDENCY | NO wholesale deletion in Prompt 17S cleanup | `npm ci` | Installed dependency graph needed for the audit |
| `.next` | 167.71 MB | 1,688 | ignored | REPRODUCIBLE_BUILD_OUTPUT | YES | `npm run app:build` | Deterministic generated build output |
| `.tmp` | 4.493 GB | 11,346 | ignored | EPHEMERAL_TEST_OUTPUT | YES after compact evidence preservation | `re-run the owning test/audit command` | Disposable candidates, reports, screenshots, and traces outside protected baseline roots |
| `test-results` | 0 B | 0 | ignored | EPHEMERAL_TEST_OUTPUT | YES after compact evidence preservation | `re-run the owning test/audit command` | Disposable candidates, reports, screenshots, and traces outside protected baseline roots |
| `playwright-report` | 524.88 KB | 1 | ignored | EPHEMERAL_TEST_OUTPUT | YES after compact evidence preservation | `re-run the owning test/audit command` | Disposable candidates, reports, screenshots, and traces outside protected baseline roots |
| `coverage` | 0 B | 0 | ignored | EPHEMERAL_TEST_OUTPUT | YES | `npm run test -- --coverage` | Reproducible coverage output |
| `dist` | 0 B | 0 | ignored | REPRODUCIBLE_BUILD_OUTPUT | YES | `npm run app:build` | Deterministic generated build output |
| `out` | 0 B | 0 | ignored | REPRODUCIBLE_BUILD_OUTPUT | YES | `npm run app:build` | Deterministic generated build output |
| `logs` | 0 B | 0 | ignored | EPHEMERAL_LOG | YES | `re-run the owning command` | Reproducible diagnostic logging |
| `owner-input` | 2.77 MB | 1 | untracked-or-directory | OWNER_INPUT | NO | `owner re-supply only` | Owner-provided source archive and decisions |
| `tests/visual/baselines` | 210.33 MB | 779 | untracked-or-directory | IMMUTABLE_BASELINE | NO | `owner-approved baseline workflow only` | Protected baseline and owner-reference evidence |
| `tests/visual/contracts` | 623.51 KB | 5 | untracked-or-directory | PROTECTED_SOURCE | NO | `not regenerated in this task` | Approved visual source, assets, or executable contract |
| `docs/recovery` | 189.84 KB | 27 | untracked-or-directory | TRACKED_DOCUMENTATION | NO | `Git checkout of tracked history` | Recovery evidence and owner approvals must remain tracked |
| `docs/owner-approvals` | 6.39 MB | 30 | untracked-or-directory | TRACKED_DOCUMENTATION | NO | `Git checkout of tracked history` | Recovery evidence and owner approvals must remain tracked |
| `src/server/scripture` | 13.82 MB | 7 | untracked-or-directory | CANONICAL_CORPUS | NO | `verified corpus import only` | Canonical exact WEB retrieval data and server repository |
| `public` | 169.98 MB | 208 | untracked-or-directory | PROTECTED_SOURCE | NO | `not regenerated in this task` | Approved visual source, assets, or executable contract |
| `Asset` | 19.25 MB | 20 | untracked-or-directory | PROTECTED_SOURCE | NO | `not regenerated in this task` | Approved visual source, assets, or executable contract |

## Fifty largest directories

| Path | Size | Files | Status | Class | Delete? | Regeneration |
|---|---|---|---|---|---|---|
| `.tmp` | 4.493 GB | 11,346 | ignored | EPHEMERAL_TEST_OUTPUT | YES after compact evidence preservation | `re-run the owning test/audit command` |
| `.tmp/preserved` | 4.488 GB | 11,221 | ignored | EPHEMERAL_TEST_OUTPUT | YES after compact evidence preservation | `re-run the owning test/audit command` |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722` | 3.011 GB | 5,937 | ignored | EPHEMERAL_TEST_OUTPUT | YES after compact evidence preservation | `re-run the owning test/audit command` |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results` | 2.789 GB | 4,855 | ignored | EPHEMERAL_TEST_OUTPUT | YES after compact evidence preservation | `re-run the owning test/audit command` |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0` | 2.789 GB | 4,854 | ignored | EPHEMERAL_TEST_OUTPUT | YES after compact evidence preservation | `re-run the owning test/audit command` |
| `.tmp/preserved/prompt17-before-17p-d3976a5` | 1.477 GB | 5,284 | ignored | EPHEMERAL_TEST_OUTPUT | YES after compact evidence preservation | `re-run the owning test/audit command` |
| `.tmp/preserved/prompt17-before-17p-d3976a5/visual-parity` | 1.476 GB | 5,283 | ignored | EPHEMERAL_TEST_OUTPUT | YES after compact evidence preservation | `re-run the owning test/audit command` |
| `.tmp/preserved/prompt17-before-17p-d3976a5/visual-parity/playwright-results/.playwright-artifacts-0` | 1.476 GB | 5,280 | ignored | EPHEMERAL_TEST_OUTPUT | YES after compact evidence preservation | `re-run the owning test/audit command` |
| `.tmp/preserved/prompt17-before-17p-d3976a5/visual-parity/playwright-results` | 1.476 GB | 5,280 | ignored | EPHEMERAL_TEST_OUTPUT | YES after compact evidence preservation | `re-run the owning test/audit command` |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/traces` | 571.91 MB | 4,761 | ignored | EPHEMERAL_TEST_OUTPUT | YES after compact evidence preservation | `re-run the owning test/audit command` |
| `.tmp/preserved/prompt17-before-17p-d3976a5/visual-parity/playwright-results/.playwright-artifacts-0/traces` | 521.41 MB | 5,256 | ignored | EPHEMERAL_TEST_OUTPUT | YES after compact evidence preservation | `re-run the owning test/audit command` |
| `.tmp/preserved/prompt17-before-17p-d3976a5/visual-parity/playwright-results/.playwright-artifacts-0/traces/resources` | 496.19 MB | 5,184 | ignored | EPHEMERAL_TEST_OUTPUT | YES after compact evidence preservation | `re-run the owning test/audit command` |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/traces/resources` | 487.81 MB | 4,485 | ignored | EPHEMERAL_TEST_OUTPUT | YES after compact evidence preservation | `re-run the owning test/audit command` |
| `node_modules` | 457.93 MB | 21,374 | ignored | REPRODUCIBLE_DEPENDENCY | NO wholesale deletion in Prompt 17S cleanup | `npm ci` |
| `.git` | 351.14 MB | 1,877 | untracked-or-directory | GIT_STORAGE | git gc only after capacity/fsck gate | `git gc` |
| `.git/objects` | 350.68 MB | 1,842 | untracked-or-directory | GIT_STORAGE | git gc only after capacity/fsck gate | `git gc` |
| `tests` | 211.27 MB | 832 | untracked-or-directory | TRACKED_REQUIRED_TEST_FIXTURE | NO | `Git checkout of tracked history` |
| `tests/visual` | 211.11 MB | 808 | untracked-or-directory | TRACKED_REQUIRED_TEST_FIXTURE | NO | `Git checkout of tracked history` |
| `tests/visual/baselines` | 210.33 MB | 779 | untracked-or-directory | IMMUTABLE_BASELINE | NO | `owner-approved baseline workflow only` |
| `.git/objects/pack` | 209.96 MB | 3 | untracked-or-directory | GIT_STORAGE | git gc only after capacity/fsck gate | `git gc` |
| `public` | 169.98 MB | 208 | untracked-or-directory | PROTECTED_SOURCE | NO | `not regenerated in this task` |
| `.next` | 167.71 MB | 1,688 | ignored | REPRODUCIBLE_BUILD_OUTPUT | YES | `npm run app:build` |
| `public/images` | 156.70 MB | 157 | untracked-or-directory | PROTECTED_SOURCE | NO | `not regenerated in this task` |
| `node_modules/next` | 147.88 MB | 8,077 | ignored | REPRODUCIBLE_DEPENDENCY | NO wholesale deletion in Prompt 17S cleanup | `npm ci` |
| `node_modules/next/dist` | 147.84 MB | 8,006 | ignored | REPRODUCIBLE_DEPENDENCY | NO wholesale deletion in Prompt 17S cleanup | `npm ci` |
| `tests/visual/baselines/owner-approved-scripture-content-delta` | 140.01 MB | 301 | untracked-or-directory | OWNER_APPROVED_BASELINE | NO | `owner-approved workflow only` |
| `.next/server` | 131.38 MB | 1,431 | ignored | REPRODUCIBLE_BUILD_OUTPUT | YES | `npm run app:build` |
| `node_modules/@next` | 130.64 MB | 61 | ignored | REPRODUCIBLE_DEPENDENCY | NO wholesale deletion in Prompt 17S cleanup | `npm ci` |
| `node_modules/@next/swc-win32-x64-msvc` | 130.53 MB | 3 | ignored | REPRODUCIBLE_DEPENDENCY | NO wholesale deletion in Prompt 17S cleanup | `npm ci` |
| `node_modules/next/dist/compiled` | 103.23 MB | 1,129 | ignored | REPRODUCIBLE_DEPENDENCY | NO wholesale deletion in Prompt 17S cleanup | `npm ci` |
| `.next/server/app` | 103.19 MB | 908 | ignored | REPRODUCIBLE_BUILD_OUTPUT | YES | `npm run app:build` |
| `public/images/canon` | 86.36 MB | 103 | untracked-or-directory | PROTECTED_SOURCE | NO | `not regenerated in this task` |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/remaining-retained-owner-review` | 81.09 MB | 323 | ignored | EPHEMERAL_TEST_OUTPUT | YES after compact evidence preservation | `re-run the owning test/audit command` |
| `node_modules/next/dist/compiled/next-server` | 56.99 MB | 58 | ignored | REPRODUCIBLE_DEPENDENCY | NO wholesale deletion in Prompt 17S cleanup | `npm ci` |
| `.next/server/app/tig` | 46.18 MB | 180 | ignored | REPRODUCIBLE_BUILD_OUTPUT | YES | `npm run app:build` |
| `tests/visual/baselines/owner-approved-scripture-content-delta/desktop-wide` | 37.56 MB | 50 | untracked-or-directory | OWNER_APPROVED_BASELINE | NO | `owner-approved workflow only` |
| `tests/visual/baselines/static-runtime` | 34.56 MB | 85 | untracked-or-directory | IMMUTABLE_BASELINE | NO | `owner-approved baseline workflow only` |
| `.next/dev` | 34.15 MB | 190 | ignored | REPRODUCIBLE_BUILD_OUTPUT | YES | `npm run app:build` |
| `tests/visual/baselines/owner-approved-scripture-content-delta/desktop-standard` | 30.97 MB | 50 | untracked-or-directory | OWNER_APPROVED_BASELINE | NO | `owner-approved workflow only` |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/prompt-12d-next-support-verify` | 29.12 MB | 420 | ignored | EPHEMERAL_TEST_OUTPUT | YES after compact evidence preservation | `re-run the owning test/audit command` |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/remaining-retained-owner-review/lexicon` | 28.43 MB | 43 | ignored | EPHEMERAL_TEST_OUTPUT | YES after compact evidence preservation | `re-run the owning test/audit command` |
| `.next/server/chunks` | 28.13 MB | 506 | ignored | REPRODUCIBLE_BUILD_OUTPUT | YES | `npm run app:build` |
| `node_modules/@img` | 27.03 MB | 21 | ignored | REPRODUCIBLE_DEPENDENCY | NO wholesale deletion in Prompt 17S cleanup | `npm ci` |
| `tests/visual/baselines/owner-approved-scripture-content-delta/tablet-landscape` | 25.07 MB | 50 | untracked-or-directory | OWNER_APPROVED_BASELINE | NO | `owner-approved workflow only` |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/promise-table-owner-review` | 24.69 MB | 43 | ignored | EPHEMERAL_TEST_OUTPUT | YES after compact evidence preservation | `re-run the owning test/audit command` |
| `src` | 24.38 MB | 1,601 | untracked-or-directory | PROTECTED_SOURCE | NO | `Git checkout of tracked history` |
| `.next/dev/server` | 23.75 MB | 142 | ignored | REPRODUCIBLE_BUILD_OUTPUT | YES | `npm run app:build` |
| `.next/dev/server/chunks` | 23.72 MB | 92 | ignored | REPRODUCIBLE_BUILD_OUTPUT | YES | `npm run app:build` |
| `public/images/today-carousel` | 23.69 MB | 12 | untracked-or-directory | PROTECTED_SOURCE | NO | `not regenerated in this task` |
| `tests/visual/baselines/owner-approved-scripture-content-delta/tablet-portrait` | 23.50 MB | 50 | untracked-or-directory | OWNER_APPROVED_BASELINE | NO | `owner-approved workflow only` |

## One hundred largest files

| Path | Size | Links | Status | Class |
|---|---|---|---|---|
| `.git/objects/pack/pack-cd487b276ba5984360a210013498cf429a9752a1.pack` | 209.88 MB | 1 | untracked-or-directory | GIT_STORAGE |
| `node_modules/@next/swc-win32-x64-msvc/next-swc.win32-x64-msvc.node` | 130.53 MB | 1 | ignored | REPRODUCIBLE_DEPENDENCY |
| `.tmp/preserved/prompt17-before-17p-d3976a5/visual-parity/playwright-results/.playwright-artifacts-0/6d100a7bc45dde4fe029c000c3f758ac.zip` | 73.25 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17-before-17p-d3976a5/visual-parity/playwright-results/.playwright-artifacts-0/f3e5a7b4940ff6e1fa055bad9328eb02.zip` | 69.32 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17-before-17p-d3976a5/visual-parity/playwright-results/.playwright-artifacts-0/5f2eddee214600a9d3b11ae8aaf42059.zip` | 64.53 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17-before-17p-d3976a5/visual-parity/playwright-results/.playwright-artifacts-0/56a379887bb0ffeedf4bf41f37cd4097.zip` | 61.39 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17-before-17p-d3976a5/visual-parity/playwright-results/.playwright-artifacts-0/eed2f3b690a529548b1b5d843eac2e68.zip` | 60.85 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17-before-17p-d3976a5/visual-parity/playwright-results/.playwright-artifacts-0/6bbf1af9ad863f80e50c40d90da7928b.zip` | 59.07 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/197aecaf1edc89f6d14c449955221218.zip` | 53.22 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17-before-17p-d3976a5/visual-parity/playwright-results/.playwright-artifacts-0/d0b67c791ee34e75345eb29e7a19c20f.zip` | 52.75 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17-before-17p-d3976a5/visual-parity/playwright-results/.playwright-artifacts-0/26579fc3fd14d5ee779a7b204c702467.zip` | 51.85 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17-before-17p-d3976a5/visual-parity/playwright-results/.playwright-artifacts-0/c76bcd8a8742d4c3ae865d97afc99d66.zip` | 51.55 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17-before-17p-d3976a5/visual-parity/playwright-results/.playwright-artifacts-0/c19a0a630e7d96667ec79560dda33a93.zip` | 50.68 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/e907660c0ff7b218155c4ffd351c129a.zip` | 50.20 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/bb811138ac4fa8a85510bb9f45b1d0db.zip` | 50.17 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17-before-17p-d3976a5/visual-parity/playwright-results/.playwright-artifacts-0/67e70dd02d71898027ffd6bcb1cd2827.zip` | 50.16 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/559d48553600d87884c5aa03782789a2.zip` | 49.34 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/a87be1da66924660a38379238d11fdfe.zip` | 48.78 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/3deb6c48d2c0e3ed40f63d810752b208.zip` | 46.46 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/5e00c470ad37839148cb73224f5b1fbf.zip` | 46.20 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/2a37676810997746000b232e075e8bbf.zip` | 45.96 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17-before-17p-d3976a5/visual-parity/playwright-results/.playwright-artifacts-0/dd8fa754005d4f48d380b9e82af1f1f4.zip` | 45.68 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/04800fa1d467d513b2d1e9e24cc452d1.zip` | 45.49 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/a33aa58f827362c54d605895d4eca187.zip` | 45.28 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/7450f86e84416d0da5801e35701d4dc3.zip` | 45.18 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/d99e011a3b951427df499d36cbf776f6.zip` | 45.13 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/98625838f9e9bdece3257556e70246ad.zip` | 44.63 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/5f4f1fcdb8491b59377d015dba103079.zip` | 44.09 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/998d16526b5ac9ab22fe480c202a4a67.zip` | 44.04 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/0fafddce170b715944701f4ef2e60a4f.zip` | 43.86 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/6bc5d93e606e3dffe734804fd32f5cc7.zip` | 43.47 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/326cae23de7618e46b82fca571e5b234.zip` | 43.21 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17-before-17p-d3976a5/visual-parity/playwright-results/.playwright-artifacts-0/93d572f9e3b71478ca6e332777d4544a.zip` | 39.98 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/b4d3eb013eeac1eaa022f11b525237a5.zip` | 36.25 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/56a71bdf62d9e4462d355fb11d02631d.zip` | 36.19 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17-before-17p-d3976a5/visual-parity/playwright-results/.playwright-artifacts-0/ba4e806baaf85e2484f587fa05f7351b.zip` | 34.60 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17-before-17p-d3976a5/visual-parity/playwright-results/.playwright-artifacts-0/195f75153f104f96b1b8593f685d0be6.zip` | 33.95 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/8459a7075f8f24d02c91eeb01c801a87.zip` | 33.28 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/7c536120b89e43e96a87c2641f67c944.zip` | 32.06 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17-before-17p-d3976a5/visual-parity/playwright-results/.playwright-artifacts-0/68b660f04188a6040a866a735bf9b7c0.zip` | 31.92 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/b49b459c37efa8bbe7e3d0d6ed702959.zip` | 30.93 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/5c1672316fdb5a9b1733334f07311796.zip` | 30.72 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/94a21a1a662e795bccd53b5a709849fa.zip` | 30.06 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17-before-17p-d3976a5/visual-parity/playwright-results/.playwright-artifacts-0/dc2e38764c8611d2a4ac57fcf92a12d6.zip` | 29.96 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/5a97d7a976381c8fa0cb4ef8ab2168e9.zip` | 29.95 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/acf4d421e93dcd92d2dbfff524419780.zip` | 29.89 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/068c9342158c3e1a85bcd9cf8b9f12e1.zip` | 29.42 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/5a66da3b0f019d9e741495726c091eb3.zip` | 29.39 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/57049a1241967028dda4e3e626b31a64.zip` | 29.12 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/a850b8510b215f576b27ca90a2cddc75.zip` | 28.36 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/f6aedf5596ec2ecfe86806d1d520b9bd.zip` | 28.17 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/855168ac3389e4d8ed6f921f336a424a.zip` | 27.78 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/e667ff7c85a242b24bf9021d7699848d.zip` | 27.72 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/6ea907fc5e2452a992d3122adcef575c.zip` | 27.16 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/d1cca5a2d5196ca019f46dd4d381fe36.zip` | 27.11 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/0f49445bcb74cfd43f7abefcf6ee1f75.zip` | 26.75 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/080a27bf800fb7d5ef157f07618357de.zip` | 25.84 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/a74b16e48bdffaaa8597404bc7b41966.zip` | 25.36 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/76d0d5dcc5e60c4f3f625e5f201919f6.zip` | 25.11 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/01c6022509c7b107a6467ed365a2bc6b.zip` | 24.89 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/810573dcc47c746ba54e6eccb8dc8065.zip` | 24.85 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/365bc5ecedb0f2a3343910f688a9d035.zip` | 23.88 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17-before-17p-d3976a5/visual-parity/playwright-results/.playwright-artifacts-0/382003cdd09091ddb610693d22fa6ac5.zip` | 23.42 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/89a879a8203de86640fe003f3e7c4d09.zip` | 23.20 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/3fbf77b864a7f7b29b6aca38d2a87cf0.zip` | 22.93 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/d8f6f705fb0244da92081751b42ee1ed.zip` | 22.79 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/aba0cc365b633f2375b6318a6cd91e0e.zip` | 22.59 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/60725cc1d3241be468585c79065f3da7.zip` | 22.58 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/a441a19859dcc9ae174f9241b0376769.zip` | 22.56 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/a78ad9f0f9efeed3ba2ca722f56f5de9.zip` | 22.47 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/07ca216c42cbccce1d397af2cd9cfcbd.zip` | 22.35 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/eaf07e9361eb8a9254e4eab5e2d9b6c3.zip` | 22.34 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/fa6de1e10db87036fd0cee66a2407343.zip` | 22.26 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17-before-17p-d3976a5/visual-parity/playwright-results/.playwright-artifacts-0/233e96a7facf95b60665fafd9ceb3250.zip` | 21.75 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/fd67ca906f64bacefc6d93ae1d00b358.zip` | 21.53 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/fbb047f5a75c688ce05347fc860c2a7f.zip` | 21.52 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/9a780c383688835d4af384b8765564fa.zip` | 21.43 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/094b2114e0dc6c670394986ab2c3a9ef.zip` | 20.95 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/3a0ee83169cc382c9db81dd09e547ca2.zip` | 20.46 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17-before-17p-d3976a5/visual-parity/playwright-results/.playwright-artifacts-0/9934195e8236edb698b2ddbe0d48027b.zip` | 20.25 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/88faa5a2b7c939193c350599311a27fd.zip` | 19.70 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `node_modules/@rolldown/binding-win32-x64-msvc/rolldown-binding.win32-x64-msvc.node` | 19.56 MB | 1 | ignored | REPRODUCIBLE_DEPENDENCY |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/ec3323c8fd55bf58709962a7fd2aad98.zip` | 19.39 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/fabad70d75a847c32a3fef02446c0f58.zip` | 19.31 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17-before-17p-d3976a5/visual-parity/playwright-results/.playwright-artifacts-0/4b887fe0090949808e4be02e0ffbed54.zip` | 19.27 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/5ea5c6be20f1f671a88b32fa7e192ea7.zip` | 19.26 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/e4e62e0064ecff58b7e453aef406fc85.zip` | 19.13 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/083b868cec97cf87a43f5276955926dd.zip` | 18.95 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/3ca62a42723f688deb73f5541ad73076.zip` | 17.68 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `node_modules/@img/sharp-win32-x64/lib/libvips-42.dll` | 17.55 MB | 1 | ignored | REPRODUCIBLE_DEPENDENCY |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/8f59574ced4e1da30248cde06fef03ed.zip` | 17.51 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/504391cfe8ba8cd1074992fbbc092a83.zip` | 17.48 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/7861b78e22ec27d4bf08b0bb3466a3f4.zip` | 17.29 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17-before-17p-d3976a5/visual-parity/playwright-results/.playwright-artifacts-0/df53bcc7675ef73e6da05e028e5de90e.zip` | 17.02 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17-before-17p-d3976a5/visual-parity/playwright-results/.playwright-artifacts-0/3b10b0feb71df23db981d45fd6c22b71.zip` | 16.49 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/35e46a4f696a448fdecc33c0cd721df4.zip` | 16.39 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/e94c57179de33b6e9fb21938e0a75fa6.zip` | 16.30 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/32c867ff1b3b799f510816a2e2d5140d.zip` | 12.49 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |
| `.next/server/app/explore.html` | 12.17 MB | 1 | ignored | REPRODUCIBLE_BUILD_OUTPUT |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0/f90723ed9a3396a0b3f63edc0dc4eec1.zip` | 12.14 MB | 1 | ignored | EPHEMERAL_TEST_OUTPUT |

## Extension/category totals

| Category | Files | Size |
|---|---|---|
| PNG | 1,425 | 600.22 MB |
| JPG | 9,312 | 738.77 MB |
| WEBP | 24 | 847.76 KB |
| ZIP | 119 | 3.202 GB |
| JSON | 2,260 | 173.48 MB |
| trace | 184 | 79.41 MB |
| video | 24 | 10.64 MB |
| log | 23 | 1.88 KB |
| SQLite/database | 0 | 0 B |
| cache | 0 | 0 B |
| source | 18,735 | 255.81 MB |

## Hard links and practical duplicate hashes

- Files with more than one hard link: **0** (first 100 recorded in JSON).
- Duplicate SHA-256 groups recorded: **53**.
- Hash policy: SHA-256 groups among at most 4,000 files of at least 1 MiB; diagnostic only; duplicates are not deletion authority.
- Duplicate hashes do not authorize deletion.

## Git object statistics

```text
count: 1839
size: 140.72 MiB
in-pack: 2422
packs: 1
size-pack: 209.95 MiB
prune-packable: 0
garbage: 0
size-garbage: 0 bytes
```

## Ignored-status inventory

`git status --ignored --short` returned 7 entries. The complete entries are retained in the JSON artifact.

## Ignored-clean preview

`git clean -ndX` returned 7 preview entries:

```text
Would remove .next/
Would remove .tmp/
Would remove next-env.d.ts
Would remove node_modules/
Would remove owner-input/
Would remove playwright-report/
Would remove tsconfig.next.tsbuildinfo
```

## Deletion policy

Only paths classified `REPRODUCIBLE_BUILD_OUTPUT`, `EPHEMERAL_TEST_OUTPUT`, or `EPHEMERAL_LOG` may be removed, and only after compact required evidence is preserved. `REPRODUCIBLE_DEPENDENCY` package contents are retained; only a verified `node_modules/.cache/` may be removed. `UNKNOWN_DO_NOT_DELETE` is never deletion authority.
