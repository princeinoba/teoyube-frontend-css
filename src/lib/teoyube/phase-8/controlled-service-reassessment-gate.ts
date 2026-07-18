import type {
  TeoyubeControlledServiceReassessmentDecision,
  TeoyubeControlledServiceReassessmentItem,
  TeoyubeControlledServiceReassessmentKind,
  TeoyubeControlledServiceReassessmentReport,
  TeoyubeControlledServiceReassessmentRequirement,
  TeoyubeControlledServiceReassessmentRisk
} from "./controlled-service-reassessment-contracts";

function requirement(id: string, label: string, details: string): TeoyubeControlledServiceReassessmentRequirement {
  return { id, label, details, required: true };
}

function risk(id: string, kind: TeoyubeControlledServiceReassessmentKind, severity: TeoyubeControlledServiceReassessmentRisk["severity"], message: string, mitigation: string): TeoyubeControlledServiceReassessmentRisk {
  return { id, kind, severity, message, mitigation };
}

function baselineRequirements(kind: TeoyubeControlledServiceReassessmentKind): TeoyubeControlledServiceReassessmentRequirement[] {
  return [
    requirement("owner_approval", "Owner approval", "Explicit owner approval is required before future implementation."),
    requirement("privacy_review", "Privacy review", "Privacy, consent, minimization, retention, deletion, and sensitive data handling must be reviewed."),
    requirement("security_review", "Security review", "Authentication, authorization, abuse, secrets, logging, and data protection must be reviewed."),
    requirement("cost_review", "Cost review", "Operational cost, quotas, limits, and rollback costs must be reviewed."),
    requirement("rollback_plan", "Rollback plan", "Disable/rollback plan must exist before any future connection."),
    requirement("data_protection", "Data protection", "Data protection requirements must be documented before implementation."),
    ...(kind === "live_ai_orchestration" ? [requirement("scripture_theology_safety", "Scripture/theology safety", "Graph grounding, Scripture anchors, explanations, confidence, and fallback behavior must be reviewed.")] : [])
  ];
}

function serviceItem(
  kind: TeoyubeControlledServiceReassessmentKind,
  label: string,
  decision: TeoyubeControlledServiceReassessmentDecision,
  rationale: string
): TeoyubeControlledServiceReassessmentItem {
  return {
    id: `phase_8_1_${kind}_gate`,
    kind,
    label,
    currentStatus: decision === "remain_plan_only" ? "plan_only" : decision === "eligible_for_future_design_review" ? "eligible_for_future_design_review" : "disabled",
    decision,
    rationale,
    evidenceNeeded: [
      "owner approval",
      "privacy review",
      "security review",
      "cost review",
      "rollback plan",
      "data protection review",
      "manual QA and regression evidence"
    ],
    requirements: baselineRequirements(kind),
    risks: [
      risk(`${kind}_privacy_risk`, kind, "high", `${label} may introduce privacy or sensitive-data risk.`, "Keep disabled until privacy review is complete."),
      risk(`${kind}_operational_risk`, kind, "medium", `${label} may add operational cost, maintenance, or rollback risk.`, "Keep plan-only until operational review is complete.")
    ],
    noServiceConnected: true,
    noExternalWrite: true,
    noProductionDataMutation: true
  };
}

export function reassessDatabasePersistenceGate(): TeoyubeControlledServiceReassessmentItem {
  return serviceItem("database_persistence", "Database persistence", "eligible_for_future_design_review", "Persistence remains disabled; future design review may evaluate consent, retention, deletion, and data protection.");
}

export function reassessAnalyticsGate(): TeoyubeControlledServiceReassessmentItem {
  return serviceItem("external_analytics", "External analytics", "eligible_for_future_design_review", "Analytics remain disabled; future design review must prove consent, minimization, payload safety, and opt-out behavior.");
}

