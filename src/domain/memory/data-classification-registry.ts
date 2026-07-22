import type { DataSensitivity, MemoryLayer, PurposeId } from "./memory-contracts";

export type DataClassId = "class_0" | "class_1" | "class_2" | "class_3" | "class_4";

export type DataClassPolicy = Readonly<{
  id: DataClassId;
  sensitivity: DataSensitivity;
  examples: readonly string[];
  allowedPurposes: readonly string[];
  defaultPersistence: "public_corpus" | "ephemeral" | "explicit_only" | "server_authoritative";
  requiredConsent: PurposeId | "not_required" | "authenticated_session";
  storageLocation: "repository_public" | "server_relational" | "server_session";
  encryption: "standard_at_rest" | "application_aead" | "credential_hash_or_key_reference";
  logPolicy: "identifiers_only" | "aggregate_only" | "never_raw_content";
  retention: string;
  exportPolicy: string;
  deletionPolicy: string;
  sharingPolicy: "none" | "public_reference_only";
  modelUsePolicy: "not_user_data" | "disabled" | "explicit_future_consent_required";
  analyticsPolicy: "aggregate_non_content_only" | "disabled";
}>;

export const DATA_CLASSIFICATION_REGISTRY: Readonly<Record<DataClassId, DataClassPolicy>> = Object.freeze({
  class_0: Object.freeze({
    id: "class_0", sensitivity: "public", examples: Object.freeze(["WEB Scripture corpus and citations", "Promise Clusters", "Teoyube Lexicon", "non-user TIG datasets"]),
    allowedPurposes: Object.freeze(["public_reference"]), defaultPersistence: "public_corpus", requiredConsent: "not_required", storageLocation: "repository_public", encryption: "standard_at_rest", logPolicy: "identifiers_only", retention: "versioned corpus lifecycle", exportPolicy: "references and versions only in user export", deletionPolicy: "not deleted per user", sharingPolicy: "public_reference_only", modelUsePolicy: "not_user_data", analyticsPolicy: "aggregate_non_content_only"
  }),
  class_1: Object.freeze({
    id: "class_1", sensitivity: "low", examples: Object.freeze(["preferred translation", "response length", "accessibility preferences", "reminder preferences"]),
    allowedPurposes: Object.freeze(["preference_continuity"]), defaultPersistence: "explicit_only", requiredConsent: "preference_continuity", storageLocation: "server_relational", encryption: "standard_at_rest", logPolicy: "identifiers_only", retention: "until revoked, deleted, account deletion, or 24 months of inactivity", exportPolicy: "included", deletionPolicy: "delete by record, purpose, or account", sharingPolicy: "none", modelUsePolicy: "disabled", analyticsPolicy: "aggregate_non_content_only"
  }),
  class_2: Object.freeze({
    id: "class_2", sensitivity: "structured_spiritual", examples: Object.freeze(["journey stage status", "WEB citation metadata", "accepted or rejected action", "TIG recommendation ID"]),
    allowedPurposes: Object.freeze(["journey_continuity", "testimony_book_continuity", "external_ai_memory_context"]), defaultPersistence: "explicit_only", requiredConsent: "journey_continuity", storageLocation: "server_relational", encryption: "standard_at_rest", logPolicy: "identifiers_only", retention: "until revoked, deleted, account deletion, or 24 months of inactivity", exportPolicy: "included with provenance", deletionPolicy: "delete active and derived records", sharingPolicy: "none", modelUsePolicy: "explicit_future_consent_required", analyticsPolicy: "aggregate_non_content_only"
  }),
  class_3: Object.freeze({
    id: "class_3", sensitivity: "sensitive_spiritual", examples: Object.freeze(["prayer text", "journal reflection", "testimony draft", "private Teo Guide text"]),
    allowedPurposes: Object.freeze(["sensitive_spiritual_storage", "testimony_book_continuity", "external_ai_sensitive_content", "external_ai_memory_context"]), defaultPersistence: "ephemeral", requiredConsent: "sensitive_spiritual_storage", storageLocation: "server_relational", encryption: "application_aead", logPolicy: "never_raw_content", retention: "user-selected expiry, otherwise at most 12 months until renewed", exportPolicy: "included only to authenticated owner", deletionPolicy: "delete ciphertext and all active derivatives", sharingPolicy: "none", modelUsePolicy: "explicit_future_consent_required", analyticsPolicy: "disabled"
  }),
  class_4: Object.freeze({
    id: "class_4", sensitivity: "security_identity", examples: Object.freeze(["account identifiers", "session hashes", "authorization metadata", "encryption key version"]),
    allowedPurposes: Object.freeze(["security_operations"]), defaultPersistence: "server_authoritative", requiredConsent: "authenticated_session", storageLocation: "server_session", encryption: "credential_hash_or_key_reference", logPolicy: "never_raw_content", retention: "sessions expire; minimal deletion and consent integrity metadata retained", exportPolicy: "safe account metadata only", deletionPolicy: "invalidate sessions and delete user-owned records; minimal content-free audit status may remain", sharingPolicy: "none", modelUsePolicy: "disabled", analyticsPolicy: "disabled"
  })
});

