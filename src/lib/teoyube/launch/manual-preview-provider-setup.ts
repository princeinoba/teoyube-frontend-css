import type {
  TeoyubeManualPreviewDeploymentProvider,
  TeoyubeManualPreviewDeploymentProviderStatus
} from "./manual-preview-deployment-contracts";

type ProviderSettings = {
  provider: TeoyubeManualPreviewDeploymentProvider;
  recommended: boolean;
  installCommand: string;
  buildCommand: string;
  outputDirectory?: string;
  previewSupported: boolean;
  setupChecklist: string[];
  environmentVariableInstructions: string[];
  previewDeploymentSteps: string[];
  rollbackNotes: string[];
  knownRisks: string[];
};

const COMMON_ENVIRONMENT_INSTRUCTIONS = [
  "Configure only safe preview values in the provider dashboard.",
  "Use placeholders in documentation; never commit real secret values.",
  "Keep external analytics sending disabled.",
  "Keep production database persistence disabled.",
  "Keep live AI orchestration disabled.",
  "Keep Scripture anchoring, explanation paths, fallback handling, safety guardrails, and consent controls enabled."
];

const PROVIDERS: Record<TeoyubeManualPreviewDeploymentProvider, ProviderSettings> = {
  vercel: {
    provider: "vercel",
    recommended: true,
    installCommand: "npm install",
    buildCommand: "npm run build",
    outputDirectory: ".next",
    previewSupported: true,
    setupChecklist: [
      "Connect the repository in the Vercel dashboard manually.",
      "Confirm the framework preset is Next.js.",
      "Confirm the app root and install/build commands before deployment.",
      "Add preview environment variables manually in the provider UI.",
      "Deploy only after local checks and owner approval pass."
    ],
    environmentVariableInstructions: COMMON_ENVIRONMENT_INSTRUCTIONS,
    previewDeploymentSteps: [
      "Open the Vercel project dashboard.",
      "Trigger a preview deployment from the selected branch or pull request.",
      "Record the generated preview URL manually in the execution record.",
      "Run the postdeployment checklist against that URL."
    ],
    rollbackNotes: [
      "Stop sharing the preview URL if launch-critical behavior fails.",
      "Use Vercel's deployment history to promote the last safe preview only after review.",
      "Disable unsafe surfaces by code change and redeploy manually if needed."
    ],
    knownRisks: [
      "Incorrect project root can build the wrong package.",
      "Environment variables entered in the wrong scope can leak behavior into production.",
      "Provider deployment logs must be reviewed manually."
    ]
  },
  netlify: {
    provider: "netlify",
    recommended: false,
    installCommand: "npm install",
    buildCommand: "npm run build",
    outputDirectory: ".next",
    previewSupported: true,
    setupChecklist: [
      "Connect the repository in Netlify manually.",
      "Confirm Next.js support/plugin behavior in the dashboard.",
      "Confirm build command and publish/output settings.",
      "Add preview environment variables manually.",
      "Deploy only after local checks and owner approval pass."
    ],
    environmentVariableInstructions: COMMON_ENVIRONMENT_INSTRUCTIONS,
    previewDeploymentSteps: [
      "Open the Netlify site dashboard.",
      "Create a deploy preview from the selected branch.",
      "Record the deploy preview URL manually.",
      "Run the postdeployment checklist against that URL."
    ],
    rollbackNotes: [
      "Lock or stop sharing the deploy preview if unsafe behavior appears.",
      "Use Netlify deploy history for manual rollback review.",
      "Re-run local checks before retrying."
    ],
    knownRisks: [
      "Next.js runtime behavior can vary by provider settings.",
      "Output directory settings need manual confirmation.",
      "Environment scopes must be reviewed carefully."
    ]
  },
  render: {
    provider: "render",
    recommended: false,
    installCommand: "npm install",
    buildCommand: "npm run build",
    outputDirectory: ".next",
    previewSupported: true,
    setupChecklist: [
      "Create a Render web service manually.",
      "Confirm Node runtime and build/start commands.",
      "Configure preview environment variables manually.",
      "Review service health checks before sharing.",
      "Deploy only after local checks and owner approval pass."
    ],
    environmentVariableInstructions: COMMON_ENVIRONMENT_INSTRUCTIONS,
    previewDeploymentSteps: [
      "Open the Render service dashboard.",
      "Trigger a manual deploy or preview environment.",
      "Record the preview URL manually.",
      "Run the postdeployment checklist."
    ],
    rollbackNotes: [
      "Stop sharing the service URL if unsafe behavior appears.",
      "Rollback manually through Render deploy history where available.",
      "Disable unsafe features and redeploy only after checks pass."
    ],
    knownRisks: [
      "Start command and Next.js serving behavior require manual provider review.",
      "Preview URL behavior may differ from Vercel-style branch previews.",
      "Service environment scopes must be verified manually."
    ]
  },
  railway: {
    provider: "railway",
    recommended: false,
    installCommand: "npm install",
    buildCommand: "npm run build",
    outputDirectory: ".next",
    previewSupported: true,
    setupChecklist: [
      "Create or select a Railway project manually.",
      "Confirm the app root, build command, and start command.",
      "Configure safe preview variables manually.",
      "Review domain and public exposure settings.",
      "Deploy only after local checks and owner approval pass."
    ],
    environmentVariableInstructions: COMMON_ENVIRONMENT_INSTRUCTIONS,
    previewDeploymentSteps: [
      "Open the Railway project dashboard.",
      "Trigger deployment manually after approval.",
      "Record the generated URL manually.",
      "Run the postdeployment checklist."
    ],
    rollbackNotes: [
      "Remove public sharing if a launch-critical issue appears.",
      "Rollback manually using Railway deployment history where available.",
      "Review variables before any retry."
    ],
    knownRisks: [
      "Project root and service command detection need manual confirmation.",
      "Public domain settings can expose preview earlier than intended.",
      "Provider-specific logs must be reviewed manually."
    ]
  },
  self_hosted: {
    provider: "self_hosted",
    recommended: false,
    installCommand: "npm install",
    buildCommand: "npm run build",
    outputDirectory: ".next",
    previewSupported: true,
    setupChecklist: [
      "Provision a safe preview host manually.",
      "Install Node.js and dependencies manually.",
      "Configure safe preview variables outside the repository.",
      "Confirm HTTPS, firewall, rollback, and log access.",
      "Deploy only after local checks and owner approval pass."
    ],
    environmentVariableInstructions: COMMON_ENVIRONMENT_INSTRUCTIONS,
    previewDeploymentSteps: [
      "Build the app locally or on the host after approval.",
      "Start the preview service manually.",
      "Record the preview URL manually.",
      "Run the postdeployment checklist."
    ],
    rollbackNotes: [
      "Stop the preview service or remove public access if unsafe behavior appears.",
      "Restore the last safe release artifact manually.",
      "Keep host access limited to trusted reviewers."
    ],
    knownRisks: [
      "Infrastructure, TLS, process management, and rollback are human-owned.",
      "Secrets must be managed outside the repository.",
      "Monitoring is not connected by this step."
    ]
  },
  custom: {
    provider: "custom",
    recommended: false,
    installCommand: "npm install",
    buildCommand: "npm run build",
    outputDirectory: ".next",
    previewSupported: false,
    setupChecklist: [
      "Document the custom provider manually.",
      "Confirm install, build, output, runtime, rollback, and variable behavior.",
      "Confirm safe preview isolation before deployment.",
      "Deploy only after local checks and owner approval pass."
    ],
    environmentVariableInstructions: COMMON_ENVIRONMENT_INSTRUCTIONS,
    previewDeploymentSteps: [
      "Follow the provider-specific manual deployment process.",
      "Record the preview URL manually if one is produced.",
      "Run the postdeployment checklist."
    ],
    rollbackNotes: [
      "Define a manual rollback process before deployment.",
      "Stop sharing the preview URL if unsafe behavior appears."
    ],
    knownRisks: [
      "Custom provider behavior is unknown until manually documented.",
      "Preview support may be incomplete.",
      "Rollback may not be available without extra setup."
    ]
  },
  undecided: {
    provider: "undecided",
    recommended: false,
    installCommand: "npm install",
    buildCommand: "npm run build",
    outputDirectory: ".next",
    previewSupported: false,
    setupChecklist: [
      "Select a preview deployment provider before running deployment commands.",
      "Prefer Vercel for the first Next.js preview unless a different provider is intentionally chosen.",
      "Document the selected provider and environment profile."
    ],
    environmentVariableInstructions: COMMON_ENVIRONMENT_INSTRUCTIONS,
    previewDeploymentSteps: [
      "Choose a provider.",
      "Create the provider setup report.",
      "Run local checks before manual deployment."
    ],
    rollbackNotes: ["Rollback cannot be confirmed until a provider is selected."],
    knownRisks: ["Deployment is blocked until provider selection is complete."]
  },
  unknown: {
    provider: "unknown",
    recommended: false,
    installCommand: "npm install",
    buildCommand: "npm run build",
    outputDirectory: ".next",
    previewSupported: false,
    setupChecklist: [
      "Identify the deployment provider.",
      "Review provider-specific setup manually.",
      "Do not run deployment commands until provider selection is explicit."
    ],
    environmentVariableInstructions: COMMON_ENVIRONMENT_INSTRUCTIONS,
    previewDeploymentSteps: ["Resolve provider selection before deployment."],
    rollbackNotes: ["Rollback is unknown until a provider is selected."],
    knownRisks: ["Unknown provider state blocks safe deployment."]
  }
};

