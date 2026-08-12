import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const localRequire = createRequire(import.meta.url);
const trace = localRequire("../../scripts/release/preview-grounded-live-ai-forbidden-claim-trace.cjs");
const diagnostic = localRequire("../../scripts/release/run-preview-grounded-live-ai-forbidden-claim-diagnostic.cjs");
const runner = localRequire("../../scripts/release/preview-grounded-live-ai-resumable-runner.cjs");

const fixture = Object.freeze({
  id: "public-james-wisdom",
  forbiddenPhrases: Object.freeze(["God told me", "guaranteed"]),
});

function response(overrides: Record<string, unknown> = {}) {
  return {
    summary: "A careful summary.",
    biblical_application: "A careful application.",
    prayer: "Father, please give me wisdom.",
    action_step: "Read the passage in context.",
    limitations: ["No personal outcome is promised."],
    safety_boundary: trace.FIXED_UNCERTAINTY,
    ...overrides,
  };
}

function diagnosticEnvelope(overrides: Record<string, unknown> = {}) {
  return {
    pipelineStage: "THEOLOGICAL_VALIDATION",
    fallbackReason: "THEOLOGICAL_RULE_VIOLATION",
    responseStatus: "completed",
    validatorRuleId: "GUARANTEED_OUTCOME",
    forbiddenClaimEvidence: [],
    ...overrides,
  };
}

function runtimeEvidence(overrides: Record<string, unknown> = {}) {
  return {
    fieldProvenance: "MODEL_SUMMARY",
    validationRuleId: "GUARANTEED_OUTCOME",
    matcherId: "SAFETY_REGISTRY_REGEX",
    matchCount: 1,
    characterStart: 8,
    characterEnd: 18,
    matchLength: 10,
    fieldLength: 24,
    normalizedMatchSha256: "a".repeat(64),
    semanticContext: "FUTURE_CERTAINTY",
    providerCallCountClassification: "EMBEDDING_VECTOR_GENERATION_AND_MODERATION",
    runtimeValidatorResult: "FAIL",
    evaluatorResult: "NOT_RUN",
    ...overrides,
  };
}

function applicationResponse(status: number, body: unknown) {
  return Object.freeze({ status, body, elapsedMs: 1 });
}

describe("legacy forbidden-claim provenance trace", () => {
  it("documents the exact legacy normalization and scanned fields", () => {
    expect(trace.LEGACY_MATCHER_BEHAVIOR).toEqual({
      matcherType: "CASE_INSENSITIVE_SUBSTRING",
      normalization: "LOWERCASE_ONLY",
      wordBoundary: "NONE",
      negationBehavior: "NOT_INTERPRETED",
      scannedFields: ["MODEL_SUMMARY", "MODEL_BIBLICAL_APPLICATION", "MODEL_PRAYER", "MODEL_ACTION_STEP", "MODEL_LIMITATIONS", "SERVER_FIXED_UNCERTAINTY"],
      excludedFields: ["MODEL_CONFIDENCE", "SERVER_EXACT_WEB_QUOTATION", "SERVER_CITATION_METADATA", "DETERMINISTIC_FALLBACK"],
    });
  });

  it("does not scan exact server-hydrated WEB text or citation metadata", () => {
    expect(trace.traceLegacyForbiddenClaims({ fixture, response: response(), citations: [{ exactText: "guaranteed" }] })).toEqual([]);
  });

  it.each([
    ["same words in model prose", { summary: "This outcome is guaranteed." }, "MODEL_SUMMARY", "FUTURE_CERTAINTY"],
    ["unsupported future certainty", { action_step: "Your future outcome is guaranteed." }, "MODEL_ACTION_STEP", "FUTURE_CERTAINTY"],
    ["personal divine guarantee", { biblical_application: "God told me your outcome is settled." }, "MODEL_BIBLICAL_APPLICATION", "PERSONAL_GUARANTEE"],
    ["negated guarantee", { limitations: ["This does not mean any result is guaranteed."] }, "MODEL_LIMITATIONS", "NEGATED_CLAIM"],
    ["capitalization and Unicode punctuation", { summary: "Nothing is GUARANTEED—discern carefully." }, "MODEL_SUMMARY", "FUTURE_CERTAINTY"],
    ["substring collision", { summary: "This is unguaranteedly phrased." }, "MODEL_SUMMARY", "SUBSTRING_COLLISION"],
    ["masquerading model quotation", { summary: "Scripture says, ‘God told me your future.’" }, "MODEL_SUMMARY", "PERSONAL_GUARANTEE"],
  ])("traces %s without retaining matched text", (_name, override, provenance, context) => {
    const result = trace.traceLegacyForbiddenClaims({ fixture, response: response(override) });
    expect(result).toHaveLength(1);
    expect(result[0].fieldProvenance).toBe(provenance);
    expect(result[0].semanticContext).toBe(context);
    expect(JSON.stringify(result)).not.toContain("guaranteed");
    expect(JSON.stringify(result)).not.toContain("God told me");
  });

  it("classifies server provenance as A, legacy-safe matches as B, model claims as C, and bad locked data as D", () => {
    expect(trace.rootCauseClassification([{ fieldProvenance: "SERVER_FIXED_UNCERTAINTY", semanticContext: "SERVER_FIXED_BOUNDARY" }])).toBe("A_PROVENANCE_FALSE_POSITIVE");
    expect(trace.rootCauseClassification([{ fieldProvenance: "MODEL_LIMITATIONS", semanticContext: "NEGATED_CLAIM" }])).toBe("B_MATCHER_FALSE_POSITIVE");
    expect(trace.rootCauseClassification([{ fieldProvenance: "MODEL_SUMMARY", semanticContext: "FUTURE_CERTAINTY" }])).toBe("C_GENUINE_MODEL_FORBIDDEN_CLAIM");
    expect(trace.rootCauseClassification([], true)).toBe("D_DATASET_DEFECT");
  });

  it("rejects raw-text additions to both sanitized trace shapes", () => {
    const legacy = trace.traceLegacyForbiddenClaims({ fixture, response: response({ summary: "This is guaranteed." }) });
    expect(() => trace.assertSanitizedTrace([{ ...legacy[0], rawResponseText: "forbidden" }])).toThrow("SANITIZED_MATCH_TRACE_KEYS_REJECTED");
    expect(() => trace.assertSanitizedRuntimeEvidence([{ ...runtimeEvidence(), rawResponseText: "forbidden" }])).toThrow("RUNTIME_MATCH_TRACE_KEYS_REJECTED");
  });
});

