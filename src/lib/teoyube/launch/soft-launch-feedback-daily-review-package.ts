import type { TeoyubeSoftLaunchFeedbackTriageItem } from "./soft-launch-feedback-triage-contracts";
import { createFeedbackIssueConversionReport, createIssuesFromSoftLaunchFeedback } from "./soft-launch-feedback-issue-converter";
import { createSoftLaunchFeedbackTriageReport } from "./soft-launch-feedback-triage-engine";
import { addSoftLaunchFixQueueItems, createSoftLaunchFixQueue, createSoftLaunchFixQueueReport } from "./soft-launch-fix-queue-manager";
import { createSoftLaunchFixQueueSafetyReport } from "./soft-launch-fix-queue-safety";
import { createSoftLaunchFixRegressionReport } from "./soft-launch-fix-regression-mapper";
import { createSoftLaunchDailyReviewRecord, createSoftLaunchDailyReviewReport } from "./soft-launch-daily-review-manager";
import { createSoftLaunchPauseContinueDecision } from "./soft-launch-pause-continue-decision";
import { createSoftLaunchOwnerDailyReviewRecord, createSoftLaunchOwnerDailyReviewReport } from "./soft-launch-owner-daily-review";

export type TeoyubeSoftLaunchFeedbackDailyReviewPackageBlocker = {
  id: string;
  label: string;
  reason: string;
  requiredAction: string;
};

export type TeoyubeSoftLaunchFeedbackDailyReviewPackage = {
  id: string;
  label: string;
  feedbackTriageReport: ReturnType<typeof createSoftLaunchFeedbackTriageReport>;
  issueConversionReport: ReturnType<typeof createFeedbackIssueConversionReport>;
  fixQueueReport: ReturnType<typeof createSoftLaunchFixQueueReport>;
  fixQueueSafetyReport: ReturnType<typeof createSoftLaunchFixQueueSafetyReport>;
  regressionReport: ReturnType<typeof createSoftLaunchFixRegressionReport>;
  dailyReviewReport: ReturnType<typeof createSoftLaunchDailyReviewReport>;
  pauseContinueDecisionReport: ReturnType<typeof createSoftLaunchPauseContinueDecision>;
  ownerDailyReviewReport: ReturnType<typeof createSoftLaunchOwnerDailyReviewReport>;
  nextActionRecommendation: string;
  inMemoryOnly: true;
  sentExternally: false;
  fileWritten: false;
  databaseWritten: false;
  analyticsSent: false;
  externalServicesCalled: false;
  launchPerformed: false;
  usersContacted: false;
  feedbackCollectedAutomatically: false;
  previewUrlFetched: false;
  rollbackPerformed: false;
  generatedAt: string;
};

