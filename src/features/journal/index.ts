import type { CapabilityEvent, CapabilityPort, CapabilityViewModel } from "../../domain/capabilities/contracts";
import { createCapabilityService } from "../../shared/utilities/create-capability-service";

export type JournalEvent = CapabilityEvent<"journal">;
export type JournalViewModel = CapabilityViewModel<"journal">;
export { createJournalLegacyAdapter } from "./legacy-adapter";

export function createJournalFeature(port: CapabilityPort<"journal">) {
  return createCapabilityService("journal", port);
}
