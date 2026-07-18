import { createBetaControlledAdminQaReport } from "./beta-controlled-admin-qa";
import { createBetaDisabledServiceQaReport } from "./beta-disabled-service-qa";
import { createBetaIssueTriageExecutionReport } from "./beta-issue-triage-execution";
import type { TeoyubeBetaIssue } from "./beta-issue-triage-execution-contracts";
import { createBetaMobileAccessibilityQaReport } from "./beta-mobile-accessibility-qa";
import { createBetaReadinessScoreReport } from "./beta-readiness-score";
import type { TeoyubeBetaReadinessScoreInput } from "./beta-readiness-score-contracts";
import { createBetaRealDataQaReport } from "./beta-real-data-qa-execution";
import { createBetaReviewedContentGateQaReport } from "./beta-reviewed-content-gate-qa";
import { createBetaScriptureExplanationFallbackQaReport } from "./beta-scripture-explanation-fallback-qa";
import { createBetaUserJourneyQaReport } from "./beta-user-journey-qa-execution";
import {
  createManualBetaQaExecutionReport,
  createManualBetaQaExecutionRun
} from "./manual-beta-qa-execution-runner";

export type TeoyubeBetaQaExecutionPackageDecision =
  | "ready_for_owner_review"
  | "ready_with_warnings"
  | "needs_phase_5_3_fix_queue"
  | "blocked";

