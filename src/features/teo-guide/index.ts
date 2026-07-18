import type { CapabilityEvent, CapabilityPort, CapabilityViewModel } from "../../domain/capabilities/contracts";
import { createCapabilityService } from "../../shared/utilities/create-capability-service";

export type TeoGuideEvent = CapabilityEvent<"teo-guide">;
export type TeoGuideViewModel = CapabilityViewModel<"teo-guide">;
export { createTeoGuideLegacyAdapter } from "./legacy-adapter";

export function createTeoGuideFeature(port: CapabilityPort<"teo-guide">) {
  return createCapabilityService("teo-guide", port);
}
