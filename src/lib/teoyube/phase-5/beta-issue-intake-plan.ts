export type TeoyubeBetaIssueCategory =
  | "app_not_loading"
  | "real_data_failure"
  | "user_journey_failure"
  | "scripture_anchor_missing"
  | "explanation_trace_missing"
  | "unsafe_fallback"
  | "confidence_label_missing"
  | "review_only_content_visible"
  | "privacy_consent_issue"
  | "mobile_issue"
  | "accessibility_issue"
  | "admin_prototype_issue"
  | "disabled_service_issue"
  | "debug_payload_visible"
  | "divine_certainty_language"
  | "professional_advice_language"
  | "performance_issue"
  | "content_clarity"
  | "unknown";

export type TeoyubeBetaIssueSeverity = "critical" | "high" | "medium" | "low" | "informational" | "unknown";

export type TeoyubeBetaIssueRule = {
  id: string;
  category: TeoyubeBetaIssueCategory;
  severity: TeoyubeBetaIssueSeverity;
  rule: string;
  manualAction: string;
};

export type TeoyubeBetaIssueIntakePlan = {
  id: string;
  categories: TeoyubeBetaIssueCategory[];
  severityLevels: TeoyubeBetaIssueSeverity[];
  triageRules: TeoyubeBetaIssueRule[];
  escalationRules: TeoyubeBetaIssueRule[];
  manualOnly: true;
  noAutomaticCollection: true;
  noExternalSend: true;
  noUsersContacted: true;
  noFeedbackStored: true;
  inMemoryOnly: true;
  createdAt: string;
};

export type TeoyubeBetaIssueIntakePlanReport = {
  valid: boolean;
  plan: TeoyubeBetaIssueIntakePlan;
  blockers: string[];
  warnings: string[];
  manualOnly: true;
  noAutomaticCollection: true;
  noExternalSend: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export function getBetaIssueCategories(): TeoyubeBetaIssueCategory[] {
  return [
    "app_not_loading",
    "real_data_failure",
    "user_journey_failure",
    "scripture_anchor_missing",
    "explanation_trace_missing",
    "unsafe_fallback",
    "confidence_label_missing",
    "review_only_content_visible",
    "privacy_consent_issue",
    "mobile_issue",
    "accessibility_issue",
    "admin_prototype_issue",
    "disabled_service_issue",
    "debug_payload_visible",
    "divine_certainty_language",
    "professional_advice_language",
    "performance_issue",
    "content_clarity",
    "unknown"
  ];
}

export function getBetaIssueSeverityLevels(): TeoyubeBetaIssueSeverity[] {
  return ["critical", "high", "medium", "low", "informational", "unknown"];
}

function rule(id: string, category: TeoyubeBetaIssueCategory, severity: TeoyubeBetaIssueSeverity, ruleText: string, manualAction: string): TeoyubeBetaIssueRule {
  return { id, category, severity, rule: ruleText, manualAction };
}

export function getBetaIssueTriageRules(): TeoyubeBetaIssueRule[] {
  return [
    rule("scripture_anchor_missing", "scripture_anchor_missing", "high", "Available Scripture anchor is missing or unsupported reference appears.", "Pause affected recommendation path and map to Scripture anchor regression."),
    rule("explanation_trace_missing", "explanation_trace_missing", "high", "Explanation path or fallback reason is hidden.", "Map to explanation trace regression before continuing QA."),
    rule("unsafe_fallback", "unsafe_fallback", "critical", "Fallback invents unsupported promise, calling, prayer, or certainty claim.", "Pause beta preparation for affected surface."),
    rule("confidence_label_missing", "confidence_label_missing", "medium", "Confidence label or uncertainty boundary is missing.", "Add to manual QA fix queue."),
    rule("review_only_content_visible", "review_only_content_visible", "critical", "Review-only draft appears in live surface.", "Pause release candidate flow and restore reviewed-content gate."),
    rule("privacy_consent_issue", "privacy_consent_issue", "critical", "Privacy or consent notice missing near sensitive input.", "Pause affected input flow until copy is restored."),
    rule("disabled_service_issue", "disabled_service_issue", "critical", "Disabled service appears required, connected, or contacted.", "Stop beta preparation and restore disabled service state."),
    rule("debug_payload_visible", "debug_payload_visible", "critical", "Debug payload is visible to normal users.", "Hide debug payload before any beta execution."),
    rule("divine_certainty_language", "divine_certainty_language", "critical", "Language claims divine certainty.", "Rewrite to restore devotional and uncertainty boundaries."),
    rule("professional_advice_language", "professional_advice_language", "critical", "Language presents medical, legal, financial, emergency, or other professional advice.", "Remove professional-advice language before beta execution."),
    rule("real_data_failure", "real_data_failure", "high", "Real Teoyube data fails to load or validate.", "Map to real-data QA and fix before owner acceptance."),
    rule("user_journey_failure", "user_journey_failure", "high", "Core user journey cannot complete safely.", "Map to journey QA and fix before owner acceptance.")
  ];
}

export function getBetaIssueEscalationRules(): TeoyubeBetaIssueRule[] {
  return [
    rule("critical_owner_escalation", "unknown", "critical", "Any critical issue requires owner review before beta execution.", "Escalate manually to owner."),
    rule("privacy_security_escalation", "privacy_consent_issue", "critical", "Any privacy or consent issue requires privacy/security review.", "Escalate manually and do not collect additional sensitive details."),
    rule("service_gate_escalation", "disabled_service_issue", "critical", "Any service gate issue requires service lock review.", "Escalate manually and keep services disconnected.")
  ];
}

export function createBetaIssueIntakePlan(): TeoyubeBetaIssueIntakePlan {
  return {
    id: "phase_5_1_beta_issue_intake_plan",
    categories: getBetaIssueCategories(),
    severityLevels: getBetaIssueSeverityLevels(),
    triageRules: getBetaIssueTriageRules(),
    escalationRules: getBetaIssueEscalationRules(),
    manualOnly: true,
    noAutomaticCollection: true,
    noExternalSend: true,
    noUsersContacted: true,
    noFeedbackStored: true,
    inMemoryOnly: true,
    createdAt: new Date().toISOString()
  };
}

export function createBetaIssueIntakePlanReport(): TeoyubeBetaIssueIntakePlanReport {
  const plan = createBetaIssueIntakePlan();
  const blockers = plan.categories.length && plan.triageRules.length && plan.escalationRules.length ? [] : ["Issue intake plan is missing categories or rules."];
  return {
    valid: blockers.length === 0,
    plan,
    blockers,
    warnings: ["Issue intake remains manual-only and must not collect issues automatically."],
    manualOnly: true,
    noAutomaticCollection: true,
    noExternalSend: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
