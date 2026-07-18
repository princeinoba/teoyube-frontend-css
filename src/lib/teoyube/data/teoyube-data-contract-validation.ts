import type {
  TeoyubeDataContractValidationReport,
  TeoyubeDataHealthIssue,
  TeoyubeNormalizedDataSnapshot,
  TeoyubePromiseCluster,
  TeoyubeScriptureCanonEntry,
  TeoyubeVocabularyItem
} from "./teoyube-data-contracts";
import { createNormalizedTeoyubeDataSnapshot } from "./teoyube-data-normalization";

function issue(
  id: string,
  severity: TeoyubeDataHealthIssue["severity"],
  sourceFile: string,
  message: string,
  recordId?: string,
  surfaceCritical = false
): TeoyubeDataHealthIssue {
  return { id, severity, sourceFile, recordId, message, surfaceCritical };
}

function duplicateIds(records: Array<{ id: string }>): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const record of records) {
    const id = record.id.trim().toLowerCase();
    if (!id) continue;
    if (seen.has(id)) duplicates.add(record.id);
    seen.add(id);
  }

  return [...duplicates];
}

function hasAnchor(value: { scriptureReferences: string[] }): boolean {
  return value.scriptureReferences.length > 0;
}

export function validateVocabularyDataContract(
  vocabulary: TeoyubeVocabularyItem[] = createNormalizedTeoyubeDataSnapshot().vocabulary
) {
  const blockers: TeoyubeDataHealthIssue[] = [];
  const warnings: TeoyubeDataHealthIssue[] = [];

  if (!vocabulary.length) {
    blockers.push(issue("vocabulary_empty", "blocker", "src/data/coreTeoyubeVocabulary.json", "Core Teoyube vocabulary did not load.", undefined, true));
  }

  for (const item of vocabulary) {
    if (!item.id) blockers.push(issue("vocabulary_missing_id", "blocker", item.sourceFile, "Vocabulary item is missing stable id.", item.word, true));
    if (!item.word) blockers.push(issue("vocabulary_missing_word", "blocker", item.sourceFile, "Vocabulary item is missing word.", item.id, true));
    if (!hasAnchor(item)) warnings.push(issue("vocabulary_missing_scripture", "warning", item.sourceFile, "Vocabulary item has no direct Scripture anchor.", item.id));
  }

  for (const id of duplicateIds(vocabulary)) {
    blockers.push(issue("vocabulary_duplicate_id", "blocker", "src/data/coreTeoyubeVocabulary.json", "Duplicate vocabulary id detected.", id, true));
  }

  return { valid: blockers.length === 0, blockers, warnings };
}

export function validatePromiseClusterDataContract(
  clusters: TeoyubePromiseCluster[] = createNormalizedTeoyubeDataSnapshot().promiseClusters
) {
  const blockers: TeoyubeDataHealthIssue[] = [];
  const warnings: TeoyubeDataHealthIssue[] = [];

  if (!clusters.length) {
    blockers.push(issue("promise_clusters_empty", "blocker", "src/data/promiseClusters.json", "Promise clusters did not load.", undefined, true));
  }

  for (const cluster of clusters) {
    if (!cluster.id) blockers.push(issue("promise_cluster_missing_id", "blocker", cluster.sourceFile, "Promise cluster is missing stable id.", cluster.title, true));
    if (!cluster.title) blockers.push(issue("promise_cluster_missing_title", "blocker", cluster.sourceFile, "Promise cluster is missing title.", cluster.id, true));
    if (!hasAnchor(cluster)) blockers.push(issue("promise_cluster_missing_scripture", "blocker", cluster.sourceFile, "Promise cluster has no Scripture support.", cluster.id, true));
    if (!cluster.coreWords.length) warnings.push(issue("promise_cluster_missing_words", "warning", cluster.sourceFile, "Promise cluster has no related Teoyube words.", cluster.id));
  }

  for (const id of duplicateIds(clusters)) {
    blockers.push(issue("promise_cluster_duplicate_id", "blocker", "src/data/promiseClusters.json", "Duplicate promise cluster id detected.", id, true));
  }

  return { valid: blockers.length === 0, blockers, warnings };
}

export function validateScriptureCanonDataContract(
  entries: TeoyubeScriptureCanonEntry[] = createNormalizedTeoyubeDataSnapshot().scriptureCanon
) {
  const blockers: TeoyubeDataHealthIssue[] = [];
  const warnings: TeoyubeDataHealthIssue[] = [];

  if (!entries.length) {
    blockers.push(issue("scripture_canon_empty", "blocker", "src/data/scriptureCanon.json", "Scripture canon did not load.", undefined, true));
  }

  for (const entry of entries) {
    if (!entry.id) blockers.push(issue("scripture_canon_missing_id", "blocker", entry.sourceFile, "Scripture canon entry is missing stable id.", entry.word, true));
    if (!entry.word) blockers.push(issue("scripture_canon_missing_word", "blocker", entry.sourceFile, "Scripture canon entry is missing word.", entry.id, true));
    if (!hasAnchor(entry)) blockers.push(issue("scripture_canon_missing_reference", "blocker", entry.sourceFile, "Scripture canon entry has no Scripture references.", entry.id, true));
  }

  for (const id of duplicateIds(entries)) {
    blockers.push(issue("scripture_canon_duplicate_id", "blocker", "src/data/scriptureCanon.json", "Duplicate Scripture canon id detected.", id, true));
  }

  return { valid: blockers.length === 0, blockers, warnings };
}

