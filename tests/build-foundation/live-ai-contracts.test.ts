import { describe, expect, it } from "vitest";
import { TEO_GUIDE_STRUCTURED_RESPONSE_JSON_SCHEMA, parseTeoGuideStructuredResponse } from "../../src/domain/live-ai/teo-guide-structured-response";
import { CONSENT_SCOPE_REGISTRY, validateConsentScopes } from "../../src/domain/memory/data-classification-registry";
import { LiveAiGuardrails, estimateLiveAiCost } from "../../src/server/live-ai/live-ai-guardrails";
import { LIVE_AI_MODELS, LIVE_AI_OWNER_LIMITS, openAiOrganizationId, readLiveAiRuntimeConfiguration, selectLiveModelRoute } from "../../src/server/live-ai/model-configuration";
import { inspectModelToolDefinitions, validateModelToolArguments } from "../../src/server/live-ai/model-tool-definitions";
import { buildLivePromptBundle, inspectLivePromptLibrary } from "../../src/server/live-ai/prompt-library";

function assertStrictObjects(schema: unknown): void {
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) return;
  const record = schema as Readonly<Record<string, unknown>>;
  if (record.type === "object") {
    expect(record.additionalProperties).toBe(false);
    const properties = Object.keys((record.properties || {}) as Readonly<Record<string, unknown>>).sort();
    expect([...(record.required as readonly string[] || [])].sort()).toEqual(properties);
  }
  for (const value of Object.values(record)) assertStrictObjects(value);
}

describe("Prompt 19 live AI contracts", () => {
  it("keeps live mode behind three fail-safe flags plus a server key", () => {
    expect(readLiveAiRuntimeConfiguration({ OPENAI_API_KEY: "test" }).enabled).toBe(false);
    expect(readLiveAiRuntimeConfiguration({
      OPENAI_API_KEY: "test",
      TEOYUBE_ENABLE_LIVE_AI: "true",
      TEOYUBE_ENABLE_EXTERNAL_TEO_GUIDE_PROVIDER: "true",
      TEOYUBE_LIVE_AI_ENABLED: "true"
    })).toMatchObject({ enabled: true, keyPresent: true, advancedEnabled: false, zeroDataRetentionVerified: false });
    expect(LIVE_AI_MODELS).toMatchObject({
      light: { id: "gpt-5.4-mini-2026-03-17" },
      standard: { id: "gpt-5.4-2026-03-05" },
      advanced: { id: "disabled" }
    });
    expect(selectLiveModelRoute("crisis_support", "critical")).toBe("deterministic_only");
    expect(openAiOrganizationId({ OPENAI_ORG_ID: "org-funded-test" })).toBe("org-funded-test");
    expect(openAiOrganizationId({ OPENAI_ORG_ID: "not-an-org" })).toBeUndefined();
  });

  it("uses one strict final schema with no unknown-field or free-form bypass", () => {
    assertStrictObjects(TEO_GUIDE_STRUCTURED_RESPONSE_JSON_SCHEMA);
    expect(() => parseTeoGuideStructuredResponse({ unexpected: true })).toThrow();
  });

  it("keeps all 13 model-visible tool schemas strict, required, and read-only", () => {
    const definitions = inspectModelToolDefinitions();
    expect(definitions).toHaveLength(13);
    for (const tool of definitions) {
      expect(tool).toMatchObject({ strict: true, stateMutation: false });
      assertStrictObjects(tool.parameters);
      expect(() => validateModelToolArguments(tool.name, { unexpected: true })).toThrow();
    }
  });

  it("requires distinct, purpose-specific external consent scopes", () => {
    expect(CONSENT_SCOPE_REGISTRY.external_ai_processing).toEqual(["external_ai:process"]);
    expect(CONSENT_SCOPE_REGISTRY.external_ai_sensitive_content).toEqual(["external_ai:sensitive_content"]);
    expect(CONSENT_SCOPE_REGISTRY.external_ai_memory_context).toEqual(["external_ai:memory_context"]);
    expect(CONSENT_SCOPE_REGISTRY.live_ai_conversation_retention).toEqual(["external_ai:conversation_retention"]);
    expect(validateConsentScopes("external_ai_processing", ["memory:read"])).toBe(false);
  });

  it("versions and checksums immutable prompt responsibilities without requesting chain of thought", () => {
    expect(inspectLivePromptLibrary().filter((item) => item.id.startsWith("system/")).length).toBeGreaterThanOrEqual(7);
    const prompt = buildLivePromptBundle("prayer_support");
    expect(prompt.checksum).toMatch(/^[a-f0-9]{64}$/);
    expect(prompt.systemPrompt).toMatch(/Bible is the highest authority/i);
    expect(prompt.systemPrompt).toMatch(/Do not reveal[^.]*hidden reasoning[^.]*chain-of-thought/i);
  });

  it("enforces cost, concurrency, idempotency, and circuit-breaker admissions", () => {
    let now = Date.parse("2026-07-22T12:00:00Z");
    const guardrails = new LiveAiGuardrails(() => now);
    const input = { requestId: "req-1", attemptKey: "req-1:0", subjectHash: "subject", route: "light" as const, estimatedInputTokens: 100, maximumOutputTokens: 100, maximumToolRounds: 1 };
    const first = guardrails.admit(input);
    expect(first.allowed).toBe(true);
    expect(guardrails.admit(input).code).toBe("duplicate_attempt");
    const second = guardrails.admit({ ...input, requestId: "req-2", attemptKey: "req-2:0" });
    expect(second.allowed).toBe(true);
    expect(guardrails.admit({ ...input, requestId: "req-3", attemptKey: "req-3:0" }).code).toBe("concurrency_limit");
    if (!first.permit) throw new Error("Expected a live-AI permit.");
    if (!second.permit) throw new Error("Expected a second live-AI permit.");
    guardrails.fail(first.permit, true);
    guardrails.fail(second.permit, true);
    for (let index = 2; index < LIVE_AI_OWNER_LIMITS.circuitFailureThreshold; index += 1) {
      const admission = guardrails.admit({ ...input, requestId: `req-${index + 1}`, attemptKey: `req-${index + 1}:0` });
      if (!admission.permit) throw new Error("Expected a provider-failure permit.");
      guardrails.fail(admission.permit, true);
    }
    expect(guardrails.admit({ ...input, requestId: "circuit", attemptKey: "circuit:0" }).code).toBe("circuit_open");
    now += LIVE_AI_OWNER_LIMITS.circuitCooldownMs + 1;
    expect(guardrails.admit({ ...input, requestId: "after", attemptKey: "after:0" }).allowed).toBe(true);
    expect(estimateLiveAiCost({ route: "standard", inputTokens: 1_000, outputTokens: 1_000 })).toBeLessThanOrEqual(LIVE_AI_OWNER_LIMITS.maximumPerRequestEstimatedUsd);
  });
});
