import type {
  TeoyubePersonalizationSignal,
  TeoyubePersonalizationSummary
} from "./personalization-contracts";
import { summarizeTeoyubePersonalizationSignals } from "./personalization-signals";
import type { TigConfidenceLabel } from "./intelligence-confidence";
import type { TigProductionSurface } from "./production-response-contracts";
import type { TeoyubeSignalStoreRecord } from "./personalization-signal-store-contracts";

type SignalSource = TeoyubePersonalizationSignal | TeoyubeSignalStoreRecord;

function signalOf(item: SignalSource): TeoyubePersonalizationSignal {
  return "signal" in item ? item.signal : item;
}

function groupByValue(values: Array<string | undefined>): Record<string, number> {
  return values.reduce<Record<string, number>>((groups, value) => {
    if (!value) return groups;
    groups[value] = (groups[value] || 0) + 1;
    return groups;
  }, {});
}

function toSortedCounts(groups: Record<string, number>): Array<{ value: string; count: number }> {
  return Object.entries(groups)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

export function filterSignalsBySurface<TSignal extends SignalSource>(
  signals: TSignal[],
  surface: TigProductionSurface
): TSignal[] {
  return signals.filter((signal) => signalOf(signal).surface === surface);
}

export function filterSignalsByEmotion<TSignal extends SignalSource>(
  signals: TSignal[],
  emotion: string
): TSignal[] {
  const normalized = emotion.trim().toLowerCase();
  return signals.filter((signal) => signalOf(signal).emotionTag?.toLowerCase() === normalized);
}

export function filterSignalsByIntent<TSignal extends SignalSource>(
  signals: TSignal[],
  intent: string
): TSignal[] {
  const normalized = intent.trim().toLowerCase();
  return signals.filter((signal) => signalOf(signal).intent?.toLowerCase() === normalized);
}

export function filterSignalsByWordId<TSignal extends SignalSource>(
  signals: TSignal[],
  wordId: string
): TSignal[] {
  return signals.filter((signal) => signalOf(signal).selectedWordId === wordId);
}

export function filterSignalsByClusterId<TSignal extends SignalSource>(
  signals: TSignal[],
  clusterId: string
): TSignal[] {
  return signals.filter((signal) => signalOf(signal).selectedClusterId === clusterId);
}

export function filterSignalsByFallbackUsed<TSignal extends SignalSource>(
  signals: TSignal[],
  fallbackUsed: boolean
): TSignal[] {
  return signals.filter((signal) => signalOf(signal).fallbackUsed === fallbackUsed);
}

export function filterSignalsByConfidenceLabel<TSignal extends SignalSource>(
  signals: TSignal[],
  confidenceLabel: TigConfidenceLabel
): TSignal[] {
  return signals.filter((signal) => signalOf(signal).confidenceLabel === confidenceLabel);
}

export function groupSignalsBySurface(
  signals: SignalSource[]
): Record<string, number> {
  return groupByValue(signals.map((signal) => signalOf(signal).surface));
}

export function groupSignalsByEmotion(
  signals: SignalSource[]
): Record<string, number> {
  return groupByValue(signals.map((signal) => signalOf(signal).emotionTag));
}

export function groupSignalsBySelectedWord(
  signals: SignalSource[]
): Record<string, number> {
  return groupByValue(signals.map((signal) => signalOf(signal).selectedWordId));
}

export function groupSignalsByPromiseCluster(
  signals: SignalSource[]
): Record<string, number> {
  return groupByValue(signals.map((signal) => signalOf(signal).selectedClusterId));
}

export function summarizeSignalPatterns(signals: SignalSource[]): TeoyubePersonalizationSummary & {
  surfaceGroups: Record<string, number>;
  emotionGroups: Record<string, number>;
  selectedWordGroups: Record<string, number>;
  promiseClusterGroups: Record<string, number>;
  topSurfaces: Array<{ value: string; count: number }>;
  topEmotions: Array<{ value: string; count: number }>;
  topSelectedWords: Array<{ value: string; count: number }>;
  topPromiseClusters: Array<{ value: string; count: number }>;
} {
  const plainSignals = signals.map(signalOf);
  const surfaceGroups = groupSignalsBySurface(signals);
  const emotionGroups = groupSignalsByEmotion(signals);
  const selectedWordGroups = groupSignalsBySelectedWord(signals);
  const promiseClusterGroups = groupSignalsByPromiseCluster(signals);

  return {
    ...summarizeTeoyubePersonalizationSignals(plainSignals),
    surfaceGroups,
    emotionGroups,
    selectedWordGroups,
    promiseClusterGroups,
    topSurfaces: toSortedCounts(surfaceGroups),
    topEmotions: toSortedCounts(emotionGroups),
    topSelectedWords: toSortedCounts(selectedWordGroups),
    topPromiseClusters: toSortedCounts(promiseClusterGroups)
  };
}
