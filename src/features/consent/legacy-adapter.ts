import type { LegacyCapabilityBridge } from "../../shared/contracts/legacy-capability-bridge";
import { createLegacyCapabilityAdapter } from "../../shared/utilities/create-legacy-capability-adapter";

const LEGACY_OWNERS = Object.freeze([
  { module: "@/components/public", responsibility: "approved consent and privacy notices" },
  { module: "@/components/productization/TeoyubeAppStateProvider", responsibility: "local consent state" }
] as const);

export function createConsentLegacyAdapter(bridge: LegacyCapabilityBridge<"consent">) {
  return createLegacyCapabilityAdapter("consent", LEGACY_OWNERS, bridge);
}
