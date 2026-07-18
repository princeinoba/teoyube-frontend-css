import type { TeoyubeFinalPublicGoNoGoDecision, TeoyubeFinalPublicLaunchBlocker, TeoyubeFinalPublicLaunchWarning } from "./final-public-go-no-go-contracts";

export type TeoyubeFinalPublicSafetyInput = {
  scriptureAnchoringRequired?: boolean;
  explanationPathsRequired?: boolean;
  fallbackEnabled?: boolean;
  fallbackNonEmpty?: boolean;
  confidenceOverstated?: boolean;
  divineCertaintyClaimed?: boolean;
  consentControlsAvailable?: boolean;
  privacyBoundariesVisible?: boolean;
  externalAnalyticsApproved?: boolean;
  externalAnalyticsEnabled?: boolean;
  databasePersistenceApproved?: boolean;
  databasePersistenceEnabled?: boolean;
  liveAiApproved?: boolean;
  liveAiEnabled?: boolean;
};

function blocker(id: string, category: "scripture_anchor" | "explanation_path" | "fallback" | "confidence" | "consent" | "privacy" | "analytics" | "database" | "live_ai", reason: string): TeoyubeFinalPublicLaunchBlocker {
  return { id, label: id.replace(/_/g, " "), category, riskLevel: "critical", reason, requiredAction: "Resolve final public safety certification before public launch execution preparation." };
}

export function validateFinalPublicScriptureAnchoring(input: TeoyubeFinalPublicSafetyInput = {}): boolean {
  return input.scriptureAnchoringRequired !== false;
}

export function validateFinalPublicExplanationPaths(input: TeoyubeFinalPublicSafetyInput = {}): boolean {
  return input.explanationPathsRequired !== false;
}

export function validateFinalPublicFallbackSafety(input: TeoyubeFinalPublicSafetyInput = {}): boolean {
  return input.fallbackEnabled !== false && input.fallbackNonEmpty !== false;
}

export function validateFinalPublicConfidenceSafety(input: TeoyubeFinalPublicSafetyInput = {}): boolean {
  return !input.confidenceOverstated && !input.divineCertaintyClaimed;
}

export function validateFinalPublicConsentSafety(input: TeoyubeFinalPublicSafetyInput = {}): boolean {
  return input.consentControlsAvailable !== false;
}

export function validateFinalPublicPrivacySafety(input: TeoyubeFinalPublicSafetyInput = {}): boolean {
  return input.privacyBoundariesVisible !== false;
}

export function validateFinalPublicNoExternalAnalytics(input: TeoyubeFinalPublicSafetyInput = {}): boolean {
  return !input.externalAnalyticsEnabled || Boolean(input.externalAnalyticsApproved);
}

export function validateFinalPublicNoDatabasePersistenceUnlessApproved(input: TeoyubeFinalPublicSafetyInput = {}): boolean {
  return !input.databasePersistenceEnabled || Boolean(input.databasePersistenceApproved);
}

export function validateFinalPublicNoLiveAiUnlessApproved(input: TeoyubeFinalPublicSafetyInput = {}): boolean {
  return !input.liveAiEnabled || Boolean(input.liveAiApproved);
}

export function getFinalPublicSafetyBlockers(input: TeoyubeFinalPublicSafetyInput = {}): TeoyubeFinalPublicLaunchBlocker[] {
  return [
    validateFinalPublicScriptureAnchoring(input) ? undefined : blocker("final_public_scripture_anchor_missing", "scripture_anchor", "Scripture anchoring is not required."),
    validateFinalPublicExplanationPaths(input) ? undefined : blocker("final_public_explanation_paths_missing", "explanation_path", "Explanation paths are not required."),
    validateFinalPublicFallbackSafety(input) ? undefined : blocker("final_public_fallback_invalid", "fallback", "Fallback is disabled or empty."),
    validateFinalPublicConfidenceSafety(input) ? undefined : blocker("final_public_confidence_or_certainty_invalid", "confidence", "Confidence is overstated or divine certainty is claimed."),
    validateFinalPublicConsentSafety(input) ? undefined : blocker("final_public_consent_controls_missing", "consent", "Consent controls are not available."),
    validateFinalPublicPrivacySafety(input) ? undefined : blocker("final_public_privacy_boundaries_missing", "privacy", "Privacy boundaries are not visible."),
    validateFinalPublicNoExternalAnalytics(input) ? undefined : blocker("final_public_analytics_unapproved", "analytics", "External analytics are enabled without approval."),
    validateFinalPublicNoDatabasePersistenceUnlessApproved(input) ? undefined : blocker("final_public_database_unapproved", "database", "Production persistence is enabled without approval."),
    validateFinalPublicNoLiveAiUnlessApproved(input) ? undefined : blocker("final_public_live_ai_unapproved", "live_ai", "Live AI is enabled without approval.")
  ].filter(Boolean) as TeoyubeFinalPublicLaunchBlocker[];
}

export function getFinalPublicSafetyWarnings(): TeoyubeFinalPublicLaunchWarning[] {
  return [
    { id: "final_public_safety_manual_review", label: "Manual safety review required", category: "scripture_anchor", riskLevel: "medium", message: "Final safety certification is a readiness artifact and does not replace manual public launch execution review.", recommendedAction: "Confirm Scripture, explanation, fallback, confidence, privacy, and consent behavior during Public Launch Execution 6.1." }
  ];
}

export function runFinalPublicSafetyCertification(input: TeoyubeFinalPublicSafetyInput = {}) {
  return createFinalPublicSafetyCertificationReport(input);
}

export function createFinalPublicSafetyDecision(input: TeoyubeFinalPublicSafetyInput = {}): TeoyubeFinalPublicGoNoGoDecision {
  const blockers = getFinalPublicSafetyBlockers(input);
  if (blockers.some((entry) => ["scripture_anchor", "explanation_path", "fallback", "confidence", "consent", "privacy", "analytics", "database", "live_ai"].includes(entry.category))) return "needs_safety_review";
  return "go_for_public_launch_execution_preparation";
}

export function createFinalPublicSafetyCertificationReport(input: TeoyubeFinalPublicSafetyInput = {}) {
  const blockers = getFinalPublicSafetyBlockers(input);
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    decision: createFinalPublicSafetyDecision(input),
    scriptureAnchoringRequired: validateFinalPublicScriptureAnchoring(input),
    explanationPathsRequired: validateFinalPublicExplanationPaths(input),
    fallbackSafetyReady: validateFinalPublicFallbackSafety(input),
    confidenceSafetyReady: validateFinalPublicConfidenceSafety(input),
    consentSafetyReady: validateFinalPublicConsentSafety(input),
    privacySafetyReady: validateFinalPublicPrivacySafety(input),
    externalAnalyticsDisabledOrApproved: validateFinalPublicNoExternalAnalytics(input),
    databasePersistenceDisabledOrApproved: validateFinalPublicNoDatabasePersistenceUnlessApproved(input),
    liveAiDisabledOrApproved: validateFinalPublicNoLiveAiUnlessApproved(input),
    noDivineCertaintyClaimed: !input.divineCertaintyClaimed,
    blockers,
    warnings: getFinalPublicSafetyWarnings(),
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalAnalyticsSent: true,
    noProductionPersistenceEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
