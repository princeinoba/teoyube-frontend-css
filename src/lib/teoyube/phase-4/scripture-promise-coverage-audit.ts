import {
  getCoreTeoyubeVocabulary,
  getPromiseClustersData,
  getScriptureCanonData
} from "../data/teoyube-data-access";

export type TeoyubeScripturePromiseCoverageReport = {
  valid: boolean;
  promiseClustersWithoutStrongAnchors: string[];
  vocabularyWithoutScriptureSupport: string[];
  scriptureCanonUnusedEntries: string[];
  themesWithWeakPromiseCoverage: string[];
  themesWithStrongPromiseCoverage: string[];
  blockers: string[];
  warnings: string[];
  noUnsupportedAnchorsInvented: true;
  noContentRewritten: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function getPromiseClustersWithoutStrongAnchors(): string[] {
  return getPromiseClustersData()
    .filter((cluster) => cluster.scriptureReferences.length < 2)
    .map((cluster) => cluster.id);
}

export function getVocabularyWithoutScriptureSupport(): string[] {
  return getCoreTeoyubeVocabulary()
    .filter((word) => word.scriptureReferences.length === 0)
    .map((word) => word.id);
}

export function getScriptureCanonUnusedEntries(): string[] {
  const vocabularyRefs = getCoreTeoyubeVocabulary().flatMap((word) => word.scriptureReferences).map(normalize);
  const clusterRefs = getPromiseClustersData().flatMap((cluster) => cluster.scriptureReferences).map(normalize);
  const used = new Set([...vocabularyRefs, ...clusterRefs]);
  return getScriptureCanonData()
    .filter((entry) => entry.scriptureReferences.every((ref) => !used.has(normalize(ref))))
    .map((entry) => entry.id);
}

export function getThemesWithWeakPromiseCoverage(): string[] {
  const clusters = getPromiseClustersData();
  const themeCounts = new Map<string, number>();
  clusters.forEach((cluster) => {
    themeCounts.set(cluster.theme, (themeCounts.get(cluster.theme) || 0) + (cluster.scriptureReferences.length >= 2 ? 1 : 0));
  });
  return [...themeCounts.entries()].filter(([, count]) => count === 0).map(([theme]) => theme);
}

export function getThemesWithStrongPromiseCoverage(): string[] {
  const clusters = getPromiseClustersData();
  const themeCounts = new Map<string, number>();
  clusters.forEach((cluster) => {
    themeCounts.set(cluster.theme, (themeCounts.get(cluster.theme) || 0) + (cluster.scriptureReferences.length >= 2 ? 1 : 0));
  });
  return [...themeCounts.entries()].filter(([, count]) => count > 0).map(([theme]) => theme);
}

export function runScripturePromiseCoverageAudit(): TeoyubeScripturePromiseCoverageReport {
  return createScripturePromiseCoverageReport();
}

export function createScripturePromiseCoverageReport(): TeoyubeScripturePromiseCoverageReport {
  const promiseClustersWithoutStrongAnchors = getPromiseClustersWithoutStrongAnchors();
  const vocabularyWithoutScriptureSupport = getVocabularyWithoutScriptureSupport();
  const scriptureCanonUnusedEntries = getScriptureCanonUnusedEntries();
  const themesWithWeakPromiseCoverage = getThemesWithWeakPromiseCoverage();
  const themesWithStrongPromiseCoverage = getThemesWithStrongPromiseCoverage();
  const blockers = [
    getPromiseClustersData().length === 0 ? "Promise Cluster data did not load." : undefined,
    getPromiseClustersData().some((cluster) => cluster.scriptureReferences.length === 0) ? "One or more Promise Clusters has no Scripture anchors." : undefined
  ].filter(Boolean) as string[];
  const warnings = unique([
    promiseClustersWithoutStrongAnchors.length ? `${promiseClustersWithoutStrongAnchors.length} Promise Cluster(s) have fewer than two Scripture anchors.` : "",
    vocabularyWithoutScriptureSupport.length ? `${vocabularyWithoutScriptureSupport.length} vocabulary item(s) lack direct Scripture support.` : "",
    scriptureCanonUnusedEntries.length ? `${scriptureCanonUnusedEntries.length} Scripture Canon entrie(s) are not directly used by vocabulary or Promise Clusters.` : "",
    themesWithWeakPromiseCoverage.length ? `${themesWithWeakPromiseCoverage.length} theme(s) have weak Promise Cluster coverage.` : ""
  ]);

  return {
    valid: blockers.length === 0,
    promiseClustersWithoutStrongAnchors,
    vocabularyWithoutScriptureSupport,
    scriptureCanonUnusedEntries,
    themesWithWeakPromiseCoverage,
    themesWithStrongPromiseCoverage,
    blockers,
    warnings,
    noUnsupportedAnchorsInvented: true,
    noContentRewritten: true,
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