describe("status-aware evidence-envelope parsing", () => {
  it("classifies HTTP 200 rubric pass without requiring a match", () => {
    const result = diagnostic.interpretDiagnosticResponse(fixture, applicationResponse(200, { ok: true, response: response() }));
    expect(result).toMatchObject({ classification: "APPLICATION_RESULT_200", rootCauseClassification: "UNRESOLVED", sufficientForClassification: false });
  });

  it("classifies HTTP 200 legacy forbidden-rubric failure", () => {
    const result = diagnostic.interpretDiagnosticResponse(fixture, applicationResponse(200, { ok: true, response: response({ limitations: ["This is not guaranteed."] }) }));
    expect(result).toMatchObject({ classification: "APPLICATION_RESULT_200", rootCauseClassification: "B_MATCHER_FALSE_POSITIVE", sufficientForClassification: true });
  });

  it("accepts evidence-bearing 422 as an application result", () => {
    const result = diagnostic.interpretDiagnosticResponse(fixture, applicationResponse(422, {
      ok: false, persisted: false, reason: "post_generation_safety_failed",
      providerCalls: { embedding: 1, vector: 1, generation: 1, outputModeration: 1 },
      diagnostic: diagnosticEnvelope({ forbiddenClaimEvidence: [runtimeEvidence()] }),
    }));
    expect(result).toMatchObject({ classification: "APPLICATION_RESULT_422_EVIDENCE_AVAILABLE", rootCauseClassification: "C_GENUINE_MODEL_FORBIDDEN_CLAIM", sufficientForClassification: true });
  });

  it.each([
    ["allowlisted theological reason", diagnosticEnvelope({ fallbackReason: "MODEL_SCRIPTURE_GENERATION_REJECTION", validatorRuleId: "MODEL_AUTHORED_SCRIPTURE" }), "APPLICATION_RESULT_422_EVIDENCE_AVAILABLE"],
    ["unrelated safety reason", diagnosticEnvelope({ fallbackReason: "PRE_PROVIDER_POLICY_REJECTION", validatorRuleId: "HIGH_STAKES" }), "APPLICATION_RESULT_422_EVIDENCE_INSUFFICIENT"],
    ["insufficient diagnostic metadata", undefined, "APPLICATION_RESULT_422_EVIDENCE_INSUFFICIENT"],
  ])("classifies 422 %s", (_label, envelope, expected) => {
    const result = diagnostic.interpretDiagnosticResponse(fixture, applicationResponse(422, { ok: false, persisted: false, diagnostic: envelope }));
    expect(result.classification).toBe(expected);
  });

  it.each([[401, "TRANSPORT_OR_AUTH_FAILURE"], [403, "TRANSPORT_OR_AUTH_FAILURE"], [302, "TRANSPORT_OR_AUTH_FAILURE"], [429, "PROVIDER_FAILURE"], [500, "PROVIDER_FAILURE"]])("classifies HTTP %i fail-closed", (status, expected) => {
    expect(diagnostic.interpretDiagnosticResponse(fixture, applicationResponse(status, {})).classification).toBe(expected);
  });
});

