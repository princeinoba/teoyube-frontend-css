import type { TeoyubePublicFeedbackTriageItem } from "./public-feedback-triage-contracts";
import { createPublicFeedbackIssueConversionReport, createIssuesFromPublicFeedback } from "./public-feedback-issue-converter";
import { createPublicFeedbackTriageReport } from "./public-feedback-triage-engine";
import { addPublicFixQueueItems, createPublicFixQueue, createPublicFixQueueReport } from "./public-fix-queue-manager";
import { createPublicFixQueueSafetyReport } from "./public-fix-queue-safety";
import { createPublicFixRegressionReport } from "./public-fix-regression-mapper";
import { createPublicDailyReviewActionItem, createPublicDailyReviewRecord, createPublicDailyReviewReport } from "./public-daily-review-manager";
import { createPublicPauseContinueReport } from "./public-pause-continue-decision";
import { createPublicOwnerDailyReviewRecord, createPublicOwnerDailyReviewReport } from "./public-owner-daily-review";

export type TeoyubePublicFeedbackDailyReviewPackageBlocker = {
  id: string;
  label: string;
  reason: string;
  requiredAction: string;
};

export type TeoyubePublicFeedbackDailyReviewPackage = {
  id: string;
  label: string;
  feedbackTriageReport: ReturnType<typeof createPublicFeedbackTriageReport>;
  issueConversionReport: ReturnType<typeof createPublicFeedbackIssueConversionReport>;
  fixQueueReport: ReturnType<typeof createPublicFixQueueReport>;
  fixQueueSafetyReport: ReturnType<typeof createPublicFixQueueSafetyReport>;
  regressionReport: ReturnType<typeof createPublicFixRegressionReport>;
  dailyReviewReport: ReturnType<typeof createPublicDailyReviewReport>;
  pauseContinueReport: ReturnType<typeof createPublicPauseContinueReport>;
  ownerDailyReviewReport: ReturnType<typeof createPublicOwnerDailyReviewReport>;
  nextActionRecommendation: string;
  inMemoryOnly: true;
  sentExternally: false;
  fileWritten: false;
  databaseWritten: false;
  analyticsSent: false;
  externalServicesCalled: false;
  publicLaunchPerformedByCode: false;
  usersContacted: false;
  feedbackCollectedAutomatically: false;
  publicUrlFetched: false;
  rollbackPerformed: false;
  liveAiOrchestrationEnabled: false;
  generatedAt: string;
};

