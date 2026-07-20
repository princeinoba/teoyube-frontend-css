import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { TigRecommendationInput } from "../../src/domain/tig/tig-service";
import { createDailySpiritualLoopState } from "../../src/domain/journey/daily-spiritual-loop";
import { createDeterministicDailySpiritualLoopSeed } from "../../src/features/journey/application/daily-spiritual-loop-service";
import { createPrayerPageViewModel, createPrayerReplyDto } from "../../src/features/prayer/application/prayer-service";
import { createCallingCompassViewModel } from "../../src/features/calling/application/calling-compass-service";
import { runTigEndToEndRecommendation } from "../../src/lib/teoyube/tig/tig-end-to-end-recommendation-flow";
import {
  TIG_DATASET_VERSION,
  TIG_RULESET_VERSION,
  canonicalTigService,
  createCanonicalTigService
} from "../../src/server/tig/canonical-tig-service";
import { TIG_CHARACTERIZATION_FIXTURES } from "../fixtures/tig/canonical-output-characterization";

const workspaceRoot = path.resolve(__dirname, "../..");

function filesUnder(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(fullPath) : /\.(?:ts|tsx)$/.test(entry.name) ? [fullPath] : [];
  });
}

function characterization(result: Awaited<ReturnType<ReturnType<typeof createCanonicalTigService>["recommend"]>>) {
  const anchors = result.selectedCandidate.scriptureAnchors.map((anchor) => anchor.reference);
  return {
    selectedId: result.selectedCandidate.id,
    selectedType: result.selectedCandidate.type,
    selectedLabel: result.selectedCandidate.label,
    source: result.selectedCandidate.source,
    candidateCount: result.candidates.length,
    firstCandidateIds: result.candidates.map((candidate) => candidate.id).slice(0, 6),
    confidenceScore: result.confidence.score,
    confidenceLabel: result.confidence.label,
    scriptureAnchorCount: anchors.length,
    firstScriptureAnchor: anchors[0],
    lastScriptureAnchor: anchors[anchors.length - 1],
    selectedNodeCount: result.selectedCandidate.graphPath.nodeIds.length,
    selectedRelationshipCount: result.selectedCandidate.graphPath.relationshipIds.length,
    fallbackUsed: result.fallback.used,
    fallbackReasons: result.fallback.reasons.map((reason) => reason.detail),
    explanationStepLabels: result.explanation.steps.map((step) => step.label)
  };
}

function expectStableFieldMapping(serviceResult: Awaited<ReturnType<ReturnType<typeof createCanonicalTigService>["recommend"]>>, legacyResult: ReturnType<typeof runTigEndToEndRecommendation>) {
  expect(serviceResult.selectedCandidate).toMatchObject({
    id: legacyResult.selectedCandidate.id,
    type: legacyResult.selectedCandidate.type,
    label: legacyResult.selectedCandidate.label,
    description: legacyResult.selectedCandidate.description,
    source: legacyResult.selectedCandidate.source,
    relatedWordIds: legacyResult.selectedCandidate.relatedWordIds,
    relatedPromiseClusterIds: legacyResult.selectedCandidate.relatedPromiseClusterIds,
    relatedCallingIds: legacyResult.selectedCandidate.relatedCallingIds,
    relatedPrayerIds: legacyResult.selectedCandidate.relatedPrayerIds,
    relatedActionIds: legacyResult.selectedCandidate.relatedActionIds,
    explanationPath: legacyResult.selectedCandidate.explanationPath,
    warnings: legacyResult.selectedCandidate.warnings,
    fallbackEligible: legacyResult.selectedCandidate.fallbackEligible
  });
  expect(serviceResult.selectedCandidate.scriptureAnchors.map((anchor) => anchor.reference)).toEqual(legacyResult.selectedCandidate.scriptureAnchors);
  expect(serviceResult.selectedCandidate.graphPath).toMatchObject({
    nodeIds: legacyResult.selectedCandidate.tigNodeIds,
    relationshipIds: legacyResult.selectedCandidate.tigRelationshipIds,
    depth: legacyResult.selectedCandidate.explanationPath.length,
    explanation: legacyResult.selectedCandidate.explanationPath
  });
  expect(serviceResult.candidates.map((candidate) => candidate.id)).toEqual(legacyResult.candidates.map((candidate) => candidate.id));
  expect(serviceResult.confidence).toEqual({
    score: legacyResult.confidence.score,
    label: legacyResult.confidence.label,
    explanation: legacyResult.confidence.explanation,
    breakdown: legacyResult.confidence.factors
  });
  expect(serviceResult.explanation).toMatchObject({
    summary: legacyResult.explanationTrace.summary,
    confidence: serviceResult.confidence
  });
  expect(serviceResult.explanation.steps.map((step) => ({
    label: step.label,
    summary: step.summary,
    source: step.source,
    relatedIds: step.relatedIds,
    scriptureAnchors: step.scriptureAnchors,
    fallbackRelated: step.fallbackRelated,
    visibleToUser: step.visibleToUser
  }))).toEqual(legacyResult.explanationTrace.steps.map((step) => ({
    label: step.label,
    summary: step.summary,
    source: step.source,
    relatedIds: step.relatedIds,
    scriptureAnchors: step.scriptureAnchors,
    fallbackRelated: step.fallbackRelated,
    visibleToUser: step.visibleToUser
  })));
  expect(serviceResult.fallback).toMatchObject({
    used: legacyResult.fallback.used,
    message: legacyResult.fallback.message,
    safe: legacyResult.fallback.safe
  });
  expect(serviceResult.fallback.reasons.map((reason) => reason.detail)).toEqual(legacyResult.fallback.reasons);
}

