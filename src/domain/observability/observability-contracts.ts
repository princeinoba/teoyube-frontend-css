import registryJson from "../../../config/telemetry-event-registry.json";

export type TelemetryScalar = string | number | boolean | null;

export type TelemetryEventDefinition = Readonly<{
  name: string;
  version: number;
  purpose: string;
  allowedFields: readonly string[];
  prohibitedFields: readonly string[];
  sensitivity: "operational" | "pseudonymous_operational" | "pseudonymous_product";
  consentRequirement:
    | "none"
    | "external_ai"
    | "operational_memory_controls"
    | "product_analytics";
  retentionDays: number;
  aggregation: string;
  source: string;
  owner: string;
}>;

export type TelemetryRegistry = Readonly<{
  schemaVersion: number;
  registryVersion: string;
  defaultState: string;
  prohibitedFields: readonly string[];
  events: readonly TelemetryEventDefinition[];
}>;

export type StructuredTelemetryEvent = Readonly<{
  name: string;
  version: number;
  occurredAt: string;
  fields: Readonly<Record<string, TelemetryScalar>>;
}>;

export type TraceSpan = Readonly<{
  traceId: string;
  spanId: string;
  name: string;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  status: "ok" | "error" | "cancelled";
  safeCode?: string;
}>;

export type MetricSummary = Readonly<{
  name: string;
  count: number;
  p50?: number;
  p95?: number;
  p99?: number;
}>;

export interface TelemetrySink {
  emit(event: StructuredTelemetryEvent): void | Promise<void>;
}

export interface TraceSink {
  emit(span: TraceSpan): void | Promise<void>;
}

export interface ProductionTelemetryExporter {
  export(events: readonly StructuredTelemetryEvent[]): Promise<void>;
}

export const TELEMETRY_REGISTRY: TelemetryRegistry = Object.freeze({
  ...registryJson,
  prohibitedFields: Object.freeze([...registryJson.prohibitedFields]),
  events: Object.freeze(
    registryJson.events.map((event) =>
      Object.freeze({
        ...event,
        allowedFields: Object.freeze([...event.allowedFields]),
        prohibitedFields: Object.freeze([...event.prohibitedFields])
      })
    )
  )
}) as TelemetryRegistry;

export const TELEMETRY_REGISTRY_VERSION = TELEMETRY_REGISTRY.registryVersion;