export function createPublicFeedbackTriageItem(input: Partial<TeoyubePublicFeedbackTriageItem> = {}): TeoyubePublicFeedbackTriageItem {
  return {
    id: input.id || "public_manual_feedback_sample_6_3",
    source: input.source || "manual_feedback",
    surface: input.surface || "Public TIG",
    category: input.category || "content_clarity",
    summary: input.summary || "Sanitized public feedback sample for daily review.",
    redactedNotes: input.redactedNotes || [],
    severity: input.severity || "medium",
    publicLaunchCritical: input.publicLaunchCritical ?? false,
    publicSafetyCritical: input.publicSafetyCritical ?? false,
    manuallyEntered: true,
    rawSensitiveTextStored: false,
    analyticsSent: false,
    databaseWritten: false,
    externalServicesCalled: false,
    hiddenPersonalizationCreated: false,
    liveAiOrchestrationEnabled: false,
    publicUrlFetched: false,
    usersContacted: false,
    legalApprovalClaimedWithoutRecord: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function createPublicFeedbackDailyReviewPackage(
  input: Partial<TeoyubePublicFeedbackDailyReviewPackage> & { feedbackItems?: TeoyubePublicFeedbackTriageItem[] } = {}
): TeoyubePublicFeedbackDailyReviewPackage {
  const feedbackItems = input.feedbackItems || [
    createPublicFeedbackTriageItem({
      id: "sample_public_scripture_anchor_feedback",
      category: "scripture_anchor",
      summary: "Scripture anchor missing sample.",
      redactedNotes: ["Sample only; manually entered and redacted."],
      publicLaunchCritical: true,
      publicSafetyCritical: true
    })
  ];
  const feedbackTriageReport = input.feedbackTriageReport || createPublicFeedbackTriageReport(feedbackItems);
  const issueConversionReport = input.issueConversionReport || createPublicFeedbackIssueConversionReport(feedbackItems);
  const fixQueue = addPublicFixQueueItems(createPublicFixQueue(), createIssuesFromPublicFeedback(feedbackItems));
  const fixQueueReport = input.fixQueueReport || createPublicFixQueueReport(fixQueue);
  const fixQueueSafetyReport = input.fixQueueSafetyReport || createPublicFixQueueSafetyReport(fixQueue);
  const regressionReport = input.regressionReport || createPublicFixRegressionReport(fixQueue);
  const dailyReviewRecord = createPublicDailyReviewRecord({
    feedbackVolume: feedbackTriageReport.itemCount,
    criticalFeedbackCount: feedbackTriageReport.publicLaunchCriticalCount,
    scriptureAnchorIssues: feedbackTriageReport.results.filter((entry) => entry.category === "scripture_anchor").length,
    publicFixQueueBlockerCount: fixQueueReport.publicLaunchBlockerCount,
    status: feedbackTriageReport.publicLaunchCriticalCount > 0 ? "pause_recommended" : "healthy",
    actionItems: [
      createPublicDailyReviewActionItem(),
      {
        id: "owner_review_public_launch_critical_feedback",
        label: "Owner review required for public-launch-critical feedback.",
        owner: "owner",
        requiredBeforeNextDay: true,
        publicLaunchCritical: true
      }
    ]
  });
  const dailyReviewReport = input.dailyReviewReport || createPublicDailyReviewReport([dailyReviewRecord]);
  const pauseContinueReport = input.pauseContinueReport || createPublicPauseContinueReport({
    feedbackTriageReport,
    fixQueueReport,
    dailyReviewReport,
    ownerReviewAccepted: true
  });
  const ownerDailyReviewReport = input.ownerDailyReviewReport || createPublicOwnerDailyReviewReport(
    createPublicOwnerDailyReviewRecord({ ownerDecision: pauseContinueReport.decision })
  );

  return {
    id: input.id || "public_feedback_daily_review_package_6_3",
    label: input.label || "Public Feedback Triage, Fix Queue, and Daily Review Package",
    feedbackTriageReport,
    issueConversionReport,
    fixQueueReport,
    fixQueueSafetyReport,
    regressionReport,
    dailyReviewReport,
    pauseContinueReport,
    ownerDailyReviewReport,
    nextActionRecommendation: input.nextActionRecommendation || "Public Launch Execution 6.4 - Public Safe Fix Release & Launch Stabilization",
    inMemoryOnly: true,
    sentExternally: false,
    fileWritten: false,
    databaseWritten: false,
    analyticsSent: false,
    externalServicesCalled: false,
    publicLaunchPerformedByCode: false,
    usersContacted: false,
    feedbackCollectedAutomatically: false,
    publicUrlFetched: false,
    rollbackPerformed: false,
    liveAiOrchestrationEnabled: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function getPublicFeedbackDailyReviewPackageBlockers(pkg: TeoyubePublicFeedbackDailyReviewPackage): TeoyubePublicFeedbackDailyReviewPackageBlocker[] {
  return [
    ...pkg.feedbackTriageReport.blockers.map((entry) => ({ id: `package_${entry.id}`, label: entry.label, reason: entry.reason, requiredAction: entry.requiredAction })),
    ...pkg.fixQueueReport.blockers.map((entry) => ({ id: `package_${entry.id}`, label: entry.label, reason: entry.reason, requiredAction: entry.requiredAction })),
    ...pkg.fixQueueSafetyReport.blockers.map((entry) => ({ id: `package_${entry.id}`, label: entry.label, reason: entry.reason, requiredAction: entry.requiredAction })),
    ...pkg.dailyReviewReport.blockers.map((entry) => ({ id: `package_${entry.id}`, label: entry.label, reason: entry.reason, requiredAction: entry.requiredAction })),
    ...pkg.ownerDailyReviewReport.blockers.map((entry) => ({ id: `package_${entry.id}`, label: entry.label, reason: entry.reason, requiredAction: entry.requiredAction })),
    pkg.sentExternally ? { id: "public_package_sent_externally", label: pkg.label, reason: "Package must not be sent externally.", requiredAction: "Keep package in memory." } : undefined,
    pkg.fileWritten ? { id: "public_package_file_written", label: pkg.label, reason: "Package must not write files.", requiredAction: "Keep package in memory." } : undefined,
    pkg.databaseWritten ? { id: "public_package_database_written", label: pkg.label, reason: "Package must not write databases.", requiredAction: "Remove production persistence." } : undefined,
    pkg.analyticsSent ? { id: "public_package_analytics_sent", label: pkg.label, reason: "Package must not send analytics.", requiredAction: "Remove analytics sending." } : undefined,
    pkg.externalServicesCalled ? { id: "public_package_external_services_called", label: pkg.label, reason: "Package must not call external services.", requiredAction: "Keep review local and manual." } : undefined,
    pkg.publicLaunchPerformedByCode ? { id: "public_package_launch_performed", label: pkg.label, reason: "Package must not launch Teoyube from code.", requiredAction: "Remove launch execution." } : undefined,
    pkg.usersContacted ? { id: "public_package_users_contacted", label: pkg.label, reason: "Package must not contact users.", requiredAction: "Keep user contact manual and outside code." } : undefined,
    pkg.feedbackCollectedAutomatically ? { id: "public_package_feedback_auto_collection", label: pkg.label, reason: "Package must not collect feedback automatically.", requiredAction: "Use manual feedback intake only." } : undefined,
    pkg.publicUrlFetched ? { id: "public_package_url_fetched", label: pkg.label, reason: "Package must not fetch public URLs.", requiredAction: "Keep URL checks manual." } : undefined,
    pkg.rollbackPerformed ? { id: "public_package_rollback_performed", label: pkg.label, reason: "Package must not perform rollback.", requiredAction: "Use rollback decision support only." } : undefined,
    pkg.liveAiOrchestrationEnabled ? { id: "public_package_live_ai_enabled", label: pkg.label, reason: "Package must not enable live AI orchestration.", requiredAction: "Keep live AI disabled unless separately approved." } : undefined
  ].filter(Boolean) as TeoyubePublicFeedbackDailyReviewPackageBlocker[];
}

export function getPublicFeedbackDailyReviewPackageWarnings(pkg: TeoyubePublicFeedbackDailyReviewPackage) {
  return [
    ...pkg.feedbackTriageReport.warnings,
    ...pkg.fixQueueReport.warnings,
    ...pkg.fixQueueSafetyReport.warnings,
    ...pkg.dailyReviewReport.warnings,
    ...pkg.ownerDailyReviewReport.warnings
  ];
}

export function createPublicFeedbackDailyReviewPackageDecision(pkg: TeoyubePublicFeedbackDailyReviewPackage = createPublicFeedbackDailyReviewPackage()) {
  return pkg.pauseContinueReport.decision;
}

export function validatePublicFeedbackDailyReviewPackage(pkg: TeoyubePublicFeedbackDailyReviewPackage = createPublicFeedbackDailyReviewPackage()) {
  const blockers = getPublicFeedbackDailyReviewPackageBlockers(pkg);
  const warnings = getPublicFeedbackDailyReviewPackageWarnings(pkg);
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0 && pkg.ownerDailyReviewReport.ready,
    decision: createPublicFeedbackDailyReviewPackageDecision(pkg),
    blockers,
    warnings,
    noPublicLaunchPerformedByCode: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlFetched: true,
    noRollbackPerformed: true,
    noExternalWrite: true
  };
}

export function createPublicFeedbackDailyReviewPackageReport(pkg: TeoyubePublicFeedbackDailyReviewPackage = createPublicFeedbackDailyReviewPackage()) {
  const blockers = getPublicFeedbackDailyReviewPackageBlockers(pkg);
  const warnings = getPublicFeedbackDailyReviewPackageWarnings(pkg);
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0 && pkg.ownerDailyReviewReport.ready,
    decision: pkg.pauseContinueReport.decision,
    package: pkg,
    blockers,
    warnings,
    inMemoryOnly: true,
    noPublicLaunchPerformedByCode: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlFetched: true,
    noRollbackPerformed: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
