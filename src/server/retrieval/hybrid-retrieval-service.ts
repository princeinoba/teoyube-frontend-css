import { performance } from "node:perf_hooks";
import type {
  EmbeddingGateway,
  EmbeddingResult,
  HybridRetrievalRequest,
  HybridRetrievalResult,
  HybridRetriever,
  HybridSourceResult,
  RetrievalChunk,
  RetrievalScoreBreakdown,
  RetrievalTrustLevel,
  VectorRepository
} from "../../domain/retrieval/retrieval-contracts";
import { RETRIEVAL_PARTITION_POLICIES } from "../../domain/retrieval/retrieval-policy";
import type { ScriptureRepository } from "../../domain/scripture/scripture-repository";
import type { TigService } from "../../domain/tig/tig-service";
import { estimateTokens, hashNormalizedContent, sha256 } from "./content-hashing";
import type { PublicRetrievalInventory } from "./public-source-inventory";
import {
  candidateAcceptance,
  deterministicQueryDisposition,
  documentContentType,
  documentPrefixesForIntent,
  partitionsForContentIntent,
  resolveRetrievalContentIntent
} from "./retrieval-query-policy";
import {
  EMBEDDING_MODELS,
  PROMPT_20_BUDGETS,
  readRetrievalRuntimeConfiguration,
  RETRIEVAL_FUSION_VERSION,
  RETRIEVAL_LIMITS
} from "./retrieval-config";

type LexicalCandidate = Readonly<{
  chunk: RetrievalChunk;
  score: number;
  matchedTerms: readonly string[];
}>;

function stem(term: string): string {
  if (term.endsWith("fulness") && term.length > 9) return term.slice(0, -7);
  if (term.endsWith("ful") && term.length > 6) return term.slice(0, -3);
  if (term.endsWith("ing") && term.length > 6) return term.slice(0, -3).replace(/(.)\1$/, "$1");
  if (term.endsWith("ed") && term.length > 5) return term.slice(0, -2).replace(/(.)\1$/, "$1");
  return term;
}

function terms(value: string): readonly string[] {
  return Object.freeze([
    ...new Set(
      (value
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .match(/[a-z0-9]+/g) || [])
        .filter((term) => term.length >= 3)
        .map(stem)
    )
  ]);
}

function lexicalValues(content: string): string {
  try {
    const parsed: unknown = JSON.parse(content);
    const values: string[] = [];
    const visit = (value: unknown): void => {
      if (typeof value === "string" || typeof value === "number") values.push(String(value));
      else if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === "object") Object.values(value).forEach(visit);
    };
    visit(parsed);
    return values.join(" ");
  } catch {
    return content;
  }
}

function trustScore(trust: RetrievalTrustLevel): number {
  switch (trust) {
    case "CANONICAL_SCRIPTURE":
      return 1;
    case "REVIEWED_SCRIPTURE_CONTEXT":
      return 0.95;
    case "SYSTEM_POLICY_REFERENCE":
      return 0.94;
    case "REVIEWED_TEOYUBE_CONTENT":
    case "REVIEWED_PRODUCT_HELP":
      return 0.9;
    default:
      return 0.8;
  }
}

function emptyBreakdown(): RetrievalScoreBreakdown {
  return Object.freeze({
    exactReference: 0,
    lexical: 0,
    vector: 0,
    graph: 0,
    trust: 0,
    journey: 0,
    memory: 0,
    recency: 0,
    category: 0,
    diversity: 0
  });
}

function trustLevelsFor(request: HybridRetrievalRequest): readonly RetrievalTrustLevel[] {
  return Object.freeze([
    ...new Set(
      request.allowedPartitions.flatMap(
        (partition) => RETRIEVAL_PARTITION_POLICIES[partition].allowedTrustLevels
      )
    )
  ]);
}