export function validateCrossDataConnections(snapshot: TeoyubeNormalizedDataSnapshot = createNormalizedTeoyubeDataSnapshot()) {
  const blockers: TeoyubeDataHealthIssue[] = [];
  const warnings: TeoyubeDataHealthIssue[] = [];
  const words = new Set([
    ...snapshot.vocabulary.map((item) => item.word.toLowerCase()),
    ...snapshot.scriptureCanon.map((entry) => entry.word.toLowerCase())
  ]);

  for (const cluster of snapshot.promiseClusters) {
    const missingWords = cluster.coreWords.filter((word) => !words.has(word.toLowerCase()));
    if (missingWords.length) {
      warnings.push(issue("promise_cluster_unmatched_words", "warning", cluster.sourceFile, `Promise cluster references words not found in vocabulary/canon: ${missingWords.join(", ")}.`, cluster.id));
    }
  }

  return { valid: blockers.length === 0, blockers, warnings };
}

export function validateScriptureAnchorCoverage(snapshot: TeoyubeNormalizedDataSnapshot = createNormalizedTeoyubeDataSnapshot()) {
  const missingVocabulary = snapshot.vocabulary.filter((item) => !hasAnchor(item)).map((item) => item.id);
  const missingClusters = snapshot.promiseClusters.filter((cluster) => !hasAnchor(cluster)).map((cluster) => cluster.id);
  const missingCanon = snapshot.scriptureCanon.filter((entry) => !hasAnchor(entry)).map((entry) => entry.id);
  const blockers = missingClusters.map((id) =>
    issue("promise_cluster_anchor_coverage", "blocker", "src/data/promiseClusters.json", "Promise cluster is missing Scripture anchor coverage.", id, true)
  );
  const warnings = [
    ...missingVocabulary.map((id) =>
      issue("vocabulary_anchor_coverage", "warning", "src/data/coreTeoyubeVocabulary.json", "Vocabulary item has no direct Scripture anchor coverage.", id)
    ),
    ...missingCanon.map((id) =>
      issue("scripture_canon_anchor_coverage", "warning", "src/data/scriptureCanon.json", "Scripture canon entry has no anchor coverage.", id)
    )
  ];

  return {
    valid: blockers.length === 0,
    blockers,
    warnings,
    missingScriptureAnchorIds: [...missingVocabulary, ...missingClusters, ...missingCanon]
  };
}

export function validatePromiseClusterCoverage(snapshot: TeoyubeNormalizedDataSnapshot = createNormalizedTeoyubeDataSnapshot()) {
  const warnings = snapshot.vocabulary
    .filter((item) => item.promise_category && !snapshot.promiseClusters.some((cluster) =>
      cluster.theme.toLowerCase().includes(String(item.promise_category).toLowerCase()) ||
      cluster.title.toLowerCase().includes(String(item.promise_category).toLowerCase())
    ))
    .map((item) =>
      issue("vocabulary_promise_category_unmatched", "warning", item.sourceFile, "Vocabulary promise category does not directly match an existing Promise Cluster theme/title.", item.id)
    );

  return { valid: true, blockers: [], warnings };
}

export function createTeoyubeDataContractValidationReport(
  snapshot: TeoyubeNormalizedDataSnapshot = createNormalizedTeoyubeDataSnapshot()
): TeoyubeDataContractValidationReport {
  const vocabulary = validateVocabularyDataContract(snapshot.vocabulary);
  const clusters = validatePromiseClusterDataContract(snapshot.promiseClusters);
  const canon = validateScriptureCanonDataContract(snapshot.scriptureCanon);
  const cross = validateCrossDataConnections(snapshot);
  const anchorCoverage = validateScriptureAnchorCoverage(snapshot);
  const clusterCoverage = validatePromiseClusterCoverage(snapshot);
  const blockers = [
    ...vocabulary.blockers,
    ...clusters.blockers,
    ...canon.blockers,
    ...cross.blockers,
    ...anchorCoverage.blockers,
    ...clusterCoverage.blockers
  ];
  const warnings = [
    ...vocabulary.warnings,
    ...clusters.warnings,
    ...canon.warnings,
    ...cross.warnings,
    ...anchorCoverage.warnings,
    ...clusterCoverage.warnings
  ];

  return {
    valid: blockers.length === 0,
    vocabularyCount: snapshot.vocabulary.length,
    promiseClusterCount: snapshot.promiseClusters.length,
    scriptureCanonCount: snapshot.scriptureCanon.length,
    blockers,
    warnings,
    duplicateIds: [
      ...duplicateIds(snapshot.vocabulary),
      ...duplicateIds(snapshot.promiseClusters),
      ...duplicateIds(snapshot.scriptureCanon)
    ],
    missingScriptureAnchorIds: anchorCoverage.missingScriptureAnchorIds,
    generatedAt: new Date().toISOString()
  };
}
