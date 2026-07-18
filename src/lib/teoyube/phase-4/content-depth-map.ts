import { getTIGSeedGraph } from "../../tig";
import { getCallingArchetypes } from "../calling/calling-engine";
import {
  getCoreTeoyubeVocabulary,
  getPromiseClustersData,
  getScriptureCanonData
} from "../data/teoyube-data-access";
import { createPromiseTable } from "../promises/promise-table";

export type TeoyubeContentDepthMapSection = {
  id: string;
  label: string;
  total: number;
  strongIds: string[];
  weakIds: string[];
  missingIds: string[];
  readyForPublicPolishIds: string[];
  needsOwnerReviewIds: string[];
  notes: string[];
};

export type TeoyubeContentDepthMapReport = {
  valid: boolean;
  sections: TeoyubeContentDepthMapSection[];
  blockers: string[];
  warnings: string[];
  noNewContentCreated: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function section(
  id: string,
  label: string,
  total: number,
  strongIds: string[],
  weakIds: string[],
  missingIds: string[],
  notes: string[] = []
): TeoyubeContentDepthMapSection {
  return {
    id,
    label,
    total,
    strongIds: unique(strongIds),
    weakIds: unique(weakIds),
    missingIds: unique(missingIds),
    readyForPublicPolishIds: unique(strongIds).slice(0, 24),
    needsOwnerReviewIds: unique([...weakIds, ...missingIds]),
    notes
  };
}

export function mapVocabularyContentDepth(): TeoyubeContentDepthMapSection {
  const vocabulary = getCoreTeoyubeVocabulary();
  const strong = vocabulary.filter((item) => item.scriptureReferences.length >= 2);
  const weak = vocabulary.filter((item) => item.scriptureReferences.length === 1);
  const missing = vocabulary.filter((item) => item.scriptureReferences.length === 0);
  return section(
    "vocabulary_depth",
    "Teoyube vocabulary depth",
    vocabulary.length,
    strong.map((item) => item.id),
    weak.map((item) => item.id),
    missing.map((item) => item.id),
    ["Strong words have two or more Scripture references; weak words have one direct reference."]
  );
}

export function mapPromiseClusterContentDepth(): TeoyubeContentDepthMapSection {
  const clusters = getPromiseClustersData();
  const strong = clusters.filter((cluster) => cluster.scriptureReferences.length >= 2 && cluster.coreWords.length > 0 && cluster.prayerSequence.length > 0);
  const weak = clusters.filter((cluster) => cluster.scriptureReferences.length === 1 || cluster.coreWords.length === 0 || cluster.prayerSequence.length === 0);
  const missing = clusters.filter((cluster) => cluster.scriptureReferences.length === 0);
  return section(
    "promise_cluster_depth",
    "Promise Cluster depth",
    clusters.length,
    strong.map((cluster) => cluster.id),
    weak.map((cluster) => cluster.id),
    missing.map((cluster) => cluster.id),
    ["Strong clusters have multiple Scripture anchors, core words, and prayer sequence data."]
  );
}

export function mapScriptureCanonContentDepth(): TeoyubeContentDepthMapSection {
  const canon = getScriptureCanonData();
  const strong = canon.filter((entry) => entry.scriptureReferences.length >= 1 && entry.scriptureThemes.length >= 1);
  const weak = canon.filter((entry) => entry.scriptureReferences.length === 0 && entry.scriptureThemes.length > 0);
  const missing = canon.filter((entry) => entry.scriptureReferences.length === 0 && entry.scriptureThemes.length === 0);
  return section(
    "scripture_canon_depth",
    "Scripture Canon depth",
    canon.length,
    strong.map((entry) => entry.id),
    weak.map((entry) => entry.id),
    missing.map((entry) => entry.id),
    ["Canon entries are mapped only from existing data; no Scripture anchors are invented."]
  );
}

export function mapPrayerContentDepth(): TeoyubeContentDepthMapSection {
  const clusters = getPromiseClustersData();
  const strong = clusters.filter((cluster) => cluster.prayerSequence.length >= 2);
  const weak = clusters.filter((cluster) => cluster.prayerSequence.length === 1);
  const missing = clusters.filter((cluster) => cluster.prayerSequence.length === 0);
  return section(
    "prayer_depth",
    "PrayerCompanion content depth",
    clusters.length,
    strong.map((cluster) => cluster.id),
    weak.map((cluster) => cluster.id),
    missing.map((cluster) => cluster.id),
    ["Prayer depth is inferred from existing Promise Cluster prayer sequences."]
  );
}

export function mapCallingContentDepth(): TeoyubeContentDepthMapSection {
  const callings = getCallingArchetypes();
  const strong = callings.filter((calling) => calling.scriptureReferences.length > 0 && calling.coreWords.length > 0);
  const weak = callings.filter((calling) => calling.scriptureReferences.length > 0 && calling.coreWords.length === 0);
  const missing = callings.filter((calling) => calling.scriptureReferences.length === 0);
  return section(
    "calling_depth",
    "Calling Compass content depth",
    callings.length,
    strong.map((calling) => calling.id),
    weak.map((calling) => calling.id),
    missing.map((calling) => calling.id),
    ["Calling depth is based on existing kingdom archetypes and TIG calling seeds."]
  );
}

export function mapActionStepContentDepth(): TeoyubeContentDepthMapSection {
  const callings = getCallingArchetypes();
  const clusters = getPromiseClustersData();
  const strong = callings.filter((calling) => calling.actionSteps.length >= 2);
  const weak = callings.filter((calling) => calling.actionSteps.length === 1);
  const missing = callings.filter((calling) => calling.actionSteps.length === 0);
  return section(
    "action_step_depth",
    "Action step content depth",
    callings.length + clusters.length,
    strong.map((calling) => calling.id),
    weak.map((calling) => calling.id),
    missing.map((calling) => calling.id),
    ["Action step gaps should be reviewed alongside calling and promise content in Phase 4.2."]
  );
}

export function mapTigRelationshipDepth(): TeoyubeContentDepthMapSection {
  const graph = getTIGSeedGraph();
  const nodeRelationshipCounts = graph.nodes.map((node) => ({
    id: node.id,
    count: graph.relationships.filter((relationship) => relationship.sourceNodeId === node.id || relationship.targetNodeId === node.id).length
  }));
  const strong = nodeRelationshipCounts.filter((entry) => entry.count >= 2);
  const weak = nodeRelationshipCounts.filter((entry) => entry.count === 1);
  const missing = nodeRelationshipCounts.filter((entry) => entry.count === 0);
  return section(
    "tig_relationship_depth",
    "TIG graph relationship depth",
    graph.nodes.length,
    strong.map((entry) => entry.id),
    weak.map((entry) => entry.id),
    missing.map((entry) => entry.id),
    [`TIG graph has ${graph.relationships.length} relationship(s) across ${graph.nodes.length} node(s).`]
  );
}

export function createContentDepthMap(): TeoyubeContentDepthMapSection[] {
  return [
    mapVocabularyContentDepth(),
    mapPromiseClusterContentDepth(),
    mapScriptureCanonContentDepth(),
    mapPrayerContentDepth(),
    mapCallingContentDepth(),
    mapActionStepContentDepth(),
    mapTigRelationshipDepth()
  ];
}

export function createContentDepthMapReport(): TeoyubeContentDepthMapReport {
  const sections = createContentDepthMap();
  const promiseTable = createPromiseTable();
  const blockers = [
    promiseTable.valid ? undefined : "Promise Table has one or more rows without Scripture anchors.",
    sections.some((entry) => entry.total === 0) ? "One or more content depth sections has no source records." : undefined
  ].filter(Boolean) as string[];
  const warnings = sections.flatMap((entry) =>
    entry.needsOwnerReviewIds.length
      ? [`${entry.label} has ${entry.needsOwnerReviewIds.length} item(s) needing owner/content review.`]
      : []
  );

  return {
    valid: blockers.length === 0,
    sections,
    blockers,
    warnings,
    noNewContentCreated: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
