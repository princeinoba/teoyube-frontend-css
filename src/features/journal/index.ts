import type { CapabilityEvent, CapabilityPort, CapabilityViewModel } from "../../domain/capabilities/contracts";
import { createCapabilityService } from "../../shared/utilities/create-capability-service";

export type JournalEvent = CapabilityEvent<"journal">;
export type JournalViewModel = CapabilityViewModel<"journal">;
export { createJournalLegacyAdapter, getApprovedJournalGuardrails } from "./legacy-adapter";
export { createJournalPageViewModel } from "./application/journal-page-service";
export type { JournalPageViewModel } from "./application/journal-page-service";

export function createJournalFeature(port: CapabilityPort<"journal">) {
  return createCapabilityService("journal", port);
}
