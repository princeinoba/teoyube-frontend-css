import type { LegacyCapabilityBridge } from "../../shared/contracts/legacy-capability-bridge";
import { createLegacyCapabilityAdapter } from "../../shared/utilities/create-legacy-capability-adapter";

const LEGACY_OWNERS = Object.freeze([
  { module: "@/components/productization/Phase112ScreenshotApp", responsibility: "approved testimony composition" },
  { module: "@/components/productization/TeoyubeAppStateProvider", responsibility: "local testimony state" }
] as const);

export function createTestimonyLegacyAdapter(bridge: LegacyCapabilityBridge<"testimony">) {
  return createLegacyCapabilityAdapter("testimony", LEGACY_OWNERS, bridge);
}
