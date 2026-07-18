import type { CapabilityEvent, CapabilityPort, CapabilityViewModel } from "../../domain/capabilities/contracts";
import { createCapabilityService } from "../../shared/utilities/create-capability-service";

export type SearchEvent = CapabilityEvent<"search">;
export type SearchViewModel = CapabilityViewModel<"search">;
export { createSearchLegacyAdapter } from "./legacy-adapter";

export function createSearchFeature(port: CapabilityPort<"search">) {
  return createCapabilityService("search", port);
}
