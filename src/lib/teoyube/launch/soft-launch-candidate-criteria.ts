import { createPreviewRollbackPlan } from "./preview-rollback-execution-checklist";
import { createSoftLaunchCandidateReadinessReport } from "./soft-launch-candidate-planner";
import { createSoftLaunchFeedbackIntakeReport, createSoftLaunchFeedbackLog } from "./soft-launch-feedback-intake";
import { createSoftLaunchManualApprovalChecklist } from "./soft-launch-manual-approval";
import { createSoftLaunchRunbookReport } from "./soft-launch-runbook";

export type TeoyubeSoftLaunchCandidateCriteriaDecision =
  | "criteria_met"
  | "criteria_met_with_warnings"
  | "blocked"
  | "needs_review"
  | "unknown";

export type TeoyubeSoftLaunchCandidateCriteriaState = {
  unresolvedLaunchCriticalIssues?: number;
  unresolvedScriptureAnchorBlockers?: number;
  unresolvedExplanationPathBlockers?: number;
  unsafeFallbackBlockers?: number;
  consentPrivacyBlockers?: number;
  criticalMobileBlockers?: number;
  criticalAccessibilityBlockers?: number;
  exposedDebugPayloads?: number;
  externalAnalyticsEnabled?: boolean;
  productionPersistenceEnabled?: boolean;
  liveAiOrchestrationEnabled?: boolean;
  regressionChecksCompleteOrDocumented?: boolean;
  softLaunchScopeDocumented?: boolean;
  softLaunchRunbookExists?: boolean;
  feedbackIntakePlanExists?: boolean;
  rollbackCriteriaExist?: boolean;
  ownerReviewChecklistExists?: boolean;
};

export type TeoyubeSoftLaunchCandidateCriterion = {
  id: string;
  label: string;
  required: boolean;
  passed: boolean;
  launchCritical: boolean;
  details: string;
};

export type TeoyubeSoftLaunchCandidateCriteriaReport = {
  valid: boolean;
  decision: TeoyubeSoftLaunchCandidateCriteriaDecision;
  criterionCount: number;
  passedCount: number;
  blockerCount: number;
  warningCount: number;
  criteria: TeoyubeSoftLaunchCandidateCriterion[];
  blockers: string[];
  warnings: string[];
  noExternalWrite: true;
  generatedAt: string;
};

function value(state: TeoyubeSoftLaunchCandidateCriteriaState, key: keyof TeoyubeSoftLaunchCandidateCriteriaState): boolean {
  return state[key] !== false;
}

function countIsZero(state: TeoyubeSoftLaunchCandidateCriteriaState, key: keyof TeoyubeSoftLaunchCandidateCriteriaState): boolean {
  const count = state[key];
  return typeof count === "number" ? count === 0 : true;
}

function criterion(id: string, label: string, passed: boolean, details: string, launchCritical = true): TeoyubeSoftLaunchCandidateCriterion {
  return {
    id,
    label,
    required: true,
    passed,
    launchCritical,
    details
  };
}

