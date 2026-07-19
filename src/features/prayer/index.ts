import type { CapabilityEvent, CapabilityPort, CapabilityViewModel } from "../../domain/capabilities/contracts";
import { createCapabilityService } from "../../shared/utilities/create-capability-service";

export type PrayerEvent = CapabilityEvent<"prayer">;
export type PrayerViewModel = CapabilityViewModel<"prayer">;
export { createPrayerLegacyAdapter } from "./legacy-adapter";
export type { PrayerPageViewModel, PrayerReplyDto } from "../../domain/prayer/prayer-contracts";
export { createPrayerPageViewModel, createPrayerReplyDto } from "./application/prayer-service";

export function createPrayerFeature(port: CapabilityPort<"prayer">) {
  return createCapabilityService("prayer", port);
}
