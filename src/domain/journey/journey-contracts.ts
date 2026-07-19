export type JourneySeedDto = Readonly<{
  id: string;
  title: string;
  summary: string;
  scriptureReferences: readonly string[];
  explanationPath: readonly string[];
}>;

export type JourneyLevelDto = Readonly<{
  id: string;
  name: string;
  description: string;
}>;

export type JourneyPageViewModel = Readonly<{
  journeys: readonly JourneySeedDto[];
  levels: readonly JourneyLevelDto[];
  guardrails: readonly string[];
  limitations: readonly string[];
  finalUnifiedDailyLoopEnabled: false;
}>;
