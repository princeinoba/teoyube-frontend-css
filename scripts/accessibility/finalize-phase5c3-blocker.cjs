#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "../..");
const start = "62c4f591226397bf88e28365761fcc97bf7fa42f";
const decision = "TEOYUBE-OWNER-ACCESSIBILITY-PHASE5B-2026-08-05-001";
const hashes = { "A11Y-007": "e8b95d152abc18f9f94009db2895f9975384b02a2544d7808d594e69a03f8717", "A11Y-008": "86157f49c8d6e4e897ad3c51a1fa7486c0f8ce7b09ac4bdd8420a0c0277cb2d8" };
const at = new Date().toISOString();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const json = (file) => JSON.parse(read(file));
function write(file, value) { const target = path.join(root, file); fs.mkdirSync(path.dirname(target), { recursive: true }); const text = typeof value === "string" ? value : JSON.stringify(value, null, 2); fs.writeFileSync(target, text.endsWith("\n") ? text : `${text}\n`, "utf8"); }
function replace(text, from, to) { if (!text.includes(from)) throw new Error(`Required text missing: ${from}`); return text.replace(from, to); }

const before = json("docs/accessibility/phase-5c3-before-characterization.json");
if (before.summary.cellCount !== 42 || before.summary.viewportCount !== 6 || before.summary.targetViolationNodes <= 0 || before.summary.contrastViolationNodes !== 0 || !before.validationFailures.includes("A11Y-008 did not reproduce.")) throw new Error("Before evidence does not satisfy the hard-stop contract.");

const issues = json("docs/accessibility/accessibility-issue-register.json");
issues.phase = "5C-3_BLOCKED_PRE_IMPLEMENTATION";
const a7 = issues.issues.find((item) => item.id === "A11Y-007");
const a8 = issues.issues.find((item) => item.id === "A11Y-008");
if (!a7 || !a8) throw new Error("Phase 5C-3 issues missing.");
Object.assign(a7, { phase5c3Status: "APPROVED_NOT_STARTED_BATCH_BLOCKED", phase5c3Evidence: "A11Y-007 reproduced, but implementation did not start because A11Y-008 invalidated combined-batch integrity.", proposalHash: hashes["A11Y-007"] });
Object.assign(a8, { originalClassification: a8.originalClassification || a8.classification, classification: "NEEDS_MORE_EVIDENCE", phase5c3Status: "NEEDS_MORE_EVIDENCE", phase5c3Evidence: "Actual /canon D02/D05 pair is rgb(255,253,244) on rgb(133,73,0), 6.9851:1; scoped axe found zero failures in both runtimes at six viewports. No source change.", proposalHash: hashes["A11Y-008"] });
Object.assign(issues, { confirmedProductIssueCount: 7, openConfirmedIssueCount: 1, needsMoreEvidenceIssueCount: 1 });
write("docs/accessibility/accessibility-issue-register.json", issues);
let issuesMd = read("docs/accessibility/accessibility-issue-register.md");
issuesMd = replace(issuesMd, "| A11Y-007 | High | Confirmed defect | Today, Canon, Book, Explore | Target-size failures | 2.5.8 | Approved for 5C-3; not started |", "| A11Y-007 | High | Confirmed defect | Today, Canon, Book, Explore | Target-size failures | 2.5.8 | Approved; not started because combined batch is blocked |");
issuesMd = replace(issuesMd, "| A11Y-008 | High | Confirmed defect | Canon | In-progress status contrast fails | 1.4.3 | Approved for 5C-3; not started |", "| A11Y-008 | High | Needs more evidence | Canon | Approved contrast defect does not reproduce on actual route | 1.4.3 | NEEDS_MORE_EVIDENCE; no source change |");
write("docs/accessibility/accessibility-issue-register.md", issuesMd);

