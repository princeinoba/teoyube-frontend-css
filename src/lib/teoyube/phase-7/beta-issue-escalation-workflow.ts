import type { TeoyubeBetaSupportCategory, TeoyubeBetaSupportSeverity } from "./beta-support-workflow-contracts";

export type TeoyubeBetaOperationalIssue = {
  id: string;
  category: TeoyubeBetaSupportCategory | "reviewed_content_gate" | "service_disabled_state" | "controlled_admin" | "debug_payload" | "mobile" | "accessibility" | "divine_certainty" | "professional_advice";
  summary: string;
  notes: string[];
  severity?: TeoyubeBetaSupportSeverity;
  manualOnly?: true;
};

export type TeoyubeBetaOperationalEscalationReport = {
  valid: boolean;
  issues: Array<TeoyubeBetaOperationalIssue & {
    severity: TeoyubeBetaSupportSeverity;
    blocking: boolean;
    recommendedAction: string;
    escalationPath: string[];
  }>;
  blockers: string[];
  warnings: string[];
  manualOnly: true;
  inMemoryOnly: true;
  noRollbackPerformed: true;
  noUsersContacted: true;
  noExternalServicesRequired: true;
  generatedAt: string;
};

const BLOCKING_CATEGORIES = new Set<TeoyubeBetaOperationalIssue["category"]>([
  "app_not_loading",
  "scripture_anchor_question",
  "explanation_trace_question",
  "fallback_confusion",
  "confidence_label_confusion",
  "reviewed_content_gate",
  "privacy_consent_question",
  "service_disabled_state",
  "controlled_admin",
  "debug_payload",
  "mobile",
  "accessibility",
  "divine_certainty",
  "professional_advice"
]);

export function createBetaIssueEscalationWorkflow() {
  return {
    id: "phase_7_1_beta_issue_escalation_workflow",
    blockingCategories: Array.from(BLOCKING_CATEGORIES),
    manualOnly: true,
    inMemoryOnly: true,
    noRollbackPerformed: true,
    noUsersContacted: true,
    noExternalServicesRequired: true
  };
}

export function classifyBetaOperationalIssue(issue: TeoyubeBetaOperationalIssue): TeoyubeBetaOperationalIssue["category"] {
  const value = `${issue.category} ${issue.summary} ${issue.notes.join(" ")}`;
  if (/app not loading|blank screen|crash|white screen/i.test(value)) return "app_not_loading";
  if (/scripture|verse|anchor missing/i.test(value)) return "scripture_anchor_question";
  if (/explanation|trace missing/i.test(value)) return "explanation_trace_question";
  if (/fallback|unsafe fallback/i.test(value)) return "fallback_confusion";
  if (/confidence|label missing/i.test(value)) return "confidence_label_confusion";
  if (/review-only|review only|unreviewed content/i.test(value)) return "reviewed_content_gate";
  if (/privacy|consent/i.test(value)) return "privacy_consent_question";
  if (/service enabled|database|analytics|monitoring|live ai/i.test(value)) return "service_disabled_state";
  if (/admin|cms|persistence/i.test(value)) return "controlled_admin";
  if (/debug payload|raw json|debug visible/i.test(value)) return "debug_payload";
  if (/mobile|small screen/i.test(value)) return "mobile";
  if (/accessibility|screen reader|keyboard|focus|contrast/i.test(value)) return "accessibility";
  if (/divine certainty|god told me|guaranteed calling/i.test(value)) return "divine_certainty";
  if (/medical|legal|financial|professional advice|diagnose|prescribe/i.test(value)) return "professional_advice";
  return issue.category;
}

export function getBetaOperationalIssueSeverity(issue: TeoyubeBetaOperationalIssue): TeoyubeBetaSupportSeverity {
  const category = classifyBetaOperationalIssue(issue);
  if (["app_not_loading", "service_disabled_state", "divine_certainty", "professional_advice"].includes(category)) return "critical";
  if (["scripture_anchor_question", "explanation_trace_question", "fallback_confusion", "privacy_consent_question", "reviewed_content_gate", "controlled_admin", "debug_payload"].includes(category)) return "high";
  if (["confidence_label_confusion", "mobile", "accessibility"].includes(category)) return issue.severity === "critical" ? "critical" : "high";
  return issue.severity || "medium";
}

export function isBetaOperationalBlockingIssue(issue: TeoyubeBetaOperationalIssue): boolean {
  const category = classifyBetaOperationalIssue(issue);
  const severity = getBetaOperationalIssueSeverity(issue);
  return BLOCKING_CATEGORIES.has(category) || severity === "critical";
}

export function getBetaOperationalIssueRecommendedAction(issue: TeoyubeBetaOperationalIssue): string {
  if (isBetaOperationalBlockingIssue(issue)) return "Pause controlled beta operations and route to manual owner review before continuing.";
  return "Document for manual issue triage and review during the next owner review.";
}

export function getBetaOperationalEscalationPath(issue: TeoyubeBetaOperationalIssue): string[] {
  const category = classifyBetaOperationalIssue(issue);
  if (category === "professional_advice") return ["manual_owner_review", "support_boundary_review", "do_not_provide_professional_advice"];
  if (category === "divine_certainty") return ["manual_owner_review", "theology_safety_review", "remove_divine_certainty_language"];
  if (category === "service_disabled_state") return ["manual_owner_review", "service_gate_review", "pause_until_disabled"];
  if (category === "privacy_consent_question") return ["manual_owner_review", "privacy_consent_review", "redaction_review"];
  if (category === "app_not_loading") return ["manual_owner_review", "technical_triage", "pause_if_confirmed"];
  return ["manual_owner_review", "manual_issue_triage", "safe_fix_review"];
}

export function createBetaIssueEscalationWorkflowReport(issues: TeoyubeBetaOperationalIssue[] = []): TeoyubeBetaOperationalEscalationReport {
  const enriched = issues.map((issue) => ({
    ...issue,
    category: classifyBetaOperationalIssue(issue),
    severity: getBetaOperationalIssueSeverity(issue),
    blocking: isBetaOperationalBlockingIssue(issue),
    recommendedAction: getBetaOperationalIssueRecommendedAction(issue),
    escalationPath: getBetaOperationalEscalationPath(issue),
    manualOnly: true as const
  }));
  const blockers = enriched.filter((issue) => issue.blocking).map((issue) => `${issue.summary}: ${issue.recommendedAction}`);
  return {
    valid: true,
    issues: enriched,
    blockers,
    warnings: enriched.filter((issue) => !issue.blocking).map((issue) => `${issue.summary}: ${issue.recommendedAction}`),
    manualOnly: true,
    inMemoryOnly: true,
    noRollbackPerformed: true,
    noUsersContacted: true,
    noExternalServicesRequired: true,
    generatedAt: new Date().toISOString()
  };
}
