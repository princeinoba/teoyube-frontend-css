import type { CapabilityEvent, CapabilityPort, CapabilityViewModel } from "../../domain/capabilities/contracts";
import { createCapabilityService } from "../../shared/utilities/create-capability-service";

export type TodayEvent = CapabilityEvent<"today">;
export type TodayCapabilityViewModel = CapabilityViewModel<"today">;
export type { TodayAction, TodayPromiseSlide, TodayStory, TodayViewActions, TodayViewModel } from "./contracts";
export { createTodayLegacyAdapter, createApprovedTodayViewModel } from "./legacy-adapter";
export { createTodayViewModel, reduceTodayViewModel } from "./application/today-service";

export function createTodayFeature(port: CapabilityPort<"today">) {
  return createCapabilityService("today", port);
}