export function getSoftLaunchCandidateCriteria(state: TeoyubeSoftLaunchCandidateCriteriaState = {}): TeoyubeSoftLaunchCandidateCriterion[] {
  const runbook = createSoftLaunchRunbookReport();
  const feedback = createSoftLaunchFeedbackIntakeReport(createSoftLaunchFeedbackLog());
  const rollback = createPreviewRollbackPlan();
  const candidate = createSoftLaunchCandidateReadinessReport();
  const ownerReview = createSoftLaunchManualApprovalChecklist();

  return [
    criterion("no_unresolved_launch_critical_issues", "No unresolved launch-critical issues", countIsZero(state, "unresolvedLaunchCriticalIssues"), "Launch-critical issues must be resolved or documented."),
    criterion("no_unresolved_scripture_anchor_blockers", "No unresolved Scripture anchor blockers", countIsZero(state, "unresolvedScriptureAnchorBlockers"), "Scripture anchor blockers must be resolved."),
    criterion("no_unresolved_explanation_path_blockers", "No unresolved explanation path blockers", countIsZero(state, "unresolvedExplanationPathBlockers"), "Explanation path blockers must be resolved."),
    criterion("no_unsafe_fallback_blockers", "No unsafe fallback blockers", countIsZero(state, "unsafeFallbackBlockers"), "Fallback blockers must be resolved."),
    criterion("no_consent_privacy_blockers", "No consent/privacy blockers", countIsZero(state, "consentPrivacyBlockers"), "Consent and privacy blockers must be resolved."),
    criterion("no_critical_mobile_blockers", "No critical mobile blockers", countIsZero(state, "criticalMobileBlockers"), "Critical mobile blockers must be resolved."),
    criterion("no_critical_accessibility_blockers", "No critical accessibility blockers", countIsZero(state, "criticalAccessibilityBlockers"), "Critical accessibility blockers must be resolved."),
    criterion("no_exposed_debug_payloads", "No exposed debug payloads", countIsZero(state, "exposedDebugPayloads"), "Debug internals must be hidden."),
    criterion("no_external_analytics_enabled", "No accidental external analytics sending", state.externalAnalyticsEnabled !== true, "External analytics must remain disabled."),
    criterion("no_production_persistence_enabled", "No accidental persistence enablement", state.productionPersistenceEnabled !== true, "Production persistence must remain disabled."),
    criterion("no_live_ai_orchestration", "No live AI orchestration", state.liveAiOrchestrationEnabled !== true, "Live AI orchestration must remain disabled."),
    criterion("regression_checks_complete_or_documented", "Regression checks complete or documented", value(state, "regressionChecksCompleteOrDocumented"), "Regression checks must pass or be warning-documented."),
    criterion("soft_launch_scope_documented", "Soft launch scope documented", value(state, "softLaunchScopeDocumented") && candidate.surfaceCount > 0, "Soft launch scope must be documented."),
    criterion("soft_launch_runbook_exists", "Soft launch runbook exists", value(state, "softLaunchRunbookExists") && runbook.ready, "Soft launch runbook must exist."),
    criterion("feedback_intake_plan_exists", "Feedback intake plan exists", value(state, "feedbackIntakePlanExists") && feedback.valid, "Feedback intake remains manual and privacy-safe.", false),
    criterion("rollback_criteria_exist", "Rollback criteria exist", value(state, "rollbackCriteriaExist") && rollback.checklist.length > 0, "Rollback criteria must be documented."),
    criterion("owner_review_checklist_exists", "Owner review checklist exists", value(state, "ownerReviewChecklistExists") && ownerReview.length > 0, "Owner review checklist must exist.")
  ];
}

export function getSoftLaunchCandidateCriteriaBlockers(state: TeoyubeSoftLaunchCandidateCriteriaState = {}): string[] {
  return getSoftLaunchCandidateCriteria(state)
    .filter((entry) => entry.required && entry.launchCritical && !entry.passed)
    .map((entry) => `${entry.label}: ${entry.details}`);
}

export function getSoftLaunchCandidateCriteriaWarnings(state: TeoyubeSoftLaunchCandidateCriteriaState = {}): string[] {
  return getSoftLaunchCandidateCriteria(state)
    .filter((entry) => entry.required && !entry.launchCritical && !entry.passed)
    .map((entry) => `${entry.label}: ${entry.details}`);
}

export function validateSoftLaunchCandidateCriteria(state: TeoyubeSoftLaunchCandidateCriteriaState = {}) {
  const blockers = getSoftLaunchCandidateCriteriaBlockers(state);
  const warnings = getSoftLaunchCandidateCriteriaWarnings(state);

  return {
    valid: blockers.length === 0,
    blockers,
    warnings
  };
}

export function createSoftLaunchCandidateCriteriaDecision(
  state: TeoyubeSoftLaunchCandidateCriteriaState = {}
): TeoyubeSoftLaunchCandidateCriteriaDecision {
  const validation = validateSoftLaunchCandidateCriteria(state);

  if (validation.blockers.length > 0) return "blocked";
  if (validation.warnings.length > 0) return "criteria_met_with_warnings";
  return "criteria_met";
}

export function createSoftLaunchCandidateCriteriaReport(
  state: TeoyubeSoftLaunchCandidateCriteriaState = {}
): TeoyubeSoftLaunchCandidateCriteriaReport {
  const criteria = getSoftLaunchCandidateCriteria(state);
  const blockers = getSoftLaunchCandidateCriteriaBlockers(state);
  const warnings = getSoftLaunchCandidateCriteriaWarnings(state);

  return {
    valid: blockers.length === 0,
    decision: createSoftLaunchCandidateCriteriaDecision(state),
    criterionCount: criteria.length,
    passedCount: criteria.filter((entry) => entry.passed).length,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    criteria,
    blockers,
    warnings,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
