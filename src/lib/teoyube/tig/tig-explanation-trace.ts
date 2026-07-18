import type {
  TeoyubeTigExplanationTrace,
  TeoyubeTigExplanationTraceStep,
  TeoyubeTigRecommendationContext,
  TeoyubeTigRecommendationResult,
  TeoyubeTigRecommendationReason
} from "./tig-recommendation-contracts";

export function createTigTraceStep(input: {
  id: string;
  label: string;
  summary: string;
  source: TeoyubeTigRecommendationReason["source"];
  relatedIds?: string[];
  scriptureAnchors?: string[];
  fallbackRelated?: boolean;
}): TeoyubeTigExplanationTraceStep {
  return {
    id: input.id,
    label: input.label,
    summary: input.summary,
    source: input.source,
    relatedIds: input.relatedIds || [],
    scriptureAnchors: input.scriptureAnchors || [],
    fallbackRelated: input.fallbackRelated || false,
    visibleToUser: true
  };
}

export function getTigTraceForWord(result: TeoyubeTigRecommendationResult): TeoyubeTigExplanationTraceStep[] {
  const word = result.context.wordContext?.word;
  if (!word) return [];
  return [
    createTigTraceStep({
      id: "word_match",
      label: "Matched Teoyube word",
      summary: `${word.word} was selected from real Teoyube vocabulary context.`,
      source: "teoyube_language_engine",
      relatedIds: [word.id],
      scriptureAnchors: result.context.wordContext?.scriptureAnchors || []
    })
  ];
}

export function getTigTraceForPromise(result: TeoyubeTigRecommendationResult): TeoyubeTigExplanationTraceStep[] {
  const cluster = result.context.promiseContext.clusters[0];
  if (!cluster) return [];
  return [
    createTigTraceStep({
      id: "promise_match",
      label: "Matched Promise Cluster",
      summary: `${cluster.title} was selected from real Promise Cluster data.`,
      source: "promise_engine",
      relatedIds: [cluster.id],
      scriptureAnchors: cluster.scriptureReferences
    })
  ];
}

export function getTigTraceForScripture(result: TeoyubeTigRecommendationResult): TeoyubeTigExplanationTraceStep[] {
  if (!result.selectedCandidate.scriptureAnchors.length) return [];
  return [
    createTigTraceStep({
      id: "scripture_anchor_match",
      label: "Checked Scripture anchor",
      summary: `${result.selectedCandidate.scriptureAnchors[0]} supports this recommendation path.`,
      source: "scripture_canon",
      relatedIds: result.selectedCandidate.scriptureAnchors,
      scriptureAnchors: result.selectedCandidate.scriptureAnchors
    })
  ];
}

export function getTigTraceForPrayer(result: TeoyubeTigRecommendationResult): TeoyubeTigExplanationTraceStep[] {
  return [
    createTigTraceStep({
      id: "prayer_context",
      label: "Prepared prayer support",
      summary: "Prayer guidance was derived from the Promise Engine context and Scripture anchors.",
      source: "promise_engine",
      relatedIds: [result.context.prayerContext.title],
      scriptureAnchors: result.context.prayerContext.scriptureAnchor ? [result.context.prayerContext.scriptureAnchor] : []
    })
  ];
}

export function getTigTraceForCalling(result: TeoyubeTigRecommendationResult): TeoyubeTigExplanationTraceStep[] {
  const path = result.context.callingPath;
  if (!path) return [];
  return [
    createTigTraceStep({
      id: "calling_path",
      label: "Connected calling path",
      summary: `${path.archetype.name} was connected as reflective calling context, not certainty about the user's calling.`,
      source: "calling_engine",
      relatedIds: [path.archetype.id],
      scriptureAnchors: path.scriptureAnchors
    })
  ];
}

