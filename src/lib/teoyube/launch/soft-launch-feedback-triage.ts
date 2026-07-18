import type {
  TeoyubeSoftLaunchFeedbackCategory,
  TeoyubeSoftLaunchFeedbackItem,
  TeoyubeSoftLaunchFeedbackLog,
  TeoyubeSoftLaunchFeedbackSeverity,
  TeoyubeSoftLaunchFeedbackTriageDecision
} from "./soft-launch-feedback-contracts";

const launchCriticalTypes = [
  "scripture_anchor_issue",
  "explanation_path_issue",
  "fallback_issue",
  "consent_issue",
  "mobile_layout_issue",
  "accessibility_issue",
  "personalization_preview_issue"
];

function decisionForFeedback(item: TeoyubeSoftLaunchFeedbackItem): TeoyubeSoftLaunchFeedbackTriageDecision {
  if (item.type === "scripture_anchor_issue" || item.type === "spiritual_content_feedback") return "scripture_content_review_required";
  if (item.type === "consent_issue") return "consent_review_required";
  if (item.type === "accessibility_issue") return "accessibility_review_required";
  if (item.severity === "critical") return "pause_soft_launch";
  if (item.severity === "high") return "fix_before_wider_sharing";
  if (item.type === "fallback_issue") return "safety_review_required";
  if (item.type === "positive_feedback") return "continue_monitoring";
  return "document_known_limitation";
}

export function getCriticalSoftLaunchFeedback(log: TeoyubeSoftLaunchFeedbackLog): TeoyubeSoftLaunchFeedbackItem[] {
  return log.items.filter((item) =>
    item.severity === "critical" ||
    item.severity === "high" ||
    launchCriticalTypes.includes(item.type)
  );
}

export function getFeedbackBySurface(log: TeoyubeSoftLaunchFeedbackLog, surface: string): TeoyubeSoftLaunchFeedbackItem[] {
  const normalized = surface.toLowerCase();
  return log.items.filter((item) => (item.surface || "").toLowerCase() === normalized);
}

export function getFeedbackByCategory(
  log: TeoyubeSoftLaunchFeedbackLog,
  category: TeoyubeSoftLaunchFeedbackCategory
): TeoyubeSoftLaunchFeedbackItem[] {
  return log.items.filter((item) => item.category === category);
}

export function getFeedbackBySeverity(
  log: TeoyubeSoftLaunchFeedbackLog,
  severity: TeoyubeSoftLaunchFeedbackSeverity
): TeoyubeSoftLaunchFeedbackItem[] {
  return log.items.filter((item) => item.severity === severity);
}

export function triageSoftLaunchFeedback(log: TeoyubeSoftLaunchFeedbackLog) {
  const criticalFeedback = getCriticalSoftLaunchFeedback(log);

  return {
    valid: criticalFeedback.length === 0,
    feedbackCount: log.items.length,
    criticalFeedback,
    decisions: log.items.map((item) => ({
      feedbackId: item.id,
      decision: decisionForFeedback(item),
      reason: `${item.type} on ${item.surface || "unknown surface"} with ${item.severity} severity.`
    })),
    priorityOrder: [
      "Missing Scripture anchors",
      "Missing explanation paths",
      "Unsafe fallback behavior",
      "Consent control problems",
      "Exposed debug data",
      "Mobile layout blockers",
      "Accessibility blockers",
      "App crash reports",
      "Privacy concerns",
      "Confusing spiritual guidance",
      "Personalization concern reports"
    ]
  };
}

export function createSoftLaunchFeedbackResolutionPlan(log: TeoyubeSoftLaunchFeedbackLog) {
  const triage = triageSoftLaunchFeedback(log);

  return {
    requiredActions: triage.criticalFeedback.map((item) => ({
      feedbackId: item.id,
      action: decisionForFeedback(item),
      details: item.summary
    })),
    warningActions: log.items
      .filter((item) => !triage.criticalFeedback.some((critical) => critical.id === item.id))
      .map((item) => ({
        feedbackId: item.id,
        action: decisionForFeedback(item),
        details: item.summary
      })),
    notes: [
      "Do not make code changes automatically from feedback.",
      "Scripture, explanation, fallback, consent, privacy, mobile, and accessibility issues require manual review."
    ]
  };
}

export function createSoftLaunchFeedbackTriageReport(log: TeoyubeSoftLaunchFeedbackLog) {
  const triage = triageSoftLaunchFeedback(log);

  return {
    ...triage,
    resolutionPlan: createSoftLaunchFeedbackResolutionPlan(log),
    generatedAt: new Date().toISOString()
  };
}