export type TeoyubeBetaQaExecutionPackage = {
  id: string;
  manualBetaQaExecutionReport: ReturnType<typeof createManualBetaQaExecutionReport>;
  realDataQaReport: ReturnType<typeof createBetaRealDataQaReport>;
  userJourneyQaReport: ReturnType<typeof createBetaUserJourneyQaReport>;
  scriptureExplanationFallbackQaReport: ReturnType<typeof createBetaScriptureExplanationFallbackQaReport>;
  mobileAccessibilityQaReport: ReturnType<typeof createBetaMobileAccessibilityQaReport>;
  reviewedContentGateQaReport: ReturnType<typeof createBetaReviewedContentGateQaReport>;
  controlledAdminQaReport: ReturnType<typeof createBetaControlledAdminQaReport>;
  disabledServiceQaReport: ReturnType<typeof createBetaDisabledServiceQaReport>;
  issueTriageReport: ReturnType<typeof createBetaIssueTriageExecutionReport>;
  readinessScoreReport: ReturnType<typeof createBetaReadinessScoreReport>;
  nextActionRecommendation: "Phase 5.3 - Beta Fix Queue, Readiness Remediation & Regression QA";
  noExternalSend: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubeBetaQaExecutionPackageReport = {
  valid: boolean;
  decision: TeoyubeBetaQaExecutionPackageDecision;
  package: TeoyubeBetaQaExecutionPackage;
  blockers: string[];
  warnings: string[];
  readinessScore: number;
  nextActionRecommendation: "Phase 5.3 - Beta Fix Queue, Readiness Remediation & Regression QA";
  noExternalSend: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function asStrings(values: unknown[], fallbackPrefix: string): string[] {
  return values.map((value, index) => {
    if (typeof value === "string") return value;
    if (value && typeof value === "object" && "message" in value && typeof (value as { message?: unknown }).message === "string") {
      return (value as { message: string }).message;
    }
    return `${fallbackPrefix} ${index + 1}`;
  });
}

function readinessInputFromReports(input: {
  realDataQaReport: ReturnType<typeof createBetaRealDataQaReport>;
  userJourneyQaReport: ReturnType<typeof createBetaUserJourneyQaReport>;
  scriptureExplanationFallbackQaReport: ReturnType<typeof createBetaScriptureExplanationFallbackQaReport>;
  mobileAccessibilityQaReport: ReturnType<typeof createBetaMobileAccessibilityQaReport>;
  reviewedContentGateQaReport: ReturnType<typeof createBetaReviewedContentGateQaReport>;
  controlledAdminQaReport: ReturnType<typeof createBetaControlledAdminQaReport>;
  disabledServiceQaReport: ReturnType<typeof createBetaDisabledServiceQaReport>;
  issueTriageReport: ReturnType<typeof createBetaIssueTriageExecutionReport>;
}): TeoyubeBetaReadinessScoreInput {
  return {
    blockerCountByArea: {
      real_data: input.realDataQaReport.blockers.length,
      user_journey: input.userJourneyQaReport.blockers.length,
      scripture_anchor: input.scriptureExplanationFallbackQaReport.blockers.length,
      explanation_trace: input.scriptureExplanationFallbackQaReport.blockers.length,
      fallback: input.scriptureExplanationFallbackQaReport.blockers.length,
      confidence_label: input.scriptureExplanationFallbackQaReport.blockers.length,
      mobile: input.mobileAccessibilityQaReport.blockers.length,
      accessibility: input.mobileAccessibilityQaReport.blockers.length,
      reviewed_content_gate: input.reviewedContentGateQaReport.blockers.length,
      controlled_admin: input.controlledAdminQaReport.blockers.length,
      disabled_services: input.disabledServiceQaReport.blockers.length,
      privacy_consent: input.disabledServiceQaReport.blockers.length,
      issue_triage: input.issueTriageReport.blockers.length
    },
    warningCountByArea: {
      real_data: input.realDataQaReport.warnings.length,
      user_journey: input.userJourneyQaReport.warnings.length,
      scripture_anchor: input.scriptureExplanationFallbackQaReport.warnings.length,
      explanation_trace: input.scriptureExplanationFallbackQaReport.warnings.length,
      fallback: input.scriptureExplanationFallbackQaReport.warnings.length,
      confidence_label: input.scriptureExplanationFallbackQaReport.warnings.length,
      mobile: input.mobileAccessibilityQaReport.warnings.length,
      accessibility: input.mobileAccessibilityQaReport.warnings.length,
      reviewed_content_gate: input.reviewedContentGateQaReport.warnings.length,
      controlled_admin: input.controlledAdminQaReport.warnings.length,
      disabled_services: input.disabledServiceQaReport.warnings.length,
      privacy_consent: input.disabledServiceQaReport.warnings.length,
      issue_triage: input.issueTriageReport.warnings.length
    }
  };
}

export function createBetaQaExecutionPackage(input: {
  issues?: TeoyubeBetaIssue[];
  manualBetaQaExecutionReport?: ReturnType<typeof createManualBetaQaExecutionReport>;
  realDataQaReport?: ReturnType<typeof createBetaRealDataQaReport>;
  userJourneyQaReport?: ReturnType<typeof createBetaUserJourneyQaReport>;
  scriptureExplanationFallbackQaReport?: ReturnType<typeof createBetaScriptureExplanationFallbackQaReport>;
  mobileAccessibilityQaReport?: ReturnType<typeof createBetaMobileAccessibilityQaReport>;
  reviewedContentGateQaReport?: ReturnType<typeof createBetaReviewedContentGateQaReport>;
  controlledAdminQaReport?: ReturnType<typeof createBetaControlledAdminQaReport>;
  disabledServiceQaReport?: ReturnType<typeof createBetaDisabledServiceQaReport>;
  issueTriageReport?: ReturnType<typeof createBetaIssueTriageExecutionReport>;
  readinessScoreReport?: ReturnType<typeof createBetaReadinessScoreReport>;
} = {}): TeoyubeBetaQaExecutionPackage {
  const manualBetaQaExecutionReport = input.manualBetaQaExecutionReport || createManualBetaQaExecutionReport(createManualBetaQaExecutionRun());
  const realDataQaReport = input.realDataQaReport || createBetaRealDataQaReport();
  const userJourneyQaReport = input.userJourneyQaReport || createBetaUserJourneyQaReport();
  const scriptureExplanationFallbackQaReport = input.scriptureExplanationFallbackQaReport || createBetaScriptureExplanationFallbackQaReport();
  const mobileAccessibilityQaReport = input.mobileAccessibilityQaReport || createBetaMobileAccessibilityQaReport();
  const reviewedContentGateQaReport = input.reviewedContentGateQaReport || createBetaReviewedContentGateQaReport();
  const controlledAdminQaReport = input.controlledAdminQaReport || createBetaControlledAdminQaReport();
  const disabledServiceQaReport = input.disabledServiceQaReport || createBetaDisabledServiceQaReport();
  const issueTriageReport = input.issueTriageReport || createBetaIssueTriageExecutionReport(input.issues || []);
  const readinessScoreReport = input.readinessScoreReport || createBetaReadinessScoreReport(readinessInputFromReports({
    realDataQaReport,
    userJourneyQaReport,
    scriptureExplanationFallbackQaReport,
    mobileAccessibilityQaReport,
    reviewedContentGateQaReport,
    controlledAdminQaReport,
    disabledServiceQaReport,
    issueTriageReport
  }));

  return {
    id: "phase_5_2_beta_qa_execution_package",
    manualBetaQaExecutionReport,
    realDataQaReport,
    userJourneyQaReport,
    scriptureExplanationFallbackQaReport,
    mobileAccessibilityQaReport,
    reviewedContentGateQaReport,
    controlledAdminQaReport,
    disabledServiceQaReport,
    issueTriageReport,
    readinessScoreReport,
    nextActionRecommendation: "Phase 5.3 - Beta Fix Queue, Readiness Remediation & Regression QA",
    noExternalSend: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}

export function getBetaQaExecutionPackageBlockers(pkg: TeoyubeBetaQaExecutionPackage): string[] {
  return [
    ...asStrings(pkg.manualBetaQaExecutionReport.blockers, "Manual QA blocker"),
    ...pkg.realDataQaReport.blockers,
    ...pkg.userJourneyQaReport.blockers,
    ...pkg.scriptureExplanationFallbackQaReport.blockers,
    ...pkg.mobileAccessibilityQaReport.blockers,
    ...pkg.reviewedContentGateQaReport.blockers,
    ...pkg.controlledAdminQaReport.blockers,
    ...pkg.disabledServiceQaReport.blockers,
    ...pkg.issueTriageReport.blockers.map((entry) => entry.message),
    ...pkg.readinessScoreReport.blockers.map((entry) => entry.message)
  ];
}

export function getBetaQaExecutionPackageWarnings(pkg: TeoyubeBetaQaExecutionPackage): string[] {
  return [
    ...asStrings(pkg.manualBetaQaExecutionReport.warnings, "Manual QA warning"),
    ...pkg.realDataQaReport.warnings,
    ...pkg.userJourneyQaReport.warnings,
    ...pkg.scriptureExplanationFallbackQaReport.warnings,
    ...pkg.mobileAccessibilityQaReport.warnings,
    ...pkg.reviewedContentGateQaReport.warnings,
    ...pkg.controlledAdminQaReport.warnings,
    ...pkg.disabledServiceQaReport.warnings,
    ...pkg.issueTriageReport.warnings.map((entry) => entry.message),
    ...pkg.readinessScoreReport.warnings.map((entry) => entry.message)
  ];
}

export function createBetaQaExecutionPackageDecision(pkg: TeoyubeBetaQaExecutionPackage): TeoyubeBetaQaExecutionPackageDecision {
  const blockers = getBetaQaExecutionPackageBlockers(pkg);
  if (blockers.length || pkg.readinessScoreReport.decision === "blocked") return "blocked";
  if (pkg.readinessScoreReport.decision === "needs_phase_5_3_fix_queue") return "needs_phase_5_3_fix_queue";
  return getBetaQaExecutionPackageWarnings(pkg).length ? "ready_with_warnings" : "ready_for_owner_review";
}

export function validateBetaQaExecutionPackage(pkg: TeoyubeBetaQaExecutionPackage): TeoyubeBetaQaExecutionPackageReport {
  return createBetaQaExecutionPackageReport(pkg);
}

export function createBetaQaExecutionPackageReport(pkg: TeoyubeBetaQaExecutionPackage): TeoyubeBetaQaExecutionPackageReport {
  const blockers = getBetaQaExecutionPackageBlockers(pkg);
  return {
    valid: blockers.length === 0,
    decision: createBetaQaExecutionPackageDecision(pkg),
    package: pkg,
    blockers,
    warnings: getBetaQaExecutionPackageWarnings(pkg),
    readinessScore: pkg.readinessScoreReport.score,
    nextActionRecommendation: "Phase 5.3 - Beta Fix Queue, Readiness Remediation & Regression QA",
    noExternalSend: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
