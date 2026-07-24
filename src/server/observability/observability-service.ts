import { randomUUID } from "node:crypto";
import {
  TELEMETRY_REGISTRY,
  type MetricSummary,
  type ProductionTelemetryExporter,
  type StructuredTelemetryEvent,
  type TelemetrySink,
  type TraceSink,
  type TraceSpan
} from "../../domain/observability/observability-contracts";
export { createStructuredTelemetryEvent } from "../../domain/observability/telemetry-event";

const globallyProhibited = new Set(
  TELEMETRY_REGISTRY.prohibitedFields.map((field) => field.toLowerCase())
);

function normalizedKey(value: string): string {
  return value.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

export function redactStructuredValue(
  value: unknown,
  additionalProhibitedFields: readonly string[] = []
): unknown {
  const prohibited = new Set([
    ...globallyProhibited,
    ...additionalProhibitedFields.map((field) => field.toLowerCase())
  ]);
  const visit = (current: unknown): unknown => {
    if (Array.isArray(current)) return current.map(visit);
    if (current && typeof current === "object") {
      const output: Record<string, unknown> = {};
      for (const [key, nested] of Object.entries(current)) {
        const normalized = normalizedKey(key);
        if (
          [...prohibited].some((field) =>
            normalized.includes(normalizedKey(field))
          )
        ) {
          output[key] = "[REDACTED]";
        } else {
          output[key] = visit(nested);
        }
      }
      return output;
    }
    return current;
  };
  return visit(value);
}

export class BoundedLocalTelemetrySink implements TelemetrySink, TraceSink {
  readonly events: StructuredTelemetryEvent[] = [];
  readonly spans: TraceSpan[] = [];

  constructor(private readonly capacity = 1000) {
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 10_000) {
      throw new Error("Telemetry sink capacity must be between 1 and 10,000.");
    }
  }

  emit(item: StructuredTelemetryEvent | TraceSpan): void {
    if ("fields" in item) {
      this.events.push(Object.freeze({ ...item, fields: Object.freeze({ ...item.fields }) }));
      if (this.events.length > this.capacity) this.events.shift();
      return;
    }
    this.spans.push(Object.freeze({ ...item }));
    if (this.spans.length > this.capacity) this.spans.shift();
  }
}

export class FailureIsolatedTelemetryBuffer implements TelemetrySink {
  private readonly pending: StructuredTelemetryEvent[] = [];
  private dropped = 0;

  constructor(
    private readonly exporter: ProductionTelemetryExporter,
    private readonly capacity = 500
  ) {}

  emit(event: StructuredTelemetryEvent): void {
    if (this.pending.length >= this.capacity) {
      this.pending.shift();
      this.dropped += 1;
    }
    this.pending.push(event);
  }

  async flush(): Promise<Readonly<{ exported: number; dropped: number; failed: boolean }>> {
    if (!this.pending.length) {
      return Object.freeze({ exported: 0, dropped: this.dropped, failed: false });
    }
    const batch = Object.freeze([...this.pending]);
    try {
      await this.exporter.export(batch);
      this.pending.splice(0, batch.length);
      return Object.freeze({
        exported: batch.length,
        dropped: this.dropped,
        failed: false
      });
    } catch {
      return Object.freeze({ exported: 0, dropped: this.dropped, failed: true });
    }
  }
}

function percentile(values: readonly number[], quantile: number): number | undefined {
  if (!values.length) return undefined;
  const ordered = [...values].sort((left, right) => left - right);
  return ordered[Math.max(0, Math.ceil(ordered.length * quantile) - 1)];
}

export function summarizeTelemetryMetrics(
  events: readonly StructuredTelemetryEvent[]
): readonly MetricSummary[] {
  const byName = new Map<string, StructuredTelemetryEvent[]>();
  for (const event of events) {
    const group = byName.get(event.name) || [];
    group.push(event);
    byName.set(event.name, group);
  }
  return Object.freeze(
    [...byName.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([name, group]) => {
        const latencies = group
          .map((event) => event.fields.latencyMs)
          .filter((value): value is number => typeof value === "number");
        return Object.freeze({
          name,
          count: group.length,
          p50: percentile(latencies, 0.5),
          p95: percentile(latencies, 0.95),
          p99: percentile(latencies, 0.99)
        });
      })
  );
}

export function completeTraceSpan(input: {
  traceId?: string;
  spanId?: string;
  name: string;
  startedAt: string;
  endedAt: string;
  status: TraceSpan["status"];
  safeCode?: string;
}): TraceSpan {
  const started = Date.parse(input.startedAt);
  const ended = Date.parse(input.endedAt);
  if (!Number.isFinite(started) || !Number.isFinite(ended) || ended < started) {
    throw new Error("Trace span timestamps are invalid.");
  }
  if (!/^[a-z0-9._:-]{1,120}$/i.test(input.name)) {
    throw new Error("Trace name must be a bounded operation identifier.");
  }
  if (input.safeCode && !/^[a-z0-9._:-]{1,120}$/i.test(input.safeCode)) {
    throw new Error("Trace safe code must be a bounded identifier.");
  }
  return Object.freeze({
    traceId: input.traceId || randomUUID(),
    spanId: input.spanId || randomUUID(),
    name: input.name.slice(0, 120),
    startedAt: input.startedAt,
    endedAt: input.endedAt,
    durationMs: ended - started,
    status: input.status,
    safeCode: input.safeCode?.slice(0, 120)
  });
}
