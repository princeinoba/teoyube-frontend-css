import type { LegacyCapabilityBridge } from "../../shared/contracts/legacy-capability-bridge";
import { createLegacyCapabilityAdapter } from "../../shared/utilities/create-legacy-capability-adapter";

const LEGACY_OWNERS = Object.freeze([
  { module: "@/components/productization/Phase112ScreenshotApp", responsibility: "approved Search composition and events" },
  { module: "@/lib/teoyube/data-access", responsibility: "local search behavior" }
] as const);

export function createSearchLegacyAdapter(bridge: LegacyCapabilityBridge<"search">) {
  return createLegacyCapabilityAdapter("search", LEGACY_OWNERS, bridge);
}
