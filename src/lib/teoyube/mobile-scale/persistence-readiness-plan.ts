import type {
  TeoyubePersistenceReadinessPlan,
  TeoyubeScaleReadinessStatus
} from "./mobile-scale-contracts";

export function getFutureDatabaseEntityMap(): Record<string, string> {
  return {
    user_profile: "Optional profile settings and account-level consent, only with user consent.",
    personalization_signals: "Sanitized structured signals only; no raw sensitive text.",
    preference_profile: "Consent-aware soft preference hints and reset/delete metadata.",
    saved_scripture: "Saved Scripture references and user-facing labels.",
    saved_prayer: "User-saved prayers with Scripture references.",
    completed_action_step: "Action completion markers tied to journeys and milestones.",
    feedback_event: "Explicit user feedback and control actions.",
    production_event: "Structured production intelligence events without raw text.",
    surface_preference: "Surface-level display preferences with consent.",
    device_session_metadata: "Minimal device/session metadata for safety and performance only."
  };
}

export function getPersistenceSafetyRequirements(): string[] {
  return [
    "Production persistence must be added through an adapter, not inside TIG core logic.",
    "Raw sensitive text must not be stored by default.",
    "Personalization persistence requires explicit consent.",
    "Export, delete, reset, and consent downgrade flows must be preserved.",
    "Saved Scripture and prayer data must stay Scripture-referenced.",
    "No database provider is connected in Phase 7.4."
  ];
}

export function getPersonalizationPersistenceBoundaries(): string[] {
  return [
    "Session-only personalization must not become persistent.",
    "Profile-preview personalization can become durable only after explicit consent and future adapter work.",
    "Feedback can reduce or disable hints and must be reversible.",
    "Preference profiles must not claim certainty about identity, calling, or emotion.",
    "Persistence must never replace baseline production response availability."
  ];
}

export function getTeoyubePersistenceReadinessPlan(): TeoyubePersistenceReadinessPlan {
  return {
    id: "phase_7_persistence_readiness",
    label: "Phase 7 Persistence Readiness Plan",
    status: "planned",
    futureEntities: Object.keys(getFutureDatabaseEntityMap()),
    consentRequiredEntities: [
      "user_profile",
      "personalization_signals",
      "preference_profile",
      "surface_preference",
      "device_session_metadata"
    ],
    forbiddenInPhase71: [
      "Firestore connection",
      "Supabase connection",
      "Firebase connection",
      "Prisma migrations",
      "MongoDB connection",
      "Postgres connection",
      "production database writes",
      "localStorage persistence added by this module",
      "cookies",
      "IndexedDB",
      "file writes"
    ],
    safetyRules: [
      ...getPersistenceSafetyRequirements(),
      ...getPersonalizationPersistenceBoundaries()
    ],
    implementationNote:
      "This is a readiness map only. Phase 7.4 does not add a database, ORM, migrations, or storage side effects."
  };
}

export function validatePersistenceReadinessPlan(): {
  valid: boolean;
  status: TeoyubeScaleReadinessStatus;
  errors: string[];
  warnings: string[];
} {
  const plan = getTeoyubePersistenceReadinessPlan();
  const entityMap = getFutureDatabaseEntityMap();
  const errors = [
    Object.keys(entityMap).length ? "" : "Future database entity map is empty.",
    plan.forbiddenInPhase71.includes("production database writes")
      ? ""
      : "Phase 7.4 should explicitly forbid production database writes.",
    plan.safetyRules.some((rule) => rule.toLowerCase().includes("raw sensitive text"))
      ? ""
      : "Persistence safety rules should mention raw sensitive text."
  ].filter(Boolean);

  return {
    valid: errors.length === 0,
    status: errors.length === 0 ? "planned" : "blocked",
    errors,
    warnings: [
      "Database persistence remains future work.",
      "Provider choice should happen only after consent, export, delete, and reset flows are preserved."
    ]
  };
}
