import type { CapabilityEvent, CapabilityPort, CapabilityViewModel } from "../../domain/capabilities/contracts";
import { createCapabilityService } from "../../shared/utilities/create-capability-service";

export type LexiconEvent = CapabilityEvent<"lexicon">;
export type LexiconViewModel = CapabilityViewModel<"lexicon">;
export { createLexiconLegacyAdapter } from "./legacy-adapter";

export function createLexiconFeature(port: CapabilityPort<"lexicon">) {
  return createCapabilityService("lexicon", port);
}
