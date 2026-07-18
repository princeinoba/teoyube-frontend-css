import type { TeoyubeLaunchRiskLevel } from "./production-launch-contracts";

export type TeoyubeLaunchEnvironment =
  | "local"
  | "development"
  | "preview"
  | "staging"
  | "production"
  | "unknown";

export type TeoyubeDeploymentTarget =
  | "vercel"
  | "netlify"
  | "render"
  | "railway"
  | "self_hosted"
  | "custom"
  | "undecided"
  | "unknown";

export type TeoyubeRuntimeMode =
  | "safe_preview"
  | "launch_preparation"
  | "soft_launch"
  | "production"
  | "maintenance"
  | "unknown";

export type TeoyubeEnvironmentSafetyLevel =
  | "safe"
  | "review_required"
  | "unsafe"
  | "unknown";

export type TeoyubeLaunchFeatureFlags = {
  tigProductionIntelligenceEnabled: boolean;
  scriptureAnchoringRequired: boolean;
  explanationPathRequired: boolean;
  fallbackPathEnabled: boolean;
  safetyGuardrailsEnabled: boolean;
  mobileUiEnabled: boolean;
  personalizationPreviewEnabled: boolean;
  consentControlsEnabled: boolean;
  feedbackControlsEnabled: boolean;
  externalAnalyticsSendingEnabled: boolean;
  productionDatabasePersistenceEnabled: boolean;
  liveAiOrchestrationEnabled: boolean;
  rawTextStorageEnabled: boolean;
  debugOutputVisibleToUsers: boolean;
  serviceWorkerEnabled: boolean;
  nativeMobileModeEnabled: boolean;
  hiddenPersonalizationEnabled: boolean;
};

export type TeoyubeEnvironmentVariableDefinition = {
  key: string;
  description: string;
  required: boolean;
  public: boolean;
  serverOnly: boolean;
  sensitive: boolean;
  disabledUntilLater: boolean;
  placeholder?: string;
  allowedEnvironments: TeoyubeLaunchEnvironment[];
};

export type TeoyubeEnvironmentValidationIssue = {
  id: string;
  message: string;
  severity: "info" | "warning" | "error";
  riskLevel: TeoyubeLaunchRiskLevel;
  recommendedAction: string;
};

export type TeoyubeEnvironmentValidationResult = {
  valid: boolean;
  safetyLevel: TeoyubeEnvironmentSafetyLevel;
  issues: TeoyubeEnvironmentValidationIssue[];
  warnings: TeoyubeEnvironmentValidationIssue[];
  errors: TeoyubeEnvironmentValidationIssue[];
};

export type TeoyubeDeploymentTargetOption = {
  target: TeoyubeDeploymentTarget;
  label: string;
  description: string;
  easeOfNextDeployment: number;
  previewSupport: number;
  environmentVariableSupport: number;
  scalability: number;
  costRisk: number;
  buildSupport: number;
  rollbackSupport: number;
  customDomainSupport: number;
  futureDatabaseFlexibility: number;
  futureAnalyticsFlexibility: number;
  safetyPrivacyFit: number;
  notes: string[];
};

export type TeoyubeDeploymentTargetDecision = {
  selectedTarget: TeoyubeDeploymentTarget;
  label: string;
  score: number;
  status: "recommended" | "acceptable" | "undecided" | "needs_review";
  reasons: string[];
  warnings: string[];
  nextActions: string[];
  comparedOptions: Array<{
    target: TeoyubeDeploymentTarget;
    label: string;
    score: number;
  }>;
};

export type TeoyubeEnvironmentConfigProfile = {
  id: string;
  label: string;
  environment: TeoyubeLaunchEnvironment;
  runtimeMode: TeoyubeRuntimeMode;
  deploymentTarget: TeoyubeDeploymentTarget;
  featureFlags: TeoyubeLaunchFeatureFlags;
  requiredEnvironmentVariables: string[];
  optionalEnvironmentVariables: string[];
  disabledServices: string[];
  safetyRequirements: string[];
  debugVisibleToUsers: boolean;
  launchRiskLevel: TeoyubeLaunchRiskLevel;
};

