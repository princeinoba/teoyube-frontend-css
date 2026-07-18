import type { CapabilityEvent, CapabilityPort, CapabilityViewModel } from "../../domain/capabilities/contracts";
import { createCapabilityService } from "../../shared/utilities/create-capability-service";

export type ScriptureEvent = CapabilityEvent<"scripture">;
export type ScriptureViewModel = CapabilityViewModel<"scripture">;
export { createScriptureLegacyAdapter } from "./legacy-adapter";

export function createScriptureFeature(port: CapabilityPort<"scripture">) {
  return createCapabilityService("scripture", port);
}
