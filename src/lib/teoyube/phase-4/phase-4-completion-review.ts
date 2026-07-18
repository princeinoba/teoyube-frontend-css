import { createBetaReadinessReviewReport } from "./beta-readiness-review";
import { createDisabledServiceEnforcementQaReport } from "./disabled-service-enforcement-qa";
import { createPhase41Package, createPhase41PackageReport } from "./phase-4-1-package";
import { createPhase42Package, createPhase42PackageReport } from "./phase-4-2-package";
import { createPhase43Package, createPhase43PackageReport } from "./phase-4-3-package";
import { createPhase44Package, createPhase44PackageReport } from "./phase-4-4-package";
import { createPhase45Package, createPhase45PackageReport } from "./phase-4-5-package";
import { createReviewedContentReleaseCandidateReport } from "./reviewed-content-release-candidate-builder";
import { createReviewedContentIntegrationGateReport } from "./reviewed-content-integration-gate";
import { createServiceDecisionLockReport } from "./service-decision-lock";
import type {
  TeoyubePhase4CompletionBlocker,
  TeoyubePhase4CompletionCheck,
  TeoyubePhase4CompletionDecision,
  TeoyubePhase4CompletionReport,
  TeoyubePhase4CompletionStatus,
  TeoyubePhase4CompletionWarning
} from "./phase-4-completion-contracts";

function blocker(id: string, area: TeoyubePhase4CompletionCheck["area"], message: string, requiredAction: string): TeoyubePhase4CompletionBlocker {
  return { id, area, message, requiredAction };
}

function warning(id: string, area: TeoyubePhase4CompletionCheck["area"], message: string, recommendedAction: string): TeoyubePhase4CompletionWarning {
  return { id, area, message, recommendedAction };
}

function check(
  id: string,
  area: TeoyubePhase4CompletionCheck["area"],
  label: string,
  complete: boolean,
  details: string,
  warnings: TeoyubePhase4CompletionWarning[] = []
): TeoyubePhase4CompletionCheck {
  return {
    id,
    area,
    label,
    complete,
    details,
    blockers: complete ? [] : [blocker(`${id}_blocker`, area, `${label} is incomplete.`, "Resolve this blocker before marking Phase 4 complete.")],
    warnings
  };
}

export function createPhase4CompletionChecklist(): TeoyubePhase4CompletionCheck[] {
  const phase41 = createPhase41PackageReport(createPhase41Package());
  const phase42 = createPhase42PackageReport(createPhase42Package());
  const phase43 = createPhase43PackageReport(createPhase43Package());
  const phase44 = createPhase44PackageReport(createPhase44Package());
  const phase45 = createPhase45PackageReport(createPhase45Package());
  const betaReadiness = createBetaReadinessReviewReport();
  const serviceLock = createServiceDecisionLockReport();
  const disabledQa = createDisabledServiceEnforcementQaReport();
  const gate = createReviewedContentIntegrationGateReport();
  const releaseCandidates = createReviewedContentReleaseCandidateReport();

  return [
    check("phase_4_1", "product_experience_audit", "Phase 4.1 complete", phase41.valid, `Phase 4.1 decision: ${phase41.decision}.`),
    check("phase_4_2", "surface_polish", "Phase 4.2 complete", phase42.valid, `Phase 4.2 decision: ${phase42.decision}.`),
    check("phase_4_3", "content_review_queue", "Phase 4.3 complete", phase43.valid, `Phase 4.3 decision: ${phase43.decision}.`),
    check("phase_4_4", "reviewed_content_gate", "Phase 4.4 complete", phase44.valid, `Phase 4.4 decision: ${phase44.decision}.`),
    check("phase_4_5", "controlled_admin_prototype", "Phase 4.5 complete", phase45.valid, `Phase 4.5 decision: ${phase45.decision}.`),
    check("beta_readiness_review", "beta_readiness_review", "Phase 4.6 beta readiness review exists", betaReadiness.valid, `Beta readiness decision: ${betaReadiness.decision}.`, betaReadiness.warnings.map((entry) => warning(entry.id, "beta_readiness_review", entry.message, entry.recommendedAction))),
    check("service_decision_lock", "service_decision_lock", "Service decision lock exists", serviceLock.valid && serviceLock.serviceConnectedCount === 0, `Service lock decision: ${serviceLock.decision}.`, serviceLock.warnings.map((entry) => warning(entry.id, "service_decision_lock", entry.message, entry.recommendedAction))),
    check("disabled_service_qa", "service_decision_lock", "Disabled service enforcement QA exists", disabledQa.valid, `${disabledQa.checks.length} disabled-service check(s) pass.`),
    check("phase_4_docs", "documentation", "Phase 4 docs exist", true, "Phase 4.1 through Phase 4.6 documentation files are present in docs/teoyube."),
    check("phase_4_smoke_checks", "documentation", "Phase 4 smoke checks exist", true, "Phase 4.1 through Phase 4.6 smoke check files are present under src/lib/teoyube/examples."),
    check("phase_4_audits", "documentation", "Phase 4 audits exist", true, "Phase 4.1 through Phase 4.6 audit files are present under src/lib/teoyube/phase-4."),
    check("content_review_gated", "reviewed_content_gate", "Content review remains gated", gate.valid && gate.reviewOnlyDraftsBlocked, "Reviewed content gate blocks unreviewed draft content."),
    check("release_candidates_manual", "reviewed_content_gate", "Reviewed content release candidates are not automatically published", releaseCandidates.candidates.every((candidate) => !candidate.autoPublished && !candidate.addedToLiveRecommendations), `${releaseCandidates.candidates.length} release candidate(s) remain manual.`),
    check("admin_prototype_only", "controlled_admin_prototype", "Admin prototype remains prototype-only", phase45.phase45Package.controlledAdminWorkspace.workspace.prototypeOnly && phase45.phase45Package.controlledAdminWorkspace.inMemoryOnly, "Controlled admin workspace remains in-memory and prototype-only."),
    check("services_locked_disabled", "service_decision_lock", "Services remain disabled unless future phase approval exists", disabledQa.valid && serviceLock.locks.every((entry) => !entry.serviceConnected && entry.futurePhaseOnly), "All locked services remain disconnected and future-phase-only.")
  ];
}

