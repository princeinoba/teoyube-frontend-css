export type TeoyubePublicReleaseOperationalReadinessInput = Partial<{
  manualMonitoringPlanExists: boolean;
  manualSupportWorkflowExists: boolean;
  manualIssueTriageExists: boolean;
  pauseRollbackCriteriaExist: boolean;
  knownLimitationsExist: boolean;
  ownerReviewPathExists: boolean;
  automaticExternalActionPerformed: boolean;
}>;

export type TeoyubePublicReleaseOperationalReadinessDecision =
  | "operational_readiness_ready"
  | "ready_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubePublicReleaseOperationalReadinessReport = {
  valid: boolean;
  decision: TeoyubePublicReleaseOperationalReadinessDecision;
  checklist: Array<{ id: string; passed: boolean; details: string }>;
  blockers: string[];
  warnings: string[];
  manualMonitoringOnly: true;
  noAutomaticExternalAction: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function flag(value: boolean | undefined): boolean {
  return value !== false;
}

function check(id: string, passed: boolean, details: string): { id: string; passed: boolean; details: string } {
  return { id, passed, details };
}

export function validatePublicReleaseManualMonitoringReadiness(input: TeoyubePublicReleaseOperationalReadinessInput = {}): boolean {
  return flag(input.manualMonitoringPlanExists);
}

export function validatePublicReleaseSupportReadiness(input: TeoyubePublicReleaseOperationalReadinessInput = {}): boolean {
  return flag(input.manualSupportWorkflowExists);
}

export function validatePublicReleaseIssueTriageReadiness(input: TeoyubePublicReleaseOperationalReadinessInput = {}): boolean {
  return flag(input.manualIssueTriageExists);
}

export function validatePublicReleasePauseRollbackReadiness(input: TeoyubePublicReleaseOperationalReadinessInput = {}): boolean {
  return flag(input.pauseRollbackCriteriaExist);
}

export function validatePublicReleaseKnownLimitationsReadiness(input: TeoyubePublicReleaseOperationalReadinessInput = {}): boolean {
  return flag(input.knownLimitationsExist);
}

export function validatePublicReleaseOwnerReviewReadiness(input: TeoyubePublicReleaseOperationalReadinessInput = {}): boolean {
  return flag(input.ownerReviewPathExists);
}

export function createPublicReleaseOperationalReadinessChecklist(input: TeoyubePublicReleaseOperationalReadinessInput = {}) {
  return [
    check("manual_monitoring_plan", validatePublicReleaseManualMonitoringReadiness(input), "Manual monitoring plan exists."),
    check("manual_support_workflow", validatePublicReleaseSupportReadiness(input), "Manual support workflow exists."),
    check("manual_issue_triage", validatePublicReleaseIssueTriageReadiness(input), "Manual issue triage exists."),
    check("pause_rollback", validatePublicReleasePauseRollbackReadiness(input), "Pause/rollback criteria exist."),
    check("known_limitations", validatePublicReleaseKnownLimitationsReadiness(input), "Known limitations exist."),
    check("owner_review_path", validatePublicReleaseOwnerReviewReadiness(input), "Owner review path exists."),
    check("no_automatic_external_action", !input.automaticExternalActionPerformed, "No automatic external action is performed.")
  ];
}

export function getPublicReleaseOperationalReadinessBlockers(input: TeoyubePublicReleaseOperationalReadinessInput = {}): string[] {
  return createPublicReleaseOperationalReadinessChecklist(input).filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
}

export function getPublicReleaseOperationalReadinessWarnings(): string[] {
  return ["Operational readiness is manual and in-memory; it does not monitor, message, fetch, persist, or connect externally."];
}

export function createPublicReleaseOperationalReadinessDecision(input: TeoyubePublicReleaseOperationalReadinessInput = {}): TeoyubePublicReleaseOperationalReadinessDecision {
  const blockers = getPublicReleaseOperationalReadinessBlockers(input);
  if (blockers.length) return "blocked";
  return getPublicReleaseOperationalReadinessWarnings().length ? "ready_with_warnings" : "operational_readiness_ready";
}

export function createPublicReleaseOperationalReadinessReport(input: TeoyubePublicReleaseOperationalReadinessInput = {}): TeoyubePublicReleaseOperationalReadinessReport {
  const blockers = getPublicReleaseOperationalReadinessBlockers(input);
  return {
    valid: blockers.length === 0,
    decision: createPublicReleaseOperationalReadinessDecision(input),
    checklist: createPublicReleaseOperationalReadinessChecklist(input),
    blockers,
    warnings: getPublicReleaseOperationalReadinessWarnings(),
    manualMonitoringOnly: true,
    noAutomaticExternalAction: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
