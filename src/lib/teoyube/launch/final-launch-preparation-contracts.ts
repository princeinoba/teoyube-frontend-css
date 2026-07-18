import type {
  TeoyubeLaunchQualityGate,
  TeoyubeLaunchRiskLevel
} from "./production-launch-contracts";

export type TeoyubeFinalLaunchPreparationStatus =
  | "ready"
  | "ready_with_warnings"
  | "blocked"
  | "needs_review"
  | "incomplete"
  | "unknown";

export type TeoyubeFinalLaunchPreparationStage =
  | "launch_1_1"
  | "launch_1_2"
  | "launch_1_3"
  | "launch_1_4"
  | "launch_1_5"
  | "launch_1_6"
  | "launch_1_7"
  | "launch_1_8"
  | "launch_1_9"
  | "final_safety"
  | "final_quality"
  | "final_surface"
  | "final_owner_review"
  | "manual_preview_deployment"
  | "unknown";

export type TeoyubeFinalLaunchDecision =
  | "ready_for_manual_preview_deployment"
  | "ready_after_manual_review"
  | "blocked"
  | "needs_qa_fix"
  | "needs_safety_fix"
  | "needs_environment_fix"
  | "unknown";

export type TeoyubeFinalLaunchNextAction =
  | "manual_preview_deployment_execution"
  | "owner_review"
  | "resolve_blockers"
  | "run_cli_checks"
  | "manual_qa_review"
  | "unknown";

export type TeoyubeFinalLaunchPreparationCheck = {
  id: string;
  label: string;
  stage: TeoyubeFinalLaunchPreparationStage;
  required: boolean;
  complete: boolean;
  status: TeoyubeFinalLaunchPreparationStatus;
  riskLevel: TeoyubeLaunchRiskLevel;
  details: string;
  nextAction?: string;
};

export type TeoyubeFinalLaunchPreparationBlocker = {
  id: string;
  label: string;
  category: string;
  riskLevel: "high" | "critical";
  reason: string;
  requiredAction: string;
  resolved?: boolean;
  resolution?: string;
};

export type TeoyubeFinalLaunchPreparationWarning = {
  id: string;
  label: string;
  category: string;
  riskLevel: Exclude<TeoyubeLaunchRiskLevel, "critical">;
  message: string;
  recommendedAction: string;
};

export type TeoyubeFinalLaunchQualityGateStatus = TeoyubeLaunchQualityGate & {
  category: "cli" | "readiness" | "qa" | "safety" | "surface" | "soft_launch" | "final";
};

export type TeoyubeFinalLaunchSafetyStatus = {
  status: TeoyubeFinalLaunchPreparationStatus;
  scriptureAnchoringRequired: boolean;
  explanationPathRequired: boolean;
  fallbackPathEnabled: boolean;
  fallbackResponsesNonEmpty: boolean;
  confidenceNotOverstated: boolean;
  noDivineCertaintyClaims: boolean;
  safetyGuardrailsEnabled: boolean;
  consentControlsAvailable: boolean;
  personalizationPreviewSafe: boolean;
  rawSensitiveTextNotStored: boolean;
  hiddenPersonalizationDisabled: boolean;
  externalAnalyticsDisabled: boolean;
  productionPersistenceDisabled: boolean;
  liveAiOrchestrationDisabled: boolean;
  debugUiHidden: boolean;
  offlineFallbackScriptureAnchored: boolean;
};

export type TeoyubeFinalLaunchSurfaceStatus = {
  surface: string;
  status: TeoyubeFinalLaunchPreparationStatus;
  mobileReady: boolean;
  desktopReady: boolean;
  accessibilityReady: boolean;
  scriptureAnchorVisible: boolean;
  explanationPathVisible: boolean;
  fallbackReady: boolean;
  confidenceLabelReady: boolean;
  consentReady: boolean;
  feedbackReady: boolean;
  debugSafe: boolean;
  offlineFallbackReady: boolean;
  noExternalServiceDependency: boolean;
  warnings: TeoyubeFinalLaunchPreparationWarning[];
};

export type TeoyubeFinalLaunchPreparationReport = {
  status: TeoyubeFinalLaunchPreparationStatus;
  ready: boolean;
  completionPercentage: number;
  decision: TeoyubeFinalLaunchDecision;
  checks: TeoyubeFinalLaunchPreparationCheck[];
  completedItems: string[];
  missingItems: string[];
  blockers: TeoyubeFinalLaunchPreparationBlocker[];
  warnings: TeoyubeFinalLaunchPreparationWarning[];
  nextRecommendedStep: string;
  generatedAt: string;
};

export type TeoyubeFinalLaunchReadinessPackage = {
  id: string;
  status: TeoyubeFinalLaunchPreparationStatus;
  ready: boolean;
  decision: TeoyubeFinalLaunchDecision;
  audit: unknown;
  safetyCertification: unknown;
  qualityGateReport: unknown;
  surfaceCertification: unknown;
  launchReadinessAudit: unknown;
  launchQaReport: unknown;
  launchSafetyReview: unknown;
  releaseCandidateReport: unknown;
  predeploymentSafetyGates: unknown;
  previewDeploymentReadinessAudit: unknown;
  previewExecutionAudit: unknown;
  previewReviewSoftLaunchAudit: unknown;
  softLaunchRunbookAudit: unknown;
  blockerRegister: unknown;
  nextAction: TeoyubeFinalLaunchNextAction;
  blockers: TeoyubeFinalLaunchPreparationBlocker[];
  warnings: TeoyubeFinalLaunchPreparationWarning[];
  sentExternally: false;
  filesWritten: false;
  deploymentPerformed: false;
  generatedAt: string;
};
