import type { CapabilityEvent, CapabilityPort, CapabilityViewModel } from "../../domain/capabilities/contracts";
import { createCapabilityService } from "../../shared/utilities/create-capability-service";

export type ConsentEvent = CapabilityEvent<"consent">;
export type ConsentViewModel = CapabilityViewModel<"consent">;
export { createConsentLegacyAdapter } from "./legacy-adapter";

export function createConsentFeature(port: CapabilityPort<"consent">) {
  return createCapabilityService("consent", port);
}
