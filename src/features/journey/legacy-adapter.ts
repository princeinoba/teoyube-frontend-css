import type { LegacyCapabilityBridge } from "../../shared/contracts/legacy-capability-bridge";
import { createLegacyCapabilityAdapter } from "../../shared/utilities/create-legacy-capability-adapter";
import { getGuardrailsContent } from "../../lib/phase112Productization";

const LEGACY_OWNERS = Object.freeze([
  { module: "@/lib/teoyube/journey/journey-page-integration", responsibility: "legacy journey page contract" },
  { module: "@/lib/teoyube/journey/user-journey-orchestrator", responsibility: "journey transitions" }
] as const);

export function createJourneyLegacyAdapter(bridge: LegacyCapabilityBridge<"journey">) {
  return createLegacyCapabilityAdapter("journey", LEGACY_OWNERS, bridge);
}

export function getApprovedJourneyGuardrails() {
  return getGuardrailsContent().points.slice(0, 5);
}
