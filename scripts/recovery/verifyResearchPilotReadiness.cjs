"use strict";
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const pilot = require("../research/runPilotCommand.cjs");

const root = path.resolve(__dirname, "../..");
const study = require(path.join(root, "config/research-pilot-study.json"));
const scenarios = require(path.join(root, "config/research-pilot-scenarios.json"));
const decision = require(path.join(root, "docs/research/phase-4c-recruitment-decision.json"));
const phase4aDecision = require(path.join(root, "docs/research/pilot-decision.json"));
const phase4bReport = require(path.join(root, "docs/recovery/9of10-phase-4b-research-instrumentation-report.json"));
const phase4bStudyRegistry = require(path.join(root, "config/research-study-registry.json"));

const requiredDocuments = [
  "docs/research/recruitment-message.md",
  "docs/research/recruitment-tracker-template.csv",
  "docs/research/participant-contact-separation.md",
  "docs/research/scheduling-guide.md",
  "docs/research/compensation-log-template.csv",
  "docs/research/recruitment-stop-rules.md",
  "docs/research/participant-packet/README.md",
  "docs/research/participant-packet/consent-checklist.md",
  "docs/research/participant-packet/session-overview.md",
  "docs/research/participant-packet/privacy-summary.md",
  "docs/research/participant-packet/live-ai-consent-summary.md",
  "docs/research/participant-packet/recording-consent-summary.md",
  "docs/research/participant-packet/withdrawal-and-deletion.md",
  "docs/research/participant-packet/post-session-debrief.md",
  "docs/research/moderator-packet/README.md",
  "docs/research/moderator-packet/pre-session-checklist.md",
  "docs/research/moderator-packet/session-script.md",
  "docs/research/moderator-packet/task-score-sheet.md",
  "docs/research/moderator-packet/accessibility-observation-sheet.md",
  "docs/research/moderator-packet/adverse-event-card.md",
  "docs/research/moderator-packet/post-session-checklist.md",
  "docs/research/moderator-packet/data-minimization-card.md",
  "docs/research/synthetic-scenario-pack.md",
  "docs/research/phase-4c-recruitment-decision.md",
  "docs/research/phase-4c-recruitment-decision.json"
];

function gitTrackedFiles() {
  return execFileSync("git", ["ls-files"], { cwd: root, encoding: "utf8" }).split(/\r?\n/).filter(Boolean);
}

function verifyTemplates(failures) {
  for (const file of ["docs/research/recruitment-tracker-template.csv", "docs/research/compensation-log-template.csv"]) {
    const lines = fs.readFileSync(path.join(root, file), "utf8").split(/\r?\n/).filter(Boolean);
    if (lines.length !== 1) failures.push(`template_has_real_rows:${file}`);
    if (!lines[0].includes("TEMPLATE") || !lines[0].includes("DO NOT ENTER REAL PARTICIPANT DATA")) failures.push(`template_warning_missing:${file}`);
  }
}

