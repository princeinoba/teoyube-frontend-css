import {
  createBetaDisabledServiceRegressionQaReport
} from "./beta-disabled-service-regression-qa";
import {
  createBetaFixQueue,
  createBetaFixQueueReport
} from "./beta-fix-queue-manager";
import type { TeoyubeBetaFixQueue } from "./beta-fix-queue-contracts";
import {
  createBetaIssueToFixConversionReport,
  type TeoyubeBetaIssueToFixConversionReport
} from "./beta-issue-to-fix-converter";
import type { TeoyubeBetaIssue } from "./beta-issue-triage-execution-contracts";
import { createBetaMobileAccessibilityRegressionQaReport } from "./beta-mobile-accessibility-regression-qa";
import {
  createBetaRegressionQaReport,
  createBetaRegressionQaRun
} from "./beta-regression-qa-runner";
import { createBetaReviewedContentGateRegressionQaReport } from "./beta-reviewed-content-gate-regression-qa";
import { createBetaScriptureExplanationFallbackRegressionQaReport } from "./beta-scripture-explanation-fallback-regression-qa";
import { createPostRemediationReadinessScoreReport } from "./post-remediation-readiness-score";
import {
  createReadinessRemediationPlan,
  createReadinessRemediationPlanReport
} from "./readiness-remediation-planner";
import {
  createReadinessRemediationSafetyReport,
  type TeoyubeReadinessRemediationSafetyReport
} from "./readiness-remediation-safety-validator";
import type { TeoyubeReadinessRemediationPlan } from "./readiness-remediation-contracts";

export type TeoyubeBetaSafePatchSummaryItem = {
  id: string;
  fileChanged: string;
  issueAddressed: string;
  safetyReason: string;
  regressionChecksRequired: string[];
  applied: boolean;
};

export type TeoyubeBetaRemediationPackageDecision =
  | "ready_for_owner_review"
  | "ready_with_warnings"
  | "blocked"
  | "empty";

