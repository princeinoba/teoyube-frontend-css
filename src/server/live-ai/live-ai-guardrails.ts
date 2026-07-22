import type { ModelRoute, SafeUsageMetadata } from "../../domain/live-ai/model-gateway";
import { LIVE_AI_OWNER_LIMITS, LIVE_AI_PRICING_VERSION, modelForRoute } from "./model-configuration";

export const LIVE_AI_GUARDRAIL_VERSION = "teoyube-live-ai-guardrails-2026-07-22.1";

export type LiveAiAdmissionCode =
  | "allowed"
  | "advanced_disabled"
  | "input_limit"
  | "output_limit"
  | "tool_round_limit"
  | "request_cost_limit"
  | "daily_budget_limit"
  | "user_rate_limit"
  | "global_rate_limit"
  | "concurrency_limit"
  | "circuit_open"
  | "duplicate_attempt";

export type LiveAiPermit = Readonly<{
  requestId: string;
  attemptKey: string;
  route: Exclude<ModelRoute, "advanced">;
  estimatedCostUsd: number;
  admittedAt: string;
}>;

export type LiveAiAdmission = Readonly<{
  allowed: boolean;
  code: LiveAiAdmissionCode;
  permit?: LiveAiPermit;
  retryAfterMs?: number;
}>;

type Window = { startedAt: number; count: number };
type ActivePermit = { permit: LiveAiPermit; completed: boolean };

