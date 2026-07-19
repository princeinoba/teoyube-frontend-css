import type { LegacyCapabilityBridge } from "../../shared/contracts/legacy-capability-bridge";
import { createLegacyCapabilityAdapter } from "../../shared/utilities/create-legacy-capability-adapter";
import { createPromiseTableRows } from "../../lib/phase112Productization";
import { runPhase11TigSurface } from "../../lib/phase11Productization";

const LEGACY_OWNERS = Object.freeze([
  { module: "@/components/PrayerCompanion", responsibility: "approved prayer interaction" },
  { module: "@/lib/teoyube/adapters/prayer-companion-adapter", responsibility: "legacy prayer context" }
] as const);

export function createPrayerLegacyAdapter(bridge: LegacyCapabilityBridge<"prayer">) {
  return createLegacyCapabilityAdapter("prayer", LEGACY_OWNERS, bridge);
}

export function runApprovedLegacyPrayerSurface(input: string, context: Readonly<Record<string, unknown>>) {
  return runPhase11TigSurface("prayer", input, context);
}

export function createApprovedPrayerSafetyRows() {
  return createPromiseTableRows(2);
}
