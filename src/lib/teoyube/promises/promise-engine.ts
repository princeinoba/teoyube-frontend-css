import {
  createSeedTIGQueryClient,
  getTIGSeedGraph,
  TIG_PROMISE_CLUSTER_SEEDS,
  type PromiseClusterNode,
  type TIGRelationship
} from "../../tig";
import {
  getPromiseClustersData,
  getScriptureCanonData
} from "../data/teoyube-data-access";
import { validateTheologyBoundaries } from "../theology/theology-framework";

export type TeoyubePromiseCluster = {
  id: string;
  title: string;
  theme: string;
  description: string;
  scriptureReferences: string[];
  coreWords: string[];
  prayerSequence: string[];
  declaration: string;
  callingConnection?: string;
  source: "src_data" | "tig_seed";
  raw: unknown;
};

export type TeoyubePromiseRecommendationContext = {
  input: string;
  theme?: string;
  clusters: TeoyubePromiseCluster[];
  scriptureAnchors: string[];
  tigRelationships: TIGRelationship[];
  explanationPath: string[];
  valid: boolean;
  blockers: string[];
  warnings: string[];
};

type RawPromiseCluster = Record<string, unknown>;
type RawScriptureCanonEntry = {
  word?: string;
  teoyubeWord?: string;
  scriptureReferences?: string[];
  clusterLinks?: string[];
  graphTags?: string[];
};

const rawPromiseClusters = getPromiseClustersData() as RawPromiseCluster[];
const scriptureCanon = getScriptureCanonData() as RawScriptureCanonEntry[];

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
}

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function tokenize(value: string): string[] {
  return unique(normalize(value).split(/[^a-z0-9]+/).filter((token) => token.length > 2));
}

function normalizeCluster(raw: RawPromiseCluster): TeoyubePromiseCluster {
  const title = asString(raw.title, asString(raw.name, asString(raw.theme, "Promise Cluster")));
  return {
    id: asString(raw.id, asString(raw.cluster_id, title)),
    title,
    theme: asString(raw.theme, asString(raw.promise_category, title)),
    description: asString(raw.description, asString(raw.summary, "")),
    scriptureReferences: unique([
      ...asStringArray(raw.scripture_references),
      asString(raw.anchorScripture),
      asString(raw.anchor_scripture)
    ]),
    coreWords: unique([
      ...asStringArray(raw.coreWords),
      ...asStringArray(raw.core_words),
      ...asStringArray(raw.related_teoyube_words),
      ...asStringArray(raw.keywords)
    ]),
    prayerSequence: unique([
      ...asStringArray(raw.prayerSequence),
      ...asStringArray(raw.prayer_sequence)
    ]),
    declaration: asString(raw.declaration, asString(raw.promiseStatement, "")),
    callingConnection: asString(raw.calling_connection),
    source: "src_data",
    raw
  };
}

function normalizeTigCluster(cluster: PromiseClusterNode): TeoyubePromiseCluster {
  return {
    id: cluster.id,
    title: cluster.title,
    theme: cluster.tags[0] || cluster.title,
    description: cluster.description,
    scriptureReferences: unique([...cluster.scriptureReferences, ...cluster.anchorScriptureIds]),
    coreWords: unique(cluster.teoyubeWordIds),
    prayerSequence: [],
    declaration: cluster.declaration,
    source: "tig_seed",
    raw: cluster
  };
}

export function getPromiseClusters(): TeoyubePromiseCluster[] {
  return [
    ...rawPromiseClusters.map(normalizeCluster),
    ...TIG_PROMISE_CLUSTER_SEEDS.map(normalizeTigCluster)
  ];
}

export function findPromiseClusterById(id: string): TeoyubePromiseCluster | undefined {
  const normalizedId = normalize(id);
  return getPromiseClusters().find((cluster) =>
    [cluster.id, cluster.title, cluster.theme].some((value) => normalize(value) === normalizedId)
  );
}

export function findPromiseClustersByTheme(theme: string): TeoyubePromiseCluster[] {
  const normalizedTheme = normalize(theme);
  const tokens = tokenize(theme);
  if (!normalizedTheme) return [];

  return getPromiseClusters().filter((cluster) => {
    const searchable = [
      cluster.theme,
      cluster.title,
      cluster.description,
      cluster.declaration,
      ...cluster.coreWords,
      ...cluster.scriptureReferences
    ]
      .join(" ")
      .toLowerCase();
    return searchable.includes(normalizedTheme) || tokens.some((token) => searchable.includes(token));
  });
}

