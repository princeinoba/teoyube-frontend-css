import {
  getAllActionSteps,
  getAllPromiseClusters,
  getAllScriptures,
  getAllWords,
  getDailyWord,
  getJourneyById,
  getTeoyubeDataSourceSummary,
  searchMedia,
  searchTeoyubeCanon,
  type NormalizedPromiseCluster,
  type NormalizedScriptureRecord,
  type NormalizedTeoyubeMediaRecord,
  type NormalizedTeoyubeWord,
  type TeoyubeMediaSearchResult
} from "./data-access";

type UnknownRecord = Record<string, unknown>;

export type Phase112SafetyStatus = {
  localOnly: true;
  noExternalServices: true;
  noAnalytics: true;
  noDatabasePersistence: true;
  noLiveAi: true;
  noRawPrivateTextStored: true;
  noBrowserPersistenceRequired: true;
  noAutomaticContact: true;
  testimonyUserRecordedOnly: true;
};

export type Phase112PromiseTableStatus =
  | "Discovered"
  | "Studying"
  | "Praying"
  | "Acting"
  | "Witnessing Progress"
  | "Testified"
  | "Remembered";

export type Phase112PromiseTableRow = {
  id: string;
  promise: string;
  scripture: string;
  teoyubeWord: string;
  category: string;
  level: "A" | "B" | "C" | "Preview";
  status: Phase112PromiseTableStatus;
  prayer: string;
  action: string;
  dateAdded: string;
  confidenceLabel: string;
  fallbackReason?: string;
  explanationPath: string[];
  testimonyRule: "user_recorded_only";
};

export type Phase112BookEntry = {
  id: string;
  type: "reflection" | "assignment" | "promise" | "testimony" | "media";
  title: string;
  summary: string;
  scriptureReferences: string[];
  tags: string[];
  createdAt: string;
};

export type Phase112TestimonyRecord = {
  id: string;
  title: string;
  category: string;
  body: string;
  status: "Draft" | "Private" | "Public";
  scriptureReferences: string[];
  createdAt: string;
  userRecordedOnly: boolean;
};

export type Phase112TodayJourney = {
  id: string;
  date: string;
  dailyWord: NormalizedTeoyubeWord;
  scripture: {
    reference: string;
    source: "word" | "promise_cluster" | "scripture_canon" | "fallback";
  };
  promiseCluster: {
    id: string;
    title: string;
    scriptureAnchors: string[];
  };
  prayer: string;
  actionStep: string;
  journeyId?: string;
  confidenceLabel: string;
  fallback: {
    used: boolean;
    reason?: string;
  };
  explanationPath: string[];
  safety: Phase112SafetyStatus;
};

export type Phase112TeoyubeSearchRow = {
  id: string;
  teoyubeWord: string;
  meaning: string;
  promiseCategory: string;
  scriptureAnchors: string[];
  confidenceLabel: string;
  fallbackReason?: string;
  safetyState: "local_preview_safe";
  explanationPath: string[];
};

export type Phase112TeoyubeSearchResult = {
  query: string;
  category: string;
  rows: Phase112TeoyubeSearchRow[];
  emptySuggestions: string[];
  safety: Phase112SafetyStatus;
};

export type Phase112CallingCompassPreview = {
  query: string;
  suggestedCallingPattern: string;
  scriptureAnchor: string;
  relatedWord: string;
  relatedPromiseCluster: string;
  prayer: string;
  actionStep: string;
  confidenceLabel: string;
  fallbackReason?: string;
  explanationPath: string[];
  safety: Phase112SafetyStatus;
};

export type Phase112TeoGuideResponse = {
  prompt: string;
  response: string;
  scriptureAnchor: string;
  promiseCluster: string;
  teoyubeWord: string;
  prayer: string;
  actionStep: string;
  confidenceLabel: string;
  fallbackNotice?: string;
  explanationPath: string[];
  safety: Phase112SafetyStatus;
};

export type Phase112RouteConfig = {
  id: string;
  label: string;
  href: string;
  view: string;
  status: "implemented" | "local_preview" | "disabled_safe";
  handler: string;
};