function roundUsd(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

export function estimateLiveAiCost(input: Readonly<{
  route: Exclude<ModelRoute, "advanced">;
  inputTokens: number;
  cachedInputTokens?: number;
  outputTokens: number;
}>): number {
  const price = modelForRoute(input.route);
  const cached = Math.min(input.cachedInputTokens || 0, input.inputTokens);
  const uncached = Math.max(0, input.inputTokens - cached);
  return roundUsd((uncached * price.inputUsdPerMillion + cached * price.cachedInputUsdPerMillion + input.outputTokens * price.outputUsdPerMillion) / 1_000_000);
}

export class LiveAiGuardrails {
  readonly #userWindows = new Map<string, Window>();
  #globalWindow: Window = { startedAt: 0, count: 0 };
  readonly #attempts = new Map<string, ActivePermit>();
  readonly #requestCosts = new Map<string, number>();
  #active = 0;
  #dailyDate = "";
  #dailyCostUsd = 0;
  #consecutiveProviderFailures = 0;
  #circuitOpenedAt = 0;

  constructor(private readonly now: () => number = () => Date.now()) {}

  #resetWindows(current: number, subjectHash: string): void {
    if (current - this.#globalWindow.startedAt >= 60_000) this.#globalWindow = { startedAt: current, count: 0 };
    const user = this.#userWindows.get(subjectHash);
    if (!user || current - user.startedAt >= 60_000) this.#userWindows.set(subjectHash, { startedAt: current, count: 0 });
    const day = new Date(current).toISOString().slice(0, 10);
    if (day !== this.#dailyDate) {
      this.#dailyDate = day;
      this.#dailyCostUsd = 0;
      this.#requestCosts.clear();
    }
    if (this.#circuitOpenedAt && current - this.#circuitOpenedAt >= LIVE_AI_OWNER_LIMITS.circuitCooldownMs) {
      this.#circuitOpenedAt = 0;
      this.#consecutiveProviderFailures = 0;
    }
  }

  admit(input: Readonly<{
    requestId: string;
    attemptKey: string;
    subjectHash: string;
    route: ModelRoute;
    estimatedInputTokens: number;
    maximumOutputTokens: number;
    maximumToolRounds: number;
  }>): LiveAiAdmission {
    const current = this.now();
    this.#resetWindows(current, input.subjectHash);
    if (this.#attempts.has(input.attemptKey)) return Object.freeze({ allowed: false, code: "duplicate_attempt" });
    if (input.route === "advanced") return Object.freeze({ allowed: false, code: "advanced_disabled" });
    if (input.estimatedInputTokens > LIVE_AI_OWNER_LIMITS.maximumInputTokens) return Object.freeze({ allowed: false, code: "input_limit" });
    if (input.maximumOutputTokens > LIVE_AI_OWNER_LIMITS.maximumOutputTokens) return Object.freeze({ allowed: false, code: "output_limit" });
    if (input.maximumToolRounds > LIVE_AI_OWNER_LIMITS.maximumToolRounds) return Object.freeze({ allowed: false, code: "tool_round_limit" });
    if (this.#circuitOpenedAt) return Object.freeze({ allowed: false, code: "circuit_open", retryAfterMs: Math.max(1, LIVE_AI_OWNER_LIMITS.circuitCooldownMs - (current - this.#circuitOpenedAt)) });
    const estimatedCostUsd = estimateLiveAiCost({ route: input.route, inputTokens: input.estimatedInputTokens, outputTokens: input.maximumOutputTokens });
    const requestCost = this.#requestCosts.get(input.requestId) || 0;
    if (requestCost + estimatedCostUsd > LIVE_AI_OWNER_LIMITS.maximumPerRequestEstimatedUsd) return Object.freeze({ allowed: false, code: "request_cost_limit" });
    if (this.#dailyCostUsd + estimatedCostUsd > LIVE_AI_OWNER_LIMITS.dailyDevelopmentBudgetUsd) return Object.freeze({ allowed: false, code: "daily_budget_limit" });
    const user = this.#userWindows.get(input.subjectHash);
    if (!user) throw new Error("The user rate window was not initialized.");
    if (user.count >= LIVE_AI_OWNER_LIMITS.perUserRequestsPerMinute) return Object.freeze({ allowed: false, code: "user_rate_limit", retryAfterMs: Math.max(1, 60_000 - (current - user.startedAt)) });
    if (this.#globalWindow.count >= LIVE_AI_OWNER_LIMITS.globalRequestsPerMinute) return Object.freeze({ allowed: false, code: "global_rate_limit", retryAfterMs: Math.max(1, 60_000 - (current - this.#globalWindow.startedAt)) });
    if (this.#active >= LIVE_AI_OWNER_LIMITS.concurrency) return Object.freeze({ allowed: false, code: "concurrency_limit" });
    const permit = Object.freeze({ requestId: input.requestId, attemptKey: input.attemptKey, route: input.route, estimatedCostUsd, admittedAt: new Date(current).toISOString() });
    this.#attempts.set(input.attemptKey, { permit, completed: false });
    this.#requestCosts.set(input.requestId, roundUsd(requestCost + estimatedCostUsd));
    this.#dailyCostUsd = roundUsd(this.#dailyCostUsd + estimatedCostUsd);
    this.#active += 1;
    user.count += 1;
    this.#globalWindow.count += 1;
    return Object.freeze({ allowed: true, code: "allowed", permit });
  }

  complete(permit: LiveAiPermit, usage: SafeUsageMetadata): void {
    const active = this.#attempts.get(permit.attemptKey);
    if (!active || active.completed) return;
    active.completed = true;
    this.#active = Math.max(0, this.#active - 1);
    const actual = usage.estimatedCostUsd ?? permit.estimatedCostUsd;
    const delta = roundUsd(actual - permit.estimatedCostUsd);
    this.#dailyCostUsd = Math.max(0, roundUsd(this.#dailyCostUsd + delta));
    this.#requestCosts.set(permit.requestId, Math.max(0, roundUsd((this.#requestCosts.get(permit.requestId) || 0) + delta)));
    this.#consecutiveProviderFailures = 0;
    this.#circuitOpenedAt = 0;
  }

  fail(permit: LiveAiPermit, providerFailure: boolean): void {
    const active = this.#attempts.get(permit.attemptKey);
    if (!active || active.completed) return;
    active.completed = true;
    this.#active = Math.max(0, this.#active - 1);
    if (!providerFailure) return;
    this.#consecutiveProviderFailures += 1;
    if (this.#consecutiveProviderFailures >= LIVE_AI_OWNER_LIMITS.circuitFailureThreshold) this.#circuitOpenedAt = this.now();
  }

  canRetry(input: Readonly<{ status: string; requestId: string; route: Exclude<ModelRoute, "advanced">; estimatedInputTokens: number; maximumOutputTokens: number; attempt: number }>): boolean {
    if (input.attempt >= LIVE_AI_OWNER_LIMITS.maximumRetries) return false;
    if (!new Set(["timeout", "rate_limited", "provider_error"]).has(input.status)) return false;
    const additional = estimateLiveAiCost({ route: input.route, inputTokens: input.estimatedInputTokens, outputTokens: input.maximumOutputTokens });
    return (this.#requestCosts.get(input.requestId) || 0) + additional <= LIVE_AI_OWNER_LIMITS.maximumPerRequestEstimatedUsd
      && this.#dailyCostUsd + additional <= LIVE_AI_OWNER_LIMITS.dailyDevelopmentBudgetUsd;
  }

  snapshot(): Readonly<{
    version: string;
    pricingVersion: string;
    active: number;
    dailyCostUsd: number;
    circuitOpen: boolean;
    rawContentStored: false;
  }> {
    return Object.freeze({
      version: LIVE_AI_GUARDRAIL_VERSION,
      pricingVersion: LIVE_AI_PRICING_VERSION,
      active: this.#active,
      dailyCostUsd: this.#dailyCostUsd,
      circuitOpen: Boolean(this.#circuitOpenedAt),
      rawContentStored: false
    });
  }
}

export const liveAiGuardrails = new LiveAiGuardrails();
