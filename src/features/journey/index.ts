import type { CapabilityEvent, CapabilityPort, CapabilityViewModel } from "../../domain/capabilities/contracts";
import { createCapabilityService } from "../../shared/utilities/create-capability-service";

export type JourneyEvent = CapabilityEvent<"journey">;
export type JourneyViewModel = CapabilityViewModel<"journey">;
export { createJourneyLegacyAdapter } from "./legacy-adapter";
export type { JourneyPageViewModel } from "../../domain/journey/journey-contracts";
export { createJourneyPageViewModel } from "./application/journey-service";
export type {
  DailySpiritualLoopAction,
  DailySpiritualLoopArtifact,
  DailySpiritualLoopArtifactStatus,
  DailySpiritualLoopArtifacts,
  DailySpiritualLoopSeed,
  DailySpiritualLoopStage,
  DailySpiritualLoopState
} from "../../domain/journey/daily-spiritual-loop";
export {
  createDeterministicDailySpiritualLoopSeed,
  getDailySpiritualLoopActionPolicy,
  getDailySpiritualLoopProgress,
  measureDailySpiritualLoopOutcomes,
  startDailySpiritualLoop,
  transitionDailySpiritualLoop
} from "./application/daily-spiritual-loop-service";

export function createJourneyFeature(port: CapabilityPort<"journey">) {
  return createCapabilityService("journey", port);
}
