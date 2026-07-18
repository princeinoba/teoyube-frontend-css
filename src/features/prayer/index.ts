import type { CapabilityEvent, CapabilityPort, CapabilityViewModel } from "../../domain/capabilities/contracts";
import { createCapabilityService } from "../../shared/utilities/create-capability-service";

export type PrayerEvent = CapabilityEvent<"prayer">;
export type PrayerViewModel = CapabilityViewModel<"prayer">;
export { createPrayerLegacyAdapter } from "./legacy-adapter";

export function createPrayerFeature(port: CapabilityPort<"prayer">) {
  return createCapabilityService("prayer", port);
}