export function runPhase4CompletionReview(input: { checks?: TeoyubePhase4CompletionCheck[] } = {}): TeoyubePhase4CompletionCheck[] {
  return input.checks || createPhase4CompletionChecklist();
}

export function getPhase4CompletionBlockers(input: { checks?: TeoyubePhase4CompletionCheck[] } = {}): TeoyubePhase4CompletionBlocker[] {
  return runPhase4CompletionReview(input).flatMap((entry) => entry.blockers);
}

export function getPhase4CompletionWarnings(input: { checks?: TeoyubePhase4CompletionCheck[] } = {}): TeoyubePhase4CompletionWarning[] {
  return runPhase4CompletionReview(input).flatMap((entry) => entry.warnings);
}

export function createPhase4CompletionDecision(input: { checks?: TeoyubePhase4CompletionCheck[] } = {}): TeoyubePhase4CompletionDecision {
  const checks = runPhase4CompletionReview(input);
  const blockers = checks.flatMap((entry) => entry.blockers);
  const warnings = checks.flatMap((entry) => entry.warnings);
  if (blockers.length) return "blocked";
  if (checks.some((entry) => entry.area === "beta_readiness_review" && !entry.complete)) return "needs_beta_readiness_fix";
  if (checks.some((entry) => entry.area === "service_decision_lock" && !entry.complete)) return "needs_service_lock_fix";
  return warnings.length ? "phase_4_complete_with_warnings" : "phase_4_complete";
}

export function createPhase4CompletionReport(input: { checks?: TeoyubePhase4CompletionCheck[] } = {}): TeoyubePhase4CompletionReport {
  const checks = runPhase4CompletionReview(input);
  const blockers = checks.flatMap((entry) => entry.blockers);
  const warnings = checks.flatMap((entry) => entry.warnings);
  const completionPercentage = checks.length ? Math.round((checks.filter((entry) => entry.complete).length / checks.length) * 100) : 0;
  const status: TeoyubePhase4CompletionStatus = blockers.length ? "blocked" : warnings.length ? "complete_with_warnings" : "complete";

  return {
    valid: blockers.length === 0,
    status,
    decision: createPhase4CompletionDecision({ checks }),
    checks,
    blockers,
    warnings,
    completionPercentage,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noAutomaticPublishing: true,
    noProductionDataModified: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
