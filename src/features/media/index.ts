import type { CapabilityEvent, CapabilityPort, CapabilityViewModel } from "../../domain/capabilities/contracts";
import { createCapabilityService } from "../../shared/utilities/create-capability-service";

export type MediaEvent = CapabilityEvent<"media">;
export type MediaViewModel = CapabilityViewModel<"media">;
export { createMediaLegacyAdapter } from "./legacy-adapter";

export function createMediaFeature(port: CapabilityPort<"media">) {
  return createCapabilityService("media", port);
}
