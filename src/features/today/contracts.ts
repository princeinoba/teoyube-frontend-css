export type TodayPromiseSlide = Readonly<{
  title: string;
  kicker: string;
  theme: string;
  description: string;
  scriptures: readonly string[];
  cta: string;
  secondaryCta: string;
  artwork: string;
  image: string;
}>;

export type TodayPreviewSlide = Readonly<{
  title: string;
  theme: string;
  image: string;
  position: string;
}>;

export type TodayStory = Readonly<{
  id: string;
  category: string;
  source: string;
  time: string;
  title: string;
  description: string;
  image: string;
  cta: string;
  secondaryCta: string;
}>;

export type TodayJourneyMoment = Readonly<{
  stage: "check_in" | "daily_assignment" | "tomorrow";
  progressPercent: number;
  reflectionPlaceholder: string;
  primaryLabel: string;
  progressItems: readonly Readonly<{ label: string; complete: boolean }>[];
}>;

export type TodayViewModel = Readonly<{
  capability: "today";
  promiseSlides: readonly TodayPromiseSlide[];
  previewSlides: readonly TodayPreviewSlide[];
  activePromiseSlide: number;
  stories: readonly TodayStory[];
  activeStoryIndex: number;
  searchQuery: string;
  activeWorldQuery: string;
  searchSuggestions: readonly string[];
  movieStatus: string;
  dailyWord: Readonly<{ word: string; meaning: string }>;
  assignmentItems: readonly string[];
  reflection: string;
  assignmentCompleted: boolean;
  sourcePreviewOpened: boolean;
  journeyMoment?: TodayJourneyMoment;
  tigCompatibility: Readonly<{
    source: "legacy-deterministic-tig";
    scriptureReference: string;
    externalServicesRequired: false;
  }>;
}>;

export type TodayAction =
  | Readonly<{ type: "promise.previous" }>
  | Readonly<{ type: "promise.next" }>
  | Readonly<{ type: "promise.select"; index: number }>
  | Readonly<{ type: "story.previous" }>
  | Readonly<{ type: "story.next" }>
  | Readonly<{ type: "story.select"; index: number }>
  | Readonly<{ type: "search.query"; query: string }>
  | Readonly<{ type: "search.submit"; query: string }>
  | Readonly<{ type: "search.suggestions.clear" }>
  | Readonly<{ type: "reflection.change"; value: string }>
  | Readonly<{ type: "assignment.complete" }>
  | Readonly<{ type: "media.preview" }>;

export type TodayViewActions = Readonly<{
  previousPromise(): void;
  nextPromise(): void;
  selectPromise(index: number): void;
  previousStory(): void;
  nextStory(): void;
  selectStory(index: number): void;
  changeSearchQuery(query: string): void;
  submitSearch(query: string): void;
  loadSearchSuggestion(query: string): void;
  clearSearchSuggestions(): void;
  changeReflection(value: string): void;
  completeAssignment(): void;
  openPrayerFramework(): void;
  previewSource(): void;
  activatePromiseAction(label: string): void;
  setPromisePaused(paused: boolean): void;
  setStoryPaused(paused: boolean): void;
}>;
