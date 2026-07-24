import {
  TELEMETRY_REGISTRY,
  type StructuredTelemetryEvent,
  type TelemetryEventDefinition,
  type TelemetryScalar
} from "./observability-contracts";

const registryByName = new Map(
  TELEMETRY_REGISTRY.events.map((definition) => [definition.name, definition])
);
const globallyProhibited = new Set(
  TELEMETRY_REGISTRY.prohibitedFields.map((field) => field.toLowerCase())
);

function normalizedKey(value: string): string {
  return value.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

function isProhibitedKey(
  key: string,
  definition?: TelemetryEventDefinition
): boolean {
  const normalized = normalizedKey(key);
  return (
    [...globallyProhibited].some((field) => normalized.includes(normalizedKey(field))) ||
    Boolean(
      definition?.prohibitedFields.some((field) =>
        normalized.includes(normalizedKey(field))
      )
    )
  );
}

const prohibitedValuePatterns = Object.freeze([
  /\bsk-(?:proj-)?[a-z0-9_-]{32,}\b/i,
  /\bbearer\s+[a-z0-9._~-]{12,}\b/i,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\b(?:my prayer|dear god|journal entry|my testimony|trauma details|abuse details|raw memory)\b/i
]);

function assertSafeScalar(value: unknown): asserts value is TelemetryScalar {
  if (
    value !== null &&
    typeof value !== "string" &&
    typeof value !== "number" &&
    typeof value !== "boolean"
  ) {
    throw new Error("Telemetry fields must be scalar values.");
  }
  if (typeof value === "string" && value.length > 256) {
    throw new Error("Telemetry strings must be 256 characters or fewer.");
  }
  if (
    typeof value === "string" &&
    (value.includes("\n") ||
      value.includes("\r") ||
      prohibitedValuePatterns.some((pattern) => pattern.test(value)))
  ) {
    throw new Error("Telemetry string contains prohibited private content.");
  }
  if (typeof value === "number" && !Number.isFinite(value)) {
    throw new Error("Telemetry numbers must be finite.");
  }
}

export function createStructuredTelemetryEvent(input: {
  name: string;
  occurredAt: string;
  fields?: Readonly<Record<string, unknown>>;
}): StructuredTelemetryEvent {
  const definition = registryByName.get(input.name);
  if (!definition) throw new Error(`Telemetry event is not registered: ${input.name}`);
  if (!Number.isFinite(Date.parse(input.occurredAt))) {
    throw new Error("Telemetry event timestamp is invalid.");
  }
  const fields: Record<string, TelemetryScalar> = {};
  const allowed = new Set(definition.allowedFields);
  for (const [key, value] of Object.entries(input.fields || {})) {
    if (!allowed.has(key) || isProhibitedKey(key, definition)) {
      throw new Error(`Telemetry field is not allowed for ${input.name}: ${key}`);
    }
    assertSafeScalar(value);
    fields[key] = value;
  }
  return Object.freeze({
    name: definition.name,
    version: definition.version,
    occurredAt: input.occurredAt,
    fields: Object.freeze(fields)
  });
}
