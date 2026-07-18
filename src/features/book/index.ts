import type { CapabilityEvent, CapabilityPort, CapabilityViewModel } from "../../domain/capabilities/contracts";
import { createCapabilityService } from "../../shared/utilities/create-capability-service";

export type BookEvent = CapabilityEvent<"book">;
export type BookViewModel = CapabilityViewModel<"book">;
export { createBookLegacyAdapter } from "./legacy-adapter";

export function createBookFeature(port: CapabilityPort<"book">) {
  return createCapabilityService("book", port);
}
