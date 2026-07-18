import type { LegacyCapabilityBridge } from "../../shared/contracts/legacy-capability-bridge";
import { createLegacyCapabilityAdapter } from "../../shared/utilities/create-legacy-capability-adapter";

const LEGACY_OWNERS = Object.freeze([
  { module: "@/components/productization/Phase112ScreenshotApp", responsibility: "approved Lexicon composition" },
  { module: "@/lib/teoyube/data-access", responsibility: "lexicon lookup behavior" }
] as const);

export function createLexiconLegacyAdapter(bridge: LegacyCapabilityBridge<"lexicon">) {
  return createLegacyCapabilityAdapter("lexicon", LEGACY_OWNERS, bridge);
}
