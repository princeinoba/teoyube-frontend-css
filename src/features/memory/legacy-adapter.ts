import type { LegacyCapabilityBridge } from "../../shared/contracts/legacy-capability-bridge";
import { createLegacyCapabilityAdapter } from "../../shared/utilities/create-legacy-capability-adapter";

const LEGACY_OWNERS = Object.freeze([
  { module: "@/components/tig/TIGDataManagerPanel", responsibility: "approved memory management controls" },
  { module: "@/components/productization/TeoyubeAppStateProvider", responsibility: "local user-owned records" }
] as const);

export function createMemoryLegacyAdapter(bridge: LegacyCapabilityBridge<"memory">) {
  return createLegacyCapabilityAdapter("memory", LEGACY_OWNERS, bridge);
}
