import type { CapabilityEvent, CapabilityPort, CapabilityViewModel } from "../../domain/capabilities/contracts";
import { createCapabilityService } from "../../shared/utilities/create-capability-service";

export type ScriptureEvent = CapabilityEvent<"scripture">;
export type ScriptureViewModel = CapabilityViewModel<"scripture">;
export type { ScriptureCanonEntry, ScriptureRepository } from "../../domain/scripture/scripture-repository";
export type { CanonViewModel } from "./canon-contracts";
export { createScriptureLegacyAdapter } from "./legacy-adapter";
export { createApprovedCanonViewModel } from "./application/canon-service";
export { createLocalScriptureRepository } from "./infrastructure/local-scripture-repository";

export function createScriptureFeature(port: CapabilityPort<"scripture">) {
  return createCapabilityService("scripture", port);
}
