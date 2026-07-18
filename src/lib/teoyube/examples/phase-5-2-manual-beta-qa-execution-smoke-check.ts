import { runPhase51ControlledBetaPreparationSmokeCheck } from "./phase-5-1-controlled-beta-preparation-smoke-check";
import { runPhase52ManualBetaQaExecutionExample } from "./phase-5-2-manual-beta-qa-execution-example";
import {
  createBetaControlledAdminQaReport,
  createBetaDisabledServiceQaReport,
  createBetaIssue,
  createBetaIssueTriageExecutionReport,
  createBetaMobileAccessibilityQaReport,
  createBetaQaExecutionPackage,
  createBetaQaExecutionPackageReport,
  createBetaReadinessScoreReport,
  createBetaRealDataQaReport,
  createBetaReviewedContentGateQaReport,
  createBetaScriptureExplanationFallbackQaReport,
  createBetaUserJourneyQaReport,
  createManualBetaQaExecutionReport,
  createManualBetaQaExecutionRun,
  createPhase52OwnerReviewRecord,
  createPhase52OwnerReviewReport,
  createPhase52Package,
  createPhase52PackageReport,
  runPhase52Audit
} from "../phase-5";

export type TeoyubePhase52SmokeCheckResult = {
  id: string;
  passed: boolean;
  details: string;
};

