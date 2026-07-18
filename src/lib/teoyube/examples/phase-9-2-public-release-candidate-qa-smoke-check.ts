import {
  createManualPublicMonitoringPlan,
  createManualPublicMonitoringReport,
  createPhase92OwnerReviewChecklist,
  createPhase92Package,
  createPhase92PackageReport,
  createPublicFeedbackReadinessReport,
  createPublicIssue,
  createPublicIssueTriageReport,
  createPublicReleaseCandidateMobileAccessibilityQaReport,
  createPublicReleaseCandidateQaPackage,
  createPublicReleaseCandidateQaPackageReport,
  createPublicReleaseCandidateQaReport,
  createPublicReleaseCandidateQaRun,
  createPublicReleaseCandidateSafetyQaReport,
  createPublicReleaseCandidateServiceDisabledQaReport,
  createPublicSupportReadinessReport,
  createReleaseCandidateReadinessScoreReport,
  getManualPublicMonitoringChecklist,
  getPublicReleaseCandidateQaScenarios,
  recordPublicReleaseCandidateQaAreaResult,
  runPhase91Audit,
  runPhase92Audit
} from "../phase-9";
import { runPhase91ControlledPublicReleasePreparationSmokeCheck } from "./phase-9-1-controlled-public-release-preparation-smoke-check";

export type TeoyubePhase92SmokeCheckResult = {
  id: string;
  passed: boolean;
  notes: string;
};

