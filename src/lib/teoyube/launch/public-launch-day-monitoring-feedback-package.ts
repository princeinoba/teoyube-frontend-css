import { createPublicLaunchDayFeedbackIntakeReport, createPublicLaunchDayFeedbackItem, createPublicLaunchDayFeedbackLog, addPublicLaunchDayFeedbackItem } from "./public-launch-day-feedback-intake";
import { triagePublicLaunchDayFeedback } from "./public-launch-day-feedback-triage";
import { createPublicLaunchDayMonitoringReport, createPublicLaunchDayMonitoringRun } from "./public-launch-day-monitoring-run";
import { createPublicLaunchDayCommunicationStatus, createPublicLaunchDayOwnerReview, getPublicLaunchDayOwnerCommunicationBlockers, getPublicLaunchDayOwnerCommunicationWarnings } from "./public-launch-day-owner-communication-review";
import type { TeoyubePublicLaunchDayBlocker, TeoyubePublicLaunchDayDecision, TeoyubePublicLaunchDayWarning } from "./public-launch-day-monitoring-feedback-contracts";

export type TeoyubePublicLaunchDayMonitoringFeedbackPackage = {
  id: string;
  label: string;
  monitoringReport: ReturnType<typeof createPublicLaunchDayMonitoringReport>;
  feedbackIntakeReport: ReturnType<typeof createPublicLaunchDayFeedbackIntakeReport>;
  triageResults: ReturnType<typeof triagePublicLaunchDayFeedback>;
  ownerReview: ReturnType<typeof createPublicLaunchDayOwnerReview>;
  communicationStatus: ReturnType<typeof createPublicLaunchDayCommunicationStatus>;
  knownLimitations: string[];
  nextActionRecommendation: string;
  inMemoryOnly: true;
  sentExternally: false;
  fileWritten: false;
  databaseWritten: false;
  analyticsSent: false;
  publicLaunchPerformedByCode: false;
  usersContacted: false;
  feedbackCollectedAutomatically: false;
  publicUrlFetched: false;
  generatedAt: string;
};

