import type {
  TigProductionInput,
  TigProductionResponse
} from "./production-response-contracts";

type CacheEntry = {
  response: TigProductionResponse;
  cachedAt: number;
};

const TIG_PRODUCTION_CACHE = new Map<string, CacheEntry>();
const TIG_PRODUCTION_CACHE_TTL_MS = 1000 * 60 * 5;

function stableStringify(value: unknown): string {
  const seen = new WeakSet<object>();
  const maxDepth = 8;

  function stringifyValue(nestedValue: unknown, depth: number): string {
    if (depth > maxDepth) {
      return JSON.stringify("[max-depth]");
    }

    if (nestedValue && typeof nestedValue === "object") {
      const objectValue = nestedValue as Record<string, unknown>;

      if (seen.has(objectValue)) {
        return JSON.stringify("[circular]");
      }

      seen.add(objectValue);

      if (Array.isArray(objectValue)) {
        return `[${objectValue.map((item) => stringifyValue(item, depth + 1)).join(",")}]`;
      }

      return `{${Object.entries(objectValue)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, childValue]) => `${JSON.stringify(key)}:${stringifyValue(childValue, depth + 1)}`)
        .join(",")}}`;
    }

    return JSON.stringify(nestedValue);
  }

  return stringifyValue(value, 0);
}

export function getTigProductionCacheKey(input: TigProductionInput): string {
  const contextEntries = Object.entries(input.context || {})
    .sort(([left], [right]) => left.localeCompare(right))
    .slice(0, 20)
    .map(([key, value]) => [key, typeof value === "object" ? "[object]" : String(value || "")]);

  return `tig-production:${stableStringify({
    input: input.input || "",
    userState: input.userState || "",
    emotion: input.emotion || "",
    intent: input.intent || "",
    selectedWordId: input.selectedWordId || "",
    selectedClusterId: input.selectedClusterId || "",
    context: contextEntries,
    surface: input.surface || "unknown"
  })}`;
}

export function getCachedTigProductionResponse(
  key: string
): TigProductionResponse | undefined {
  const entry = TIG_PRODUCTION_CACHE.get(key);
  if (!entry) return undefined;

  if (Date.now() - entry.cachedAt > TIG_PRODUCTION_CACHE_TTL_MS) {
    TIG_PRODUCTION_CACHE.delete(key);
    return undefined;
  }

  return entry.response;
}

export function setCachedTigProductionResponse(
  key: string,
  response: TigProductionResponse
): void {
  TIG_PRODUCTION_CACHE.set(key, {
    response,
    cachedAt: Date.now()
  });
}

export function clearTigProductionCache(): void {
  TIG_PRODUCTION_CACHE.clear();
}
