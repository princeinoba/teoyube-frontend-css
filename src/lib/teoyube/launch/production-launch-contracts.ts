export type TeoyubeProductionLaunchStage =
  | "pre_launch_audit"
  | "environment_preparation"
  | "qa_validation"
  | "deployment_preparation"
  | "soft_launch"
  | "production_launch"
  | "post_launch_monitoring"
  | "unknown";

export type TeoyubeLaunchReadinessStatus =
  | "ready"
  | "ready_to_begin"
  | "needs_review"
  | "needs_configuration"
  | "blocked"
  | "not_started"
  | "unknown";

export type TeoyubeLaunchRiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical"
  | "unknown";

export type TeoyubeLaunchDecisionLabel =
  | "ready_for_build_verification"
  | "ready_for_deployment_dry_run"
  | "ready_for_preview_deployment"
  | "ready_for_preview_manual_review"
  | "ready_for_preview_deployment_execution"
  | "go_for_preview_deployment"
  | "go_after_manual_review"
  | "ready_for_soft_launch_candidate"
  | "ready_after_manual_review"
  | "ready_for_soft_launch_runbook_review"
  | "ready_for_final_launch_preparation_audit"
  | "ready_for_manual_preview_deployment"
  | "ready_for_manual_provider_deployment"
  | "ready_after_environment_review"
  | "ready_for_postdeployment_qa"
  | "ready_for_preview_issue_triage"
  | "ready_for_safe_fix_implementation"
  | "ready_for_preview_recheck"
  | "ready_for_soft_launch_preparation"
  | "ready_for_soft_launch_dry_run_review"
  | "ready_for_final_soft_launch_readiness_package"
  | "go_for_limited_soft_launch_execution"
  | "ready_after_owner_review"
  | "needs_preview_fix"
  | "needs_safety_fix"
  | "needs_qa_fix"
  | "needs_environment_fix"
  | "ready_for_launch_preparation"
  | "ready_for_soft_launch"
  | "blocked"
  | "needs_review"
  | "unknown";

export type TeoyubeLaunchChecklistItem = {
  id: string;
  label: string;
  stage: TeoyubeProductionLaunchStage;
  status: TeoyubeLaunchReadinessStatus;
  required: boolean;
  complete: boolean;
  riskLevel: TeoyubeLaunchRiskLevel;
  details: string;
  verification?: string;
  nextAction?: string;
};

export type TeoyubeLaunchBlocker = {
  id: string;
  label: string;
  riskLevel: "high" | "critical";
  reason: string;
  requiredAction: string;
};

export type TeoyubeLaunchWarning = {
  id: string;
  label: string;
  riskLevel: Exclude<TeoyubeLaunchRiskLevel, "critical">;
  message: string;
  recommendedAction: string;
};

export type TeoyubeLaunchSurfaceStatus = {
  surface: string;
  route?: string;
  launchReadiness: TeoyubeLaunchReadinessStatus;
  mobileReadiness: TeoyubeLaunchReadinessStatus;
  accessibilityReadiness: TeoyubeLaunchReadinessStatus;
  safetyReadiness: TeoyubeLaunchReadinessStatus;
  fallbackReadiness: TeoyubeLaunchReadinessStatus;
  personalizationReadiness: TeoyubeLaunchReadinessStatus;
  offlineFallbackReadiness: TeoyubeLaunchReadinessStatus;
  knownWarnings: TeoyubeLaunchWarning[];
  recommendedFixes: string[];
};

export type TeoyubeLaunchEnvironmentStatus = {
  status: TeoyubeLaunchReadinessStatus;
  target: "local" | "preview" | "production" | "unknown";
  appEnvironment: "development" | "test" | "preview" | "production" | "unknown";
  checks: TeoyubeLaunchChecklistItem[];
  requiredVariables: string[];
  optionalVariables: string[];
  warnings: TeoyubeLaunchWarning[];
};

export type TeoyubeLaunchSafetyStatus = {
  status: TeoyubeLaunchReadinessStatus;
  scriptureAnchoring: boolean;
  explanationPaths: boolean;
  fallbackSafety: boolean;
  consentSafety: boolean;
  privacySafety: boolean;
  noExternalSending: boolean;
  noDivineCertaintyClaims: boolean;
  warnings: TeoyubeLaunchWarning[];
};

export type TeoyubeLaunchQualityGate = {
  id: string;
  label: string;
  status: TeoyubeLaunchReadinessStatus;
  required: boolean;
  passed: boolean;
  riskLevel: TeoyubeLaunchRiskLevel;
  details: string;
  nextAction?: string;
};

export type TeoyubeLaunchDecision = {
  label: TeoyubeLaunchDecisionLabel;
  ready: boolean;
  stage: TeoyubeProductionLaunchStage;
  reasons: string[];
  nextActions: string[];
  blockers: TeoyubeLaunchBlocker[];
  warnings: TeoyubeLaunchWarning[];
};

export type TeoyubeLaunchReadinessReport = {
  stage: TeoyubeProductionLaunchStage;
  ready: boolean;
  readinessPercentage: number;
  blockers: TeoyubeLaunchBlocker[];
  warnings: TeoyubeLaunchWarning[];
  qualityGates: TeoyubeLaunchQualityGate[];
  surfaceStatuses: TeoyubeLaunchSurfaceStatus[];
  environmentStatus: TeoyubeLaunchEnvironmentStatus;
  safetyStatus: TeoyubeLaunchSafetyStatus;
  recommendedNextStep: string;
  decision?: TeoyubeLaunchDecision;
  generatedAt: string;
};
