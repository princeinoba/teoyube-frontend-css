import { describe, expect, it } from "vitest";
import { createApprovedTodayViewModel } from "../../src/features/today/legacy-adapter";
import { createTodayViewModel, reduceTodayViewModel } from "../../src/features/today/application/today-service";

describe("Today view-model boundary", () => {
  it("maps the approved deterministic default without external services", () => {
    const model = createApprovedTodayViewModel();
    expect(model.capability).toBe("today");
    expect(model.promiseSlides).toHaveLength(12);
    expect(model.previewSlides).toHaveLength(5);
    expect(model.stories).toHaveLength(8);
    expect(model.activePromiseSlide).toBe(0);
    expect(model.activeStoryIndex).toBe(0);
    expect(model.searchQuery).toBe("TeoyubeWorld");
    expect(model.searchSuggestions).toEqual(["Romans 8:28-30", "TeoyubeWorld", "Scripture teaching", "prayer video", "calling video"]);
    expect(model.dailyWord.word).toBe("TIDUILOVP");
    expect(model.assignmentItems).toEqual([
      "Scripture: Read Romans 8:28-30 and Romans 8:28-30.",
      'Prayer: Pray this framework: "Father, make me chosen, called, and sent into divine purpose."',
      "Calling: Name one gift, burden, or skill that connects to Creative Digital Ministry.",
      "Action: Pray through Benor -> Arion -> Luma -> Taviel and journal one reflection connected to Calling & Purpose."
    ]);
    expect(model.tigCompatibility).toMatchObject({
      source: "legacy-deterministic-tig",
      scriptureReference: "Psalm 84:1-2",
      externalServicesRequired: false
    });
  });

  it("keeps carousel, story, search, and reflection transitions deterministic", () => {
    let model = createTodayViewModel("Romans 8:28-30");
    model = reduceTodayViewModel(model, { type: "promise.previous" });
    expect(model.activePromiseSlide).toBe(11);
    model = reduceTodayViewModel(model, { type: "promise.next" });
    expect(model.activePromiseSlide).toBe(0);
    model = reduceTodayViewModel(model, { type: "promise.select", index: 4 });
    expect(model.activePromiseSlide).toBe(4);
    model = reduceTodayViewModel(model, { type: "story.previous" });
    expect(model.activeStoryIndex).toBe(7);
    model = reduceTodayViewModel(model, { type: "story.select", index: 2 });
    expect(model.activeStoryIndex).toBe(2);
    model = reduceTodayViewModel(model, { type: "search.submit", query: "  TeoyubeWorld teachings  " });
    expect(model).toMatchObject({ searchQuery: "TeoyubeWorld teachings", activeWorldQuery: "TeoyubeWorld teachings", activeStoryIndex: 0 });
    expect(model.movieStatus).toContain('8 TeoyubeWorld feed items for "TeoyubeWorld teachings"');
    expect(model.movieStatus).toContain("1 verified official-channel video available");
    model = reduceTodayViewModel(model, { type: "reflection.change", value: "A voluntary reflection" });
    expect(model.reflection).toBe("A voluntary reflection");
    model = reduceTodayViewModel(model, { type: "assignment.complete" });
    expect(model.reflection).toBe("");
    expect(model.assignmentCompleted).toBe(true);
  });
});
