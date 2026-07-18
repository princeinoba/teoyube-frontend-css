import type {
  TeoyubePhase9CompletionDecision,
  TeoyubePhase9CompletionPackage
} from "./phase-9-completion-contracts";
import { createPhase9CompletionReport } from "./phase-9-completion-review";
import { createPhase9EvidenceArchiveReport } from "./phase-9-evidence-archive";
import { createPhase9FeatureInventoryReport } from "./phase-9-feature-inventory";
import {
  createPhase9OwnerCompletionReviewRecord,
  createPhase9OwnerCompletionReviewReport,
  type TeoyubePhase9OwnerCompletionReviewRecord
} from "./phase-9-owner-completion-review";
import {
  createPhase9RemainingRiskRegister,
  createPhase9RemainingRiskRegisterReport,
  type TeoyubePhase9RemainingRiskRegister
} from "./phase-9-remaining-risk-register";
import { createPhase10RoadmapReport } from "./phase-10-roadmap-builder";
import { createFinalPhase9ServiceDisabledLockReport } from "./final-phase-9-service-disabled-lock";
import { createPublicReadinessLockReport } from "./public-readiness-lock";

export type TeoyubePhase9CompletionPackageReport = {
  valid: boolean;
  decision: TeoyubePhase9CompletionDecision;
  package: TeoyubePhase9CompletionPackage;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 10.1 - Controlled Public Release Execution Plan, Manual Launch Checklist & Monitoring Boundaries";
  noExternalSend: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function collect(entries: Array<string | { message?: string; details?: string }>): string[] {
  return entries.map((entry) => typeof entry === "string" ? entry : entry.message || entry.details || "Phase 9 package item needs attention.");
}

function decisionFromBlockers(blockers: string[], warnings: string[]): TeoyubePhase9CompletionDecision {
  if (blockers.length) return "blocked";
  return warnings.length ? "phase_9_complete_with_warnings" : "phase_9_complete";
}

export function createPhase9CompletionPackage(input: {
  ownerReviewed?: boolean;
  ownerReview?: TeoyubePhase9OwnerCompletionReviewRecord;
  remainingRiskRegister?: TeoyubePhase9RemainingRiskRegister;
} = {}): TeoyubePhase9CompletionPackage {
  const ownerReviewed = input.ownerReviewed ?? true;
  const phase9CompletionReview = createPhase9CompletionReport({ ownerReviewComplete: ownerReviewed });
  const publicReadinessLockReport = createPublicReadinessLockReport();
  const finalServiceDisabledLockReport = createFinalPhase9ServiceDisabledLockReport();
  const phase9EvidenceArchive = createPhase9EvidenceArchiveReport();
  const phase9FeatureInventory = createPhase9FeatureInventoryReport();
  const phase9RemainingRiskRegister = input.remainingRiskRegister || createPhase9RemainingRiskRegister();
  const phase9RemainingRiskRegisterReport = createPhase9RemainingRiskRegisterReport(phase9RemainingRiskRegister);
  const ownerCompletionReview = createPhase9OwnerCompletionReviewReport(input.ownerReview || createPhase9OwnerCompletionReviewRecord({
    reviewed: ownerReviewed,
    phase9MayBeMarkedComplete: ownerReviewed,
    notes: ["Phase 9 completion package generated for Phase 10 planning."]
  }));
  const phase10Roadmap = createPhase10RoadmapReport();
  const blockers = [
    ...collect(phase9CompletionReview.blockers),
    ...collect(publicReadinessLockReport.blockers),
    ...finalServiceDisabledLockReport.blockers,
    ...phase9EvidenceArchive.gaps,
    ...phase9RemainingRiskRegisterReport.blockers,
    ...ownerCompletionReview.blockers,
    ...phase10Roadmap.blockers
  ];
  const warnings = [
    ...collect(phase9CompletionReview.warnings),
    ...collect(publicReadinessLockReport.warnings),
    ...finalServiceDisabledLockReport.warnings,
    ...phase9EvidenceArchive.warnings,
    ...phase9FeatureInventory.warnings,
    ...phase9RemainingRiskRegisterReport.warnings,
    ...ownerCompletionReview.warnings,
    ...phase10Roadmap.warnings
  ];
  return {
    id: "phase_9_completion_package",
    phase9CompletionReview,
    publicReadinessLockReport,
    finalServiceDisabledLockReport,
    phase9EvidenceArchive,
    phase9FeatureInventory,
    phase9RemainingRiskRegister: phase9RemainingRiskRegisterReport,
    ownerCompletionReview,
    phase10Roadmap,
    completionReport: phase9CompletionReview,
    remainingRisks: phase9RemainingRiskRegister.risks,
    phase10RoadmapItems: phase10Roadmap.items,
    nextActionRecommendation: "Phase 10.1 - Controlled Public Release Execution Plan, Manual Launch Checklist & Monitoring Boundaries",
    blockers,
    warnings,
    noExternalSend: true,
    noPublicLaunchPerformed: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}

export function getPhase9CompletionPackageBlockers(pkg: TeoyubePhase9CompletionPackage): string[] {
  return pkg.blockers;
}

export function getPhase9CompletionPackageWarnings(pkg: TeoyubePhase9CompletionPackage): string[] {
  return pkg.warnings;
}

export function createPhase9CompletionPackageDecision(pkg: TeoyubePhase9CompletionPackage): TeoyubePhase9CompletionDecision {
  if (pkg.blockers.length) return "blocked";
  if (pkg.completionReport.decision === "needs_owner_review") return "needs_owner_review";
  return decisionFromBlockers(pkg.blockers, pkg.warnings);
}

export function validatePhase9CompletionPackage(pkg: TeoyubePhase9CompletionPackage): TeoyubePhase9CompletionPackageReport {
  return createPhase9CompletionPackageReport(pkg);
}

export function createPhase9CompletionPackageReport(pkg: TeoyubePhase9CompletionPackage): TeoyubePhase9CompletionPackageReport {
  const blockers = getPhase9CompletionPackageBlockers(pkg);
  return {
    valid: blockers.length === 0,
    decision: createPhase9CompletionPackageDecision(pkg),
    package: pkg,
    blockers,
    warnings: getPhase9CompletionPackageWarnings(pkg),
    nextActionRecommendation: "Phase 10.1 - Controlled Public Release Execution Plan, Manual Launch Checklist & Monitoring Boundaries",
    noExternalSend: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
