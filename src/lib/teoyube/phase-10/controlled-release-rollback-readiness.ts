export type TeoyubeRollbackReadinessRecord = {
  id: string;
  previousStableDeploymentIdentified: boolean;
  lastKnownStableCommitIdentified: boolean;
  rollbackMethodUnderstood: boolean;
  releaseOwnerCanPauseRelease: boolean;
  releaseOwnerCanCommunicatePauseManually: boolean;
  criticalIssueCriteriaReviewed: boolean;
  secretPrivateDataExposureRollbackRuleReviewed: boolean;
  rollbackDecisionCanBeLogged: boolean;
  noAutomatedRollbackIntroduced: boolean;
  notes: string[];
  reviewedAt: string;
};

export function createRollbackReadinessChecklist(record: TeoyubeRollbackReadinessRecord) {
  return [
    { id: "previous_stable_deployment", label: "Previous stable deployment identified", passed: record.previousStableDeploymentIdentified },
    { id: "stable_commit", label: "Last known stable commit identified", passed: record.lastKnownStableCommitIdentified },
    { id: "rollback_method", label: "Rollback command or hosting rollback method understood", passed: record.rollbackMethodUnderstood },
    { id: "owner_can_pause", label: "Release owner can pause release", passed: record.releaseOwnerCanPauseRelease },
    { id: "manual_pause_communication", label: "Release owner can communicate pause manually", passed: record.releaseOwnerCanCommunicatePauseManually },
    { id: "critical_issue_criteria", label: "Critical issue criteria reviewed", passed: record.criticalIssueCriteriaReviewed },
    { id: "exposure_rule", label: "Secret/private data exposure rollback rule reviewed", passed: record.secretPrivateDataExposureRollbackRuleReviewed },
    { id: "decision_log", label: "Rollback decision can be logged", passed: record.rollbackDecisionCanBeLogged },
    { id: "no_automated_rollback", label: "No automated rollback is introduced", passed: record.noAutomatedRollbackIntroduced }
  ];
}

export function createRollbackReadinessRecord(input: Partial<TeoyubeRollbackReadinessRecord> = {}): TeoyubeRollbackReadinessRecord {
  return {
    id: input.id || "phase_10_3_rollback_readiness",
    previousStableDeploymentIdentified: input.previousStableDeploymentIdentified ?? false,
    lastKnownStableCommitIdentified: input.lastKnownStableCommitIdentified ?? false,
    rollbackMethodUnderstood: input.rollbackMethodUnderstood ?? false,
    releaseOwnerCanPauseRelease: input.releaseOwnerCanPauseRelease ?? false,
    releaseOwnerCanCommunicatePauseManually: input.releaseOwnerCanCommunicatePauseManually ?? false,
    criticalIssueCriteriaReviewed: input.criticalIssueCriteriaReviewed ?? false,
    secretPrivateDataExposureRollbackRuleReviewed: input.secretPrivateDataExposureRollbackRuleReviewed ?? false,
    rollbackDecisionCanBeLogged: input.rollbackDecisionCanBeLogged ?? false,
    noAutomatedRollbackIntroduced: input.noAutomatedRollbackIntroduced ?? true,
    notes: input.notes || [],
    reviewedAt: input.reviewedAt || new Date().toISOString()
  };
}

export function getRollbackReadinessBlockers(record: TeoyubeRollbackReadinessRecord): string[] {
  return createRollbackReadinessChecklist(record)
    .filter((entry) => !entry.passed)
    .map((entry) => `${entry.id}: ${entry.label}`);
}

export function getRollbackReadinessWarnings(record: TeoyubeRollbackReadinessRecord): string[] {
  const warnings = record.notes.length ? [...record.notes] : [];
  warnings.push("Rollback readiness is decision support only; this module performs no rollback.");
  return warnings;
}

export function validateRollbackReadiness(record: TeoyubeRollbackReadinessRecord): boolean {
  return getRollbackReadinessBlockers(record).length === 0;
}

export function createRollbackReadinessDecision(record: TeoyubeRollbackReadinessRecord): "rollback_ready" | "blocked" | "ready_with_warnings" {
  if (!validateRollbackReadiness(record)) return "blocked";
  return getRollbackReadinessWarnings(record).length ? "ready_with_warnings" : "rollback_ready";
}

export function createRollbackReadinessReport(record: TeoyubeRollbackReadinessRecord) {
  const blockers = getRollbackReadinessBlockers(record);
  return {
    valid: blockers.length === 0,
    decision: createRollbackReadinessDecision(record),
    checklist: createRollbackReadinessChecklist(record),
    record,
    blockers,
    warnings: getRollbackReadinessWarnings(record),
    noRollbackPerformed: true,
    noAutomatedRollbackIntroduced: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
