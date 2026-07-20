import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  DAILY_SPIRITUAL_LOOP_STAGES,
  applyDailySpiritualLoopAction,
  createDailySpiritualLoopState,
  getDailySpiritualLoopActionPolicy,
  measureDailySpiritualLoopOutcomes,
  type DailySpiritualLoopSeed,
  type DailySpiritualLoopState
} from "../../src/domain/journey/daily-spiritual-loop";
import { createDeterministicDailySpiritualLoopSeed } from "../../src/features/journey/application/daily-spiritual-loop-service";
import { canonicalTigService } from "../../src/server/tig/canonical-tig-service";

const workspaceRoot = path.resolve(__dirname, "../..");

const seed: DailySpiritualLoopSeed = Object.freeze({
  id: "daily-spiritual-loop:test",
  scriptureReferences: Object.freeze(["Ephesians 1:18", "Romans 8:28-30"]),
  promise: Object.freeze({ title: "Calling & Purpose", level: "A", explanation: "A Scripture-linked application for review." }),
  prayerDraft: "Father, guide this next faithful step through Your Word and wise counsel.",
  callingDiscernment: Object.freeze({
    summary: "The strongest indicators suggest a pattern may be emerging.",
    evidence: Object.freeze(["Scripture", "prayer", "fruit", "time", "wise counsel"])
  }),
  dailyAssignment: "Choose one realistic, Scripture-consistent action voluntarily.",
  trace: Object.freeze({
    id: "daily-spiritual-loop:test-trace",
    deterministic: true,
    externalModelUsed: false,
    steps: Object.freeze([Object.freeze({
      id: "trace-1",
      summary: "Scripture and promise context were connected by deterministic TIG.",
      source: "tig_graph",
      scriptureReferences: Object.freeze(["Ephesians 1:18"])
    })])
  }),
  confidence: Object.freeze({ score: 0.84, label: "strong_scripture_match", explanation: "The selection retains exact Scripture anchors." }),
  limitations: Object.freeze(["Discernment remains provisional and user-reviewable."]),
  tigValid: true
});

function act(state: DailySpiritualLoopState, type: "accept" | "skip" | "reject" | "edit" | "revisit" | "undo", userInput?: string) {
  return applyDailySpiritualLoopAction(state, { type, userInput, createdAt: `2026-07-20T12:00:${String(state.transitions.length).padStart(2, "0")}.000Z` });
}

