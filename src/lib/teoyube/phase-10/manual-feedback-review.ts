import type {
  TeoyubeManualFeedbackItem,
  TeoyubeManualFeedbackReviewBlocker,
  TeoyubeManualFeedbackReviewCategory,
  TeoyubeManualFeedbackReviewDecision,
  TeoyubeManualFeedbackReviewReport,
  TeoyubeManualFeedbackReviewResult,
  TeoyubeManualFeedbackReviewSource,
  TeoyubeManualFeedbackReviewStatus,
  TeoyubeManualFeedbackReviewWarning
} from "./manual-feedback-review-contracts";
import type { TeoyubeFirstDayIssueSeverity } from "./first-day-issue-triage-contracts";

export type TeoyubeManualFeedbackReviewInput = Partial<{
  items: TeoyubeManualFeedbackItem[];
  feedbackSourceManual: boolean;
  noAutomaticFeedbackCollectionIntroduced: boolean;
  noSensitivePersonalDataStoredInCode: boolean;
  feedbackCategorized: boolean;
  issueSeverityAssignedWhereNeeded: boolean;
  spiritualSafetyConcernsEscalated: boolean;
  routePageConcernsLinked: boolean;
  safeFixCandidatesPreserveBoundaries: boolean;
  futureEnhancementsSeparated: boolean;
}>;

export type TeoyubeManualFeedbackItemInput = Partial<{
  id: string;
  source: TeoyubeManualFeedbackReviewSource;
  category: TeoyubeManualFeedbackReviewCategory;
  status: TeoyubeManualFeedbackReviewStatus;
  summary: string;
  affectedArea: string;
  issueSeverity: TeoyubeFirstDayIssueSeverity;
  containsSensitivePersonalData: boolean;
  spiritualSafetyConcern: boolean;
  notes: string[];
}>;

function checklistItem(id: string, label: string, passed: boolean, details: string) {
  return { id, label, passed, details };
}

export function createManualFeedbackReviewChecklist(input: TeoyubeManualFeedbackReviewInput = {}) {
  return [
    checklistItem("manual_source", "Feedback source is manual", input.feedbackSourceManual === true, "Feedback must be manually reviewed, not collected by code."),
    checklistItem("no_auto_collection", "No automatic feedback collection introduced", input.noAutomaticFeedbackCollectionIntroduced === true, "No automatic feedback pipeline is added."),
    checklistItem("no_sensitive_storage", "No sensitive personal data stored in code", input.noSensitivePersonalDataStoredInCode === true, "Sensitive personal data must not be stored in code or fixtures."),
    checklistItem("categorized", "Feedback is categorized", input.feedbackCategorized === true, "Feedback should be categorized before triage."),
    checklistItem("severity_assigned", "Issue severity assigned where needed", input.issueSeverityAssignedWhereNeeded === true, "Bug/safety feedback needs issue severity when actionable."),
    checklistItem("spiritual_escalation", "Spiritual safety concerns escalated", input.spiritualSafetyConcernsEscalated === true, "Spiritual safety feedback must receive owner review."),
    checklistItem("route_linked", "Route/page concerns linked to affected area", input.routePageConcernsLinked === true, "Affected route or area should be recorded."),
    checklistItem("safe_fix_boundaries", "Safe-fix candidates preserve all boundaries", input.safeFixCandidatesPreserveBoundaries === true, "Safe-fix candidates must preserve Scripture, explanation, fallback, confidence, privacy, and service-disabled state."),
    checklistItem("enhancements_separated", "Future enhancements separated from launch blockers", input.futureEnhancementsSeparated === true, "Enhancement requests should not be treated as launch blockers.")
  ];
}

export function createManualFeedbackItem(input: TeoyubeManualFeedbackItemInput = {}): TeoyubeManualFeedbackItem {
  return {
    id: input.id || `manual_feedback_${Date.now()}`,
    source: input.source || "unknown",
    category: input.category || "unknown",
    status: input.status || "new",
    summary: input.summary || "Manual feedback review placeholder.",
    affectedArea: input.affectedArea || "manual_owner_required",
    issueSeverity: input.issueSeverity,
    containsSensitivePersonalData: input.containsSensitivePersonalData ?? false,
    spiritualSafetyConcern: input.spiritualSafetyConcern ?? false,
    notes: input.notes || []
  };
}

