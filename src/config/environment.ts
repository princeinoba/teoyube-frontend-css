import { z } from "zod";

const safeBoolean = z
  .enum(["true", "false"])
  .default("false")
  .catch("false")
  .transform((value) => value === "true");

const safePublicLabel = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9._-]+$/i)
  .catch("undecided");

const optionalSecret = z.string().trim().min(1).optional().catch(undefined);

const publicEnvironmentSchema = z.object({
  NEXT_PUBLIC_TEOYUBE_APP_ENV: z
    .enum(["development", "preview", "test"])
    .default("preview")
    .catch("preview"),
  NEXT_PUBLIC_TEOYUBE_DEPLOYMENT_TARGET: safePublicLabel.default("undecided"),
  NEXT_PUBLIC_TEOYUBE_ENABLE_PERSONALIZATION_PREVIEW: safeBoolean,
  NEXT_PUBLIC_TEOYUBE_ENABLE_CONSENT_CONTROLS: safeBoolean,
  NEXT_PUBLIC_TEOYUBE_ENABLE_OFFLINE_FALLBACK: safeBoolean,
  NEXT_PUBLIC_TEOYUBE_ENABLE_DEBUG_UI: safeBoolean
});

const serverEnvironmentSchema = z.object({
  TEOYUBE_ANALYTICS_PROVIDER_KEY: optionalSecret,
  TEOYUBE_DATABASE_URL: optionalSecret,
  TEOYUBE_LIVE_AI_API_KEY: optionalSecret,
  TEOYUBE_MONITORING_PROVIDER_KEY: optionalSecret,
  TEOYUBE_ENABLE_EXTERNAL_ANALYTICS: safeBoolean,
  TEOYUBE_ENABLE_DATABASE_PERSISTENCE: safeBoolean,
  TEOYUBE_ENABLE_LIVE_AI: safeBoolean,
  TEOYUBE_ENABLE_EXTERNAL_MONITORING: safeBoolean,
  TEOYUBE_ENABLE_DURABLE_MEMORY: safeBoolean
});

export type TeoyubePublicEnvironment = {
  appEnvironment: "development" | "preview" | "test";
  deploymentTarget: string;
  enabledFlags: {
    personalizationPreview: boolean;
    consentControls: boolean;
    offlineFallback: boolean;
    debugUi: boolean;
  };
};

export type TeoyubeServerFeatureAvailability = {
  externalAnalytics: boolean;
  databasePersistence: boolean;
  liveAi: boolean;
  externalMonitoring: boolean;
  durableMemory: boolean;
};

export function readPublicEnvironment(
  environment: NodeJS.ProcessEnv = process.env
): TeoyubePublicEnvironment {
  const parsed = publicEnvironmentSchema.parse(environment);
  return {
    appEnvironment: parsed.NEXT_PUBLIC_TEOYUBE_APP_ENV,
    deploymentTarget: parsed.NEXT_PUBLIC_TEOYUBE_DEPLOYMENT_TARGET,
    enabledFlags: {
      personalizationPreview: parsed.NEXT_PUBLIC_TEOYUBE_ENABLE_PERSONALIZATION_PREVIEW,
      consentControls: parsed.NEXT_PUBLIC_TEOYUBE_ENABLE_CONSENT_CONTROLS,
      offlineFallback: parsed.NEXT_PUBLIC_TEOYUBE_ENABLE_OFFLINE_FALLBACK,
      debugUi: parsed.NEXT_PUBLIC_TEOYUBE_ENABLE_DEBUG_UI
    }
  };
}

export function readServerFeatureAvailability(
  environment: NodeJS.ProcessEnv = process.env
): TeoyubeServerFeatureAvailability {
  const parsed = serverEnvironmentSchema.parse(environment);
  return {
    externalAnalytics:
      parsed.TEOYUBE_ENABLE_EXTERNAL_ANALYTICS && Boolean(parsed.TEOYUBE_ANALYTICS_PROVIDER_KEY),
    databasePersistence:
      parsed.TEOYUBE_ENABLE_DATABASE_PERSISTENCE && Boolean(parsed.TEOYUBE_DATABASE_URL),
    liveAi: parsed.TEOYUBE_ENABLE_LIVE_AI && Boolean(parsed.TEOYUBE_LIVE_AI_API_KEY),
    externalMonitoring:
      parsed.TEOYUBE_ENABLE_EXTERNAL_MONITORING && Boolean(parsed.TEOYUBE_MONITORING_PROVIDER_KEY),
    durableMemory: parsed.TEOYUBE_ENABLE_DURABLE_MEMORY
  };
}
