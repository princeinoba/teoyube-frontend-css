import type { JourneyPageViewModel, JourneySeedDto } from "../../../domain/journey/journey-contracts";
import { getGrowthLevels, getPrayerJourneys } from "../../../lib/teoyube/data-access";
import { getApprovedJourneyGuardrails } from "../legacy-adapter";

type LegacyRecord = Readonly<Record<string, unknown>>;

function text(record: LegacyRecord, key: string) {
  return typeof record[key] === "string" ? record[key] : "";
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function normalizeJourney(record: LegacyRecord, index: number): JourneySeedDto {
  const title = text(record, "title") || text(record, "name") || `Journey ${index + 1}`;
  return Object.freeze({
    id: text(record, "id") || `journey-${index + 1}`,
    title,
    summary: text(record, "summary") || text(record, "description") || "Local journey seed ready for review.",
    scriptureReferences: Object.freeze([
      ...stringArray(record.scriptureReferences),
      ...stringArray(record.scriptureAnchors)
    ]),
    explanationPath: Object.freeze(["Existing local journey seed selected.", "Scripture remains the authority for every later transition."])
  });
}

export function createJourneyPageViewModel(): JourneyPageViewModel {
  const journeys = (getPrayerJourneys() as LegacyRecord[]).slice(0, 4).map(normalizeJourney);
  const levels = (getGrowthLevels() as LegacyRecord[]).slice(0, 4).map((level, index) => Object.freeze({
    id: text(level, "id") || `level-${index + 1}`,
    name: text(level, "name") || text(level, "title") || `Level ${index + 1}`,
    description: text(level, "description") || text(level, "summary") || "Growth step prepared locally."
  }));
  return Object.freeze({
    journeys: Object.freeze(journeys),
    levels: Object.freeze(levels),
    guardrails: Object.freeze(getApprovedJourneyGuardrails()),
    limitations: Object.freeze([
      "No live AI orchestration, analytics, accounts, payments, automatic contact, or database persistence is connected.",
      "Personalization is session-only and explainable; raw private text is not exported or stored in browser persistence.",
      "Calling and prayer language remains devotional, cautious, and Scripture-reviewable."
    ]),
    finalUnifiedDailyLoopEnabled: true
  });
}
