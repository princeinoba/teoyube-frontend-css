import type { TeoyubeLaunchDayFeedbackItem } from "./launch-day-manual-feedback-intake";
import type { TeoyubeLaunchDayMonitoringResult } from "./launch-day-monitoring-contracts";

export type TeoyubeLaunchDayEscalationLevel =
  | "observe"
  | "document"
  | "fix_after_launch_window"
  | "pause_for_review"
  | "rollback_recommended"
  | "critical_blocker"
  | "unknown";

export type TeoyubeLaunchDayIssue = {
  id: string;
  source: "monitoring" | "feedback" | "manual";
  surface: string;
  category: string;
  summary: string;
  launchCritical: boolean;
  escalationLevel: TeoyubeLaunchDayEscalationLevel;
  recommendations: string[];
  generatedAt: string;
};

const CRITICAL_TERMS = ["scripture", "explanation", "unsafe fallback", "consent", "privacy", "debug", "app not loading", "mobile blocker", "accessibility blocker", "analytics", "persistence", "live ai"];

export function getLaunchDayEscalationLevel(issue: Pick<TeoyubeLaunchDayIssue, "category" | "summary" | "launchCritical">): TeoyubeLaunchDayEscalationLevel {
  const text = `${issue.category} ${issue.summary}`.toLowerCase();
  if (issue.launchCritical || CRITICAL_TERMS.some((term) => text.includes(term))) return "critical_blocker";
  if (/fallback|mobile|accessibility|consent|privacy/.test(text)) return "pause_for_review";
  if (/bug|broken|error|confusing/.test(text)) return "fix_after_launch_window";
  if (/request|idea/.test(text)) return "document";
  return "observe";
}

export function getLaunchDayEscalationRecommendations(issue: Pick<TeoyubeLaunchDayIssue, "escalationLevel">): string[] {
  if (issue.escalationLevel === "critical_blocker") return ["Pause for owner review.", "Classify whether rollback is recommended.", "Do not continue participant expansion until resolved."];
  if (issue.escalationLevel === "rollback_recommended") return ["Recommend manual rollback review.", "Do not execute provider commands from code."];
  if (issue.escalationLevel === "pause_for_review") return ["Pause new participant sharing.", "Review during launch-day owner check-in."];
  if (issue.escalationLevel === "fix_after_launch_window") return ["Document for the fix queue.", "Review after the launch window."];
  if (issue.escalationLevel === "document") return ["Document for daily review."];
  return ["Observe and continue monitoring."];
}

export function escalateLaunchDayIssue(issue: TeoyubeLaunchDayIssue): TeoyubeLaunchDayIssue {
  const escalationLevel = getLaunchDayEscalationLevel(issue);
  return { ...issue, escalationLevel, recommendations: getLaunchDayEscalationRecommendations({ escalationLevel }) };
}

export function createLaunchDayIssueFromMonitoringResult(result: TeoyubeLaunchDayMonitoringResult): TeoyubeLaunchDayIssue {
  return escalateLaunchDayIssue({
    id: `issue_from_monitoring_${result.id}`,
    source: "monitoring",
    surface: result.checkId,
    category: result.checkId,
    summary: result.notes.join(" ") || result.checkId.replace(/_/g, " "),
    launchCritical: result.blocker || result.status === "fail",
    escalationLevel: "unknown",
    recommendations: [],
    generatedAt: new Date().toISOString()
  });
}

export function createLaunchDayIssueFromFeedbackItem(feedback: TeoyubeLaunchDayFeedbackItem): TeoyubeLaunchDayIssue {
  return escalateLaunchDayIssue({
    id: `issue_from_feedback_${feedback.id}`,
    source: "feedback",
    surface: feedback.surface,
    category: feedback.category,
    summary: feedback.summary,
    launchCritical: feedback.launchCritical,
    escalationLevel: "unknown",
    recommendations: [],
    generatedAt: new Date().toISOString()
  });
}

export function createLaunchDayIssueEscalationReport(issues: TeoyubeLaunchDayIssue[] = []) {
  const escalatedIssues = issues.map(escalateLaunchDayIssue);
  const criticalIssues = escalatedIssues.filter((issue) => issue.escalationLevel === "critical_blocker");

  return {
    valid: true,
    issueCount: escalatedIssues.length,
    criticalIssueCount: criticalIssues.length,
    issues: escalatedIssues,
    criticalIssues,
    recommendations: escalatedIssues.flatMap((issue) => issue.recommendations),
    noExternalSend: true,
    noDatabaseWrites: true,
    generatedAt: new Date().toISOString()
  };
}
