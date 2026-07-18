import type { TeoyubeEnvironmentVariableDefinition } from "./launch-environment-contracts";

const allEnvironments: TeoyubeEnvironmentVariableDefinition["allowedEnvironments"] = [
  "local",
  "development",
  "preview",
  "staging",
  "production"
];

function variable(
  definition: Omit<TeoyubeEnvironmentVariableDefinition, "allowedEnvironments"> & {
    allowedEnvironments?: TeoyubeEnvironmentVariableDefinition["allowedEnvironments"];
  }
): TeoyubeEnvironmentVariableDefinition {
  return {
    ...definition,
    allowedEnvironments: definition.allowedEnvironments || allEnvironments
  };
}

export function getLaunchEnvironmentVariableRegistry(): TeoyubeEnvironmentVariableDefinition[] {
  return [
    variable({
      key: "NODE_ENV",
      description: "Runtime environment indicator supplied by the host.",
      required: true,
      public: false,
      serverOnly: true,
      sensitive: false,
      disabledUntilLater: false,
      placeholder: "production"
    }),
    variable({
      key: "NEXT_PUBLIC_TEOYUBE_APP_ENV",
      description: "Public Teoyube app environment label.",
      required: true,
      public: true,
      serverOnly: false,
      sensitive: false,
      disabledUntilLater: false,
      placeholder: "preview"
    }),
    variable({
      key: "NEXT_PUBLIC_TEOYUBE_DEPLOYMENT_TARGET",
      description: "Public deployment target label for diagnostics and support.",
      required: true,
      public: true,
      serverOnly: false,
      sensitive: false,
      disabledUntilLater: false,
      placeholder: "undecided"
    }),
    variable({
      key: "NEXT_PUBLIC_TEOYUBE_ENABLE_PERSONALIZATION_PREVIEW",
      description: "Enables consent-aware personalization preview UI.",
      required: false,
      public: true,
      serverOnly: false,
      sensitive: false,
      disabledUntilLater: false,
      placeholder: "true"
    }),
    variable({
      key: "NEXT_PUBLIC_TEOYUBE_ENABLE_CONSENT_CONTROLS",
      description: "Enables user-facing consent controls.",
      required: false,
      public: true,
      serverOnly: false,
      sensitive: false,
      disabledUntilLater: false,
      placeholder: "true"
    }),
    variable({
      key: "NEXT_PUBLIC_TEOYUBE_ENABLE_OFFLINE_FALLBACK",
      description: "Enables offline/read-only fallback presentation.",
      required: false,
      public: true,
      serverOnly: false,
      sensitive: false,
      disabledUntilLater: false,
      placeholder: "true"
    }),
    variable({
      key: "NEXT_PUBLIC_TEOYUBE_ENABLE_DEBUG_UI",
      description: "Controls debug UI visibility. Must remain false for normal users.",
      required: false,
      public: true,
      serverOnly: false,
      sensitive: false,
      disabledUntilLater: false,
      placeholder: "false"
    }),
    variable({
      key: "TEOYUBE_ANALYTICS_PROVIDER_KEY",
      description: "Future server-only analytics provider key placeholder. Not enabled in this step.",
      required: false,
      public: false,
      serverOnly: true,
      sensitive: true,
      disabledUntilLater: true,
      placeholder: "disabled_until_later"
    }),
    variable({
      key: "TEOYUBE_DATABASE_URL",
      description: "Future server-only database connection string placeholder. Not enabled in this step.",
      required: false,
      public: false,
      serverOnly: true,
      sensitive: true,
      disabledUntilLater: true,
      placeholder: "disabled_until_later"
    }),
    variable({
      key: "TEOYUBE_LIVE_AI_API_KEY",
      description: "Future server-only live AI API key placeholder. Not enabled in this step.",
      required: false,
      public: false,
      serverOnly: true,
      sensitive: true,
      disabledUntilLater: true,
      placeholder: "disabled_until_later"
    }),
    variable({
      key: "TEOYUBE_MONITORING_PROVIDER_KEY",
      description: "Future server-only monitoring provider key placeholder. Not enabled in this step.",
      required: false,
      public: false,
      serverOnly: true,
      sensitive: true,
      disabledUntilLater: true,
      placeholder: "disabled_until_later"
    })
  ];
}

export function getRequiredLaunchEnvironmentVariables(): TeoyubeEnvironmentVariableDefinition[] {
  return getLaunchEnvironmentVariableRegistry().filter((entry) => entry.required);
}

export function getOptionalLaunchEnvironmentVariables(): TeoyubeEnvironmentVariableDefinition[] {
  return getLaunchEnvironmentVariableRegistry().filter((entry) => !entry.required);
}

export function getPublicLaunchEnvironmentVariables(): TeoyubeEnvironmentVariableDefinition[] {
  return getLaunchEnvironmentVariableRegistry().filter((entry) => entry.public);
}

export function getServerOnlyLaunchEnvironmentVariables(): TeoyubeEnvironmentVariableDefinition[] {
  return getLaunchEnvironmentVariableRegistry().filter((entry) => entry.serverOnly);
}

export function getDisabledUntilLaterEnvironmentVariables(): TeoyubeEnvironmentVariableDefinition[] {
  return getLaunchEnvironmentVariableRegistry().filter((entry) => entry.disabledUntilLater);
}
