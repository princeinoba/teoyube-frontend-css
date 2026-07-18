export type TeoyubePhase107OwnerReviewRecord = {
  reviewed: boolean;
  phase106OperationsPackageReviewed: boolean;
  stabilizedPublicOperationsReviewed: boolean;
  weeklyImprovementLoopReviewed: boolean;
  manualOperationsReviewReviewed: boolean;
  weeklyKnownIssueReviewReviewed: boolean;
  publicTrustRefreshReviewed: boolean;
  releaseHealthSnapshotReviewed: boolean;
  phase10CompletionGateReviewed: boolean;
  roadmapStatusUpdatesReviewed: boolean;
  finalOwnerDecisionRecorded: boolean;
  nextMajorMilestoneAccepted: boolean;
  notes: string[];
  reviewedAt: string;
};

export function createPhase107OwnerReviewChecklist(accepted = false) {
  return [
    { id: "phase_10_6_package", label: "Phase 10.6 operations package reviewed", accepted },
    { id: "stabilized_public_operations", label: "Stabilized public operations reviewed", accepted },
    { id: "weekly_improvement_loop", label: "Weekly improvement loop reviewed", accepted },
    { id: "manual_operations", label: "Manual operations review reviewed", accepted },
    { id: "weekly_known_issue", label: "Weekly known issue review reviewed", accepted },
    { id: "public_trust_refresh", label: "Public trust refresh reviewed", accepted },
    { id: "release_health", label: "Release health snapshot reviewed", accepted },
    { id: "completion_gate", label: "Phase 10 completion gate reviewed", accepted },
    { id: "roadmap_status", label: "Roadmap/status updates reviewed", accepted },
    { id: "final_owner_decision", label: "Final owner decision recorded", accepted },
    { id: "next_milestone", label: "Next major milestone accepted or blocked", accepted }
  ];
}

export function createPhase107OwnerReviewRecord(input: Partial<TeoyubePhase107OwnerReviewRecord> = {}): TeoyubePhase107OwnerReviewRecord {
  const reviewed = input.reviewed ?? false;
  return {
    reviewed,
    phase106OperationsPackageReviewed: input.phase106OperationsPackageReviewed ?? reviewed,
    stabilizedPublicOperationsReviewed: input.stabilizedPublicOperationsReviewed ?? reviewed,
    weeklyImprovementLoopReviewed: input.weeklyImprovementLoopReviewed ?? reviewed,
    manualOperationsReviewReviewed: input.manualOperationsReviewReviewed ?? reviewed,
    weeklyKnownIssueReviewReviewed: input.weeklyKnownIssueReviewReviewed ?? reviewed,
    publicTrustRefreshReviewed: input.publicTrustRefreshReviewed ?? reviewed,
    releaseHealthSnapshotReviewed: input.releaseHealthSnapshotReviewed ?? reviewed,
    phase10CompletionGateReviewed: input.phase10CompletionGateReviewed ?? reviewed,
    roadmapStatusUpdatesReviewed: input.roadmapStatusUpdatesReviewed ?? reviewed,
    finalOwnerDecisionRecorded: input.finalOwnerDecisionRecorded ?? reviewed,
    nextMajorMilestoneAccepted: input.nextMajorMilestoneAccepted ?? false,
    notes: input.notes || [],
    reviewedAt: input.reviewedAt || new Date().toISOString()
  };
}

export function getPhase107OwnerReviewBlockers(record: TeoyubePhase107OwnerReviewRecord): string[] {
  return Object.entries({
    reviewed: record.reviewed,
    phase106OperationsPackageReviewed: record.phase106OperationsPackageReviewed,
    stabilizedPublicOperationsReviewed: record.stabilizedPublicOperationsReviewed,
    weeklyImprovementLoopReviewed: record.weeklyImprovementLoopReviewed,
    manualOperationsReviewReviewed: record.manualOperationsReviewReviewed,
    weeklyKnownIssueReviewReviewed: record.weeklyKnownIssueReviewReviewed,
    publicTrustRefreshReviewed: record.publicTrustRefreshReviewed,
    releaseHealthSnapshotReviewed: record.releaseHealthSnapshotReviewed,
    phase10CompletionGateReviewed: record.phase10CompletionGateReviewed,
    roadmapStatusUpdatesReviewed: record.roadmapStatusUpdatesReviewed,
    finalOwnerDecisionRecorded: record.finalOwnerDecisionRecorded
  }).filter(([, value]) => !value).map(([key]) => `${key} requires owner review.`);
}

export function getPhase107OwnerReviewWarnings(record: TeoyubePhase107OwnerReviewRecord): string[] {
  const warnings = record.notes.length ? [...record.notes] : [];
  if (!record.nextMajorMilestoneAccepted) warnings.push("Phase 11 should wait until build/typecheck/local verification and Phase 10 completion gate blockers are resolved.");
  return warnings;
}

export function validatePhase107OwnerReview(record: TeoyubePhase107OwnerReviewRecord): boolean {
  return getPhase107OwnerReviewBlockers(record).length === 0;
}

export function createPhase107OwnerReviewDecision(record: TeoyubePhase107OwnerReviewRecord): "owner_review_complete" | "needs_owner_review" | "blocked_before_phase_11" {
  if (!validatePhase107OwnerReview(record)) return "needs_owner_review";
  return record.nextMajorMilestoneAccepted ? "owner_review_complete" : "blocked_before_phase_11";
}

export function createPhase107OwnerReviewReport(record: TeoyubePhase107OwnerReviewRecord) {
  return {
    valid: validatePhase107OwnerReview(record),
    decision: createPhase107OwnerReviewDecision(record),
    checklist: createPhase107OwnerReviewChecklist(validatePhase107OwnerReview(record)),
    record,
    blockers: getPhase107OwnerReviewBlockers(record),
    warnings: getPhase107OwnerReviewWarnings(record),
    noPublicLaunchPerformedByCode: true,
    noExternalSend: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
