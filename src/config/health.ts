import {
  readPublicEnvironment,
  readServerFeatureAvailability,
  type TeoyubePublicEnvironment,
  type TeoyubeServerFeatureAvailability
} from "./environment";

export type TeoyubeHealthPayload = {
  status: "ok";
  runtime: "next-canonical-local";
  rollbackRuntime: "static-node";
  deployment: "local/release-candidate";
  gateCPreview: "pass";
  gateCProduction: "closed";
  buildVersion: string;
  environment: TeoyubePublicEnvironment["appEnvironment"];
  deploymentTarget: string;
  enabledFlags: TeoyubePublicEnvironment["enabledFlags"] & TeoyubeServerFeatureAvailability;
};

function safeBuildVersion(value: string | undefined): string {
  const normalized = value?.trim();
  return normalized && /^[a-z0-9._-]{1,64}$/i.test(normalized) ? normalized : "development";
}

export function createHealthPayload(
  environment: NodeJS.ProcessEnv = process.env
): TeoyubeHealthPayload {
  const publicEnvironment = readPublicEnvironment(environment);
  const serverFeatures = readServerFeatureAvailability(environment);
  return {
    status: "ok",
    runtime: "next-canonical-local",
    rollbackRuntime: "static-node",
    deployment: "local/release-candidate",
    gateCPreview: "pass",
    gateCProduction: "closed",
    buildVersion: safeBuildVersion(environment.TEOYUBE_BUILD_VERSION),
    environment: publicEnvironment.appEnvironment,
    deploymentTarget: publicEnvironment.deploymentTarget,
    enabledFlags: {
      ...publicEnvironment.enabledFlags,
      ...serverFeatures
    }
  };
}
