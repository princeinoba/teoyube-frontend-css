import {
  findPromiseClusterById,
  findScriptureCanonEntryByReference,
  findVocabularyItemById,
  getCoreTeoyubeVocabulary,
  getPromiseClustersData,
  getScriptureCanonData
} from "../data/teoyube-data-access";
import { createScripturePromiseCoverageReport } from "./scripture-promise-coverage-audit";
import type {
  TeoyubePromiseClusterExpansionDraft,
  TeoyubePromiseClusterExpansionDraftAnchor,
  TeoyubePromiseClusterExpansionDraftBlocker,
  TeoyubePromiseClusterExpansionDraftDecision,
  TeoyubePromiseClusterExpansionDraftReport,
  TeoyubePromiseClusterExpansionDraftReview,
  TeoyubePromiseClusterExpansionDraftType,
  TeoyubePromiseClusterExpansionDraftWarning
} from "./promise-cluster-expansion-draft-contracts";

type ScriptureAnchorGapInput = {
  reference?: string;
  sourceCanonEntryId?: string;
  relatedClusterId?: string;
  relatedWordId?: string;
  theme?: string;
};

const UNSAFE_DRAFT_LANGUAGE = [
  "god told",
  "god guarantees",
  "will definitely",
  "must be your calling",
  "medical advice",
  "legal advice",
  "financial advice",
  "emergency advice"
];

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "draft";
}

function defaultReview(): TeoyubePromiseClusterExpansionDraftReview {
  return {
    scriptureReviewRequired: true,
    theologyReviewRequired: true,
    copyReviewRequired: true,
    ownerReviewRequired: true,
    scriptureReviewed: false,
    theologyReviewed: false,
    copyReviewed: false,
    ownerReviewed: false
  };
}

function createAnchor(
  reference: string,
  source: TeoyubePromiseClusterExpansionDraftAnchor["source"]
): TeoyubePromiseClusterExpansionDraftAnchor | undefined {
  if (!reference.trim()) return undefined;
  const canonEntry = findScriptureCanonEntryByReference(reference);
  const verifiedInCanon = Boolean(canonEntry);
  return {
    reference,
    source,
    canonEntryId: canonEntry?.id,
    verifiedInCanon,
    manualVerificationRequired: !verifiedInCanon,
    reviewState: verifiedInCanon ? "verified_existing_canon" : "manual_review_required"
  };
}

function anchorsFromReferences(
  references: string[],
  source: TeoyubePromiseClusterExpansionDraftAnchor["source"]
): TeoyubePromiseClusterExpansionDraftAnchor[] {
  return unique(references)
    .map((reference) => createAnchor(reference, source))
    .filter((anchor): anchor is TeoyubePromiseClusterExpansionDraftAnchor => Boolean(anchor));
}

function draft(input: {
  id: string;
  type: TeoyubePromiseClusterExpansionDraftType;
  title: string;
  summary: string;
  sourceClusterId?: string;
  sourceTheme?: string;
  sourceWordId?: string;
  sourceScriptureReference?: string;
  scriptureAnchors?: TeoyubePromiseClusterExpansionDraftAnchor[];
  theme?: string;
  relatedWordIds?: string[];
  explanationPath?: string[];
  notes?: string[];
}): TeoyubePromiseClusterExpansionDraft {
  return {
    id: input.id,
    type: input.type,
    status: "scripture_review_required",
    title: input.title,
    summary: input.summary,
    sourceClusterId: input.sourceClusterId,
    sourceTheme: input.sourceTheme,
    sourceWordId: input.sourceWordId,
    sourceScriptureReference: input.sourceScriptureReference,
    scriptureAnchors: input.scriptureAnchors || [],
    theme: input.theme,
    relatedWordIds: unique(input.relatedWordIds || []),
    explanationPath: input.explanationPath || [
      "Draft created from existing Phase 4.2 coverage data.",
      "Draft remains review-only and excluded from live recommendation flows."
    ],
    review: defaultReview(),
    reviewOnly: true,
    draft: true,
    productionEligible: false,
    excludedFromLiveRecommendations: true,
    unsupportedPromiseCreated: false,
    unsupportedScriptureInvented: false,
    notes: input.notes || ["Do not publish into production data until Scripture, theology, copy, and owner review are recorded."],
    sourceFiles: ["src/data/promiseClusters.json", "src/data/coreTeoyubeVocabulary.json", "src/data/scriptureCanon.json"],
    createdAt: new Date().toISOString()
  };
}