export type Phase112ButtonAction = {
  page: string;
  label: string;
  handler: string;
  expectedBehavior: string;
  dataSource: string;
  implemented: boolean;
  disabled: boolean;
  fallbackBehavior: string;
};

export type Phase112GuardrailsContent = {
  title: string;
  points: string[];
  safety: Phase112SafetyStatus;
};

export type Phase112ProductizationSummary = {
  phase: "11.2";
  dataSources: ReturnType<typeof getTeoyubeDataSourceSummary>;
  routes: Phase112RouteConfig[];
  buttons: Phase112ButtonAction[];
  safety: Phase112SafetyStatus;
  personalizationNoRawText: true;
  teoGuideAnchor: string;
  mediaSourceStatus: NormalizedTeoyubeMediaRecord["sourceStatus"] | "source_not_connected";
  nextStep: "Phase 11.3 - Advanced User Testing, Mobile Polish, Accessibility Hardening & Real-World Beta Readiness";
};

function safeText(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function safeId(prefix: string, value: string, index = 0): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `${prefix}_${slug || index + 1}`;
}

function firstScriptureFromWord(word: NormalizedTeoyubeWord | undefined): string {
  return word?.scriptureReferences?.find(Boolean) || "";
}

function firstScriptureFromCluster(cluster: NormalizedPromiseCluster | undefined): string {
  return cluster?.scriptureAnchors?.find(Boolean) || cluster?.anchorScripture || "";
}

function firstUsableScripture(): NormalizedScriptureRecord {
  return (
    getAllScriptures().find((entry) => entry.reference || entry.scriptureReferences.length) ||
    ({
      id: "scripture_psalm_119_105",
      reference: "Psalm 119:105",
      word: "Guidance",
      teoyubeWord: "ORAH",
      meaning: "Scripture gives light for the next faithful step.",
      category: "Guidance",
      scriptureReferences: ["Psalm 119:105"],
      promiseStatement: "Your word is a lamp to my feet and a light to my path.",
      clusterLinks: [],
      original: {}
    } satisfies NormalizedScriptureRecord)
  );
}

function defaultPromiseCluster(): NormalizedPromiseCluster {
  return (
    getAllPromiseClusters()[0] ||
    ({
      id: "cluster_obedience_direction",
      name: "Obedience and Direction",
      title: "Obedience and Direction",
      theme: "Direction",
      coreWords: ["hearing", "walking", "instruction"],
      scriptureAnchors: ["Proverbs 3:5-6"],
      anchorScripture: "Proverbs 3:5-6",
      declaration: "The next faithful step should be tested through Scripture, prayer, counsel, fruit, and time.",
      source: "promise_clusters",
      original: {}
    } satisfies NormalizedPromiseCluster)
  );
}

function findClusterForWord(word: NormalizedTeoyubeWord | undefined): NormalizedPromiseCluster {
  const clusters = getAllPromiseClusters();
  if (!word) return defaultPromiseCluster();
  const wordTerms = [word.word, word.teoyubeWord, word.promiseCategory, word.category]
    .map((item) => item.toLowerCase())
    .filter(Boolean);
  return (
    clusters.find((cluster) =>
      [cluster.name, cluster.title, cluster.theme, ...cluster.coreWords]
        .map((item) => item.toLowerCase())
        .some((item) => wordTerms.some((term) => item.includes(term) || term.includes(item)))
    ) || defaultPromiseCluster()
  );
}

function getActionStep(seed = ""): string {
  const action = getAllActionSteps().find((item) => JSON.stringify(item).toLowerCase().includes(seed.toLowerCase())) || getAllActionSteps()[0];
  return safeText((action as UnknownRecord | undefined)?.title) ||
    safeText((action as UnknownRecord | undefined)?.action) ||
    "Pray, read the Scripture anchor, write one reflection, and take one faithful next step.";
}

function buildPrayer(word: NormalizedTeoyubeWord, scriptureReference: string): string {
  return `Father, root this step in ${scriptureReference}. Give humility, wisdom, and courage to respond faithfully without presuming certainty.`;
}

function confidenceForAnchors(scriptures: string[]): string {
  return scriptures.length ? "High confidence - Scripture anchor present" : "Cautious fallback - Scripture anchor needs review";
}

