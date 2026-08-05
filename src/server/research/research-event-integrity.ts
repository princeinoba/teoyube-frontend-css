import { createHash, timingSafeEqual } from "node:crypto";
import type { ResearchEventRecord } from "../../domain/research/research-contracts";

function canonicalize(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => `${JSON.stringify(key)}:${canonicalize(nested)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export function calculateResearchEventHash(record: Omit<ResearchEventRecord, "eventHash">): string {
  return createHash("sha256").update(canonicalize(record), "utf8").digest("hex");
}

export function verifyResearchEventHash(record: ResearchEventRecord): boolean {
  const { eventHash, ...unsigned } = record;
  const expected = Buffer.from(calculateResearchEventHash(unsigned), "hex");
  const supplied = Buffer.from(eventHash, "hex");
  return expected.byteLength === supplied.byteLength && timingSafeEqual(expected, supplied);
}
