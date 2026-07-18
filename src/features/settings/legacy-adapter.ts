import type { LegacyCapabilityBridge } from "../../shared/contracts/legacy-capability-bridge";
import { createLegacyCapabilityAdapter } from "../../shared/utilities/create-legacy-capability-adapter";

const LEGACY_OWNERS = Object.freeze([
  { module: "@/app/settings/page", responsibility: "approved settings composition and controls" },
  { module: "@/components/productization/TeoyubeAppStateProvider", responsibility: "local settings state" }
] as const);

export function createSettingsLegacyAdapter(bridge: LegacyCapabilityBridge<"settings">) {
  return createLegacyCapabilityAdapter("settings", LEGACY_OWNERS, bridge);
}
