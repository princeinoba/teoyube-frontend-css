import type { ScriptureCitation } from "../../../domain/scripture/scripture-repository";
import { DAILY_SPIRITUAL_LOOP_STAGES, type DailySpiritualLoopState } from "../../../domain/journey/daily-spiritual-loop";
import type { NewUserMemoryRecord, UserMemoryRecord } from "../../../domain/memory/memory-contracts";

export type JourneyContinuitySnapshot = Readonly<{
  journeyId: string;
  currentStage: DailySpiritualLoopState["currentStage"];
  active: boolean;
  startedAt: string;
  completedAt: string | null;
  scriptureCitations: readonly ScriptureCitation[];
  artifacts: readonly Readonly<{
    kind: keyof DailySpiritualLoopState["artifacts"];
    status: DailySpiritualLoopState["artifacts"][keyof DailySpiritualLoopState["artifacts"]]["status"];
    sourceReferences: DailySpiritualLoopState["artifacts"][keyof DailySpiritualLoopState["artifacts"]]["sourceReferences"];
    tigTraceId: string;
    confidence: DailySpiritualLoopState["artifacts"][keyof DailySpiritualLoopState["artifacts"]]["confidence"];
    limitations: readonly string[];
    revision: number;
    lastAction: string | null;
    userEditCount: number;
  }>[];
  transitions: DailySpiritualLoopState["transitions"];
  undoDepth: number;
  privateTextPersisted: false;
  liveAiUsed: false;
}>;

export function createJourneyContinuityMemory(input: Readonly<{
  state: DailySpiritualLoopState;
  scriptureCitations: readonly ScriptureCitation[];
  idempotencyKey: string;
}>): NewUserMemoryRecord {
  const snapshot: JourneyContinuitySnapshot = Object.freeze({
    journeyId: input.state.id,
    currentStage: input.state.currentStage,
    active: input.state.active,
    startedAt: input.state.startedAt,
    completedAt: input.state.completedAt,
    scriptureCitations: Object.freeze([...input.scriptureCitations]),
    artifacts: Object.freeze(DAILY_SPIRITUAL_LOOP_STAGES.map((stage) => {
      const artifact = input.state.artifacts[stage];
      return Object.freeze({
        kind: stage,
        status: artifact.status,
        sourceReferences: artifact.sourceReferences,
        tigTraceId: artifact.tigExplanationTrace.id,
        confidence: artifact.confidence,
        limitations: artifact.limitations,
        revision: artifact.reversibleTransitionMetadata.revision,
        lastAction: artifact.reversibleTransitionMetadata.lastAction,
        userEditCount: artifact.userEdits.length
      });
    })),
    transitions: input.state.transitions,
    undoDepth: input.state.undoStack.length,
    privateTextPersisted: false,
    liveAiUsed: false
  });
  const latestTrace = input.state.artifacts[input.state.currentStage].tigExplanationTrace;
  return Object.freeze({
    idempotencyKey: input.idempotencyKey,
    layer: "journey_state",
    sensitivity: "structured_spiritual",
    purposeId: "journey_continuity",
    provenance: Object.freeze({
      sourceType: "journey_transition",
      sourceId: input.state.id,
      scriptureCitations: Object.freeze([...input.scriptureCitations]),
      tigRecommendationId: latestTrace.id,
      tigExplanationReferences: Object.freeze(latestTrace.steps.map((step) => step.id)),
      reversibleTransitionRevision: input.state.transitions.length,
      createdBy: "deterministic_system"
    }),
    content: snapshot,
    userApproved: true
  });
}

export function readJourneyContinuitySnapshot(record: UserMemoryRecord): JourneyContinuitySnapshot {
  if (record.layer !== "journey_state" || record.purposeId !== "journey_continuity" || record.status !== "active") throw new Error("Journey continuity record is unavailable.");
  return record.content as JourneyContinuitySnapshot;
}
