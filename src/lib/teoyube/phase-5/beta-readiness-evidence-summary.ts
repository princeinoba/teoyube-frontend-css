import {
  createPhase51Package,
  createPhase51PackageReport,
  type TeoyubePhase51PackageModel
} from "./phase-5-1-package";
import {
  createPhase52Package,
  createPhase52PackageReport,
  type TeoyubePhase52PackageModel
} from "./phase-5-2-package";
import {
  createPhase53Package,
  createPhase53PackageReport,
  type TeoyubePhase53PackageModel
} from "./phase-5-3-package";

export type TeoyubeBetaReadinessEvidenceArea =
  | "preparation"
  | "manual_qa"
  | "remediation"
  | "regression_qa"
  | "service_gate"
  | "privacy_security"
  | "owner_review";

export type TeoyubeBetaReadinessEvidenceStatus = "confirmed" | "warning" | "blocked" | "not_reviewed";

export type TeoyubeBetaReadinessEvidenceItem = {
  id: string;
  area: TeoyubeBetaReadinessEvidenceArea;
  label: string;
  status: TeoyubeBetaReadinessEvidenceStatus;
  source: string;
  details: string;
};

export type TeoyubeBetaReadinessEvidenceSummary = {
  id: string;
  readinessScoreBeforeRemediation: number;
  postRemediationReadinessScore: number;
  postRemediationReadinessBand: string;
  qaBlockersResolved: number;
  qaBlockersRemaining: string[];
  safeFixesApplied: string[];
  fixesDeferred: number;
  fixesRequiringOwnerReview: number;
  preparationEvidence: TeoyubeBetaReadinessEvidenceItem[];
  manualQaEvidence: TeoyubeBetaReadinessEvidenceItem[];
  remediationEvidence: TeoyubeBetaReadinessEvidenceItem[];
  regressionQaEvidence: TeoyubeBetaReadinessEvidenceItem[];
  serviceGateEvidence: TeoyubeBetaReadinessEvidenceItem[];
  privacySecurityEvidence: TeoyubeBetaReadinessEvidenceItem[];
  ownerReviewEvidence: TeoyubeBetaReadinessEvidenceItem[];
  disabledServiceConfirmed: boolean;
  reviewedContentGateConfirmed: boolean;
  controlledAdminPrototypeConfirmed: boolean;
  scriptureExplanationFallbackConfirmed: boolean;
  mobileAccessibilityConfirmed: boolean;
  privacyConsentConfirmed: boolean;
  noEvidencePersistedExternally: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubeBetaReadinessEvidenceReport = {
  valid: boolean;
  summary: TeoyubeBetaReadinessEvidenceSummary;
  blockers: string[];
  warnings: string[];
  noEvidencePersistedExternally: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubeBetaReadinessEvidenceInput = {
  phase51Package?: TeoyubePhase51PackageModel;
  phase52Package?: TeoyubePhase52PackageModel;
  phase53Package?: TeoyubePhase53PackageModel;
};

type PhaseEvidenceReports = {
  phase51Package: TeoyubePhase51PackageModel;
  phase51Report: ReturnType<typeof createPhase51PackageReport>;
  phase52Package: TeoyubePhase52PackageModel;
  phase52Report: ReturnType<typeof createPhase52PackageReport>;
  phase53Package: TeoyubePhase53PackageModel;
  phase53Report: ReturnType<typeof createPhase53PackageReport>;
};

function createReports(input: TeoyubeBetaReadinessEvidenceInput = {}): PhaseEvidenceReports {
  const phase51Package = input.phase51Package || createPhase51Package({ ownerReviewed: true });
  const phase52Package = input.phase52Package || createPhase52Package({ ownerReviewed: true });
  const phase53Package = input.phase53Package || createPhase53Package({ ownerReviewed: true });
  return {
    phase51Package,
    phase51Report: createPhase51PackageReport(phase51Package),
    phase52Package,
    phase52Report: createPhase52PackageReport(phase52Package),
    phase53Package,
    phase53Report: createPhase53PackageReport(phase53Package)
  };
}

function item(
  id: string,
  area: TeoyubeBetaReadinessEvidenceArea,
  label: string,
  status: TeoyubeBetaReadinessEvidenceStatus,
  source: string,
  details: string
): TeoyubeBetaReadinessEvidenceItem {
  return { id, area, label, status, source, details };
}

function status(valid: boolean, warnings: unknown[] = []): TeoyubeBetaReadinessEvidenceStatus {
  if (!valid) return "blocked";
  return warnings.length ? "warning" : "confirmed";
}

export function summarizeBetaPreparationEvidence(input: TeoyubeBetaReadinessEvidenceInput = {}): TeoyubeBetaReadinessEvidenceItem[] {
  const reports = createReports(input);
  return [
    item("controlled_beta_preparation", "preparation", "Controlled beta preparation", status(reports.phase51Package.controlledBetaPreparation.valid, reports.phase51Package.controlledBetaPreparation.warnings), "controlled-beta-preparation.ts", `Decision: ${reports.phase51Package.controlledBetaPreparation.decision}.`),
    item("manual_qa_execution_plan", "preparation", "Manual QA execution plan", status(reports.phase51Package.manualBetaQaExecutionPlan.valid, reports.phase51Package.manualBetaQaExecutionPlan.warnings), "manual-beta-qa-execution-plan.ts", `${reports.phase51Package.manualBetaQaExecutionPlan.scenarioCount} manual scenario(s) planned.`),
    item("issue_intake_plan", "preparation", "Issue intake plan", reports.phase51Package.betaIssueIntakePlan.valid ? "confirmed" : "blocked", "beta-issue-intake-plan.ts", `${reports.phase51Package.betaIssueIntakePlan.plan.categories.length} manual issue categories defined.`),
    item("feedback_readiness_plan", "preparation", "Feedback readiness plan", status(reports.phase51Package.betaFeedbackReadinessPlan.valid, reports.phase51Package.betaFeedbackReadinessPlan.warnings), "beta-feedback-readiness-plan.ts", "Feedback remains manual-only with no automatic collection.")
  ];
}

export function summarizeManualQaEvidence(input: TeoyubeBetaReadinessEvidenceInput = {}): TeoyubeBetaReadinessEvidenceItem[] {
  const reports = createReports(input);
  const pkg = reports.phase52Package.betaQaExecutionPackage;
  return [
    item("manual_beta_qa_execution", "manual_qa", "Manual beta QA execution", status(pkg.manualBetaQaExecutionReport.valid, pkg.manualBetaQaExecutionReport.warnings), "manual-beta-qa-execution-runner.ts", `Execution report decision: ${pkg.manualBetaQaExecutionReport.decision}.`),
    item("readiness_score_before_remediation", "manual_qa", "Readiness score before remediation", reports.phase52Report.readinessScore >= 75 ? "confirmed" : "warning", "beta-readiness-score.ts", `Score: ${reports.phase52Report.readinessScore}.`),
    item("issue_triage_execution", "manual_qa", "Issue triage execution", status(pkg.issueTriageReport.valid, pkg.issueTriageReport.warnings), "beta-issue-triage-execution.ts", `${pkg.issueTriageReport.issues.length} issue(s) triaged.`)
  ];
}

export function summarizeRemediationEvidence(input: TeoyubeBetaReadinessEvidenceInput = {}): TeoyubeBetaReadinessEvidenceItem[] {
  const reports = createReports(input);
  const remediation = reports.phase53Package.betaRemediationPackage;
  return [
    item("beta_fix_queue", "remediation", "Beta fix queue", status(remediation.betaFixQueueReport.valid, remediation.betaFixQueueReport.warnings), "beta-fix-queue-manager.ts", `${remediation.betaFixQueueReport.itemCount} fix item(s) represented.`),
    item("readiness_remediation_plan", "remediation", "Readiness remediation plan", status(remediation.readinessRemediationPlanReport.valid, remediation.readinessRemediationPlanReport.warnings), "readiness-remediation-planner.ts", `${remediation.readinessRemediationPlanReport.safeItemCount} safe item(s), ${remediation.readinessRemediationPlanReport.deferredItemCount} deferred item(s).`),
    item("remediation_safety_report", "remediation", "Remediation safety report", status(remediation.remediationSafetyReport.valid, remediation.remediationSafetyReport.warnings), "readiness-remediation-safety-validator.ts", `Decision: ${remediation.remediationSafetyReport.decision}.`),
    item("post_remediation_readiness_score", "remediation", "Post-remediation readiness score", remediation.postRemediationReadinessScoreReport.valid ? "confirmed" : "blocked", "post-remediation-readiness-score.ts", `Score: ${remediation.postRemediationReadinessScoreReport.score} (${remediation.postRemediationReadinessScoreReport.band}).`)
  ];
}

export function summarizeRegressionQaEvidence(input: TeoyubeBetaReadinessEvidenceInput = {}): TeoyubeBetaReadinessEvidenceItem[] {
  const reports = createReports(input);
  const remediation = reports.phase53Package.betaRemediationPackage;
  return [
    item("beta_regression_qa", "regression_qa", "Beta regression QA", status(remediation.betaRegressionQaReport.valid, remediation.betaRegressionQaReport.warnings), "beta-regression-qa-runner.ts", `Decision: ${remediation.betaRegressionQaReport.decision}.`),
    item("scripture_explanation_fallback_regression", "regression_qa", "Scripture/explanation/fallback regression", status(remediation.scriptureExplanationFallbackRegressionQaReport.valid, remediation.scriptureExplanationFallbackRegressionQaReport.warnings), "beta-scripture-explanation-fallback-regression-qa.ts", "Scripture anchors, explanation traces, fallback safety, confidence labels, and bounded language remain protected."),
    item("mobile_accessibility_regression", "regression_qa", "Mobile/accessibility regression", status(remediation.mobileAccessibilityRegressionQaReport.valid, remediation.mobileAccessibilityRegressionQaReport.warnings), "beta-mobile-accessibility-regression-qa.ts", "Mobile and accessibility regression checks remain available.")
  ];
}

export function summarizeServiceGateEvidence(input: TeoyubeBetaReadinessEvidenceInput = {}): TeoyubeBetaReadinessEvidenceItem[] {
  const reports = createReports(input);
  const remediation = reports.phase53Package.betaRemediationPackage;
  return [
    item("service_gate_review", "service_gate", "Service gate review", status(reports.phase51Package.serviceGateReview.valid, reports.phase51Package.serviceGateReview.warnings), "service-gate-review.ts", `${reports.phase51Package.serviceGateReview.serviceConnectedCount} connected service(s).`),
    item("disabled_service_regression", "service_gate", "Disabled service regression", status(remediation.disabledServiceRegressionQaReport.valid, remediation.disabledServiceRegressionQaReport.warnings), "beta-disabled-service-regression-qa.ts", "External services remain disabled or plan-only.")
  ];
}

export function summarizePrivacySecurityEvidence(input: TeoyubeBetaReadinessEvidenceInput = {}): TeoyubeBetaReadinessEvidenceItem[] {
  const reports = createReports(input);
  return [
    item("privacy_security_readiness", "privacy_security", "Privacy/security readiness", status(reports.phase51Package.privacySecurityReadiness.valid, reports.phase51Package.privacySecurityReadiness.warnings), "privacy-security-readiness.ts", `${reports.phase51Package.privacySecurityReadiness.checks.length} privacy/security check(s) represented.`),
    item("browser_persistence_boundary", "privacy_security", "Browser persistence boundary", reports.phase51Package.noBrowserPersistenceRequired ? "confirmed" : "blocked", "phase-5-1-package.ts", "No localStorage, cookies, or IndexedDB are required for sensitive personalization.")
  ];
}

export function summarizeOwnerReviewEvidence(input: TeoyubeBetaReadinessEvidenceInput = {}): TeoyubeBetaReadinessEvidenceItem[] {
  const reports = createReports(input);
  return [
    item("phase_5_1_owner_review", "owner_review", "Phase 5.1 owner review", reports.phase51Package.ownerReview.reviewed ? "confirmed" : "not_reviewed", "phase-5-1-owner-review.ts", `Decision: ${reports.phase51Package.ownerReviewReport.decision}.`),
    item("phase_5_2_owner_review", "owner_review", "Phase 5.2 owner review", reports.phase52Package.ownerReview.reviewed ? "confirmed" : "not_reviewed", "phase-5-2-owner-review.ts", `Decision: ${reports.phase52Package.ownerReviewReport.decision}.`),
    item("phase_5_3_owner_review", "owner_review", "Phase 5.3 owner review", reports.phase53Package.ownerReview.reviewed ? "confirmed" : "not_reviewed", "phase-5-3-owner-review.ts", `Decision: ${reports.phase53Package.ownerReviewReport.decision}.`)
  ];
}

export function createBetaReadinessEvidenceSummary(input: TeoyubeBetaReadinessEvidenceInput = {}): TeoyubeBetaReadinessEvidenceSummary {
  const reports = createReports(input);
  const remediation = reports.phase53Package.betaRemediationPackage;
  const preRemediationBlockers = reports.phase52Report.blockers.length;
  const postRemediationBlockers = reports.phase53Report.blockers.length;
  return {
    id: "phase_5_4_beta_readiness_evidence_summary",
    readinessScoreBeforeRemediation: reports.phase52Report.readinessScore,
    postRemediationReadinessScore: remediation.postRemediationReadinessScoreReport.score,
    postRemediationReadinessBand: remediation.postRemediationReadinessScoreReport.band,
    qaBlockersResolved: Math.max(0, preRemediationBlockers - postRemediationBlockers),
    qaBlockersRemaining: reports.phase53Report.blockers,
    safeFixesApplied: remediation.safePatchSummary.filter((entry) => entry.applied).map((entry) => entry.id),
    fixesDeferred: remediation.readinessRemediationPlanReport.deferredItemCount,
    fixesRequiringOwnerReview: remediation.readinessRemediationPlanReport.ownerReviewItemCount,
    preparationEvidence: summarizeBetaPreparationEvidence(input),
    manualQaEvidence: summarizeManualQaEvidence(input),
    remediationEvidence: summarizeRemediationEvidence(input),
    regressionQaEvidence: summarizeRegressionQaEvidence(input),
    serviceGateEvidence: summarizeServiceGateEvidence(input),
    privacySecurityEvidence: summarizePrivacySecurityEvidence(input),
    ownerReviewEvidence: summarizeOwnerReviewEvidence(input),
    disabledServiceConfirmed: remediation.disabledServiceRegressionQaReport.valid,
    reviewedContentGateConfirmed: remediation.reviewedContentGateRegressionQaReport.valid,
    controlledAdminPrototypeConfirmed: reports.phase52Package.betaQaExecutionPackage.controlledAdminQaReport.valid,
    scriptureExplanationFallbackConfirmed: remediation.scriptureExplanationFallbackRegressionQaReport.valid,
    mobileAccessibilityConfirmed: remediation.mobileAccessibilityRegressionQaReport.valid,
    privacyConsentConfirmed: reports.phase51Package.privacySecurityReadiness.valid,
    noEvidencePersistedExternally: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}

export function createBetaReadinessEvidenceReport(input: TeoyubeBetaReadinessEvidenceInput = {}): TeoyubeBetaReadinessEvidenceReport {
  const summary = createBetaReadinessEvidenceSummary(input);
  const blockers = summary.qaBlockersRemaining;
  const warnings = [
    ...(summary.fixesDeferred ? [`${summary.fixesDeferred} remediation item(s) remain deferred.`] : []),
    ...(summary.fixesRequiringOwnerReview ? [`${summary.fixesRequiringOwnerReview} remediation item(s) require owner review.`] : []),
    "Phase 5.4 evidence is in-memory decision support and is not persisted externally."
  ];
  return {
    valid: blockers.length === 0,
    summary,
    blockers,
    warnings,
    noEvidencePersistedExternally: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