describe("canonical typed TIG service", () => {
  it("matches all five pre-refactor characterization fixtures and preserves legacy fields", async () => {
    expect(TIG_CHARACTERIZATION_FIXTURES).toHaveLength(5);
    for (const fixture of TIG_CHARACTERIZATION_FIXTURES) {
      const service = createCanonicalTigService();
      const serviceResult = await service.recommend(fixture.serviceInput);
      const legacyResult = runTigEndToEndRecommendation(fixture.legacyInput);
      expect(characterization(serviceResult), fixture.id).toEqual(fixture.expected);
      expectStableFieldMapping(serviceResult, legacyResult);
    }
  });

  it("is deterministic for fixed normalized input, dataset version, ruleset version, and safe configuration", async () => {
    const service = createCanonicalTigService();
    const input = TIG_CHARACTERIZATION_FIXTURES[2].serviceInput;
    const first = await service.recommend(input);
    const second = await service.recommend(input);
    expect(second).toEqual(first);
    expect(first.versions).toEqual({ dataset: TIG_DATASET_VERSION, ruleset: TIG_RULESET_VERSION });
    expect(first.recommendationId).toMatch(/^tig:[a-f0-9]{8}$/);
    expect(service.diagnostics()).toMatchObject({ entries: 1, hits: 1, misses: 1, writes: 1, bypasses: 0 });
  });

  it("returns ranking, graph traversal, explanation, and source validation with every recommendation", async () => {
    const service = createCanonicalTigService();
    const result = await service.recommend(TIG_CHARACTERIZATION_FIXTURES[2].serviceInput);
    expect(result.candidates.length).toBeGreaterThan(1);
    expect(result.candidates[0]?.id).toBe("calling:calling_builder");
    expect(result.selectedCandidate.graphPath.nodeIds.length).toBeGreaterThan(0);
    expect(result.selectedCandidate.graphPath.relationshipIds.length).toBeGreaterThan(0);
    expect(result.selectedCandidate.graphPath.depth).toBeGreaterThan(0);
    expect(result.explanation.sourcePaths[0]).toEqual(result.selectedCandidate.graphPath);
    expect(result.explanation.steps.length).toBeGreaterThan(0);
    expect(result.explanation.scriptureAnchors.length).toBeGreaterThan(0);
    expect(await service.explain(result.recommendationId)).toEqual(result.explanation);
    expect(await service.validateSources(result)).toEqual(result.sourceValidation);
  });

  it("uses dataset/ruleset/config-aware cache keys without caching raw private reflection or prayer text", async () => {
    const input = TIG_CHARACTERIZATION_FIXTURES[0].serviceInput;
    const firstService = createCanonicalTigService({ datasetVersion: "dataset-a", rulesetVersion: "rules-a" });
    const secondService = createCanonicalTigService({ datasetVersion: "dataset-b", rulesetVersion: "rules-a" });
    const first = await firstService.recommend(input);
    const second = await secondService.recommend(input);
    const configured = await firstService.recommend({ ...input, safeConfiguration: { personalizationEnabled: true } });
    expect(first.cache.key).not.toBe(second.cache.key);
    expect(first.cache.key).not.toBe(configured.cache.key);
    expect(first.cache.key).toContain("dataset-a:rules-a");

    const privateService = createCanonicalTigService();
    const privateText = "Private prayer and reflection that must never enter a cache";
    const privateResult = await privateService.recommend({
      query: privateText,
      intent: "prayer",
      surface: "prayer",
      prayerInput: privateText,
      privacy: { containsPrivatePrayerText: true, containsPrivateReflectionText: true }
    });
    expect(privateResult.cache).toEqual({ cacheable: false, key: null, rawPrivateTextStored: false });
    expect(privateService.diagnostics()).toMatchObject({ entries: 0, writes: 0, bypasses: 1 });
    expect(privateService.diagnostics().keys.join(" ")).not.toContain(privateText);

    const prayerService = createCanonicalTigService();
    const prayerResult = await prayerService.recommend(TIG_CHARACTERIZATION_FIXTURES[1].serviceInput);
    expect(prayerResult.cache).toEqual({ cacheable: false, key: null, rawPrivateTextStored: false });
    expect(prayerService.diagnostics()).toMatchObject({ entries: 0, writes: 0, bypasses: 1 });
  });

  it("returns typed fallbacks for every input and complexity limit", async () => {
    const calling = TIG_CHARACTERIZATION_FIXTURES[2].serviceInput;
    const cases: Array<Readonly<{ code: string; input: TigRecommendationInput; service?: ReturnType<typeof createCanonicalTigService> }>> = [
      { code: "input_length_limit", input: { query: "x".repeat(2_001), intent: "unknown" } },
      { code: "input_length_limit", input: { query: "short", prayerInput: "x".repeat(2_001), intent: "prayer" } },
      { code: "candidate_count_limit", input: { ...calling, limits: { candidateCount: 1 } } },
      { code: "traversal_depth_limit", input: { ...calling, limits: { traversalDepth: 1 } } },
      { code: "expanded_nodes_limit", input: { ...calling, limits: { expandedNodes: 1 } } },
      {
        code: "execution_duration_limit",
        input: { ...calling, limits: { executionDurationMs: 1 } },
        service: createCanonicalTigService({ monotonicNow: (() => { let value = 0; return () => (value += 10); })() })
      }
    ];
    for (const item of cases) {
      const result = await (item.service || createCanonicalTigService()).recommend(item.input);
      expect(result.fallback.used, item.code).toBe(true);
      expect(result.fallback.reasons[0]?.code, item.code).toBe(item.code);
      expect(result.explanation.steps[0]?.source, item.code).toBe("tig_limit");
      expect(result.explanation.sourcePaths.length, item.code).toBeGreaterThan(0);
      expect(result.safety, item.code).toMatchObject({ deterministic: true, readOnly: true, externalModelUsed: false });
    }
  });

  it("keeps TIG read-only with respect to Prompt 13 journey and testimony-related state", async () => {
    const seed = await createDeterministicDailySpiritualLoopSeed(canonicalTigService);
    const journey = createDailySpiritualLoopState(seed, "2026-07-20T12:00:00.000Z");
    const before = JSON.stringify(journey);
    const result = await createCanonicalTigService().recommend(TIG_CHARACTERIZATION_FIXTURES[2].serviceInput);
    expect(JSON.stringify(journey)).toBe(before);
    expect(result.safety).toMatchObject({
      journeyStateMutated: false,
      journalStateMutated: false,
      testimonyStateMutated: false,
      promiseStateMutated: false,
      bookStateMutated: false,
      callingDeclaredAsFact: false,
      promiseFulfillmentDeclared: false,
      testimonyPublished: false
    });
  });

  it("preserves every direct feature-consumer contract", async () => {
    const journeySeed = await createDeterministicDailySpiritualLoopSeed(canonicalTigService);
    const legacyJourney = runTigEndToEndRecommendation(TIG_CHARACTERIZATION_FIXTURES[0].legacyInput);
    const legacyScriptureReferences = legacyJourney.explanationTrace.scriptureAnchors.length
      ? legacyJourney.explanationTrace.scriptureAnchors
      : ["Ephesians 1:18"];
    const legacyConfidenceLabel = legacyJourney.confidence.label === "strong_scripture_match"
      ? "strong_scripture_match"
      : legacyJourney.confidence.label === "good_contextual_match"
        ? "good_contextual_match"
        : legacyJourney.confidence.label === "partial_match"
          ? "partial_match"
          : "fallback_match";
    const legacyTraceSteps = legacyJourney.explanationTrace.steps.length
      ? legacyJourney.explanationTrace.steps.map((step, index) => ({
          id: `daily-loop-trace-${index + 1}`,
          summary: step.summary,
          source: step.source,
          scriptureReferences: [...step.scriptureAnchors]
        }))
      : [{
          id: "daily-loop-trace-fallback",
          summary: "The deterministic fallback preserves Scripture review and explains why more context may be needed.",
          source: "fallback",
          scriptureReferences: [...legacyScriptureReferences]
        }];
    const legacySeed = {
      id: "daily-spiritual-loop:deterministic-v1",
      scriptureReferences: [...legacyScriptureReferences],
      promise: {
        title: legacyJourney.context.promiseContext.clusters[0]?.title || legacyJourney.selectedCandidate.label || "Calling & Purpose",
        level: "A",
        explanation: legacyJourney.selectedCandidate.description || "A Scripture-linked promise application prepared for user review."
      },
      prayerDraft: legacyJourney.context.prayerContext.prayer || "Father, guide my next faithful step through Your Word, prayer, wise counsel, and humility.",
      callingDiscernment: {
        summary: "The strongest indicators suggest a calling pattern may be emerging; test it through Scripture, prayer, fruit, time, and wise counsel.",
        evidence: legacyJourney.explanationTrace.steps.map((step) => step.summary).slice(0, 4)
      },
      dailyAssignment: legacyJourney.context.actionSteps[0] || "Choose one realistic, Scripture-consistent action and reflect on it without treating compliance as spiritual worth.",
      trace: {
        id: "daily-spiritual-loop:tig-trace-v1",
        deterministic: true,
        externalModelUsed: false,
        steps: legacyTraceSteps
      },
      confidence: {
        score: legacyJourney.confidence.score,
        label: legacyConfidenceLabel,
        explanation: legacyJourney.confidence.explanation
      },
      limitations: [
        ...(legacyJourney.fallback.used ? legacyJourney.fallback.reasons : []),
        "Calling remains discernment over time, not a final destiny declaration.",
        "Generated prayer language remains a reviewable draft and never represents divine speech."
      ],
      tigValid: legacyJourney.valid
    };
    expect(journeySeed).toEqual(legacySeed);
    expect(journeySeed).toMatchObject({
      id: "daily-spiritual-loop:deterministic-v1",
      scriptureReferences: ["Ephesians 1:18"],
      promise: { title: "Scripture-grounded fallback encouragement", level: "A" },
      confidence: { score: 0.3491666666666666, label: "fallback_match" },
      tigValid: true
    });
    const prayerPage = createPrayerPageViewModel();
    const prayerReply = createPrayerReplyDto("Please help me pray for wisdom and surrender.");
    expect(prayerPage.production.explanationItems.length).toBeGreaterThan(0);
    expect(prayerPage.journeyScriptureAnchors.length).toBeGreaterThan(0);
    expect(prayerReply).toMatchObject({ fallbackUsed: false, safetyStatus: "safe" });
    expect(prayerReply.explanationPath.length).toBeGreaterThan(0);
    const calling = createCallingCompassViewModel();
    expect(calling.discernment.explanationPath.length).toBeGreaterThan(0);
    expect(calling.discernment.limitation).toContain("not a final destiny or divine declaration");
  });

  it("keeps seed, traversal, server-cache, and model-provider modules out of client components", () => {
    const clientFiles = ["src/app", "src/components", "src/features"]
      .flatMap((directory) => filesUnder(path.join(workspaceRoot, directory)))
      .filter((file) => /^\s*["']use client["']/.test(fs.readFileSync(file, "utf8")));
    const prohibited = /(?:tig[/\\]seed|callings\.seed|intelligence-graph-seeds|tig[/\\]traverse|production-cache|server[/\\]tig|model-provider)/;
    for (const file of clientFiles) expect(fs.readFileSync(file, "utf8"), path.relative(workspaceRoot, file)).not.toMatch(prohibited);
    expect(fs.readFileSync(path.join(workspaceRoot, "src/features/journey/legacy-adapter.ts"), "utf8")).not.toContain("tig-end-to-end-recommendation-flow");
  });
});
