import type { LegacyCapabilityBridge } from "../../shared/contracts/legacy-capability-bridge";
import { createLegacyCapabilityAdapter } from "../../shared/utilities/create-legacy-capability-adapter";
import { getGuardrailsContent } from "../../lib/phase112Productization";

const LEGACY_OWNERS = Object.freeze([
  { module: "@/components/productization/Phase11ProductPanels", responsibility: "approved journal interaction" },
  { module: "@/components/productization/TeoyubeAppStateProvider", responsibility: "local journal state" }
] as const);

export function createJournalLegacyAdapter(bridge: LegacyCapabilityBridge<"journal">) {
  return createLegacyCapabilityAdapter("journal", LEGACY_OWNERS, bridge);
}

export function getApprovedJournalGuardrails() {
  const guardrails = getGuardrailsContent();
  return Object.freeze({ title: guardrails.title, points: Object.freeze(guardrails.points.slice(0, 5)) });
}