export type MemoryPurposePolicy = Readonly<{
  id: PurposeId;
  allowedLayers: readonly string[];
  allowedSensitivities: readonly string[];
  explicitUserAction: true;
  defaultGranted: false;
  retentionDays: number;
}>;

export const MEMORY_PURPOSE_REGISTRY: Readonly<Record<PurposeId, MemoryPurposePolicy>> = Object.freeze({
  preference_continuity: Object.freeze({ id: "preference_continuity", allowedLayers: Object.freeze(["semantic_preference"]), allowedSensitivities: Object.freeze(["low"]), explicitUserAction: true, defaultGranted: false, retentionDays: 730 }),
  journey_continuity: Object.freeze({ id: "journey_continuity", allowedLayers: Object.freeze(["journey_state", "episodic"]), allowedSensitivities: Object.freeze(["structured_spiritual"]), explicitUserAction: true, defaultGranted: false, retentionDays: 730 }),
  sensitive_spiritual_storage: Object.freeze({ id: "sensitive_spiritual_storage", allowedLayers: Object.freeze(["episodic"]), allowedSensitivities: Object.freeze(["sensitive_spiritual"]), explicitUserAction: true, defaultGranted: false, retentionDays: 365 }),
  testimony_book_continuity: Object.freeze({ id: "testimony_book_continuity", allowedLayers: Object.freeze(["episodic", "journey_state"]), allowedSensitivities: Object.freeze(["structured_spiritual", "sensitive_spiritual"]), explicitUserAction: true, defaultGranted: false, retentionDays: 365 }),
  external_ai_processing: Object.freeze({ id: "external_ai_processing", allowedLayers: Object.freeze([]), allowedSensitivities: Object.freeze([]), explicitUserAction: true, defaultGranted: false, retentionDays: 0 }),
  external_ai_sensitive_content: Object.freeze({ id: "external_ai_sensitive_content", allowedLayers: Object.freeze([]), allowedSensitivities: Object.freeze([]), explicitUserAction: true, defaultGranted: false, retentionDays: 0 }),
  external_ai_memory_context: Object.freeze({ id: "external_ai_memory_context", allowedLayers: Object.freeze([]), allowedSensitivities: Object.freeze([]), explicitUserAction: true, defaultGranted: false, retentionDays: 0 }),
  live_ai_conversation_retention: Object.freeze({ id: "live_ai_conversation_retention", allowedLayers: Object.freeze([]), allowedSensitivities: Object.freeze([]), explicitUserAction: true, defaultGranted: false, retentionDays: 0 })
});

export const CONSENT_SCOPE_REGISTRY: Readonly<Record<PurposeId, readonly string[]>> = Object.freeze({
  preference_continuity: Object.freeze(["memory:read", "memory:write", "memory:export", "memory:delete", "memory:*"]),
  journey_continuity: Object.freeze(["memory:read", "memory:write", "memory:export", "memory:delete", "memory:*"]),
  sensitive_spiritual_storage: Object.freeze(["memory:read", "memory:write", "memory:export", "memory:delete", "memory:*"]),
  testimony_book_continuity: Object.freeze(["memory:read", "memory:write", "memory:export", "memory:delete", "memory:*"]),
  external_ai_processing: Object.freeze(["external_ai:process"]),
  external_ai_sensitive_content: Object.freeze(["external_ai:sensitive_content"]),
  external_ai_memory_context: Object.freeze(["external_ai:memory_context"]),
  live_ai_conversation_retention: Object.freeze(["external_ai:conversation_retention"])
});

export function validateConsentScopes(purposeId: PurposeId, scopes: readonly string[]): boolean {
  const allowed = CONSENT_SCOPE_REGISTRY[purposeId];
  return scopes.length > 0 && scopes.every((scope) => allowed.includes(scope));
}

export function validateMemoryPurpose(layer: Exclude<MemoryLayer, "session">, sensitivity: DataSensitivity, purposeId: PurposeId): boolean {
  const policy = MEMORY_PURPOSE_REGISTRY[purposeId];
  return policy.allowedLayers.includes(layer) && policy.allowedSensitivities.includes(sensitivity);
}
