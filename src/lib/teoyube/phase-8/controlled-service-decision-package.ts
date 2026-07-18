import type {
  TeoyubeControlledServiceDecisionDecision,
  TeoyubeControlledServiceDecisionItem,
  TeoyubeControlledServiceDecisionKind,
  TeoyubeControlledServiceDecisionPackageStatus,
  TeoyubeControlledServiceDecisionReport,
  TeoyubeControlledServiceDecisionRequirement,
  TeoyubeControlledServiceDecisionRisk
} from "./controlled-service-decision-package-contracts";

export type TeoyubeControlledServiceDecisionPackageModel = {
  id: string;
  items: TeoyubeControlledServiceDecisionItem[];
  noServiceConnected: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noUserAccountsAdded: true;
  noLiveAiOrchestrationEnabled: true;
  noEmailNotificationsEnabled: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function requirement(id: string, label: string, details: string): TeoyubeControlledServiceDecisionRequirement {
  return { id, label, details, required: true };
}

function baseRequirements(kind: TeoyubeControlledServiceDecisionKind) {
  const safety = kind === "live_ai_orchestration" || kind === "public_release_support"
    ? [requirement("scripture_theology_safety", "Scripture/theology safety", "Preserve Scripture anchors, explanation traces, humble confidence, fallback safety, and no divine-certainty claims.")]
    : [];
  return {
    owner: [requirement("owner_approval", "Owner approval", "Explicit owner approval is required before implementation.")],
    privacy: [requirement("privacy_review", "Privacy review", "Consent, minimization, retention, deletion, and sensitive data handling must be reviewed.")],
    security: [requirement("security_review", "Security review", "Auth, authorization, secrets, abuse cases, logging, and data protection must be reviewed.")],
    cost: [requirement("cost_review", "Cost review", "Cost, quotas, limits, usage spikes, and rollback cost must be reviewed.")],
    rollback: [requirement("rollback_plan", "Rollback plan", "A disable/rollback plan must exist before implementation.")],
    data: [requirement("data_protection", "Data protection", "Data classification, retention, deletion, export, and access control must be documented.")],
    safety
  };
}

function risk(kind: TeoyubeControlledServiceDecisionKind, label: string): TeoyubeControlledServiceDecisionRisk[] {
  return [
    { id: `${kind}_privacy_risk`, kind, severity: "high", message: `${label} can introduce privacy or sensitive-data risk.`, mitigation: "Keep disabled or plan-only until privacy review is complete." },
    { id: `${kind}_operational_risk`, kind, severity: "medium", message: `${label} can add operational cost, maintenance, or rollback risk.`, mitigation: "Require cost, rollback, and owner review before implementation." }
  ];
}

function serviceItem(
  kind: TeoyubeControlledServiceDecisionKind,
  label: string,
  currentStatus: TeoyubeControlledServiceDecisionPackageStatus,
  decision: TeoyubeControlledServiceDecisionDecision,
  reasonForNotEnablingNow: string
): TeoyubeControlledServiceDecisionItem {
  const req = baseRequirements(kind);
  return {
    id: `phase_8_3_${kind}_decision`,
    kind,
    label,
    currentStatus,
    decision,
    reasonForNotEnablingNow,
    futureEvidenceRequired: [
      "owner approval",
      "privacy review",
      "security review",
      "cost review",
      "rollback plan",
      "data protection review",
      "manual QA and regression evidence"
    ],
    ownerReviewRequirements: req.owner,
    privacyReviewRequirements: req.privacy,
    securityReviewRequirements: req.security,
    costReviewRequirements: req.cost,
    rollbackRequirements: req.rollback,
    dataProtectionRequirements: req.data,
    safetyTheologyRequirements: req.safety,
    gates: [
      { id: `${kind}_owner_gate`, label: "Owner gate", required: true, satisfied: false, details: "Future implementation requires owner approval." },
      { id: `${kind}_privacy_gate`, label: "Privacy gate", required: true, satisfied: false, details: "Future implementation requires privacy review." },
      { id: `${kind}_security_gate`, label: "Security gate", required: true, satisfied: false, details: "Future implementation requires security review." },
      { id: `${kind}_cost_gate`, label: "Cost gate", required: true, satisfied: false, details: "Future implementation requires cost review." }
    ],
    risks: risk(kind, label),
    currentCodeProhibition: `${label} must not be enabled by Phase 8.3 code.`,
    noServiceConnected: true,
    noExternalWrite: true,
    noProductionDataMutation: true
  };
}

function defaultItems(): TeoyubeControlledServiceDecisionItem[] {
  return [
    serviceItem("database_persistence", "Database persistence", "disabled", "eligible_for_future_design_review", "Persistence remains disabled until consent, retention, deletion, security, and data-protection evidence exists."),
    serviceItem("external_analytics", "External analytics", "disabled", "eligible_for_future_design_review", "Analytics remain disabled until consent, payload minimization, opt-out, and privacy review exist."),
    serviceItem("production_monitoring", "Production monitoring", "plan_only", "remain_plan_only", "Monitoring remains plan-only until payload redaction, privacy, security, and cost review exist."),
    serviceItem("admin_auth", "Admin authentication", "disabled", "eligible_for_future_design_review", "Admin auth remains disabled until access control, secrets, audit, and rollback review exist."),
    serviceItem("admin_cms", "Admin CMS", "disabled", "eligible_for_future_design_review", "CMS remains disabled until reviewed-content gates, authorization, audit, and rollback are designed."),
    serviceItem("feedback_storage", "Feedback storage", "disabled", "eligible_for_future_design_review", "Feedback storage remains disabled until sensitive-data redaction, consent, retention, and deletion are designed."),
    serviceItem("user_accounts", "User accounts", "disabled", "eligible_for_future_design_review", "Accounts remain disabled until identity, privacy, security, and support burdens are reviewed."),
    serviceItem("live_ai_orchestration", "Live AI orchestration", "disabled", "eligible_for_future_design_review", "Live AI remains disabled until grounding, Scripture anchors, explanations, confidence, fallback, and cost controls are proven."),
    serviceItem("email_notifications", "Email/SMS/notifications", "disabled", "eligible_for_future_design_review", "Notifications remain disabled until consent, unsubscribe, safety, and emergency boundaries are reviewed."),
    serviceItem("file_storage", "File storage", "disabled", "eligible_for_future_design_review", "File storage remains disabled until malware, privacy, retention, deletion, and access control are reviewed."),
    serviceItem("search_index", "Search index", "disabled", "eligible_for_future_design_review", "Search indexing remains disabled until sensitive data, deletion, and visibility controls are reviewed."),
    serviceItem("public_release_support", "Public release support services", "disabled", "defer_to_future_phase", "Public release support remains manual unless a future phase approves services.")
  ];
}

export function createControlledServiceDecisionPackage(input: {
  items?: TeoyubeControlledServiceDecisionItem[];
} = {}): TeoyubeControlledServiceDecisionPackageModel {
  return {
    id: "phase_8_3_controlled_service_decision_package",
    items: input.items || defaultItems(),
    noServiceConnected: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noUserAccountsAdded: true,
    noLiveAiOrchestrationEnabled: true,
    noEmailNotificationsEnabled: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}

export function getControlledServiceDecisionItems(pkg: TeoyubeControlledServiceDecisionPackageModel): TeoyubeControlledServiceDecisionItem[] {
  return pkg.items;
}

export function getServiceDecisionByKind(pkg: TeoyubeControlledServiceDecisionPackageModel, kind: TeoyubeControlledServiceDecisionKind): TeoyubeControlledServiceDecisionItem | undefined {
  return pkg.items.find((entry) => entry.kind === kind);
}

export function getServicesRemainingDisabled(pkg: TeoyubeControlledServiceDecisionPackageModel): TeoyubeControlledServiceDecisionItem[] {
  return pkg.items.filter((entry) => entry.currentStatus === "disabled" || entry.currentStatus === "plan_only" || entry.decision === "remain_disabled" || entry.decision === "remain_plan_only");
}

export function getServicesEligibleForFutureReview(pkg: TeoyubeControlledServiceDecisionPackageModel): TeoyubeControlledServiceDecisionItem[] {
  return pkg.items.filter((entry) => entry.decision === "eligible_for_future_design_review" || entry.decision === "defer_to_future_phase");
}

export function getBlockedServiceDecisions(pkg: TeoyubeControlledServiceDecisionPackageModel): TeoyubeControlledServiceDecisionItem[] {
  return pkg.items.filter((entry) => entry.decision === "blocked" || !entry.noServiceConnected || !entry.noExternalWrite || !entry.noProductionDataMutation);
}

export function createControlledServiceDecisionPackageDecision(pkg: TeoyubeControlledServiceDecisionPackageModel): TeoyubeControlledServiceDecisionDecision {
  if (getBlockedServiceDecisions(pkg).length) return "blocked";
  return getServicesEligibleForFutureReview(pkg).length ? "eligible_for_future_design_review" : "remain_disabled";
}

export function validateControlledServiceDecisionPackage(pkg: TeoyubeControlledServiceDecisionPackageModel): TeoyubeControlledServiceDecisionReport {
  return createControlledServiceDecisionPackageReport(pkg);
}

export function createControlledServiceDecisionPackageReport(pkg: TeoyubeControlledServiceDecisionPackageModel): TeoyubeControlledServiceDecisionReport {
  const blocked = getBlockedServiceDecisions(pkg);
  const blockers = blocked.map((entry) => ({
    id: `${entry.id}_blocked`,
    kind: entry.kind,
    message: `${entry.label} is blocked or violates service-disabled constraints.`,
    requiredAction: "Restore disabled/plan-only state before release readiness can continue."
  }));
  return {
    valid: blockers.length === 0,
    decision: createControlledServiceDecisionPackageDecision(pkg),
    items: pkg.items,
    blockers,
    warnings: pkg.items.map((entry) => ({
      id: `${entry.id}_future_review`,
      kind: entry.kind,
      message: `${entry.label}: ${entry.reasonForNotEnablingNow}`,
      recommendedAction: "Do not implement until owner, privacy, security, cost, rollback, data-protection, and regression gates are satisfied."
    })),
    servicesRemainingDisabled: getServicesRemainingDisabled(pkg),
    servicesEligibleForFutureReview: getServicesEligibleForFutureReview(pkg),
    noServiceConnected: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noUserAccountsAdded: true,
    noLiveAiOrchestrationEnabled: true,
    noEmailNotificationsEnabled: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
