import { createPhase3CompletionReport } from "./phase-3-completion-review";
import type {
  TeoyubePhase3CompletionBlocker,
  TeoyubePhase3CompletionWarning,
  TeoyubePhase3IntegrationLock,
  TeoyubePhase3LockedContract
} from "./phase-3-completion-contracts";

function lockedContract(
  id: string,
  area: TeoyubePhase3LockedContract["area"],
  name: string,
  sourceFiles: string[],
  rules: string[]
): TeoyubePhase3LockedContract {
  return { id, area, name, locked: true, sourceFiles, rules };
}

export function getPhase3LockedContracts(): TeoyubePhase3LockedContract[] {
  return [
    lockedContract("data_access_contract", "data_access", "Data access contract", ["src/lib/teoyube/data/**", "src/data/coreTeoyubeVocabulary.json", "src/data/promiseClusters.json", "src/data/scriptureCanon.json"], ["Future changes must preserve normalized data access.", "Future changes must not discard source metadata.", "Missing Scripture anchors must remain warning/blocker-aware."]),
    lockedContract("scripture_anchor_contract", "data_access", "Scripture anchor contract", ["src/lib/teoyube/data/**", "src/lib/teoyube/tig/tig-scripture-anchor-validation.ts"], ["Future changes must not remove Scripture anchors.", "Unsupported Scripture references must be flagged.", "Live surfaces must not silently hide missing anchors."]),
    lockedContract("promise_cluster_contract", "promise_engine", "Promise Cluster contract", ["src/lib/teoyube/promises/**", "src/data/promiseClusters.json"], ["Promise clusters must keep Scripture support.", "Unsupported promises must not be invented.", "Promise Table rows must come from real cluster data."]),
    lockedContract("teoyube_vocabulary_contract", "teoyube_language_engine", "Teoyube vocabulary contract", ["src/lib/teoyube/language/**", "src/data/coreTeoyubeVocabulary.json"], ["Words must preserve ids, meanings, themes, and anchors.", "WordCard must keep fallback and explanation support."]),
    lockedContract("theology_safety_contract", "theology_framework", "Theology Framework safety contract", ["src/lib/teoyube/theology/**"], ["Future changes must not claim divine certainty.", "Devotional boundaries must remain visible.", "Prayer/calling copy must remain humble and review-oriented."]),
    lockedContract("calling_engine_contract", "calling_engine", "Calling Engine contract", ["src/lib/teoyube/calling/**"], ["Calling paths must not overclaim certainty.", "Calling suggestions must preserve Scripture and explanation context."]),
    lockedContract("tig_recommendation_contract", "tig_recommendation_flow", "TIG recommendation contract", ["src/lib/teoyube/tig/**"], ["TIG recommendations must preserve selected candidate, reasons, Scripture anchors, confidence, trace, fallback, and safety flags."]),
    lockedContract("explanation_trace_contract", "explanation_trace", "Explanation trace contract", ["src/lib/teoyube/tig/tig-explanation-trace.ts", "src/lib/teoyube/journey/**"], ["Future changes must not remove explanation paths.", "Trace steps must remain visible to normal users."]),
    lockedContract("fallback_safety_contract", "fallback_safety", "Fallback safety contract", ["src/lib/teoyube/tig/tig-fallback-decision.ts", "src/lib/teoyube/journey/production-ui-fallback-states.ts"], ["Future changes must not weaken fallback safety.", "Fallback messages must stay non-empty and explain why fallback was used."]),
    lockedContract("confidence_label_contract", "tig_recommendation_flow", "Confidence label contract", ["src/lib/teoyube/tig/tig-recommendation-scoring.ts"], ["Future changes must not hide confidence labels.", "Confidence must remain bounded and not framed as divine certainty."]),
    lockedContract("ui_adapter_contract", "ui_adapters", "UI adapter contract", ["src/lib/teoyube/adapters/**", "src/lib/teoyube/hooks/**"], ["Adapters must keep stable props.", "Adapters must preserve anchors, traces, fallback reasons, confidence labels, and privacy/safety flags."]),
    lockedContract("user_journey_state_contract", "user_journey", "User journey state contract", ["src/lib/teoyube/journey/**"], ["Journey state must remain in-memory for sensitive input.", "Future changes must not create hidden personalization.", "Journey reports must preserve local-only flags."]),
    lockedContract("qa_readiness_contract", "real_data_qa", "QA readiness contract", ["src/lib/teoyube/qa/**", "src/lib/teoyube/integration/phase-3-*-audit.ts"], ["Phase QA must stay runnable without external services.", "Future service decisions require explicit approved review."])
  ];
}

export function createPhase3IntegrationLock(): TeoyubePhase3IntegrationLock {
  const contracts = getPhase3LockedContracts();
  return {
    id: "phase_3_integration_lock",
    locked: contracts.every((entry) => entry.locked),
    contracts,
    blockers: [],
    warnings: [
      {
        id: "phase_4_manual_review_required",
        area: "roadmap",
        message: "Manual owner, browser, device, and accessibility review remains a Phase 4.1 follow-up.",
        recommendedAction: "Complete Phase 4.1 product experience and manual QA review before controlled service decisions."
      }
    ],
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}

export function validatePhase3IntegrationLock(input: unknown = {}): TeoyubePhase3IntegrationLock {
  const completion = createPhase3CompletionReport(input);
  const lock = createPhase3IntegrationLock();
  const blockers: TeoyubePhase3CompletionBlocker[] = [
    ...completion.blockers,
    ...lock.contracts
      .filter((entry) => !entry.locked || entry.rules.length === 0)
      .map((entry) => ({
        id: `${entry.id}_not_locked`,
        area: entry.area,
        message: `${entry.name} is not fully locked.`,
        requiredAction: "Restore the locked contract rules before Phase 4 planning."
      }))
  ];
  const warnings: TeoyubePhase3CompletionWarning[] = [...lock.warnings, ...completion.warnings];

  return {
    ...lock,
    locked: blockers.length === 0,
    blockers,
    warnings
  };
}

export function getPhase3IntegrationLockBlockers(input: unknown = {}): TeoyubePhase3CompletionBlocker[] {
  return validatePhase3IntegrationLock(input).blockers;
}

export function getPhase3IntegrationLockWarnings(input: unknown = {}): TeoyubePhase3CompletionWarning[] {
  return validatePhase3IntegrationLock(input).warnings;
}

export function createPhase3IntegrationLockReport(input: unknown = {}): TeoyubePhase3IntegrationLock {
  return validatePhase3IntegrationLock(input);
}
