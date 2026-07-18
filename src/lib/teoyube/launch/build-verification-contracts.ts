export type TeoyubeBuildVerificationStatus =
  | "pass"
  | "warning"
  | "fail"
  | "blocked"
  | "not_run"
  | "unknown";

export type TeoyubeBuildRiskLevel = "low" | "medium" | "high" | "critical" | "unknown";

export type TeoyubeBuildCommand = {
  id: "typecheck" | "lint" | "build" | "test" | "smoke" | "preview" | "start" | "other";
  scriptName: string;
  command?: string;
  required: boolean;
  available: boolean;
  description: string;
  riskLevel: TeoyubeBuildRiskLevel;
};

export type TeoyubeBuildCommandResult = {
  commandId: TeoyubeBuildCommand["id"];
  scriptName: string;
  status: TeoyubeBuildVerificationStatus;
  exitCode?: number;
  summary: string;
  ranAt?: string;
};

export type TeoyubeBuildVerificationCheck = {
  id: string;
  label: string;
  status: TeoyubeBuildVerificationStatus;
  required: boolean;
  riskLevel: TeoyubeBuildRiskLevel;
  details: string;
};

export type TeoyubeBuildVerificationResult = TeoyubeBuildVerificationCheck & {
  commandResult?: TeoyubeBuildCommandResult;
};

export type TeoyubeBuildArtifactCheck = {
  id: string;
  label: string;
  status: TeoyubeBuildVerificationStatus;
  riskLevel: TeoyubeBuildRiskLevel;
  details: string;
};

export type TeoyubeRouteBuildReadiness = {
  id: string;
  surface: string;
  route?: string;
  status: TeoyubeBuildVerificationStatus;
  pageExistsOrDocumented: boolean;
  mobileReady: boolean;
  productionResponseSafe: boolean;
  scriptureAnchorAvailable: boolean;
  explanationPathAvailable: boolean;
  fallbackExists: boolean;
  consentControlsAvailable: boolean;
  debugHidden: boolean;
  noExternalServicesRequired: boolean;
  warnings: string[];
};

export type TeoyubeReleaseCandidateStatus =
  | "ready_for_preview_deployment"
  | "ready_for_manual_review"
  | "blocked"
  | "needs_review"
  | "unknown";

export type TeoyubeDeploymentDryRunStatus =
  | "ready_for_preview_deployment"
  | "ready_for_manual_review"
  | "blocked"
  | "needs_environment_update"
  | "unknown";

export type TeoyubeBuildVerificationReport = {
  status: TeoyubeBuildVerificationStatus;
  valid: boolean;
  checkCount: number;
  passCount: number;
  warningCount: number;
  blockerCount: number;
  results: TeoyubeBuildVerificationResult[];
  warnings: string[];
  blockers: string[];
  generatedAt: string;
};