export function createDraftForWeakPromiseCluster(clusterId: string): TeoyubePromiseClusterExpansionDraft {
  const cluster = findPromiseClusterById(clusterId);
  if (!cluster) {
    return {
      ...draft({
        id: `draft_missing_cluster_${slug(clusterId)}`,
        type: "existing_cluster_expansion",
        title: `Missing Promise Cluster draft source: ${clusterId}`,
        summary: "A referenced Promise Cluster was not found in current data; review before use.",
        sourceClusterId: clusterId,
        notes: ["Missing source cluster; keep blocked until the source id is corrected."]
      }),
      status: "blocked"
    };
  }

  return draft({
    id: `draft_expand_cluster_${slug(cluster.id)}`,
    type: "existing_cluster_expansion",
    title: `Review Promise Cluster depth: ${cluster.title}`,
    summary: "Review existing Promise Cluster depth before adding anchors, prayers, calling links, or action suggestions.",
    sourceClusterId: cluster.id,
    sourceTheme: cluster.theme,
    theme: cluster.theme,
    relatedWordIds: cluster.coreWords,
    scriptureAnchors: anchorsFromReferences(cluster.scriptureReferences, "promise_cluster"),
    explanationPath: [
      `Existing Promise Cluster ${cluster.title} has ${cluster.scriptureReferences.length} direct Scripture anchor(s).`,
      "Phase 4.3 creates review-only expansion guidance without modifying promiseClusters.json."
    ]
  });
}

export function createDraftForThemeCoverageGap(theme: string): TeoyubePromiseClusterExpansionDraft {
  const clusters = getPromiseClustersData().filter((cluster) =>
    [cluster.theme, cluster.title, cluster.description].join(" ").toLowerCase().includes(normalize(theme))
  );
  const references = clusters.flatMap((cluster) => cluster.scriptureReferences).slice(0, 6);
  return draft({
    id: `draft_theme_gap_${slug(theme)}`,
    type: "theme_depth_addition",
    title: `Review theme coverage gap: ${theme}`,
    summary: "Review whether existing Promise Clusters and Scripture anchors support deeper theme coverage.",
    sourceTheme: theme,
    theme,
    relatedWordIds: unique(clusters.flatMap((cluster) => cluster.coreWords)),
    scriptureAnchors: anchorsFromReferences(references, "promise_cluster"),
    explanationPath: [
      `Theme ${theme} was flagged by the coverage audit for review.`,
      `Found ${clusters.length} existing cluster(s) that may inform reviewed future content.`
    ]
  });
}

export function createDraftForVocabularyPromiseGap(wordId: string): TeoyubePromiseClusterExpansionDraft {
  const word = findVocabularyItemById(wordId);
  return draft({
    id: `draft_word_gap_${slug(word?.id || wordId)}`,
    type: "word_connection_addition",
    title: `Review vocabulary-to-promise gap: ${word?.word || wordId}`,
    summary: "Review whether this Teoyube word should connect to existing Promise Clusters before future release.",
    sourceWordId: word?.id || wordId,
    theme: word?.themes?.[0],
    relatedWordIds: word ? [word.id, word.word, word.teoyubeWord || ""] : [wordId],
    scriptureAnchors: anchorsFromReferences(word?.scriptureReferences || [], "vocabulary"),
    explanationPath: [
      "Vocabulary item was flagged for Promise/Scripture coverage review.",
      "Draft keeps relationship guidance outside production recommendation flows."
    ],
    notes: word ? undefined : ["Vocabulary source was not found; owner review must resolve the source id."]
  });
}

