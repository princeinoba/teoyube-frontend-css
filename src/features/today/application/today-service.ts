import type { TodayAction, TodayViewModel } from "../contracts";
import {
  LOCAL_MEDIA_SOURCE_NOTICE,
  TODAY_ASSIGNMENT_ITEMS,
  TODAY_PREVIEW_SLIDES,
  TODAY_PROMISE_SLIDES,
  TODAY_SEARCH_SUGGESTIONS,
  TODAY_STORIES
} from "../today-data";

function wrap(index: number, length: number): number {
  return ((index % length) + length) % length;
}

function status(query: string, count: number): string {
  return `Showing ${count} local TeoyubeWorld preview${count === 1 ? "" : "s"} for "${query}". ${LOCAL_MEDIA_SOURCE_NOTICE}`;
}

export function createTodayViewModel(scriptureReference = "Ephesians 1:18"): TodayViewModel {
  return Object.freeze({
    capability: "today",
    promiseSlides: TODAY_PROMISE_SLIDES,
    previewSlides: TODAY_PREVIEW_SLIDES,
    activePromiseSlide: 0,
    stories: TODAY_STORIES,
    activeStoryIndex: 0,
    searchQuery: "TeoyubeWorld",
    activeWorldQuery: "TeoyubeWorld",
    searchSuggestions: TODAY_SEARCH_SUGGESTIONS,
    movieStatus: status("TeoyubeWorld", TODAY_STORIES.length),
    dailyWord: {
      word: "TIDUILOVP",
      meaning: "A prayer-memory key for Trust, instruction, direction, order, voice, path."
    },
    assignmentItems: TODAY_ASSIGNMENT_ITEMS,
    reflection: "",
    assignmentCompleted: false,
    sourcePreviewOpened: false,
    tigCompatibility: {
      source: "legacy-deterministic-tig" as const,
      scriptureReference,
      externalServicesRequired: false as const
    }
  });
}

export function reduceTodayViewModel(model: TodayViewModel, action: TodayAction): TodayViewModel {
  switch (action.type) {
    case "promise.previous":
      return { ...model, activePromiseSlide: wrap(model.activePromiseSlide - 1, model.promiseSlides.length) };
    case "promise.next":
      return { ...model, activePromiseSlide: wrap(model.activePromiseSlide + 1, model.promiseSlides.length) };
    case "promise.select":
      return { ...model, activePromiseSlide: wrap(action.index, model.promiseSlides.length) };
    case "story.previous":
      return { ...model, activeStoryIndex: wrap(model.activeStoryIndex - 1, model.stories.length) };
    case "story.next":
      return { ...model, activeStoryIndex: wrap(model.activeStoryIndex + 1, model.stories.length) };
    case "story.select":
      return { ...model, activeStoryIndex: wrap(action.index, model.stories.length) };
    case "search.query":
      return { ...model, searchQuery: action.query };
    case "search.submit": {
      const query = action.query.trim() || "TeoyubeWorld";
      return {
        ...model,
        searchQuery: query,
        activeWorldQuery: query,
        activeStoryIndex: 0,
        movieStatus: status(query, model.stories.length)
      };
    }
    case "search.suggestions.clear":
      return { ...model, searchSuggestions: [] };
    case "reflection.change":
      return { ...model, reflection: action.value };
    case "assignment.complete":
      return { ...model, reflection: "", assignmentCompleted: true };
    case "media.preview":
      return {
        ...model,
        sourcePreviewOpened: true,
        movieStatus: `TeoyubeWorld highlight: ${LOCAL_MEDIA_SOURCE_NOTICE}`
      };
  }
}
