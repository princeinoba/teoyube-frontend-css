import type {
  TeoyubePersonalizationConsent,
  TeoyubePersonalizationContext
} from "./personalization-contracts";
import {
  createPersonalizationContext,
  getPersonalizedTigRecommendationHints
} from "./personalization-engine";
import { validateSignalStoreConsent } from "./personalization-signal-store-safety";
import { queryTeoyubePersonalizationSignals } from "./personalization-signal-store";
import type {
  TeoyubeSignalStoreAdapter,
  TeoyubeSignalStoreQuery
} from "./personalization-signal-store-contracts";
import { summarizeSignalPatterns } from "./personalization-signal-query";

export function createPersonalizationContextFromSignalStore(
  store: TeoyubeSignalStoreAdapter,
  query: TeoyubeSignalStoreQuery = {},
  consent?: Partial<TeoyubePersonalizationConsent>
): TeoyubePersonalizationContext {
  const consentStatus = validateSignalStoreConsent(consent);
  const records = consentStatus.allowed
    ? queryTeoyubePersonalizationSignals(store, query).data
    : [];

  return createPersonalizationContext({
    consent: consentStatus.consent,
    signals: records.map((record) => record.signal)
  });
}

export function createPersonalizationHintsFromSignalStore(
  store: TeoyubeSignalStoreAdapter,
  query: TeoyubeSignalStoreQuery = {},
  consent?: Partial<TeoyubePersonalizationConsent>
): string[] {
  const context = createPersonalizationContextFromSignalStore(store, query, consent);
  return getPersonalizedTigRecommendationHints(context);
}

export function summarizeUserPatternPreviewFromSignalStore(
  store: TeoyubeSignalStoreAdapter,
  query: TeoyubeSignalStoreQuery = {},
  consent?: Partial<TeoyubePersonalizationConsent>
): {
  signalCount: number;
  repeatedEmotionTags: Array<{ value: string; count: number }>;
  repeatedSelectedWords: Array<{ value: string; count: number }>;
  repeatedPromiseClusters: Array<{ value: string; count: number }>;
  repeatedSurfaces: Array<{ value: string; count: number }>;
  fallbackFrequency: number;
  confidencePattern: Record<string, number>;
  scriptureThemes: Array<{ value: string; count: number }>;
  hints: string[];
  explanation: string;
} {
  const consentStatus = validateSignalStoreConsent(consent);
  const records = consentStatus.allowed
    ? queryTeoyubePersonalizationSignals(store, query).data
    : [];
  const summary = summarizeSignalPatterns(records);
  const confidencePattern = records.reduce<Record<string, number>>((groups, record) => {
    const label = record.signal.confidenceLabel || "unknown";
    groups[label] = (groups[label] || 0) + 1;
    return groups;
  }, {});

  return {
    signalCount: records.length,
    repeatedEmotionTags: summary.topEmotions,
    repeatedSelectedWords: summary.topSelectedWords,
    repeatedPromiseClusters: summary.topPromiseClusters,
    repeatedSurfaces: summary.topSurfaces,
    fallbackFrequency: summary.fallbackCount,
    confidencePattern,
    scriptureThemes: summary.topScriptureReferences,
    hints: createPersonalizationHintsFromSignalStore(store, query, consentStatus.consent),
    explanation:
      "This preview summarizes safe structured signals only. It does not make spiritual claims, store raw text, or override Scripture anchors."
  };
}
