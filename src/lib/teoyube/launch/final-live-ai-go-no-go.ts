import type { TeoyubeFinalPublicGoNoGoCheck, TeoyubeFinalPublicLaunchBlocker, TeoyubeFinalPublicLaunchWarning } from "./final-public-go-no-go-contracts";
import { createLiveAiDecisionReport, createPublicLaunchLiveAiPlan } from "./public-launch-live-ai-plan";

export type TeoyubeFinalLiveAiDecision =
  | "disabled_for_public_launch"
  | "approved_for_later_setup"
  | "requires_safety_review"
  | "requires_cost_review"
  | "requires_owner_review"
  | "blocked";

export type TeoyubeFinalLiveAiInput = {
  liveAiEnabled?: boolean;
  openAiApiCalled?: boolean;
  apiKeyWritten?: boolean;
  deterministicTigRemoved?: boolean;
  approvedForPublicLaunch?: boolean;
  safetyReviewComplete?: boolean;
  costReviewComplete?: boolean;
  ownerReviewComplete?: boolean;
};

function check(id: string, label: string, complete: boolean, details: string): TeoyubeFinalPublicGoNoGoCheck {
  return { id, label, category: "live_ai", required: true, complete, status: complete ? "ready" : "blocked", launchCritical: true, details };
}

function blocker(id: string, reason: string): TeoyubeFinalPublicLaunchBlocker {
  return { id, label: id.replace(/_/g, " "), category: "live_ai", riskLevel: "critical", reason, requiredAction: "Keep live AI disabled and preserve deterministic TIG until a later explicit provider setup step." };
}

export function createFinalLiveAiGoNoGoChecklist(input: TeoyubeFinalLiveAiInput = {}): TeoyubeFinalPublicGoNoGoCheck[] {
  return [
    check("final_live_ai_disabled", "Live AI orchestration disabled", !input.liveAiEnabled, "5.4 must not enable live OpenAI orchestration."),
    check("final_live_ai_no_openai_call", "No OpenAI API call", !input.openAiApiCalled, "5.4 must not call OpenAI APIs."),
    check("final_live_ai_no_api_key", "No API key written", !input.apiKeyWritten, "5.4 must not write real secret values."),
    check("final_live_ai_deterministic_tig_preserved", "Deterministic TIG preserved", !input.deterministicTigRemoved, "Deterministic TIG production behavior remains the safe default.")
  ];
}

export function getFinalLiveAiBlockers(input: TeoyubeFinalLiveAiInput = {}): TeoyubeFinalPublicLaunchBlocker[] {
  return [
    input.liveAiEnabled ? blocker("final_live_ai_enabled", "Live AI orchestration is enabled.") : undefined,
    input.openAiApiCalled ? blocker("final_live_ai_openai_called", "An OpenAI API call was made.") : undefined,
    input.apiKeyWritten ? blocker("final_live_ai_api_key_written", "A real API key or secret was written.") : undefined,
    input.deterministicTigRemoved ? blocker("final_live_ai_deterministic_tig_removed", "The deterministic TIG production layer was removed.") : undefined
  ].filter(Boolean) as TeoyubeFinalPublicLaunchBlocker[];
}

export function getFinalLiveAiWarnings(input: TeoyubeFinalLiveAiInput = {}): TeoyubeFinalPublicLaunchWarning[] {
  return [
    {
      id: "final_live_ai_deferred",
      label: "Live AI deferred",
      category: "live_ai",
      riskLevel: "medium",
      message: input.approvedForPublicLaunch ? "Live AI was requested but remains deferred unless safety, cost, provider, and owner review are complete." : "Live AI orchestration remains disabled for public launch execution preparation.",
      recommendedAction: "Use a later explicit live AI setup step after grounding, safety, fallback, cost, provider, and consent review."
    }
  ];
}

export function createFinalLiveAiDecision(input: TeoyubeFinalLiveAiInput = {}): TeoyubeFinalLiveAiDecision {
  const blockers = getFinalLiveAiBlockers(input);
  if (blockers.length > 0) return "blocked";
  if (input.approvedForPublicLaunch && !input.safetyReviewComplete) return "requires_safety_review";
  if (input.approvedForPublicLaunch && !input.costReviewComplete) return "requires_cost_review";
  if (input.approvedForPublicLaunch && !input.ownerReviewComplete) return "requires_owner_review";
  if (input.approvedForPublicLaunch) return "approved_for_later_setup";
  return "disabled_for_public_launch";
}

export function evaluateFinalLiveAiGoNoGo(input: TeoyubeFinalLiveAiInput = {}) {
  const blockers = getFinalLiveAiBlockers(input);
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    decision: createFinalLiveAiDecision(input),
    checklist: createFinalLiveAiGoNoGoChecklist(input),
    blockers,
    warnings: getFinalLiveAiWarnings(input)
  };
}

export function createFinalLiveAiGoNoGoReport(input: TeoyubeFinalLiveAiInput = {}) {
  const publicLaunchPlanReport = createLiveAiDecisionReport(createPublicLaunchLiveAiPlan());
  const evaluation = evaluateFinalLiveAiGoNoGo(input);
  return {
    ...evaluation,
    publicLaunchPlanReport,
    noLiveAiEnabled: true,
    noOpenAiApiCalled: true,
    noApiKeyWritten: true,
    deterministicTigPreserved: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
