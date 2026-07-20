type CacheEntry<TValue> = Readonly<{
  value: TValue;
  cachedAt: number;
}>;

export type TigCacheKeyInput = Readonly<{
  normalizedInput: unknown;
  datasetVersion: string;
  rulesetVersion: string;
  safeConfiguration: unknown;
  limits: unknown;
}>;

export type TigCacheDiagnostics = Readonly<{
  entries: number;
  hits: number;
  misses: number;
  writes: number;
  bypasses: number;
  keys: readonly string[];
}>;

function stableSerialize(value: unknown): string {
  if (value === undefined) return '"__undefined__"';
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(",")}]`;
  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, child]) => `${JSON.stringify(key)}:${stableSerialize(child)}`)
    .join(",")}}`;
}

function fingerprint(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function createTigVersionedCacheKey(input: TigCacheKeyInput): string {
  const inputFingerprint = fingerprint(stableSerialize(input.normalizedInput));
  const configurationFingerprint = fingerprint(stableSerialize({
    safeConfiguration: input.safeConfiguration,
    limits: input.limits
  }));
  return `tig:${input.datasetVersion}:${input.rulesetVersion}:${inputFingerprint}:${configurationFingerprint}`;
}

export class TigVersionedCache<TValue> {
  readonly #entries = new Map<string, CacheEntry<TValue>>();
  readonly #ttlMs: number;
  readonly #maximumEntries: number;
  #hits = 0;
  #misses = 0;
  #writes = 0;
  #bypasses = 0;

  constructor(options: Readonly<{ ttlMs: number; maximumEntries: number }>) {
    this.#ttlMs = options.ttlMs;
    this.#maximumEntries = options.maximumEntries;
  }

  get(key: string, now: number): TValue | undefined {
    const entry = this.#entries.get(key);
    if (!entry) {
      this.#misses += 1;
      return undefined;
    }
    if (now - entry.cachedAt > this.#ttlMs) {
      this.#entries.delete(key);
      this.#misses += 1;
      return undefined;
    }
    this.#hits += 1;
    return entry.value;
  }

  set(key: string, value: TValue, now: number): void {
    if (!this.#entries.has(key) && this.#entries.size >= this.#maximumEntries) {
      const oldestKey = this.#entries.keys().next().value as string | undefined;
      if (oldestKey) this.#entries.delete(oldestKey);
    }
    this.#entries.set(key, Object.freeze({ value, cachedAt: now }));
    this.#writes += 1;
  }

  bypass(): void {
    this.#bypasses += 1;
  }

  clear(): void {
    this.#entries.clear();
    this.#hits = 0;
    this.#misses = 0;
    this.#writes = 0;
    this.#bypasses = 0;
  }

  diagnostics(): TigCacheDiagnostics {
    return Object.freeze({
      entries: this.#entries.size,
      hits: this.#hits,
      misses: this.#misses,
      writes: this.#writes,
      bypasses: this.#bypasses,
      keys: Object.freeze([...this.#entries.keys()])
    });
  }
}