export function getPhase112SafetyStatus(): Phase112SafetyStatus {
  return {
    localOnly: true,
    noExternalServices: true,
    noAnalytics: true,
    noDatabasePersistence: true,
    noLiveAi: true,
    noRawPrivateTextStored: true,
    noBrowserPersistenceRequired: true,
    noAutomaticContact: true,
    testimonyUserRecordedOnly: true
  };
}

export function getGuardrailsContent(): Phase112GuardrailsContent {
  return {
    title: "Teoyube Guardrails",
    points: [
      "Scripture is the highest authority; Teoyube words are aids, not Scripture.",
      "The local engine does not claim divine certainty or say God told the app something.",
      "Major decisions should be tested through prayer, Scripture, wise counsel, fruit, and time.",
      "Teoyube does not replace pastoral, medical, legal, financial, emergency, or professional support.",
      "Testimony is user-recorded only and is never automatically certified as promise fulfillment.",
      "Personalization is session-only/local preview unless the user explicitly enables more later.",
      "Raw private text storage, analytics, database persistence, automatic contact, and external AI calls are disabled."
    ],
    safety: getPhase112SafetyStatus()
  };
}

export function generateTodayJourney(seedDate = new Date().toISOString().slice(0, 10)): Phase112TodayJourney {
  const dailyWord = getDailyWord(seedDate);
  const cluster = findClusterForWord(dailyWord);
  const fallbackScripture = firstUsableScripture();
  const scriptureReference =
    firstScriptureFromWord(dailyWord) ||
    firstScriptureFromCluster(cluster) ||
    fallbackScripture.reference ||
    fallbackScripture.scriptureReferences[0] ||
    "Psalm 119:105";
  const scriptureSource = firstScriptureFromWord(dailyWord)
    ? "word"
    : firstScriptureFromCluster(cluster)
      ? "promise_cluster"
      : fallbackScripture.reference
        ? "scripture_canon"
        : "fallback";
  const actionStep = getActionStep(dailyWord.word);
  const journey = getJourneyById(String(dailyWord.id)) || getJourneyById(String(cluster.id));

  return {
    id: safeId("today_journey", `${seedDate}_${dailyWord.word}`),
    date: seedDate,
    dailyWord,
    scripture: {
      reference: scriptureReference,
      source: scriptureSource
    },
    promiseCluster: {
      id: cluster.id,
      title: cluster.title || cluster.name,
      scriptureAnchors: cluster.scriptureAnchors.length ? cluster.scriptureAnchors : [scriptureReference]
    },
    prayer: buildPrayer(dailyWord, scriptureReference),
    actionStep,
    journeyId: journey?.id,
    confidenceLabel: confidenceForAnchors([scriptureReference]),
    fallback: {
      used: scriptureSource === "fallback",
      reason: scriptureSource === "fallback" ? "A default Scripture anchor was used because the selected word lacked anchors." : undefined
    },
    explanationPath: [
      `Daily word selected from local Teoyube vocabulary: ${dailyWord.word}.`,
      `Promise cluster matched locally: ${cluster.title || cluster.name}.`,
      `Scripture anchor preserved: ${scriptureReference}.`,
      "Prayer and action are generated from local rules and remain devotional, not directive."
    ],
    safety: getPhase112SafetyStatus()
  };
}

export function runTeoyubeSearch(query = "", category = "all"): Phase112TeoyubeSearchResult {
  const canon = searchTeoyubeCanon(query, { category, limit: 8 });
  const words = canon.words.length ? canon.words : getAllWords().slice(0, 4);
  const rows = words.map((word, index) => {
    const cluster = findClusterForWord(word);
    const scriptureAnchors = word.scriptureReferences.length
      ? word.scriptureReferences
      : cluster.scriptureAnchors.length
        ? cluster.scriptureAnchors
        : [firstUsableScripture().reference || "Psalm 119:105"];

    return {
      id: safeId("search_result", `${query}_${word.word}`, index),
      teoyubeWord: word.word,
      meaning: word.meaning,
      promiseCategory: word.promiseCategory || cluster.theme || word.category,
      scriptureAnchors,
      confidenceLabel: confidenceForAnchors(scriptureAnchors),
      fallbackReason: word.scriptureReferences.length ? undefined : "Word-level Scripture anchor missing; related promise/canon anchor shown.",
      safetyState: "local_preview_safe" as const,
      explanationPath: [
        "Matched against local vocabulary, promise clusters, Scripture canon, and journey seed data.",
        `Word: ${word.word}.`,
        `Promise category: ${word.promiseCategory || cluster.theme || word.category}.`,
        `Scripture anchor: ${scriptureAnchors[0]}.`
      ]
    };
  });

  return {
    query,
    category,
    rows,
    emptySuggestions: ["direction", "wisdom", "calling", "peace", "identity"],
    safety: getPhase112SafetyStatus()
  };
}

