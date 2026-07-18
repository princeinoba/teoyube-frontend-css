import type { LegacyCapabilityBridge } from "../../shared/contracts/legacy-capability-bridge";
import { createLegacyCapabilityAdapter } from "../../shared/utilities/create-legacy-capability-adapter";

const LEGACY_OWNERS = Object.freeze([
  { module: "@/components/productization/Phase112ScreenshotApp", responsibility: "approved embedded media composition" },
  { module: "@/lib/youtube", responsibility: "local media search behavior" }
] as const);

export function createMediaLegacyAdapter(bridge: LegacyCapabilityBridge<"media">) {
  return createLegacyCapabilityAdapter("media", LEGACY_OWNERS, bridge);
}