function vectorAuthorizationReason(
  request: HybridRetrievalRequest,
  runtimeEnabled: boolean
): HybridRetrievalResult["fallback"]["reason"] | null {
  if (!request.enableVector || !runtimeEnabled) return "disabled";
  if (request.safetyMode === "critical" || request.safetyMode === "sensitive") {
    return "critical_safety";
  }
  if (request.executionKind === "owner_evaluation") return null;
  if (
    !request.authorization ||
    !request.authorization.effectivePurposeIds.includes(
      "external_ai_embedding_processing"
    ) ||
    request.authorization.consentRecordIds.length === 0
  ) {
    return "no_consent";
  }
  return null;
}

function allowedVectorPartitions(request: HybridRetrievalRequest): HybridRetrievalRequest["allowedPartitions"] {
  if (request.executionKind === "owner_evaluation") {
    return Object.freeze(
      request.allowedPartitions.filter(
        (partition) => !RETRIEVAL_PARTITION_POLICIES[partition].userOwned
      )
    );
  }
  if (!request.authorization) return Object.freeze([]);
  return Object.freeze(
    request.allowedPartitions.filter((partition) => {
      const policy = RETRIEVAL_PARTITION_POLICIES[partition];
      return (
        !policy.userOwned ||
        (policy.requiredPurposeId &&
          request.authorization?.effectivePurposeIds.includes(policy.requiredPurposeId))
      );
    })
  );
}

export type HybridRetrievalServiceOptions = Readonly<{
  inventory: PublicRetrievalInventory;
  vectorRepository: VectorRepository;
  embeddingGateway: EmbeddingGateway;
  scriptureRepository: ScriptureRepository;
  tigService: TigService;
  environment?: NodeJS.ProcessEnv;
  monotonicNow?: () => number;
}>;

export class HybridRetrievalService implements HybridRetriever {
  readonly #inventory: PublicRetrievalInventory;
  readonly #vectorRepository: VectorRepository;
  readonly #embeddingGateway: EmbeddingGateway;
  readonly #scriptureRepository: ScriptureRepository;
  readonly #tigService: TigService;
  readonly #environment: NodeJS.ProcessEnv;
  readonly #monotonicNow: () => number;
  readonly #tokens: ReadonlyMap<string, readonly string[]>;
  readonly #publicEvaluationQueryCache = new Map<string, EmbeddingResult>();

