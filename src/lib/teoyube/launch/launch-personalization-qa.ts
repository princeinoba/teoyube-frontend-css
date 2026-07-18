import {
  createDefaultTeoyubeConsentControlState,
  createSessionOnlyConsentControlState
} from "../../tig";
import type { TeoyubeSafetyQaCheck } from "./launch-qa-contracts";

function check(id: string, title: string, purpose: string): TeoyubeSafetyQaCheck {
  return {
    id,
    surface: "personalization_preview",
    title,
    purpose,
    riskLevel: "high",
    launchCritical: true,
    category: "personalization",
    expectedResult: "Personalization remains consent-aware, reversible, and preview-safe.",
    safetyRequirement: title
  };
}

export function getPersonalizationLaunchQaChecklist(): TeoyubeSafetyQaCheck[] {
  return [
    check("personalization_consent_aware", "Personalization is consent-aware", "Personalization requires explicit visible controls."),
    check("personalization_disabled_blocks_behavior", "Disabled personalization blocks personalization", "Default state does not personalize."),
    check("session_only_labeled", "Session-only personalization labeled", "Session-only state is explicit."),
    check("raw_text_storage_disabled", "Raw text storage disabled", "Raw private text is not stored by default."),
    check("soft_preference_hints", "Preference hints are soft hints", "Hints do not override Scripture anchoring."),
    check("reset_export_delete_available", "Reset/export/delete simulation paths available", "User control paths are represented."),
    check("feedback_user_controllable", "Feedback controls user-controllable", "Feedback can guide or reduce personalization."),
    check("no_hidden_memory", "No hidden long-term memory", "Hidden personalization is not introduced."),
    check("preview_reversible", "Personalized preview reversible", "Baseline response remains available.")
  ];
}

export function validateConsentControlsQa(): boolean {
  const state = createDefaultTeoyubeConsentControlState();
  return !state.personalizationEnabled && !state.rawTextStorageEnabled && state.settings.length > 0;
}

export function validateFeedbackControlsQa(): boolean {
  const state = createDefaultTeoyubeConsentControlState();
  return state.auditTrail.length > 0 && !state.rawTextStorageEnabled;
}

export function validatePersonalizationPreviewQa(): boolean {
  const session = createSessionOnlyConsentControlState();
  return session.sessionOnlyPersonalization && session.personalizationEnabled && !session.rawTextStorageEnabled;
}

export function validateNoHiddenPersonalizationQa(): boolean {
  const state = createDefaultTeoyubeConsentControlState();
  return !state.personalizationEnabled && !state.signalStorageAllowed;
}

export function createPersonalizationQaReport() {
  const checks = [
    validateConsentControlsQa(),
    validateFeedbackControlsQa(),
    validatePersonalizationPreviewQa(),
    validateNoHiddenPersonalizationQa()
  ];
  const valid = checks.every(Boolean);

  return {
    valid,
    status: valid ? "pass" : "blocked",
    checkCount: getPersonalizationLaunchQaChecklist().length,
    passedCount: checks.filter(Boolean).length,
    warningCount: 0,
    blockerCount: valid ? 0 : 1,
    blockers: valid ? [] : [{ id: "personalization_qa", surface: "personalization_preview", title: "Personalization QA blocker", riskLevel: "critical", reason: "Personalization QA failed.", requiredAction: "Resolve consent and personalization QA before launch." }],
    warnings: [],
    generatedAt: new Date().toISOString()
  };
}

