import type {
  SourceValidationResult,
  TigCandidate,
  TigComplexityLimits,
  TigConfidence,
  TigExplanation,
  TigFallbackReasonCode,
  TigNormalizedUserContext,
  TigRecommendationInput,
  TigRecommendationResult,
  TigRecommendationSurface,
  TigSafeConfiguration,
  TigScriptureAnchor,
  TigService,
  TigVersionSet
} from "../../domain/tig/tig-service";
import { runTigEndToEndRecommendation } from "../../lib/teoyube/tig/tig-end-to-end-recommendation-flow";
import { scoreTigRecommendationCandidate } from "../../lib/teoyube/tig/tig-recommendation-scoring";
import { getScriptureSeedById } from "../../lib/tig/seed/scriptures.seed";
import type {
  TeoyubeTigRecommendationCandidate,
  TeoyubeTigRecommendationInput,
  TeoyubeTigRecommendationResult
} from "../../lib/teoyube/tig/tig-recommendation-contracts";
import {
  createTigVersionedCacheKey,
  TigVersionedCache,
  type TigCacheDiagnostics
} from "./tig-versioned-cache";
import { canonicalScriptureRepository } from "../scripture/canonical-scripture-repository";

export const TIG_DATASET_VERSION = "teoyube-local-dataset-2026-07-20.1";
export const TIG_RULESET_VERSION = "teoyube-deterministic-ruleset-2026-07-20.1";

export const TIG_DEFAULT_COMPLEXITY_LIMITS: TigComplexityLimits = Object.freeze({
  inputLength: 2_000,
  candidateCount: 100,
  traversalDepth: 12,
  expandedNodes: 250,
  executionDurationMs: 5_000
});

const DEFAULT_SAFE_CONFIGURATION: TigSafeConfiguration = Object.freeze({
  scriptureAuthority: "primary",
  liveModelEnabled: false,
  personalizationEnabled: false,
  locale: "en"
});

const FIXED_LIMITATION = "TIG recommendations are deterministic, explainable aids for discernment; they are not Scripture, divine speech, a final calling, or a declaration of promise fulfillment.";
const PRIVATE_KEY_PATTERN = /(?:private|reflection|prayer|secret|token|password|credential)/i;

type CanonicalEngine = (input?: TeoyubeTigRecommendationInput) => TeoyubeTigRecommendationResult;

export type CanonicalTigServiceOptions = Readonly<{
  datasetVersion?: string;
  rulesetVersion?: string;
  now?: () => number;
  monotonicNow?: () => number;
  engine?: CanonicalEngine;
}>;

function stableSerialize(value: unknown): string {
  if (value === undefined) return '"__undefined__"';
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(",")}]`;
  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, child]) => `${JSON.stringify(key)}:${stableSerialize(child)}`)
    .join(",")}}`;
}

function stableFingerprint(value: unknown): string {
  const text = stableSerialize(value);
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function unique(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values.map((value) => value.trim()).filter(Boolean))]);
}

