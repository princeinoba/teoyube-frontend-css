import type { LegacyCapabilityBridge } from "../../shared/contracts/legacy-capability-bridge";
import { createLegacyCapabilityAdapter } from "../../shared/utilities/create-legacy-capability-adapter";

const LEGACY_OWNERS = Object.freeze([
  { module: "@/components/productization/Phase112ScreenshotApp", responsibility: "approved Book of the Saint composition" },
  { module: "@/components/productization/TeoyubeAppStateProvider", responsibility: "local book state" }
] as const);

export function createBookLegacyAdapter(bridge: LegacyCapabilityBridge<"book">) {
  return createLegacyCapabilityAdapter("book", LEGACY_OWNERS, bridge);
}
