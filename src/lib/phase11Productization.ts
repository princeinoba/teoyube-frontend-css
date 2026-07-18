import {
  createPhase112BookEntries,
  createPhase112ProductizationSummary,
  createPromiseTableRows,
  createTeoGuideResponse,
  generateTodayJourney,
  getGuardrailsContent,
  getPhase112ButtonActionMap,
  getPhase112RouteConfigs,
  runCallingCompassPreview,
  runTeoyubeSearch
} from "./phase112Productization";
import {
  getAllPromiseClusters,
  getAllScriptures,
  getAllTeoyubeWords,
  getTeoyubeDataSourceSummary,
  searchMedia
} from "./teoyube/data-access";

export type Phase11ProductSurface =
  | "canon"
  | "daily_word"
  | "promise_search"
  | "prayer"
  | "calling_compass"
  | "journey"
  | "journal"
  | "book"
  | "personalization"
  | "tig_graph"
  | "ai_companion";

function surfaceLabel(surface: Phase11ProductSurface): string {
  return surface.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function createPhase11DailyWordContext(seedDate?: string) {
  const journey = generateTodayJourney(seedDate);
  return {
    ...journey,
    dailyWord: journey.dailyWord,
    words: getAllTeoyubeWords(),
    scriptures: getAllScriptures(),
    sessionHelpersValid: true
  };
}

export function createPhase11SeedSummary() {
  const data = getTeoyubeDataSourceSummary();
  return {
    phase: "11.3",
    primaryRuntime: "static-node-app",
    nextRuntimeDeferred: true,
    data,
    routes: getPhase11RouteInventory().length,
    buttons: getPhase11ButtonBehaviorMap().length,
    safety: getGuardrailsContent().safety
  };
}

export function getPhase11RouteInventory() {
  return getPhase112RouteConfigs().map((route) => ({
    ...route,
    key: route.key || route.id,
    primaryDataSource: route.primaryDataSource || "local data-access"
  }));
}

export function getPhase11ButtonBehaviorMap() {
  return getPhase112ButtonActionMap();
}

export function runPhase11TigSurface(
  surface: Phase11ProductSurface,
  input = "I feel stuck and need purpose.",
  context: Record<string, unknown> = {}
) {
  const search = runTeoyubeSearch(input, "all");
  const row = search.rows[0];
  const calling = runCallingCompassPreview(input);
  const promiseRows = createPromiseTableRows(3);
  const scripture =
    row?.scriptureAnchors?.[0] ||
    calling.scriptureAnchor ||
    getAllScriptures()[0]?.reference ||
    "Psalm 119:105";
  const cluster =
    row?.promiseCategory ||
    promiseRows[0]?.category ||
    getAllPromiseClusters()[0]?.title ||
    "Obedience and Direction";
  const word = row?.teoyubeWord || calling.relatedWord || "TEOYUBE";
  const explanationPath = [
    `Surface selected: ${surfaceLabel(surface)}.`,
    `Detected need: ${input}`,
    `Selected promise cluster: ${cluster}.`,
    `Selected Scripture anchor: ${scripture}.`,
    `Selected Teoyube word: ${word}.`,
    "Recommendation is local, explainable, Scripture-anchored, and non-directive."
  ];

  return {
    surface,
    input,
    context,
    production: {
      surface,
      input,
      scriptureReferences: [scripture],
      explanationPath,
      confidenceLabel: row?.confidenceLabel || calling.confidenceLabel,
      fallbackUsed: Boolean(row?.fallbackReason || calling.fallbackReason),
      safetyStatus: "local_preview_safe"
    },
    responsePanel: {
      title: `${surfaceLabel(surface)} local response`,
      subtitle: "Local TIG-compatible preview. No live AI, analytics, or persistence required.",
      selectionRows: [
        { label: "Word", value: word },
        { label: "Promise", value: cluster },
        { label: "Scripture", value: scripture },
        { label: "Action", value: calling.actionStep }
      ],
      confidence: {
        label: row?.confidenceLabel || calling.confidenceLabel,
        score: row?.scriptureAnchors?.length ? 0.86 : 0.68
      },
      fallback: {
        used: Boolean(row?.fallbackReason || calling.fallbackReason),
        reason: row?.fallbackReason || calling.fallbackReason || ""
      },
      safety: {
        status: "local_preview_safe",
        noExternalServicesRequired: true
      }
    },
    graphPanel: {
      statistics: {
        totalNodes: 4,
        totalEdges: 3,
        scriptureAnchors: 1
      },
      nodes: [
        { id: "need", label: input || "need", type: "need" },
        { id: "word", label: word, type: "word" },
        { id: "promise", label: cluster, type: "promise" },
        { id: "scripture", label: scripture, type: "scripture" }
      ],
      edges: [
        { source: "need", target: "word", label: "matched locally" },
        { source: "word", target: "promise", label: "connects to" },
        { source: "promise", target: "scripture", label: "anchored by" }
      ],
      listFallbackAvailable: true
    },
    explanationPanel: {
      items: explanationPath,
      scriptureEvidence: [scripture],
      confidenceBreakdown: [
        "Scripture anchor present",
        "Promise cluster selected from local data",
        "Fallback reason visible when used"
      ]
    },
    noExternalServicesRequired: true
  };
}

export function createPhase11PersonalizationPreview(inputOrEnabled: string | boolean = true, enabledMaybe = true) {
  const input = typeof inputOrEnabled === "string" ? inputOrEnabled : "I need direction.";
  const enabled = typeof inputOrEnabled === "boolean" ? inputOrEnabled : enabledMaybe;
  const baseline = runPhase11TigSurface("promise_search", input, { personalization: "baseline" });
  const preview = enabled
    ? runPhase11TigSurface("promise_search", input, { personalization: "session_preview" })
    : baseline;

  return {
    enabled,
    baseline,
    preview,
    noRawPrivateTextStored: true,
    scriptureAnchorPreserved:
      baseline.explanationPanel.scriptureEvidence[0] === preview.explanationPanel.scriptureEvidence[0]
  };
}

export function createPhase11SafeExportBundle() {
  return {
    exportedAt: new Date().toISOString(),
    rawPrivateTextIncluded: false,
    bookEntries: createPhase112BookEntries(),
    promiseTable: createPromiseTableRows(8),
    media: searchMedia("", { pageSize: 8 }).items,
    safety: getGuardrailsContent().safety
  };
}

export function createPhase11ProductizationSummary() {
  return {
    ...createPhase112ProductizationSummary(),
    phase: "11.3",
    primaryRuntime: "static-node-app",
    nextRuntimeDeferred: true,
    teoGuide: createTeoGuideResponse("Help me understand my next faithful step."),
    seedSummary: createPhase11SeedSummary()
  };
}