export function getTigTraceForActionStep(result: TeoyubeTigRecommendationResult): TeoyubeTigExplanationTraceStep[] {
  const action = result.context.actionSteps[0];
  if (!action) return [];
  return [
    createTigTraceStep({
      id: "action_step",
      label: "Suggested next step",
      summary: action,
      source: "calling_engine",
      relatedIds: [action],
      scriptureAnchors: result.context.scriptureAnchors
    })
  ];
}

function getGraphTrace(context: TeoyubeTigRecommendationContext): TeoyubeTigExplanationTraceStep[] {
  return [
    createTigTraceStep({
      id: "tig_graph_references",
      label: "Checked TIG graph relationships",
      summary: context.tigGraphReferences.summary,
      source: "tig_graph",
      relatedIds: [...context.tigGraphReferences.nodeIds, ...context.tigGraphReferences.relationshipIds],
      scriptureAnchors: context.scriptureAnchors
    })
  ];
}

export function createTigExplanationTrace(
  result: TeoyubeTigRecommendationResult,
  context: TeoyubeTigRecommendationContext
): TeoyubeTigExplanationTrace {
  const steps = [
    createTigTraceStep({
      id: "context_signal",
      label: "Received local context",
      summary: `Teoyube used a local ${context.surface.replace(/_/g, " ")} context signal without storing sensitive input.`,
      source: "qa",
      relatedIds: [context.surface],
      scriptureAnchors: []
    }),
    ...getTigTraceForWord(result),
    ...getTigTraceForPromise(result),
    ...getTigTraceForScripture(result),
    ...getTigTraceForPrayer(result),
    ...getTigTraceForCalling(result),
    ...getTigTraceForActionStep(result),
    ...getGraphTrace(context),
    createTigTraceStep({
      id: "confidence_reason",
      label: "Applied confidence label",
      summary: result.confidence.explanation,
      source: "theology_framework",
      relatedIds: [result.confidence.label],
      scriptureAnchors: result.selectedCandidate.scriptureAnchors
    }),
    ...(result.fallback.used
      ? [
        createTigTraceStep({
          id: "fallback_reason",
          label: "Fallback framing used",
          summary: result.fallback.message,
          source: "fallback" as const,
          relatedIds: result.fallback.reasons,
          scriptureAnchors: result.fallback.scriptureAnchors,
          fallbackRelated: true
        })
      ]
      : [])
  ];

  return {
    id: `trace_${result.id}`,
    surface: context.surface,
    summary: `${result.selectedCandidate.label} was selected with ${result.confidence.label.replace(/_/g, " ")} confidence.`,
    steps,
    scriptureAnchors: result.selectedCandidate.scriptureAnchors,
    fallbackUsed: result.fallback.used,
    confidenceLabel: result.confidence.label,
    safeForNormalUsers: true
  };
}

export function validateTigExplanationTrace(trace: TeoyubeTigExplanationTrace) {
  const blockers = [
    trace.steps.length === 0 ? "TIG explanation trace has no user-visible steps." : undefined,
    !trace.summary ? "TIG explanation trace is missing a summary." : undefined
  ].filter(Boolean) as string[];
  const warnings = [
    trace.scriptureAnchors.length === 0 ? "TIG explanation trace has no Scripture anchors." : undefined,
    !trace.steps.some((step) => step.source === "tig_graph") ? "TIG explanation trace has no graph relationship step." : undefined
  ].filter(Boolean) as string[];

  return {
    valid: blockers.length === 0,
    blockers,
    warnings
  };
}

export function createTigExplanationTraceReport(trace: TeoyubeTigExplanationTrace) {
  const validation = validateTigExplanationTrace(trace);
  return {
    valid: validation.valid,
    stepCount: trace.steps.length,
    scriptureAnchorCount: trace.scriptureAnchors.length,
    fallbackUsed: trace.fallbackUsed,
    blockers: validation.blockers,
    warnings: validation.warnings,
    generatedAt: new Date().toISOString()
  };
}
