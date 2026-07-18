import type { CapabilityEvent, CapabilityPort, CapabilityViewModel } from "../../domain/capabilities/contracts";
import { createCapabilityService } from "../../shared/utilities/create-capability-service";

export type CallingEvent = CapabilityEvent<"calling">;
export type CallingViewModel = CapabilityViewModel<"calling">;
export { createCallingLegacyAdapter } from "./legacy-adapter";

export function createCallingFeature(port: CapabilityPort<"calling">) {
  return createCapabilityService("calling", port);
}
