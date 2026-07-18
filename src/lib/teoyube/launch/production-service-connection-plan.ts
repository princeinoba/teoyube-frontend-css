import type {
  TeoyubeProductionServiceConnectionDecision,
  TeoyubeProductionServiceConnectionPlan,
  TeoyubeProductionServiceConnectionReadinessReport,
  TeoyubeProductionServiceKind,
  TeoyubeProductionServiceProvider
} from "./production-service-connection-contracts";

function requirement(id: string, label: string, serviceKind: TeoyubeProductionServiceKind, requiredBeforePublicLaunch: boolean): TeoyubeProductionServiceConnectionPlan["requirements"][number] {
  return { id, label, serviceKind, requiredBeforePublicLaunch, satisfied: true };
}

function boundary(id: string, serviceKind: TeoyubeProductionServiceKind, label: string, details: string): TeoyubeProductionServiceConnectionPlan["boundaries"][number] {
  return { id, serviceKind, label, details, enforced: true };
}

function risk(id: string, serviceKind: TeoyubeProductionServiceKind, label: string, riskLevel: "low" | "medium" | "high" | "critical", mitigation: string): TeoyubeProductionServiceConnectionPlan["risks"][number] {
  return { id, serviceKind, label, riskLevel, mitigation, ownerReviewRequired: riskLevel !== "low" };
}

function plan(
  serviceKind: TeoyubeProductionServiceKind,
  provider: TeoyubeProductionServiceProvider,
  requiredBeforePublicLaunch: boolean,
  label: string,
  idSuffix: string = serviceKind
): TeoyubeProductionServiceConnectionPlan {
  const optionalOrDeferred = !requiredBeforePublicLaunch;
  return {
    id: `production_service_${idSuffix}`,
    label,
    serviceKind,
    provider,
    requiredBeforePublicLaunch,
    optionalOrDeferred,
    requirements: [
      requirement(`${idSuffix}_owner_review`, "Owner review is required before connection.", serviceKind, requiredBeforePublicLaunch),
      requirement(`${idSuffix}_privacy_review`, "Privacy and consent review is required before connection.", serviceKind, requiredBeforePublicLaunch),
      requirement(`${idSuffix}_safe_env_config`, "Safe environment configuration must keep secrets out of source.", serviceKind, requiredBeforePublicLaunch)
    ],
    risks: [
      risk(`${idSuffix}_provider_risk`, serviceKind, "Provider connection can introduce privacy, cost, or reliability risk.", requiredBeforePublicLaunch ? "high" : "medium", "Keep this planning-only until the future explicit service connection step.")
    ],
    boundaries: [
      boundary(`${idSuffix}_no_connection_now`, serviceKind, "No provider is connected in 5.1.", "This step prepares a provider-neutral decision path only."),
      boundary(`${idSuffix}_no_secrets`, serviceKind, "No secrets are written.", "Real secret values must not be written to files."),
      boundary(`${idSuffix}_no_external_calls`, serviceKind, "No external calls are enabled.", "External calls remain disabled until a later guarded step.")
    ],
    decision: requiredBeforePublicLaunch ? "ready_for_planning" : "defer",
    connected: false,
    secretsWritten: false,
    sdkInstalled: false,
    externalCallsEnabled: false,
    databasePersistenceEnabled: false,
    analyticsSendingEnabled: false,
    liveAiOrchestrationEnabled: false
  };
}

export function getProductionServiceConnectionOptions(): TeoyubeProductionServiceConnectionPlan[] {
  return [
    plan("database_persistence", "undecided", false, "Database persistence decision path"),
    plan("analytics", "undecided", false, "External analytics decision path"),
    plan("live_ai_orchestration", "openai", false, "Live AI orchestration decision path"),
    plan("monitoring", "undecided", false, "Production monitoring decision path"),
    plan("email_or_notifications", "undecided", false, "Email or notification decision path"),
    plan("storage", "undecided", false, "Storage decision path"),
    plan("authentication", "undecided", false, "Authentication decision path"),
    plan("search", "undecided", false, "Search decision path")
  ];
}

export function getRequiredPublicLaunchServices(): TeoyubeProductionServiceConnectionPlan[] {
  return [
    plan("unknown", "none", true, "Scripture anchoring enforcement", "scripture_anchoring"),
    plan("unknown", "none", true, "Explanation path enforcement", "explanation_paths"),
    plan("unknown", "none", true, "Fallback safety", "fallback_safety"),
    plan("unknown", "none", true, "Consent controls", "consent_controls"),
    plan("unknown", "none", true, "Privacy notices", "privacy_notices"),
    plan("unknown", "none", true, "Public QA", "public_qa"),
    plan("unknown", "none", true, "Safe environment configuration", "safe_environment_configuration")
  ];
}

