import type { CapabilityEvent, CapabilityPort, CapabilityViewModel } from "../../domain/capabilities/contracts";
import { createCapabilityService } from "../../shared/utilities/create-capability-service";

export type TestimonyEvent = CapabilityEvent<"testimony">;
export type TestimonyViewModel = CapabilityViewModel<"testimony">;
export { createTestimonyLegacyAdapter } from "./legacy-adapter";

export function createTestimonyFeature(port: CapabilityPort<"testimony">) {
  return createCapabilityService("testimony", port);
}
