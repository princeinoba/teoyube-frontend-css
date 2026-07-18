import { createPhase51Package, createPhase51PackageReport, type TeoyubePhase51PackageModel } from "./phase-5-1-package";
import { createPhase52Package, createPhase52PackageReport, type TeoyubePhase52PackageModel } from "./phase-5-2-package";
import { createPhase53Package, createPhase53PackageReport, type TeoyubePhase53PackageModel } from "./phase-5-3-package";
import { createPhase54Package, createPhase54PackageReport, type TeoyubePhase54PackageModel } from "./phase-5-4-package";

export type TeoyubeBetaReadinessEvidenceArchiveItem = {
  id: string;
  phase: "phase_5_1" | "phase_5_2" | "phase_5_3" | "phase_5_4";
  area:
    | "preparation"
    | "qa_execution"
    | "issue_triage"
    | "readiness_score"
    | "remediation"
    | "regression_qa"
    | "go_no_go"
    | "owner_approval"
    | "service_disabled"
    | "launch_boundary"
    | "operational_handoff";
  label: string;
  status: "confirmed" | "warning" | "blocked" | "not_reviewed";
  source: string;
  details: string;
};

export type TeoyubeBetaReadinessEvidenceArchive = {
  id: string;
  items: TeoyubeBetaReadinessEvidenceArchiveItem[];
  gaps: string[];
  noExternalWrite: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noFeedbackCollectedAutomatically: true;
  noUsersContacted: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubeBetaReadinessEvidenceArchiveReport = {
  valid: boolean;
  archive: TeoyubeBetaReadinessEvidenceArchive;
  blockers: string[];
  warnings: string[];
  noExternalWrite: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noFeedbackCollectedAutomatically: true;
  noUsersContacted: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubeBetaReadinessEvidenceArchiveInput = {
  phase51Package?: TeoyubePhase51PackageModel;
  phase52Package?: TeoyubePhase52PackageModel;
  phase53Package?: TeoyubePhase53PackageModel;
  phase54Package?: TeoyubePhase54PackageModel;
};

function phasePackages(input: TeoyubeBetaReadinessEvidenceArchiveInput = {}) {
  const phase51Package = input.phase51Package || createPhase51Package({ ownerReviewed: true });
  const phase52Package = input.phase52Package || createPhase52Package({ ownerReviewed: true });
  const phase53Package = input.phase53Package || createPhase53Package({ ownerReviewed: true });
  const phase54Package = input.phase54Package || createPhase54Package({ ownerReviewed: true });
  return {
    phase51Package,
    phase51Report: createPhase51PackageReport(phase51Package),
    phase52Package,
    phase52Report: createPhase52PackageReport(phase52Package),
    phase53Package,
    phase53Report: createPhase53PackageReport(phase53Package),
    phase54Package,
    phase54Report: createPhase54PackageReport(phase54Package)
  };
}

function item(
  id: string,
  phase: TeoyubeBetaReadinessEvidenceArchiveItem["phase"],
  area: TeoyubeBetaReadinessEvidenceArchiveItem["area"],
  label: string,
  status: TeoyubeBetaReadinessEvidenceArchiveItem["status"],
  source: string,
  details: string
): TeoyubeBetaReadinessEvidenceArchiveItem {
  return { id, phase, area, label, status, source, details };
}

function status(valid: boolean, warningCount = 0): TeoyubeBetaReadinessEvidenceArchiveItem["status"] {
  if (!valid) return "blocked";
  return warningCount ? "warning" : "confirmed";
}

export function summarizePhase51Evidence(input: TeoyubeBetaReadinessEvidenceArchiveInput = {}): TeoyubeBetaReadinessEvidenceArchiveItem[] {
  const packages = phasePackages(input);
  return [
    item("phase_5_1_preparation", "phase_5_1", "preparation", "Controlled beta preparation", status(packages.phase51Package.controlledBetaPreparation.valid, packages.phase51Package.controlledBetaPreparation.warnings.length), "phase-5-1-package.ts", `Decision: ${packages.phase51Package.controlledBetaPreparation.decision}.`),
    item("phase_5_1_service_gate", "phase_5_1", "service_disabled", "Service gate review", status(packages.phase51Package.serviceGateReview.valid, packages.phase51Package.serviceGateReview.warnings.length), "service-gate-review.ts", `${packages.phase51Package.serviceGateReview.serviceConnectedCount} connected service(s).`),
    item("phase_5_1_privacy", "phase_5_1", "preparation", "Privacy/security readiness", status(packages.phase51Package.privacySecurityReadiness.valid, packages.phase51Package.privacySecurityReadiness.warnings.length), "privacy-security-readiness.ts", `${packages.phase51Package.privacySecurityReadiness.checks.length} check(s).`),
    item("phase_5_1_issue_feedback", "phase_5_1", "preparation", "Issue intake and feedback readiness", packages.phase51Package.betaIssueIntakePlan.valid && packages.phase51Package.betaFeedbackReadinessPlan.valid ? "confirmed" : "blocked", "beta-issue-intake-plan.ts, beta-feedback-readiness-plan.ts", "Manual issue intake and manual feedback readiness are present.")
  ];
}

export function summarizePhase52Evidence(input: TeoyubeBetaReadinessEvidenceArchiveInput = {}): TeoyubeBetaReadinessEvidenceArchiveItem[] {
  const packages = phasePackages(input);
  const qa = packages.phase52Package.betaQaExecutionPackage;
  return [
    item("phase_5_2_qa_execution", "phase_5_2", "qa_execution", "Manual beta QA execution", status(qa.manualBetaQaExecutionReport.valid, qa.manualBetaQaExecutionReport.warnings.length), "manual-beta-qa-execution-runner.ts", `${qa.manualBetaQaExecutionReport.totalScenarioCount} QA scenario(s) represented.`),
    item("phase_5_2_issue_triage", "phase_5_2", "issue_triage", "Issue triage evidence", status(qa.issueTriageReport.valid, qa.issueTriageReport.warnings.length), "beta-issue-triage-execution.ts", `${qa.issueTriageReport.issues.length} issue(s) triaged.`),
    item("phase_5_2_readiness_score", "phase_5_2", "readiness_score", "Readiness score before remediation", packages.phase52Report.readinessScore >= 75 ? "confirmed" : "warning", "beta-readiness-score.ts", `Score: ${packages.phase52Report.readinessScore}.`),
    item("phase_5_2_disabled_service", "phase_5_2", "service_disabled", "Disabled service QA", status(qa.disabledServiceQaReport.valid, qa.disabledServiceQaReport.warnings.length), "beta-disabled-service-qa.ts", "Disabled service QA remains in memory.")
  ];
}

export function summarizePhase53Evidence(input: TeoyubeBetaReadinessEvidenceArchiveInput = {}): TeoyubeBetaReadinessEvidenceArchiveItem[] {
  const packages = phasePackages(input);
  const remediation = packages.phase53Package.betaRemediationPackage;
  return [
    item("phase_5_3_fix_queue", "phase_5_3", "remediation", "Beta fix queue", status(remediation.betaFixQueueReport.valid, remediation.betaFixQueueReport.warnings.length), "beta-fix-queue-manager.ts", `${remediation.betaFixQueueReport.itemCount} fix item(s).`),
    item("phase_5_3_remediation", "phase_5_3", "remediation", "Readiness remediation", status(remediation.readinessRemediationPlanReport.valid, remediation.readinessRemediationPlanReport.warnings.length), "readiness-remediation-planner.ts", `${remediation.readinessRemediationPlanReport.safeItemCount} safe item(s).`),
    item("phase_5_3_regression", "phase_5_3", "regression_qa", "Regression QA", status(remediation.betaRegressionQaReport.valid, remediation.betaRegressionQaReport.warnings.length), "beta-regression-qa-runner.ts", `${remediation.betaRegressionQaReport.checks.length} regression check(s).`),
    item("phase_5_3_post_score", "phase_5_3", "readiness_score", "Post-remediation readiness score", remediation.postRemediationReadinessScoreReport.valid ? "confirmed" : "blocked", "post-remediation-readiness-score.ts", `Score: ${remediation.postRemediationReadinessScoreReport.score}.`)
  ];
}

export function summarizePhase54Evidence(input: TeoyubeBetaReadinessEvidenceArchiveInput = {}): TeoyubeBetaReadinessEvidenceArchiveItem[] {
  const packages = phasePackages(input);
  const readiness = packages.phase54Package.controlledBetaReadinessPackage;
  return [
    item("phase_5_4_go_no_go", "phase_5_4", "go_no_go", "Controlled beta go/no-go", status(readiness.goNoGoReport.valid, readiness.goNoGoReport.warnings.length), "controlled-beta-go-no-go.ts", `Decision: ${readiness.goNoGoReport.decision}.`),
    item("phase_5_4_launch_boundary", "phase_5_4", "launch_boundary", "Launch boundary validator", status(readiness.launchBoundaryReport.valid, readiness.launchBoundaryReport.warnings.length), "beta-launch-boundary-validator.ts", `${readiness.launchBoundaryReport.checks.length} boundary check(s).`),
    item("phase_5_4_owner_approval", "phase_5_4", "owner_approval", "Owner approval evidence", readiness.ownerApprovalReport.status === "approved" ? "confirmed" : "not_reviewed", "controlled-beta-owner-approval.ts", `Decision: ${readiness.ownerApprovalReport.decision}.`),
    item("phase_5_4_handoff", "phase_5_4", "operational_handoff", "Operational handoff", status(readiness.operationalHandoffReport.valid, readiness.operationalHandoffReport.warnings.length), "beta-operational-handoff.ts", `${readiness.operationalHandoffReport.items.length} handoff item(s).`)
  ];
}

export function getBetaReadinessEvidenceGaps(input: TeoyubeBetaReadinessEvidenceArchiveInput = {}): string[] {
  return [
    ...summarizePhase51Evidence(input),
    ...summarizePhase52Evidence(input),
    ...summarizePhase53Evidence(input),
    ...summarizePhase54Evidence(input)
  ].filter((entry) => entry.status === "blocked").map((entry) => `${entry.label}: ${entry.details}`);
}

export function createBetaReadinessEvidenceArchive(input: TeoyubeBetaReadinessEvidenceArchiveInput = {}): TeoyubeBetaReadinessEvidenceArchive {
  return {
    id: "phase_5_5_beta_readiness_evidence_archive",
    items: [
      ...summarizePhase51Evidence(input),
      ...summarizePhase52Evidence(input),
      ...summarizePhase53Evidence(input),
      ...summarizePhase54Evidence(input)
    ],
    gaps: getBetaReadinessEvidenceGaps(input),
    noExternalWrite: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noFeedbackCollectedAutomatically: true,
    noUsersContacted: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}

export function createBetaReadinessEvidenceArchiveReport(input: TeoyubeBetaReadinessEvidenceArchiveInput = {}): TeoyubeBetaReadinessEvidenceArchiveReport {
  const archive = createBetaReadinessEvidenceArchive(input);
  return {
    valid: archive.gaps.length === 0,
    archive,
    blockers: archive.gaps,
    warnings: archive.items.filter((entry) => entry.status === "warning" || entry.status === "not_reviewed").map((entry) => `${entry.label}: ${entry.details}`),
    noExternalWrite: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noFeedbackCollectedAutomatically: true,
    noUsersContacted: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