export function createPublicLaunchDayMonitoringFeedbackPackage(input: Partial<TeoyubePublicLaunchDayMonitoringFeedbackPackage> = {}): TeoyubePublicLaunchDayMonitoringFeedbackPackage {
  const feedback = createPublicLaunchDayFeedbackItem({ id: "sample_public_launch_feedback", category: "general", summary: "Sample sanitized public launch day feedback." });
  const feedbackLog = addPublicLaunchDayFeedbackItem(createPublicLaunchDayFeedbackLog(), feedback);
  const feedbackIntakeReport = input.feedbackIntakeReport || createPublicLaunchDayFeedbackIntakeReport(feedbackLog);
  return {
    id: input.id || "public_launch_day_monitoring_feedback_package_6_2",
    label: input.label || "Public Launch Day Monitoring & Feedback Intake Package",
    monitoringReport: input.monitoringReport || createPublicLaunchDayMonitoringReport(createPublicLaunchDayMonitoringRun()),
    feedbackIntakeReport,
    triageResults: input.triageResults || triagePublicLaunchDayFeedback(feedbackIntakeReport.log.items),
    ownerReview: input.ownerReview || createPublicLaunchDayOwnerReview(),
    communicationStatus: input.communicationStatus || createPublicLaunchDayCommunicationStatus(),
    knownLimitations: input.knownLimitations || [
      "Public launch day monitoring is manual and does not fetch public URLs.",
      "Public feedback intake is manual or explicitly controlled only.",
      "Production persistence, external analytics, and live AI orchestration remain disabled unless separately approved.",
      "Owner review remains required before public launch expansion or stabilization."
    ],
    nextActionRecommendation: input.nextActionRecommendation || "Public Launch Execution 6.3 - Public Feedback Triage, Fix Queue & Daily Review",
    inMemoryOnly: true,
    sentExternally: false,
    fileWritten: false,
    databaseWritten: false,
    analyticsSent: false,
    publicLaunchPerformedByCode: false,
    usersContacted: false,
    feedbackCollectedAutomatically: false,
    publicUrlFetched: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function getPublicLaunchDayMonitoringFeedbackPackageBlockers(pkg: TeoyubePublicLaunchDayMonitoringFeedbackPackage): TeoyubePublicLaunchDayBlocker[] {
  return [
    ...pkg.monitoringReport.blockers,
    ...pkg.feedbackIntakeReport.blockers,
    ...getPublicLaunchDayOwnerCommunicationBlockers(pkg.ownerReview, pkg.communicationStatus),
    ...pkg.triageResults.filter((entry) => entry.severity === "critical").map((entry) => ({ id: `public_launch_day_package_${entry.id}`, label: entry.category.replace(/_/g, " "), phase: "public_feedback_triage" as const, severity: "critical" as const, reason: entry.rationale, requiredAction: "Pause public promotion and complete owner review." })),
    pkg.sentExternally ? { id: "public_launch_day_package_sent", label: "Package sent externally", phase: "daily_summary", severity: "critical", reason: "Package must not be sent externally.", requiredAction: "Keep package in memory." } : undefined,
    pkg.fileWritten ? { id: "public_launch_day_package_file_written", label: "Package wrote files", phase: "daily_summary", severity: "critical", reason: "Package must not write files.", requiredAction: "Keep package in memory." } : undefined,
    pkg.databaseWritten ? { id: "public_launch_day_package_database_written", label: "Package wrote database", phase: "production_service_review", severity: "critical", reason: "Package must not write databases.", requiredAction: "Remove database writes." } : undefined,
    pkg.analyticsSent ? { id: "public_launch_day_package_analytics_sent", label: "Package sent analytics", phase: "production_service_review", severity: "critical", reason: "Package must not send analytics.", requiredAction: "Remove analytics sending." } : undefined,
    pkg.publicLaunchPerformedByCode ? { id: "public_launch_day_package_launched", label: "Package launched by code", phase: "public_launch_observation", severity: "critical", reason: "Package must not perform public launch.", requiredAction: "Keep launch execution manual." } : undefined,
    pkg.usersContacted ? { id: "public_launch_day_package_users_contacted", label: "Package contacted users", phase: "public_launch_observation", severity: "critical", reason: "Package must not contact users.", requiredAction: "Keep communication manual." } : undefined,
    pkg.feedbackCollectedAutomatically ? { id: "public_launch_day_package_feedback_auto_collected", label: "Feedback collected automatically", phase: "public_feedback_intake", severity: "critical", reason: "Package must not collect feedback automatically.", requiredAction: "Use manual feedback intake." } : undefined,
    pkg.publicUrlFetched ? { id: "public_launch_day_package_url_fetched", label: "Public URL fetched", phase: "public_surface_monitoring", severity: "critical", reason: "Package must not fetch public URLs.", requiredAction: "Keep public URL checks manual." } : undefined
  ].filter(Boolean) as TeoyubePublicLaunchDayBlocker[];
}

export function getPublicLaunchDayMonitoringFeedbackPackageWarnings(pkg: TeoyubePublicLaunchDayMonitoringFeedbackPackage): TeoyubePublicLaunchDayWarning[] {
  return [
    ...pkg.monitoringReport.warnings,
    ...pkg.feedbackIntakeReport.warnings,
    ...getPublicLaunchDayOwnerCommunicationWarnings(pkg.ownerReview),
    ...pkg.triageResults.filter((entry) => entry.severity === "high" || entry.severity === "medium").map((entry) => ({ id: `public_launch_day_triage_warning_${entry.feedbackId}`, label: entry.category.replace(/_/g, " "), phase: "public_feedback_triage" as const, severity: entry.severity === "high" ? "high" as const : "medium" as const, message: entry.rationale, recommendedAction: "Review public launch feedback before expanding scope." }))
  ];
}

export function createPublicLaunchDayMonitoringFeedbackPackageDecision(pkg: TeoyubePublicLaunchDayMonitoringFeedbackPackage): TeoyubePublicLaunchDayDecision {
  const blockers = getPublicLaunchDayMonitoringFeedbackPackageBlockers(pkg);
  if (blockers.some((entry) => /rollback|analytics|database|url fetched|unsafe/i.test(`${entry.label} ${entry.reason}`))) return "rollback_recommended";
  if (blockers.length > 0) return "pause_public_promotion";
  if (getPublicLaunchDayMonitoringFeedbackPackageWarnings(pkg).length > 0) return "continue_with_warnings";
  return "continue_controlled_public_launch";
}

export function createPublicLaunchDayMonitoringFeedbackPackageReport(pkg: TeoyubePublicLaunchDayMonitoringFeedbackPackage = createPublicLaunchDayMonitoringFeedbackPackage()) {
  const blockers = getPublicLaunchDayMonitoringFeedbackPackageBlockers(pkg);
  const warnings = getPublicLaunchDayMonitoringFeedbackPackageWarnings(pkg);
  const decision = createPublicLaunchDayMonitoringFeedbackPackageDecision(pkg);
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0 && ["continue_controlled_public_launch", "continue_with_warnings"].includes(decision),
    decision,
    package: pkg,
    blockers,
    warnings,
    inMemoryOnly: true,
    noPublicLaunchPerformedByCode: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlFetched: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