function settingsFor(provider: TeoyubeManualPreviewDeploymentProvider): ProviderSettings {
  return PROVIDERS[provider] || PROVIDERS.unknown;
}

export function getManualPreviewProviderOptions(): TeoyubeManualPreviewDeploymentProviderStatus[] {
  return (Object.keys(PROVIDERS) as TeoyubeManualPreviewDeploymentProvider[]).map(createProviderSetupReport);
}

export function getProviderSetupChecklist(provider: TeoyubeManualPreviewDeploymentProvider): string[] {
  return [...settingsFor(provider).setupChecklist];
}

export function getProviderEnvironmentVariableInstructions(provider: TeoyubeManualPreviewDeploymentProvider): string[] {
  return [...settingsFor(provider).environmentVariableInstructions];
}

export function getProviderBuildSettings(provider: TeoyubeManualPreviewDeploymentProvider) {
  const settings = settingsFor(provider);

  return {
    provider: settings.provider,
    installCommand: settings.installCommand,
    buildCommand: settings.buildCommand,
    outputDirectory: settings.outputDirectory,
    previewSupported: settings.previewSupported
  };
}

export function getProviderPreviewDeploymentSteps(provider: TeoyubeManualPreviewDeploymentProvider): string[] {
  return [...settingsFor(provider).previewDeploymentSteps];
}

export function createProviderSetupReport(
  provider: TeoyubeManualPreviewDeploymentProvider = "vercel"
): TeoyubeManualPreviewDeploymentProviderStatus {
  const settings = settingsFor(provider);

  return {
    provider: settings.provider,
    selected: provider !== "undecided" && provider !== "unknown",
    recommended: settings.recommended,
    installCommand: settings.installCommand,
    buildCommand: settings.buildCommand,
    outputDirectory: settings.outputDirectory,
    previewSupported: settings.previewSupported,
    setupChecklist: [...settings.setupChecklist],
    environmentVariableInstructions: [...settings.environmentVariableInstructions],
    previewDeploymentSteps: [...settings.previewDeploymentSteps],
    rollbackNotes: [...settings.rollbackNotes],
    knownRisks: [...settings.knownRisks],
    generatedAt: new Date().toISOString()
  };
}
