import type { CapabilityEvent, CapabilityPort, CapabilityViewModel } from "../../domain/capabilities/contracts";
import { createCapabilityService } from "../../shared/utilities/create-capability-service";

export type JourneyEvent = CapabilityEvent<"journey">;
export type JourneyViewModel = CapabilityViewModel<"journey">;
export { createJourneyLegacyAdapter } from "./legacy-adapter";

export function createJourneyFeature(port: CapabilityPort<"journey">) {
  return createCapabilityService("journey", port);
}
