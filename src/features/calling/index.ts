import type { CapabilityEvent, CapabilityPort, CapabilityViewModel } from "../../domain/capabilities/contracts";
import { createCapabilityService } from "../../shared/utilities/create-capability-service";

export type CallingEvent = CapabilityEvent<"calling">;
export type CallingViewModel = CapabilityViewModel<"calling">;
export { createCallingLegacyAdapter } from "./legacy-adapter";
export type { CallingCompassViewModel, CallingDiscernmentDto } from "../../domain/calling/calling-discernment";
export { createCallingCompassViewModel } from "./application/calling-compass-service";

export function createCallingFeature(port: CapabilityPort<"calling">) {
  return createCapabilityService("calling", port);
}
