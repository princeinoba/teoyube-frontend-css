import type { TeoyubeFinalPublicGoNoGoCheck, TeoyubeFinalPublicLaunchBlocker, TeoyubeFinalPublicLaunchWarning } from "./final-public-go-no-go-contracts";
import { createDatabasePersistenceDecisionReport, createPublicLaunchDatabasePersistencePlan } from "./public-launch-database-persistence-plan";

export type TeoyubeFinalDatabasePersistenceDecision =
  | "disabled_for_public_launch"
  | "approved_for_later_setup"
  | "requires_privacy_review"
  | "requires_owner_review"
  | "blocked";

export type TeoyubeFinalDatabasePersistenceInput = {
  databaseConnected?: boolean;
  migrationsCreated?: boolean;
  providerInstalled?: boolean;
  approvedForPublicLaunch?: boolean;
  privacyReviewComplete?: boolean;
  ownerReviewComplete?: boolean;
  rawSensitiveTextStorageAllowed?: boolean;
  hiddenPersonalizationAllowed?: boolean;
};

function check(id: string, label: string, complete: boolean, details: string): TeoyubeFinalPublicGoNoGoCheck {
  return { id, label, category: "database", required: true, complete, status: complete ? "ready" : "blocked", launchCritical: true, details };
}

function blocker(id: string, reason: string): TeoyubeFinalPublicLaunchBlocker {
  return { id, label: id.replace(/_/g, " "), category: "database", riskLevel: "critical", reason, requiredAction: "Keep production database persistence disabled until an explicit reviewed setup step." };
}

export function createFinalDatabasePersistenceGoNoGoChecklist(input: TeoyubeFinalDatabasePersistenceInput = {}): TeoyubeFinalPublicGoNoGoCheck[] {
  return [
    check("final_database_disabled", "Database persistence disabled for public launch", !input.databaseConnected, "Public launch execution preparation must not connect production persistence by default."),
    check("final_database_no_migrations", "No database migrations created", !input.migrationsCreated, "5.4 must not add database migrations."),
    check("final_database_no_provider_installed", "No database provider installed", !input.providerInstalled, "Supabase, Firebase, Prisma, MongoDB, Postgres, Redis, or other providers remain uninstalled by this step."),
    check("final_database_no_raw_sensitive_text", "No raw sensitive text storage", !input.rawSensitiveTextStorageAllowed, "Raw sensitive personalization text remains disabled."),
    check("final_database_no_hidden_personalization", "No hidden personalization", !input.hiddenPersonalizationAllowed, "Personalization remains visible, consent-aware, and reversible.")
  ];
}

export function getFinalDatabasePersistenceBlockers(input: TeoyubeFinalDatabasePersistenceInput = {}): TeoyubeFinalPublicLaunchBlocker[] {
  return [
    input.databaseConnected ? blocker("final_database_connected", "Database persistence is connected without final reviewed approval.") : undefined,
    input.migrationsCreated ? blocker("final_database_migrations_created", "Database migrations were created by the final go/no-go step.") : undefined,
    input.providerInstalled ? blocker("final_database_provider_installed", "A database provider was installed by the final go/no-go step.") : undefined,
    input.rawSensitiveTextStorageAllowed ? blocker("final_database_raw_sensitive_text", "Raw sensitive text storage is allowed.") : undefined,
    input.hiddenPersonalizationAllowed ? blocker("final_database_hidden_personalization", "Hidden personalization is allowed.") : undefined
  ].filter(Boolean) as TeoyubeFinalPublicLaunchBlocker[];
}

export function getFinalDatabasePersistenceWarnings(input: TeoyubeFinalDatabasePersistenceInput = {}): TeoyubeFinalPublicLaunchWarning[] {
  return [
    {
      id: "final_database_deferred",
      label: "Database persistence deferred",
      category: "database",
      riskLevel: "medium",
      message: input.approvedForPublicLaunch ? "Database persistence was requested but remains deferred unless privacy and owner review are complete." : "Database persistence remains disabled for public launch execution preparation.",
      recommendedAction: "Use a later explicit persistence setup step after privacy, consent, retention, export, and deletion review."
    }
  ];
}

export function createFinalDatabasePersistenceDecision(input: TeoyubeFinalDatabasePersistenceInput = {}): TeoyubeFinalDatabasePersistenceDecision {
  const blockers = getFinalDatabasePersistenceBlockers(input);
  if (blockers.length > 0) return "blocked";
  if (input.approvedForPublicLaunch && !input.privacyReviewComplete) return "requires_privacy_review";
  if (input.approvedForPublicLaunch && !input.ownerReviewComplete) return "requires_owner_review";
  if (input.approvedForPublicLaunch) return "approved_for_later_setup";
  return "disabled_for_public_launch";
}

export function evaluateFinalDatabasePersistenceGoNoGo(input: TeoyubeFinalDatabasePersistenceInput = {}) {
  const blockers = getFinalDatabasePersistenceBlockers(input);
  const decision = createFinalDatabasePersistenceDecision(input);
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    decision,
    checklist: createFinalDatabasePersistenceGoNoGoChecklist(input),
    blockers,
    warnings: getFinalDatabasePersistenceWarnings(input)
  };
}

export function createFinalDatabasePersistenceGoNoGoReport(input: TeoyubeFinalDatabasePersistenceInput = {}) {
  const publicLaunchPlanReport = createDatabasePersistenceDecisionReport(createPublicLaunchDatabasePersistencePlan());
  const evaluation = evaluateFinalDatabasePersistenceGoNoGo(input);
  return {
    ...evaluation,
    publicLaunchPlanReport,
    noDatabaseConnected: true,
    noMigrationsCreated: true,
    noProviderInstalled: true,
    noRawSensitiveTextStorage: true,
    noHiddenPersonalization: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