export function getOptionalPublicLaunchServices(): TeoyubeProductionServiceConnectionPlan[] {
  return getProductionServiceConnectionOptions().filter((entry) => ["database_persistence", "analytics", "live_ai_orchestration", "monitoring", "email_or_notifications"].includes(entry.serviceKind));
}

export function getDeferredProductionServices(): TeoyubeProductionServiceConnectionPlan[] {
  return getProductionServiceConnectionOptions().filter((entry) => ["storage", "authentication", "search"].includes(entry.serviceKind));
}

export function createProductionServiceConnectionPlan(): TeoyubeProductionServiceConnectionPlan[] {
  return [
    ...getRequiredPublicLaunchServices(),
    ...getOptionalPublicLaunchServices(),
    ...getDeferredProductionServices()
  ];
}

export function getProductionServiceConnectionPlanBlockers(planToValidate: TeoyubeProductionServiceConnectionPlan[] = createProductionServiceConnectionPlan()) {
  return planToValidate.flatMap((entry) => [
    entry.connected ? { id: `${entry.id}_connected`, label: entry.label, reason: "5.1 must not connect production services.", requiredAction: "Remove provider connection from this planning layer.", riskLevel: "critical" as const } : undefined,
    entry.secretsWritten ? { id: `${entry.id}_secrets_written`, label: entry.label, reason: "Real secrets must not be written to files.", requiredAction: "Remove secret values and use placeholders only.", riskLevel: "critical" as const } : undefined,
    entry.sdkInstalled ? { id: `${entry.id}_sdk_installed`, label: entry.label, reason: "5.1 must not install production provider SDKs.", requiredAction: "Keep this provider-neutral.", riskLevel: "high" as const } : undefined,
    entry.externalCallsEnabled ? { id: `${entry.id}_external_calls`, label: entry.label, reason: "5.1 must not enable external calls.", requiredAction: "Disable external calls.", riskLevel: "critical" as const } : undefined,
    entry.databasePersistenceEnabled ? { id: `${entry.id}_persistence_enabled`, label: entry.label, reason: "Production persistence must not be enabled yet.", requiredAction: "Keep persistence disabled.", riskLevel: "critical" as const } : undefined,
    entry.analyticsSendingEnabled ? { id: `${entry.id}_analytics_enabled`, label: entry.label, reason: "External analytics must not be enabled yet.", requiredAction: "Keep analytics disabled.", riskLevel: "critical" as const } : undefined,
    entry.liveAiOrchestrationEnabled ? { id: `${entry.id}_live_ai_enabled`, label: entry.label, reason: "Live AI orchestration must not be enabled yet.", requiredAction: "Keep live AI disabled.", riskLevel: "critical" as const } : undefined
  ]).filter(Boolean) as Array<{ id: string; label: string; reason: string; requiredAction: string; riskLevel: "high" | "critical" }>;
}

export function validateProductionServiceConnectionPlan(planToValidate: TeoyubeProductionServiceConnectionPlan[] = createProductionServiceConnectionPlan()) {
  const blockers = getProductionServiceConnectionPlanBlockers(planToValidate);
  const warnings = planToValidate
    .filter((entry) => entry.optionalOrDeferred)
    .map((entry) => ({ id: `${entry.id}_deferred`, label: entry.label, message: "This service is optional or deferred for a later explicit connection step.", recommendedAction: "Review during future public launch preparation.", riskLevel: "medium" as const }));
  return { valid: blockers.length === 0, ready: blockers.length === 0, blockers, warnings };
}

export function createProductionServiceConnectionDecision(planToValidate: TeoyubeProductionServiceConnectionPlan[] = createProductionServiceConnectionPlan()): TeoyubeProductionServiceConnectionDecision {
  const validation = validateProductionServiceConnectionPlan(planToValidate);
  if (!validation.valid) return "blocked";
  if (validation.warnings.length > 0) return "ready_after_owner_review";
  return "ready_for_planning";
}

export function createProductionServiceConnectionPlanReport(
  planToReport: TeoyubeProductionServiceConnectionPlan[] = createProductionServiceConnectionPlan()
): TeoyubeProductionServiceConnectionReadinessReport {
  const validation = validateProductionServiceConnectionPlan(planToReport);
  return {
    valid: validation.valid,
    ready: validation.ready,
    decision: createProductionServiceConnectionDecision(planToReport),
    plans: planToReport,
    requiredPlanCount: planToReport.filter((entry) => entry.requiredBeforePublicLaunch).length,
    optionalPlanCount: planToReport.filter((entry) => entry.optionalOrDeferred && !["storage", "authentication", "search"].includes(entry.serviceKind)).length,
    deferredPlanCount: planToReport.filter((entry) => ["storage", "authentication", "search"].includes(entry.serviceKind)).length,
    blockers: validation.blockers,
    warnings: validation.warnings,
    noProvidersConnected: true,
    noSecretsWritten: true,
    noExternalCallsEnabled: true,
    generatedAt: new Date().toISOString()
  };
}
