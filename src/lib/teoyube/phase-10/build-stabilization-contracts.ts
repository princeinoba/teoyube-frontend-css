export type TeoyubeBuildStabilizationStatus = "patched" | "blocked" | "not_run" | "warning" | "passed" | "unknown";

export type TeoyubeBuildStabilizationArea =
  | "package_scripts"
  | "typescript"
  | "imports"
  | "exports"
  | "component_props"
  | "json_imports"
  | "route_files"
  | "framework_config"
  | "eslint"
  | "tests"
  | "build"
  | "runtime"
  | "unknown";

export type TeoyubeBuildStabilizationCheck = {
  id: string;
  area: TeoyubeBuildStabilizationArea;
  label: string;
  status: TeoyubeBuildStabilizationStatus;
  details: string;
};

export type TeoyubeBuildStabilizationResult = TeoyubeBuildStabilizationCheck;

export type TeoyubeBuildStabilizationPatch = {
  id: string;
  area: TeoyubeBuildStabilizationArea;
  file: string;
  summary: string;
  safetyImpact: string;
};

export type TeoyubeBuildStabilizationBlocker = {
  id: string;
  area: TeoyubeBuildStabilizationArea;
  message: string;
};

export type TeoyubeBuildStabilizationWarning = {
  id: string;
  area: TeoyubeBuildStabilizationArea;
  message: string;
};

export type TeoyubeBuildStabilizationDecision = "build_stabilized" | "blocked_by_dependencies" | "blocked_by_build" | "ready_with_warnings";

export type TeoyubeBuildStabilizationReport = {
  valid: boolean;
  decision: TeoyubeBuildStabilizationDecision;
  checks: TeoyubeBuildStabilizationCheck[];
  patches: TeoyubeBuildStabilizationPatch[];
  blockers: TeoyubeBuildStabilizationBlocker[];
  warnings: TeoyubeBuildStabilizationWarning[];
  noExternalServicesRequired: true;
  noPublicLaunchPerformed: true;
  inMemoryOnly: true;
  generatedAt: string;
};
