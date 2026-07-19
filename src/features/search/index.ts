import type { CapabilityEvent, CapabilityPort, CapabilityViewModel } from "../../domain/capabilities/contracts";
import { createCapabilityService } from "../../shared/utilities/create-capability-service";

export type SearchEvent = CapabilityEvent<"search">;
export type LegacySearchCapabilityViewModel = CapabilityViewModel<"search">;
export * from "./contracts";
export { createApprovedSearchViewModel, createSearchLegacyAdapter } from "./legacy-adapter";
export { detectSearchIntent, reduceSearchViewModel, searchApprovedCatalog, toLegacySearchResult } from "./application/search-service";

export function createSearchFeature(port: CapabilityPort<"search">) {
  return createCapabilityService("search", port);
}
