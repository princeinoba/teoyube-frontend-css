import { createSeedTIGQueryClient, getTIGSeedGraph } from "../../tig";
import { getCallingArchetypes } from "../calling/calling-engine";
import { getCoreTeoyubeVocabulary } from "../language/teoyube-language-engine";
import {
  getPromiseClusters,
  getScriptureAnchorsForPromiseCluster,
  validatePromiseClusterScriptureAnchoring,
  type TeoyubePromiseCluster
} from "./promise-engine";

export type TeoyubePromiseTableRow = {
  promiseId: string;
  title: string;
  theme: string;
  scriptureAnchors: string[];
  relatedTeoyubeWords: string[];
  callingLinks: string[];
  prayerLinks: string[];
  tigEdges: Array<{
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
    type: string;
  }>;
  valid: boolean;
  warnings: string[];
};

export type TeoyubePromiseTable = {
  rows: TeoyubePromiseTableRow[];
  rowCount: number;
  valid: boolean;
  blockers: string[];
  warnings: string[];
  generatedFromExistingClusters: true;
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function findWordsForCluster(cluster: TeoyubePromiseCluster): string[] {
  const vocabulary = getCoreTeoyubeVocabulary();
  return unique([
    ...cluster.coreWords,
    ...vocabulary
      .filter((word) =>
        word.promiseConnections.some((connection) => normalize(cluster.theme).includes(normalize(connection)) || normalize(connection).includes(normalize(cluster.theme))) ||
        cluster.coreWords.some((coreWord) => normalize(coreWord) === normalize(word.word))
      )
      .map((word) => word.word)
  ]);
}

function findCallingLinksForCluster(cluster: TeoyubePromiseCluster): string[] {
  const archetypes = getCallingArchetypes();
  return unique([
    cluster.callingConnection || "",
    ...archetypes
      .filter((archetype) =>
        [archetype.category, archetype.primaryCluster || "", archetype.primaryPath || "", ...archetype.coreWords]
          .join(" ")
          .toLowerCase()
          .includes(normalize(cluster.theme))
      )
      .map((archetype) => archetype.name)
  ]);
}

function findTigEdges(cluster: TeoyubePromiseCluster): TeoyubePromiseTableRow["tigEdges"] {
  const graph = getTIGSeedGraph();
  const queryClient = createSeedTIGQueryClient();
  const matchingNodes = queryClient
    .getNodesByType("PROMISE_CLUSTER")
    .filter((node) =>
      normalize(node.id) === normalize(cluster.id) ||
      normalize(node.title) === normalize(cluster.title) ||
      node.tags.some((tag) => normalize(cluster.theme).includes(normalize(tag)))
    );
  const ids = new Set(matchingNodes.map((node) => node.id));

  return graph.relationships
    .filter((relationship) => ids.has(relationship.sourceNodeId) || ids.has(relationship.targetNodeId))
    .map((relationship) => ({
      id: relationship.id,
      sourceNodeId: relationship.sourceNodeId,
      targetNodeId: relationship.targetNodeId,
      type: relationship.type
    }));
}

function createPromiseTableRow(cluster: TeoyubePromiseCluster): TeoyubePromiseTableRow {
  const validation = validatePromiseClusterScriptureAnchoring(cluster);
  return {
    promiseId: cluster.id,
    title: cluster.title,
    theme: cluster.theme,
    scriptureAnchors: getScriptureAnchorsForPromiseCluster(cluster.id),
    relatedTeoyubeWords: findWordsForCluster(cluster),
    callingLinks: findCallingLinksForCluster(cluster),
    prayerLinks: unique([...cluster.prayerSequence, cluster.declaration]),
    tigEdges: findTigEdges(cluster),
    valid: validation.valid,
    warnings: validation.warnings
  };
}

export function createPromiseTable(): TeoyubePromiseTable {
  const rows = getPromiseClusters().map(createPromiseTableRow);
  const validation = validatePromiseTableRows(rows);
  return {
    rows,
    rowCount: rows.length,
    valid: validation.valid,
    blockers: validation.blockers,
    warnings: validation.warnings,
    generatedFromExistingClusters: true
  };
}

export function getPromiseTableRows(): TeoyubePromiseTableRow[] {
  return createPromiseTable().rows;
}

export function filterPromiseTableByTheme(theme: string): TeoyubePromiseTableRow[] {
  const normalizedTheme = normalize(theme);
  return getPromiseTableRows().filter((row) =>
    [row.theme, row.title, ...row.relatedTeoyubeWords, ...row.callingLinks]
      .join(" ")
      .toLowerCase()
      .includes(normalizedTheme)
  );
}

export function filterPromiseTableByWord(wordId: string): TeoyubePromiseTableRow[] {
  const normalizedWord = normalize(wordId);
  return getPromiseTableRows().filter((row) =>
    row.relatedTeoyubeWords.some((word) => normalize(word) === normalizedWord || normalize(word).includes(normalizedWord))
  );
}

export function filterPromiseTableByScripture(scriptureRef: string): TeoyubePromiseTableRow[] {
  const normalizedRef = normalize(scriptureRef);
  return getPromiseTableRows().filter((row) =>
    row.scriptureAnchors.some((anchor) => normalize(anchor).includes(normalizedRef))
  );
}

export function validatePromiseTableRows(rows: TeoyubePromiseTableRow[]) {
  const blockers = rows
    .filter((row) => row.scriptureAnchors.length === 0)
    .map((row) => `Promise table row ${row.promiseId} is missing Scripture anchors.`);
  const warnings = rows
    .filter((row) => row.relatedTeoyubeWords.length === 0)
    .map((row) => `Promise table row ${row.promiseId} has no related Teoyube words yet.`);

  return {
    valid: blockers.length === 0,
    blockers,
    warnings
  };
}
