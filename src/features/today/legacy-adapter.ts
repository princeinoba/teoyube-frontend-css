import type { LegacyCapabilityBridge } from "../../shared/contracts/legacy-capability-bridge";
import { createLegacyCapabilityAdapter } from "../../shared/utilities/create-legacy-capability-adapter";

const LEGACY_OWNERS = Object.freeze([
  { module: "@/components/productization/Phase112ScreenshotApp", responsibility: "approved Today composition and events" },
  { module: "@/lib/phase11Productization", responsibility: "deterministic Today data" }
] as const);

export function createTodayLegacyAdapter(bridge: LegacyCapabilityBridge<"today">) {
  return createLegacyCapabilityAdapter("today", LEGACY_OWNERS, bridge);
}
