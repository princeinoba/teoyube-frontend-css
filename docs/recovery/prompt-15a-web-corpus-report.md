# Prompt 15A WEB Corpus Report

Status: **BLOCKED — VISIBLE LEGACY QUOTATION OWNER DECISION REQUIRED**
Date: 2026-07-20

## Task identity

- Branch: `recovery/visual-source-of-truth`
- Starting commit: `792b37a5995bbf4621edcac2e3da6e11710612a5`
- Final commit: the documentation commit containing this report; exact hash is reported in the task handoff
- Protected visual files changed: 0
- Immutable static baselines changed: 0
- Owner-approved support baselines changed: 0
- Static runtime: canonical; `npm start` remains the static server
- Next runtime: preview-only
- Prompt 16 unlocked: **NO**

## Entry gate

The exact branch and starting commit were confirmed, the starting commit was in the current lineage, and the worktree contained only the expected untracked `owner-input/scripture/engwebp_usfm.zip`. `npm run recovery:verify` passed before work, including protected-source, visual, immutable screenshot/DOM, owner-reference, owner-approved support, TIG, Scripture registry, import-boundary, and architecture checks. The focused Prompt 13 and Prompt 14 unit regressions passed 13/13 across `daily-spiritual-loop-contracts.test.ts` and `tig-service-contracts.test.ts`.

No network request was made during Prompt 15A.

## Archive result

- Path: `owner-input/scripture/engwebp_usfm.zip`
- SHA-256: `4253589697DC6B5E92695655F2F28792D50E7BE7B9C8E212AF4F4BD18E866C3B`
- Size: 2,907,330 bytes
- Format: ZIP
- Entries/files: 72
- Uncompressed bytes: 19,092,388
- Overall compression ratio: 6.59
- Maximum entry ratio: 8.37
- Maximum uncompressed entry: 1,055,777 bytes
- Safety: PASS — no absolute path, `..` traversal, drive-letter path, symlink/special file, executable/script, nested archive, unexpected binary, duplicate case-insensitive path, or unsafe compression ratio
- Encoding: all entries decoded as strict UTF-8; no NUL or unexpected control characters
- Isolated extraction: used only under `tmp/scripture-import/` for inspection and removed after the review package was prepared

The archive contains 68 USFM files, `copr.htm`, `gentiumplus.css`, `keys.asc`, and `signature.txt.asc`. The embedded signed checksum manifest lists 70 payload files; all 70 SHA-256 values matched. GPG was unavailable locally, so the PGP signature itself was not independently cryptographically verified. This does not replace the exact owner archive hash recorded above.

## Source, edition, and public-domain evidence

Embedded evidence identifies:

- World English Bible
- updated 66-book protocanon-only edition
- Protestant Old and New Testaments; no deuterocanonical book in the selected source set
- English (`en-US` per owner decision; source wording matches the selected non-Classic WEB edition using `LORD`)
- eBible.org as generator/source publisher
- public-domain text
- `World English Bible` as an eBible.org trademark
- the restriction that changed text must not continue to be called World English Bible
- “2020 stable text edition” metadata
- generation on 2026-07-10 from source files dated 2026-07-10

The book inventory contains exactly the expected 66 canonical book IDs, with no missing, duplicate, unexpected, or deuterocanonical book. Read-only source inspection counted 1,189 chapter markers and 31,103 verse markers. Those counts describe the source markers only; no generated Teoyube corpus was produced after the stop condition.

## Stop condition and quotation result

Exact comparisons against the archive found visible canonical product wording that is not WEB. The required owner package is:

- `docs/scripture/legacy-quotation-owner-review.md`
- `docs/scripture/legacy-quotation-owner-review.json`

Results:

- visible product quotation records: 17
- `EXACT_WEB_MATCH`: 0
- `LEGACY_NON_WEB_WORDING`: 17
- `UNRESOLVED_REFERENCE`: 0
- separate non-visible legacy source records: 20
- prayer/paraphrase records classified `NOT_SCRIPTURE_QUOTATION`: 5

Affected visible product areas are Today, Canon, Calling Compass, Book of the Saint, Lexicon, Teo Guide, Promise Table, and Tables. Search, the retained `/promise-search` support route, Journey, Journal, and Testimony remain reference-only for this audit. Prayer prose remains typed as prayer/interpretation, not verse text. The three legacy TIG KJV excerpt seeds remain display-blocked and are not relabeled WEB.

No visible wording was changed, no derived approved markup was regenerated, and no screenshot was updated.

## Corpus and repository completion status

The owner archive passed the safety, source, edition, book-set, public-domain, and text-integrity evidence checks. Work stopped before production onboarding because the visible quotation gate failed.

- Importer version: not assigned; deterministic importer not implemented in this stopped task
- Generated corpus version/checksum: not created
- Permanent corpus approval record: not created because no import version or generated checksum exists yet
- Canonical registry: unchanged; legacy unknown-provenance KJV excerpts remain blocked
- All 356 normalized references: not executed against a generated WEB repository; the prior reference-only inventory remains unchanged
- Exact retrieval: not integrated
- Context retrieval: not integrated
- Lexical search: not upgraded to full-text WEB search
- Citation validation: quotation comparison evidence produced, but the canonical repository remains reference-only/display-blocked
- Product integration: not started
- Client corpus/index boundary: unchanged; no corpus or index was added to a client bundle
- External services/model/database: none

## Verification status

- Entry `npm run recovery:verify`: PASS
- Archive safety: PASS
- Embedded source/public-domain evidence: PASS
- 66-book source inventory: PASS
- Embedded file checksums: 70/70 PASS
- Legacy quotation audit package: PASS as a deterministic review artifact; product gate BLOCKED
- Prompt 13/14 focused unit regression: 13/13 PASS at entry
- TIG behavior: unchanged
- Search and Promise Search behavior: unchanged and remain distinct
- Build/typecheck/lint/full unit/browser/performance suites: not run after the stop condition because no production implementation was authorized or performed
- Final `npm run recovery:verify`: recorded in the task handoff after documentation-only changes
- Visual parity: protected and baseline hashes unchanged; full candidate replay was not required for documentation-only output
- Security: no network, execution of archive content, request-controlled path, model, database, or persistent write

## Files changed

- `docs/scripture/legacy-quotation-owner-review.md`
- `docs/scripture/legacy-quotation-owner-review.json`
- `docs/recovery/prompt-15a-web-corpus-report.md`

The owner archive remains untracked owner input and is not part of the documentation commit.

## Known limitations and next gate

Independent PGP signature verification was unavailable. More importantly, Prompt 15A cannot pass while a visible canonical quotation remains non-WEB without a scoped owner content decision. The exact WEB comparisons are evidence only; they do not authorize replacement.

Owner approval required: **YES**

Next gate: **BLOCKED**
Prompt 16 unlocked: **NO**

Rollback: `git revert <Prompt-15A-review-commit>`
