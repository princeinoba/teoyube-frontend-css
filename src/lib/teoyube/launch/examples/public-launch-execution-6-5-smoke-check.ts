import { runPublicLaunchExecution65Example } from "./public-launch-execution-6-5-example";
import { createPostLaunchKnownLimitationsReport } from "../post-launch-known-limitations";
import { createPostLaunchOwnerReadinessChecklist, createPostLaunchOwnerReadinessReport } from "../post-launch-owner-readiness-review";
import { createPostLaunchReadinessCriteriaReport } from "../post-launch-readiness-criteria";
import { createPostLaunchReadinessHandoffReport } from "../post-launch-readiness-handoff";
import { createPostLaunchReadinessPackage, createPostLaunchReadinessPackageReport } from "../post-launch-readiness-package";
import { addPostLaunchRisk, createPostLaunchRiskRegister, createPostLaunchRiskRegisterReport, getCriticalPostLaunchRisks, resolvePostLaunchRisk } from "../post-launch-risk-register";
import { runPublicLaunchCompletionAudit } from "../public-launch-completion-audit";
import { createPublicLaunchCompletionReport } from "../public-launch-completion-review";
import { createPublicLaunchFeedbackSummaryReport } from "../public-launch-feedback-summary";
import { createPublicLaunchFinalSafetyPrivacyReport } from "../public-launch-final-safety-privacy-review";
import { createPublicLaunchIssueClosureReport } from "../public-launch-issue-closure";
import { createPublicLaunchStabilityCertificationReport } from "../public-launch-stability-certification";

export type TeoyubePublicLaunchExecution65SmokeCheck = {
  valid: boolean;
  checks: Array<{ id: string; passed: boolean; details: string }>;
  generatedAt: string;
};

function check(id: string, passed: boolean, details: string) {
  return { id, passed, details };
}

