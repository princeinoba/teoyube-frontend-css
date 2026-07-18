import type { TIGID } from "../../tig";
import {
  createCacheBoundaryReport,
  sanitizeItemForMobileCache,
  type TeoyubeMobileCacheConsent
} from "./mobile-cache-boundaries";

export type TeoyubeMobileRuntimeCacheOptions = {
  maxItems?: number;
  ttlMs?: number;
  namespace?: string;
};

export type TeoyubeMobileRuntimeCacheItem = {
  id: TIGID;
  key: string;
  cachedAt: string;
  expiresAt?: string;
  data: unknown;
  sanitized: boolean;
  warnings: string[];
};

export type TeoyubeMobileRuntimeCache = {
  namespace: string;
  maxItems: number;
  ttlMs?: number;
  items: Map<string, TeoyubeMobileRuntimeCacheItem>;
};

export type TeoyubeMobileRuntimeCacheSummary = {
  namespace: string;
  itemCount: number;
  maxItems: number;
  ttlMs?: number;
  keys: string[];
};

function createId(): string {
  return `mobile_runtime_cache_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nestedValue]) => `${JSON.stringify(key)}:${stableStringify(nestedValue)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function checksum(value: string): string {
  const sum = value.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  return sum.toString(36);
}

function isExpired(item: TeoyubeMobileRuntimeCacheItem): boolean {
  return Boolean(item.expiresAt && Date.now() > Date.parse(item.expiresAt));
}

function enforceMaxItems(cache: TeoyubeMobileRuntimeCache): void {
  while (cache.items.size > cache.maxItems) {
    const oldest = [...cache.items.values()].sort(
      (left, right) => Date.parse(left.cachedAt) - Date.parse(right.cachedAt)
    )[0];
    if (!oldest) return;
    cache.items.delete(oldest.key);
  }
}

export function createMobileRuntimeCache(
  options: TeoyubeMobileRuntimeCacheOptions = {}
): TeoyubeMobileRuntimeCache {
  return {
    namespace: options.namespace || "teoyube-mobile-runtime",
    maxItems: options.maxItems || 50,
    ttlMs: options.ttlMs ?? 1000 * 60 * 15,
    items: new Map()
  };
}

export function getMobileRuntimeCacheKey(input: unknown): string {
  const raw = stableStringify(input);
  return `mobile-runtime:${checksum(raw)}:${raw.length}`;
}

export function getCachedMobileRuntimeItem(
  cache: TeoyubeMobileRuntimeCache,
  key: string
): TeoyubeMobileRuntimeCacheItem | undefined {
  const item = cache.items.get(key);
  if (!item) return undefined;

  if (isExpired(item)) {
    cache.items.delete(key);
    return undefined;
  }

  return item;
}

export function setCachedMobileRuntimeItem(
  cache: TeoyubeMobileRuntimeCache,
  key: string,
  item: unknown,
  consent?: TeoyubeMobileCacheConsent
): TeoyubeMobileRuntimeCacheItem | undefined {
  const sanitized = sanitizeItemForMobileCache(item, consent);
  const report = createCacheBoundaryReport(item, consent);

  if (!sanitized || !report.cacheable) return undefined;

  const cachedAt = new Date();
  const cacheItem: TeoyubeMobileRuntimeCacheItem = {
    id: createId(),
    key,
    cachedAt: cachedAt.toISOString(),
    expiresAt: cache.ttlMs ? new Date(cachedAt.getTime() + cache.ttlMs).toISOString() : undefined,
    data: sanitized,
    sanitized: true,
    warnings: report.warnings
  };

  cache.items.set(key, cacheItem);
  enforceMaxItems(cache);
  return cacheItem;
}

export function deleteCachedMobileRuntimeItem(
  cache: TeoyubeMobileRuntimeCache,
  key: string
): boolean {
  return cache.items.delete(key);
}

export function clearMobileRuntimeCache(cache: TeoyubeMobileRuntimeCache): void {
  cache.items.clear();
}

export function getMobileRuntimeCacheSummary(
  cache: TeoyubeMobileRuntimeCache
): TeoyubeMobileRuntimeCacheSummary {
  for (const [key, item] of cache.items.entries()) {
    if (isExpired(item)) cache.items.delete(key);
  }

  return {
    namespace: cache.namespace,
    itemCount: cache.items.size,
    maxItems: cache.maxItems,
    ttlMs: cache.ttlMs,
    keys: [...cache.items.keys()]
  };
}
