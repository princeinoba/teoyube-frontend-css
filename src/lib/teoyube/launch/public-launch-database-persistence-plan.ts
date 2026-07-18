export type TeoyubePublicLaunchDatabasePersistencePlan = {
  id: string;
  label: string;
  entityCandidates: string[];
  privacyRequirements: string[];
  consentRequirements: string[];
  providerOptions: string[];
  databaseConnected: false;
  migrationsCreated: false;
  providerInstalled: false;
  rawSensitiveTextStorageAllowed: false;
  hiddenPersonalizationAllowed: false;
};

export function getDatabasePersistenceEntityCandidates(): string[] {
  return ["saved Scripture", "saved prayer", "completed action step", "consent state", "sanitized personalization signal", "preference profile", "feedback summary", "production event summary"];
}

export function getDatabasePersistencePrivacyRequirements(): string[] {
  return ["Public privacy notice finalized", "Data minimization documented", "Raw sensitive text disabled by default", "Deletion/export path planned", "No hidden personalization"];
}

export function getDatabasePersistenceConsentRequirements(): string[] {
  return ["Consent controls visible", "Consent state auditable", "Persistence opt-in reviewed", "Personalization remains reversible", "Sensitive feedback guidance documented"];
}

export function getDatabasePersistenceProviderOptions(): string[] {
  return ["supabase", "firebase", "postgres", "mongodb", "prisma", "none", "undecided"];
}

export function createPublicLaunchDatabasePersistencePlan(): TeoyubePublicLaunchDatabasePersistencePlan {
  return {
    id: "public_launch_database_persistence_plan_5_1",
    label: "Public Launch Database Persistence Decision Plan",
    entityCandidates: getDatabasePersistenceEntityCandidates(),
    privacyRequirements: getDatabasePersistencePrivacyRequirements(),
    consentRequirements: getDatabasePersistenceConsentRequirements(),
    providerOptions: getDatabasePersistenceProviderOptions(),
    databaseConnected: false,
    migrationsCreated: false,
    providerInstalled: false,
    rawSensitiveTextStorageAllowed: false,
    hiddenPersonalizationAllowed: false
  };
}

export function validateDatabasePersistenceReadiness(plan: TeoyubePublicLaunchDatabasePersistencePlan = createPublicLaunchDatabasePersistencePlan()) {
  const blockers = [
    plan.databaseConnected ? { id: "database_plan_connected", label: plan.label, reason: "5.1 must not connect a database.", requiredAction: "Remove the database connection.", riskLevel: "critical" as const } : undefined,
    plan.migrationsCreated ? { id: "database_plan_migrations", label: plan.label, reason: "5.1 must not create migrations.", requiredAction: "Move migrations to a later explicit step.", riskLevel: "critical" as const } : undefined,
    plan.providerInstalled ? { id: "database_plan_provider_installed", label: plan.label, reason: "5.1 must not install database providers.", requiredAction: "Keep provider options as documentation only.", riskLevel: "high" as const } : undefined,
    plan.rawSensitiveTextStorageAllowed ? { id: "database_plan_raw_sensitive_text", label: plan.label, reason: "Raw sensitive text storage must remain disabled.", requiredAction: "Disable raw sensitive text storage.", riskLevel: "critical" as const } : undefined,
    plan.hiddenPersonalizationAllowed ? { id: "database_plan_hidden_personalization", label: plan.label, reason: "Hidden personalization must not be allowed.", requiredAction: "Keep personalization visible and consent-aware.", riskLevel: "critical" as const } : undefined
  ].filter(Boolean) as Array<{ id: string; label: string; reason: string; requiredAction: string; riskLevel: "high" | "critical" }>;
  return { valid: blockers.length === 0, ready: blockers.length === 0, blockers };
}

export function createDatabasePersistenceDecisionReport(plan: TeoyubePublicLaunchDatabasePersistencePlan = createPublicLaunchDatabasePersistencePlan()) {
  const validation = validateDatabasePersistenceReadiness(plan);
  return {
    valid: validation.valid,
    ready: validation.ready,
    decision: validation.valid ? "defer_until_privacy_consent_review" as const : "blocked" as const,
    plan,
    blockers: validation.blockers,
    warnings: [{ id: "database_plan_deferred", label: plan.label, message: "Database persistence remains optional/deferred until public privacy and consent review.", recommendedAction: "Review during a later explicit service connection step.", riskLevel: "medium" as const }],
    noDatabaseConnected: true,
    noMigrationsCreated: true,
    noProviderInstalled: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
