import { createFinalControlledServiceDecisionLockReport } from "./final-controlled-service-decision-lock";
import { createFinalPrivacySecurityLockReport } from "./final-privacy-security-lock";
import { createFinalPublicReadinessReport } from "./final-public-readiness-review";
import { createFinalPublicReleaseBoundaryLockReport } from "./final-public-release-boundary-lock";
import type {
  TeoyubePhase8CompletionDecision,
  TeoyubePhase8CompletionPackage
} from "./phase-8-completion-contracts";
import { createPhase8CompletionReport } from "./phase-8-completion-review";
import { createPhase8EvidenceArchiveReport } from "./phase-8-evidence-archive";
import { createPhase8FeatureInventoryReport } from "./phase-8-feature-inventory";
import {
  createPhase8OwnerCompletionReviewRecord,
  createPhase8OwnerCompletionReviewReport,
  type TeoyubePhase8OwnerCompletionReviewRecord
} from "./phase-8-owner-completion-review";
import {
  createPhase8RemainingRiskRegister,
  createPhase8RemainingRiskRegisterReport,
  type TeoyubePhase8RemainingRiskRegister
} from "./phase-8-remaining-risk-register";
import { createPhase9RoadmapReport } from "./phase-9-roadmap-builder";
import { createPublicReleaseCandidateReport } from "./public-release-candidate-planner";

export type TeoyubePhase8CompletionPackageReport = {
  valid: boolean;
  decision: TeoyubePhase8CompletionDecision;
  package: TeoyubePhase8CompletionPackage;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 9.1 - Controlled Public Release Preparation Plan, Final Copy Review & Owner Approval Gate";
  noExternalSend: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function collect(entries: Array<string | { message?: string; details?: string }>): string[] {
  return entries.map((entry) => typeof entry === "string" ? entry : entry.message || entry.details || "Phase 8 package item needs attention.");
}

function decisionFromBlockers(blockers: string[], warnings: string[]): TeoyubePhase8CompletionDecision {
  if (blockers.length) return "blocked";
  return warnings.length ? "phase_8_complete_with_warnings" : "phase_8_complete";
}

export function createPhase8CompletionPackage(input: {
  ownerReviewed?: boolean;
  ownerReview?: TeoyubePhase8OwnerCompletionReviewRecord;
  remainingRiskRegister?: TeoyubePhase8RemainingRiskRegister;
} = {}): TeoyubePhase8CompletionPackage {
  const ownerReviewed = input.ownerReviewed ?? true;
  const publicReleaseCandidateReport = createPublicReleaseCandidateReport({ ownerReviewPathExists: true });
  const finalPublicReadinessReport = createFinalPublicReadinessReport({ ownerReviewPathExists: true });
  const finalPrivacySecurityLockReport = createFinalPrivacySecurityLockReport();
  const finalServiceDecisionLockReport = createFinalControlledServiceDecisionLockReport();
  const finalPublicReleaseBoundaryLockReport = createFinalPublicReleaseBoundaryLockReport();
  const phase8CompletionReview = createPhase8CompletionReport({ ownerReviewComplete: ownerReviewed });
  const phase8EvidenceArchive = createPhase8EvidenceArchiveReport();
  const phase8FeatureInventory = createPhase8FeatureInventoryReport();
  const phase8RemainingRiskRegister = input.remainingRiskRegister || createPhase8RemainingRiskRegister();
  const phase8RemainingRiskRegisterReport = createPhase8RemainingRiskRegisterReport(phase8RemainingRiskRegister);
  const ownerCompletionReview = createPhase8OwnerCompletionReviewReport(input.ownerReview || createPhase8OwnerCompletionReviewRecord({
    reviewed: ownerReviewed,
    phase8MayBeMarkedComplete: ownerReviewed,
    notes: ["Phase 8 completion package generated for final owner review and Phase 9 planning."]
  }));
  const phase9Roadmap = createPhase9RoadmapReport();

  const blockers = [
    ...collect(publicReleaseCandidateReport.blockers),
    ...collect(finalPublicReadinessReport.blockers),
    ...finalPrivacySecurityLockReport.blockers,
    ...finalServiceDecisionLockReport.blockers,
    ...finalPublicReleaseBoundaryLockReport.blockers,
    ...collect(phase8CompletionReview.blockers),
    ...phase8EvidenceArchive.gaps,
    ...ownerCompletionReview.blockers,
    ...phase9Roadmap.blockers
  ];
  const warnings = [
    ...collect(publicReleaseCandidateReport.warnings),
    ...collect(finalPublicReadinessReport.warnings),
    ...finalPrivacySecurityLockReport.warnings,
    ...finalServiceDecisionLockReport.warnings,
    ...finalPublicReleaseBoundaryLockReport.warnings,
    ...collect(phase8CompletionReview.warnings),
    ...phase8EvidenceArchive.warnings,
    ...phase8FeatureInventory.warnings,
    ...phase8RemainingRiskRegisterReport.warnings,
    ...ownerCompletionReview.warnings,
    ...phase9Roadmap.warnings
  ];

  return {
    id: "phase_8_completion_package",
    publicReleaseCandidateReport,
    finalPublicReadinessReport,
    finalPrivacySecurityLockReport,
    finalServiceDecisionLockReport,
    finalPublicReleaseBoundaryLockReport,
    phase8CompletionReview,
    phase8EvidenceArchive,
    phase8FeatureInventory,
    phase8RemainingRiskRegister: phase8RemainingRiskRegisterReport,
    ownerCompletionReview,
    phase9Roadmap,
    completionReport: phase8CompletionReview,
    remainingRisks: phase8RemainingRiskRegister.risks,
    phase9RoadmapItems: phase9Roadmap.items,
    nextActionRecommendation: "Phase 9.1 - Controlled Public Release Preparation Plan, Final Copy Review & Owner Approval Gate",
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

export function getPhase8CompletionPackageBlockers(pkg: TeoyubePhase8CompletionPackage): string[] {
  return pkg.blockers;
}

export function getPhase8CompletionPackageWarnings(pkg: TeoyubePhase8CompletionPackage): string[] {
  return pkg.warnings;
}

export function createPhase8CompletionPackageDecision(pkg: TeoyubePhase8CompletionPackage): TeoyubePhase8CompletionDecision {
  if (pkg.blockers.length) return "blocked";
  if (pkg.completionReport.decision === "needs_owner_review") return "needs_owner_review";
  return decisionFromBlockers(pkg.blockers, pkg.warnings);
}

export function validatePhase8CompletionPackage(pkg: TeoyubePhase8CompletionPackage): TeoyubePhase8CompletionPackageReport {
  return createPhase8CompletionPackageReport(pkg);
}

export function createPhase8CompletionPackageReport(pkg: TeoyubePhase8CompletionPackage): TeoyubePhase8CompletionPackageReport {
  const blockers = getPhase8CompletionPackageBlockers(pkg);
  return {
    valid: blockers.length === 0,
    decision: createPhase8CompletionPackageDecision(pkg),
    package: pkg,
    blockers,
    warnings: getPhase8CompletionPackageWarnings(pkg),
    nextActionRecommendation: "Phase 9.1 - Controlled Public Release Preparation Plan, Final Copy Review & Owner Approval Gate",
    noExternalSend: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
