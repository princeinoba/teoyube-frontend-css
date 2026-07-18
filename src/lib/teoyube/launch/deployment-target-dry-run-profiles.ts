import type { TeoyubeDeploymentDryRunTarget } from "./deployment-dry-run-contracts";

export type TeoyubeDeploymentTargetDryRunProfile = {
  target: TeoyubeDeploymentDryRunTarget;
  label: string;
  expectedBuildCommand: string;
  expectedOutputBehavior: string;
  environmentVariableRequirements: string[];
  previewDeploymentSupport: boolean;
  rollbackNotes: string[];
  knownRisks: string[];
  providerSpecificFollowUps: string[];
};

function profile(target: TeoyubeDeploymentDryRunTarget, label: string, previewDeploymentSupport: boolean, risks: string[]): TeoyubeDeploymentTargetDryRunProfile {
  return {
    target,
    label,
    expectedBuildCommand: "npm run build",
    expectedOutputBehavior: "Next.js production output generated locally before any deployment.",
    environmentVariableRequirements: [
      "NODE_ENV",
      "NEXT_PUBLIC_TEOYUBE_APP_ENV",
      "NEXT_PUBLIC_TEOYUBE_DEPLOYMENT_TARGET"
    ],
    previewDeploymentSupport,
    rollbackNotes: ["Confirm provider rollback UI before preview deployment.", "Do not configure production traffic in dry run."],
    knownRisks: risks,
    providerSpecificFollowUps: ["Confirm environment values with placeholders first.", "Do not add provider secrets until approved."]
  };
}

export function getVercelDryRunProfile() { return profile("vercel", "Vercel", true, ["Provider connection is not configured in this step."]); }
export function getNetlifyDryRunProfile() { return profile("netlify", "Netlify", true, ["Confirm Next.js runtime compatibility."]); }
export function getRenderDryRunProfile() { return profile("render", "Render", false, ["Preview deployment flow may require manual setup."]); }
export function getRailwayDryRunProfile() { return profile("railway", "Railway", false, ["Cost and service boundaries require review."]); }
export function getSelfHostedDryRunProfile() { return profile("self_hosted", "Self-hosted", false, ["Requires manual hosting, rollback, and monitoring operations."]); }
export function getUndecidedDryRunProfile() { return profile("undecided", "Undecided", false, ["Deployment target must be confirmed before preview deployment."]); }

export function getDryRunProfileForTarget(target: TeoyubeDeploymentDryRunTarget): TeoyubeDeploymentTargetDryRunProfile {
  switch (target) {
    case "vercel": return getVercelDryRunProfile();
    case "netlify": return getNetlifyDryRunProfile();
    case "render": return getRenderDryRunProfile();
    case "railway": return getRailwayDryRunProfile();
    case "self_hosted": return getSelfHostedDryRunProfile();
    default: return getUndecidedDryRunProfile();
  }
}

