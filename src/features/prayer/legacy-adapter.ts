import type { LegacyCapabilityBridge } from "../../shared/contracts/legacy-capability-bridge";
import { createLegacyCapabilityAdapter } from "../../shared/utilities/create-legacy-capability-adapter";

const LEGACY_OWNERS = Object.freeze([
  { module: "@/components/PrayerCompanion", responsibility: "approved prayer interaction" },
  { module: "@/lib/teoyube/adapters/prayer-companion-adapter", responsibility: "legacy prayer context" }
] as const);

export function createPrayerLegacyAdapter(bridge: LegacyCapabilityBridge<"prayer">) {
  return createLegacyCapabilityAdapter("prayer", LEGACY_OWNERS, bridge);
}
