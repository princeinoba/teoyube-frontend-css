import {
  applyDailySpiritualLoopAction,
  createDailySpiritualLoopState,
  getDailySpiritualLoopActionPolicy,
  getDailySpiritualLoopProgress,
  measureDailySpiritualLoopOutcomes,
  type DailySpiritualLoopAction,
  type DailySpiritualLoopSeed,
  type DailySpiritualLoopState
} from "../../../domain/journey/daily-spiritual-loop";
import type { TigService } from "../../../domain/tig/tig-service";
import { createDailyLoopTigCompatibilitySeed } from "../legacy-adapter";

export async function createDeterministicDailySpiritualLoopSeed(tigService: TigService): Promise<DailySpiritualLoopSeed> {
  const recommendation = await tigService.recommend({
    query: "calling purpose faithful next step",
    intent: "daily_journey",
    surface: "daily_word",
    selectedWordId: "TIDUILOVP",
    selectedPromiseClusterId: "calling-purpose"
  });
  return createDailyLoopTigCompatibilitySeed(recommendation);
}

export function startDailySpiritualLoop(seed: DailySpiritualLoopSeed, startedAt: string): DailySpiritualLoopState {
  return createDailySpiritualLoopState(seed, startedAt);
}

export function transitionDailySpiritualLoop(state: DailySpiritualLoopState, action: DailySpiritualLoopAction) {
  return applyDailySpiritualLoopAction(state, action);
}

export {
  getDailySpiritualLoopActionPolicy,
  getDailySpiritualLoopProgress,
  measureDailySpiritualLoopOutcomes
};
