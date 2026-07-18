import type {
  TeoyubePhase10CompletionArea,
  TeoyubePhase10CompletionBlocker,
  TeoyubePhase10CompletionCheck,
  TeoyubePhase10CompletionDecision,
  TeoyubePhase10CompletionRecord,
  TeoyubePhase10CompletionReport,
  TeoyubePhase10CompletionStatus,
  TeoyubePhase10CompletionWarning
} from "./phase-10-completion-gate-contracts";

export type TeoyubePhase10CompletionGateInput = Partial<{
  status: TeoyubePhase10CompletionStatus;
  releaseOwner: string;
  notes: string[];
  phase101Complete: boolean;
  phase102Complete: boolean;
  phase103Complete: boolean;
  phase104Complete: boolean;
  phase105Complete: boolean;
  phase106Complete: boolean;
  phase107Complete: boolean;
  buildTypecheckLocalVerificationReviewed: boolean;
  routeQaReviewed: boolean;
  controlledReleaseExecutionReviewed: boolean;
  firstDayStabilizationReviewed: boolean;
  firstWeekStabilizationReviewed: boolean;
  publicTrustReviewPassed: boolean;
  knownLimitationsReadinessReviewed: boolean;
  stabilizedOperationsHandoffReviewed: boolean;
  weeklyImprovementLoopCreated: boolean;
  noUnresolvedSeverity1Issue: boolean;
  noUnapprovedSeverity2Blocker: boolean;
  ownerApprovalRecorded: boolean;
}>;

function check(id: string, area: TeoyubePhase10CompletionArea, label: string, passed: boolean, details: string, critical = true): TeoyubePhase10CompletionCheck {
  return { id, area, label, passed, critical, details };
}

export function createPhase10CompletionGateChecklist(input: TeoyubePhase10CompletionGateInput = {}): TeoyubePhase10CompletionCheck[] {
  return [
    check("phase_10_1", "phase_10_1", "Phase 10.1 complete", input.phase101Complete === true, "Phase 10.1 must be complete."),
    check("phase_10_2", "phase_10_2", "Phase 10.2 complete", input.phase102Complete === true, "Phase 10.2 must be complete."),
    check("phase_10_3", "phase_10_3", "Phase 10.3 complete", input.phase103Complete === true, "Phase 10.3 must be complete."),
    check("phase_10_4", "phase_10_4", "Phase 10.4 complete", input.phase104Complete === true, "Phase 10.4 must be complete."),
    check("phase_10_5", "phase_10_5", "Phase 10.5 complete", input.phase105Complete === true, "Phase 10.5 must be complete."),
    check("phase_10_6", "phase_10_6", "Phase 10.6 complete", input.phase106Complete === true, "Phase 10.6 must be complete."),
    check("phase_10_7", "phase_10_7", "Phase 10.7 complete", input.phase107Complete === true, "Phase 10.7 must be complete."),
    check("build_verification", "build_verification", "Build/typecheck/local verification reviewed", input.buildTypecheckLocalVerificationReviewed === true, "Build/typecheck/local verification must pass or be reviewed."),
    check("route_qa", "route_qa", "Route QA reviewed", input.routeQaReviewed === true, "Route QA must be reviewed."),
    check("controlled_release", "phase_10_3", "Controlled release execution reviewed", input.controlledReleaseExecutionReviewed === true, "Controlled release execution must be reviewed."),
    check("first_day", "phase_10_4", "First-day stabilization reviewed", input.firstDayStabilizationReviewed === true, "First-day stabilization must be reviewed."),
    check("first_week", "phase_10_5", "First-week stabilization reviewed", input.firstWeekStabilizationReviewed === true, "First-week stabilization must be reviewed."),
    check("public_trust", "public_trust", "Public trust review passed", input.publicTrustReviewPassed === true, "Public trust review must pass."),
    check("known_limitations", "known_limitations", "Known limitations readiness reviewed", input.knownLimitationsReadinessReviewed === true, "Known limitations readiness must be reviewed."),
    check("handoff", "operations_handoff", "Stabilized operations handoff reviewed", input.stabilizedOperationsHandoffReviewed === true, "Stabilized operations handoff must be reviewed."),
    check("weekly_loop", "weekly_improvement_loop", "Weekly improvement loop created", input.weeklyImprovementLoopCreated === true, "Weekly improvement loop must be created."),
    check("no_severity_1", "known_limitations", "No unresolved Severity 1 issue", input.noUnresolvedSeverity1Issue === true, "Unresolved Severity 1 issues block Phase 10 completion."),
    check("no_severity_2", "known_limitations", "No unapproved Severity 2 blocker", input.noUnapprovedSeverity2Blocker === true, "Unapproved Severity 2 blockers prevent Phase 10 completion."),
    check("owner_approval", "owner_approval", "Owner approval recorded", input.ownerApprovalRecorded === true, "Owner approval is required.")
  ];
}

export function createPhase10CompletionGateRecord(input: TeoyubePhase10CompletionGateInput = {}): TeoyubePhase10CompletionRecord {
  return {
    id: "phase_10_completion_gate",
    status: input.status || "reviewing",
    checks: createPhase10CompletionGateChecklist(input),
    releaseOwner: input.releaseOwner || "project_owner",
    notes: input.notes || [],
    reviewedAt: new Date().toISOString()
  };
}

export function getPhase10CompletionGateBlockers(record: TeoyubePhase10CompletionRecord): TeoyubePhase10CompletionBlocker[] {
  const blockers = record.checks
    .filter((entry) => entry.critical && !entry.passed)
    .map((entry) => ({ id: `${entry.id}_blocker`, area: entry.area, message: entry.details }));
  if (record.status === "blocked") blockers.push({ id: "completion_gate_blocked", area: "unknown", message: "Phase 10 completion gate is blocked." });
  return blockers;
}

export function getPhase10CompletionGateWarnings(record: TeoyubePhase10CompletionRecord): TeoyubePhase10CompletionWarning[] {
  const warnings = record.checks
    .filter((entry) => !entry.critical && !entry.passed)
    .map((entry) => ({ id: `${entry.id}_warning`, area: entry.area, message: entry.details }));
  if (!record.notes.length) warnings.push({ id: "no_owner_notes", area: "owner_approval", message: "Phase 10 completion gate has no owner notes." });
  return warnings;
}

export function validatePhase10CompletionGateRecord(record: TeoyubePhase10CompletionRecord): boolean {
  return getPhase10CompletionGateBlockers(record).length === 0;
}

export function createPhase10CompletionGateDecision(record: TeoyubePhase10CompletionRecord): TeoyubePhase10CompletionDecision {
  if (!validatePhase10CompletionGateRecord(record)) return record.status === "needs_more_stabilization" ? "continue_stabilization" : "blocked";
  if (record.status === "complete_with_warnings" || getPhase10CompletionGateWarnings(record).length) return "phase_10_complete_with_warnings";
  if (record.status === "ready_to_complete") return "phase_10_complete";
  return "phase_10_complete_with_warnings";
}

export function createPhase10CompletionGateReport(record: TeoyubePhase10CompletionRecord): TeoyubePhase10CompletionReport {
  const blockers = getPhase10CompletionGateBlockers(record);
  return {
    valid: blockers.length === 0,
    decision: createPhase10CompletionGateDecision(record),
    record,
    blockers,
    warnings: getPhase10CompletionGateWarnings(record),
    noAutomaticPublicLaunch: true,
    noAutomaticDeployment: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
