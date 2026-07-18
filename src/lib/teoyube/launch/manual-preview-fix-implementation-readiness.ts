import { createFixPlanSafetyReport } from "./manual-preview-fix-plan-safety";
import type { TeoyubeManualPreviewIssueFixPlan } from "./manual-preview-issue-triage-contracts";

export type TeoyubeManualPreviewFixImplementationDecision =
  | "ready_for_safe_fixes"
  | "ready_after_owner_review"
  | "blocked"
  | "needs_more_triage"
  | "defer_to_later"
  | "unknown";

export type TeoyubeManualPreviewFixImplementationChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  complete: boolean;
  details: string;
};

function item(id: string, label: string, complete: boolean, details: string): TeoyubeManualPreviewFixImplementationChecklistItem {
  return {
    id,
    label,
    required: true,
    complete,
    details
  };
}

export function createFixImplementationReadinessChecklist(
  fixPlans: TeoyubeManualPreviewIssueFixPlan[] = []
): TeoyubeManualPreviewFixImplementationChecklistItem[] {
  const safety = createFixPlanSafetyReport(fixPlans);

  return [
    item("fix_plans_exist", "Fix plans exist", fixPlans.length > 0, "At least one issue fix plan should exist before implementation."),
    item("fix_plans_safety_validated", "Fix plans are safety validated", safety.valid, "Fix plans must not remove Scripture anchors, explanation paths, fallbacks, consent, or safety boundaries."),
    item("regression_checks_mapped", "Regression checks are mapped", fixPlans.every((plan) => plan.regressionChecks.length > 0), "Each fix plan should include regression checks."),
    item("soft_launch_blockers_visible", "Soft-launch blockers are visible", fixPlans.every((plan) => typeof plan.softLaunchBlocker === "boolean"), "Soft-launch blocker status must be explicit."),
    item("owner_review_visible", "Owner review requirement is visible", fixPlans.every((plan) => typeof plan.ownerReviewRequired === "boolean"), "Owner review requirement must be explicit."),
    item("no_fixes_applied_automatically", "No fixes are applied automatically", true, "This step only prepares fix plans; it does not change production behavior.")
  ];
}

export function getFixImplementationBlockers(fixPlans: TeoyubeManualPreviewIssueFixPlan[]): string[] {
  const checklist = createFixImplementationReadinessChecklist(fixPlans);
  const safety = createFixPlanSafetyReport(fixPlans);

  return [
    ...checklist.filter((entry) => entry.required && !entry.complete).map((entry) => entry.label),
    ...safety.blockers.map((entry) => entry.message)
  ];
}

export function getFixImplementationWarnings(fixPlans: TeoyubeManualPreviewIssueFixPlan[]): string[] {
  const safety = createFixPlanSafetyReport(fixPlans);
  const ownerReviewCount = fixPlans.filter((plan) => plan.ownerReviewRequired).length;

  return [
    ...safety.warnings.map((entry) => entry.message),
    ownerReviewCount > 0 ? `${ownerReviewCount} fix plan(s) require owner review before implementation.` : undefined,
    "Implementation must remain scoped and must not connect providers, persistence, analytics, or live AI."
  ].filter((entry): entry is string => Boolean(entry));
}

export function createFixImplementationDecision(fixPlans: TeoyubeManualPreviewIssueFixPlan[]): TeoyubeManualPreviewFixImplementationDecision {
  const blockers = getFixImplementationBlockers(fixPlans);
  if (blockers.length > 0) return fixPlans.length === 0 ? "needs_more_triage" : "blocked";
  if (fixPlans.every((plan) => plan.severity === "low" && !plan.softLaunchBlocker)) return "defer_to_later";
  if (fixPlans.some((plan) => plan.ownerReviewRequired)) return "ready_after_owner_review";
  return "ready_for_safe_fixes";
}

export function validateFixImplementationReadiness(fixPlans: TeoyubeManualPreviewIssueFixPlan[]) {
  const checklist = createFixImplementationReadinessChecklist(fixPlans);
  const blockers = getFixImplementationBlockers(fixPlans);
  const warnings = getFixImplementationWarnings(fixPlans);
  const decision = createFixImplementationDecision(fixPlans);

  return {
    valid: blockers.length === 0,
    decision,
    checklist,
    blockers,
    warnings,
    noFixesApplied: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}

export function createFixImplementationReadinessReport(fixPlans: TeoyubeManualPreviewIssueFixPlan[]) {
  const readiness = validateFixImplementationReadiness(fixPlans);

  return {
    ...readiness,
    fixPlanCount: fixPlans.length,
    ownerReviewRequiredCount: fixPlans.filter((plan) => plan.ownerReviewRequired).length,
    softLaunchBlockerCount: fixPlans.filter((plan) => plan.softLaunchBlocker).length
  };
}