  constructor(options: HybridRetrievalServiceOptions) {
    this.#inventory = options.inventory;
    this.#vectorRepository = options.vectorRepository;
    this.#embeddingGateway = options.embeddingGateway;
    this.#scriptureRepository = options.scriptureRepository;
    this.#tigService = options.tigService;
    this.#environment = options.environment || process.env;
    this.#monotonicNow = options.monotonicNow || (() => performance.now());
    this.#tokens = new Map(
      this.#inventory.chunks.map((chunk) => [
        chunk.chunkId,
        terms(`${chunk.title} ${lexicalValues(chunk.content)}`)
      ])
    );
  }

  #lexical(request: HybridRetrievalRequest): readonly LexicalCandidate[] {
    const queryTerms = terms(request.query);
    const contentIntent = resolveRetrievalContentIntent(request.intent, request.query);
    if (!queryTerms.length) return Object.freeze([]);
    const candidates = this.#inventory.chunks
      .filter(
        (chunk) =>
          request.allowedPartitions.includes(chunk.partition) &&
          chunk.language === request.language &&
          (contentIntent === "GENERAL" || documentContentType(chunk.documentId) === contentIntent)
      )
      .map((chunk) => {
        const chunkTerms = this.#tokens.get(chunk.chunkId) || [];
        const matchedTerms = queryTerms.filter((term) => chunkTerms.includes(term));
        const title = chunk.title.toLowerCase();
        const phraseBoost = title.includes(request.query.toLowerCase()) ? 1 : 0;
        const score =
          matchedTerms.reduce(
            (sum, term) =>
              sum +
              (title.includes(term) ? 3 : 1) /
                Math.max(1, Math.log2(chunkTerms.length + 2)),
            0
          ) + phraseBoost;
        return Object.freeze({ chunk, score, matchedTerms: Object.freeze(matchedTerms) });
      })
      .filter((candidate) => candidate.score > 0)
      .sort(
        (left, right) =>
          right.score - left.score || left.chunk.chunkId.localeCompare(right.chunk.chunkId)
      );
    const maximum = candidates[0]?.score || 1;
    return Object.freeze(
      candidates
        .slice(0, Math.max(request.topK * 5, 25))
        .map((candidate) =>
          Object.freeze({ ...candidate, score: candidate.score / maximum })
        )
    );
  }

  async #exact(request: HybridRetrievalRequest): Promise<HybridSourceResult | null> {
    const value = request.exactReferenceHint || request.query;
    const parsed = this.#scriptureRepository
      .parseReferences(value)
      .find((candidate) => candidate.valid);
    if (!parsed?.valid || !request.allowedPartitions.includes("canonical_scripture")) {
      return null;
    }
    const passage = await this.#scriptureRepository.getByReference(parsed.reference);
    if (!passage) return null;
    const content = passage.verses.map((verse) => verse.text).join(" ");
    const breakdown = Object.freeze({
      ...emptyBreakdown(),
      exactReference: 1,
      trust: 1
    });
    return Object.freeze({
      recordId: `exact:${sha256(passage.citation.canonicalLabel).slice(0, 24)}`,
      sourceId: passage.citation.sourceId,
      documentId: `canonical:${passage.citation.canonicalLabel}`,
      partition: "canonical_scripture",
      trustLevel: "CANONICAL_SCRIPTURE",
      title: `${passage.citation.canonicalLabel} (WEB)`,
      canonicalReference: passage.citation,
      scriptureCitations: Object.freeze([passage.citation]),
      sourceVersion: passage.citation.corpusVersion,
      sourceChecksum: passage.corpusChecksum,
      fusedScore: 1,
      scoreBreakdown: breakdown,
      rank: 1,
      matchedTerms: Object.freeze(terms(request.query)),
      matchedConcepts: Object.freeze(["exact_scripture_reference"]),
      selectionReasons: Object.freeze([
        "The query resolved to an exact reference in the owner-approved WEB corpus."
      ]),
      limitations: Object.freeze([]),
      userOwned: false,
      indexVersion: request.activeIndexVersion,
      content
    });
  }

  async retrieve(request: HybridRetrievalRequest): Promise<HybridRetrievalResult> {
    const started = this.#monotonicNow();
    if (
      !request.query.trim() ||
      request.query.length > RETRIEVAL_LIMITS.queryCharacters ||
      request.topK < 1 ||
      request.topK > RETRIEVAL_LIMITS.maximumTopK
    ) {
      throw new Error("The hybrid retrieval request exceeds its configured limits.");
    }
    const runtime = readRetrievalRuntimeConfiguration(this.#environment);
    const exact = await this.#exact(request);
    const contentIntent = resolveRetrievalContentIntent(request.intent, request.query);
    const queryDisposition = exact
      ? Object.freeze({ acceptedForRetrieval: true, reason: "accepted" })
      : deterministicQueryDisposition(request.query, request.intent);
    if (!exact && !queryDisposition.acceptedForRetrieval) {
      return Object.freeze({
        requestId: `retrieval:${sha256(`${request.query}:${request.intent}:${request.activeIndexVersion}`).slice(0, 24)}`,
        queryHash: sha256(request.query),
        intent: request.intent,
        exactReferenceResolved: false,
        pathsUsed: Object.freeze([]),
        queryDisposition,
        candidateDiagnostics: Object.freeze([]),
        sources: Object.freeze([]),
        fallback: Object.freeze({ used: true, reason: "not_useful" as const }),
        limitations: Object.freeze([
          "The query was deterministically rejected before provider embedding.",
          "Scripture is primary; interpretation and user-approved records remain distinct."
        ]),
        contextTokenCount: 0,
        latencyMs: Math.max(0, this.#monotonicNow() - started),
        indexVersion: request.activeIndexVersion
      });
    }
    const effectiveRequest = Object.freeze({
      ...request,
      allowedPartitions: partitionsForContentIntent(request.allowedPartitions, contentIntent)
    });
    const lexical = this.#lexical(effectiveRequest);
    const tig = await this.#tigService.recommend({
      query: request.query,
      intent: request.intent as never,
      privacy: {
        containsPrivatePrayerText: request.safetyMode !== "standard",
        containsPrivateReflectionText: request.safetyMode !== "standard"
      }
    });
    const graphTerms = new Set(
      tig.candidates.flatMap((candidate) => [
        candidate.id.toLowerCase(),
        candidate.label.toLowerCase(),
        ...candidate.scriptureAnchors.map((anchor) => anchor.reference.toLowerCase())
      ])
    );
    const reason = exact
      ? "not_useful"
      : vectorAuthorizationReason(request, runtime.vectorRetrievalEnabled);
    let vectorResults: Awaited<ReturnType<VectorRepository["search"]>> = Object.freeze([]);
    let vectorReason = reason;
    if (!exact && !reason) {
      try {
        const queryHash = hashNormalizedContent(request.query);
        const cacheKey = sha256(
          [
            queryHash,
            this.#inventory.indexVersion,
            EMBEDDING_MODELS.default.id,
            EMBEDDING_MODELS.default.dimension,
            RETRIEVAL_FUSION_VERSION,
            request.safetyMode,
            effectiveRequest.allowedPartitions.join(",")
          ].join(":")
        );
        let queryEmbedding =
          request.executionKind === "owner_evaluation"
            ? this.#publicEvaluationQueryCache.get(cacheKey)
            : undefined;
        if (!queryEmbedding) {
          queryEmbedding = await this.#embeddingGateway.embedQuery({
            input: Object.freeze({
              id: `query:${sha256(request.query)}`,
              content: request.query,
              normalizedContentHash: queryHash,
              sourceVersion: "runtime-query-v1",
              chunkerVersion: "query-v1",
              sensitivity: "structured_spiritual"
            }),
            model: EMBEDDING_MODELS.default.id,
            dimension: EMBEDDING_MODELS.default.dimension,
            budget: Object.freeze({
              purpose: "query",
              maximumInputTokens: 1_000,
              maximumCostUsd: PROMPT_20_BUDGETS.queryEvaluationUsd,
              spentCostUsd: 0,
              pricePerMillionInputTokensUsd:
                EMBEDDING_MODELS.default.pricePerMillionInputTokensUsd
            })
          });
          if (request.executionKind === "owner_evaluation") {
            if (this.#publicEvaluationQueryCache.size >= 256) {
              const oldest = this.#publicEvaluationQueryCache.keys().next().value;
              if (oldest) this.#publicEvaluationQueryCache.delete(oldest);
            }
            this.#publicEvaluationQueryCache.set(cacheKey, queryEmbedding);
          }
        }
        const partitions = allowedVectorPartitions(effectiveRequest);
        vectorResults = await this.#vectorRepository.search({
          queryVector: queryEmbedding.vector,
          partitions,
          trustLevels: trustLevelsFor(effectiveRequest),
          ...(documentPrefixesForIntent(contentIntent)
            ? { documentIdPrefixes: documentPrefixesForIntent(contentIntent) }
            : {}),
          limit: Math.max(request.topK * 5, 25),
          language: request.language,
          activeIndexVersion: request.activeIndexVersion,
          ...(request.authorization
            ? {
                userId: request.authorization.userId,
                consentRecordIds: request.authorization.consentRecordIds,
                purposeIds: request.authorization.effectivePurposeIds
              }
            : {}),
          now: request.now
        });
        vectorReason = vectorResults.length ? null : "not_useful";
      } catch {
        vectorReason = "provider_unavailable";
      }
    }
    const merged = new Map<
      string,
      Readonly<{
        chunk: RetrievalChunk;
        lexical: number;
        rawVector?: number;
        vector: number;
        graph: number;
        matchedTerms: readonly string[];
        content: string;
      }>
    >();
    for (const candidate of lexical) {
      const graph = [...graphTerms].some(
        (term) =>
          candidate.chunk.content.toLowerCase().includes(term) ||
          candidate.chunk.title.toLowerCase().includes(term)
      )
        ? 1
        : 0;
      merged.set(
        candidate.chunk.chunkId,
        Object.freeze({
          chunk: candidate.chunk,
          lexical: candidate.score,
          vector: 0,
          graph,
          matchedTerms: candidate.matchedTerms,
          content: candidate.chunk.content
        })
      );
    }
    for (const result of vectorResults) {
      const chunk = this.#inventory.chunks.find(
        (candidate) => candidate.chunkId === result.recordId
      );
      if (!chunk) continue;
      if (contentIntent !== "GENERAL" && documentContentType(chunk.documentId) !== contentIntent) continue;
      const current = merged.get(result.recordId);
      merged.set(
        result.recordId,
        Object.freeze({
          chunk,
          lexical: current?.lexical || 0,
          rawVector: result.score,
          vector: Math.max(0, Math.min(1, (result.score + 1) / 2)),
          graph: current?.graph || 0,
          matchedTerms: current?.matchedTerms || Object.freeze([]),
          content: result.content
        })
      );
    }
    const ranked = [...merged.values()]
      .map((candidate) => {
        const trust = trustScore(candidate.chunk.trustLevel);
        const journey = request.currentJourneySourceIds?.includes(candidate.chunk.sourceId)
          ? 1
          : 0;
        const breakdown = Object.freeze({
          ...emptyBreakdown(),
          lexical: candidate.lexical,
          vector: candidate.vector,
          graph: candidate.graph,
          trust,
          journey
        });
        const rawVector = Math.max(0, candidate.rawVector || 0);
        const fusedScore =
          candidate.lexical * 0.08 +
          candidate.vector * 0.22 +
          rawVector * 0.45 +
          candidate.graph * 0.07 +
          trust * 0.15 +
          journey * 0.03;
        return Object.freeze({ candidate, breakdown, fusedScore });
      })
      .sort(
        (left, right) =>
          right.fusedScore - left.fusedScore ||
          left.candidate.chunk.chunkId.localeCompare(right.candidate.chunk.chunkId)
      );
    const seenDocuments = new Set<string>();
    const diverseRanked = ranked.filter((item) => {
      if (seenDocuments.has(item.candidate.chunk.documentId)) return false;
      seenDocuments.add(item.candidate.chunk.documentId);
      return true;
    });
    const candidateDiagnostics = Object.freeze(
      diverseRanked.map((item, index) => {
        const decision = candidateAcceptance({
          ...(typeof item.candidate.rawVector === "number"
            ? { rawCosineSimilarity: item.candidate.rawVector }
            : {}),
          normalizedVectorScore: item.candidate.vector,
          lexicalScore: item.candidate.lexical,
          fusedScore: item.fusedScore
        });
        return Object.freeze({
          documentId: item.candidate.chunk.documentId,
          contentType: documentContentType(item.candidate.chunk.documentId),
          partition: item.candidate.chunk.partition,
          ...(typeof item.candidate.rawVector === "number"
            ? { rawCosineSimilarity: item.candidate.rawVector }
            : {}),
          normalizedVectorScore: item.candidate.vector,
          lexicalScore: item.candidate.lexical,
          graphScore: item.candidate.graph,
          trustScore: item.breakdown.trust,
          fusedScore: item.fusedScore,
          rank: index + 1,
          accepted: decision.accepted,
          decisionReason: decision.reason
        });
      })
    );
    const acceptedDocumentIds = new Set(
      candidateDiagnostics.filter((item) => item.accepted).map((item) => item.documentId)
    );
    const acceptedRanked = diverseRanked.filter((item) =>
      acceptedDocumentIds.has(item.candidate.chunk.documentId)
    );
    if (!acceptedRanked.length && !exact) vectorReason = "not_useful";
    const selected = acceptedRanked
      .slice(0, Math.max(0, request.topK - (exact ? 1 : 0)))
      .map((item, index): HybridSourceResult => {
        const chunk = item.candidate.chunk;
        return Object.freeze({
          recordId: chunk.chunkId,
          sourceId: chunk.sourceId,
          documentId: chunk.documentId,
          partition: chunk.partition,
          trustLevel: chunk.trustLevel,
          title: chunk.title,
          ...(chunk.scriptureCitations[0]
            ? { canonicalReference: chunk.scriptureCitations[0] }
            : {}),
          scriptureCitations: chunk.scriptureCitations,
          sourceVersion: chunk.sourceVersion,
          sourceChecksum: chunk.sourceChecksum,
          lexicalScore: item.candidate.lexical,
          ...(typeof item.candidate.rawVector === "number"
            ? { rawVectorScore: item.candidate.rawVector }
            : {}),
          normalizedVectorScore: item.candidate.vector,
          vectorScore: item.candidate.vector,
          graphScore: item.candidate.graph,
          fusedScore: item.fusedScore,
          scoreBreakdown: Object.freeze({ ...item.breakdown, diversity: 1 }),
          rank: index + 1 + (exact ? 1 : 0),
          matchedTerms: item.candidate.matchedTerms,
          matchedConcepts: Object.freeze(
            item.candidate.graph ? ["deterministic_tig_graph_match"] : []
          ),
          ...(item.candidate.graph
            ? {
                graphPath: Object.freeze([
                  RETRIEVAL_FUSION_VERSION,
                  tig.recommendationId,
                  chunk.documentId
                ])
              }
            : {}),
          selectionReasons: Object.freeze([
            ...(item.candidate.lexical > 0 ? ["Lexical terms matched."] : []),
            ...(item.candidate.vector > 0 ? ["Semantic similarity contributed."] : []),
            ...(item.candidate.graph > 0 ? ["A deterministic TIG source path matched."] : []),
            `Trust policy ${chunk.trustLevel} was applied.`
          ]),
          limitations: Object.freeze([
            ...(item.candidate.vector > 0
              ? ["Vector similarity is a ranking signal, not spiritual authority."]
              : [])
          ]),
          userOwned: RETRIEVAL_PARTITION_POLICIES[chunk.partition].userOwned,
          ...(chunk.purposeIds
            ? { consentScopes: Object.freeze([...chunk.purposeIds]) }
            : {}),
          indexVersion: request.activeIndexVersion,
          content: item.candidate.content
        });
      });
    const sources = Object.freeze([...(exact ? [exact] : []), ...selected].map(
      (source, index) => Object.freeze({ ...source, rank: index + 1 })
    ));
    const pathsUsed = Object.freeze([
      ...(exact ? (["exact"] as const) : []),
      ...(lexical.length ? (["lexical"] as const) : []),
      ...(vectorResults.length ? (["vector"] as const) : []),
      "tig" as const
    ]);
    return Object.freeze({
      requestId: `retrieval:${sha256(
        `${request.query}:${request.intent}:${request.activeIndexVersion}`
      ).slice(0, 24)}`,
      queryHash: sha256(request.query),
      intent: request.intent,
      exactReferenceResolved: Boolean(exact),
      pathsUsed,
      queryDisposition,
      candidateDiagnostics,
      sources,
      fallback: Object.freeze({
        used: !sources.length || !vectorResults.length,
        ...(vectorReason ? { reason: vectorReason } : {})
      }),
      limitations: Object.freeze([
        "Scripture is primary; interpretation and user-approved records remain distinct.",
        "TIG and vector retrieval are deterministic ranking inputs and do not declare divine certainty."
      ]),
      contextTokenCount: sources.reduce(
        (sum, source) => sum + estimateTokens(source.content),
        0
      ),
      latencyMs: Math.max(0, this.#monotonicNow() - started),
      indexVersion: request.activeIndexVersion
    });
  }
}
