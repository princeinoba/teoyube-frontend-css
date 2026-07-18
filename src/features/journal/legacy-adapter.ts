import type { LegacyCapabilityBridge } from "../../shared/contracts/legacy-capability-bridge";
import { createLegacyCapabilityAdapter } from "../../shared/utilities/create-legacy-capability-adapter";

const LEGACY_OWNERS = Object.freeze([
  { module: "@/components/productization/Phase11ProductPanels", responsibility: "approved journal interaction" },
  { module: "@/components/productization/TeoyubeAppStateProvider", responsibility: "local journal state" }
] as const);

export function createJournalLegacyAdapter(bridge: LegacyCapabilityBridge<"journal">) {
  return createLegacyCapabilityAdapter("journal", LEGACY_OWNERS, bridge);
}
