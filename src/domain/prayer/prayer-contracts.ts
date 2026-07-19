export type PrayerSelectionRowDto = Readonly<{
  label: string;
  value: string;
}>;

export type PrayerGraphNodeDto = Readonly<{
  id: string;
  label: string;
  type: string;
}>;

export type PrayerGraphEdgeDto = Readonly<{
  source: string;
  target: string;
  label: string;
}>;

export type PrayerProductionDto = Readonly<{
  responseTitle: string;
  responseSubtitle: string;
  selectionRows: readonly PrayerSelectionRowDto[];
  confidenceLabel: string;
  confidenceScore: number;
  fallbackUsed: boolean;
  fallbackReason: string;
  graphNodes: readonly PrayerGraphNodeDto[];
  graphEdges: readonly PrayerGraphEdgeDto[];
  listFallbackAvailable: boolean;
  explanationItems: readonly string[];
}>;

export type PrayerReplyDto = Readonly<{
  cluster: string;
  response: string;
  scriptureAnchor: string;
  prayer: string;
  journalPrompt: string;
  confidenceLabel: string;
  fallbackUsed: boolean;
  safetyStatus: string;
  explanationPath: readonly string[];
  devotionalBoundary: string;
}>;

export type PrayerCardDto = Readonly<{
  id: string;
  name: string;
  category: string;
  sequence: readonly string[];
  scriptureAnchor: string;
  prayer: string;
}>;

export type PrayerPageViewModel = Readonly<{
  production: PrayerProductionDto;
  journeyStage: string;
  journeyConfidence: string;
  journeyTraceStepCount: number;
  journeyScriptureAnchors: readonly string[];
  safetyRows: readonly Readonly<{ id: string; scripture: string; prayer: string }>[];
  prayerCards: readonly PrayerCardDto[];
}>;
