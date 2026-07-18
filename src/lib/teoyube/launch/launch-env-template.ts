import {
  getDisabledUntilLaterEnvironmentVariables,
  getPublicLaunchEnvironmentVariables,
  getRequiredLaunchEnvironmentVariables,
  getServerOnlyLaunchEnvironmentVariables
} from "./launch-environment-registry";

function line(key: string, value: string, note?: string): string {
  return `${note ? `# ${note}\n` : ""}${key}=${value}`;
}

export function createLaunchEnvExampleTemplate(): string {
  return [
    "# Teoyube Production Launch Preparation environment template",
    "# Placeholder values only. Do not put real secrets in this file.",
    "",
    "# Required launch preparation values",
    line("NODE_ENV", "development"),
    line("NEXT_PUBLIC_TEOYUBE_APP_ENV", "preview"),
    line("NEXT_PUBLIC_TEOYUBE_DEPLOYMENT_TARGET", "undecided"),
    "",
    "# Safe public feature flags",
    line("NEXT_PUBLIC_TEOYUBE_ENABLE_PERSONALIZATION_PREVIEW", "true"),
    line("NEXT_PUBLIC_TEOYUBE_ENABLE_CONSENT_CONTROLS", "true"),
    line("NEXT_PUBLIC_TEOYUBE_ENABLE_OFFLINE_FALLBACK", "true"),
    line("NEXT_PUBLIC_TEOYUBE_ENABLE_DEBUG_UI", "false", "Must remain false for normal users."),
    "",
    "# Server-only future placeholders. These services are not enabled yet.",
    line("TEOYUBE_ANALYTICS_PROVIDER_KEY", "disabled_until_later"),
    line("TEOYUBE_DATABASE_URL", "disabled_until_later"),
    line("TEOYUBE_LIVE_AI_API_KEY", "disabled_until_later"),
    line("TEOYUBE_MONITORING_PROVIDER_KEY", "disabled_until_later"),
    "",
    "# Production persistence, external analytics sending, live AI orchestration,",
    "# service workers, and native mobile mode are intentionally disabled until later guarded launch steps."
  ].join("\n");
}

export function createLocalEnvTemplate(): string {
  return createLaunchEnvExampleTemplate()
    .replace("NODE_ENV=development", "NODE_ENV=development")
    .replace("NEXT_PUBLIC_TEOYUBE_APP_ENV=preview", "NEXT_PUBLIC_TEOYUBE_APP_ENV=local");
}

export function createPreviewEnvTemplate(): string {
  return createLaunchEnvExampleTemplate();
}

export function createProductionCandidateEnvTemplate(): string {
  return createLaunchEnvExampleTemplate()
    .replace("NODE_ENV=development", "NODE_ENV=production")
    .replace("NEXT_PUBLIC_TEOYUBE_APP_ENV=preview", "NEXT_PUBLIC_TEOYUBE_APP_ENV=production")
    .replace("NEXT_PUBLIC_TEOYUBE_DEPLOYMENT_TARGET=undecided", "NEXT_PUBLIC_TEOYUBE_DEPLOYMENT_TARGET=vercel");
}

export function createEnvironmentTemplateDocumentation() {
  return {
    required: getRequiredLaunchEnvironmentVariables().map((entry) => entry.key),
    public: getPublicLaunchEnvironmentVariables().map((entry) => entry.key),
    serverOnly: getServerOnlyLaunchEnvironmentVariables().map((entry) => entry.key),
    disabledUntilLater: getDisabledUntilLaterEnvironmentVariables().map((entry) => entry.key),
    notes: [
      "Use placeholders in examples and documentation.",
      "Do not expose server-only keys through NEXT_PUBLIC variables.",
      "Analytics, database, live AI, and monitoring provider keys remain disabled until later guarded launch steps."
    ]
  };
}

