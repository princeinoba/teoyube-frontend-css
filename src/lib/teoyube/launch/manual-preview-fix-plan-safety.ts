import type {
  TeoyubeManualPreviewIssueFixPlan,
  TeoyubeManualPreviewIssueSeverity
} from "./manual-preview-issue-triage-contracts";

export type TeoyubeManualPreviewFixPlanSafetyFinding = {
  id: string;
  fixPlanId: string;
  severity: Exclude<TeoyubeManualPreviewIssueSeverity, "unknown">;
  message: string;
  requiredAction: string;
};

function planText(fixPlan: TeoyubeManualPreviewIssueFixPlan): string {
  return [
    fixPlan.recommendedFixSummary,
    ...fixPlan.safeImplementationNotes,
    ...fixPlan.steps.map((step) => `${step.label} ${step.details}`)
  ].join(" ").toLowerCase();
}

function blocker(id: string, fixPlan: TeoyubeManualPreviewIssueFixPlan, message: string, requiredAction: string): TeoyubeManualPreviewFixPlanSafetyFinding {
  return {
    id,
    fixPlanId: fixPlan.id,
    severity: "critical",
    message,
    requiredAction
  };
}

function warning(id: string, fixPlan: TeoyubeManualPreviewIssueFixPlan, message: string, requiredAction: string): TeoyubeManualPreviewFixPlanSafetyFinding {
  return {
    id,
    fixPlanId: fixPlan.id,
    severity: "medium",
    message,
    requiredAction
  };
}

export function getFixPlanSafetyBlockers(fixPlan: TeoyubeManualPreviewIssueFixPlan): TeoyubeManualPreviewFixPlanSafetyFinding[] {
  const text = planText(fixPlan);
  const blockers: TeoyubeManualPreviewFixPlanSafetyFinding[] = [];

  if (/remove (the )?scripture anchor|delete (the )?scripture anchor|hide (the )?scripture anchor/.test(text)) {
    blockers.push(blocker("fix_plan_removes_scripture_anchor", fixPlan, "Fix plan appears to remove Scripture anchoring.", "Revise the plan so Scripture anchors remain visible and required."));
  }

  if (/remove (the )?explanation path|delete (the )?explanation path|hide (the )?explanation path/.test(text)) {
    blockers.push(blocker("fix_plan_removes_explanation_path", fixPlan, "Fix plan appears to remove explanation paths.", "Revise the plan so explanation paths remain available."));
  }

  if (/weaken fallback|disable fallback|empty fallback|remove fallback/.test(text)) {
    blockers.push(blocker("fix_plan_weakens_fallback", fixPlan, "Fix plan appears to weaken fallback safety.", "Keep fallback behavior Scripture-anchored, safe, and non-empty."));
  }

  if (/hide consent|remove consent|disable consent/.test(text)) {
    blockers.push(blocker("fix_plan_hides_consent", fixPlan, "Fix plan appears to hide consent controls.", "Keep consent controls visible or disable personalization on the affected surface."));
  }

  if (/hidden personalization|silent personalization|implicit personalization/.test(text)) {
    blockers.push(blocker("fix_plan_hidden_personalization", fixPlan, "Fix plan appears to introduce hidden personalization.", "Keep personalization visible, consent-aware, and reversible."));
  }

  if (/enable external analytics|send analytics|connect analytics/.test(text)) {
    blockers.push(blocker("fix_plan_enables_analytics", fixPlan, "Fix plan appears to enable external analytics.", "Keep external analytics disabled for this launch step."));
  }

  if (/enable production persistence|connect database|write to database|database write/.test(text)) {
    blockers.push(blocker("fix_plan_enables_persistence", fixPlan, "Fix plan appears to enable production persistence.", "Keep production persistence disconnected for this launch step."));
  }

  if (/enable live ai|connect openai|live ai orchestration/.test(text)) {
    blockers.push(blocker("fix_plan_enables_live_ai", fixPlan, "Fix plan appears to enable live AI orchestration.", "Keep live AI orchestration disabled for this launch step."));
  }

  if (/expose secret|show secret|print token|public token|api key/.test(text)) {
    blockers.push(blocker("fix_plan_exposes_secret", fixPlan, "Fix plan appears to expose secret-like data.", "Remove secret-like values and use placeholders only."));
  }

  if (/store raw sensitive|persist raw text|save private text/.test(text)) {
    blockers.push(blocker("fix_plan_stores_sensitive_text", fixPlan, "Fix plan appears to store raw sensitive text.", "Store only privacy-safe summaries and keep raw sensitive data out of persistence."));
  }

  if (/god told you with certainty|guaranteed divine|divine certainty/.test(text)) {
    blockers.push(blocker("fix_plan_claims_divine_certainty", fixPlan, "Fix plan appears to allow divine certainty claims.", "Keep language bounded and Scripture-grounded without claiming certainty."));
  }

  return blockers;
}

export function getFixPlanSafetyWarnings(fixPlan: TeoyubeManualPreviewIssueFixPlan): TeoyubeManualPreviewFixPlanSafetyFinding[] {
  const warnings: TeoyubeManualPreviewFixPlanSafetyFinding[] = [];

  if (fixPlan.regressionChecks.length === 0) {
    warnings.push(warning("fix_plan_missing_regression_checks", fixPlan, "Fix plan has no regression checks.", "Map at least one regression check before implementation."));
  }

  if (fixPlan.ownerReviewRequired && fixPlan.status !== "ready_for_owner_review") {
    warnings.push(warning("fix_plan_owner_review_status_mismatch", fixPlan, "Fix plan requires owner review but status does not reflect it.", "Mark the plan ready for owner review before implementation."));
  }

  if (fixPlan.riskLevel === "critical" && !fixPlan.softLaunchBlocker) {
    warnings.push(warning("fix_plan_critical_not_blocking", fixPlan, "Critical fix plan is not marked as a soft-launch blocker.", "Confirm blocker status before implementation."));
  }

  return warnings;
}

export function validateManualPreviewFixPlanSafety(fixPlan: TeoyubeManualPreviewIssueFixPlan) {
  const blockers = getFixPlanSafetyBlockers(fixPlan);
  const warnings = getFixPlanSafetyWarnings(fixPlan);

  return {
    valid: blockers.length === 0,
    fixPlanId: fixPlan.id,
    blockers,
    warnings,
    noUnsafeAutomation: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}

export function validateManualPreviewFixPlansSafety(fixPlans: TeoyubeManualPreviewIssueFixPlan[]) {
  return fixPlans.map(validateManualPreviewFixPlanSafety);
}

export function createFixPlanSafetyReport(fixPlans: TeoyubeManualPreviewIssueFixPlan[]) {
  const results = validateManualPreviewFixPlansSafety(fixPlans);
  const blockers = results.flatMap((result) => result.blockers);
  const warnings = results.flatMap((result) => result.warnings);

  return {
    valid: blockers.length === 0,
    fixPlanCount: fixPlans.length,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    results,
    blockers,
    warnings,
    noFixesApplied: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
