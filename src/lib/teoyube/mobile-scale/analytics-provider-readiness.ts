import type { TigProductionEvent } from "../../tig";
import { sanitizeProductionLogPayload } from "./production-logging-boundaries";
import {
  getSafeDefaultRuntimeConfig,
  type TeoyubeRuntimeConfig
} from "./runtime-config-readiness";
import type { TeoyubeExternalServiceReadinessPlan } from "./scale-readiness-contracts";

export type TeoyubeAnalyticsProvider =
  | "posthog"
  | "segment"
  | "google_analytics"
  | "mixpanel"
  | "custom"
  | "none";

export type TeoyubeAnalyticsProviderAdapterPlan =
  TeoyubeExternalServiceReadinessPlan & {
    provider: TeoyubeAnalyticsProvider;
    supportedEvents: string[];
    adapterOnly: true;
  };

export function getAnalyticsProviderReadinessContracts(): TeoyubeAnalyticsProviderAdapterPlan[] {
  return ([
    "posthog",
    "segment",
    "google_analytics",
    "mixpanel",
    "custom",
    "none"
  ] as TeoyubeAnalyticsProvider[]).map(createAnalyticsProviderAdapterPlan);
}

export function createAnalyticsProviderAdapterPlan(
  provider: TeoyubeAnalyticsProvider
): TeoyubeAnalyticsProviderAdapterPlan {
  return {
    id: `analytics_provider_${provider}`,
    provider,
    category: "analytics",
    status: provider === "none" ? "ready" : "planned",
    connected: false,
    sendsExternally: false,
    writesExternally: false,
    adapterOnly: true,
    supportedEvents: [
      "tig.production.response.created",
      "tig.production.recommendation.selected",
      "tig.production.fallback.used",
      "tig.production.confidence.low",
      "tig.production.surface.viewed"
    ],
    requiredBeforeConnection: [
      "Privacy review",
      "Consent-aware event gating",
      "Payload sanitization",
      "Export and delete process",
      "Provider-specific environment configuration"
    ],
    privacyRules: [
      "Do not send raw user input.",
      "Do not send journal entries or prayer text.",
      "Do not create hidden personalization.",
      "Send only sanitized public ids, Scripture refs, confidence labels, fallback status, and safety status."
    ]
  };
}

export function validateAnalyticsProviderConnectionPlan(
  plan: TeoyubeAnalyticsProviderAdapterPlan
) {
  const errors = [
    plan.connected ? "Analytics provider must not be connected in Phase 7.4." : "",
    plan.sendsExternally ? "Analytics provider must not send events in Phase 7.4." : "",
    plan.writesExternally ? "Analytics provider must not write externally in Phase 7.4." : "",
    plan.adapterOnly ? "" : "Analytics provider plan should remain adapter-only."
  ].filter(Boolean);

  return {
    valid: errors.length === 0,
    status: errors.length ? "blocked" : plan.status,
    errors,
    warnings: [
      "Analytics provider readiness is contract-only. No provider is installed or called."
    ]
  };
}

export function sanitizeAnalyticsEventForProvider(
  event: Partial<TigProductionEvent> | Record<string, unknown>,
  config: Partial<TeoyubeRuntimeConfig> = getSafeDefaultRuntimeConfig()
): Record<string, unknown> {
  const sanitized = sanitizeProductionLogPayload(event as Record<string, unknown>);
  const defaults = getSafeDefaultRuntimeConfig();
  const merged = {
    ...defaults,
    ...config,
    featureFlags: {
      ...defaults.featureFlags,
      ...(config.featureFlags || {})
    }
  };

  return {
    ...sanitized,
    externalAnalyticsSent: false,
    externalEventSendingEnabled: merged.featureFlags.externalEventSendingEnabled
  };
}

export function createAnalyticsProviderReadinessReport() {
  const plans = getAnalyticsProviderReadinessContracts();
  const validations = plans.map(validateAnalyticsProviderConnectionPlan);
  const errors = validations.flatMap((item) => item.errors);

  return {
    id: "phase_7_4_analytics_provider_readiness",
    complete: errors.length === 0,
    completionPercentage: errors.length === 0 ? 100 : 0,
    providerCount: plans.length,
    plans,
    errors,
    warnings: [
      "Phase 7.4 does not install, connect, or send events to analytics providers."
    ],
    generatedAt: new Date().toISOString()
  };
}