const wcag = json("docs/accessibility/wcag-2.2-aa-conformance-matrix.json");
const c143 = wcag.criteria.find((item) => item.id === "1.4.3");
if (!c143) throw new Error("WCAG 1.4.3 missing.");
Object.assign(c143, { status: "NEEDS_MORE_EVIDENCE", evidence: "A11Y-008 does not reproduce on actual /canon: D02/D05 measure 6.9851:1 and scoped axe is zero across 12 runtime/viewport cells. A11Y-009 manual contrast review remains incomplete." });
write("docs/accessibility/wcag-2.2-aa-conformance-matrix.json", wcag);
let wcagMd = read("docs/accessibility/wcag-2.2-aa-conformance-matrix.md");
wcagMd = replace(wcagMd, "| 1.4.3 Contrast (Minimum) | AA | **Fail** | A11Y-008 Canon status contrast; incomplete contrast review remains. |", "| 1.4.3 Contrast (Minimum) | AA | **Needs more evidence** | A11Y-008 does not reproduce on actual Canon; A11Y-009 manual contrast review remains incomplete. |");
write("docs/accessibility/wcag-2.2-aa-conformance-matrix.md", wcagMd);

const program = json("docs/recovery/9of10-program-status.json");
const p5 = program.phases.find((item) => item.phaseId === "5");
const p5c3 = p5?.subphases.find((item) => item.subphaseId === "5C-3");
if (!p5 || !p5c3) throw new Error("Phase 5C-3 state missing.");
p5.deliverables = p5.deliverables.map((item) => item.startsWith("Phase 5C-3 approved target-size/contrast fixes:") ? "Phase 5C-3 approved target-size/contrast fixes: BLOCKED_NEEDS_MORE_EVIDENCE" : item);
p5.currentEvidence.push("Phase 5C-3: 42 focused cells; A11Y-007 reproduced; A11Y-008 did not reproduce on actual /canon; 6.9851:1; zero production changes");
p5.currentBlockers = p5.currentBlockers.map((item) => item.startsWith("A11Y-007 and A11Y-008 are approved for Phase 5C-3") ? "Phase 5C-3 batch integrity blocked: A11Y-008 NEEDS_MORE_EVIDENCE; A11Y-007 approved but not started" : item);
p5.nextReviewTrigger = "Supply reproducible A11Y-008 evidence or a new hash-bound batch decision; do not implement the invalidated combined batch.";
p5c3.status = "BLOCKED_NEEDS_MORE_EVIDENCE";
program.nextReadyPhase = "6A";
if (Array.isArray(program.readyPhases)) program.readyPhases = program.readyPhases.filter((item) => item !== "5C-3");
write("docs/recovery/9of10-program-status.json", program);
let programMd = read("docs/recovery/9of10-program-status.md");
programMd = programMd.replace("| 5 - Accessibility remediation | **IN_PROGRESS** | Phase 5A, Phase 5B, Phase 5C-1, and Phase 5C-2 PASS; Phase 5C is IN_PROGRESS; Phase 5C-3 READY; manual tasks APPROVED and NOT_TESTED. |", "| 5 - Accessibility remediation | **IN_PROGRESS** | Phase 5A, Phase 5B, Phase 5C-1, and Phase 5C-2 PASS; Phase 5C-3 BLOCKED_NEEDS_MORE_EVIDENCE; manual tasks APPROVED and NOT_TESTED. |");
programMd += `\n## Phase 5C-3 pre-implementation hard stop\n\nPhase 5C-3 is **BLOCKED_NEEDS_MORE_EVIDENCE**. A11Y-007 reproduced, but A11Y-008 did not reproduce on actual Canon in either runtime at six viewports. D02/D05 measure **6.9851:1** and scoped axe is zero. The prompt requires a hard stop, so neither source change was made. Manual tasks remain **APPROVED, NOT_TESTED**; WCAG conformance is not claimed; Phases 2A, 3, and 4 retain their prior blockers; Phase 6A was not started.\n`;
write("docs/recovery/9of10-program-status.md", programMd);