export function createPromiseTableRowFromSearch(search = "purpose"): Phase112PromiseTableRow {
  const result = runTeoyubeSearch(search, "all").rows[0];
  const cluster = findClusterForWord(getAllWords().find((word) => word.word === result?.teoyubeWord));
  const scripture = result?.scriptureAnchors[0] || firstScriptureFromCluster(cluster) || "Psalm 119:105";

  return {
    id: safeId("promise_table", `${search}_${result?.teoyubeWord || cluster.id}`),
    promise: cluster.declaration || cluster.title || "A Scripture-rooted promise connection is ready for review.",
    scripture,
    teoyubeWord: result?.teoyubeWord || cluster.coreWords[0] || "TEOYUBE",
    category: result?.promiseCategory || cluster.theme || "Promise",
    level: "Preview",
    status: "Discovered",
    prayer: `Pray through ${scripture} and ask for one faithful response.`,
    action: getActionStep(search),
    dateAdded: "2026-07-10",
    confidenceLabel: confidenceForAnchors([scripture]),
    fallbackReason: result?.fallbackReason,
    explanationPath: result?.explanationPath || ["Promise row created from local search data."],
    testimonyRule: "user_recorded_only"
  };
}

export function createPromiseTableRows(limit = 8): Phase112PromiseTableRow[] {
  return getAllPromiseClusters()
    .slice(0, Math.max(1, limit))
    .map((cluster, index) => {
      const scripture = firstScriptureFromCluster(cluster) || firstUsableScripture().reference || "Psalm 119:105";
      const word = getAllWords().find((item) =>
        cluster.coreWords.some((coreWord) => item.word.toLowerCase().includes(coreWord.toLowerCase()))
      );

      return {
        id: safeId("promise_table", cluster.id || cluster.title, index),
        promise: cluster.declaration || cluster.title || cluster.name,
        scripture,
        teoyubeWord: word?.word || cluster.coreWords[0] || "TEOYUBE",
        category: cluster.theme || cluster.name,
        level: index % 3 === 0 ? "A" : index % 3 === 1 ? "B" : "C",
        status: "Discovered",
        prayer: `Pray through ${scripture} with humility and obedience.`,
        action: getActionStep(cluster.theme),
        dateAdded: "2026-07-10",
        confidenceLabel: confidenceForAnchors([scripture]),
        fallbackReason: cluster.scriptureAnchors.length ? undefined : "Cluster anchor missing; canon fallback shown.",
        explanationPath: [
          `Promise cluster source: ${cluster.id}.`,
          `Scripture anchor: ${scripture}.`,
          "Status changes remain user-driven; testimony is not auto-certified."
        ],
        testimonyRule: "user_recorded_only"
      };
    });
}

export function runCallingCompassPreview(query = ""): Phase112CallingCompassPreview {
  const search = runTeoyubeSearch(query || "calling purpose", "all");
  const row = search.rows[0];
  const word = getAllWords().find((item) => item.word === row?.teoyubeWord) || getDailyWord("calling");
  const cluster = findClusterForWord(word);
  const scriptureAnchor = row?.scriptureAnchors[0] || firstScriptureFromCluster(cluster) || "Ephesians 2:10";

  return {
    query,
    suggestedCallingPattern: `Your strongest indicators suggest an emerging ${word.category || cluster.theme || "calling"} pattern. Test this through Scripture, wise counsel, repeated fruit, and time.`,
    scriptureAnchor,
    relatedWord: word.word,
    relatedPromiseCluster: cluster.title || cluster.name,
    prayer: buildPrayer(word, scriptureAnchor),
    actionStep: getActionStep(query || word.word),
    confidenceLabel: confidenceForAnchors([scriptureAnchor]),
    fallbackReason: row?.fallbackReason,
    explanationPath: [
      "Compass preview matched local words, promise clusters, and Scripture anchors.",
      "Calling language remains cautious and non-deterministic.",
      `Related word: ${word.word}.`,
      `Scripture anchor: ${scriptureAnchor}.`
    ],
    safety: getPhase112SafetyStatus()
  };
}

