import type {
  TeoyubeManualPreviewDeploymentCommand,
  TeoyubeManualPreviewDeploymentProvider
} from "./manual-preview-deployment-contracts";
import {
  createProviderSetupReport,
  getProviderPreviewDeploymentSteps,
  getProviderSetupChecklist
} from "./manual-preview-provider-setup";

export type TeoyubeManualPreviewDeploymentRunbookSection = {
  id: string;
  title: string;
  owner: "codex_local" | "human_provider" | "human_review";
  steps: string[];
  commands: TeoyubeManualPreviewDeploymentCommand[];
  notes: string[];
};

function localCommand(id: string, label: string, command: string, purpose: string): TeoyubeManualPreviewDeploymentCommand {
  return {
    id,
    label,
    command,
    workingDirectory: "teoyube-app",
    mayRunLocally: true,
    humanOnly: false,
    purpose,
    safetyNotes: [
      "This command runs locally only.",
      "It does not deploy, send analytics, connect databases, or call live AI orchestration."
    ]
  };
}

function humanCommand(id: string, label: string, command: string, purpose: string): TeoyubeManualPreviewDeploymentCommand {
  return {
    id,
    label,
    command,
    mayRunLocally: false,
    humanOnly: true,
    purpose,
    safetyNotes: [
      "Human-only provider action.",
      "Do not run this from Codex unless the owner explicitly approves a configured and safe deployment workflow.",
      "Do not include secrets in code or command output."
    ]
  };
}

export function getManualPreviewPreflightRunbook(
  provider: TeoyubeManualPreviewDeploymentProvider = "vercel"
): TeoyubeManualPreviewDeploymentRunbookSection {
  return {
    id: "preflight",
    title: "Local Preflight",
    owner: "codex_local",
    steps: [
      "Inspect deployment config without printing real secret values.",
      "Run available typecheck, lint, build, test, and smoke checks.",
      "Confirm final launch preparation remains 100% complete.",
      "Confirm provider setup and environment verification reports are ready."
    ],
    commands: [
      localCommand("typecheck", "Typecheck", "npm run typecheck", "Run if available; document if missing."),
      localCommand("lint", "Lint", "npm run lint", "Run if available; document if missing."),
      localCommand("build", "Build", "npm run build", "Production build check."),
      localCommand("test", "Test", "npm run test", "Run if available; document if missing.")
    ],
    notes: [`Provider selected for runbook: ${provider}.`]
  };
}

export function getManualPreviewProviderSetupRunbook(
  provider: TeoyubeManualPreviewDeploymentProvider = "vercel"
): TeoyubeManualPreviewDeploymentRunbookSection {
  const setup = createProviderSetupReport(provider);

  return {
    id: "provider_setup",
    title: "Provider Setup",
    owner: "human_provider",
    steps: getProviderSetupChecklist(provider),
    commands: [
      humanCommand(
        "provider_dashboard_setup",
        "Provider dashboard setup",
        "Configure provider project manually",
        "Create or review the preview project in the provider dashboard."
      )
    ],
    notes: [
      `Expected install command: ${setup.installCommand}.`,
      `Expected build command: ${setup.buildCommand}.`,
      `Expected output directory: ${setup.outputDirectory || "provider default"}.`
    ]
  };
}

export function getManualPreviewDeploymentRunbookSteps(
  provider: TeoyubeManualPreviewDeploymentProvider = "vercel"
): TeoyubeManualPreviewDeploymentRunbookSection {
  return {
    id: "manual_deployment",
    title: "Manual Preview Deployment",
    owner: "human_provider",
    steps: getProviderPreviewDeploymentSteps(provider),
    commands: [
      humanCommand(
        "manual_provider_deploy",
        "Manual provider deploy",
        "Trigger preview deployment in provider UI or approved provider CLI",
        "Create the real preview deployment after owner approval."
      )
    ],
    notes: [
      "Codex does not execute this command in this step.",
      "Record the preview URL manually after deployment."
    ]
  };
}

export function getManualPreviewPostDeploymentRunbook(
  provider: TeoyubeManualPreviewDeploymentProvider = "vercel"
): TeoyubeManualPreviewDeploymentRunbookSection {
  return {
    id: "postdeployment",
    title: "Post-Deployment QA",
    owner: "human_review",
    steps: [
      "Open the recorded preview URL manually.",
      "Verify Canon, Daily Word, Prayer, Calling Compass, Promise Cluster, AI Companion, TIG response panel, and journey surfaces.",
      "Confirm Scripture anchors, explanation paths, fallbacks, confidence labels, consent controls, and feedback controls are visible.",
      "Confirm mobile layout and accessibility basics.",
      "Confirm debug UI, analytics sending, production persistence, and live AI orchestration remain disabled."
    ],
    commands: [],
    notes: [`Postdeployment checks are human-reviewed for ${provider}; this module does not fetch URLs.`]
  };
}

export function getManualPreviewRollbackRunbook(
  provider: TeoyubeManualPreviewDeploymentProvider = "vercel"
): TeoyubeManualPreviewDeploymentRunbookSection {
  const setup = createProviderSetupReport(provider);

  return {
    id: "rollback",
    title: "Rollback",
    owner: "human_provider",
    steps: [
      "Stop sharing the preview URL if a launch-critical issue appears.",
      "Rollback manually through the provider dashboard or revert to the last safe commit.",
      "Document the issue and rerun local checks before retrying."
    ],
    commands: [],
    notes: setup.rollbackNotes
  };
}

export function createManualPreviewDeploymentRunbook(
  provider: TeoyubeManualPreviewDeploymentProvider = "vercel"
) {
  const sections = [
    getManualPreviewPreflightRunbook(provider),
    getManualPreviewProviderSetupRunbook(provider),
    getManualPreviewDeploymentRunbookSteps(provider),
    getManualPreviewPostDeploymentRunbook(provider),
    getManualPreviewRollbackRunbook(provider)
  ];

  return {
    id: "manual_preview_deployment_2_1_runbook",
    title: "Manual Preview Deployment 2.1 Runbook",
    provider,
    sections,
    guardrails: [
      "Do not expose secrets.",
      "Do not run provider deployment commands from code.",
      "Do not enable external analytics sending.",
      "Do not enable production persistence.",
      "Do not enable live AI orchestration.",
      "Do not enable service workers or native mobile builds.",
      "Keep Scripture anchoring, explanation paths, fallback handling, confidence labels, and consent controls intact."
    ],
    generatedAt: new Date().toISOString()
  };
}

export function createManualPreviewDeploymentRunbookReport(
  provider: TeoyubeManualPreviewDeploymentProvider = "vercel"
) {
  const runbook = createManualPreviewDeploymentRunbook(provider);
  const deploymentCommands = runbook.sections.flatMap((section) => section.commands).filter((command) => command.humanOnly);

  return {
    valid: runbook.sections.length >= 5,
    provider,
    sectionCount: runbook.sections.length,
    humanOnlyCommandCount: deploymentCommands.length,
    deploymentCommandsExecuted: false,
    runbook,
    generatedAt: new Date().toISOString()
  };
}
