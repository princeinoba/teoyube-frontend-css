import type { LegacyCapabilityBridge } from "../../shared/contracts/legacy-capability-bridge";
import { createLegacyCapabilityAdapter } from "../../shared/utilities/create-legacy-capability-adapter";

const LEGACY_OWNERS = Object.freeze([
  { module: "@/components/productization/Phase112ScreenshotApp", responsibility: "approved Teo Guide composition" },
  { module: "@/lib/phase112Productization", responsibility: "legacy Teo Guide response behavior" }
] as const);

export function createTeoGuideLegacyAdapter(bridge: LegacyCapabilityBridge<"teo-guide">) {
  return createLegacyCapabilityAdapter("teo-guide", LEGACY_OWNERS, bridge);
}
