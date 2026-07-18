import type { LegacyCapabilityBridge } from "../../shared/contracts/legacy-capability-bridge";
import { createLegacyCapabilityAdapter } from "../../shared/utilities/create-legacy-capability-adapter";

const LEGACY_OWNERS = Object.freeze([
  { module: "@/components/productization/Phase112ScreenshotApp", responsibility: "approved Promise Table composition and events" },
  { module: "@/lib/teoyube/promises/promise-engine", responsibility: "promise recommendation behavior" }
] as const);

export function createPromisesLegacyAdapter(bridge: LegacyCapabilityBridge<"promises">) {
  return createLegacyCapabilityAdapter("promises", LEGACY_OWNERS, bridge);
}