export function createTeoGuideResponse(prompt = ""): Phase112TeoGuideResponse {
  const compass = runCallingCompassPreview(prompt || "wisdom direction");
  const word = compass.relatedWord;

  return {
    prompt,
    response: `Based on local Scripture-rooted Teoyube data, this may point toward ${compass.relatedPromiseCluster}. Start with ${compass.scriptureAnchor}, pray for humility, and take one faithful next step rather than treating the result as certainty.`,
    scriptureAnchor: compass.scriptureAnchor,
    promiseCluster: compass.relatedPromiseCluster,
    teoyubeWord: word,
    prayer: compass.prayer,
    actionStep: compass.actionStep,
    confidenceLabel: compass.confidenceLabel,
    fallbackNotice: compass.fallbackReason,
    explanationPath: compass.explanationPath,
    safety: getPhase112SafetyStatus()
  };
}

export function getPhase112Media(query = "", category = "all", page = 1): TeoyubeMediaSearchResult {
  return searchMedia(query, {
    category,
    page,
    pageSize: 4,
    sort: "latest"
  });
}

export function createPhase112BookEntries(): Phase112BookEntry[] {
  const today = generateTodayJourney("2026-07-10");
  const rows = createPromiseTableRows(3);

  return [
    {
      id: "book_today_assignment",
      type: "assignment",
      title: "Daily Divine Assignment",
      summary: today.actionStep,
      scriptureReferences: [today.scripture.reference],
      tags: [today.dailyWord.word, today.promiseCluster.title],
      createdAt: "2026-07-10T00:00:00.000Z"
    },
    ...rows.map((row, index) => ({
      id: safeId("book_promise", row.id, index),
      type: "promise" as const,
      title: row.promise,
      summary: row.action,
      scriptureReferences: [row.scripture],
      tags: [row.teoyubeWord, row.category],
      createdAt: "2026-07-10T00:00:00.000Z"
    }))
  ];
}

export function createPhase112Testimonies(): Phase112TestimonyRecord[] {
  return [
    {
      id: "testimony_peace_in_storm",
      title: "God's Peace in the Storm",
      category: "Faith",
      body: "User-recorded testimony preview connected to Scripture anchors. Teoyube does not certify fulfillment.",
      status: "Private",
      scriptureReferences: ["Psalm 121:7", "Philippians 4:7"],
      createdAt: "2026-07-10T00:00:00.000Z",
      userRecordedOnly: true
    },
    {
      id: "testimony_new_beginning",
      title: "A New Beginning",
      category: "Grace",
      body: "Local draft testimony preview. Sharing remains disabled until the user explicitly chooses a future sharing flow.",
      status: "Draft",
      scriptureReferences: ["2 Corinthians 5:17", "Isaiah 43:19"],
      createdAt: "2026-07-10T00:00:00.000Z",
      userRecordedOnly: true
    }
  ];
}

export function getPhase112RouteConfigs(): Phase112RouteConfig[] {
  return [
    ["today", "Today", "#today", "today"],
    ["roadmap", "Roadmap", "#roadmap", "roadmap"],
    ["search", "TeoyubeSearch", "#search", "search"],
    ["canon", "Canon", "#canon", "canon"],
    ["table", "Promise Table", "#table", "table"],
    ["calling", "Calling Compass", "#calling", "calling"],
    ["book", "Book of the Saint", "#book", "book"],
    ["lexicon", "Lexicon", "#lexicon", "lexicon"],
    ["testimony", "Testimony", "#testimony", "testimony"],
    ["guide", "Teo Guide", "#guide", "guide"],
    ["ui-elements", "Embedded Videos", "#ui-elements", "ui-elements"],
    ["teoyube-tables", "Tables", "#teoyube-tables", "teoyube-tables"]
  ].map(([id, label, href, view]) => ({
    id,
    label,
    href,
    view,
    status: "implemented",
    handler: `navigate:${view}`
  }));
}

