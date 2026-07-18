import type {
  TeoyubeDataContractValidationReport,
  TeoyubeDataHealthIssue,
  TeoyubePromiseCluster,
  TeoyubeScriptureCanonEntry,
  TeoyubeVocabularyItem
} from "./teoyube-data-contracts";
import { createTeoyubeDataContractValidationReport } from "./teoyube-data-contract-validation";
import { createNormalizedTeoyubeDataSnapshot } from "./teoyube-data-normalization";

export type TeoyubeFlexibleDataRecord = Record<string, unknown>;

export type TeoyubeVocabularyDataItem = TeoyubeVocabularyItem;
export type TeoyubePromiseClusterDataItem = TeoyubePromiseCluster;
export type TeoyubeScriptureCanonDataItem = TeoyubeScriptureCanonEntry;

export type TeoyubeDataHealthReport = {
  valid: boolean;
  vocabularyCount: number;
  promiseClusterCount: number;
  scriptureCanonCount: number;
  vocabularyWithScriptureCount: number;
  promiseClustersWithScriptureCount: number;
  scriptureCanonWithReferencesCount: number;
  blockers: string[];
  warnings: string[];
  issues: TeoyubeDataHealthIssue[];
  duplicateIds: string[];
  missingScriptureAnchorIds: string[];
  contractReport: TeoyubeDataContractValidationReport;
  sourceFiles: string[];
};

const snapshot = createNormalizedTeoyubeDataSnapshot();
const vocabulary = snapshot.vocabulary;
const promiseClusters = snapshot.promiseClusters;
const scriptureCanon = snapshot.scriptureCanon;

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function idForWord(word: string): string {
  return word.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function vocabularyIds(item: TeoyubeVocabularyDataItem): string[] {
  const word = asString(item.word, asString(item.teoyubeWord));
  return unique([asString(item.id), word, asString(item.teoyubeWord), idForWord(word)]);
}

function promiseClusterIds(item: TeoyubePromiseClusterDataItem): string[] {
  return unique([
    asString(item.id),
    asString(item.cluster_id),
    asString(item.title),
    asString(item.name),
    asString(item.theme)
  ]);
}

function scriptureReferencesForCluster(item: TeoyubePromiseClusterDataItem): string[] {
  return unique([
    ...asStringArray(item.scriptureReferences),
    ...asStringArray(item.scripture_references),
    asString(item.anchorScripture),
    asString(item.anchor_scripture)
  ]);
}

function scriptureReferencesForVocabulary(item: TeoyubeVocabularyDataItem): string[] {
  return unique([
    ...asStringArray(item.scriptureReferences),
    ...asStringArray(item.scripture_sources)
  ]);
}

export function getCoreTeoyubeVocabulary(): TeoyubeVocabularyDataItem[] {
  return vocabulary.map((item) => ({ ...item, original: item.original }));
}

export function getPromiseClustersData(): TeoyubePromiseClusterDataItem[] {
  return promiseClusters.map((item) => ({ ...item, original: item.original }));
}

export function getScriptureCanonData(): TeoyubeScriptureCanonDataItem[] {
  return scriptureCanon.map((item) => ({ ...item, original: item.original }));
}

export function getNormalizedTeoyubeDataSnapshot() {
  return createNormalizedTeoyubeDataSnapshot();
}

export function findVocabularyItemById(id: string): TeoyubeVocabularyDataItem | undefined {
  const normalizedId = normalize(id);
  if (!normalizedId) return undefined;

  return getCoreTeoyubeVocabulary().find((item) =>
    vocabularyIds(item).some((candidate) => normalize(candidate) === normalizedId)
  );
}

export function findPromiseClusterById(id: string): TeoyubePromiseClusterDataItem | undefined {
  const normalizedId = normalize(id);
  if (!normalizedId) return undefined;

  return getPromiseClustersData().find((item) =>
    promiseClusterIds(item).some((candidate) => normalize(candidate) === normalizedId)
  );
}

export function findScriptureCanonEntryByReference(reference: string): TeoyubeScriptureCanonDataItem | undefined {
  const normalizedReference = normalize(reference);
  if (!normalizedReference) return undefined;

  return getScriptureCanonData().find((entry) =>
    [
      asString(entry.id),
      asString(entry.word),
      asString(entry.teoyubeWord),
      ...asStringArray(entry.scriptureReferences)
    ].some((candidate) => {
      const normalizedCandidate = normalize(candidate);
      return normalizedCandidate === normalizedReference || normalizedCandidate.includes(normalizedReference);
    })
  );
}

export function getDataHealthReport(): TeoyubeDataHealthReport {
  const contractReport = createTeoyubeDataContractValidationReport(snapshot);
  const vocabularyWithScriptureCount = vocabulary.filter((item) => scriptureReferencesForVocabulary(item).length > 0).length;
  const promiseClustersWithScriptureCount = promiseClusters.filter((item) => scriptureReferencesForCluster(item).length > 0).length;
  const scriptureCanonWithReferencesCount = scriptureCanon.filter((item) => asStringArray(item.scriptureReferences).length > 0).length;
  const blockers = [
    vocabulary.length === 0 ? "Core Teoyube vocabulary did not load." : undefined,
    promiseClusters.length === 0 ? "Promise cluster data did not load." : undefined,
    scriptureCanon.length === 0 ? "Scripture canon data did not load." : undefined,
    promiseClustersWithScriptureCount === 0 ? "No promise clusters expose Scripture anchors." : undefined,
    ...contractReport.blockers.map((entry) => entry.message)
  ].filter(Boolean) as string[];
  const warnings = [
    vocabularyWithScriptureCount < vocabulary.length ? "Some vocabulary records do not expose Scripture references directly." : undefined,
    scriptureCanonWithReferencesCount < scriptureCanon.length ? "Some Scripture canon records do not expose Scripture references directly." : undefined,
    ...contractReport.warnings.map((entry) => entry.message)
  ].filter(Boolean) as string[];

  return {
    valid: blockers.length === 0,
    vocabularyCount: vocabulary.length,
    promiseClusterCount: promiseClusters.length,
    scriptureCanonCount: scriptureCanon.length,
    vocabularyWithScriptureCount,
    promiseClustersWithScriptureCount,
    scriptureCanonWithReferencesCount,
    blockers,
    warnings,
    issues: [...contractReport.blockers, ...contractReport.warnings],
    duplicateIds: contractReport.duplicateIds,
    missingScriptureAnchorIds: contractReport.missingScriptureAnchorIds,
    contractReport,
    sourceFiles: snapshot.sourceFiles
  };
}
