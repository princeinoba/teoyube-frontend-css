import { getTIGSeedGraph, getTIGSeedSummary } from "../../tig";
import { recommendCallingPath } from "../calling/calling-engine";
import {
  findScriptureCanonEntryByReference,
  findVocabularyItemById,
  getScriptureCanonData
} from "../data/teoyube-data-access";
import { createWordCardContext, findTeoyubeWordById } from "../language/teoyube-language-engine";
import {
  createPromiseRecommendationContext,
  findPromiseClusterById
} from "../promises/promise-engine";
import type {
  TeoyubeTigRecommendationContext,
  TeoyubeTigRecommendationInput,
  TeoyubeTigRecommendationSurface
} from "./tig-recommendation-contracts";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function unique(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value && value.trim())))];
}

function safeQuery(input: TeoyubeTigRecommendationInput): string {
  return (
    input.query ||
    input.wordId ||
    input.clusterId ||
    input.callingInput ||
    input.prayerInput ||
    input.actionInput ||
    "Scripture-grounded Teoyube recommendation"
  );
}

function defaultSurface(surface?: TeoyubeTigRecommendationSurface): TeoyubeTigRecommendationSurface {
  return surface || "unknown";
}

function pickWordId(input: TeoyubeTigRecommendationInput, query: string): string {
  if (input.wordId) return input.wordId;
  const found = findVocabularyItemById(query) || findVocabularyItemById("Benor");
  return found?.word || found?.id || "Benor";
}

function pickClusterId(input: TeoyubeTigRecommendationInput, query: string): string | undefined {
  if (input.clusterId) return input.clusterId;
  const direct = findPromiseClusterById(query);
  return direct?.id;
}

function findCanonRefs(anchors: string[]): string[] {
  const canonRefs = new Set<string>();
  const canon = getScriptureCanonData();

  for (const anchor of anchors) {
    const direct = findScriptureCanonEntryByReference(anchor);
    if (direct?.scriptureReferences?.length) {
      direct.scriptureReferences.forEach((ref) => canonRefs.add(ref));
    }
    canon
      .filter((entry) =>
        entry.scriptureReferences.some((ref) => normalize(ref) === normalize(anchor)) ||
        entry.scriptureReferences.some((ref) => normalize(anchor).includes(normalize(ref))) ||
        entry.word.toLowerCase() === anchor.toLowerCase()
      )
      .forEach((entry) => entry.scriptureReferences.forEach((ref) => canonRefs.add(ref)));
  }

  return [...canonRefs];
}

function findTigGraphReferences(labels: string[]) {
  const graph = getTIGSeedGraph();
  const normalizedLabels = labels.map(normalize).filter(Boolean);
  const nodes = graph.nodes.filter((node) => {
    const text = [
      node.id,
      node.title,
      node.description,
      node.summary,
      ...node.tags,
      ...node.aliases,
      ...node.scriptureReferences
    ]
      .join(" ")
      .toLowerCase();
    return normalizedLabels.some((label) => text.includes(label) || label.includes(normalize(node.id)));
  });
  const nodeIds = new Set(nodes.map((node) => node.id));
  const relationships = graph.relationships.filter((relationship) =>
    nodeIds.has(relationship.sourceNodeId) || nodeIds.has(relationship.targetNodeId)
  );
  const summary = getTIGSeedSummary();

  return {
    nodeIds: [...nodeIds],
    relationshipIds: relationships.map((relationship) => relationship.id),
    summary: `${summary.nodeCount} TIG node(s), ${summary.relationshipCount} relationship(s), ${nodeIds.size} local match(es).`
  };
}

