import type { TeoyubePreviewDeploymentTarget } from "./preview-deployment-contracts";

export type TeoyubePreviewDeploymentCommandGuideItem = {
  id: string;
  label: string;
  command?: string;
  required: boolean;
  executeAutomatically: false;
  notes: string[];
};

export type TeoyubePreviewDeploymentCommandGuideReport = {
  target: TeoyubePreviewDeploymentTarget;
  commands: TeoyubePreviewDeploymentCommandGuideItem[];
  commandCount: number;
  deploymentCommandsExecuted: false;
  warnings: string[];
  generatedAt: string;
};

function command(
  id: string,
  label: string,
  commandText: string | undefined,
  required: boolean,
  notes: string[]
): TeoyubePreviewDeploymentCommandGuideItem {
  return {
    id,
    label,
    command: commandText,
    required,
    executeAutomatically: false,
    notes
  };
}

export function getPreviewDeploymentPreflightCommands(): TeoyubePreviewDeploymentCommandGuideItem[] {
  return [
    command("install_dependencies", "Install dependencies if needed", "npm install", false, ["Use only if dependencies are missing. Do not install provider CLIs from this guide."]),
    command("typecheck", "Run TypeScript check when available", "npm run typecheck", false, ["If no script exists, document the missing script."]),
    command("lint", "Run lint when available", "npm run lint", false, ["If no script exists, document the missing script."]),
    command("build", "Run production build", "npm run build", true, ["Run locally before preview deployment."]),
    command("test", "Run tests or smoke checks when available", "npm run test", false, ["If no test script exists, run launch smoke checks."])
  ];
}

export function getPreviewDeploymentVerificationCommands(): TeoyubePreviewDeploymentCommandGuideItem[] {
  return [
    command("launch_smoke_checks", "Run launch smoke checks", undefined, true, ["Run 1.1 through 1.5 local smoke checks from the source tree."]),
    command("manual_surface_review", "Manual surface review", undefined, true, ["Review Scripture anchors, explanations, fallbacks, consent, privacy, mobile, and accessibility."]),
    command("preview_start", "Start local production preview if available", "npm run start", false, ["Use only after a successful build."])
  ];
}

export function getPreviewDeploymentPostCheckCommands(): TeoyubePreviewDeploymentCommandGuideItem[] {
  return [
    command("post_preview_smoke", "Post-preview smoke checks", undefined, true, ["After any later preview deployment, manually smoke test launch-critical routes."]),
    command("rollback_review", "Rollback review", undefined, true, ["Confirm rollback plan before sharing a preview URL."])
  ];
}

export function getPreviewDeploymentCommandGuide(
  target: TeoyubePreviewDeploymentTarget = "vercel"
): TeoyubePreviewDeploymentCommandGuideItem[] {
  const providerNote =
    target === "undecided" || target === "unknown"
      ? "Select a provider before deployment execution."
      : `Manual provider deployment step for ${target}; do not run it from this module.`;

  return [
    ...getPreviewDeploymentPreflightCommands(),
    ...getPreviewDeploymentVerificationCommands(),
    command("manual_provider_deployment", "Manual provider deployment step", undefined, false, [providerNote]),
    ...getPreviewDeploymentPostCheckCommands()
  ];
}

export function createPreviewDeploymentCommandGuideReport(
  target: TeoyubePreviewDeploymentTarget = "vercel"
): TeoyubePreviewDeploymentCommandGuideReport {
  const commands = getPreviewDeploymentCommandGuide(target);

  return {
    target,
    commands,
    commandCount: commands.length,
    deploymentCommandsExecuted: false,
    warnings: [
      "This guide describes commands only; it does not execute deployment commands.",
      "Do not expose secrets in shell output, logs, or committed files.",
      "Do not install provider-specific CLI dependencies from this guide."
    ],
    generatedAt: new Date().toISOString()
  };
}

