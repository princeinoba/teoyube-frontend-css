import {
  createRealAppVerificationPackage,
  createRealAppVerificationPackageReport,
  type TeoyubeRealAppVerificationPackage
} from "./real-app-verification-package";
import {
  createPhase102OwnerReviewRecord,
  createPhase102OwnerReviewReport,
  type TeoyubePhase102OwnerReviewRecord
} from "./phase-10-2-owner-review";

export type TeoyubePhase102Package = {
  id: string;
  realAppVerificationPackage: TeoyubeRealAppVerificationPackage;
  realAppVerificationPackageReport: ReturnType<typeof createRealAppVerificationPackageReport>;
  ownerReview: ReturnType<typeof createPhase102OwnerReviewReport>;
  blockers: string[];
  warnings: string[];
  commandResults: TeoyubeRealAppVerificationPackage["commandResults"];
  nextActionRecommendation: "Fix the remaining build/runtime blockers before moving to Phase 10.3.";
  noPublicLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubePhase102PackageDecision = "blocked_by_real_app_build_runtime" | "ready_for_phase_10_3" | "ready_with_warnings" | "needs_owner_review";

export function createPhase102Package(input: { ownerReviewed?: boolean; ownerReview?: TeoyubePhase102OwnerReviewRecord } = {}): TeoyubePhase102Package {
  const realAppVerificationPackage = createRealAppVerificationPackage();
  const realAppVerificationPackageReport = createRealAppVerificationPackageReport(realAppVerificationPackage);
  const ownerReview = createPhase102OwnerReviewReport(input.ownerReview || createPhase102OwnerReviewRecord({
    reviewed: input.ownerReviewed ?? true,
    nextPhase10StepAccepted: false,
    notes: ["Phase 10.2 owner review records that Phase 10.3 is blocked until build/runtime dependencies are fixed."]
  }));
  const blockers = [...realAppVerificationPackageReport.blockers, ...ownerReview.blockers];
  const warnings = [...realAppVerificationPackageReport.warnings, ...ownerReview.warnings];
  return {
    id: "phase_10_2_package",
    realAppVerificationPackage,
    realAppVerificationPackageReport,
    ownerReview,
    blockers,
    warnings,
    commandResults: realAppVerificationPackage.commandResults,
    nextActionRecommendation: "Fix the remaining build/runtime blockers before moving to Phase 10.3.",
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}

export function getPhase102PackageBlockers(pkg: TeoyubePhase102Package): string[] {
  return pkg.blockers;
}

export function getPhase102PackageWarnings(pkg: TeoyubePhase102Package): string[] {
  return pkg.warnings;
}

export function createPhase102PackageDecision(pkg: TeoyubePhase102Package): TeoyubePhase102PackageDecision {
  if (pkg.ownerReview.decision === "needs_owner_review") return "needs_owner_review";
  if (pkg.blockers.length) return "blocked_by_real_app_build_runtime";
  return pkg.warnings.length ? "ready_with_warnings" : "ready_for_phase_10_3";
}

export function validatePhase102Package(pkg: TeoyubePhase102Package): boolean {
  return getPhase102PackageBlockers(pkg).length === 0;
}

export function createPhase102PackageReport(pkg: TeoyubePhase102Package) {
  return {
    valid: validatePhase102Package(pkg),
    decision: createPhase102PackageDecision(pkg),
    package: pkg,
    blockers: getPhase102PackageBlockers(pkg),
    warnings: getPhase102PackageWarnings(pkg),
    commandResults: pkg.commandResults,
    nextActionRecommendation: pkg.nextActionRecommendation,
    noExternalSend: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
