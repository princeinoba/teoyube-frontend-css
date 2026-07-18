export type TeoyubeTheme = string;
export type TeoyubeScriptureAnchor = string;

export type TeoyubeUnknownFields = Record<string, unknown>;

export type TeoyubeVocabularyItem = TeoyubeUnknownFields & {
  id: string;
  word: string;
  teoyubeWord?: string;
  pronunciation?: string;
  meaning: string;
  category: string;
  themes: TeoyubeTheme[];
  scriptureReferences: TeoyubeScriptureAnchor[];
  scripture_sources?: TeoyubeScriptureAnchor[];
  promise_category?: string;
  prayer_use?: string;
  related_words?: string[];
  sourceFile: "src/data/coreTeoyubeVocabulary.json" | "src/data/scriptureCanon.json" | "src/lib/tig";
  original: unknown;
};

export type TeoyubePromiseCluster = TeoyubeUnknownFields & {
  id: string;
  cluster_id?: string;
  title: string;
  name?: string;
  theme: TeoyubeTheme;
  description: string;
  scriptureReferences: TeoyubeScriptureAnchor[];
  scripture_references?: TeoyubeScriptureAnchor[];
  anchorScripture?: TeoyubeScriptureAnchor;
  anchor_scripture?: TeoyubeScriptureAnchor;
  coreWords: string[];
  core_words?: string[];
  related_teoyube_words?: string[];
  prayerSequence: string[];
  prayer_sequence?: string[];
  declaration: string;
  calling_connection?: string;
  sourceFile: "src/data/promiseClusters.json" | "src/lib/tig";
  original: unknown;
};

export type TeoyubeScriptureCanonEntry = TeoyubeUnknownFields & {
  id: string;
  word: string;
  teoyubeWord?: string;
  meaning: string;
  category: string;
  scriptureReferences: TeoyubeScriptureAnchor[];
  scriptureThemes: TeoyubeTheme[];
  promiseStatement?: string;
  archetypeLinks: string[];
  pathLinks: string[];
  clusterLinks: string[];
  prayerUse?: string;
  graphTags: string[];
  sourceFile: "src/data/scriptureCanon.json";
  original: unknown;
};

export type TeoyubeWordConnection = {
  wordId: string;
  word: string;
  source: "vocabulary" | "scripture_canon" | "tig";
};

export type TeoyubePromiseConnection = {
  promiseId: string;
  title: string;
  scriptureAnchors: TeoyubeScriptureAnchor[];
  source: "promise_cluster" | "tig";
};

export type TeoyubeCallingConnection = {
  callingId: string;
  label: string;
  scriptureAnchors: TeoyubeScriptureAnchor[];
  source: "kingdom_archetype" | "tig" | "derived";
};

export type TeoyubePrayerConnection = {
  prayerId: string;
  label: string;
  scriptureAnchors: TeoyubeScriptureAnchor[];
  source: "prayer_sequence" | "promise_cluster" | "derived";
};

export type TeoyubeTigConnection = {
  nodeId: string;
  nodeType: string;
  relationshipIds: string[];
  scriptureAnchors: TeoyubeScriptureAnchor[];
  source: "tig_seed";
};

export type TeoyubeDataHealthIssue = {
  id: string;
  severity: "blocker" | "warning";
  sourceFile: string;
  recordId?: string;
  message: string;
  surfaceCritical?: boolean;
};

export type TeoyubeDataContractValidationReport = {
  valid: boolean;
  vocabularyCount: number;
  promiseClusterCount: number;
  scriptureCanonCount: number;
  blockers: TeoyubeDataHealthIssue[];
  warnings: TeoyubeDataHealthIssue[];
  duplicateIds: string[];
  missingScriptureAnchorIds: string[];
  generatedAt: string;
};

export type TeoyubeNormalizedDataSnapshot = {
  vocabulary: TeoyubeVocabularyItem[];
  promiseClusters: TeoyubePromiseCluster[];
  scriptureCanon: TeoyubeScriptureCanonEntry[];
  generatedAt: string;
  sourceFiles: string[];
};
