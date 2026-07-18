import {
  createSoftLaunchCompletionChecklist,
  createSoftLaunchCompletionReport,
  runSoftLaunchCompletionReview
} from "../soft-launch-completion-review";
import { createSoftLaunchFeedbackSummaryReport } from "../soft-launch-feedback-summary";
import { createSoftLaunchIssueClosureReport } from "../soft-launch-issue-closure";
import { createSoftLaunchStabilityCertificationReport } from "../soft-launch-stability-certification";
import {
  createSoftLaunchFinalSafetyPrivacyReport,
  validateSoftLaunchFinalConsentSafety,
  validateSoftLaunchFinalExplanationPaths,
  validateSoftLaunchFinalFallbackSafety,
  validateSoftLaunchFinalNoExternalAnalytics,
  validateSoftLaunchFinalNoLiveAiOrchestration,
  validateSoftLaunchFinalNoProductionPersistence,
  validateSoftLaunchFinalScriptureAnchoring
} from "../soft-launch-final-safety-privacy-review";
import {
  createPublicLaunchReadinessCriteriaReport,
  validatePublicLaunchReadinessCriteria
} from "../public-launch-readiness-criteria";
import {
  createPublicLaunchReadinessPackage,
  createPublicLaunchReadinessPackageReport
} from "../public-launch-readiness-package";
import {
  addPublicLaunchRisk,
  createPublicLaunchRiskRegister,
  createPublicLaunchRiskRegisterReport,
  getCriticalPublicLaunchRisks,
  getPublicLaunchRisksByCategory,
  resolvePublicLaunchRisk
} from "../public-launch-risk-register";
import {
  createPublicLaunchKnownLimitationsNotice,
  createPublicLaunchKnownLimitationsReport,
  getPublicLaunchKnownLimitations
} from "../public-launch-known-limitations";
import {
  createPublicLaunchOwnerReadinessChecklist,
  createPublicLaunchOwnerReadinessRecord,
  createPublicLaunchOwnerReadinessReport
} from "../public-launch-owner-readiness-review";
import {
  createPublicLaunchReadinessHandoff,
  createPublicLaunchReadinessHandoffReport,
  getPublicLaunchReadinessHandoffChecklist
} from "../public-launch-readiness-handoff";
import { runSoftLaunchCompletionAudit } from "../soft-launch-completion-audit";