export function getPhase112ButtonActionMap(): Phase112ButtonAction[] {
  return [
    ["Global", "Guardrails", "openGuardrailsModal", "Open safety and theology boundary modal.", "theology guardrails/local copy", true, false, "No external service required."],
    ["Global", "Generate Today's Journey", "generateTodayJourney", "Create a local daily word, promise, Scripture, prayer, and action step.", "data-access/local TIG-compatible adapter", true, false, "Uses Scripture fallback when anchors are missing."],
    ["Today", "Start Today's Journey", "startTodayJourney", "Select today's local journey state and scroll to the assignment.", "generateTodayJourney", true, false, "Shows local status toast."],
    ["Today", "View My Journey", "navigateBook", "Navigate to Book of the Saint.", "session activity/book entries", true, false, "Falls back to Book view."],
    ["TeoyubeSearch", "Search Promise", "runTeoyubeSearch", "Search local words, promises, Scripture, and journeys.", "data-access search", true, false, "Shows suggestions on empty result."],
    ["TeoyubeSearch", "Add to Promise Table", "createPromiseTableRowFromSearch", "Add a session-only promise row.", "promise clusters/search result", true, false, "Testimony remains user-recorded only."],
    ["Canon", "Create New Journey", "createLocalJourneyPreview", "Prepare a local journey preview from selected canon item.", "journey seeds/canon search", true, false, "No database write."],
    ["Promise Table", "Watch Video", "showLocalMediaNotice", "Show source-not-connected status.", "local media records", true, true, "External embeds disabled."],
    ["Calling Compass", "Ask the Assistant", "runCallingCompassPreview", "Run local cautious calling preview.", "words/promises/scripture/action steps", true, false, "Uses cautious language."],
    ["Book of the Saint", "Export Journal", "exportSessionJournal", "Export safe JSON/Markdown from session entries.", "session book entries", true, false, "No raw private hidden persistence."],
    ["Lexicon", "Pray Framework", "openWordPrayerFramework", "Open word detail prayer framework.", "core vocabulary", true, false, "Shows Scripture anchor fallback."],
    ["Testimony", "Save Testimony", "saveSessionTestimony", "Save local user-recorded testimony draft.", "session testimony list", true, false, "Never auto-certifies fulfillment."],
    ["Teo Guide", "Ask", "createTeoGuideResponse", "Return local Scripture-grounded response.", "local adapter", true, false, "No live AI call."],
    ["Embedded Videos", "Refresh TeoyubeWorld", "loadUiElementsYoutubeFeed", "Refresh local preview media.", "local media records", true, true, "Shows local preview refreshed."],
    ["Embedded Videos", "Load More Videos", "getPhase112Media", "Paginate local media records.", "TEOYUBE_MEDIA_LIBRARY", true, false, "Shows empty state when exhausted."]
  ].map(([page, label, handler, expectedBehavior, dataSource, implemented, disabled, fallbackBehavior]) => ({
    page: String(page),
    label: String(label),
    handler: String(handler),
    expectedBehavior: String(expectedBehavior),
    dataSource: String(dataSource),
    implemented: Boolean(implemented),
    disabled: Boolean(disabled),
    fallbackBehavior: String(fallbackBehavior)
  }));
}

export function createPhase112ProductizationSummary(): Phase112ProductizationSummary {
  const guide = createTeoGuideResponse("Help me overcome confusion with Scripture.");
  const media = getPhase112Media("promise", "all", 1);

  return {
    phase: "11.2",
    dataSources: getTeoyubeDataSourceSummary(),
    routes: getPhase112RouteConfigs(),
    buttons: getPhase112ButtonActionMap(),
    safety: getPhase112SafetyStatus(),
    personalizationNoRawText: true,
    teoGuideAnchor: guide.scriptureAnchor,
    mediaSourceStatus: media.items[0]?.sourceStatus || "source_not_connected",
    nextStep: "Phase 11.3 - Advanced User Testing, Mobile Polish, Accessibility Hardening & Real-World Beta Readiness"
  };
}