export function createDraftForScriptureAnchorGap(input: ScriptureAnchorGapInput): TeoyubePromiseClusterExpansionDraft {
  const canonEntry = input.sourceCanonEntryId
    ? getScriptureCanonData().find((entry) => entry.id === input.sourceCanonEntryId)
    : input.reference
      ? findScriptureCanonEntryByReference(input.reference)
      : undefined;
  const reference = input.reference || canonEntry?.scriptureReferences?.[0] || "";
  return draft({
    id: `draft_scripture_anchor_gap_${slug(reference || input.sourceCanonEntryId || "manual_review")}`,
    type: "scripture_anchor_addition",
    title: `Review Scripture anchor usage: ${reference || input.sourceCanonEntryId || "manual verification needed"}`,
    summary: "Review whether this existing Scripture Canon entry should support a future Promise Cluster connection.",
    sourceClusterId: input.relatedClusterId,
    sourceWordId: input.relatedWordId,
    sourceScriptureReference: reference,
    sourceTheme: input.theme,
    theme: input.theme || canonEntry?.category,
    relatedWordIds: unique([input.relatedWordId || "", canonEntry?.id || "", canonEntry?.word || ""]),
    scriptureAnchors: anchorsFromReferences(reference ? [reference] : [], canonEntry ? "scripture_canon" : "manual_review"),
    explanationPath: [
      "Scripture Canon usage gap was carried forward from Phase 4.2 coverage review.",
      "Anchor draft is review-only and does not add Scripture to production JSON."
    ]
  });
}

export function createPromiseClusterExpansionDrafts(input: {
  clusterIds?: string[];
  themes?: string[];
  wordIds?: string[];
  scriptureAnchorGaps?: ScriptureAnchorGapInput[];
  limit?: number;
} = {}): TeoyubePromiseClusterExpansionDraft[] {
  const coverage = createScripturePromiseCoverageReport();
  const clusters = input.clusterIds || coverage.promiseClustersWithoutStrongAnchors.slice(0, 4);
  const themes = input.themes || coverage.themesWithWeakPromiseCoverage.slice(0, 3);
  const wordIds = input.wordIds || coverage.vocabularyWithoutScriptureSupport.slice(0, 4);
  const anchorGaps =
    input.scriptureAnchorGaps ||
    coverage.scriptureCanonUnusedEntries.slice(0, 3).map((sourceCanonEntryId) => ({ sourceCanonEntryId }));
  const drafts = [
    ...clusters.map(createDraftForWeakPromiseCluster),
    ...themes.map(createDraftForThemeCoverageGap),
    ...wordIds.map(createDraftForVocabularyPromiseGap),
    ...anchorGaps.map(createDraftForScriptureAnchorGap)
  ];

  if (drafts.length) return drafts.slice(0, input.limit || 16);

  const firstCluster = getPromiseClustersData()[0];
  const firstWord = getCoreTeoyubeVocabulary()[0];
  return [
    firstCluster
      ? createDraftForWeakPromiseCluster(firstCluster.id)
      : createDraftForVocabularyPromiseGap(firstWord?.id || "manual_review_needed")
  ];
}

