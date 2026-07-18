export type TeoyubeRealAppRuntimeVerificationStatus =
  | "passed"
  | "passed_with_warnings"
  | "blocked"
  | "not_run"
  | "unknown";

export type TeoyubeRealAppRuntimeVerificationArea =
  | "project_root"
  | "package_scripts"
  | "typecheck"
  | "lint"
  | "build"
  | "test"
  | "route_rendering"
  | "data_loading"
  | "component_rendering"
  | "runtime_errors"
  | "hydration"
  | "mobile_layout"
  | "accessibility_basics"
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "privacy_consent"
  | "service_disabled_state"
  | "unknown";

export type TeoyubeRealAppRuntimeVerificationDecision =
  | "ready_for_deployment_readiness"
  | "ready_with_warnings"
  | "blocked_by_build"
  | "blocked_by_runtime"
  | "blocked_by_routes"
  | "blocked_by_data"
  | "blocked_by_safety"
  | "unknown";

export type TeoyubeRealAppRuntimeVerificationCheck = {
  id: string;
  area: TeoyubeRealAppRuntimeVerificationArea;
  label: string;
  passed: boolean;
  required: boolean;
  details: string;
};

export type TeoyubeRealAppRuntimeVerificationResult = {
  id: string;
  area: TeoyubeRealAppRuntimeVerificationArea;
  status: TeoyubeRealAppRuntimeVerificationStatus;
  command?: string;
  summary: string;
  files?: string[];
};

export type TeoyubeRealAppRuntimeVerificationBlocker = {
  id: string;
  area: TeoyubeRealAppRuntimeVerificationArea;
  message: string;
  requiredAction: string;
};

export type TeoyubeRealAppRuntimeVerificationWarning = {
  id: string;
  area: TeoyubeRealAppRuntimeVerificationArea;
  message: string;
};

export type TeoyubeRealAppRuntimeVerificationReport = {
  valid: boolean;
  status: TeoyubeRealAppRuntimeVerificationStatus;
  decision: TeoyubeRealAppRuntimeVerificationDecision;
  projectRoot: string;
  framework: string;
  packageManager: string;
  checks: TeoyubeRealAppRuntimeVerificationCheck[];
  results: TeoyubeRealAppRuntimeVerificationResult[];
  blockers: TeoyubeRealAppRuntimeVerificationBlocker[];
  warnings: TeoyubeRealAppRuntimeVerificationWarning[];
  noPublicLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  inMemoryOnly: true;
  generatedAt: string;
};
