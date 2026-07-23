import { createHash } from "node:crypto";

export function normalizeRetrievalText(value: string): string {
  return value.normalize("NFKC").replace(/\s+/g, " ").trim();
}

export function sha256(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

export function hashNormalizedContent(value: string): string {
  return sha256(normalizeRetrievalText(value));
}

export function estimateTokens(value: string): number {
  const normalized = normalizeRetrievalText(value);
  if (!normalized) return 0;
  return Math.max(1, Math.ceil(normalized.length / 4));
}

export function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    const record = value as Readonly<Record<string, unknown>>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}
