export type TeoyubeScaleRiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical"
  | "unknown";

export type TeoyubeRuntimeEnvironment =
  | "development"
  | "test"
  | "preview"
  | "production"
  | "unknown";

export type TeoyubeDeploymentTarget =
  | "local"
  | "preview"
  | "production"
  | "unknown";

export type TeoyubeDeploymentReadinessStatus =
  | "ready"
  | "planned"
  | "needs_work"
  | "blocked";

export type TeoyubeScaleReadinessCheck = {
  id: string;
  label: string;
  status: TeoyubeDeploymentReadinessStatus;
  required: boolean;
  riskLevel: TeoyubeScaleRiskLevel;
  details: string;
  remediation?: string;
};

export type TeoyubeScaleReadinessReport = {
  id: string;
  title: string;
  status: TeoyubeDeploymentReadinessStatus;
  target: TeoyubeDeploymentTarget;
  complete: boolean;
  completionPercentage: number;
  checks: TeoyubeScaleReadinessCheck[];
  warnings: string[];
  generatedAt: string;
};

export type TeoyubeRouteScaleProfile = {
  id: string;
  route: string;
  surface: string;
  mobileReadiness: TeoyubeDeploymentReadinessStatus;
  performanceReadiness: TeoyubeDeploymentReadinessStatus;
  cacheReadiness: TeoyubeDeploymentReadinessStatus;
  offlineFallbackReadiness: TeoyubeDeploymentReadinessStatus;
  personalizationSafetyReadiness: TeoyubeDeploymentReadinessStatus;
  eventReadiness: TeoyubeDeploymentReadinessStatus;
  deploymentRiskLevel: TeoyubeScaleRiskLevel;
  recommendedFollowUp: string;
};

export type TeoyubeSurfaceScaleProfile = Omit<TeoyubeRouteScaleProfile, "route"> & {
  component?: string;
};

export type TeoyubeEnvironmentVariableRequirement = {
  key: string;
  requiredFor: TeoyubeDeploymentTarget[];
  requiredInPhase74: boolean;
  sensitive: boolean;
  description: string;
  safeDefault?: string;
};

export type TeoyubeProductionSafetyRequirement = {
  id: string;
  label: string;
  required: boolean;
  status: TeoyubeDeploymentReadinessStatus;
  reason: string;
};

export type TeoyubeMonitoringReadinessPlan = {
  id: string;
  label: string;
  status: TeoyubeDeploymentReadinessStatus;
  internalSignals: string[];
  externalProviderConnected: false;
  privacyRules: string[];
  implementationNote: string;
};

export type TeoyubeLoggingBoundary = {
  id: string;
  label: string;
  allowedFields: string[];
  redactedFields: string[];
  blockedFields: string[];
  requiresConsent: boolean;
  productionDefault: "allow_sanitized" | "block";
  reason: string;
};

export type TeoyubeExternalServiceReadinessPlan = {
  id: string;
  provider: string;
  category: "analytics" | "persistence" | "ai" | "monitoring" | "hosting";
  status: TeoyubeDeploymentReadinessStatus;
  connected: false;
  sendsExternally: false;
  writesExternally: false;
  requiredBeforeConnection: string[];
  privacyRules: string[];
};