export function validatePromiseClusterExpansionDraft(draftItem: TeoyubePromiseClusterExpansionDraft) {
  const text = [draftItem.title, draftItem.summary, ...draftItem.notes].join(" ").toLowerCase();
  const unsafeMatches = UNSAFE_DRAFT_LANGUAGE.filter((phrase) => text.includes(phrase));
  const blockers: TeoyubePromiseClusterExpansionDraftBlocker[] = [
    unsafeMatches.length
      ? {
          id: `${draftItem.id}_unsafe_language`,
          draftId: draftItem.id,
          message: `Draft contains unsafe or over-certain language: ${unsafeMatches.join(", ")}.`,
          requiredAction: "Rewrite the draft note/copy before review."
        }
      : undefined,
    !draftItem.reviewOnly
      ? {
          id: `${draftItem.id}_not_review_only`,
          draftId: draftItem.id,
          message: "Draft is not marked review-only.",
          requiredAction: "Mark draft as reviewOnly before use."
        }
      : undefined,
    draftItem.productionEligible
      ? {
          id: `${draftItem.id}_production_eligible`,
          draftId: draftItem.id,
          message: "Draft must not be production eligible in Phase 4.3.",
          requiredAction: "Set productionEligible to false until reviewed content integration."
        }
      : undefined,
    !draftItem.excludedFromLiveRecommendations
      ? {
          id: `${draftItem.id}_live_flow_exposure`,
          draftId: draftItem.id,
          message: "Draft is not excluded from live recommendation flows.",
          requiredAction: "Exclude the draft from live recommendation flows."
        }
      : undefined,
    draftItem.unsupportedPromiseCreated
      ? {
          id: `${draftItem.id}_unsupported_promise`,
          draftId: draftItem.id,
          message: "Draft indicates an unsupported promise was created.",
          requiredAction: "Remove unsupported promise language."
        }
      : undefined,
    draftItem.unsupportedScriptureInvented
      ? {
          id: `${draftItem.id}_unsupported_scripture`,
          draftId: draftItem.id,
          message: "Draft indicates an unsupported Scripture reference was invented.",
          requiredAction: "Remove invented Scripture and use existing canon/manual review."
        }
      : undefined
  ].filter(Boolean) as TeoyubePromiseClusterExpansionDraftBlocker[];
  const warnings: TeoyubePromiseClusterExpansionDraftWarning[] = [
    draftItem.scriptureAnchors.length === 0
      ? {
          id: `${draftItem.id}_missing_anchor`,
          draftId: draftItem.id,
          message: "Draft has no Scripture anchors yet.",
          recommendedAction: "Keep draft review-only until Scripture support is verified."
        }
      : undefined,
    draftItem.scriptureAnchors.some((anchor) => anchor.manualVerificationRequired)
      ? {
          id: `${draftItem.id}_manual_anchor_verification`,
          draftId: draftItem.id,
          message: "One or more anchors needs manual verification.",
          recommendedAction: "Complete Scripture review before future production use."
        }
      : undefined,
    !draftItem.review.ownerReviewed
      ? {
          id: `${draftItem.id}_owner_review_required`,
          draftId: draftItem.id,
          message: "Owner review is required before future release.",
          recommendedAction: "Route this draft through owner/content review."
        }
      : undefined,
    draftItem.explanationPath.length === 0
      ? {
          id: `${draftItem.id}_missing_explanation`,
          draftId: draftItem.id,
          message: "Draft lacks an explanation path.",
          recommendedAction: "Add a review explanation path before future release."
        }
      : undefined
  ].filter(Boolean) as TeoyubePromiseClusterExpansionDraftWarning[];

  return { valid: blockers.length === 0, blockers, warnings };
}

export function getPromiseClusterExpansionDraftBlockers(
  drafts: TeoyubePromiseClusterExpansionDraft[]
): TeoyubePromiseClusterExpansionDraftBlocker[] {
  return drafts.flatMap((entry) => validatePromiseClusterExpansionDraft(entry).blockers);
}

export function getPromiseClusterExpansionDraftWarnings(
  drafts: TeoyubePromiseClusterExpansionDraft[]
): TeoyubePromiseClusterExpansionDraftWarning[] {
  return drafts.flatMap((entry) => validatePromiseClusterExpansionDraft(entry).warnings);
}

export function createPromiseClusterExpansionDraftDecision(
  drafts: TeoyubePromiseClusterExpansionDraft[]
): TeoyubePromiseClusterExpansionDraftDecision {
  const blockers = getPromiseClusterExpansionDraftBlockers(drafts);
  const warnings = getPromiseClusterExpansionDraftWarnings(drafts);
  if (!drafts.length) return "empty";
  if (blockers.length) return "blocked";
  if (drafts.some((entry) => entry.review.ownerReviewRequired && !entry.review.ownerReviewed)) return "needs_owner_review";
  return warnings.length ? "drafts_ready_with_warnings" : "drafts_ready_for_review";
}

export function createPromiseClusterExpansionDraftReport(
  drafts: TeoyubePromiseClusterExpansionDraft[] = createPromiseClusterExpansionDrafts()
): TeoyubePromiseClusterExpansionDraftReport {
  const blockers = getPromiseClusterExpansionDraftBlockers(drafts);
  const warnings = getPromiseClusterExpansionDraftWarnings(drafts);
  return {
    valid: blockers.length === 0 && drafts.every((entry) => entry.reviewOnly && !entry.productionEligible && entry.excludedFromLiveRecommendations),
    decision: createPromiseClusterExpansionDraftDecision(drafts),
    drafts,
    reviewOnlyDrafts: drafts.filter((entry) => entry.reviewOnly && !entry.productionEligible),
    blockers,
    warnings,
    reviewOnly: true,
    productionEligible: false,
    excludedFromLiveRecommendations: true,
    noProductionJsonModified: true,
    noUnsupportedScriptureInvented: true,
    noUnsupportedPromisesInvented: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
