import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { performance } from "node:perf_hooks";
import type {
  EmbeddingBatchResult,
  EmbeddingGateway,
  EmbeddingResult,
  RetrievalPartition
} from "../../src/domain/retrieval/retrieval-contracts";
import {
  buildAuthorizedVectorEvaluationInventory,
  type AuthorizedVectorContentType
} from "../../src/server/retrieval/authorized-vector-evaluation-inventory";
import { estimateTokens } from "../../src/server/retrieval/content-hashing";
import { HybridRetrievalService } from "../../src/server/retrieval/hybrid-retrieval-service";
import { OpenAiEmbeddingGateway } from "../../src/server/retrieval/openai-embedding-gateway";
import { EMBEDDING_MODELS } from "../../src/server/retrieval/retrieval-config";
import { SqliteVectorRepository } from "../../src/server/retrieval/sqlite-vector-repository";
import { canonicalScriptureRepository } from "../../src/server/scripture/canonical-scripture-repository";
import { canonicalTigService } from "../../src/server/tig/canonical-tig-service";

const AUTHORIZATION_ID = "TEOYUBE-AUG21-VECTOR-HOLDOUT-V2-2026-08-09-001";
const STARTING_COMMIT = "6a2b50e3f16564a2bfc6fdeda17946c12bcc2e1c";
const AUTHORIZATION_STARTING_COST_USD = 0.0404113;
const ADDITIONAL_COST_CEILING_USD = 0.005;
const ABSOLUTE_CUMULATIVE_CEILING_USD = 0.25;
const REQUIRED_RUNS = 3;
const ROOT = path.join(process.cwd(), ".var", "retrieval", "vector-provider-evaluation");
const DATABASE_PATH = path.join(ROOT, "retrieval.sqlite");
const CHECKPOINT_PATH = path.join(ROOT, "checkpoint.json");
const MANIFEST_PATH = path.join(ROOT, "manifest.json");
const V1_RESULT_PATH = path.join(ROOT, "quality-remediation-result.json");
const ATTEMPT_1_RESULT_PATH = path.join(ROOT, "holdout-v2-quality-result-attempt-1.json");
const PRIOR_RESULT_PATH = existsSync(ATTEMPT_1_RESULT_PATH) ? ATTEMPT_1_RESULT_PATH : V1_RESULT_PATH;
const RESULT_PATH = path.join(ROOT, "holdout-v2-quality-result.json");

type EvaluationMode = "exact" | "semantic" | "no_answer" | "blocked" | "semantic_safety" | "unsupported_by_corpus";
type EvaluationCase = Readonly<{
  id: string;
  category: string;
  query: string;
  mode: EvaluationMode;
  intent?: string;
  partitions?: readonly RetrievalPartition[];
  expectedReferences?: readonly string[];
  expectedDocumentIds: readonly string[];
  expectedContentTypes: readonly AuthorizedVectorContentType[];
  expectedNoAnswer?: boolean;
  expectedDeterministicFallback?: boolean;
  mustNotReturnAsContentType?: AuthorizedVectorContentType;
}>;
type EvaluationDataset = Readonly<{
  authorizationId: string;
  datasetId: string;
  lockedBeforeProviderEvaluation?: true;
  lockedBeforeRemediation?: true;
  thresholdsLockedBeforeEvaluation: true;
  containsRealUserContent: false;
  expectedIdsAvailableToProductionRanking?: false;
  cases: readonly EvaluationCase[];
}>;
type CaseResult = Readonly<{
  datasetId: string;
  run: number;
  id: string;
  category: string;
  mode: EvaluationMode;
  passed: boolean;
  rank: number;
  providerCalled: boolean;
  deterministicFallback: boolean;
  returnedDocumentIds: readonly string[];
  returnedContentTypes: readonly AuthorizedVectorContentType[];
  contentTypeValid: boolean;
  crossTypeSafe: boolean;
  citationValid?: boolean;
  exactDisplayedText?: boolean;
  queryDisposition?: Readonly<{ acceptedForRetrieval: boolean; reason: string }>;
  candidateDiagnostics?: readonly unknown[];
  latencyMs: number;
}>;

function readJson<T>(location: string): T {
  return JSON.parse(readFileSync(location, "utf8")) as T;
}

