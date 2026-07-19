import { createPrayerTigProductionInput } from "../../../lib/tig/production-surface-adapters";
import { createPrayerCompanionAdapterContext } from "../../../lib/teoyube/adapters/prayer-companion-adapter";
import { createJourneyPageProps } from "../../../lib/teoyube/journey/journey-page-integration";
import { getPrayers } from "../../../lib/teoyube/teoyubeData";
import type { PrayerCardDto, PrayerPageViewModel, PrayerReplyDto } from "../../../domain/prayer/prayer-contracts";
import { createApprovedPrayerSafetyRows, runApprovedLegacyPrayerSurface } from "../legacy-adapter";

type LegacyPrayer = Readonly<{
  id?: string;
  name?: string;
  category?: string;
  sequence?: readonly string[];
  scriptureAnchor?: string;
  prayer?: string;
}>;

function normalizePrayerCard(prayer: LegacyPrayer, index: number): PrayerCardDto {
  return Object.freeze({
    id: prayer.id || `prayer-${index + 1}`,
    name: prayer.name || `Prayer ${index + 1}`,
    category: prayer.category || "Prayer",
    sequence: Object.freeze([...(prayer.sequence || [])]),
    scriptureAnchor: prayer.scriptureAnchor || "",
    prayer: prayer.prayer || ""
  });
}

export function createPrayerReplyDto(message: string): PrayerReplyDto {
  const safeMessage = message.trim().slice(0, 2_000) || "I need Scripture-grounded prayer and direction.";
  const context = createPrayerCompanionAdapterContext({ message: safeMessage });
  const reply = context.safeDisplayData;
  return Object.freeze({
    cluster: reply.cluster,
    response: reply.response,
    scriptureAnchor: reply.scriptureAnchor || "",
    prayer: reply.prayer,
    journalPrompt: reply.journalPrompt,
    confidenceLabel: reply.confidenceLabel || "available after graph match",
    fallbackUsed: reply.fallbackUsed,
    safetyStatus: reply.safetyStatus || "safe",
    explanationPath: Object.freeze([...(reply.explanationPath || [])]),
    devotionalBoundary: "Prayer guidance is framed as Scripture-grounded encouragement, not divine certainty or professional advice."
  });
}

export function createPrayerPageViewModel(): PrayerPageViewModel {
  const prayers = getPrayers() as readonly LegacyPrayer[];
  const focusPrayer = prayers[0];
  const context = createPrayerCompanionAdapterContext({
    message: focusPrayer?.prayer || focusPrayer?.name || "Scripture-grounded prayer"
  });
  const cluster = context.recommendation.clusters[0];
  const journeyPage = createJourneyPageProps({
    surface: "prayer_companion",
    prayerInput: focusPrayer?.prayer || focusPrayer?.name || "Scripture-grounded prayer",
    clusterId: cluster?.id,
    safeDisplayLabel: "Prayer companion journey"
  });
  const productionInput = createPrayerTigProductionInput({
    input: `Prayer companion request connected to ${focusPrayer?.name || "Scripture-grounded prayer"}.`,
    userState: "needing prayerful encouragement without divine-certainty claims",
    selectedWordId: cluster?.coreWords[0],
    selectedClusterId: cluster?.id,
    context: {
      legacyPrayerId: focusPrayer?.id,
      legacyPrayerName: focusPrayer?.name,
      scriptureAnchor: context.safeDisplayData.scriptureAnchor,
      explanationPath: context.safeDisplayData.explanationPath,
      phase33Source: "promise_engine_prayer_adapter"
    }
  });
  const production = runApprovedLegacyPrayerSurface(
    String(productionInput.input || "I need direction."),
    productionInput.context || {}
  );
  const safetyRows = createApprovedPrayerSafetyRows();

  return Object.freeze({
    production: Object.freeze({
      responseTitle: production.responsePanel.title,
      responseSubtitle: production.responsePanel.subtitle,
      selectionRows: Object.freeze(production.responsePanel.selectionRows.map((row) => Object.freeze({ label: row.label, value: row.value }))),
      confidenceLabel: production.responsePanel.confidence.label,
      confidenceScore: production.responsePanel.confidence.score,
      fallbackUsed: production.responsePanel.fallback.used,
      fallbackReason: production.responsePanel.fallback.reason,
      graphNodes: Object.freeze(production.graphPanel.nodes.map((node) => Object.freeze({ id: node.id, label: node.label, type: node.type }))),
      graphEdges: Object.freeze(production.graphPanel.edges.map((edge) => Object.freeze({ source: edge.source, target: edge.target, label: edge.label }))),
      listFallbackAvailable: production.graphPanel.listFallbackAvailable,
      explanationItems: Object.freeze([...production.explanationPanel.items])
    }),
    journeyStage: journeyPage.report.stage,
    journeyConfidence: journeyPage.report.confidenceLabel || "needs_review",
    journeyTraceStepCount: journeyPage.report.explanationTraceStepCount,
    journeyScriptureAnchors: Object.freeze([...journeyPage.journey.scriptureAnchors]),
    safetyRows: Object.freeze(safetyRows.map((row) => Object.freeze({ id: row.id, scripture: row.scripture, prayer: row.prayer }))),
    prayerCards: Object.freeze(prayers.map(normalizePrayerCard))
  });
}