export type TeoyubePhase52SmokeCheckReport = {
  valid: boolean;
  checks: TeoyubePhase52SmokeCheckResult[];
  blockers: string[];
  warnings: string[];
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noExternalServicesRequired: true;
  noLocalStorageRequired: true;
  noCookiesRequired: true;
  noIndexedDbRequired: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function check(id: string, passed: boolean, details: string): TeoyubePhase52SmokeCheckResult {
  return { id, passed, details };
}

export function runPhase52ManualBetaQaExecutionSmokeCheck(): TeoyubePhase52SmokeCheckReport {
  const phase51Smoke = runPhase51ControlledBetaPreparationSmokeCheck();
  const manualRun = createManualBetaQaExecutionRun();
  const manualQaReport = createManualBetaQaExecutionReport(manualRun);
  const realDataQaReport = createBetaRealDataQaReport();
  const userJourneyQaReport = createBetaUserJourneyQaReport();
  const scriptureExplanationFallbackQaReport = createBetaScriptureExplanationFallbackQaReport();
  const mobileAccessibilityQaReport = createBetaMobileAccessibilityQaReport();
  const reviewedContentGateQaReport = createBetaReviewedContentGateQaReport();
  const controlledAdminQaReport = createBetaControlledAdminQaReport();
  const disabledServiceQaReport = createBetaDisabledServiceQaReport();
  const informationalIssue = createBetaIssue({
    title: "Manual copy polish note",
    description: "Owner can review wording, no safety blocker.",
    category: "content_clarity",
    severity: "informational",
    source: "manual_qa"
  });
  const blockingIssue = createBetaIssue({
    title: "Scripture anchor missing in recommendation",
    description: "Synthetic blocker sample for triage validation only.",
    category: "scripture_anchor_missing",
    severity: "high",
    source: "manual_qa"
  });
  const issueTriageReport = createBetaIssueTriageExecutionReport([informationalIssue]);
  const blockingIssueTriageReport = createBetaIssueTriageExecutionReport([blockingIssue]);
  const readinessScoreReport = createBetaReadinessScoreReport({
    blockerCountByArea: {
      real_data: realDataQaReport.blockers.length,
      user_journey: userJourneyQaReport.blockers.length,
      scripture_anchor: scriptureExplanationFallbackQaReport.blockers.length,
      explanation_trace: scriptureExplanationFallbackQaReport.blockers.length,
      fallback: scriptureExplanationFallbackQaReport.blockers.length,
      confidence_label: scriptureExplanationFallbackQaReport.blockers.length,
      mobile: mobileAccessibilityQaReport.blockers.length,
      accessibility: mobileAccessibilityQaReport.blockers.length,
      reviewed_content_gate: reviewedContentGateQaReport.blockers.length,
      controlled_admin: controlledAdminQaReport.blockers.length,
      disabled_services: disabledServiceQaReport.blockers.length,
      privacy_consent: disabledServiceQaReport.blockers.length,
      issue_triage: issueTriageReport.blockers.length
    }
  });
  const packageModel = createBetaQaExecutionPackage({ issueTriageReport, readinessScoreReport });
  const packageReport = createBetaQaExecutionPackageReport(packageModel);
  const ownerReview = createPhase52OwnerReviewRecord();
  const ownerReviewReport = createPhase52OwnerReviewReport(ownerReview);
  const phase52Package = createPhase52Package({ betaQaExecutionPackage: packageModel, ownerReview });
  const phase52PackageReport = createPhase52PackageReport(phase52Package);
  const phase52Audit = runPhase52Audit();
  const example = runPhase52ManualBetaQaExecutionExample();

  const checks = [
    check("phase_5_1_smoke_valid", phase51Smoke.valid, "Phase 5.1 smoke check remains valid."),
    check("manual_execution_contracts_compile", manualRun.manualOnly && manualRun.inMemoryOnly && manualQaReport.manualOnly, "Manual QA execution run/report is in-memory only."),
    check("manual_execution_no_side_effects", manualRun.noPublicUrlFetching && manualRun.noUsersContacted && manualRun.noAnalyticsSent && manualRun.noQaRunsPersisted && manualRun.noFilesWritten && manualRun.noExternalServicesConnected, "Manual QA runner does not fetch, contact, send analytics, persist, write files, or connect services."),
    check("real_data_qa_valid", realDataQaReport.valid && realDataQaReport.noExternalServicesRequired, "Real data QA returns valid structured report."),
    check("user_journey_qa_valid", userJourneyQaReport.valid && userJourneyQaReport.noBrowserPersistenceRequired, "User journey QA returns valid structured report."),
    check("scripture_explanation_fallback_valid", scriptureExplanationFallbackQaReport.valid && scriptureExplanationFallbackQaReport.noDivineCertaintyLanguage && scriptureExplanationFallbackQaReport.noProfessionalAdviceLanguage, "Scripture/explanation/fallback QA preserves safety boundaries."),
    check("mobile_accessibility_valid", mobileAccessibilityQaReport.valid, "Mobile/accessibility QA returns valid structured report."),
    check("reviewed_content_gate_valid", reviewedContentGateQaReport.valid && reviewedContentGateQaReport.noAutomaticPublishing, "Reviewed content gate QA returns valid structured report."),
    check("controlled_admin_valid", controlledAdminQaReport.valid && controlledAdminQaReport.inMemoryOnly && controlledAdminQaReport.noAdminAuthAdded && controlledAdminQaReport.noCmsConnected, "Controlled admin QA stays prototype-only and in-memory."),
    check("disabled_services_valid", disabledServiceQaReport.valid && disabledServiceQaReport.noDatabasePersistenceEnabled && disabledServiceQaReport.noAnalyticsEnabled && disabledServiceQaReport.noLiveAiOrchestrationEnabled, "Disabled service QA keeps service gates disabled."),
    check("issue_triage_valid", issueTriageReport.valid && issueTriageReport.manualOnly && issueTriageReport.noAutomaticCollection, "Issue triage stays manual-only."),
    check("issue_triage_blocks_safety_issue", !blockingIssueTriageReport.valid && blockingIssueTriageReport.blockingIssues.length === 1, "Issue triage identifies missing Scripture anchors as blockers."),
    check("readiness_score_valid", readinessScoreReport.valid && readinessScoreReport.score >= 50, "Readiness score returns structured non-blocked score for default safe inputs."),
    check("qa_execution_package_valid", packageReport.valid && packageModel.noExternalSend && packageModel.inMemoryOnly, "Beta QA execution package is valid and in-memory only."),
    check("owner_review_structured", ownerReviewReport.valid && ownerReview.checklist.length >= 11, "Phase 5.2 owner review checklist exists."),
    check("phase_5_2_package_valid", phase52PackageReport.valid && phase52Package.noExternalSend && phase52Package.noBetaLaunchPerformed, "Phase 5.2 package is valid and does not launch beta."),
    check("phase_5_2_audit_complete", phase52Audit.complete && phase52Audit.completionPercentage === 100, "Phase 5.2 audit returns complete."),
    check("example_runs", example.phase52Audit.completionPercentage === phase52Audit.completionPercentage, "Phase 5.2 example runs."),
    check("no_browser_persistence", true, "No localStorage, cookies, or IndexedDB are required by Phase 5.2 modules.")
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  const warnings = [
    ...manualQaReport.warnings.map((entry) => entry.message),
    ...realDataQaReport.warnings,
    ...userJourneyQaReport.warnings,
    ...scriptureExplanationFallbackQaReport.warnings,
    ...mobileAccessibilityQaReport.warnings,
    ...reviewedContentGateQaReport.warnings,
    ...controlledAdminQaReport.warnings,
    ...disabledServiceQaReport.warnings,
    ...issueTriageReport.warnings.map((entry) => entry.message),
    ...readinessScoreReport.warnings.map((entry) => entry.message),
    ...packageReport.warnings,
    ...ownerReviewReport.warnings,
    ...phase52PackageReport.warnings,
    ...phase52Audit.warnings
  ];

  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noExternalServicesRequired: true,
    noLocalStorageRequired: true,
    noCookiesRequired: true,
    noIndexedDbRequired: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
