export type TeoyubeReleaseHealthSnapshotStatus =
  | "healthy"
  | "healthy_with_warnings"
  | "needs_review"
  | "blocked"
  | "rollback_required"
  | "unknown";

export type TeoyubeReleaseHealthSnapshot = {
  id: string;
  appStabilityStatus: TeoyubeReleaseHealthSnapshotStatus;
  routeStabilityStatus: TeoyubeReleaseHealthSnapshotStatus;
  manualFeedbackStatus: TeoyubeReleaseHealthSnapshotStatus;
  knownIssueStatus: TeoyubeReleaseHealthSnapshotStatus;
  safeFixBatchStatus: TeoyubeReleaseHealthSnapshotStatus;
  publicTrustStatus: TeoyubeReleaseHealthSnapshotStatus;
  rollbackReadinessStatus: TeoyubeReleaseHealthSnapshotStatus;
  ownerReviewStatus: TeoyubeReleaseHealthSnapshotStatus;
  phase10CompletionReadiness: TeoyubeReleaseHealthSnapshotStatus;
  notes: string[];
  generatedAt: string;
};

export type TeoyubeReleaseHealthSnapshotInput = Partial<Omit<TeoyubeReleaseHealthSnapshot, "id" | "generatedAt"> & { id: string }>;

export function createReleaseHealthSnapshotChecklist(snapshot: TeoyubeReleaseHealthSnapshot = createReleaseHealthSnapshot()) {
  return [
    { id: "app_stability", label: "App stability healthy", passed: snapshot.appStabilityStatus === "healthy" || snapshot.appStabilityStatus === "healthy_with_warnings", critical: true, details: "App stability blocks completion if unhealthy." },
    { id: "route_stability", label: "Route stability healthy", passed: snapshot.routeStabilityStatus === "healthy" || snapshot.routeStabilityStatus === "healthy_with_warnings", critical: true, details: "Route stability blocks completion if unhealthy." },
    { id: "known_issues", label: "Known issues ready", passed: snapshot.knownIssueStatus !== "blocked" && snapshot.knownIssueStatus !== "rollback_required", critical: true, details: "Known issue status blocks completion." },
    { id: "public_trust", label: "Public trust ready", passed: snapshot.publicTrustStatus !== "blocked" && snapshot.publicTrustStatus !== "rollback_required", critical: true, details: "Public trust status blocks completion." },
    { id: "rollback_readiness", label: "Rollback readiness healthy", passed: snapshot.rollbackReadinessStatus === "healthy" || snapshot.rollbackReadinessStatus === "healthy_with_warnings", critical: true, details: "Rollback readiness must be healthy." },
    { id: "owner_review", label: "Owner review healthy", passed: snapshot.ownerReviewStatus === "healthy" || snapshot.ownerReviewStatus === "healthy_with_warnings", critical: true, details: "Owner review must be healthy." },
    { id: "completion_readiness", label: "Phase 10 completion readiness healthy", passed: snapshot.phase10CompletionReadiness === "healthy" || snapshot.phase10CompletionReadiness === "healthy_with_warnings", critical: true, details: "Phase 10 completion readiness must be healthy." }
  ];
}

export function createReleaseHealthSnapshot(input: TeoyubeReleaseHealthSnapshotInput = {}): TeoyubeReleaseHealthSnapshot {
  return {
    id: input.id || "phase_10_7_release_health_snapshot",
    appStabilityStatus: input.appStabilityStatus || "unknown",
    routeStabilityStatus: input.routeStabilityStatus || "unknown",
    manualFeedbackStatus: input.manualFeedbackStatus || "unknown",
    knownIssueStatus: input.knownIssueStatus || "unknown",
    safeFixBatchStatus: input.safeFixBatchStatus || "unknown",
    publicTrustStatus: input.publicTrustStatus || "unknown",
    rollbackReadinessStatus: input.rollbackReadinessStatus || "unknown",
    ownerReviewStatus: input.ownerReviewStatus || "unknown",
    phase10CompletionReadiness: input.phase10CompletionReadiness || "unknown",
    notes: input.notes || [],
    generatedAt: new Date().toISOString()
  };
}

export function getReleaseHealthSnapshotBlockers(snapshot: TeoyubeReleaseHealthSnapshot): string[] {
  return createReleaseHealthSnapshotChecklist(snapshot).filter((entry) => entry.critical && !entry.passed).map((entry) => entry.details);
}

export function getReleaseHealthSnapshotWarnings(snapshot: TeoyubeReleaseHealthSnapshot): string[] {
  const warnings: string[] = [];
  if (!snapshot.notes.length) warnings.push("Release health snapshot has no owner notes.");
  Object.entries(snapshot)
    .filter(([, value]) => value === "healthy_with_warnings" || value === "needs_review" || value === "unknown")
    .forEach(([key]) => warnings.push(`${key} needs owner watch.`));
  return warnings;
}

export function validateReleaseHealthSnapshot(snapshot: TeoyubeReleaseHealthSnapshot): boolean {
  return getReleaseHealthSnapshotBlockers(snapshot).length === 0;
}

export function createReleaseHealthSnapshotDecision(snapshot: TeoyubeReleaseHealthSnapshot): "release_health_ready" | "ready_with_warnings" | "needs_review" | "blocked" {
  if (!validateReleaseHealthSnapshot(snapshot)) return "blocked";
  return getReleaseHealthSnapshotWarnings(snapshot).length ? "ready_with_warnings" : "release_health_ready";
}

export function createReleaseHealthSnapshotReport(snapshot: TeoyubeReleaseHealthSnapshot) {
  const blockers = getReleaseHealthSnapshotBlockers(snapshot);
  return {
    valid: blockers.length === 0,
    decision: createReleaseHealthSnapshotDecision(snapshot),
    checklist: createReleaseHealthSnapshotChecklist(snapshot),
    snapshot,
    blockers,
    warnings: getReleaseHealthSnapshotWarnings(snapshot),
    noAutomaticMonitoring: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