export function reviewManualFeedbackItem(input: TeoyubeManualFeedbackItemInput = {}): TeoyubeManualFeedbackReviewResult {
  const feedback = createManualFeedbackItem(input);
  let decision: TeoyubeManualFeedbackReviewDecision = "log_for_watch";
  if (feedback.containsSensitivePersonalData) decision = "triage_as_issue";
  if (feedback.spiritualSafetyConcern || feedback.category === "spiritual_safety") decision = "pause_release";
  if (feedback.issueSeverity === "severity_1_critical") decision = "rollback_required";
  if (feedback.issueSeverity === "severity_2_high") decision = "safe_fix_candidate";
  if (feedback.issueSeverity === "severity_3_medium") decision = "safe_fix_candidate";
  if (feedback.category === "feature_request") decision = "defer_to_backlog";
  if (feedback.category === "encouragement") decision = "no_action";
  return {
    feedback: { ...feedback, status: "reviewing" },
    decision,
    rationale: decision === "rollback_required"
      ? "Critical manual feedback requires rollback review."
      : decision === "pause_release"
        ? "Spiritual safety or high-risk feedback requires pausing promotion for review."
        : decision === "safe_fix_candidate"
          ? "Feedback can enter safe-fix review if boundaries remain intact."
          : decision === "defer_to_backlog"
            ? "Feedback is a future enhancement, not a launch blocker."
            : "Feedback is logged for manual watch."
  };
}

export function recordManualFeedbackReviewResult(results: TeoyubeManualFeedbackReviewResult[], result: TeoyubeManualFeedbackReviewResult): TeoyubeManualFeedbackReviewResult[] {
  return [...results.filter((entry) => entry.feedback.id !== result.feedback.id), result];
}

export function getManualFeedbackReviewBlockers(input: TeoyubeManualFeedbackReviewInput = {}): TeoyubeManualFeedbackReviewBlocker[] {
  return (input.items || [])
    .filter((entry) => entry.issueSeverity === "severity_1_critical" || entry.containsSensitivePersonalData || entry.spiritualSafetyConcern)
    .map((entry) => ({ id: `${entry.id}_blocker`, feedbackId: entry.id, message: entry.summary }));
}

export function getManualFeedbackReviewWarnings(input: TeoyubeManualFeedbackReviewInput = {}): TeoyubeManualFeedbackReviewWarning[] {
  const warnings = createManualFeedbackReviewChecklist(input)
    .filter((entry) => !entry.passed)
    .map((entry) => ({ id: `${entry.id}_warning`, feedbackId: "checklist", message: entry.details }));
  (input.items || [])
    .filter((entry) => entry.issueSeverity === "severity_2_high" || entry.issueSeverity === "severity_3_medium")
    .forEach((entry) => warnings.push({ id: `${entry.id}_warning`, feedbackId: entry.id, message: entry.summary }));
  return warnings;
}

export function createManualFeedbackReviewDecision(input: TeoyubeManualFeedbackReviewInput = {}): TeoyubeManualFeedbackReviewDecision {
  if (getManualFeedbackReviewBlockers(input).length) return "pause_release";
  if ((input.items || []).some((entry) => entry.issueSeverity === "severity_2_high")) return "safe_fix_candidate";
  if ((input.items || []).some((entry) => entry.category === "feature_request")) return "defer_to_backlog";
  return (input.items || []).length ? "log_for_watch" : "unknown";
}

export function createManualFeedbackReviewReport(input: TeoyubeManualFeedbackReviewInput = {}): TeoyubeManualFeedbackReviewReport {
  const blockers = getManualFeedbackReviewBlockers(input);
  const items = input.items || [];
  return {
    valid: blockers.length === 0,
    checklist: createManualFeedbackReviewChecklist(input),
    results: items.map((entry) => reviewManualFeedbackItem(entry)),
    blockers,
    warnings: getManualFeedbackReviewWarnings(input),
    decision: createManualFeedbackReviewDecision(input),
    noAutomaticFeedbackCollection: true,
    noSensitiveDataStoredInCode: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