export function findPromiseClustersByWord(wordId: string): TeoyubePromiseCluster[] {
  const normalizedWord = normalize(wordId);
  const tokens = tokenize(wordId);
  if (!normalizedWord) return [];

  return getPromiseClusters().filter((cluster) => {
    const searchable = [
      cluster.id,
      cluster.title,
      cluster.theme,
      cluster.description,
      ...cluster.coreWords
    ]
      .join(" ")
      .toLowerCase();
    return searchable.includes(normalizedWord) || tokens.some((token) => searchable.includes(token));
  });
}

export function getScriptureAnchorsForPromiseCluster(clusterId: string): string[] {
  const cluster = findPromiseClusterById(clusterId);
  if (!cluster) return [];

  const wordAnchors = scriptureCanon
    .filter((entry) => {
      const clusterLinks = entry.clusterLinks || [];
      const word = entry.word || entry.teoyubeWord || "";
      return cluster.coreWords.some((coreWord) => normalize(coreWord) === normalize(word)) ||
        clusterLinks.some((link) => normalize(cluster.theme).includes(normalize(link)) || normalize(cluster.title).includes(normalize(link)));
    })
    .flatMap((entry) => entry.scriptureReferences || []);

  return unique([...cluster.scriptureReferences, ...wordAnchors]);
}

export function validatePromiseClusterScriptureAnchoring(cluster: TeoyubePromiseCluster) {
  const anchors = unique([...cluster.scriptureReferences, ...getScriptureAnchorsForPromiseCluster(cluster.id)]);
  return validateTheologyBoundaries({
    scriptureReferences: anchors,
    explanationPath: [
      `Promise cluster ${cluster.title} is connected to ${anchors.length} Scripture anchor(s).`
    ],
    text: cluster.declaration
  });
}

function findTigRelationshipsForCluster(cluster: TeoyubePromiseCluster): TIGRelationship[] {
  const graph = getTIGSeedGraph();
  const possibleIds = new Set([
    cluster.id,
    ...TIG_PROMISE_CLUSTER_SEEDS
      .filter((seed) => normalize(seed.title) === normalize(cluster.title) || normalize(seed.id) === normalize(cluster.id))
      .map((seed) => seed.id)
  ]);

  return graph.relationships.filter((relationship) =>
    possibleIds.has(relationship.sourceNodeId) || possibleIds.has(relationship.targetNodeId)
  );
}

export function createPromiseRecommendationContext(input: {
  query?: string;
  theme?: string;
  clusterId?: string;
  limit?: number;
} = {}): TeoyubePromiseRecommendationContext {
  const query = input.query || input.theme || input.clusterId || "";
  const clusters = input.clusterId
    ? ([findPromiseClusterById(input.clusterId)].filter(Boolean) as TeoyubePromiseCluster[])
    : findPromiseClustersByTheme(query || "calling").slice(0, input.limit || 5);
  const scriptureAnchors = unique(clusters.flatMap((cluster) => getScriptureAnchorsForPromiseCluster(cluster.id)));
  const tigRelationships = clusters.flatMap(findTigRelationshipsForCluster);
  const validationReports = clusters.map(validatePromiseClusterScriptureAnchoring);
  const blockers = validationReports.flatMap((report) => report.blockers);
  const warnings = validationReports.flatMap((report) => report.warnings);
  const queryClient = createSeedTIGQueryClient();
  const tigClusterCount = queryClient.getNodesByType("PROMISE_CLUSTER").length;

  return {
    input: query,
    theme: input.theme,
    clusters,
    scriptureAnchors,
    tigRelationships,
    explanationPath: [
      `Matched ${clusters.length} promise cluster(s) from existing promise data and TIG seeds.`,
      `Found ${scriptureAnchors.length} Scripture anchor(s).`,
      `TIG seed graph currently exposes ${tigClusterCount} promise cluster node(s).`
    ],
    valid: clusters.length > 0 && blockers.length === 0,
    blockers,
    warnings
  };
}
