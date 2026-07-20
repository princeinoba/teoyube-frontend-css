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
import { createDailyLoopTigCompatibilitySeed } from "../legacy-adapter";

export function createDeterministicDailySpiritualLoopSeed(): DailySpiritualLoopSeed {
  return createDailyLoopTigCompatibilitySeed();
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
