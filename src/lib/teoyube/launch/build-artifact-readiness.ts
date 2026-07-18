import type {
  TeoyubeBuildArtifactCheck,
  TeoyubeBuildVerificationStatus
} from "./build-verification-contracts";
import { createLaunchEnvironmentValidationReport } from "./launch-environment-validator";

export type TeoyubeBuildArtifactReadinessState = {
  productionBuildGenerated?: boolean;
  staticAssetsReferencedSafely?: boolean;
  noKnownBrokenImports?: boolean;
  noRequiredMissingEnvironmentVariables?: boolean;
  noExposedSecretLikePublicVariables?: boolean;
  noDebugPayloadsVisible?: boolean;
  fallbackContentAvailable?: boolean;
  mobileUiProviderIndependent?: boolean;
  personalizationPreviewDatabaseFree?: boolean;
  analyticsLocalOnly?: boolean;
};

function check(id: string, label: string, passed: boolean, details: string): TeoyubeBuildArtifactCheck {
  return {
    id,
    label,
    status: passed ? "pass" : "warning",
    riskLevel: passed ? "low" : "medium",
    details
  };
}

export function getBuildArtifactReadinessChecklist(state: TeoyubeBuildArtifactReadinessState = {}): TeoyubeBuildArtifactCheck[] {
  const env = createLaunchEnvironmentValidationReport();

  return [
    check("production_build_generated", "Production build can be generated", state.productionBuildGenerated === true, "Record the actual build result during verification."),
    check("static_assets_safe", "Static assets referenced safely", state.staticAssetsReferencedSafely !== false, "Static/public assets should not require external providers."),
    check("no_broken_imports", "No known broken imports", state.noKnownBrokenImports !== false, "TypeScript/build verification should catch broken imports."),
    check("env_not_missing", "No required missing environment variables", env.valid && state.noRequiredMissingEnvironmentVariables !== false, "Safe defaults require no provider secrets."),
    check("no_public_secrets", "No exposed secret-like public variables", state.noExposedSecretLikePublicVariables !== false, "Public env values must not look secret-like."),
    check("debug_hidden", "No debug payloads visible", state.noDebugPayloadsVisible !== false, "Normal UI must not expose raw debug payloads."),
    check("fallback_available", "Fallback content available", state.fallbackContentAvailable !== false, "Runtime data failures must have safe fallback content."),
    check("mobile_provider_independent", "Mobile UI provider-independent", state.mobileUiProviderIndependent !== false, "Mobile UI should not depend on unavailable providers."),
    check("personalization_db_free", "Personalization preview database-free", state.personalizationPreviewDatabaseFree !== false, "Personalization preview must not require production persistence."),
    check("analytics_local_only", "Analytics local payloads only", state.analyticsLocalOnly !== false, "Analytics events remain local payloads only.")
  ];
}

export function getBuildArtifactBlockers(state: TeoyubeBuildArtifactReadinessState = {}): string[] {
  return getBuildArtifactReadinessChecklist(state)
    .filter((entry) => entry.status === "fail" || entry.riskLevel === "critical")
    .map((entry) => entry.details);
}

export function getBuildArtifactWarnings(state: TeoyubeBuildArtifactReadinessState = {}): string[] {
  return getBuildArtifactReadinessChecklist(state)
    .filter((entry) => entry.status === "warning")
    .map((entry) => `${entry.label}: ${entry.details}`);
}

export function validateBuildArtifactReadiness(state: TeoyubeBuildArtifactReadinessState = {}) {
  const blockers = getBuildArtifactBlockers(state);
  const warnings = getBuildArtifactWarnings(state);
  const status: TeoyubeBuildVerificationStatus = blockers.length ? "blocked" : warnings.length ? "warning" : "pass";

  return {
    valid: blockers.length === 0,
    status,
    blockers,
    warnings
  };
}

export function createBuildArtifactReadinessReport(state: TeoyubeBuildArtifactReadinessState = {}) {
  const checklist = getBuildArtifactReadinessChecklist(state);
  const validation = validateBuildArtifactReadiness(state);

  return {
    ...validation,
    checkCount: checklist.length,
    checklist,
    generatedAt: new Date().toISOString()
  };
}

