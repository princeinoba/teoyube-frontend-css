import type {
  TeoyubeTigRecommendationCandidate,
  TeoyubeTigRecommendationContext,
  TeoyubeTigRecommendationReason
} from "./tig-recommendation-contracts";

function unique(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value && value.trim())))];
}

function reason(params: TeoyubeTigRecommendationReason): TeoyubeTigRecommendationReason {
  return params;
}

function baseCandidate(
  candidate: Omit<TeoyubeTigRecommendationCandidate, "warnings" | "fallbackEligible">
): TeoyubeTigRecommendationCandidate {
  const warnings = [
    candidate.scriptureAnchors.length === 0 ? `${candidate.label} has no direct Scripture anchor.` : undefined,
    candidate.explanationPath.length === 0 ? `${candidate.label} has no explanation path.` : undefined
  ].filter(Boolean) as string[];

  return {
    ...candidate,
    warnings,
    fallbackEligible: warnings.length > 0
  };
}

export function buildWordCandidates(context: TeoyubeTigRecommendationContext): TeoyubeTigRecommendationCandidate[] {
  if (!context.wordContext) return [];
  const word = context.wordContext.word;

  return [
    baseCandidate({
      id: `word:${word.id}`,
      type: "word",
      label: word.word,
      description: word.meaning,
      scriptureAnchors: context.wordContext.scriptureAnchors,
      relatedWordIds: [word.id],
      relatedPromiseClusterIds: context.wordContext.promiseConnections.map((cluster) => cluster.id),
      relatedCallingIds: context.wordContext.callingLinks,
      relatedPrayerIds: [],
      relatedActionIds: [],
      tigNodeIds: context.tigGraphReferences.nodeIds,
      tigRelationshipIds: context.tigGraphReferences.relationshipIds,
      source: "teoyube_language_engine",
      reasons: [
        reason({
          id: "word_context_match",
          label: "Matched Teoyube word",
          detail: `${word.word} was loaded from ${word.source}.`,
          source: "teoyube_language_engine",
          scriptureAnchors: context.wordContext.scriptureAnchors,
          visibleToUser: true
        })
      ],
      explanationPath: context.wordContext.explanationPath,
      original: word
    })
  ];
}

export function buildPromiseCandidates(context: TeoyubeTigRecommendationContext): TeoyubeTigRecommendationCandidate[] {
  return context.promiseContext.clusters.map((cluster) =>
    baseCandidate({
      id: `promise:${cluster.id}`,
      type: "promise",
      label: cluster.title,
      description: cluster.declaration || cluster.description,
      scriptureAnchors: unique([
        ...cluster.scriptureReferences,
        ...context.promiseContext.scriptureAnchors
      ]),
      relatedWordIds: cluster.coreWords,
      relatedPromiseClusterIds: [cluster.id],
      relatedCallingIds: unique([cluster.callingConnection, context.callingPath?.archetype.id]),
      relatedPrayerIds: cluster.prayerSequence,
      relatedActionIds: [],
      tigNodeIds: context.tigGraphReferences.nodeIds,
      tigRelationshipIds: context.tigGraphReferences.relationshipIds,
      source: cluster.source === "src_data" ? "real_promise_cluster" : "tig_graph",
      reasons: [
        reason({
          id: `promise_${cluster.id}_match`,
          label: "Matched Promise Cluster",
          detail: `${cluster.title} matched the request through the Promise Engine.`,
          source: "promise_engine",
          scriptureAnchors: cluster.scriptureReferences,
          visibleToUser: true
        })
      ],
      explanationPath: [
        ...context.promiseContext.explanationPath,
        `Promise Cluster ${cluster.title} has ${cluster.scriptureReferences.length} direct Scripture anchor(s).`
      ],
      original: cluster
    })
  );
}

export function buildScriptureCandidates(context: TeoyubeTigRecommendationContext): TeoyubeTigRecommendationCandidate[] {
  const anchors = unique([
    ...context.scriptureAnchors,
    ...context.scriptureCanonReferences
  ]);

  return anchors.map((anchor) =>
    baseCandidate({
      id: `scripture:${anchor}`,
      type: "scripture",
      label: anchor,
      description: `Scripture anchor available for ${context.surface.replace(/_/g, " ")}.`,
      scriptureAnchors: [anchor],
      relatedWordIds: context.wordContext ? [context.wordContext.word.id] : [],
      relatedPromiseClusterIds: context.promiseContext.clusters.map((cluster) => cluster.id),
      relatedCallingIds: context.callingPath ? [context.callingPath.archetype.id] : [],
      relatedPrayerIds: [],
      relatedActionIds: [],
      tigNodeIds: context.tigGraphReferences.nodeIds,
      tigRelationshipIds: context.tigGraphReferences.relationshipIds,
      source: "real_scripture_canon",
      reasons: [
        reason({
          id: `scripture_${anchor}_anchor`,
          label: "Matched Scripture anchor",
          detail: `${anchor} was found through Teoyube data or Scripture Canon coverage.`,
          source: "scripture_canon",
          scriptureAnchors: [anchor],
          visibleToUser: true
        })
      ],
      explanationPath: [`${anchor} supports the selected Teoyube recommendation context.`],
      original: anchor
    })
  );
}

