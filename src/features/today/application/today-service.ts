import type { TodayAction, TodayViewModel } from "../contracts";
import {
  LOCAL_MEDIA_SOURCE_NOTICE,
  TODAY_ASSIGNMENT_ITEMS,
  TODAY_PREVIEW_SLIDES,
  TODAY_PROMISE_SLIDES,
  TODAY_SEARCH_SUGGESTIONS,
  TODAY_STORIES
} from "../today-data";
import { isTodayStoryPlayable } from "../today-youtube";

function wrap(index: number, length: number): number {
  return ((index % length) + length) % length;
}

function status(query: string, count: number): string {
  const playableCount = TODAY_STORIES.filter(isTodayStoryPlayable).length;
  return `Showing ${count} TeoyubeWorld feed item${count === 1 ? "" : "s"} for "${query}". ${playableCount} verified official-channel video${playableCount === 1 ? "" : "s"} available.`;
}

function idlePlayback(model: TodayViewModel, activeStoryIndex: number): TodayViewModel {
  return {
    ...model,
    activeStoryIndex,
    sourcePreviewOpened: false,
    activePlaybackStoryId: null,
    playbackState: "idle"
  };
}

function playableStoryIndices(model: TodayViewModel): number[] {
  return model.stories.reduce<number[]>((indices, story, index) => {
    if (isTodayStoryPlayable(story)) indices.push(index);
    return indices;
  }, []);
}

function playStoryAt(model: TodayViewModel, index: number): TodayViewModel {
  const story = model.stories[index];
  if (!isTodayStoryPlayable(story)) {
    return {
      ...model,
      movieStatus:
        story?.playbackUnavailableReason ||
        "This TeoyubeWorld feed item is unavailable for embedded playback."
    };
  }
  return {
    ...model,
    activeStoryIndex: index,
    sourcePreviewOpened: true,
    activePlaybackStoryId: story.id,
    playbackState: "loading",
    movieStatus: `Loading "${story.title}" from the official TeoyubeWorld channel.`
  };
}

function playAdjacentStory(model: TodayViewModel, direction: -1 | 1): TodayViewModel {
  const playable = playableStoryIndices(model);
  if (playable.length === 0) return model;
  const currentPosition = playable.indexOf(model.activeStoryIndex);
  const startingPosition = currentPosition >= 0 ? currentPosition : 0;
  const nextPosition = wrap(startingPosition + direction, playable.length);
  return playStoryAt(model, playable[nextPosition]);
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
    activePlaybackStoryId: null,
    playbackState: "idle",
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
      return idlePlayback(model, wrap(model.activeStoryIndex - 1, model.stories.length));
    case "story.next":
      return idlePlayback(model, wrap(model.activeStoryIndex + 1, model.stories.length));
    case "story.select":
      return idlePlayback(model, wrap(action.index, model.stories.length));
    case "story.play": {
      const index = model.stories.findIndex((story) => story.id === action.storyId);
      return index >= 0 ? playStoryAt(model, index) : model;
    }
    case "story.play.previous":
      return playAdjacentStory(model, -1);
    case "story.play.next":
      return playAdjacentStory(model, 1);
    case "search.query":
      return { ...model, searchQuery: action.query };
    case "search.submit": {
      const query = action.query.trim() || "TeoyubeWorld";
      return {
        ...model,
        searchQuery: query,
        activeWorldQuery: query,
        activeStoryIndex: 0,
        sourcePreviewOpened: false,
        activePlaybackStoryId: null,
        playbackState: "idle",
        movieStatus: status(query, model.stories.length)
      };
    }
    case "search.suggestions.clear":
      return { ...model, searchSuggestions: [] };
    case "reflection.change":
      return { ...model, reflection: action.value };
    case "assignment.complete":
      return { ...model, reflection: "", assignmentCompleted: true };
    case "media.preview": {
      const activeIndex = isTodayStoryPlayable(model.stories[model.activeStoryIndex])
        ? model.activeStoryIndex
        : playableStoryIndices(model)[0] ?? model.activeStoryIndex;
      return playStoryAt(model, activeIndex);
    }
    case "media.ready": {
      const story = model.stories[model.activeStoryIndex];
      return {
        ...model,
        playbackState: "playing",
        movieStatus: story
          ? `Playing "${story.title}". ${LOCAL_MEDIA_SOURCE_NOTICE}`
          : LOCAL_MEDIA_SOURCE_NOTICE
      };
    }
    case "media.error":
      return {
        ...model,
        sourcePreviewOpened: false,
        activePlaybackStoryId: null,
        playbackState: "error",
        movieStatus:
          "The official TeoyubeWorld video could not be loaded. The feed item remains selected."
      };
  }
}
