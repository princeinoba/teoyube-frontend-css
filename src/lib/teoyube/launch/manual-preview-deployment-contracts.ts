export type TeoyubeManualPreviewDeploymentStatus =
  | "ready"
  | "ready_with_warnings"
  | "blocked"
  | "needs_review"
  | "not_started"
  | "in_progress"
  | "complete"
  | "failed"
  | "unknown";

export type TeoyubeManualPreviewDeploymentProvider =
  | "vercel"
  | "netlify"
  | "render"
  | "railway"
  | "self_hosted"
  | "custom"
  | "undecided"
  | "unknown";

export type TeoyubeManualPreviewDeploymentDecision =
  | "ready_for_manual_provider_deployment"
  | "ready_after_environment_review"
  | "blocked"
  | "needs_provider_selection"
  | "needs_build_fix"
  | "needs_environment_fix"
  | "unknown";

export type TeoyubeManualPreviewDeploymentStep = {
  id: string;
  label: string;
  phase: "provider_setup" | "environment_verification" | "local_checks" | "manual_deployment" | "postdeployment" | "rollback";
  required: boolean;
  status: TeoyubeManualPreviewDeploymentStatus;
  manualOnly: boolean;
  details: string;
  commandId?: string;
  nextAction?: string;
};

export type TeoyubeManualPreviewDeploymentChecklist = {
  id: string;
  label: string;
  provider: TeoyubeManualPreviewDeploymentProvider;
  steps: TeoyubeManualPreviewDeploymentStep[];
  generatedAt: string;
};

export type TeoyubeManualPreviewDeploymentCommand = {
  id: string;
  label: string;
  command: string;
  workingDirectory?: string;
  mayRunLocally: boolean;
  humanOnly: boolean;
  purpose: string;
  safetyNotes: string[];
};

export type TeoyubeManualPreviewDeploymentCommandResult = {
  commandId: string;
  status: TeoyubeManualPreviewDeploymentStatus;
  exitCode?: number;
  summary: string;
  checkedAt: string;
};

export type TeoyubeManualPreviewDeploymentEnvironmentStatus = {
  status: TeoyubeManualPreviewDeploymentStatus;
  valid: boolean;
  provider: TeoyubeManualPreviewDeploymentProvider;
  environmentProfile: "preview" | "production_candidate" | "local" | "unknown";
  scriptureAnchoringRequired: boolean;
  explanationPathRequired: boolean;
  fallbackPathEnabled: boolean;
  safetyGuardrailsEnabled: boolean;
  consentControlsEnabled: boolean;
  personalizationPreviewEnabled: boolean;
  personalizationConsentAware: boolean;
  externalAnalyticsSendingDisabled: boolean;
  productionPersistenceDisabled: boolean;
  liveAiOrchestrationDisabled: boolean;
  rawTextStorageDisabled: boolean;
  debugUiDisabledForPublicPreview: boolean;
  publicVariableNames: string[];
  blockers: string[];
  warnings: string[];
  generatedAt: string;
};

export type TeoyubeManualPreviewDeploymentProviderStatus = {
  provider: TeoyubeManualPreviewDeploymentProvider;
  selected: boolean;
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
  generatedAt: string;
};

export type TeoyubeManualPreviewDeploymentExecutionRecord = {
  id: string;
  provider: TeoyubeManualPreviewDeploymentProvider;
  environmentProfile: string;
  localChecksCompleted: boolean;
  manualDeploymentCommandPrepared: boolean;
  previewUrl?: string;
  postDeploymentChecksStatus: TeoyubeManualPreviewDeploymentStatus;
  steps: TeoyubeManualPreviewDeploymentStep[];
  commandResults: TeoyubeManualPreviewDeploymentCommandResult[];
  blockers: string[];
  warnings: string[];
  nextAction: string;
  deploymentPerformedByCode: false;
  sentExternally: false;
  filesWritten: false;
  createdAt: string;
  updatedAt: string;
};

export type TeoyubeManualPreviewDeploymentReport = {
  status: TeoyubeManualPreviewDeploymentStatus;
  ready: boolean;
  decision: TeoyubeManualPreviewDeploymentDecision;
  provider: TeoyubeManualPreviewDeploymentProvider;
  providerStatus?: TeoyubeManualPreviewDeploymentProviderStatus;
  environmentStatus?: TeoyubeManualPreviewDeploymentEnvironmentStatus;
  checklist?: TeoyubeManualPreviewDeploymentChecklist;
  blockers: string[];
  warnings: string[];
  nextStep: string;
  noActualDeploymentPerformed: boolean;
  noExternalSystemsRequired: boolean;
  generatedAt: string;
};