function verifyNoResearchAdministrationRoute(failures) {
  const tracked = gitTrackedFiles();
  if (tracked.some((file) => /^src\/app\/(?:research|pilot|study)(?:\/|$)/i.test(file))) failures.push("normal_navigation_research_route");
  if (tracked.some((file) => /^\.var\/research\//.test(file))) failures.push("tracked_research_data");
}

function verifyNoSecretLikeMaterial(failures) {
  const secretPattern = /(?:sk-(?:proj-)?[A-Za-z0-9_-]{16,}|Bearer\s+[A-Za-z0-9._~-]{12,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)/;
  for (const relative of [...requiredDocuments, "config/research-pilot-study.json", "config/research-pilot-scenarios.json", "scripts/research/runPilotCommand.cjs"]) {
    if (secretPattern.test(fs.readFileSync(path.join(root, relative), "utf8"))) failures.push(`secret_like_material:${relative}`);
  }
}

function verifyProhibitedLanguage(failures) {
  const forbiddenTerms = ["holiness score", "faith score", "spiritual rank", "divine-favor metric", "guilt streak", "engagement-pressure metric"];
  const negativeContext = /\b(?:no|not|never|without|prohibit(?:ed|s)?|avoid|must not|do not|does not|cannot|isn't|aren't)\b/i;
  for (const relative of requiredDocuments) {
    const lines = fs.readFileSync(path.join(root, relative), "utf8").split(/\r?\n/);
    lines.forEach((line, index) => {
      for (const forbidden of forbiddenTerms) {
        if (line.toLowerCase().includes(forbidden) && !negativeContext.test(line)) failures.push(`prohibited_metric_language:${relative}:${index + 1}:${forbidden}`);
      }
    });
  }
}

function main() {
  const failures = [];
  for (const relative of requiredDocuments) if (!fs.existsSync(path.join(root, relative))) failures.push(`required_document_missing:${relative}`);
  failures.push(...pilot.validateStudyAndScenarios());
  const readiness = pilot.verifyReadiness();
  failures.push(...readiness.failures);
  verifyTemplates(failures);
  verifyNoResearchAdministrationRoute(failures);
  verifyNoSecretLikeMaterial(failures);
  verifyProhibitedLanguage(failures);
  if (study.status !== "RECRUITMENT_AUTHORIZED_AWAITING_MANUAL_PREREQUISITES") failures.push("study_authorization_state_invalid");
  if (phase4aDecision.status !== "APPROVED" || phase4aDecision.ownerApproved !== true || phase4aDecision.approvalReference !== study.approvedPilotDesignReference) failures.push("phase4a_decision_inconsistent");
  if (phase4aDecision.sampleSize.recommendation !== 12 || phase4aDecision.sampleSize.minimum !== 8 || phase4aDecision.sampleSize.maximum !== 15) failures.push("phase4a_sample_inconsistent");
  if (phase4bReport.status.final !== "PASS" || phase4bReport.researchMode.checkedInDefault !== false || phase4bReport.researchMode.collectionAuthorized !== false) failures.push("phase4b_report_inconsistent");
  if (phase4bStudyRegistry.studies.length !== 1 || phase4bStudyRegistry.studies[0].studyId !== "teoyube-phase4b-synthetic" || phase4bStudyRegistry.studies[0].realParticipantCollectionAuthorized !== false) failures.push("phase4b_synthetic_registry_changed");
  if (decision.status !== "APPROVED" || decision.recruitmentAuthorized !== "AUTHORIZED" || decision.ownerDecisionReference !== "PHASE_4C_OWNER_RESPONSE_AUTHORIZE_EXACT_PROPOSAL_NO_SEPARATE_ID") failures.push("recruitment_authorization_invalid");
  if (decision.researchOperator !== "PENDING_OWNER_OR_NAMED_TRAINED_RESEARCHER" || decision.contactDataStorageLocation !== "PENDING_SEPARATE_NON_GIT_LOCATION" || decision.localPrivacyReviewCompleted !== "PENDING_REQUIRED_BEFORE_CONTACT_OR_DATA_COLLECTION") failures.push("manual_prerequisites_not_preserved");
  if (study.realParticipantCollectionAuthorized !== false || study.localPrivacyReviewCompleted !== false) failures.push("real_collection_enabled_before_prerequisites");
  if (decision.actualParticipants !== 0 || decision.actualSessions !== 0) failures.push("actual_counts_nonzero");
  if (scenarios.scenarios.length !== 17) failures.push("scenario_count_invalid");
  const result = {
    schemaVersion: "1.0.0",
    valid: failures.length === 0,
    studyId: study.studyId,
    studyStatus: study.status,
    scenarioCount: scenarios.scenarios.length,
    requiredDocumentCount: requiredDocuments.length,
    actualParticipantRecordCount: readiness.actualParticipantRecordCount,
    actualSessionCount: 0,
    recruitmentAuthorized: decision.recruitmentAuthorized,
    researchModeDefault: readiness.checkedInResearchModeDefaultFalse ? "DISABLED" : "INVALID",
    paidProviderCalls: 0,
    normalNavigationResearchRoute: false,
    failures: [...new Set(failures)]
  };
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.valid) process.exitCode = 1;
}

main();
