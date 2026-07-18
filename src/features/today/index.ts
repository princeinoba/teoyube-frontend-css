import type { CapabilityEvent, CapabilityPort, CapabilityViewModel } from "../../domain/capabilities/contracts";
import { createCapabilityService } from "../../shared/utilities/create-capability-service";

export type TodayEvent = CapabilityEvent<"today">;
export type TodayViewModel = CapabilityViewModel<"today">;
export { createTodayLegacyAdapter } from "./legacy-adapter";

export function createTodayFeature(port: CapabilityPort<"today">) {
  return createCapabilityService("today", port);
}
