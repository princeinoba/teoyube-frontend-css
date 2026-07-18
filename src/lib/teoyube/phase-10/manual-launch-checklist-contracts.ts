export type TeoyubeManualLaunchChecklistStatus =
  | "not_started"
  | "in_progress"
  | "passed"
  | "passed_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubeManualLaunchChecklistArea =
  | "local_build"
  | "typecheck"
  | "lint"
  | "test"
  | "route_check"
  | "real_data_check"
  | "component_render_check"
  | "mobile_check"
  | "accessibility_check"
  | "privacy_consent_check"
  | "known_limitations_check"
  | "service_disabled_check"
  | "owner_approval_check"
  | "manual_monitoring_check"
  | "manual_support_check"
  | "pause_rollback_check"
  | "unknown";

export type TeoyubeManualLaunchChecklistDecision =
  | "ready_for_manual_rehearsal"
  | "ready_with_warnings"
  | "blocked"
  | "needs_owner_review"
  | "needs_real_app_verification"
  | "unknown";

export type TeoyubeManualLaunchChecklistResult = {
  status: "pending" | "passed" | "warning" | "blocked";
  notes?: string;
  checkedAt?: string;
};

export type TeoyubeManualLaunchChecklistItem = {
  id: string;
  area: TeoyubeManualLaunchChecklistArea;
  label: string;
  required: boolean;
  result: TeoyubeManualLaunchChecklistResult;
  instructions: string;
};

export type TeoyubeManualLaunchChecklistBlocker = {
  id: string;
  area: TeoyubeManualLaunchChecklistArea;
  message: string;
};

export type TeoyubeManualLaunchChecklistWarning = {
  id: string;
  area: TeoyubeManualLaunchChecklistArea;
  message: string;
};

export type TeoyubeManualLaunchChecklistReport = {
  valid: boolean;
  status: TeoyubeManualLaunchChecklistStatus;
  decision: TeoyubeManualLaunchChecklistDecision;
  checklist: TeoyubeManualLaunchChecklistItem[];
  summary: string[];
  blockers: TeoyubeManualLaunchChecklistBlocker[];
  warnings: TeoyubeManualLaunchChecklistWarning[];
  noLaunchActionPerformed: true;
  noExternalSend: true;
  inMemoryOnly: true;
  generatedAt: string;
};
