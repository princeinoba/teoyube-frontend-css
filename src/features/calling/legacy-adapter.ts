import type { LegacyCapabilityBridge } from "../../shared/contracts/legacy-capability-bridge";
import { createLegacyCapabilityAdapter } from "../../shared/utilities/create-legacy-capability-adapter";

const LEGACY_OWNERS = Object.freeze([
  { module: "@/components/productization/Phase112ScreenshotApp", responsibility: "approved Calling Compass composition" },
  { module: "@/lib/teoyube/calling/calling-engine", responsibility: "deterministic calling behavior" }
] as const);

export function createCallingLegacyAdapter(bridge: LegacyCapabilityBridge<"calling">) {
  return createLegacyCapabilityAdapter("calling", LEGACY_OWNERS, bridge);
}