export function createSoftLaunchFeedbackTriageItem(
  input: Partial<TeoyubeSoftLaunchFeedbackTriageItem> = {}
): TeoyubeSoftLaunchFeedbackTriageItem {
  return {
    id: input.id || "manual_feedback_sample_4_3",
    source: input.source || "manual_feedback",
    surface: input.surface || "Canon",
    category: input.category || "content_clarity",
    summary: input.summary || "Sanitized manual feedback sample for daily review.",
    redactedNotes: input.redactedNotes || [],
    severity: input.severity || "medium",
    launchCritical: input.launchCritical ?? false,
    safetyCritical: input.safetyCritical ?? false,
    manuallyEntered: true,
    rawSensitiveTextStored: false,
    analyticsSent: false,
    databaseWritten: false,
    externalServicesCalled: false,
    hiddenPersonalizationCreated: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function createSoftLaunchFeedbackDailyReviewPackage(
  input: Partial<TeoyubeSoftLaunchFeedbackDailyReviewPackage> = {}
): TeoyubeSoftLaunchFeedbackDailyReviewPackage {
  const feedbackItems = [
    createSoftLaunchFeedbackTriageItem({
      id: "sample_scripture_anchor_feedback",
      category: "scripture_anchor",
      summary: "Scripture anchor missing sample.",
      redactedNotes: ["Sample only; manually entered and redacted."],
      launchCritical: true,
      safetyCritical: true
    })
  ];
  const feedbackTriageReport = input.feedbackTriageReport || createSoftLaunchFeedbackTriageReport(feedbackItems);
  const issueConversionReport = input.issueConversionReport || createFeedbackIssueConversionReport(feedbackItems);
  const fixQueue = addSoftLaunchFixQueueItems(createSoftLaunchFixQueue(), createIssuesFromSoftLaunchFeedback(feedbackItems));
  const fixQueueReport = input.fixQueueReport || createSoftLaunchFixQueueReport(fixQueue);
  const fixQueueSafetyReport = input.fixQueueSafetyReport || createSoftLaunchFixQueueSafetyReport(fixQueue);
  const regressionReport = input.regressionReport || createSoftLaunchFixRegressionReport(fixQueue);
  const dailyReviewRecord = createSoftLaunchDailyReviewRecord({
    feedbackVolume: feedbackTriageReport.itemCount,
    criticalFeedbackCount: feedbackTriageReport.launchCriticalCount,
    scriptureAnchorIssues: feedbackTriageReport.results.filter((entry) => entry.category === "scripture_anchor").length,
    fixQueueLaunchBlockerCount: fixQueueReport.launchBlockerCount,
    status: feedbackTriageReport.launchCriticalCount > 0 ? "pause_recommended" : "healthy",
    actionItems: [
      createSoftLaunchDailyReviewRecord().actionItems[0],
      {
        id: "owner_review_launch_critical_feedback",
        label: "Owner review required for launch-critical feedback.",
        owner: "owner",
        requiredBeforeNextDay: true,
        launchCritical: true
      }
    ]
  });
  const dailyReviewReport = input.dailyReviewReport || createSoftLaunchDailyReviewReport([dailyReviewRecord]);
  const pauseContinueDecisionReport = input.pauseContinueDecisionReport || createSoftLaunchPauseContinueDecision({
    feedbackTriageReport,
    fixQueueReport,
    dailyReviewReport
  });
  const ownerDailyReviewReport = input.ownerDailyReviewReport || createSoftLaunchOwnerDailyReviewReport(
    createSoftLaunchOwnerDailyReviewRecord({ ownerDecision: pauseContinueDecisionReport.decision })
  );

  return {
    id: input.id || "soft_launch_feedback_daily_review_package_4_3",
    label: input.label || "Soft Launch Feedback Triage, Fix Queue, and Daily Review Package",
    feedbackTriageReport,
    issueConversionReport,
    fixQueueReport,
    fixQueueSafetyReport,
    regressionReport,
    dailyReviewReport,
    pauseContinueDecisionReport,
    ownerDailyReviewReport,
    nextActionRecommendation: input.nextActionRecommendation || "Limited Soft Launch Execution 4.4 - Safe Fix Release & Soft Launch Stabilization",
    inMemoryOnly: true,
    sentExternally: false,
    fileWritten: false,
    databaseWritten: false,
    analyticsSent: false,
    externalServicesCalled: false,
    launchPerformed: false,
    usersContacted: false,
    feedbackCollectedAutomatically: false,
    previewUrlFetched: false,
    rollbackPerformed: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function getSoftLaunchFeedbackDailyReviewPackageBlockers(
  pkg: TeoyubeSoftLaunchFeedbackDailyReviewPackage
): TeoyubeSoftLaunchFeedbackDailyReviewPackageBlocker[] {
  return [
    ...pkg.feedbackTriageReport.blockers.map((entry) => ({
      id: `package_${entry.id}`,
      label: entry.label,
      reason: entry.reason,
      requiredAction: entry.requiredAction
    })),
    ...pkg.fixQueueReport.blockers.map((entry) => ({
      id: `package_${entry.id}`,
      label: entry.label,
      reason: entry.reason,
      requiredAction: entry.requiredAction
    })),
    ...pkg.fixQueueSafetyReport.blockers.map((entry) => ({
      id: `package_${entry.id}`,
      label: entry.label,
      reason: entry.reason,
      requiredAction: entry.requiredAction
    })),
    ...pkg.dailyReviewReport.blockers.map((entry) => ({
      id: `package_${entry.id}`,
      label: entry.label,
      reason: entry.reason,
      requiredAction: entry.requiredAction
    })),
    ...pkg.ownerDailyReviewReport.blockers.map((entry) => ({
      id: `package_${entry.id}`,
      label: entry.label,
      reason: entry.reason,
      requiredAction: entry.requiredAction
    })),
    pkg.sentExternally ? { id: "package_sent_externally", label: pkg.label, reason: "Package must not be sent externally.", requiredAction: "Keep package in memory." } : undefined,
    pkg.fileWritten ? { id: "package_file_written", label: pkg.label, reason: "Package must not write files.", requiredAction: "Keep package in memory." } : undefined,
    pkg.databaseWritten ? { id: "package_database_written", label: pkg.label, reason: "Package must not write databases.", requiredAction: "Remove production persistence." } : undefined,
    pkg.analyticsSent ? { id: "package_analytics_sent", label: pkg.label, reason: "Package must not send analytics.", requiredAction: "Remove analytics sending." } : undefined,
    pkg.externalServicesCalled ? { id: "package_external_services_called", label: pkg.label, reason: "Package must not call external services.", requiredAction: "Keep review local and manual." } : undefined,
    pkg.launchPerformed ? { id: "package_launch_performed", label: pkg.label, reason: "Package must not launch Teoyube.", requiredAction: "Remove launch execution." } : undefined,
    pkg.usersContacted ? { id: "package_users_contacted", label: pkg.label, reason: "Package must not contact users.", requiredAction: "Keep user contact manual and outside code." } : undefined,
    pkg.feedbackCollectedAutomatically ? { id: "package_feedback_auto_collection", label: pkg.label, reason: "Package must not collect feedback automatically.", requiredAction: "Use manual feedback intake only." } : undefined,
    pkg.previewUrlFetched ? { id: "package_preview_url_fetched", label: pkg.label, reason: "Package must not fetch preview URLs.", requiredAction: "Keep URL checks manual." } : undefined,
    pkg.rollbackPerformed ? { id: "package_rollback_performed", label: pkg.label, reason: "Package must not perform rollback.", requiredAction: "Use rollback decision support only." } : undefined
  ].filter(Boolean) as TeoyubeSoftLaunchFeedbackDailyReviewPackageBlocker[];
}

export function getSoftLaunchFeedbackDailyReviewPackageWarnings(
  pkg: TeoyubeSoftLaunchFeedbackDailyReviewPackage
) {
  return [
    ...pkg.feedbackTriageReport.warnings,
    ...pkg.fixQueueReport.warnings,
    ...pkg.fixQueueSafetyReport.warnings,
    ...pkg.dailyReviewReport.warnings,
    ...pkg.ownerDailyReviewReport.warnings
  ];
}

export function createSoftLaunchFeedbackDailyReviewPackageDecision(
  pkg: TeoyubeSoftLaunchFeedbackDailyReviewPackage = createSoftLaunchFeedbackDailyReviewPackage()
) {
  return pkg.pauseContinueDecisionReport.decision;
}

export function validateSoftLaunchFeedbackDailyReviewPackage(
  pkg: TeoyubeSoftLaunchFeedbackDailyReviewPackage = createSoftLaunchFeedbackDailyReviewPackage()
) {
  const blockers = getSoftLaunchFeedbackDailyReviewPackageBlockers(pkg);
  const warnings = getSoftLaunchFeedbackDailyReviewPackageWarnings(pkg);

  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0 && pkg.ownerDailyReviewReport.ready,
    decision: createSoftLaunchFeedbackDailyReviewPackageDecision(pkg),
    blockers,
    warnings,
    noLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPreviewUrlFetched: true,
    noRollbackPerformed: true,
    noExternalWrite: true
  };
}

export function createSoftLaunchFeedbackDailyReviewPackageReport(
  pkg: TeoyubeSoftLaunchFeedbackDailyReviewPackage = createSoftLaunchFeedbackDailyReviewPackage()
) {
  const blockers = getSoftLaunchFeedbackDailyReviewPackageBlockers(pkg);
  const warnings = getSoftLaunchFeedbackDailyReviewPackageWarnings(pkg);

  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0 && pkg.ownerDailyReviewReport.ready,
    decision: pkg.pauseContinueDecisionReport.decision,
    package: pkg,
    blockers,
    warnings,
    inMemoryOnly: true,
    noLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPreviewUrlFetched: true,
    noRollbackPerformed: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
