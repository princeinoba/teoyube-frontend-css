import type { TeoyubeLaunchQualityGate } from "./production-launch-contracts";
import { createAccessibilityAuditReport } from "./launch-accessibility-audit";
import { createMobileQaReport } from "./launch-mobile-qa";
import { getProductionCandidateFeatureFlags } from "./launch-feature-flags";

function gate(id: string, label: string, passed: boolean, details: string): TeoyubeLaunchQualityGate {
  return {
    id,
    label,
    status: passed ? "ready" : "blocked",
    required: true,
    passed,
    riskLevel: passed ? "low" : "critical",
    details
  };
}

export function getPredeploymentSafetyGates(): TeoyubeLaunchQualityGate[] {
  const flags = getProductionCandidateFeatureFlags();
  const accessibility = createAccessibilityAuditReport();
  const mobile = createMobileQaReport();

  return [
    gate("predeploy_scripture_required", "Scripture anchoring required", flags.scriptureAnchoringRequired, "Every usable response must remain Scripture anchored."),
    gate("predeploy_explanation_required", "Explanation paths required", flags.explanationPathRequired, "Every production recommendation remains explainable."),
    gate("predeploy_fallback_enabled", "Fallback path enabled", flags.fallbackPathEnabled, "Safe fallback remains enabled."),
    gate("predeploy_guardrails_enabled", "Safety guardrails enabled", flags.safetyGuardrailsEnabled, "Safety guardrails remain enabled."),
    gate("predeploy_consent_enabled", "Consent controls enabled", flags.consentControlsEnabled, "Consent controls remain enabled."),
    gate("predeploy_debug_disabled", "Debug UI disabled", !flags.debugOutputVisibleToUsers, "Debug UI remains hidden for normal users."),
    gate("predeploy_analytics_disabled", "Analytics sending disabled", !flags.externalAnalyticsSendingEnabled, "External analytics sending remains disabled."),
    gate("predeploy_persistence_disabled", "Production persistence disabled", !flags.productionDatabasePersistenceEnabled, "Production database writes remain disabled."),
    gate("predeploy_live_ai_disabled", "Live AI disabled", !flags.liveAiOrchestrationEnabled, "Live AI orchestration remains disabled."),
    gate("predeploy_raw_text_disabled", "Raw text storage disabled", !flags.rawTextStorageEnabled, "Raw sensitive text storage remains disabled."),
    gate("predeploy_hidden_personalization_disabled", "Hidden personalization disabled", !flags.hiddenPersonalizationEnabled, "Hidden personalization remains disabled."),
    gate("predeploy_accessibility_clear", "No known launch-critical accessibility blockers", accessibility.blockerCount === 0, "Accessibility QA has no default blockers."),
    gate("predeploy_mobile_clear", "No known launch-critical mobile blockers", mobile.blockerCount === 0, "Mobile QA has no default blockers.")
  ];
}

export function validatePredeploymentSafetyGate(gateToValidate: TeoyubeLaunchQualityGate): TeoyubeLaunchQualityGate {
  return gateToValidate;
}

export function validateAllPredeploymentSafetyGates(): TeoyubeLaunchQualityGate[] {
  return getPredeploymentSafetyGates().map(validatePredeploymentSafetyGate);
}

export function createPredeploymentSafetyGateReport() {
  const gates = validateAllPredeploymentSafetyGates();
  const blockers = gates.filter((entry) => entry.required && !entry.passed);

  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : "pass",
    gateCount: gates.length,
    passedGateCount: gates.filter((entry) => entry.passed).length,
    blockers,
    gates,
    generatedAt: new Date().toISOString()
  };
}