describe("guided daily spiritual loop", () => {
  it("creates all ten typed, sourced, explainable, status-bearing, reversible artifacts", () => {
    const state = createDailySpiritualLoopState(seed, "2026-07-20T12:00:00.000Z");
    expect(Object.keys(state.artifacts)).toEqual([...DAILY_SPIRITUAL_LOOP_STAGES]);
    for (const stage of DAILY_SPIRITUAL_LOOP_STAGES) {
      const artifact = state.artifacts[stage];
      expect(artifact.kind).toBe(stage);
      expect(artifact.sourceReferences.length).toBeGreaterThan(0);
      expect(artifact.tigExplanationTrace).toMatchObject({ deterministic: true, externalModelUsed: false });
      expect(artifact.tigExplanationTrace.steps.length).toBeGreaterThan(0);
      expect(artifact.confidence.score).toBeGreaterThanOrEqual(0);
      expect(artifact.limitations.length).toBeGreaterThan(0);
      expect(artifact.creationTime).toBe("2026-07-20T12:00:00.000Z");
      expect(artifact.userEdits).toEqual([]);
      expect(artifact.status).toBe("pending");
      expect(artifact.reversibleTransitionMetadata).toMatchObject({ reversible: true, revision: 1, undoAvailable: false });
    }
    expect(state.safety).toMatchObject({
      sessionOnly: true,
      durableWritePerformed: false,
      browserPersistenceUsed: false,
      rawPrivateTextLogged: false,
      liveAiUsed: false,
      automaticTestimonyPublished: false,
      automaticBookPromotionPerformed: false,
      automaticCallingDeclared: false,
      automaticPromiseFulfillmentDeclared: false
    });
  });

  it("completes the full loop without losing Scripture, reflection, testimony, or Book provenance", () => {
    let state = createDailySpiritualLoopState(seed, "2026-07-20T12:00:00.000Z");
    const inputs: Partial<Record<(typeof DAILY_SPIRITUAL_LOOP_STAGES)[number], string>> = {
      check_in: "I am arriving hopeful and uncertain.",
      reflection: "I chose one faithful step and want to review its fruit with wise counsel.",
      testimony_candidate: "A reviewed testimony draft, not a declaration of fulfillment or divine action.",
      book_review: "Explicitly confirmed Book promotion.",
      tomorrow: "Return to Ephesians 1:18 tomorrow."
    };
    for (const stage of DAILY_SPIRITUAL_LOOP_STAGES) {
      expect(state.currentStage).toBe(stage);
      state = act(state, "accept", inputs[stage]);
    }

    expect(state.active).toBe(false);
    expect(state.completedAt).toBeTruthy();
    expect(DAILY_SPIRITUAL_LOOP_STAGES.every((stage) => state.artifacts[stage].status === "accepted")).toBe(true);
    expect(state.artifacts.testimony_candidate.payload).toMatchObject({
      bodySummary: "A reviewed testimony draft, not a declaration of fulfillment or divine action.",
      userReviewed: true,
      published: false,
      promiseFulfillmentDeclared: false,
      divineActionDeclaredBySystem: false
    });
    expect(state.artifacts.book_review.payload).toMatchObject({
      sourceTestimonySummary: "A reviewed testimony draft, not a declaration of fulfillment or divine action.",
      explicitConfirmationRequired: true,
      promoted: true
    });
    expect(state.artifacts.promise.payload.fulfillmentDeclared).toBe(false);
    expect(state.artifacts.calling_discernment.payload.finalCallingDeclared).toBe(false);
    expect(state.artifacts.testimony_candidate.sourceReferences.map((source) => source.reference)).toContain(`${seed.id}:reflection`);
    expect(state.artifacts.book_review.sourceReferences.map((source) => source.reference)).toContain(`${seed.id}:testimony_candidate`);
    expect(state.artifacts.tomorrow.sourceReferences.map((source) => source.reference)).toContain(`${seed.id}:book_review`);
    expect(measureDailySpiritualLoopOutcomes(state)).toEqual({
      userClarity: true,
      faithfulActionSelected: true,
      reflectionContinuity: true,
      safety: true,
      trust: true,
      reversibility: true,
      crossModuleContinuity: true
    });
  });

  it("supports edit, skip, revisit, reject, and undo without a durable write", () => {
    let state = createDailySpiritualLoopState(seed, "2026-07-20T12:00:00.000Z");
    state = act(state, "edit", "Contact me at saint@example.com or +1 (416) 555-1212.");
    expect(state.artifacts.check_in.userEdits[0]?.summary).toBe("Contact me at [redacted email] or [redacted phone].");
    state = act(state, "undo");
    expect(state.artifacts.check_in.userEdits).toEqual([]);

    state = act(state, "skip");
    expect(state.currentStage).toBe("scripture");
    expect(state.artifacts.check_in.status).toBe("skipped");
    state = act(state, "undo");
    expect(state.currentStage).toBe("check_in");
    expect(state.artifacts.check_in.status).toBe("pending");

    state = act(state, "accept");
    state = applyDailySpiritualLoopAction(state, { type: "revisit", stage: "check_in", createdAt: "2026-07-20T12:01:00.000Z" });
    expect(state.currentStage).toBe("check_in");
    state = act(state, "reject");
    expect(state.artifacts.check_in.status).toBe("rejected");
    expect(state.safety.durableWritePerformed).toBe(false);
  });

  it("exposes one primary and at most two secondary actions and measures formation outcomes, not engagement", () => {
    let state = createDailySpiritualLoopState(seed, "2026-07-20T12:00:00.000Z");
    for (const stage of DAILY_SPIRITUAL_LOOP_STAGES) {
      const policy = getDailySpiritualLoopActionPolicy(state);
      expect(policy.primary).toBeTruthy();
      expect(policy.secondary.length).toBeLessThanOrEqual(2);
      expect(policy.secondary.every((action) => ["skip", "reject", "revisit", "undo"].includes(action.type))).toBe(true);
      state = act(state, "accept", stage === "reflection" ? "A user-approved reflection." : undefined);
    }
    const measureKeys = Object.keys(measureDailySpiritualLoopOutcomes(state));
    expect(measureKeys).toEqual([
      "userClarity",
      "faithfulActionSelected",
      "reflectionContinuity",
      "safety",
      "trust",
      "reversibility",
      "crossModuleContinuity"
    ]);
    expect(measureKeys.join(" ")).not.toMatch(/duration|streak|message|notification|engagement|score/i);
  });

  it("maps deterministic TIG through the journey application service without importing seeds into UI code", async () => {
    const first = await createDeterministicDailySpiritualLoopSeed(canonicalTigService);
    const second = await createDeterministicDailySpiritualLoopSeed(canonicalTigService);
    expect(first).toEqual(second);
    expect(first.trace).toMatchObject({ deterministic: true, externalModelUsed: false });
    expect(first.scriptureReferences.length).toBeGreaterThan(0);
    expect(first.callingDiscernment.summary).toContain("strongest indicators suggest");

    const clientFiles = [
      "src/components/productization/TeoyubeAppStateProvider.tsx",
      "src/features/journey/ui/DailySpiritualLoopProvider.tsx",
      "src/app/_today/TodayPageController.tsx",
      "src/app/_prayer/PrayerCompanionController.tsx",
      "src/app/_calling/CallingCompassPageController.tsx"
    ].map((file) => fs.readFileSync(path.join(workspaceRoot, file), "utf8")).join("\n");
    expect(clientFiles).not.toMatch(/TIG_CALLING_SEEDS|callings\.seed|tig\/seed/);
    expect(clientFiles).not.toMatch(/localStorage|sessionStorage|indexedDB/);
  });
});