export type TeoyubeBetaRemediationPackage = {
  id: string;
  betaFixQueueReport: ReturnType<typeof createBetaFixQueueReport>;
  issueToFixConversionReport: TeoyubeBetaIssueToFixConversionReport;
  readinessRemediationPlanReport: ReturnType<typeof createReadinessRemediationPlanReport>;
  remediationSafetyReport: TeoyubeReadinessRemediationSafetyReport;
  safePatchSummary: TeoyubeBetaSafePatchSummaryItem[];
  betaRegressionQaReport: ReturnType<typeof createBetaRegressionQaReport>;
  disabledServiceRegressionQaReport: ReturnType<typeof createBetaDisabledServiceRegressionQaReport>;
  scriptureExplanationFallbackRegressionQaReport: ReturnType<typeof createBetaScriptureExplanationFallbackRegressionQaReport>;
  reviewedContentGateRegressionQaReport: ReturnType<typeof createBetaReviewedContentGateRegressionQaReport>;
  mobileAccessibilityRegressionQaReport: ReturnType<typeof createBetaMobileAccessibilityRegressionQaReport>;
  postRemediationReadinessScoreReport: ReturnType<typeof createPostRemediationReadinessScoreReport>;
  nextActionRecommendation: "Phase 5.4 - Controlled Beta Go/No-Go, Owner Approval & Operational Handoff";
  noExternalSend: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubeBetaRemediationPackageReport = {
  valid: boolean;
  decision: TeoyubeBetaRemediationPackageDecision;
  package: TeoyubeBetaRemediationPackage;
  blockers: string[];
  warnings: string[];
  postRemediationReadinessScore: number;
  postRemediationReadinessBand: string;
  nextActionRecommendation: "Phase 5.4 - Controlled Beta Go/No-Go, Owner Approval & Operational Handoff";
  noExternalSend: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function defaultSafePatchSummary(): TeoyubeBetaSafePatchSummaryItem[] {
  return [
    {
      id: "phase_5_3_exports_docs_status",
      fileChanged: "src/lib/teoyube/phase-5/index.ts, src/lib/teoyube/index.ts, docs/teoyube/**, roadmap/status files",
      issueAddressed: "Phase 5.3 framework, exports, documentation, and roadmap status needed to exist for controlled remediation review.",
      safetyReason: "Documentation/export/status patch only; it does not alter production JSON content, services, analytics, persistence, live AI, admin auth, CMS, user contact, Scripture interpretation, or runtime personalization.",
      regressionChecksRequired: [
        "Phase 5.3 smoke check",
        "Phase 5.3 audit",
        "disabled service regression QA",
        "Scripture/explanation/fallback regression QA"
      ],
      applied: true
    }
  ];
}

function scoreInputFromReports(input: {
  betaFixQueueReport: ReturnType<typeof createBetaFixQueueReport>;
  betaRegressionQaReport: ReturnType<typeof createBetaRegressionQaReport>;
  disabledServiceRegressionQaReport: ReturnType<typeof createBetaDisabledServiceRegressionQaReport>;
  scriptureExplanationFallbackRegressionQaReport: ReturnType<typeof createBetaScriptureExplanationFallbackRegressionQaReport>;
  reviewedContentGateRegressionQaReport: ReturnType<typeof createBetaReviewedContentGateRegressionQaReport>;
  mobileAccessibilityRegressionQaReport: ReturnType<typeof createBetaMobileAccessibilityRegressionQaReport>;
}) {
  return {
    blockerCountByArea: {
      issue_triage: input.betaFixQueueReport.blockers.length,
      user_journey: input.betaRegressionQaReport.blockers.filter((entry) => entry.area === "user_journey").length,
      real_data: input.betaRegressionQaReport.blockers.filter((entry) => entry.area === "real_data").length,
      disabled_services: input.disabledServiceRegressionQaReport.blockers.length,
      scripture_anchor: input.scriptureExplanationFallbackRegressionQaReport.blockers.length,
      explanation_trace: input.scriptureExplanationFallbackRegressionQaReport.blockers.length,
      fallback: input.scriptureExplanationFallbackRegressionQaReport.blockers.length,
      confidence_label: input.scriptureExplanationFallbackRegressionQaReport.blockers.length,
      reviewed_content_gate: input.reviewedContentGateRegressionQaReport.blockers.length,
      mobile: input.mobileAccessibilityRegressionQaReport.blockers.length,
      accessibility: input.mobileAccessibilityRegressionQaReport.blockers.length
    },
    warningCountByArea: {
      issue_triage: input.betaFixQueueReport.warnings.length,
      user_journey: input.betaRegressionQaReport.warnings.filter((entry) => entry.area === "user_journey").length,
      real_data: input.betaRegressionQaReport.warnings.filter((entry) => entry.area === "real_data").length,
      disabled_services: input.disabledServiceRegressionQaReport.warnings.length,
      scripture_anchor: input.scriptureExplanationFallbackRegressionQaReport.warnings.length,
      explanation_trace: input.scriptureExplanationFallbackRegressionQaReport.warnings.length,
      fallback: input.scriptureExplanationFallbackRegressionQaReport.warnings.length,
      confidence_label: input.scriptureExplanationFallbackRegressionQaReport.warnings.length,
      reviewed_content_gate: input.reviewedContentGateRegressionQaReport.warnings.length,
      mobile: input.mobileAccessibilityRegressionQaReport.warnings.length,
      accessibility: input.mobileAccessibilityRegressionQaReport.warnings.length
    }
  };
}

export function createBetaRemediationPackage(input: {
  issues?: TeoyubeBetaIssue[];
  queue?: TeoyubeBetaFixQueue;
  remediationPlan?: TeoyubeReadinessRemediationPlan;
  safePatchSummary?: TeoyubeBetaSafePatchSummaryItem[];
} = {}): TeoyubeBetaRemediationPackage {
  const issueToFixConversionReport = createBetaIssueToFixConversionReport(input.issues || []);
  const queue = input.queue || createBetaFixQueue({ items: issueToFixConversionReport.fixItems });
  const betaFixQueueReport = createBetaFixQueueReport(queue);
  const remediationPlan = input.remediationPlan || createReadinessRemediationPlan({ queue });
  const readinessRemediationPlanReport = createReadinessRemediationPlanReport(remediationPlan);
  const remediationSafetyReport = createReadinessRemediationSafetyReport(remediationPlan);
  const betaRegressionQaReport = createBetaRegressionQaReport(createBetaRegressionQaRun());
  const disabledServiceRegressionQaReport = createBetaDisabledServiceRegressionQaReport();
  const scriptureExplanationFallbackRegressionQaReport = createBetaScriptureExplanationFallbackRegressionQaReport();
  const reviewedContentGateRegressionQaReport = createBetaReviewedContentGateRegressionQaReport();
  const mobileAccessibilityRegressionQaReport = createBetaMobileAccessibilityRegressionQaReport();
  const postRemediationReadinessScoreReport = createPostRemediationReadinessScoreReport(scoreInputFromReports({
    betaFixQueueReport,
    betaRegressionQaReport,
    disabledServiceRegressionQaReport,
    scriptureExplanationFallbackRegressionQaReport,
    reviewedContentGateRegressionQaReport,
    mobileAccessibilityRegressionQaReport
  }));

  return {
    id: "phase_5_3_beta_remediation_package",
    betaFixQueueReport,
    issueToFixConversionReport,
    readinessRemediationPlanReport,
    remediationSafetyReport,
    safePatchSummary: input.safePatchSummary || defaultSafePatchSummary(),
    betaRegressionQaReport,
    disabledServiceRegressionQaReport,
    scriptureExplanationFallbackRegressionQaReport,
    reviewedContentGateRegressionQaReport,
    mobileAccessibilityRegressionQaReport,
    postRemediationReadinessScoreReport,
    nextActionRecommendation: "Phase 5.4 - Controlled Beta Go/No-Go, Owner Approval & Operational Handoff",
    noExternalSend: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}

export function getBetaRemediationPackageBlockers(pkg: TeoyubeBetaRemediationPackage): string[] {
  return [
    ...pkg.betaFixQueueReport.blockers.map((entry) => entry.message),
    ...pkg.issueToFixConversionReport.blockers,
    ...pkg.readinessRemediationPlanReport.blockers.map((entry) => entry.message),
    ...pkg.remediationSafetyReport.blockers.map((entry) => entry.message),
    ...pkg.betaRegressionQaReport.blockers.map((entry) => entry.message),
    ...pkg.disabledServiceRegressionQaReport.blockers,
    ...pkg.scriptureExplanationFallbackRegressionQaReport.blockers,
    ...pkg.reviewedContentGateRegressionQaReport.blockers,
    ...pkg.mobileAccessibilityRegressionQaReport.blockers,
    ...pkg.postRemediationReadinessScoreReport.blockers.map((entry) => entry.message)
  ];
}

export function getBetaRemediationPackageWarnings(pkg: TeoyubeBetaRemediationPackage): string[] {
  return [
    ...pkg.betaFixQueueReport.warnings.map((entry) => entry.message),
    ...pkg.issueToFixConversionReport.warnings,
    ...pkg.readinessRemediationPlanReport.warnings.map((entry) => entry.message),
    ...pkg.remediationSafetyReport.warnings.map((entry) => entry.message),
    ...pkg.betaRegressionQaReport.warnings.map((entry) => entry.message),
    ...pkg.disabledServiceRegressionQaReport.warnings,
    ...pkg.scriptureExplanationFallbackRegressionQaReport.warnings,
    ...pkg.reviewedContentGateRegressionQaReport.warnings,
    ...pkg.mobileAccessibilityRegressionQaReport.warnings,
    ...pkg.postRemediationReadinessScoreReport.warnings.map((entry) => entry.message)
  ];
}

export function createBetaRemediationPackageDecision(pkg: TeoyubeBetaRemediationPackage): TeoyubeBetaRemediationPackageDecision {
  const blockers = getBetaRemediationPackageBlockers(pkg);
  if (blockers.length || pkg.postRemediationReadinessScoreReport.decision === "blocked") return "blocked";
  if (!pkg.betaFixQueueReport.itemCount) return "empty";
  return getBetaRemediationPackageWarnings(pkg).length ? "ready_with_warnings" : "ready_for_owner_review";
}

export function validateBetaRemediationPackage(pkg: TeoyubeBetaRemediationPackage): TeoyubeBetaRemediationPackageReport {
  return createBetaRemediationPackageReport(pkg);
}

export function createBetaRemediationPackageReport(pkg: TeoyubeBetaRemediationPackage): TeoyubeBetaRemediationPackageReport {
  const blockers = getBetaRemediationPackageBlockers(pkg);
  return {
    valid: blockers.length === 0,
    decision: createBetaRemediationPackageDecision(pkg),
    package: pkg,
    blockers,
    warnings: getBetaRemediationPackageWarnings(pkg),
    postRemediationReadinessScore: pkg.postRemediationReadinessScoreReport.score,
    postRemediationReadinessBand: pkg.postRemediationReadinessScoreReport.band,
    nextActionRecommendation: "Phase 5.4 - Controlled Beta Go/No-Go, Owner Approval & Operational Handoff",
    noExternalSend: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
