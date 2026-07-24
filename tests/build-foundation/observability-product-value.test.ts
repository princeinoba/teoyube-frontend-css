import { describe, expect, it } from "vitest";
import { TELEMETRY_REGISTRY } from "@/domain/observability/observability-contracts";
import {
  ConsentAwareProductValueRecorder,
  PROHIBITED_PRODUCT_METRICS,
  summarizeProductValue
} from "@/domain/product-value/product-value-metrics";
import {
  BoundedLocalTelemetrySink,
  FailureIsolatedTelemetryBuffer,
  completeTraceSpan,
  createStructuredTelemetryEvent,
  redactStructuredValue,
  summarizeTelemetryMetrics
} from "@/server/observability/observability-service";

describe("privacy-safe observability", () => {
  it("registers every event with the required governance fields", () => {
    expect(TELEMETRY_REGISTRY.registryVersion).toMatch(/^teoyube-telemetry-/);
    expect(TELEMETRY_REGISTRY.events.length).toBeGreaterThanOrEqual(20);
    for (const event of TELEMETRY_REGISTRY.events) {
      expect(event).toMatchObject({
        version: expect.any(Number),
        purpose: expect.any(String),
        sensitivity: expect.any(String),
        consentRequirement: expect.any(String),
        retentionDays: expect.any(Number),
        aggregation: expect.any(String),
        source: expect.any(String),
        owner: expect.any(String)
      });
      expect(event.allowedFields.length).toBeGreaterThan(0);
      expect(event.prohibitedFields.length).toBeGreaterThan(0);
    }
  });

  it("rejects unknown, prohibited, oversized, and structured event fields", () => {
    const base = { name: "web_request", occurredAt: "2026-07-24T00:00:00.000Z" };
    expect(() => createStructuredTelemetryEvent({ ...base, fields: { rawMessage: "private" } })).toThrow(/not allowed/);
    expect(() => createStructuredTelemetryEvent({ ...base, fields: { unknown: "value" } })).toThrow(/not allowed/);
    expect(() => createStructuredTelemetryEvent({ ...base, fields: { route: "x".repeat(257) } })).toThrow(/256/);
    expect(() => createStructuredTelemetryEvent({ ...base, fields: { route: { path: "/" } } })).toThrow(/scalar/);
    expect(() => createStructuredTelemetryEvent({ ...base, fields: { errorClass: "my prayer contains private content" } })).toThrow(/private content/);
    expect(() => createStructuredTelemetryEvent({ ...base, fields: { traceId: "person@example.com" } })).toThrow(/private content/);
  });

  it("redacts nested private keys and retains bounded safe events", () => {
    expect(redactStructuredValue({
      route: "/today",
      rawMessage: "private",
      nested: { apiKey: "secret" }
    })).toEqual({
      route: "/today",
      rawMessage: "[REDACTED]",
      nested: { apiKey: "[REDACTED]" }
    });
    const sink = new BoundedLocalTelemetrySink(2);
    for (let index = 0; index < 3; index += 1) {
      sink.emit(createStructuredTelemetryEvent({
        name: "web_request",
        occurredAt: `2026-07-24T00:00:0${index}.000Z`,
        fields: { route: "/health", latencyMs: index * 10, statusCode: 200 }
      }));
    }
    expect(sink.events).toHaveLength(2);
    expect(summarizeTelemetryMetrics(sink.events)).toEqual([
      expect.objectContaining({ name: "web_request", count: 2, p95: 20 })
    ]);
  });

  it("isolates exporter failures from application behavior", async () => {
    const buffer = new FailureIsolatedTelemetryBuffer({
      export: async () => {
        throw new Error("monitoring unavailable");
      }
    });
    buffer.emit(createStructuredTelemetryEvent({
      name: "route_readiness",
      occurredAt: "2026-07-24T00:00:00.000Z",
      fields: { route: "/api/readiness", statusCode: 200 }
    }));
    await expect(buffer.flush()).resolves.toEqual({
      exported: 0,
      dropped: 0,
      failed: true
    });
  });

  it("creates correlation-safe trace spans", () => {
    expect(completeTraceSpan({
      traceId: "trace-safe",
      spanId: "span-safe",
      name: "scripture.lookup",
      startedAt: "2026-07-24T00:00:00.000Z",
      endedAt: "2026-07-24T00:00:00.025Z",
      status: "ok"
    })).toMatchObject({ durationMs: 25, status: "ok" });
  });
});

describe("consent-aware product value", () => {
  it("remains off without purpose-specific analytics consent", () => {
    const sink = new BoundedLocalTelemetrySink();
    const recorder = new ConsentAwareProductValueRecorder(sink, {
      granted: false,
      policyVersion: "product-value-1",
      updatedAt: "2026-07-24T00:00:00.000Z"
    });
    expect(recorder.record({
      name: "faithful_action_decision",
      occurredAt: "2026-07-24T00:00:00.000Z",
      fields: { operation: "accepted", status: "complete" }
    })).toBe(false);
    expect(sink.events).toHaveLength(0);
  });

  it("summarizes clarity, voluntary action, continuity, trust, and support without content or scoring", () => {
    const sink = new BoundedLocalTelemetrySink();
    const recorder = new ConsentAwareProductValueRecorder(sink, {
      granted: true,
      policyVersion: "product-value-1",
      updatedAt: "2026-07-24T00:00:00.000Z"
    });
    const names = [
      "source_explanation_inspected",
      "faithful_action_decision",
      "reflection_continuity",
      "trust_reversibility_action",
      "cross_module_transition",
      "community_support_action",
      "user_quality_report"
    ] as const;
    for (const name of names) {
      expect(recorder.record({
        name,
        occurredAt: "2026-07-24T00:00:00.000Z",
        fields: { status: "complete" }
      })).toBe(true);
    }
    expect(summarizeProductValue(sink.events)).toEqual({
      clarity: 1,
      faithfulAction: 1,
      reflectionContinuity: 1,
      trustAndReversibility: 1,
      crossModuleContinuity: 1,
      communitySupport: 1,
      safetyAndQuality: 1,
      rawContentStored: false,
      spiritualScoreComputed: false
    });
    expect(PROHIBITED_PRODUCT_METRICS).toContain("spiritual_score");
  });
});
