import type { CapabilityEvent, CapabilityPort, CapabilityViewModel } from "../../domain/capabilities/contracts";
import { createCapabilityService } from "../../shared/utilities/create-capability-service";

export type JourneyEvent = CapabilityEvent<"journey">;
export type JourneyViewModel = CapabilityViewModel<"journey">;
export { createJourneyLegacyAdapter } from "./legacy-adapter";
export type { JourneyPageViewModel } from "../../domain/journey/journey-contracts";
export { createJourneyPageViewModel } from "./application/journey-service";

export function createJourneyFeature(port: CapabilityPort<"journey">) {
  return createCapabilityService("journey", port);
}