function normalizeQuery(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeSurface(input: TigRecommendationInput): TigRecommendationSurface {
  if (input.surface) return input.surface;
  if (input.intent === "prayer") return "prayer";
  if (input.intent === "calling") return "calling";
  if (input.intent === "promise") return "promise_table";
  if (input.intent === "scripture") return "canon";
  if (input.intent === "teoyube_word") return "word_card";
  if (input.intent === "daily_journey") return "daily_word";
  return "tig_response_panel";
}

function safeSignals(context: Readonly<Record<string, unknown>> | undefined) {
  const signals: Record<string, string | number | boolean | readonly string[]> = {};
  for (const [key, value] of Object.entries(context || {}).sort(([left], [right]) => left.localeCompare(right)).slice(0, 20)) {
    if (PRIVATE_KEY_PATTERN.test(key)) continue;
    if (typeof value === "string") signals[key] = normalizeQuery(value).slice(0, 200);
    else if (typeof value === "number" || typeof value === "boolean") signals[key] = value;
    else if (Array.isArray(value)) signals[key] = Object.freeze(value.filter((item): item is string => typeof item === "string").map((item) => normalizeQuery(item).slice(0, 100)).slice(0, 20));
  }
  return Object.freeze(signals);
}

function normalizeContext(input: TigRecommendationInput): TigNormalizedUserContext {
  const query = normalizeQuery(input.query);
  const tokens = unique(query.toLowerCase().split(/[^a-z0-9_-]+/).filter((token) => token.length > 2).slice(0, 64));
  return Object.freeze({
    query,
    intent: input.intent,
    surface: normalizeSurface(input),
    tokens,
    safeSignals: safeSignals(input.context),
    privateTextPresent: Boolean(input.privacy?.containsPrivatePrayerText || input.privacy?.containsPrivateReflectionText)
  });
}

function normalizedInputLength(input: TigRecommendationInput, context: TigNormalizedUserContext): number {
  return [context.query, input.callingInput, input.prayerInput, input.actionInput]
    .reduce((total, value) => total + normalizeQuery(value || "").length, 0)
    + stableSerialize(context.safeSignals).length;
}

function containsPrivateText(input: TigRecommendationInput, context: TigNormalizedUserContext): boolean {
  if (context.privateTextPresent || input.prayerInput || input.intent === "prayer" || context.surface === "prayer") return true;
  return Object.keys(input.context || {}).some((key) => PRIVATE_KEY_PATTERN.test(key));
}

function boundedPositive(value: number | undefined, maximum: number): number {
  if (value === undefined || !Number.isFinite(value)) return maximum;
  return Math.max(1, Math.min(maximum, Math.floor(value)));
}

function resolveLimits(requested: Partial<TigComplexityLimits> | undefined): TigComplexityLimits {
  return Object.freeze({
    inputLength: boundedPositive(requested?.inputLength, TIG_DEFAULT_COMPLEXITY_LIMITS.inputLength),
    candidateCount: boundedPositive(requested?.candidateCount, TIG_DEFAULT_COMPLEXITY_LIMITS.candidateCount),
    traversalDepth: boundedPositive(requested?.traversalDepth, TIG_DEFAULT_COMPLEXITY_LIMITS.traversalDepth),
    expandedNodes: boundedPositive(requested?.expandedNodes, TIG_DEFAULT_COMPLEXITY_LIMITS.expandedNodes),
    executionDurationMs: boundedPositive(requested?.executionDurationMs, TIG_DEFAULT_COMPLEXITY_LIMITS.executionDurationMs)
  });
}

function resolveConfiguration(requested: Partial<TigSafeConfiguration> | undefined): TigSafeConfiguration {
  return Object.freeze({
    scriptureAuthority: "primary",
    liveModelEnabled: false,
    personalizationEnabled: requested?.personalizationEnabled === true,
    locale: normalizeQuery(requested?.locale || DEFAULT_SAFE_CONFIGURATION.locale).slice(0, 12) || "en"
  });
}

function toCanonicalInput(input: TigRecommendationInput, context: TigNormalizedUserContext): TeoyubeTigRecommendationInput {
  return {
    query: context.query,
    wordId: input.selectedWordId,
    clusterId: input.selectedPromiseClusterId,
    callingInput: input.callingInput,
    prayerInput: input.prayerInput,
    actionInput: input.actionInput,
    surface: context.surface,
    context: context.safeSignals
  };
}

function confidenceFromLegacy(confidence: TeoyubeTigRecommendationResult["confidence"]): TigConfidence {
  return Object.freeze({
    score: confidence.score,
    label: confidence.label,
    explanation: confidence.explanation,
    breakdown: Object.freeze({ ...confidence.factors })
  });
}

function canonicalAnchorValidation(reference: string): TigScriptureAnchor["validation"] {
  const canonicalReference = getScriptureSeedById(reference)?.reference || reference;
  const parsed = canonicalScriptureRepository.parseReferences(canonicalReference);
  return parsed.length === 1 && parsed[0]?.valid && canonicalScriptureRepository.hasReference(parsed[0].canonicalLabel)
    ? "verified"
    : "missing";
}

function anchorsFor(candidate: TeoyubeTigRecommendationCandidate): readonly TigScriptureAnchor[] {
  return Object.freeze(candidate.scriptureAnchors.map((reference) => Object.freeze({
    reference,
    validation: canonicalAnchorValidation(reference),
    primaryAuthority: true as const
  })));
}

function candidateFromLegacy(candidate: TeoyubeTigRecommendationCandidate, legacy: TeoyubeTigRecommendationResult): TigCandidate {
  const scored = candidate.id === legacy.selectedCandidate.id
    ? legacy.confidence
    : scoreTigRecommendationCandidate(candidate, legacy.context);
  return Object.freeze({
    id: candidate.id,
    type: candidate.type,
    label: candidate.label,
    description: candidate.description,
    source: candidate.source,
    scriptureAnchors: anchorsFor(candidate),
    relatedWordIds: Object.freeze([...candidate.relatedWordIds]),
    relatedPromiseClusterIds: Object.freeze([...candidate.relatedPromiseClusterIds]),
    relatedCallingIds: Object.freeze([...candidate.relatedCallingIds]),
    relatedPrayerIds: Object.freeze([...candidate.relatedPrayerIds]),
    relatedActionIds: Object.freeze([...candidate.relatedActionIds]),
    graphPath: Object.freeze({
      id: `path:${candidate.id}`,
      candidateId: candidate.id,
      nodeIds: Object.freeze([...candidate.tigNodeIds]),
      relationshipIds: Object.freeze([...candidate.tigRelationshipIds]),
      depth: candidate.explanationPath.length,
      explanation: Object.freeze([...candidate.explanationPath])
    }),
    confidence: confidenceFromLegacy(scored),
    explanationPath: Object.freeze([...candidate.explanationPath]),
    warnings: Object.freeze([...candidate.warnings]),
    fallbackEligible: candidate.fallbackEligible
  });
}

function sourceValidationFromLegacy(recommendationId: string, legacy: TeoyubeTigRecommendationResult): SourceValidationResult {
  const all = unique(legacy.scriptureAnchorCheck.scriptureAnchors);
  const missing = unique(all.filter((reference) => canonicalAnchorValidation(reference) !== "verified"));
  const verified = unique(all.filter((reference) => canonicalAnchorValidation(reference) === "verified"));
  const unsupported = Object.freeze([]) as readonly string[];
  return Object.freeze({
    valid: missing.length === 0,
    recommendationId,
    verified,
    unsupported,
    missing,
    warnings: Object.freeze([...legacy.scriptureAnchorCheck.warnings]),
    blockers: Object.freeze([...legacy.scriptureAnchorCheck.blockers])
  });
}

function fallbackAnchor(): TigScriptureAnchor {
  return Object.freeze({ reference: "Ephesians 1:18", validation: "verified", primaryAuthority: true });
}

function limitFallback(params: {
  code: Exclude<TigFallbackReasonCode, "legacy_fallback">;
  detail: string;
  normalizedContext: TigNormalizedUserContext;
  versions: TigVersionSet;
  configuration: TigSafeConfiguration;
  limits: TigComplexityLimits;
}): TigRecommendationResult {
  const recommendationId = `tig:${stableFingerprint({
    context: params.normalizedContext,
    versions: params.versions,
    configuration: params.configuration,
    limits: params.limits,
    code: params.code
  })}`;
  const anchor = fallbackAnchor();
  const confidence: TigConfidence = Object.freeze({
    score: 0,
    label: "fallback_match",
    explanation: "Confidence is limited because a TIG safety or complexity boundary was reached.",
    breakdown: Object.freeze({
      scriptureAnchorStrength: 0,
      promiseClusterRelevance: 0,
      teoyubeWordRelevance: 0,
      callingPathRelevance: 0,
      prayerActionRelevance: 0,
      explanationTraceCompleteness: 1,
      fallbackPenalty: 1,
      dataQualityPenalty: 0
    })
  });
  const path = Object.freeze({
    id: `path:${recommendationId}`,
    candidateId: "fallback:bounded-tig-service",
    nodeIds: Object.freeze([]),
    relationshipIds: Object.freeze([]),
    depth: 0,
    explanation: Object.freeze([params.detail, "Review Ephesians 1:18 in context before continuing."])
  });
  const candidate: TigCandidate = Object.freeze({
    id: "fallback:bounded-tig-service",
    type: "scripture",
    label: "Scripture-grounded review required",
    description: "TIG stopped at a documented safety or complexity boundary and returned a reviewable fallback.",
    source: "safe_fallback",
    scriptureAnchors: Object.freeze([anchor]),
    relatedWordIds: Object.freeze([]),
    relatedPromiseClusterIds: Object.freeze([]),
    relatedCallingIds: Object.freeze([]),
    relatedPrayerIds: Object.freeze([]),
    relatedActionIds: Object.freeze([]),
    graphPath: path,
    confidence,
    explanationPath: path.explanation,
    warnings: Object.freeze([params.detail]),
    fallbackEligible: false
  });
  const limitations = Object.freeze([FIXED_LIMITATION, params.detail]);
  const explanation: TigExplanation = Object.freeze({
    recommendationId,
    summary: "TIG returned a typed, Scripture-grounded fallback after reaching a documented limit.",
    steps: Object.freeze([Object.freeze({
      id: `step:${params.code}`,
      label: "Applied TIG limit",
      summary: params.detail,
      source: "tig_limit",
      relatedIds: Object.freeze([params.code]),
      scriptureAnchors: Object.freeze([anchor.reference]),
      fallbackRelated: true,
      visibleToUser: true as const
    })]),
    scriptureAnchors: Object.freeze([anchor]),
    sourcePaths: Object.freeze([path]),
    confidence,
    limitations,
    versions: params.versions
  });
  const sourceValidation: SourceValidationResult = Object.freeze({
    valid: false,
    recommendationId,
    verified: Object.freeze([anchor.reference]),
    unsupported: Object.freeze([]),
    missing: Object.freeze([]),
    warnings: Object.freeze(["The fallback uses a validated WEB reference, but the TIG recommendation remains limited and requires ordinary source review."]),
    blockers: Object.freeze([])
  });
  return Object.freeze({
    recommendationId,
    versions: params.versions,
    normalizedContext: params.normalizedContext,
    selectedCandidate: candidate,
    candidates: Object.freeze([candidate]),
    confidence,
    explanation,
    limitations,
    fallback: Object.freeze({
      used: true,
      reasons: Object.freeze([Object.freeze({ code: params.code, detail: params.detail })]),
      message: explanation.summary,
      scriptureAnchors: Object.freeze([anchor]),
      safe: true as const
    }),
    sourceValidation,
    complexity: Object.freeze({
      limits: params.limits,
      candidateCount: 1,
      traversalDepth: 0,
      expandedNodes: 0,
      executionDurationMs: params.code === "execution_duration_limit"
        ? params.limits.executionDurationMs + 1
        : 0
    }),
    cache: Object.freeze({ cacheable: false, key: null, rawPrivateTextStored: false as const }),
    safety: safetyContract(),
    valid: false
  });
}

function safetyContract() {
  return Object.freeze({
    deterministic: true as const,
    readOnly: true as const,
    externalModelUsed: false as const,
    journeyStateMutated: false as const,
    journalStateMutated: false as const,
    testimonyStateMutated: false as const,
    promiseStateMutated: false as const,
    bookStateMutated: false as const,
    callingDeclaredAsFact: false as const,
    promiseFulfillmentDeclared: false as const,
    testimonyPublished: false as const
  });
}

export class CanonicalTigService implements TigService {
  readonly #versions: TigVersionSet;
  readonly #now: () => number;
  readonly #monotonicNow: () => number;
  readonly #engine: CanonicalEngine;
  readonly #cache = new TigVersionedCache<TigRecommendationResult>({ ttlMs: 5 * 60 * 1_000, maximumEntries: 100 });
  readonly #explanations = new Map<string, TigExplanation>();

  constructor(options: CanonicalTigServiceOptions = {}) {
    this.#versions = Object.freeze({
      dataset: options.datasetVersion || TIG_DATASET_VERSION,
      ruleset: options.rulesetVersion || TIG_RULESET_VERSION
    });
    this.#now = options.now || Date.now;
    this.#monotonicNow = options.monotonicNow || (() => performance.now());
    this.#engine = options.engine || runTigEndToEndRecommendation;
  }

  async recommend(input: TigRecommendationInput): Promise<TigRecommendationResult> {
    const normalizedContext = normalizeContext(input);
    const limits = resolveLimits(input.limits);
    const configuration = resolveConfiguration(input.safeConfiguration);
    const inputLength = normalizedInputLength(input, normalizedContext);
    if (inputLength > limits.inputLength) {
      return this.#remember(limitFallback({
        code: "input_length_limit",
        detail: `Normalized TIG input used ${inputLength} characters, exceeding the ${limits.inputLength}-character limit.`,
        normalizedContext,
        versions: this.#versions,
        configuration,
        limits
      }));
    }

    const cacheable = !containsPrivateText(input, normalizedContext);
    const cacheKey = cacheable ? createTigVersionedCacheKey({
      normalizedInput: {
        ...normalizedContext,
        selectedWordId: input.selectedWordId || "",
        selectedPromiseClusterId: input.selectedPromiseClusterId || "",
        callingInput: normalizeQuery(input.callingInput || ""),
        prayerInput: normalizeQuery(input.prayerInput || ""),
        actionInput: normalizeQuery(input.actionInput || "")
      },
      datasetVersion: this.#versions.dataset,
      rulesetVersion: this.#versions.ruleset,
      safeConfiguration: configuration,
      limits
    }) : null;
    if (cacheKey) {
      const cached = this.#cache.get(cacheKey, this.#now());
      if (cached) return this.#remember(cached);
    } else {
      this.#cache.bypass();
    }

    const startedAt = this.#monotonicNow();
    const legacy = this.#engine(toCanonicalInput(input, normalizedContext));
    const executionDurationMs = Math.max(0, this.#monotonicNow() - startedAt);
    if (executionDurationMs > limits.executionDurationMs) {
      return this.#remember(limitFallback({
        code: "execution_duration_limit",
        detail: `TIG execution exceeded the ${limits.executionDurationMs}ms duration limit.`,
        normalizedContext,
        versions: this.#versions,
        configuration,
        limits
      }));
    }
    if (legacy.candidates.length > limits.candidateCount) {
      return this.#remember(limitFallback({
        code: "candidate_count_limit",
        detail: `TIG produced ${legacy.candidates.length} candidates, exceeding the ${limits.candidateCount}-candidate limit.`,
        normalizedContext,
        versions: this.#versions,
        configuration,
        limits
      }));
    }

    const selectedDepth = legacy.selectedCandidate.explanationPath.length;
    if (selectedDepth > limits.traversalDepth) {
      return this.#remember(limitFallback({
        code: "traversal_depth_limit",
        detail: `The selected TIG explanation path reached depth ${selectedDepth}, exceeding the depth limit of ${limits.traversalDepth}.`,
        normalizedContext,
        versions: this.#versions,
        configuration,
        limits
      }));
    }
    const expandedNodes = new Set(legacy.selectedCandidate.tigNodeIds).size;
    if (expandedNodes > limits.expandedNodes) {
      return this.#remember(limitFallback({
        code: "expanded_nodes_limit",
        detail: `The selected TIG path expanded ${expandedNodes} nodes, exceeding the ${limits.expandedNodes}-node limit.`,
        normalizedContext,
        versions: this.#versions,
        configuration,
        limits
      }));
    }

    const candidates = Object.freeze(legacy.candidates.map((candidate) => candidateFromLegacy(candidate, legacy)));
    const selectedCandidate = candidateFromLegacy(legacy.selectedCandidate, legacy);
    const confidence = confidenceFromLegacy(legacy.confidence);
    const recommendationId = `tig:${stableFingerprint({
      normalizedContext,
      versions: this.#versions,
      selectedCandidateId: selectedCandidate.id,
      candidateOrder: candidates.map((candidate) => candidate.id)
    })}`;
    const sourceValidation = sourceValidationFromLegacy(recommendationId, legacy);
    const limitations = Object.freeze(unique([FIXED_LIMITATION, ...legacy.warnings, ...legacy.fallback.reasons]));
    const explanation: TigExplanation = Object.freeze({
      recommendationId,
      summary: legacy.explanationTrace.summary,
      steps: Object.freeze(legacy.explanationTrace.steps.map((step) => Object.freeze({
        id: step.id,
        label: step.label,
        summary: step.summary,
        source: step.source,
        relatedIds: Object.freeze([...step.relatedIds]),
        scriptureAnchors: Object.freeze([...step.scriptureAnchors]),
        fallbackRelated: step.fallbackRelated,
        visibleToUser: true as const
      }))),
      scriptureAnchors: Object.freeze(legacy.explanationTrace.scriptureAnchors.map((reference) => selectedCandidate.scriptureAnchors.find((anchor) => anchor.reference === reference) || Object.freeze({
        reference,
        validation: sourceValidation.unsupported.includes(reference) ? "unsupported" as const : "verified" as const,
        primaryAuthority: true as const
      }))),
      sourcePaths: Object.freeze([selectedCandidate.graphPath]),
      confidence,
      limitations,
      versions: this.#versions
    });
    const result: TigRecommendationResult = Object.freeze({
      recommendationId,
      versions: this.#versions,
      normalizedContext,
      selectedCandidate,
      candidates,
      confidence,
      explanation,
      limitations,
      fallback: Object.freeze({
        used: legacy.fallback.used,
        reasons: Object.freeze(legacy.fallback.reasons.map((detail) => Object.freeze({ code: "legacy_fallback" as const, detail }))),
        message: legacy.fallback.message,
        scriptureAnchors: Object.freeze(legacy.fallback.scriptureAnchors.map((reference) => explanation.scriptureAnchors.find((anchor) => anchor.reference === reference) || Object.freeze({
          reference,
          validation: "unverified" as const,
          primaryAuthority: true as const
        }))),
        safe: true as const
      }),
      sourceValidation,
      complexity: Object.freeze({
        limits,
        candidateCount: candidates.length,
        traversalDepth: selectedDepth,
        expandedNodes,
        executionDurationMs: 0
      }),
      cache: Object.freeze({ cacheable, key: cacheKey, rawPrivateTextStored: false as const }),
      safety: safetyContract(),
      valid: legacy.valid
    });
    if (cacheKey) this.#cache.set(cacheKey, result, this.#now());
    return this.#remember(result);
  }

  async explain(recommendationId: string): Promise<TigExplanation> {
    const explanation = this.#explanations.get(recommendationId);
    if (!explanation) throw new Error(`No TIG explanation is available for ${recommendationId}.`);
    return explanation;
  }

  async validateSources(result: TigRecommendationResult): Promise<SourceValidationResult> {
    return result.sourceValidation;
  }

  diagnostics(): TigCacheDiagnostics {
    return this.#cache.diagnostics();
  }

  clearForTests(): void {
    this.#cache.clear();
    this.#explanations.clear();
  }

  #remember(result: TigRecommendationResult): TigRecommendationResult {
    this.#explanations.set(result.recommendationId, result.explanation);
    return result;
  }
}

export function createCanonicalTigService(options: CanonicalTigServiceOptions = {}): CanonicalTigService {
  return new CanonicalTigService(options);
}

export const canonicalTigService = createCanonicalTigService();
