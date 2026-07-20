import type { LegacyCapabilityBridge } from "../../shared/contracts/legacy-capability-bridge";
import { createLegacyCapabilityAdapter } from "../../shared/utilities/create-legacy-capability-adapter";
import { getGuardrailsContent } from "../../lib/phase112Productization";
import type { DailySpiritualLoopSeed } from "../../domain/journey/daily-spiritual-loop";
import type { TigRecommendationResult } from "../../domain/tig/tig-service";

const LEGACY_OWNERS = Object.freeze([
  { module: "@/lib/teoyube/journey/journey-page-integration", responsibility: "legacy journey page contract" },
  { module: "@/lib/teoyube/journey/user-journey-orchestrator", responsibility: "journey transitions" }
] as const);

export function createJourneyLegacyAdapter(bridge: LegacyCapabilityBridge<"journey">) {
  return createLegacyCapabilityAdapter("journey", LEGACY_OWNERS, bridge);
}

export function getApprovedJourneyGuardrails() {
  return getGuardrailsContent().points.slice(0, 5);
}

export function createDailyLoopTigCompatibilitySeed(result: TigRecommendationResult): DailySpiritualLoopSeed {
  const scriptureReferences = result.explanation.scriptureAnchors.length
    ? result.explanation.scriptureAnchors.map((anchor) => anchor.reference)
    : ["Ephesians 1:18"];
  const confidenceLabel = result.confidence.label === "strong_scripture_match"
    ? "strong_scripture_match"
    : result.confidence.label === "good_contextual_match"
      ? "good_contextual_match"
      : result.confidence.label === "partial_match"
        ? "partial_match"
        : "fallback_match";
  const traceSteps = result.explanation.steps.length
    ? result.explanation.steps.map((step, index) => Object.freeze({
        id: `daily-loop-trace-${index + 1}`,
        summary: step.summary,
        source: step.source,
        scriptureReferences: Object.freeze([...step.scriptureAnchors])
      }))
    : [Object.freeze({
        id: "daily-loop-trace-fallback",
        summary: "The deterministic fallback preserves Scripture review and explains why more context may be needed.",
        source: "fallback",
        scriptureReferences: Object.freeze([...scriptureReferences])
      })];

  const promiseCandidate = result.candidates.find((candidate) => candidate.type === "promise") || result.selectedCandidate;
  const prayerCandidate = result.candidates.find((candidate) => candidate.type === "prayer");
  const actionCandidate = result.candidates.find((candidate) => candidate.type === "action_step");
  return Object.freeze({
    id: "daily-spiritual-loop:deterministic-v1",
    scriptureReferences: Object.freeze([...scriptureReferences]),
    promise: Object.freeze({
      title: promiseCandidate.label || "Calling & Purpose",
      level: "A" as const,
      explanation: result.selectedCandidate.description || "A Scripture-linked promise application prepared for user review."
    }),
    prayerDraft: prayerCandidate?.description || "Father, guide my next faithful step through Your Word, prayer, wise counsel, and humility.",
    callingDiscernment: Object.freeze({
      summary: "The strongest indicators suggest a calling pattern may be emerging; test it through Scripture, prayer, fruit, time, and wise counsel.",
      evidence: Object.freeze(result.explanation.steps.map((step) => step.summary).slice(0, 4))
    }),
    dailyAssignment: actionCandidate?.description || "Choose one realistic, Scripture-consistent action and reflect on it without treating compliance as spiritual worth.",
    trace: Object.freeze({
      id: "daily-spiritual-loop:tig-trace-v1",
      deterministic: true as const,
      externalModelUsed: false as const,
      steps: Object.freeze(traceSteps)
    }),
    confidence: Object.freeze({
      score: result.confidence.score,
      label: confidenceLabel,
      explanation: result.confidence.explanation
    }),
    limitations: Object.freeze([
      ...(result.fallback.used ? result.fallback.reasons.map((reason) => reason.detail) : []),
      "Calling remains discernment over time, not a final destiny declaration.",
      "Generated prayer language remains a reviewable draft and never represents divine speech."
    ]),
    tigValid: result.valid
  });
}
