import {
  getSafeDefaultRuntimeConfig,
  type TeoyubeRuntimeConfig
} from "./runtime-config-readiness";
import type { TeoyubeExternalServiceReadinessPlan } from "./scale-readiness-contracts";

export type TeoyubePersistenceProvider =
  | "supabase"
  | "firebase"
  | "postgres"
  | "mongodb"
  | "custom"
  | "none";

export type TeoyubePersistenceEntity =
  | "saved_scripture"
  | "saved_prayer"
  | "completed_action_step"
  | "sanitized_personalization_signal"
  | "consent_state"
  | "preference_profile"
  | "production_event_summary"
  | "feedback_event_summary";

export type TeoyubePersistenceAdapterPlan =
  TeoyubeExternalServiceReadinessPlan & {
    provider: TeoyubePersistenceProvider;
    supportedEntities: TeoyubePersistenceEntity[];
    writesToDatabase: false;
    migrationsRequired: false;
    adapterOnly: true;
  };

const SUPPORTED_ENTITIES: TeoyubePersistenceEntity[] = [
  "saved_scripture",
  "saved_prayer",
  "completed_action_step",
  "sanitized_personalization_signal",
  "consent_state",
  "preference_profile",
  "production_event_summary",
  "feedback_event_summary"
];

export function getPersistenceAdapterReadinessContracts(): TeoyubePersistenceAdapterPlan[] {
  return ([
    "supabase",
    "firebase",
    "postgres",
    "mongodb",
    "custom",
    "none"
  ] as TeoyubePersistenceProvider[]).map(createPersistenceAdapterPlan);
}

export function createPersistenceAdapterPlan(
  provider: TeoyubePersistenceProvider
): TeoyubePersistenceAdapterPlan {
  return {
    id: `persistence_provider_${provider}`,
    provider,
    category: "persistence",
    status: provider === "none" ? "ready" : "planned",
    connected: false,
    sendsExternally: false,
    writesExternally: false,
    writesToDatabase: false,
    migrationsRequired: false,
    adapterOnly: true,
    supportedEntities: SUPPORTED_ENTITIES,
    requiredBeforeConnection: [
      "Consent model confirmed",
      "Export and delete flows preserved",
      "Raw text storage policy reviewed",
      "Schema migration plan written",
      "Provider security rules reviewed"
    ],
    privacyRules: getPersistenceEntitySafetyRequirements()
  };
}

export function getPersistenceEntitySafetyRequirements(): string[] {
  return [
    "Saved Scripture can store references and public node ids.",
    "Saved prayer must stay user-controlled and exportable.",
    "Completed action steps should store completion metadata, not hidden profiling.",
    "Personalization signals must be sanitized structured signals only.",
    "Consent state changes must be reversible and auditable.",
    "Preference profiles must not claim certainty about identity, calling, or emotion.",
    "Production and feedback events must remain summaries without raw private text."
  ];
}

export function validatePersistenceAdapterPlan(plan: TeoyubePersistenceAdapterPlan) {
  const errors = [
    plan.connected ? "Persistence provider must not be connected in Phase 7.4." : "",
    plan.writesExternally ? "Persistence provider must not write externally in Phase 7.4." : "",
    plan.writesToDatabase ? "Persistence provider must not write to a database in Phase 7.4." : "",
    plan.migrationsRequired ? "Phase 7.4 should not create database migrations." : "",
    plan.adapterOnly ? "" : "Persistence provider plan should remain adapter-only."
  ].filter(Boolean);

  return {
    valid: errors.length === 0,
    status: errors.length ? "blocked" : plan.status,
    errors,
    warnings: [
      "Persistence readiness is contract-only. No database provider, ORM, migration, or write path is connected."
    ]
  };
}

export function sanitizePersistenceRecordPreview(
  record: Record<string, unknown>,
  config: Partial<TeoyubeRuntimeConfig> = getSafeDefaultRuntimeConfig()
): Record<string, unknown> {
  const defaults = getSafeDefaultRuntimeConfig();
  const merged = {
    ...defaults,
    ...config,
    featureFlags: {
      ...defaults.featureFlags,
      ...(config.featureFlags || {})
    }
  };
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(record)) {
    const normalized = key.toLowerCase();
    if (
      normalized.includes("raw") ||
      normalized.includes("input") ||
      normalized.includes("journal") ||
      normalized.includes("private") ||
      normalized.includes("secret")
    ) {
      sanitized[key] = "[redacted]";
    } else {
      sanitized[key] = value;
    }
  }

  return {
    ...sanitized,
    writesToDatabase: false,
    productionPersistenceEnabled: merged.featureFlags.productionPersistenceEnabled
  };
}

export function createPersistenceAdapterReadinessReport() {
  const plans = getPersistenceAdapterReadinessContracts();
  const validations = plans.map(validatePersistenceAdapterPlan);
  const errors = validations.flatMap((item) => item.errors);

  return {
    id: "phase_7_4_persistence_adapter_readiness",
    complete: errors.length === 0,
    completionPercentage: errors.length === 0 ? 100 : 0,
    providerCount: plans.length,
    entities: SUPPORTED_ENTITIES,
    plans,
    errors,
    warnings: [
      "Phase 7.4 does not install, connect, migrate, or write to persistence providers."
    ],
    generatedAt: new Date().toISOString()
  };
}