export type TeoyubePhase92SmokeCheckReport = {
  valid: boolean;
  results: TeoyubePhase92SmokeCheckResult[];
  blockers: string[];
  warnings: string[];
  readinessScoreBand: string;
  noPublicLaunchPerformed: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noExternalServicesRequired: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function result(id: string, passed: boolean, notes: string): TeoyubePhase92SmokeCheckResult {
  return { id, passed, notes };
}

export function runPhase92PublicReleaseCandidateQaSmokeCheck(): TeoyubePhase92SmokeCheckReport {
  const scenarios = getPublicReleaseCandidateQaScenarios();
  let qaRun = createPublicReleaseCandidateQaRun({ scenarios });
  for (const scenario of scenarios) {
    qaRun = recordPublicReleaseCandidateQaAreaResult(qaRun, scenario.area, {
      passed: true,
      status: "passed",
      notes: [`${scenario.label} smoke scenario recorded in memory.`]
    });
  }
  const qaReport = createPublicReleaseCandidateQaReport(qaRun);
  const manualMonitoringRun = createManualPublicMonitoringPlan();
  const manualMonitoringReport = createManualPublicMonitoringReport(manualMonitoringRun);
  const supportReadinessReport = createPublicSupportReadinessReport();
  const blockingIssueReport = createPublicIssueTriageReport([
    createPublicIssue({
      id: "missing_scripture_anchor_smoke",
      category: "scripture_anchor_missing",
      severity: "critical",
      details: "Missing Scripture anchor should become a blocking public issue."
    })
  ]);
  const cleanIssueReport = createPublicIssueTriageReport([]);
  const feedbackReadinessReport = createPublicFeedbackReadinessReport();
  const safetyQaReport = createPublicReleaseCandidateSafetyQaReport();
  const serviceDisabledQaReport = createPublicReleaseCandidateServiceDisabledQaReport();
  const mobileAccessibilityQaReport = createPublicReleaseCandidateMobileAccessibilityQaReport();
  const readinessScoreReport = createReleaseCandidateReadinessScoreReport();
  const packageModel = createPublicReleaseCandidateQaPackage();
  const packageReport = createPublicReleaseCandidateQaPackageReport(packageModel);
  const ownerReviewChecklist = createPhase92OwnerReviewChecklist();
  const phase92Package = createPhase92Package();
  const phase92PackageReport = createPhase92PackageReport(phase92Package);
  const phase91Smoke = runPhase91ControlledPublicReleasePreparationSmokeCheck();
  const phase91Audit = runPhase91Audit();
  const phase92Audit = runPhase92Audit();

  const results = [
    result("qa_contracts_compile", scenarios.length >= 12, "QA contracts and scenarios are represented."),
    result("qa_runner_in_memory", qaReport.valid && qaReport.inMemoryOnly && qaReport.noFilesWritten && qaReport.noPublicUrlsFetchedAutomatically, "QA runner works in memory only."),
    result("manual_monitoring_no_url_fetch", manualMonitoringReport.noPublicUrlFetch && manualMonitoringReport.noMonitoringProviderConnected, "Manual monitoring fetches no URLs and connects no provider."),
    result("support_readiness_no_messages", supportReadinessReport.valid && supportReadinessReport.noAutomaticContact, "Support readiness sends no messages."),
    result("issue_triage_identifies_blockers", !blockingIssueReport.valid && blockingIssueReport.blockingIssues.length === 1, "Issue triage identifies missing Scripture anchor blocker."),
    result("clean_issue_triage_in_memory", cleanIssueReport.inMemoryOnly && cleanIssueReport.noAutomaticFeedbackCollection, "Clean issue triage stays in memory only."),
    result("feedback_readiness_manual", feedbackReadinessReport.valid && feedbackReadinessReport.noAutomaticCollection && feedbackReadinessReport.noDatabaseStorage, "Feedback readiness collects nothing automatically."),
    result("safety_qa_protects_core_boundaries", safetyQaReport.valid && safetyQaReport.scriptureAnchorsProtected && safetyQaReport.explanationTracesProtected && safetyQaReport.fallbackSafetyProtected && safetyQaReport.confidenceLabelsProtected, "Safety QA protects Scripture, explanation, fallback, and confidence."),
    result("service_disabled_qa_safe", serviceDisabledQaReport.valid && serviceDisabledQaReport.noDatabasePersistenceEnabled && serviceDisabledQaReport.noAnalyticsEnabled && serviceDisabledQaReport.noMonitoringProviderConnected && serviceDisabledQaReport.noLiveAiOrchestrationEnabled, "Service-disabled QA confirms services remain disabled."),
    result("mobile_accessibility_structured", mobileAccessibilityQaReport.valid && mobileAccessibilityQaReport.graphListFallbackAvailable && mobileAccessibilityQaReport.promiseTableMobileViewAvailable, "Mobile/accessibility QA returns structured report."),
    result("readiness_score_band", readinessScoreReport.band === "excellent" && readinessScoreReport.score === 100, `Readiness score band: ${readinessScoreReport.band}.`),
    result("qa_package_in_memory", packageReport.valid && packageReport.inMemoryOnly && packageModel.noExternalServicesRequired, `QA package decision: ${packageReport.decision}.`),
    result("owner_review_checklist_exists", ownerReviewChecklist.length >= 11, `${ownerReviewChecklist.length} owner review items exist.`),
    result("phase_9_2_package_valid", phase92PackageReport.valid && phase92PackageReport.inMemoryOnly, `Phase 9.2 package decision: ${phase92PackageReport.decision}.`),
    result("phase_9_1_smoke_valid", phase91Smoke.valid, "Phase 9.1 smoke check remains valid."),
    result("phase_9_1_audit_complete", phase91Audit.complete && phase91Audit.completionPercentage === 100, `Phase 9.1 audit completion: ${phase91Audit.completionPercentage}%.`),
    result("phase_9_2_audit_complete", phase92Audit.complete && phase92Audit.completionPercentage === 100, `Phase 9.2 audit completion: ${phase92Audit.completionPercentage}%.`),
    result("no_public_launch", phase92Audit.noPublicLaunchPerformed && phase92Package.noPublicLaunchPerformed, "No public launch is performed."),
    result("no_beta_launch", phase92Audit.noBetaLaunchPerformed && phase92Package.noBetaLaunchPerformed, "No beta launch is performed."),
    result("no_users_contacted", phase92Audit.noUsersContacted && phase92Package.noUsersContacted, "No users are contacted."),
    result("no_feedback_auto_collection", phase92Audit.noFeedbackCollectedAutomatically && phase92Package.noFeedbackCollectedAutomatically, "No feedback is collected automatically."),
    result("no_public_url_fetching", phase92Audit.noPublicUrlsFetchedAutomatically && phase92Package.noPublicUrlsFetchedAutomatically, "No public URLs are fetched automatically."),
    result("no_database_persistence", phase92Audit.noDatabasePersistenceEnabled && phase92Package.noDatabasePersistenceEnabled, "Database persistence remains disabled."),
    result("no_analytics", phase92Audit.noAnalyticsEnabled && phase92Package.noAnalyticsEnabled, "Analytics remain disabled."),
    result("no_monitoring_provider", phase92Audit.noMonitoringProviderConnected && phase92Package.noMonitoringProviderConnected, "No production monitoring provider is connected."),
    result("no_live_ai", phase92Audit.noLiveAiOrchestrationEnabled && phase92Package.noLiveAiOrchestrationEnabled, "Live AI orchestration remains disabled."),
    result("no_admin_auth_or_cms", phase92Audit.noAdminAuthAdded && phase92Audit.noCmsConnected && phase92Package.noAdminAuthAdded && phase92Package.noCmsConnected, "Admin auth and CMS remain disabled."),
    result("no_external_services", phase92Audit.noExternalServicesRequired && phase92Package.noExternalServicesRequired, "No external services are required."),
    result("no_browser_persistence_required", phase92Audit.noBrowserPersistenceRequired && phase92Package.noBrowserPersistenceRequired, "No localStorage, cookies, or IndexedDB are required."),
    result("monitoring_checklist_structured", getManualPublicMonitoringChecklist().length >= 16, "Manual monitoring checklist is structured.")
  ];
  const blockers = results.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.notes}`);

  return {
    valid: blockers.length === 0,
    results,
    blockers,
    warnings: [
      "Phase 9.2 is public release candidate QA, manual monitoring, and support readiness only; it does not launch, contact users, collect feedback automatically, fetch public URLs automatically, persist data, or connect services.",
      ...phase92PackageReport.warnings
    ],
    readinessScoreBand: phase92PackageReport.readinessScoreBand,
    noPublicLaunchPerformed: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noExternalServicesRequired: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