const ledger = json("docs/recovery/9of10-evidence-ledger.json");
ledger.workspaceAfterPhase5c3PreImplementation = { recordedAt: at, branch: "recovery/visual-source-of-truth", startingCommit: start, status: "BLOCKED_NEEDS_MORE_EVIDENCE", ownerDecisionId: decision, proposalHashes: hashes, focusedCells: 42, viewports: 6, targetSizeIssueReproduced: true, contrastIssueReproduced: false, measuredContrastRatio: 6.9851, productionSourceChanges: 0, protectedVisualFilesChanged: 0, immutableBaselineFilesChanged: 0, ownerApprovedBaselineFilesChanged: 0, packageLockFilesChanged: 0, manualTasksExecuted: 0, paidCalls: 0 };
write("docs/recovery/9of10-evidence-ledger.json", ledger);
write("docs/recovery/9of10-evidence-ledger.md", read("docs/recovery/9of10-evidence-ledger.md") + `\n## Phase 5C-3 pre-implementation hard stop\n\n| Evidence | Result |\n| --- | --- |\n| Scope | A11Y-007 \`${hashes["A11Y-007"]}\`; A11Y-008 \`${hashes["A11Y-008"]}\` |\n| Characterization | 42 cells, six viewports, both runtimes where applicable |\n| A11Y-007 | REPRODUCED; approved but not started |\n| A11Y-008 | NEEDS_MORE_EVIDENCE; 6.9851:1; zero scoped axe failures |\n| Production / protected / baseline changes | 0 / 0 / 0 |\n| Result | BLOCKED before implementation |\n`);
write("docs/recovery/9of10-phase-history.md", read("docs/recovery/9of10-phase-history.md") + `\n## Phase 5C-3 - pre-implementation evidence stop\n\nStatus: **BLOCKED_NEEDS_MORE_EVIDENCE**\n\nThe exact owner decision and proposal hashes were validated. A 42-cell scoped characterization reproduced A11Y-007, but A11Y-008 did not reproduce on actual Canon: D02/D05 measure 6.9851:1 and scoped axe is zero. No production remediation was applied.\n`);

const report = { schemaVersion: 1, phase: "5C-3", status: "BLOCKED_NEEDS_MORE_EVIDENCE", generatedAt: at, branch: "recovery/visual-source-of-truth", startingCommit: start, ownerDecisionId: decision, proposalHashes: hashes, issueResults: { "A11Y-007": "REPRODUCED_APPROVED_NOT_STARTED_BATCH_BLOCKED", "A11Y-008": "NEEDS_MORE_EVIDENCE_NOT_REPRODUCED" }, beforeEvidence: before.summary, canonContrast: { foreground: "rgb(255, 253, 244)", background: "rgb(133, 73, 0)", ratio: 6.9851, required: 4.5, scopedAxeViolations: 0 }, changes: { productionSourceFiles: 0, productSourceFiles: 0, protectedVisualFiles: 0, immutableBaselines: 0, ownerApprovedBaselines: 0, packagesOrLockfiles: 0 }, manualTasksExecuted: 0, paidCalls: 0, nextAction: "Supply reproducible A11Y-008 evidence or a new hash-bound batch decision.", rollback: "git revert <Phase-5C-3-blocker-evidence-commit>" };
write("docs/recovery/9of10-phase-5c3-medium-accessibility-report.json", report);
write("docs/recovery/9of10-phase-5c3-medium-accessibility-report.md", `# Phase 5C-3 medium accessibility report\n\n- Status: **BLOCKED_NEEDS_MORE_EVIDENCE**\n- Starting commit: \`${start}\`\n- Owner decision: \`${decision}\`\n\nA11Y-007 reproduced. A11Y-008 did not reproduce on actual \`/canon\`: D02/D05 compute to \`rgb(255, 253, 244)\` on \`rgb(133, 73, 0)\`, **6.9851:1**, with zero scoped axe failures across both runtimes and all six viewports. The task hard-stop rule therefore prevented all production implementation.\n\nProduction, protected visual, baseline, package, paid-call, and manual-task changes: **0**. WCAG 2.2 AA conformance is not claimed. Provide reproducible A11Y-008 evidence or a new hash-bound batch decision before retrying.\n`);
write("docs/accessibility/phase-5c3-before-characterization.md", `# Phase 5C-3 before characterization\n\n- Result: **BLOCKED - A11Y-008 DID NOT REPRODUCE**\n- Cells: **42** across six approved viewports\n- A11Y-007 target-size violations: **${before.summary.targetViolationNodes}**\n- A11Y-008 scoped contrast violations: **0**\n- D02/D05 contrast: **6.9851:1**\n- Unexpected errors: **${before.summary.unexpectedErrorCount}**\n- Source and baseline writes: **0**\n\nA11Y-008 is **NEEDS_MORE_EVIDENCE**. No implementation was authorized after this hard stop.\n`);
console.log(JSON.stringify(report, null, 2));
