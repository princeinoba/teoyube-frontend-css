import { describe, expect, it, vi } from "vitest";
import { CAPABILITY_IDS, type CapabilityId } from "../../src/domain/capabilities/contracts";
import { createBookFeature, createBookLegacyAdapter } from "../../src/features/book";
import { createCallingFeature, createCallingLegacyAdapter } from "../../src/features/calling";
import { createConsentFeature, createConsentLegacyAdapter } from "../../src/features/consent";
import { createJournalFeature, createJournalLegacyAdapter } from "../../src/features/journal";
import { createJourneyFeature, createJourneyLegacyAdapter } from "../../src/features/journey";
import { createLexiconFeature, createLexiconLegacyAdapter } from "../../src/features/lexicon";
import { createMediaFeature, createMediaLegacyAdapter } from "../../src/features/media";
import { createMemoryFeature, createMemoryLegacyAdapter } from "../../src/features/memory";
import { createPrayerFeature, createPrayerLegacyAdapter } from "../../src/features/prayer";
import { createPromisesFeature, createPromisesLegacyAdapter } from "../../src/features/promises";
import { createScriptureFeature, createScriptureLegacyAdapter } from "../../src/features/scripture";
import { createSearchFeature, createSearchLegacyAdapter } from "../../src/features/search";
import { createSettingsFeature, createSettingsLegacyAdapter } from "../../src/features/settings";
import { createTeoGuideFeature, createTeoGuideLegacyAdapter } from "../../src/features/teo-guide";
import { createTestimonyFeature, createTestimonyLegacyAdapter } from "../../src/features/testimony";
import { createTodayFeature, createTodayLegacyAdapter } from "../../src/features/today";

const factories = {
  today: [createTodayLegacyAdapter, createTodayFeature],
  search: [createSearchLegacyAdapter, createSearchFeature],
  scripture: [createScriptureLegacyAdapter, createScriptureFeature],
  promises: [createPromisesLegacyAdapter, createPromisesFeature],
  prayer: [createPrayerLegacyAdapter, createPrayerFeature],
  calling: [createCallingLegacyAdapter, createCallingFeature],
  journey: [createJourneyLegacyAdapter, createJourneyFeature],
  journal: [createJournalLegacyAdapter, createJournalFeature],
  testimony: [createTestimonyLegacyAdapter, createTestimonyFeature],
  book: [createBookLegacyAdapter, createBookFeature],
  lexicon: [createLexiconLegacyAdapter, createLexiconFeature],
  "teo-guide": [createTeoGuideLegacyAdapter, createTeoGuideFeature],
  media: [createMediaLegacyAdapter, createMediaFeature],
  settings: [createSettingsLegacyAdapter, createSettingsFeature],
  consent: [createConsentLegacyAdapter, createConsentFeature],
  memory: [createMemoryLegacyAdapter, createMemoryFeature]
} as const;

describe("feature-oriented compatibility boundaries", () => {
  it("publishes every target capability", () => {
    expect(Object.keys(factories)).toEqual([...CAPABILITY_IDS]);
  });

  it.each(CAPABILITY_IDS)("keeps %s legacy behavior behind its typed adapter", (capability) => {
    const dispatch = vi.fn();
    const [createAdapter, createFeature] = factories[capability] as readonly [
      (bridge: { read(): { capability: CapabilityId; data: Readonly<Record<string, unknown>> }; dispatch: typeof dispatch }) => ReturnType<typeof createTodayLegacyAdapter>,
      (port: ReturnType<typeof createTodayLegacyAdapter>) => ReturnType<typeof createTodayFeature>
    ];
    const adapter = createAdapter({
      read: () => ({ capability, data: { source: "legacy" } }),
      dispatch
    });
    const feature = createFeature(adapter);

    expect(feature.getViewModel()).toEqual({ capability, data: { source: "legacy" } });
    expect(adapter.kind).toBe("legacy-compatibility-adapter");
    expect(adapter.owners.length).toBeGreaterThan(0);

    const event = { capability, action: "load" } as Parameters<typeof feature.handle>[0];
    feature.handle(event);
    expect(dispatch).toHaveBeenCalledWith(event);
  });
});