export function runPublicLaunchExecution65SmokeCheck(): TeoyubePublicLaunchExecution65SmokeCheck {
  const example = runPublicLaunchExecution65Example();
  const completionReport = createPublicLaunchCompletionReport();
  const feedbackSummaryReport = createPublicLaunchFeedbackSummaryReport();
  const unresolvedCriticalIssueClosure = createPublicLaunchIssueClosureReport({
    issues: [
      {
        id: "unresolved_public_critical_issue",
        label: "Unresolved public critical issue",
        category: "privacy",
        status: "new",
        publicLaunchCritical: true,
        publicSafetyCritical: true,
        requiredRegressionCheckIds: ["privacy_regression"],
        noSafetyGuardrailWeakened: true,
        privacyTermsConsentNoticesAvailable: true,
        scriptureAnchorsRequired: true,
        explanationPathsRequired: true,
        fallbackSafe: true,
        consentControlsVisible: true,
        restrictedServiceEnabled: false
      }
    ],
    regressionResults: [{ checkId: "privacy_regression", status: "not_run" }]
  });
  const issueClosureReport = createPublicLaunchIssueClosureReport();
  const stabilityCertificationReport = createPublicLaunchStabilityCertificationReport({
    feedbackSummaryReport,
    issueClosureReport
  });
  const finalSafetyPrivacyReport = createPublicLaunchFinalSafetyPrivacyReport();
  const unsafeCriteriaReport = createPostLaunchReadinessCriteriaReport({
    productionPersistenceEnabled: true,
    externalAnalyticsEnabled: true,
    liveAiOrchestrationEnabled: true
  });
  const readinessCriteriaReport = createPostLaunchReadinessCriteriaReport({
    completionReport,
    feedbackSummaryReport,
    issueClosureReport,
    stabilityCertificationReport,
    finalSafetyPrivacyReport
  });
  const readinessPackage = createPostLaunchReadinessPackage({
    completionReport,
    feedbackSummaryReport,
    issueClosureReport,
    stabilityCertificationReport,
    finalSafetyPrivacyReport,
    readinessCriteriaReport
  });
  const readinessPackageReport = createPostLaunchReadinessPackageReport(readinessPackage);
  let riskRegister = createPostLaunchRiskRegister();
  riskRegister = addPostLaunchRisk(riskRegister, {
    id: "critical_post_launch_smoke_risk",
    category: "security",
    label: "Critical smoke risk",
    severity: "critical",
    status: "open",
    mitigation: "Resolve before operations.",
    ownerReviewRequired: true
  });
  const criticalRiskCount = getCriticalPostLaunchRisks(riskRegister).length;
  riskRegister = resolvePostLaunchRisk(riskRegister, "critical_post_launch_smoke_risk", "Resolved by smoke check.");
  const riskRegisterReport = createPostLaunchRiskRegisterReport(riskRegister);
  const knownLimitationsReport = createPostLaunchKnownLimitationsReport();
  const ownerChecklist = createPostLaunchOwnerReadinessChecklist();
  const ownerReadinessReport = createPostLaunchOwnerReadinessReport();
  const handoffReport = createPostLaunchReadinessHandoffReport();
  const audit = runPublicLaunchCompletionAudit();

  const checks = [
    check("completion_contracts_compile", completionReport.ready && completionReport.noPublicLaunchPerformedByCode, "Completion contracts and report return structured output."),
    check("completion_review_structured", completionReport.checks.length >= 15 && completionReport.summary.checkCount === completionReport.checks.length, "Completion review returns checklist and summary."),
    check("feedback_summary_manual_sanitized_only", feedbackSummaryReport.manualOnly && feedbackSummaryReport.sanitizedOnly && feedbackSummaryReport.noFeedbackCollectedAutomatically, "Feedback summary uses sanitized/manual feedback only."),
    check("issue_closure_blocks_unresolved_critical", !unresolvedCriticalIssueClosure.ready && unresolvedCriticalIssueClosure.publicLaunchCriticalUnresolvedCount === 1, "Issue closure does not close unresolved critical issues."),
    check("stability_certification_structured", stabilityCertificationReport.ready && stabilityCertificationReport.runtimeStable && stabilityCertificationReport.surfaceStable, "Stability certification returns structured stable report."),
    check("final_safety_privacy_preserves_guardrails", finalSafetyPrivacyReport.ready && finalSafetyPrivacyReport.scriptureAnchoringRequired && finalSafetyPrivacyReport.explanationPathsRequired && finalSafetyPrivacyReport.fallbackSafetyReady && finalSafetyPrivacyReport.consentSafetyReady && finalSafetyPrivacyReport.privacyTermsConsentNoticesAvailable, "Final safety/privacy preserves Scripture, explanation, fallback, consent, and privacy notices."),
    check("post_launch_readiness_criteria_block_unsafe", !unsafeCriteriaReport.ready && unsafeCriteriaReport.blockers.length >= 3, "Readiness criteria block unsafe persistence, analytics, and live AI readiness."),
    check("readiness_package_in_memory_only", readinessPackageReport.inMemoryOnly && readinessPackage.inMemoryOnly && readinessPackageReport.noExternalWrite, "Readiness package is in-memory only."),
    check("risk_register_in_memory_only", criticalRiskCount === 1 && riskRegisterReport.inMemoryOnly && riskRegisterReport.ready && riskRegisterReport.noExternalWrite, "Risk register works in memory only."),
    check("known_limitations_generated", knownLimitationsReport.ready && knownLimitationsReport.limitationCount >= 8, "Known limitations are generated."),
    check("owner_readiness_checklist_exists", ownerChecklist.length >= 10 && ownerReadinessReport.ready && ownerReadinessReport.noUsersContacted, "Owner readiness checklist exists."),
    check("handoff_external_action_absent", handoffReport.ready && handoffReport.noUsersContacted && handoffReport.noPublicUrlFetched && handoffReport.noProductionPersistenceConnected && handoffReport.noExternalAnalyticsConnected && handoffReport.noLiveAiOrchestrationConnected, "Handoff performs no external action."),
    check("completion_audit_structured", audit.complete && audit.completionPercentage === 100, "Public launch completion audit returns structured complete report."),
    check("side_effects_absent", readinessPackageReport.noUsersContacted && readinessPackageReport.noFeedbackCollectedAutomatically && readinessPackageReport.noPublicUrlFetched && readinessPackageReport.noExternalAnalyticsEnabled && readinessPackageReport.noProductionPersistenceEnabled && readinessPackageReport.noLiveAiOrchestrationEnabled, "No users are contacted, no feedback is collected automatically, no public URLs are fetched, no external analytics are sent, no unapproved production persistence is enabled, and no live AI orchestration is enabled."),
    check("no_storage_or_external_provider_required", readinessPackageReport.noExternalWrite && !readinessPackage.databaseWritten && !readinessPackage.analyticsSent && !readinessPackage.externalServicesCalled && !readinessPackage.productionPersistenceEnabled && !readinessPackage.externalAnalyticsEnabled && !readinessPackage.liveAiOrchestrationEnabled, "No database, external API, analytics provider, service worker, localStorage, cookies, IndexedDB, or file writes are required."),
    check("example_runs", Boolean(example.audit.complete && example.readinessPackageReport.ready), "Public Launch Execution 6.5 example runs.")
  ];

  return {
    valid: checks.every((entry) => entry.passed),
    checks,
    generatedAt: new Date().toISOString()
  };
}
