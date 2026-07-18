import type { CapabilityEvent, CapabilityPort, CapabilityViewModel } from "../../domain/capabilities/contracts";
import { createCapabilityService } from "../../shared/utilities/create-capability-service";

export type SettingsEvent = CapabilityEvent<"settings">;
export type SettingsViewModel = CapabilityViewModel<"settings">;
export { createSettingsLegacyAdapter } from "./legacy-adapter";

export function createSettingsFeature(port: CapabilityPort<"settings">) {
  return createCapabilityService("settings", port);
}