describe("bounded transport parser", () => {
  const call = (fetchImpl: typeof fetch, parserTimeoutMs = runner.MAXIMUM_PARSER_MS) => runner.requestJson({
    credential: "synthetic-bypass-only", deploymentUrl: runner.TARGET.deploymentUrl,
    route: "/api/teoyube/preview-grounded-live-ai", parentSignal: new AbortController().signal,
    fetchImpl, parserTimeoutMs,
  });

  it("rejects malformed JSON, oversized bodies, non-JSON, redirects, auth, provider status and timeout", async () => {
    await expect(call(async () => new Response("{", { status: 200, headers: { "content-type": "application/json" } }))).rejects.toMatchObject({ code: "MALFORMED_JSON_RESPONSE" });
    await expect(call(async () => new Response("x", { status: 200, headers: { "content-type": "application/json", "content-length": String(runner.MAXIMUM_RESPONSE_BYTES + 1) } }))).rejects.toMatchObject({ code: "OVERSIZED_RESPONSE" });
    await expect(call(async () => new Response("ok", { status: 200, headers: { "content-type": "text/plain" } }))).rejects.toMatchObject({ code: "UNEXPECTED_CONTENT_TYPE" });
    await expect(call(async () => new Response("", { status: 302, headers: { location: "/elsewhere" } }))).rejects.toMatchObject({ code: "UNEXPECTED_REDIRECT_RESPONSE" });
    await expect(call(async () => new Response("{}", { status: 401 }))).rejects.toMatchObject({ code: "TRANSPORT_OR_AUTH_FAILURE" });
    await expect(call(async () => new Response("{}", { status: 429 }))).rejects.toMatchObject({ code: "PROVIDER_FAILURE" });
    const originalParse = JSON.parse;
    JSON.parse = ((value: string) => { const started = performance.now(); while (performance.now() - started < 5) {} return originalParse(value); }) as typeof JSON.parse;
    try {
      await expect(call(async () => new Response("{}", { status: 200, headers: { "content-type": "application/json" } }), 1)).rejects.toMatchObject({ code: "PARSER_TIMEOUT" });
    } finally {
      JSON.parse = originalParse;
    }
  });
});

describe("same-origin diagnostic request contract", () => {
  it("derives the exact no-slash Origin from the current Preview target", () => {
    expect(diagnostic.requestContract(runner.TARGET.deploymentUrl)).toEqual({
      requestTarget: `${runner.TARGET.deploymentUrl}/api/teoyube/preview-grounded-live-ai`,
      origin: runner.TARGET.deploymentUrl, originPresent: true, originIsNull: false,
      originHasTrailingSlash: false, hostHeaderOverridden: false, redirectMode: "error",
      bypassCredentialScope: "VERCEL_PREVIEW_REQUEST_ONLY", bypassEligibleForProviderHeaders: false,
      bypassEligibleForLogs: false, bypassEligibleForArtifacts: false,
    });
  });

  it("sends bypass only to the Preview request and accepts a 422 envelope", async () => {
    const fakeCredential = "synthetic-bypass-only";
    let observedOptions: RequestInit | undefined;
    const result = await diagnostic.diagnose(fakeCredential, new AbortController().signal, async (_url: string, options: RequestInit) => {
      observedOptions = options;
      return new Response(JSON.stringify({ ok: false, persisted: false, diagnostic: diagnosticEnvelope({ forbiddenClaimEvidence: [runtimeEvidence()] }) }), { status: 422, headers: { "content-type": "application/json" } });
    }, runner.TARGET);
    const headers = new Headers(observedOptions?.headers);
    expect(headers.get("origin")).toBe(runner.TARGET.deploymentUrl);
    expect(headers.has("host")).toBe(false);
    expect(headers.get("x-vercel-protection-bypass")).toBe(fakeCredential);
    expect(observedOptions?.redirect).toBe("error");
    expect(result.classification).toBe("APPLICATION_RESULT_422_EVIDENCE_AVAILABLE");
    expect(JSON.stringify(result)).not.toContain(fakeCredential);
  });

  it("stops a diagnostic sequence after sufficient evidence and never retries", async () => {
    let calls = 0;
    const result = await diagnostic.runDiagnosticSequence("synthetic", new AbortController().signal, runner.TARGET, async () => {
      calls += 1;
      return new Response(JSON.stringify({ ok: true, response: response({ limitations: ["No outcome is guaranteed."] }) }), { status: 200, headers: { "content-type": "application/json" } });
    });
    expect(result).toMatchObject({ status: "PASS", sampleCount: 1, rootCauseClassification: "B_MATCHER_FALSE_POSITIVE" });
    expect(calls).toBe(1);
  });
});