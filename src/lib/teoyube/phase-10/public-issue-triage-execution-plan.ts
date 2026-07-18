export type TeoyubePublicIssueTriageExecutionCategory = {
  id: string;
  label: string;
  blocking: boolean;
  manualAction: string;
};

export type TeoyubePublicIssueTriageExecutionInput = Partial<Record<string, boolean>>;

function category(id: string, label: string, manualAction: string, blocking = true): TeoyubePublicIssueTriageExecutionCategory {
  return { id, label, blocking, manualAction };
}

export function getPublicIssueTriageExecutionCategories(): TeoyubePublicIssueTriageExecutionCategory[] {
  return [
    category("app_not_loading", "App not loading", "Pause release activity and verify local runtime/build."),
    category("route_not_rendering", "Route not rendering", "Record route, viewport, and error output; route QA is required."),
    category("real_data_not_loading", "Real data not loading", "Check vocabulary, promise clusters, and Scripture canon loading."),
    category("scripture_anchor_missing", "Scripture anchor missing", "Block affected content until anchor support is restored."),
    category("explanation_trace_missing", "Explanation trace missing", "Block recommendation surface until explanation trace is restored."),
    category("unsafe_fallback", "Unsafe fallback", "Pause affected flow and replace fallback with supported safe copy."),
    category("confidence_label_missing", "Confidence label missing", "Restore confidence label before public execution."),
    category("reviewed_content_gate_failure", "Reviewed content gate failure", "Block publishing path and keep review-only content out of production JSON."),
    category("privacy_consent_missing", "Privacy/consent missing", "Restore privacy and consent notice before public execution."),
    category("sensitive_data_warning_missing", "Sensitive data warning missing", "Restore sensitive-data warning before collecting any manual feedback."),
    category("known_limitations_missing", "Known limitations missing", "Restore limitations copy before public execution."),
    category("service_accidentally_enabled", "Service accidentally enabled", "Disable service and review service lock."),
    category("debug_payload_visible", "Debug payload visible", "Remove debug payload from normal user surface."),
    category("critical_mobile_blocker", "Critical mobile blocker", "Block public execution until mobile flow is usable."),
    category("critical_accessibility_blocker", "Critical accessibility blocker", "Block public execution until accessibility baseline is restored."),
    category("divine_certainty_language", "Divine-certainty language", "Rewrite copy to avoid claiming divine certainty."),
    category("professional_advice_language", "Professional-advice language", "Rewrite copy and preserve no professional advice boundary."),
    category("automatic_user_contact", "Automatic user contact", "Disable contact path immediately."),
    category("automatic_feedback_collection", "Automatic feedback collection", "Disable automatic intake and return to manual feedback."),
    category("public_url_fetching_from_code", "Public URL fetching from code", "Remove automatic public URL fetching and use manual checks.")
  ];
}

export function getPublicIssueTriageBlockingCategories(): TeoyubePublicIssueTriageExecutionCategory[] {
  return getPublicIssueTriageExecutionCategories().filter((entry) => entry.blocking);
}

export function getPublicIssueTriageRecommendedManualActions(): string[] {
  return getPublicIssueTriageExecutionCategories().map((entry) => `${entry.label}: ${entry.manualAction}`);
}

export function createPublicIssueTriageExecutionChecklist(): TeoyubePublicIssueTriageExecutionCategory[] {
  return getPublicIssueTriageExecutionCategories();
}

export function createPublicIssueTriageExecutionPlan(input: TeoyubePublicIssueTriageExecutionInput = {}) {
  const categories = getPublicIssueTriageExecutionCategories();
  const triggered = categories.filter((entry) => input[entry.id]);
  return {
    categories,
    triggered,
    blockingTriggered: triggered.filter((entry) => entry.blocking),
    manualActions: triggered.length ? triggered.map((entry) => entry.manualAction) : getPublicIssueTriageRecommendedManualActions(),
    noAutomaticUserContact: true,
    noAutomaticFeedbackCollection: true,
    noPublicUrlFetching: true,
    inMemoryOnly: true
  };
}

export function createPublicIssueTriageExecutionDecision(input: TeoyubePublicIssueTriageExecutionInput = {}): "ready" | "manual_triage_required" | "blocked" {
  const plan = createPublicIssueTriageExecutionPlan(input);
  if (plan.blockingTriggered.length) return "blocked";
  if (plan.triggered.length) return "manual_triage_required";
  return "ready";
}

export function createPublicIssueTriageExecutionReport(input: TeoyubePublicIssueTriageExecutionInput = {}) {
  const plan = createPublicIssueTriageExecutionPlan(input);
  return {
    valid: plan.blockingTriggered.length === 0,
    decision: createPublicIssueTriageExecutionDecision(input),
    plan,
    categories: plan.categories,
    blockingCategories: getPublicIssueTriageBlockingCategories(),
    blockers: plan.blockingTriggered.map((entry) => `${entry.id}: ${entry.manualAction}`),
    warnings: ["Issue triage is manual and does not contact users, collect feedback automatically, or fetch public URLs."],
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
