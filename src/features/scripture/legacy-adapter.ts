import type { LegacyCapabilityBridge } from "../../shared/contracts/legacy-capability-bridge";
import { createLegacyCapabilityAdapter } from "../../shared/utilities/create-legacy-capability-adapter";

const LEGACY_OWNERS = Object.freeze([
  { module: "@/components/productization/Phase112ScreenshotApp", responsibility: "approved Canon composition and events" },
  { module: "@/lib/teoyube/data-access", responsibility: "Scripture lookup behavior" }
] as const);

export function createScriptureLegacyAdapter(bridge: LegacyCapabilityBridge<"scripture">) {
  return createLegacyCapabilityAdapter("scripture", LEGACY_OWNERS, bridge);
}