export function buildPrayerCandidates(context: TeoyubeTigRecommendationContext): TeoyubeTigRecommendationCandidate[] {
  return [
    baseCandidate({
      id: `prayer:${context.prayerContext.title}`,
      type: "prayer",
      label: context.prayerContext.title,
      description: context.prayerContext.prayer,
      scriptureAnchors: context.prayerContext.scriptureAnchor ? [context.prayerContext.scriptureAnchor] : context.scriptureAnchors,
      relatedWordIds: context.wordContext ? [context.wordContext.word.id] : [],
      relatedPromiseClusterIds: context.promiseContext.clusters.map((cluster) => cluster.id),
      relatedCallingIds: context.callingPath ? [context.callingPath.archetype.id] : [],
      relatedPrayerIds: [context.prayerContext.title],
      relatedActionIds: [],
      tigNodeIds: context.tigGraphReferences.nodeIds,
      tigRelationshipIds: context.tigGraphReferences.relationshipIds,
      source: "promise_engine",
      reasons: [
        reason({
          id: "prayer_context_match",
          label: "Prepared prayer context",
          detail: "Prayer guidance was built from the selected Promise Cluster and Scripture anchors.",
          source: "promise_engine",
          scriptureAnchors: context.prayerContext.scriptureAnchor ? [context.prayerContext.scriptureAnchor] : context.scriptureAnchors,
          visibleToUser: true
        })
      ],
      explanationPath: context.prayerContext.explanationPath,
      original: context.prayerContext
    })
  ];
}

export function buildCallingCandidates(context: TeoyubeTigRecommendationContext): TeoyubeTigRecommendationCandidate[] {
  if (!context.callingPath) return [];

  return [
    baseCandidate({
      id: `calling:${context.callingPath.archetype.id}`,
      type: "calling",
      label: context.callingPath.archetype.name,
      description: context.callingPath.archetype.summary,
      scriptureAnchors: context.callingPath.scriptureAnchors,
      relatedWordIds: context.callingPath.words.map((word) => word.id),
      relatedPromiseClusterIds: context.callingPath.promises.map((cluster) => cluster.id),
      relatedCallingIds: [context.callingPath.archetype.id],
      relatedPrayerIds: context.callingPath.prayers,
      relatedActionIds: context.callingPath.actionSteps,
      tigNodeIds: context.tigGraphReferences.nodeIds,
      tigRelationshipIds: context.tigGraphReferences.relationshipIds,
      source: "calling_engine",
      reasons: [
        reason({
          id: "calling_context_match",
          label: "Matched calling path",
          detail: `${context.callingPath.archetype.name} was selected by the Calling Engine as reflective guidance, not divine certainty.`,
          source: "calling_engine",
          scriptureAnchors: context.callingPath.scriptureAnchors,
          visibleToUser: true
        })
      ],
      explanationPath: context.callingPath.explanationPath,
      original: context.callingPath
    })
  ];
}

export function buildActionStepCandidates(context: TeoyubeTigRecommendationContext): TeoyubeTigRecommendationCandidate[] {
  return context.actionSteps.slice(0, 4).map((step, index) =>
    baseCandidate({
      id: `action:${index + 1}`,
      type: "action_step",
      label: `Faithful next step ${index + 1}`,
      description: step,
      scriptureAnchors: context.scriptureAnchors,
      relatedWordIds: context.wordContext ? [context.wordContext.word.id] : [],
      relatedPromiseClusterIds: context.promiseContext.clusters.map((cluster) => cluster.id),
      relatedCallingIds: context.callingPath ? [context.callingPath.archetype.id] : [],
      relatedPrayerIds: [context.prayerContext.title],
      relatedActionIds: [step],
      tigNodeIds: context.tigGraphReferences.nodeIds,
      tigRelationshipIds: context.tigGraphReferences.relationshipIds,
      source: "calling_engine",
      reasons: [
        reason({
          id: `action_${index + 1}_match`,
          label: "Prepared action step",
          detail: "The action step is connected to Scripture, prayer, and calling context.",
          source: "calling_engine",
          scriptureAnchors: context.scriptureAnchors,
          visibleToUser: true
        })
      ],
      explanationPath: [
        ...context.explanationPath,
        "Action steps are suggestions for reflection and faithful practice, not divine certainty."
      ],
      original: step
    })
  );
}

export function buildTigRecommendationCandidates(
  context: TeoyubeTigRecommendationContext
): TeoyubeTigRecommendationCandidate[] {
  return [
    ...buildWordCandidates(context),
    ...buildPromiseCandidates(context),
    ...buildScriptureCandidates(context),
    ...buildPrayerCandidates(context),
    ...buildCallingCandidates(context),
    ...buildActionStepCandidates(context)
  ];
}

export function validateTigRecommendationCandidates(candidates: TeoyubeTigRecommendationCandidate[]) {
  const blockers = [
    candidates.length === 0 ? "No TIG recommendation candidates were generated." : undefined,
    ...candidates
      .filter((candidate) => candidate.type === "promise" && candidate.scriptureAnchors.length === 0)
      .map((candidate) => `Promise candidate ${candidate.id} has no Scripture anchor.`)
  ].filter(Boolean) as string[];
  const warnings = candidates.flatMap((candidate) => candidate.warnings);

  return {
    valid: blockers.length === 0,
    candidateCount: candidates.length,
    blockers,
    warnings
  };
}
