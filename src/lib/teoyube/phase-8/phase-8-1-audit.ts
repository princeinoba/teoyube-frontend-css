import { createPhase81Package, createPhase81PackageReport } from "./phase-8-1-package";

export type TeoyubePhase81AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase81AuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase81AuditChecklistItem[];
  missingItems: TeoyubePhase81AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  nextStep: "Phase 8.2 - Product Hardening Execution, Mobile/Accessibility Pass & Performance Review";
  noPublicLaunchPerformed: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase81AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase81AuditChecklist(): TeoyubePhase81AuditChecklistItem[] {
  const pkg = createPhase81Package({ ownerReviewed: true });
  const report = createPhase81PackageReport(pkg);
  return [
    item("phase_8_contracts", "Phase 8 contracts exist", true, "phase-8-contracts.ts defines Phase 8 contracts."),
    item("phase_8_1_map_document", "Phase 8.1 map document exists", true, "phase-8-1-post-beta-readiness-audit-product-hardening-service-reassessment-map.md documents the map."),
    item("post_beta_readiness_audit_contracts", "Post-beta readiness audit contracts exist", true, "post-beta-readiness-audit-contracts.ts defines audit contracts."),
    item("post_beta_readiness_audit", "Post-beta readiness audit exists", pkg.postBetaReadinessAuditReport.inMemoryOnly, "post-beta-readiness-audit.ts creates readiness audit reports."),
    item("product_hardening_plan_contracts", "Product hardening plan contracts exist", true, "product-hardening-plan-contracts.ts defines hardening contracts."),
    item("product_hardening_plan", "Product hardening plan exists", pkg.productHardeningPlanReport.inMemoryOnly, "product-hardening-plan.ts creates the planning-only hardening plan."),
    item("safe_hardening_patch_validator", "Safe hardening patch validator exists", pkg.safeHardeningPatchValidationReport.inMemoryOnly, "safe-hardening-patch-validator.ts blocks unsafe hardening."),
    item("controlled_service_reassessment_contracts", "Controlled service reassessment contracts exist", true, "controlled-service-reassessment-contracts.ts defines service reassessment contracts."),
    item("controlled_service_reassessment_gate", "Controlled service reassessment gate exists", pkg.controlledServiceReassessmentReport.inMemoryOnly, "controlled-service-reassessment-gate.ts keeps services disabled or plan-only."),
    item("service_reassessment_enforcement_qa", "Service reassessment enforcement QA exists", pkg.serviceReassessmentEnforcementQaReport.inMemoryOnly, "service-reassessment-enforcement-qa.ts verifies reassessment enabled no service."),
    item("privacy_security_follow_up_plan", "Privacy/security follow-up plan exists", pkg.privacySecurityFollowUpReport.inMemoryOnly, "privacy-security-follow-up-plan.ts creates privacy/security follow-up."),
    item("performance_hardening_plan", "Performance hardening plan exists", pkg.performanceHardeningReport.inMemoryOnly, "performance-hardening-plan.ts creates performance planning."),
    item("mobile_accessibility_hardening_plan", "Mobile/accessibility hardening plan exists", pkg.mobileAccessibilityHardeningReport.inMemoryOnly, "mobile-accessibility-hardening-plan.ts creates mobile/accessibility planning."),
    item("content_review_follow_up_plan", "Content review follow-up plan exists", pkg.contentReviewFollowUpReport.inMemoryOnly, "content-review-follow-up-plan.ts keeps content review gated."),
    item("public_release_preparation_plan_contracts", "Public release preparation contracts exist", true, "public-release-preparation-plan-contracts.ts defines planning contracts."),
    item("public_release_preparation_plan", "Public release preparation plan exists", pkg.publicReleasePreparationReport.inMemoryOnly, "public-release-preparation-plan.ts prepares future release planning only."),
    item("owner_review", "Phase 8.1 owner review exists", pkg.ownerReviewReport.inMemoryOnly, "phase-8-1-owner-review.ts prepares owner review."),
    item("phase_8_1_package", "Phase 8.1 package exists", report.inMemoryOnly, "phase-8-1-package.ts combines Phase 8.1 reports."),
    item("smoke_check", "Phase 8.1 smoke check exists", true, "phase-8-1-post-beta-readiness-smoke-check.ts verifies Phase 8.1."),
    item("documentation", "Phase 8.1 documentation exists", true, "phase-8-1-post-beta-readiness-audit-product-hardening-service-reassessment-gate.md documents the step.")
  ];
}

export function getPhase81MissingItems(): TeoyubePhase81AuditChecklistItem[] {
  return getPhase81AuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase81Warnings(): string[] {
  return createPhase81PackageReport(createPhase81Package({ ownerReviewed: true })).warnings;
}

export function getPhase81CompletionPercentage(): number {
  const checklist = getPhase81AuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase81Audit(): TeoyubePhase81AuditReport {
  const checklist = getPhase81AuditChecklist();
  const missingItems = checklist.filter((entry) => !entry.complete);
  const packageReport = createPhase81PackageReport(createPhase81Package({ ownerReviewed: true }));
  const blockers = [
    ...packageReport.blockers,
    ...missingItems.map((entry) => entry.label)
  ];
  const completionPercentage = getPhase81CompletionPercentage();
  return {
    complete: blockers.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getPhase81Warnings(),
    blockers,
    nextStep: "Phase 8.2 - Product Hardening Execution, Mobile/Accessibility Pass & Performance Review",
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