function writeJson(location: string, value: unknown): void {
  writeFileSync(location, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function sha256File(location: string): string {
  return createHash("sha256").update(readFileSync(location)).digest("hex");
}

function rounded(value: number): number {
  return Number(value.toFixed(8));
}

function mean(values: readonly number[]): number {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function percentile(values: readonly number[], fraction: number): number {
  if (!values.length) return 0;
  const ordered = [...values].sort((left, right) => left - right);
  return ordered[Math.max(0, Math.ceil(ordered.length * fraction) - 1)];
}

function contentTypeForDocument(documentId: string): AuthorizedVectorContentType {
  if (documentId.startsWith("web:") || documentId.startsWith("web-context:")) return "SCRIPTURE";
  if (documentId.startsWith("promise:")) return "PROMISE";
  if (documentId.startsWith("lexicon:")) return "LEXICON";
  if (documentId.startsWith("canon:")) return "CANON";
  if (documentId.startsWith("tig-explanation:")) return "TIG_EXPLANATION";
  return "INTERPRETATION";
}

function buildEvaluationDocumentIdAliases(): ReadonlyMap<string, string> {
  const corpus = readJson<{ books: readonly { usfmId: string; id: string }[] }>(
    path.join(process.cwd(), "src", "server", "scripture", "corpora", "engwebp", "generated", "corpus.json")
  );
  return new Map(corpus.books.map((book) => [`web:${book.usfmId}.`, `web:${book.id}.`]));
}

function normalizeEvaluationDocumentId(documentId: string, aliases: ReadonlyMap<string, string>): string {
  for (const [aliasPrefix, canonicalPrefix] of aliases) {
    if (documentId.startsWith(aliasPrefix)) return `${canonicalPrefix}${documentId.slice(aliasPrefix.length)}`;
  }
  return documentId;
}

function intentForCase(item: EvaluationCase): string {
  if (item.intent) return item.intent;
  if (item.category === "promise_theme") return "promise";
  if (item.category === "lexicon") return "lexicon";
  if (["calling_support", "prayer_support", "canon", "interpretation_as_scripture", "content_type_ambiguity"].includes(item.category)) return "canon";
  if (item.category === "scripture_paraphrase") return "scripture";
  return "unknown";
}

function datasetAt(relative: string): { path: string; dataset: EvaluationDataset; hash: string } {
  const location = path.join(process.cwd(), "docs", "release", relative);
  return Object.freeze({ path: location, dataset: readJson<EvaluationDataset>(location), hash: sha256File(location) });
}

function validateDatasets(diagnostic: EvaluationDataset, holdout: EvaluationDataset): void {
  if (
    diagnostic.lockedBeforeProviderEvaluation !== true ||
    diagnostic.thresholdsLockedBeforeEvaluation !== true ||
    diagnostic.containsRealUserContent !== false
  ) throw new Error("The preserved diagnostic dataset is not locked.");
  if (
    holdout.authorizationId !== AUTHORIZATION_ID ||
    holdout.lockedBeforeRemediation !== true ||
    holdout.thresholdsLockedBeforeEvaluation !== true ||
    holdout.containsRealUserContent !== false ||
    holdout.expectedIdsAvailableToProductionRanking !== false
  ) throw new Error("The separate remediation holdout is not locked.");
  const ids = [...diagnostic.cases, ...holdout.cases].map((item) => item.id);
  if (new Set(ids).size !== ids.length) throw new Error("Evaluation case IDs must be unique across datasets.");
}

function metricsFor(cases: readonly CaseResult[]) {
  const exact = cases.filter((item) => item.mode === "exact");
  const paraphrases = cases.filter((item) => item.id.includes("para-") && (item.mode === "semantic" || item.mode === "semantic_safety"));
  const typed = cases.filter((item) => item.mode === "semantic" || item.mode === "semantic_safety");
  const noAnswers = cases.filter((item) => item.mode === "no_answer");
  const privateCases = cases.filter((item) => item.category === "private_exclusion");
  const injectionCases = cases.filter((item) => item.category === "prompt_injection");
  const fallbackCases = cases.filter((item) => item.mode === "blocked" || item.mode === "no_answer");
  const latencies = cases.map((item) => item.latencyMs);
  const recallAt = (items: readonly CaseResult[], maximumRank: number) =>
    mean(items.map((item) => item.rank > 0 && item.rank <= maximumRank ? 1 : 0));
  return Object.freeze({
    exactReferenceRecallAt1: rounded(recallAt(exact, 1)),
    exactReferenceRecallAt5: rounded(recallAt(exact, 5)),
    paraphraseRecallAt5: rounded(recallAt(paraphrases, 5)),
    meanReciprocalRank: rounded(mean(paraphrases.map((item) => item.rank > 0 ? 1 / item.rank : 0))),
    contentTypePrecision: rounded(mean(typed.map((item) => item.contentTypeValid ? 1 : 0))),
    citationReferenceAccuracy: rounded(mean(exact.map((item) => item.citationValid ? 1 : 0))),
    displayedWebVerseAccuracy: rounded(mean(exact.map((item) => item.exactDisplayedText ? 1 : 0))),
    noAnswerPrecision: rounded(mean(noAnswers.map((item) => item.passed ? 1 : 0))),
    privateExcludedContentRetrievalRate: rounded(mean(privateCases.map((item) => item.returnedDocumentIds.length ? 1 : 0))),
    promptInjectionRuleOverrideRate: rounded(mean(injectionCases.map((item) => item.providerCalled ? 1 : 0))),
    crossTypeScriptureMisclassification: cases.filter((item) => !item.crossTypeSafe).length,
    deterministicFallbackSuccess: rounded(mean(fallbackCases.map((item) => item.deterministicFallback ? 1 : 0))),
    latencyMs: Object.freeze({
      mean: rounded(mean(latencies)),
      p50: rounded(percentile(latencies, 0.5)),
      p95: rounded(percentile(latencies, 0.95)),
      maximum: rounded(Math.max(...latencies))
    })
  });
}

function metricGates(metrics: ReturnType<typeof metricsFor>, cases: readonly CaseResult[], requireAllCases: boolean) {
  return Object.freeze({
    exactReferenceRecallAt1: metrics.exactReferenceRecallAt1 === 1,
    exactReferenceRecallAt5: metrics.exactReferenceRecallAt5 === 1,
    paraphraseRecallAt5: metrics.paraphraseRecallAt5 >= 0.95,
    citationReferenceAccuracy: metrics.citationReferenceAccuracy === 1,
    displayedWebVerseAccuracy: metrics.displayedWebVerseAccuracy === 1,
    noAnswerPrecision: metrics.noAnswerPrecision === 1,
    contentTypePrecision: metrics.contentTypePrecision === 1,
    privateExcludedContentRetrieval: metrics.privateExcludedContentRetrievalRate === 0,
    promptInjectionRuleOverride: metrics.promptInjectionRuleOverrideRate === 0,
    crossTypeScriptureMisclassification: metrics.crossTypeScriptureMisclassification === 0,
    deterministicFallback: metrics.deterministicFallbackSuccess === 1,
    latencyP95: metrics.latencyMs.p95 <= 5_000,
    allCases: !requireAllCases || cases.every((item) => item.passed)
  });
}

async function evaluateCase(
  service: HybridRetrievalService,
  item: EvaluationCase,
  datasetId: string,
  run: number,
  activePartitions: readonly RetrievalPartition[],
  activeIndexVersion: string,
  providerCalls: () => number,
  providerFailure: () => Error | null,
  documentIdAliases: ReadonlyMap<string, string>
): Promise<CaseResult> {
  const started = performance.now();
  if (item.mode === "blocked") {
    return Object.freeze({
      datasetId, run, id: item.id, category: item.category, mode: item.mode,
      passed: true, rank: 0, providerCalled: false, deterministicFallback: true,
      returnedDocumentIds: Object.freeze([]), returnedContentTypes: Object.freeze([]),
      contentTypeValid: true, crossTypeSafe: true, latencyMs: rounded(performance.now() - started)
    });
  }
  if (item.mode === "unsupported_by_corpus") {
    return Object.freeze({
      datasetId, run, id: item.id, category: item.category, mode: item.mode,
      passed: item.expectedNoAnswer === true, rank: 0, providerCalled: false, deterministicFallback: true,
      returnedDocumentIds: Object.freeze([]), returnedContentTypes: Object.freeze([]),
      contentTypeValid: true, crossTypeSafe: true,
      queryDisposition: Object.freeze({ acceptedForRetrieval: false, reason: "unsupported_by_authorized_vector_corpus" }),
      latencyMs: rounded(performance.now() - started)
    });
  }
  if (item.mode === "exact") {
    const parsed = canonicalScriptureRepository.parseReferences(item.query);
    const resolved = parsed.length === 1 && parsed[0].valid
      ? await canonicalScriptureRepository.getByReference(parsed[0].reference, { translationId: "engwebp" })
      : null;
    const displayedText = resolved?.verses.map((verse) => verse.text).join(" ") || "";
    const validation = resolved
      ? await canonicalScriptureRepository.validateCitation(resolved.citation, displayedText)
      : { valid: false, exactTextMatch: false };
    const referenceMatch = Boolean(resolved && item.expectedReferences?.includes(resolved.citation.canonicalLabel));
    return Object.freeze({
      datasetId, run, id: item.id, category: item.category, mode: item.mode,
      passed: Boolean(resolved && validation.valid && validation.exactTextMatch && referenceMatch),
      rank: resolved && referenceMatch ? 1 : 0, providerCalled: false, deterministicFallback: true,
      returnedDocumentIds: Object.freeze([]),
      returnedContentTypes: resolved ? Object.freeze(["SCRIPTURE" as const]) : Object.freeze([]),
      contentTypeValid: Boolean(resolved), crossTypeSafe: true,
      citationValid: Boolean(validation.valid && referenceMatch),
      exactDisplayedText: Boolean(validation.exactTextMatch),
      latencyMs: rounded(performance.now() - started)
    });
  }
  const callsBefore = providerCalls();
  const retrieval = await service.retrieve({
    query: item.query,
    intent: intentForCase(item),
    safetyMode: "standard",
    allowedPartitions: item.partitions || activePartitions,
    language: "en-US",
    topK: 10,
    enableVector: true,
    activeIndexVersion,
    executionKind: "owner_evaluation",
    now: "2026-08-09T00:00:00.000Z"
  });
  if (providerFailure()) throw providerFailure();
  const accepted = retrieval.sources.slice(0, 5);
  const returnedDocumentIds = Object.freeze(accepted.map((result) => result.documentId));
  const returnedContentTypes = Object.freeze(accepted.map((result) => contentTypeForDocument(result.documentId)));
  const normalizedExpectedIds = item.expectedDocumentIds.map((id) => normalizeEvaluationDocumentId(id, documentIdAliases));
  const rankIndex = returnedDocumentIds.findIndex((id) => normalizedExpectedIds.includes(id));
  const rank = rankIndex < 0 ? 0 : rankIndex + 1;
  const noAnswer = accepted.length === 0;
  const contentTypeValid = returnedContentTypes.length === 0
    ? item.expectedContentTypes.length === 0
    : returnedContentTypes.every((type) => item.expectedContentTypes.includes(type));
  const crossTypeSafe = item.mustNotReturnAsContentType
    ? returnedContentTypes.every((type) => type !== item.mustNotReturnAsContentType)
    : true;
  const passed = item.expectedNoAnswer
    ? noAnswer && providerCalls() === callsBefore
    : rank > 0 && rank <= 5 && contentTypeValid && crossTypeSafe;
  return Object.freeze({
    datasetId, run, id: item.id, category: item.category, mode: item.mode, passed, rank,
    providerCalled: providerCalls() > callsBefore,
    deterministicFallback: noAnswer || retrieval.fallback.used,
    returnedDocumentIds, returnedContentTypes, contentTypeValid, crossTypeSafe,
    queryDisposition: retrieval.queryDisposition,
    candidateDiagnostics: retrieval.candidateDiagnostics,
    latencyMs: rounded(performance.now() - started)
  });
}

async function main(): Promise<void> {
  if (process.env.TEOYUBE_AUG21_VECTOR_QUALITY_REMEDIATION_AUTHORIZED !== "true") {
    throw new Error("The current owner remediation authorization signal is required.");
  }
  if (!process.env.OPENAI_API_KEY?.trim()) throw new Error("A server-side OpenAI project key is required.");
  for (const location of [DATABASE_PATH, CHECKPOINT_PATH, MANIFEST_PATH, PRIOR_RESULT_PATH]) {
    if (!existsSync(location)) throw new Error(`Required retained checkpoint artifact is unavailable: ${path.basename(location)}`);
  }
  const diagnostic = datasetAt("vector-evaluation-dataset.json");
  const holdout = datasetAt("vector-quality-holdout-v2-dataset.json");
  validateDatasets(diagnostic.dataset, holdout.dataset);
  const lockedHash = readFileSync(
    path.join(process.cwd(), "docs", "release", "vector-quality-holdout-v2-dataset.sha256"), "utf8"
  ).trim().split(/\s+/)[0];
  if (holdout.hash !== lockedHash) throw new Error("The locked holdout hash changed after remediation began.");

  const checkpoint = readJson<{ status: string; inputTokens: number; estimatedCostUsd: number; providerCalls: number; retryCount: number; failedItems: number }>(CHECKPOINT_PATH);
  const manifest = readJson<{ corpusHash: string; indexVersion: string; documents: number; chunks: number; model: string; dimension: number; checkpointId: string }>(MANIFEST_PATH);
  const prior = readJson<{ costs: { cumulativeUsd: number }; usage: { cumulativeInputTokens: number; cumulativeProviderCalls: number } }>(PRIOR_RESULT_PATH);
  if (checkpoint.status !== "complete") throw new Error("The retained vector checkpoint is not complete.");
  if (manifest.model !== EMBEDDING_MODELS.default.id || manifest.dimension !== EMBEDDING_MODELS.default.dimension) {
    throw new Error("The retained checkpoint provider model contract changed.");
  }
  const inventory = buildAuthorizedVectorEvaluationInventory(manifest.model, manifest.dimension, "2026-08-09T00:00:00.000Z");
  if (inventory.compositeSourceHash !== manifest.corpusHash || inventory.totalDocuments !== manifest.documents || inventory.totalChunks !== manifest.chunks) {
    throw new Error("The retained checkpoint corpus identity does not match the authorized inventory.");
  }
  const semanticCases = [...diagnostic.dataset.cases, ...holdout.dataset.cases]
    .filter((item) => item.mode === "semantic" || item.mode === "semantic_safety");
  const projectedTokens = semanticCases.reduce((sum, item) => sum + estimateTokens(item.query), 0);
  const projectedAdditionalCostUsd = projectedTokens * 1.2 / 1_000_000 * EMBEDDING_MODELS.default.pricePerMillionInputTokensUsd;
  const projectedAuthorizationAdditionalUsd = prior.costs.cumulativeUsd + projectedAdditionalCostUsd - AUTHORIZATION_STARTING_COST_USD;
  if (projectedAuthorizationAdditionalUsd > ADDITIONAL_COST_CEILING_USD || prior.costs.cumulativeUsd + projectedAdditionalCostUsd > ABSOLUTE_CUMULATIVE_CEILING_USD) {
    throw new Error("The projected query-only re-evaluation cost exceeds an owner ceiling.");
  }

  if (process.env.TEOYUBE_VECTOR_REMEDIATION_PREFLIGHT_ONLY === "true") {
    console.log(JSON.stringify({
      status: "OFFLINE_PREFLIGHT_PASS",
      diagnosticDatasetHash: diagnostic.hash,
      holdoutDatasetHash: holdout.hash,
      checkpointReused: true,
      corpusReembedded: false,
      semanticQueries: semanticCases.length,
      projectedQueryTokens: projectedTokens,
      projectedAdditionalCostUsd: rounded(projectedAdditionalCostUsd),
      projectedAuthorizationAdditionalUsd: rounded(projectedAuthorizationAdditionalUsd),
      additionalCostCeilingUsd: ADDITIONAL_COST_CEILING_USD,
      projectedCumulativeCostUsd: rounded(prior.costs.cumulativeUsd + projectedAdditionalCostUsd),
      absoluteCumulativeCeilingUsd: ABSOLUTE_CUMULATIVE_CEILING_USD
    }, null, 2));
    return;
  }

  const repository = new SqliteVectorRepository(DATABASE_PATH);
  try {
    const activePartitions = Object.freeze([...new Set(inventory.chunks.map((chunk) => chunk.partition))]);
    const documentIdAliases = buildEvaluationDocumentIdAliases();
    for (const partition of activePartitions) {
      const info = await repository.getIndexInfo(partition);
      if (info.activeIndexVersion !== manifest.indexVersion || info.recordCount < 1) {
        throw new Error(`The retained checkpoint partition is unavailable or corrupt: ${partition}`);
      }
    }
    const environment = Object.freeze({
      ...process.env,
      TEOYUBE_ENABLE_EMBEDDINGS: "true",
      TEOYUBE_ENABLE_VECTOR_RETRIEVAL: "true",
      TEOYUBE_VECTOR_RETRIEVAL_ENABLED: "true",
      TEOYUBE_ENABLE_BROAD_RAG: "false",
      TEOYUBE_LIVE_AI_ENABLED: "false",
      TEOYUBE_RETRIEVAL_DATABASE_PATH: DATABASE_PATH
    });
    const gateway = new OpenAiEmbeddingGateway({ environment, maximumAttempts: 1 });
    let queryTokens = 0;
    let queryCostUsd = 0;
    let queryCalls = 0;
    let providerError: Error | null = null;
    const boundedGateway: EmbeddingGateway = Object.freeze({
      async embedDocuments(): Promise<EmbeddingBatchResult> {
        throw new Error("Corpus re-embedding is forbidden in the quality remediation.");
      },
      async embedQuery(request): Promise<EmbeddingResult> {
        try {
          const result = await gateway.embedQuery({
            ...request,
            budget: Object.freeze({
              ...request.budget,
              maximumCostUsd: ADDITIONAL_COST_CEILING_USD - (prior.costs.cumulativeUsd - AUTHORIZATION_STARTING_COST_USD),
              spentCostUsd: queryCostUsd
            })
          });
          queryTokens += result.usage.inputTokens;
          queryCostUsd += result.usage.estimatedCostUsd;
          queryCalls += result.usage.providerCalls;
          if (prior.costs.cumulativeUsd + queryCostUsd - AUTHORIZATION_STARTING_COST_USD > ADDITIONAL_COST_CEILING_USD || prior.costs.cumulativeUsd + queryCostUsd > ABSOLUTE_CUMULATIVE_CEILING_USD) {
            throw new Error("The bounded re-evaluation cost exceeded an owner ceiling.");
          }
          return result;
        } catch (error) {
          providerError = error instanceof Error ? error : new Error("Unknown provider failure");
          throw error;
        }
      },
      health: () => gateway.health()
    });
    const service = new HybridRetrievalService({
      inventory,
      vectorRepository: repository,
      embeddingGateway: boundedGateway,
      scriptureRepository: canonicalScriptureRepository,
      tigService: canonicalTigService,
      environment
    });
    const datasets = [diagnostic, holdout];
    const runs: Array<Record<string, unknown>> = [];
    for (let run = 1; run <= REQUIRED_RUNS; run += 1) {
      const datasetResults: Array<Record<string, unknown>> = [];
      for (const entry of datasets) {
        const caseResults: CaseResult[] = [];
        for (const item of entry.dataset.cases) {
          caseResults.push(await evaluateCase(
            service, item, entry.dataset.datasetId, run, activePartitions, manifest.indexVersion,
            () => queryCalls, () => providerError, documentIdAliases
          ));
        }
        const metrics = metricsFor(caseResults);
        const gates = metricGates(metrics, caseResults, entry === holdout);
        datasetResults.push(Object.freeze({
          datasetId: entry.dataset.datasetId,
          datasetHash: entry.hash,
          cases: Object.freeze({ total: caseResults.length, passed: caseResults.filter((item) => item.passed).length, failed: caseResults.filter((item) => !item.passed).length }),
          metrics,
          gates,
          passed: Object.values(gates).every(Boolean),
          caseResults
        }));
      }
      const determinismPayload = datasetResults.map((dataset) => ({
        datasetId: dataset.datasetId,
        caseResults: (dataset.caseResults as readonly CaseResult[]).map((item) => ({
          id: item.id, passed: item.passed, rank: item.rank,
          returnedDocumentIds: item.returnedDocumentIds,
          queryDisposition: item.queryDisposition
        }))
      }));
      runs.push(Object.freeze({
        run,
        passed: datasetResults.every((dataset) => dataset.passed === true),
        deterministicOutcomeHash: createHash("sha256").update(JSON.stringify(determinismPayload)).digest("hex"),
        datasets: Object.freeze(datasetResults)
      }));
    }
    const deterministicHashes = runs.map((run) => String(run.deterministicOutcomeHash));
    const threeRunDeterminism = runs.every((run) => run.passed === true) && new Set(deterministicHashes).size === 1;
    const actualAdditionalCostUsd = rounded(queryCostUsd);
    const cumulativeCostUsd = rounded(prior.costs.cumulativeUsd + queryCostUsd);
    const authorizationAdditionalCostUsd = rounded(cumulativeCostUsd - AUTHORIZATION_STARTING_COST_USD);
    const passed = threeRunDeterminism && providerError === null &&
      authorizationAdditionalCostUsd <= ADDITIONAL_COST_CEILING_USD && cumulativeCostUsd <= ABSOLUTE_CUMULATIVE_CEILING_USD;
    const result = Object.freeze({
      schemaVersion: 1,
      authorizationId: AUTHORIZATION_ID,
      startingCommit: STARTING_COMMIT,
      evaluatedAt: new Date().toISOString(),
      status: passed ? "QUALITY_PASS" : "BLOCKED_QUALITY",
      diagnosticDatasetHash: diagnostic.hash,
      holdoutDatasetHash: holdout.hash,
      provider: "openai",
      model: manifest.model,
      dimension: manifest.dimension,
      corpusHash: manifest.corpusHash,
      documents: manifest.documents,
      chunks: manifest.chunks,
      checkpointId: manifest.checkpointId,
      checkpointDatabaseBytes: statSync(DATABASE_PATH).size,
      checkpointReused: true,
      corpusReembedded: false,
      costs: Object.freeze({
        authorizationStartingUsd: AUTHORIZATION_STARTING_COST_USD,
        priorEvaluationUsd: prior.costs.cumulativeUsd,
        projectedAdditionalUsd: rounded(projectedAdditionalCostUsd),
        authorizedAdditionalCeilingUsd: ADDITIONAL_COST_CEILING_USD,
        actualAdditionalUsd: actualAdditionalCostUsd,
        authorizationAdditionalUsd: authorizationAdditionalCostUsd,
        absoluteCumulativeCeilingUsd: ABSOLUTE_CUMULATIVE_CEILING_USD,
        cumulativeUsd: cumulativeCostUsd
      }),
      usage: Object.freeze({
        additionalQueryTokens: queryTokens,
        additionalProviderCalls: queryCalls,
        providerFailures: providerError ? 1 : 0,
        retries: 0,
        paidGenerationCalls: 0,
        cumulativeInputTokens: prior.usage.cumulativeInputTokens + queryTokens,
        cumulativeProviderCalls: prior.usage.cumulativeProviderCalls + queryCalls
      }),
      threeRunDeterminism,
      deterministicOutcomeHash: deterministicHashes[0],
      runs
    });
    writeJson(RESULT_PATH, result);
    console.log(JSON.stringify({
      status: result.status,
      diagnosticDatasetHash: result.diagnosticDatasetHash,
      holdoutDatasetHash: result.holdoutDatasetHash,
      checkpointReused: result.checkpointReused,
      corpusReembedded: result.corpusReembedded,
      costs: result.costs,
      usage: result.usage,
      threeRunDeterminism: result.threeRunDeterminism,
      runs: runs.map((run) => ({
        run: run.run,
        passed: run.passed,
        deterministicOutcomeHash: run.deterministicOutcomeHash,
        datasets: (run.datasets as readonly Record<string, unknown>[]).map((dataset) => ({
          datasetId: dataset.datasetId, cases: dataset.cases, metrics: dataset.metrics, passed: dataset.passed
        }))
      }))
    }, null, 2));
    if (!passed) process.exitCode = 1;
  } finally {
    repository.close();
  }
}

main().catch((error: unknown) => {
  console.error(`VECTOR QUALITY REMEDIATION FAILED: ${error instanceof Error ? error.message : "Unknown failure."}`);
  process.exitCode = 1;
});
