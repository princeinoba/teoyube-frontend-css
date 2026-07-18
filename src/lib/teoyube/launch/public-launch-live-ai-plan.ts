export type TeoyubePublicLaunchLiveAiPlan = {
  id: string;
  label: string;
  useCaseCandidates: string[];
  safetyRequirements: string[];
  costRiskWarnings: string[];
  fallbackRequirements: string[];
  liveAiEnabled: false;
  openAiApiCalled: false;
  apiKeyWritten: false;
  deterministicTigRemoved: false;
};

export function getLiveAiUseCaseCandidates(): string[] {
  return ["AI Companion response generation", "personalized devotional explanation", "prayer draft generation", "natural language query interpretation", "content summarization"];
}

export function getLiveAiSafetyRequirements(): string[] {
  return ["Scripture anchoring required", "Explanation paths required", "Fallback-safe behavior", "Confidence labels", "No divine certainty claims", "Consent-aware personalization"];
}

export function getLiveAiCostRiskWarnings(): string[] {
  return ["Live AI can introduce cost volatility.", "Provider latency can affect fallback needs.", "Rate limits must be planned.", "Manual monitoring may be required before broad public exposure."];
}

export function getLiveAiFallbackRequirements(): string[] {
  return ["Deterministic TIG production layer remains available", "Offline fallback remains Scripture-anchored", "Low confidence fallback remains non-empty", "OpenAI failure does not block core safe render"];
}

export function createPublicLaunchLiveAiPlan(): TeoyubePublicLaunchLiveAiPlan {
  return {
    id: "public_launch_live_ai_plan_5_1",
    label: "Public Launch Live AI Orchestration Decision Plan",
    useCaseCandidates: getLiveAiUseCaseCandidates(),
    safetyRequirements: getLiveAiSafetyRequirements(),
    costRiskWarnings: getLiveAiCostRiskWarnings(),
    fallbackRequirements: getLiveAiFallbackRequirements(),
    liveAiEnabled: false,
    openAiApiCalled: false,
    apiKeyWritten: false,
    deterministicTigRemoved: false
  };
}

export function validateLiveAiLaunchReadiness(plan: TeoyubePublicLaunchLiveAiPlan = createPublicLaunchLiveAiPlan()) {
  const blockers = [
    plan.liveAiEnabled ? { id: "live_ai_plan_enabled", label: plan.label, reason: "5.1 must not enable live AI orchestration.", requiredAction: "Keep live AI disabled.", riskLevel: "critical" as const } : undefined,
    plan.openAiApiCalled ? { id: "live_ai_plan_api_called", label: plan.label, reason: "5.1 must not call OpenAI APIs.", requiredAction: "Remove API calls.", riskLevel: "critical" as const } : undefined,
    plan.apiKeyWritten ? { id: "live_ai_plan_key_written", label: plan.label, reason: "5.1 must not write API keys.", requiredAction: "Remove secret values.", riskLevel: "critical" as const } : undefined,
    plan.deterministicTigRemoved ? { id: "live_ai_plan_tig_removed", label: plan.label, reason: "Deterministic TIG production layer must remain.", requiredAction: "Restore deterministic TIG fallback.", riskLevel: "critical" as const } : undefined
  ].filter(Boolean) as Array<{ id: string; label: string; reason: string; requiredAction: string; riskLevel: "critical" }>;
  return { valid: blockers.length === 0, ready: blockers.length === 0, blockers };
}

export function createLiveAiDecisionReport(plan: TeoyubePublicLaunchLiveAiPlan = createPublicLaunchLiveAiPlan()) {
  const validation = validateLiveAiLaunchReadiness(plan);
  return {
    valid: validation.valid,
    ready: validation.ready,
    decision: validation.valid ? "defer_until_safety_cost_review" as const : "blocked" as const,
    plan,
    blockers: validation.blockers,
    warnings: plan.costRiskWarnings.map((message, index) => ({ id: `live_ai_cost_warning_${index}`, label: plan.label, message, recommendedAction: "Review before any future live AI provider connection.", riskLevel: "medium" as const })),
    noLiveAiEnabled: true,
    noOpenAiApiCalled: true,
    noApiKeyWritten: true,
    deterministicTigPreserved: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