export function reassessMonitoringGate(): TeoyubeControlledServiceReassessmentItem {
  return serviceItem("production_monitoring", "Production monitoring", "remain_plan_only", "Production monitoring remains plan-only; future implementation requires payload redaction and privacy/security review.");
}

export function reassessAdminAuthGate(): TeoyubeControlledServiceReassessmentItem {
  return serviceItem("admin_auth", "Admin authentication", "eligible_for_future_design_review", "Admin auth remains disabled; future design review must cover access control, secrets, auditability, and rollback.");
}

export function reassessAdminCmsGate(): TeoyubeControlledServiceReassessmentItem {
  return serviceItem("admin_cms", "Admin CMS", "eligible_for_future_design_review", "Admin CMS remains disabled; future design review must preserve reviewed-content gates and no automatic publishing.");
}

export function reassessFeedbackStorageGate(): TeoyubeControlledServiceReassessmentItem {
  return serviceItem("feedback_storage", "Feedback storage", "eligible_for_future_design_review", "Feedback storage remains disabled; future design review must handle sensitive text, consent, redaction, deletion, and retention.");
}

export function reassessUserAccountsGate(): TeoyubeControlledServiceReassessmentItem {
  return serviceItem("user_accounts", "User accounts", "eligible_for_future_design_review", "User accounts remain disabled; future design review must cover identity, consent, privacy, security, and support burden.");
}

export function reassessLiveAiGate(): TeoyubeControlledServiceReassessmentItem {
  return serviceItem("live_ai_orchestration", "Live AI orchestration", "eligible_for_future_design_review", "Live AI remains disabled; future review must prove grounding, Scripture anchors, explanation traces, confidence labels, fallback safety, and cost controls.");
}

export function reassessEmailNotificationGate(): TeoyubeControlledServiceReassessmentItem {
  return serviceItem("email_notifications", "Email notifications", "eligible_for_future_design_review", "Email/SMS/notifications remain disabled; future review must cover consent, unsubscribe, emergency boundaries, and no automatic spiritual claims.");
}

export function createControlledServiceReassessmentGate(): TeoyubeControlledServiceReassessmentItem[] {
  return [
    reassessDatabasePersistenceGate(),
    reassessAnalyticsGate(),
    reassessMonitoringGate(),
    reassessAdminAuthGate(),
    reassessAdminCmsGate(),
    reassessFeedbackStorageGate(),
    reassessUserAccountsGate(),
    reassessLiveAiGate(),
    reassessEmailNotificationGate()
  ];
}

export function createControlledServiceReassessmentDecision(items: TeoyubeControlledServiceReassessmentItem[] = createControlledServiceReassessmentGate()): TeoyubeControlledServiceReassessmentDecision {
  if (items.some((entry) => !entry.noServiceConnected || !entry.noExternalWrite || !entry.noProductionDataMutation)) return "blocked";
  return items.some((entry) => entry.decision === "eligible_for_future_design_review") ? "eligible_for_future_design_review" : "remain_disabled";
}

export function createControlledServiceReassessmentReport(items: TeoyubeControlledServiceReassessmentItem[] = createControlledServiceReassessmentGate()): TeoyubeControlledServiceReassessmentReport {
  const blockers = items
    .filter((entry) => !entry.noServiceConnected || !entry.noExternalWrite || !entry.noProductionDataMutation)
    .map((entry) => ({
      id: `${entry.id}_connected`,
      kind: entry.kind,
      message: `${entry.label} must not be connected, write externally, or mutate production data during Phase 8.1.`,
      requiredAction: "Restore service-disabled state before continuing."
    }));
  return {
    valid: blockers.length === 0,
    decision: createControlledServiceReassessmentDecision(items),
    items,
    blockers,
    warnings: items.map((entry) => ({
      id: `${entry.id}_future_review`,
      kind: entry.kind,
      message: `${entry.label}: ${entry.rationale}`,
      recommendedAction: "Keep disabled or plan-only until all reassessment requirements are complete."
    })),
    noServiceConnected: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noUserAccountsAdded: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
