import type { CapabilityEvent, CapabilityPort, CapabilityViewModel } from "../../domain/capabilities/contracts";
import { createCapabilityService } from "../../shared/utilities/create-capability-service";

export type PromisesEvent = CapabilityEvent<"promises">;
export type PromisesViewModel = CapabilityViewModel<"promises">;
export { createPromisesLegacyAdapter } from "./legacy-adapter";

export function createPromisesFeature(port: CapabilityPort<"promises">) {
  return createCapabilityService("promises", port);
}