export function createTigRecommendationContext(
  input: TeoyubeTigRecommendationInput = {}
): TeoyubeTigRecommendationContext {
  const query = safeQuery(input);
  const surface = defaultSurface(input.surface);
  const wordId = pickWordId(input, query);
  const wordFound = Boolean(findTeoyubeWordById(wordId));
  const wordContext = createWordCardContext(wordId);
  const clusterId = pickClusterId(input, query) || input.clusterId || wordContext.promiseConnections[0]?.id;
  const promiseContext = createPromiseRecommendationContext({
    query,
    clusterId,
    theme: query,
    limit: input.limit || 5
  });
  const callingPath = recommendCallingPath({
    query: input.callingInput || query
  });
  const cluster = promiseContext.clusters[0];
  const scriptureAnchors = unique([
    ...wordContext.scriptureAnchors,
    ...promiseContext.scriptureAnchors,
    ...callingPath.scriptureAnchors,
    ...(cluster?.scriptureReferences || [])
  ]);
  const prayerSequence = cluster?.prayerSequence || [];
  const prayerContext = {
    title: cluster?.title || "Scripture-Grounded Prayer",
    prayer: prayerSequence.length
      ? `Pray through: ${prayerSequence.join(" -> ")}.`
      : "Father, guide this reflection through Scripture, humility, and one faithful next step.",
    scriptureAnchor: scriptureAnchors[0],
    explanationPath: [
      ...promiseContext.explanationPath,
      `Prayer context uses ${cluster?.title || "the safest available promise context"}.`
    ],
    fallbackUsed: !cluster || !scriptureAnchors.length
  };
  const actionSteps = unique([
    input.actionInput,
    ...callingPath.actionSteps,
    "Review Scripture anchors before treating this as guidance."
  ]);
  const scriptureCanonReferences = findCanonRefs(scriptureAnchors);
  const tigGraphReferences = findTigGraphReferences([
    query,
    wordContext.word.word,
    ...(cluster ? [cluster.id, cluster.title, cluster.theme] : []),
    callingPath.archetype.name,
    ...scriptureAnchors
  ]);
  const warnings = [
    !wordFound ? `Requested word ${wordId} was not found directly; WordCard context used a safe fallback word.` : undefined,
    !promiseContext.clusters.length ? "No Promise Cluster matched the request directly." : undefined,
    !scriptureAnchors.length ? "No Scripture anchors were found for the recommendation context." : undefined,
    !scriptureCanonReferences.length ? "Scripture anchors did not map directly to Scripture Canon entries." : undefined,
    ...wordContext.warnings,
    ...promiseContext.warnings
  ].filter(Boolean) as string[];
  const blockers = [
    ...wordContext.blockers,
    ...promiseContext.blockers
  ];

  return {
    input,
    surface,
    query,
    wordContext,
    promiseContext,
    callingPath,
    prayerContext,
    actionSteps,
    scriptureAnchors,
    scriptureCanonReferences,
    tigGraphReferences,
    explanationPath: unique([
      ...wordContext.explanationPath,
      ...promiseContext.explanationPath,
      ...callingPath.explanationPath,
      `TIG graph references: ${tigGraphReferences.summary}`
    ]),
    confidenceLabel: blockers.length ? "needs_review" : scriptureAnchors.length ? "anchored" : "fallback",
    fallbackStatus: {
      used: blockers.length > 0 || !scriptureAnchors.length || !promiseContext.clusters.length,
      reasons: warnings,
      message: warnings.length
        ? "The context includes review warnings and should use humble fallback framing where needed."
        : "No context fallback was required.",
      scriptureAnchors,
      safe: blockers.length === 0
    },
    warnings,
    blockers,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noBrowserPersistenceRequired: true
  };
}

export function createTigContextFromWord(wordId: string): TeoyubeTigRecommendationContext {
  return createTigRecommendationContext({ wordId, query: wordId, surface: "word_card" });
}

export function createTigContextFromPromiseCluster(clusterId: string): TeoyubeTigRecommendationContext {
  return createTigRecommendationContext({ clusterId, query: clusterId, surface: "promise_table" });
}

export function createTigContextFromCallingInput(input: string): TeoyubeTigRecommendationContext {
  return createTigRecommendationContext({ query: input, callingInput: input, surface: "calling" });
}

export function createTigContextFromPrayerInput(input: string): TeoyubeTigRecommendationContext {
  return createTigRecommendationContext({ query: input, prayerInput: input, surface: "prayer" });
}

export function validateTigRecommendationContext(context: TeoyubeTigRecommendationContext) {
  const blockers = [
    !context.query ? "TIG recommendation context is missing a query." : undefined,
    !context.wordContext?.word.word ? "TIG recommendation context is missing Teoyube word context." : undefined,
    !context.promiseContext ? "TIG recommendation context is missing Promise Engine context." : undefined
  ].filter(Boolean) as string[];
  const warnings = [
    context.scriptureAnchors.length === 0 ? "TIG recommendation context has no Scripture anchors." : undefined,
    context.explanationPath.length === 0 ? "TIG recommendation context has no explanation path." : undefined,
    ...context.warnings
  ].filter(Boolean) as string[];

  return {
    valid: blockers.length === 0,
    blockers,
    warnings
  };
}

export function createTigRecommendationContextReport(context: TeoyubeTigRecommendationContext) {
  const validation = validateTigRecommendationContext(context);
  return {
    valid: validation.valid,
    surface: context.surface,
    word: context.wordContext?.word.word,
    promiseClusterCount: context.promiseContext.clusters.length,
    scriptureAnchorCount: context.scriptureAnchors.length,
    scriptureCanonReferenceCount: context.scriptureCanonReferences.length,
    tigGraphNodeReferenceCount: context.tigGraphReferences.nodeIds.length,
    fallbackUsed: context.fallbackStatus.used,
    blockers: validation.blockers,
    warnings: validation.warnings,
    noExternalServicesRequired: true as const,
    noBrowserPersistenceRequired: true as const,
    generatedAt: new Date().toISOString()
  };
}
