import type { CapabilityEvent, CapabilityPort, CapabilityViewModel } from "../../domain/capabilities/contracts";
import { createCapabilityService } from "../../shared/utilities/create-capability-service";

export type MemoryEvent = CapabilityEvent<"memory">;
export type MemoryViewModel = CapabilityViewModel<"memory">;
export { createMemoryLegacyAdapter } from "./legacy-adapter";

export function createMemoryFeature(port: CapabilityPort<"memory">) {
  return createCapabilityService("memory", port);
}