export function runLimitedSoftLaunchExecution45SmokeCheck() {
  const completionReview = runSoftLaunchCompletionReview();
  const completionReport = createSoftLaunchCompletionReport();
  const feedbackSummary = createSoftLaunchFeedbackSummaryReport();
  const unresolvedCriticalIssueReport = createSoftLaunchIssueClosureReport({
    issues: [
      {
        id: "smoke_unresolved_scripture_anchor",
        label: "Unresolved Scripture anchor issue",
        category: "scripture_anchor",
        status: "blocked",
        launchCritical: true,
        safetyCritical: true,
        requiredRegressionCheckIds: ["scripture_anchor_regression"],
        noSafetyGuardrailWeakened: true,
        scriptureAnchorsRequired: true,
        explanationPathsRequired: true,
        fallbackSafe: true,
        consentControlsVisible: true,
        restrictedServiceEnabled: false
      }
    ],
    regressionResults: [{ checkId: "scripture_anchor_regression", status: "not_run" }]
  });
  const issueClosure = createSoftLaunchIssueClosureReport();
  const stabilityCertification = createSoftLaunchStabilityCertificationReport({
    feedbackSummaryReport: feedbackSummary,
    issueClosureReport: issueClosure
  });
  const finalSafetyPrivacy = createSoftLaunchFinalSafetyPrivacyReport();
  const unsafeCriteria = createPublicLaunchReadinessCriteriaReport({
    productionPersistenceEnabled: true,
    externalAnalyticsEnabled: true,
    liveAiOrchestrationEnabled: true,
    publicLaunchPerformed: true
  });
  const readinessCriteria = createPublicLaunchReadinessCriteriaReport({
    completionReport,
    feedbackSummaryReport: feedbackSummary,
    issueClosureReport: issueClosure,
    stabilityCertificationReport: stabilityCertification,
    finalSafetyPrivacyReport: finalSafetyPrivacy
  });
  const readinessPackage = createPublicLaunchReadinessPackage({
    completionReport,
    feedbackSummaryReport: feedbackSummary,
    issueClosureReport: issueClosure,
    stabilityCertificationReport: stabilityCertification,
    finalSafetyPrivacyReport: finalSafetyPrivacy,
    readinessCriteriaReport: readinessCriteria
  });
  const readinessPackageReport = createPublicLaunchReadinessPackageReport(readinessPackage);
  const riskRegister = addPublicLaunchRisk(createPublicLaunchRiskRegister(), {
    id: "smoke_public_launch_accessibility_risk",
    category: "accessibility",
    label: "Accessibility QA must remain in public launch preparation",
    severity: "medium",
    status: "accepted",
    mitigation: "Retain accessibility QA as a required 5.1 public launch preparation review.",
    ownerReviewRequired: true
  });
  const resolvedRiskRegister = resolvePublicLaunchRisk(riskRegister, "smoke_public_launch_accessibility_risk", "Accessibility QA retained for Public Launch Preparation 5.1.");
  const riskRegisterReport = createPublicLaunchRiskRegisterReport(riskRegister);
  const knownLimitations = getPublicLaunchKnownLimitations();
  const knownLimitationsReport = createPublicLaunchKnownLimitationsReport();
  const knownLimitationsNotice = createPublicLaunchKnownLimitationsNotice();
  const ownerChecklist = createPublicLaunchOwnerReadinessChecklist();
  const ownerReview = createPublicLaunchOwnerReadinessReport(createPublicLaunchOwnerReadinessRecord());
  const handoff = createPublicLaunchReadinessHandoff();
  const handoffChecklist = getPublicLaunchReadinessHandoffChecklist();
  const handoffReport = createPublicLaunchReadinessHandoffReport();
  const audit = runSoftLaunchCompletionAudit();

  const checks = [
    createSoftLaunchCompletionChecklist().length >= 15,
    completionReview.ready && completionReview.noPublicLaunchPerformed,
    completionReport.summary.checkCount >= 15,
    feedbackSummary.ready && feedbackSummary.manualOnly && feedbackSummary.sanitizedOnly,
    feedbackSummary.noUsersContacted && feedbackSummary.noFeedbackCollectedAutomatically,
    !unresolvedCriticalIssueReport.ready && unresolvedCriticalIssueReport.launchCriticalUnresolvedCount === 1,
    issueClosure.ready && issueClosure.noRestrictedServiceEnabled,
    stabilityCertification.ready && stabilityCertification.runtimeStable && stabilityCertification.surfaceStable,
    finalSafetyPrivacy.ready && validateSoftLaunchFinalScriptureAnchoring(finalSafetyPrivacy.results),
    validateSoftLaunchFinalExplanationPaths(finalSafetyPrivacy.results) && validateSoftLaunchFinalFallbackSafety(finalSafetyPrivacy.results),
    validateSoftLaunchFinalConsentSafety(finalSafetyPrivacy.results) && validateSoftLaunchFinalNoExternalAnalytics(finalSafetyPrivacy.results),
    validateSoftLaunchFinalNoProductionPersistence(finalSafetyPrivacy.results) && validateSoftLaunchFinalNoLiveAiOrchestration(finalSafetyPrivacy.results),
    !validatePublicLaunchReadinessCriteria({ productionPersistenceEnabled: true }).valid,
    unsafeCriteria.decision === "blocked" && unsafeCriteria.blockers.length >= 3,
    readinessCriteria.decision === "ready_for_public_launch_preparation",
    readinessPackage.inMemoryOnly && !readinessPackage.publicLaunchPerformed && !readinessPackage.usersContacted,
    readinessPackageReport.ready && readinessPackageReport.noPublicLaunchPerformed && readinessPackageReport.noExternalWrite,
    riskRegister.inMemoryOnly && riskRegisterReport.ready && getPublicLaunchRisksByCategory(riskRegister, "accessibility").length === 1,
    getCriticalPublicLaunchRisks(riskRegister).length === 0 && createPublicLaunchRiskRegisterReport(resolvedRiskRegister).ready,
    knownLimitations.length >= 8 && knownLimitationsReport.ready && knownLimitationsNotice.includes("not public launch execution"),
    ownerChecklist.length >= 10 && ownerReview.ready && ownerReview.noUsersContacted,
    handoffChecklist.length >= 8 && handoff.nextStage === "Public Launch Preparation",
    handoffReport.ready && handoffReport.noPublicLaunchPerformed && handoffReport.noProductionPersistenceConnected,
    audit.complete && audit.completionPercentage === 100,
    !readinessPackage.analyticsSent && !readinessPackage.databaseWritten && !readinessPackage.externalServicesCalled,
    readinessPackageReport.noFeedbackCollectedAutomatically && readinessPackageReport.noExternalAnalyticsEnabled,
    readinessPackageReport.noProductionPersistenceEnabled && readinessPackageReport.noLiveAiOrchestrationEnabled
  ];

  return {
    valid: checks.every(Boolean),
    checkCount: checks.length,
    passedCheckCount: checks.filter(Boolean).length,
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalAnalyticsSent: true,
    noProductionPersistenceEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noDatabaseExternalApisAnalyticsStorageOrFileWritesRequired: true,
    noServiceWorkerRequired: true,
    noLocalStorageCookiesIndexedDbRequired: true,
    completionDecision: completionReview.decision,
    publicLaunchReadinessDecision: readinessPackageReport.decision,
    audit,
    generatedAt: new Date().toISOString()
  };
}
