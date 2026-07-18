export type TeoyubeControlledExpansionGateLevel =
  | "remain_limited"
  | "expand_to_small_public_group"
  | "expand_to_wider_public_group"
  | "pause_expansion"
  | "rollback_required";

export type TeoyubeControlledExpansionGateDecision =
  | "approve_expansion"
  | "approve_with_conditions"
  | "remain_limited"
  | "pause_expansion"
  | "rollback_required"
  | "blocked";

export type TeoyubeControlledExpansionGateRecord = {
  id: string;
  expansionLevel: TeoyubeControlledExpansionGateLevel;
  conditions: string[];
  checks: Array<{ id: string; label: string; passed: boolean; critical: boolean; details: string }>;
  releaseOwner: string;
  notes: string[];
  reviewedAt: string;
};

export type TeoyubeControlledExpansionGateInput = Partial<{
  releaseOwner: string;
  expansionLevel: TeoyubeControlledExpansionGateLevel;
  conditions: string[];
  notes: string[];
  controlledReleaseExpansionReadinessReviewed: boolean;
  publicTrustReviewPassed: boolean;
  knownLimitationsReadinessReviewed: boolean;
  publicSafetyBoundaryReviewPassed: boolean;
  stabilizedOperationsHandoffReadinessReviewed: boolean;
  rollbackReadinessConfirmed: boolean;
  noUnresolvedSeverity1Issue: boolean;
  noUnapprovedExpansionBlockingSeverity2Issue: boolean;
  ownerApprovalRecorded: boolean;
  expansionLevelSelected: boolean;
  expansionConditionsDocumented: boolean;
}>;

function gateItem(id: string, label: string, passed: boolean, details: string, critical = true) {
  return { id, label, passed, critical, details };
}

export function createControlledExpansionGateChecklist(input: TeoyubeControlledExpansionGateInput = {}) {
  return [
    gateItem("readiness_reviewed", "Controlled release expansion readiness reviewed", input.controlledReleaseExpansionReadinessReviewed === true, "Controlled release expansion readiness must be reviewed."),
    gateItem("public_trust_passed", "Public trust review passed", input.publicTrustReviewPassed === true, "Public trust review must pass."),
    gateItem("limitations_reviewed", "Known limitations readiness reviewed", input.knownLimitationsReadinessReviewed === true, "Known limitations readiness must be reviewed."),
    gateItem("safety_boundary_passed", "Public safety boundary review passed", input.publicSafetyBoundaryReviewPassed === true, "Public safety boundary review must pass."),
    gateItem("handoff_reviewed", "Stabilized operations handoff readiness reviewed", input.stabilizedOperationsHandoffReadinessReviewed === true, "Stabilized operations handoff readiness must be reviewed."),
    gateItem("rollback_ready", "Rollback readiness confirmed", input.rollbackReadinessConfirmed === true, "Rollback readiness must be confirmed."),
    gateItem("no_severity_1", "No unresolved Severity 1 issue", input.noUnresolvedSeverity1Issue === true, "Unresolved Severity 1 issues block expansion."),
    gateItem("no_unapproved_severity_2", "No unapproved expansion-blocking Severity 2 issue", input.noUnapprovedExpansionBlockingSeverity2Issue === true, "Unapproved expansion-blocking Severity 2 issues block expansion."),
    gateItem("owner_approval", "Owner approval recorded", input.ownerApprovalRecorded === true, "Owner approval is required."),
    gateItem("expansion_level", "Expansion level selected", input.expansionLevelSelected === true, "Expansion level must be selected."),
    gateItem("conditions", "Expansion conditions documented", input.expansionConditionsDocumented === true, "Expansion conditions must be documented.", false)
  ];
}

export function createControlledExpansionGateRecord(input: TeoyubeControlledExpansionGateInput = {}): TeoyubeControlledExpansionGateRecord {
  return {
    id: "phase_10_6_controlled_expansion_gate",
    expansionLevel: input.expansionLevel || "remain_limited",
    conditions: input.conditions || [],
    checks: createControlledExpansionGateChecklist(input),
    releaseOwner: input.releaseOwner || "project_owner",
    notes: input.notes || [],
    reviewedAt: new Date().toISOString()
  };
}

export function getControlledExpansionGateBlockers(record: TeoyubeControlledExpansionGateRecord): string[] {
  const blockers = record.checks.filter((entry) => entry.critical && !entry.passed).map((entry) => entry.details);
  if (record.expansionLevel === "rollback_required") blockers.push("Expansion gate selected rollback required.");
  if (record.expansionLevel === "pause_expansion") blockers.push("Expansion gate selected pause expansion.");
  return blockers;
}

export function getControlledExpansionGateWarnings(record: TeoyubeControlledExpansionGateRecord): string[] {
  const warnings = record.checks.filter((entry) => !entry.critical && !entry.passed).map((entry) => entry.details);
  if ((record.expansionLevel === "expand_to_small_public_group" || record.expansionLevel === "expand_to_wider_public_group") && !record.conditions.length) {
    warnings.push("Expansion level was selected without written conditions.");
  }
  return warnings;
}

export function validateControlledExpansionGateRecord(record: TeoyubeControlledExpansionGateRecord): boolean {
  return getControlledExpansionGateBlockers(record).length === 0;
}

export function createControlledExpansionGateDecision(record: TeoyubeControlledExpansionGateRecord): TeoyubeControlledExpansionGateDecision {
  if (record.expansionLevel === "rollback_required") return "rollback_required";
  if (record.expansionLevel === "pause_expansion") return "pause_expansion";
  if (!validateControlledExpansionGateRecord(record)) return "blocked";
  if (record.expansionLevel === "remain_limited") return "remain_limited";
  return record.conditions.length || getControlledExpansionGateWarnings(record).length ? "approve_with_conditions" : "approve_expansion";
}

export function createControlledExpansionGateReport(record: TeoyubeControlledExpansionGateRecord) {
  const blockers = getControlledExpansionGateBlockers(record);
  return {
    valid: blockers.length === 0,
    decision: createControlledExpansionGateDecision(record),
    record,
    blockers,
    warnings: getControlledExpansionGateWarnings(record),
    noAutomaticPublicExpansion: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
