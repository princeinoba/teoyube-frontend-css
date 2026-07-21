import type { CapabilityEvent, CapabilityPort, CapabilityViewModel } from "../../domain/capabilities/contracts";
import { createCapabilityService } from "../../shared/utilities/create-capability-service";

export type MemoryEvent = CapabilityEvent<"memory">;
export type MemoryViewModel = CapabilityViewModel<"memory">;
export { createMemoryLegacyAdapter } from "./legacy-adapter";
export { UserMemoryService, MEMORY_LIMITS } from "./application/user-memory-service";

export function createMemoryFeature(port: CapabilityPort<"memory">) {
  return createCapabilityService("memory", port);
}
