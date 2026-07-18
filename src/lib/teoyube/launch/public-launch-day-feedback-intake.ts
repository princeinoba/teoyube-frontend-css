import type {
  TeoyubePublicLaunchDayBlocker,
  TeoyubePublicLaunchDayFeedbackCategory,
  TeoyubePublicLaunchDayFeedbackItem,
  TeoyubePublicLaunchDayWarning
} from "./public-launch-day-monitoring-feedback-contracts";

export type TeoyubePublicLaunchDayFeedbackLog = {
  id: string;
  label: string;
  items: TeoyubePublicLaunchDayFeedbackItem[];
  workflowMode: "manual" | "explicitly_controlled";
  manualOnly: true;
  inMemoryOnly: true;
  feedbackCollectedAutomatically: false;
  issuesSentExternally: false;
  databaseWritten: false;
  analyticsSent: false;
  rawSensitiveTextStored: false;
  generatedAt: string;
};

export function createPublicLaunchDayFeedbackItem(input: Partial<TeoyubePublicLaunchDayFeedbackItem> = {}): TeoyubePublicLaunchDayFeedbackItem {
  const category = input.category || "general";
  return {
    id: input.id || `public_launch_feedback_${category}`,
    source: input.source || "manual_observation",
    surface: input.surface || "public_surface",
    category,
    summary: input.summary || "Sanitized manual public launch feedback summary.",
    reportedImpact: input.reportedImpact || "Needs owner review.",
    privacySensitive: input.privacySensitive ?? category === "privacy",
    scriptureConcern: input.scriptureConcern ?? category === "scripture_anchor",
    explanationPathConcern: input.explanationPathConcern ?? category === "explanation_path",
    fallbackConcern: input.fallbackConcern ?? category === "fallback_safety",
    mobileAccessibilityConcern: input.mobileAccessibilityConcern ?? category === "mobile_accessibility",
    serviceStatusConcern: input.serviceStatusConcern ?? category === "production_service_status",
    unsafeSpiritualGuidanceConcern: input.unsafeSpiritualGuidanceConcern ?? category === "unsafe_spiritual_guidance",
    ownerResponseNote: input.ownerResponseNote || "Manual owner review pending.",
    rawSensitiveTextStored: false,
    recordedManually: true,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function createPublicLaunchDayFeedbackLog(input: Partial<TeoyubePublicLaunchDayFeedbackLog> = {}): TeoyubePublicLaunchDayFeedbackLog {
  return {
    id: input.id || "public_launch_day_feedback_log_6_2",
    label: input.label || "Public Launch Day Manual Feedback Intake",
    items: input.items || [],
    workflowMode: input.workflowMode || "manual",
    manualOnly: true,
    inMemoryOnly: true,
    feedbackCollectedAutomatically: false,
    issuesSentExternally: false,
    databaseWritten: false,
    analyticsSent: false,
    rawSensitiveTextStored: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function addPublicLaunchDayFeedbackItem(log: TeoyubePublicLaunchDayFeedbackLog, item: TeoyubePublicLaunchDayFeedbackItem): TeoyubePublicLaunchDayFeedbackLog {
  return { ...log, items: [...log.items, item] };
}

function block(id: string, label: string, reason: string): TeoyubePublicLaunchDayBlocker {
  return { id, label, phase: "public_feedback_intake", severity: "critical", reason, requiredAction: "Keep public launch feedback intake manual, sanitized, and owner-reviewed." };
}

export function getPublicLaunchDayFeedbackIntakeBlockers(log: TeoyubePublicLaunchDayFeedbackLog): TeoyubePublicLaunchDayBlocker[] {
  return [
    !["manual", "explicitly_controlled"].includes(log.workflowMode) ? block("public_launch_feedback_workflow_unknown", "Feedback workflow unknown", "Public launch feedback workflow must be manual or explicitly controlled.") : undefined,
    log.feedbackCollectedAutomatically ? block("public_launch_feedback_auto_collected", "Feedback collected automatically", "6.2 must not collect public feedback automatically.") : undefined,
    log.issuesSentExternally ? block("public_launch_feedback_external_send", "Feedback sent externally", "6.2 must not send feedback externally.") : undefined,
    log.databaseWritten ? block("public_launch_feedback_database_written", "Feedback database write", "6.2 must not write feedback to a database.") : undefined,
    log.analyticsSent ? block("public_launch_feedback_analytics_sent", "Feedback analytics sent", "6.2 must not send feedback analytics.") : undefined,
    log.rawSensitiveTextStored ? block("public_launch_feedback_sensitive_raw_text", "Raw sensitive text stored", "Raw sensitive feedback text must not be stored in this readiness package.") : undefined,
    ...log.items.filter((item) => item.rawSensitiveTextStored).map((item) => block(`public_launch_feedback_${item.id}_raw_sensitive`, "Feedback item stores raw sensitive text", "Public feedback items must use sanitized summaries only."))
  ].filter(Boolean) as TeoyubePublicLaunchDayBlocker[];
}

export function getPublicLaunchDayFeedbackIntakeWarnings(log: TeoyubePublicLaunchDayFeedbackLog): TeoyubePublicLaunchDayWarning[] {
  const sensitiveCategories: TeoyubePublicLaunchDayFeedbackCategory[] = ["privacy", "scripture_anchor", "explanation_path", "fallback_safety", "unsafe_spiritual_guidance"];
  return log.items.filter((item) => sensitiveCategories.includes(item.category)).map((item) => ({
    id: `public_launch_feedback_warning_${item.id}`,
    label: item.category.replace(/_/g, " "),
    phase: "public_feedback_intake",
    severity: "high",
    message: "Public launch feedback touches a launch-critical safety or privacy category.",
    recommendedAction: "Escalate to owner review before expanding public launch scope."
  }));
}

export function createPublicLaunchDayFeedbackIntakeReport(log: TeoyubePublicLaunchDayFeedbackLog = createPublicLaunchDayFeedbackLog()) {
  const blockers = getPublicLaunchDayFeedbackIntakeBlockers(log);
  const warnings = getPublicLaunchDayFeedbackIntakeWarnings(log);
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    log,
    itemCount: log.items.length,
    blockers,
    warnings,
    manualOnly: true,
    inMemoryOnly: true,
    noFeedbackCollectedAutomatically: true,
    noDatabaseWrites: true,
    noAnalyticsSent: true,
    noRawSensitiveTextStored: true,
    generatedAt: new Date().toISOString()
  };
}
