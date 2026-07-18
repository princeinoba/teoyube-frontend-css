import { createPhase41Package, createPhase41PackageReport } from "./phase-4-1-package";

export type TeoyubePhase41AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase41AuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase41AuditChecklistItem[];
  missingItems: TeoyubePhase41AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  nextStep: "Phase 4.2 - Product Surface Polish, Content Expansion Backlog & Admin Workflow Design";
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase41AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase41AuditChecklist(): TeoyubePhase41AuditChecklistItem[] {
  const phase41Package = createPhase41Package();
  const report = createPhase41PackageReport(phase41Package);
  return [
    item("phase_4_contracts", "Phase 4 contracts exist", true, "phase-4-contracts.ts defines Phase 4 audit, backlog, risk, and decision contracts."),
    item("product_experience_audit", "Product experience audit exists", phase41Package.productExperienceAudit.checks.length >= 10, "product-experience-audit.ts audits real journey/product surfaces."),
    item("content_depth_map", "Content depth map exists", phase41Package.contentDepthMap.sections.length >= 7, "content-depth-map.ts maps vocabulary, promises, Scripture, prayer, calling, actions, and TIG relationships."),
    item("scripture_promise_coverage_audit", "Scripture/Promise coverage audit exists", phase41Package.scripturePromiseCoverageAudit.noUnsupportedAnchorsInvented, "scripture-promise-coverage-audit.ts flags missing support without inventing anchors."),
    item("product_surface_depth_audit", "Product surface depth audit exists", phase41Package.productSurfaceDepthAudit.checks.length >= 7, "product-surface-depth-audit.ts audits WordCard, PrayerCompanion, CompassExperience, TIG, Promise Table, and Canon surfaces."),
    item("phase_4_product_backlog", "Phase 4 product backlog exists", phase41Package.productBacklog.items.length >= 12, "phase-4-product-backlog.ts creates prioritized UI, content, service decision, admin workflow, and beta items."),
    item("controlled_service_decision_contracts", "Controlled service decision contracts exist", true, "controlled-service-decision-contracts.ts defines plan-only future service decisions."),
    item("controlled_service_decision_plan", "Controlled service decision plan exists", phase41Package.controlledServiceDecisionPlan.noServicesConnected, "controlled-service-decision-plan.ts keeps future services disconnected."),
    item("phase_4_risk_register", "Phase 4 risk register exists", phase41Package.riskRegisterReport.inMemoryOnly, "phase-4-risk-register.ts records manual risks in memory only."),
    item("owner_review", "Owner review exists", phase41Package.ownerReviewReport.record.checklist.length >= 8, "phase-4-1-owner-review.ts prepares structured manual owner review."),
    item("phase_4_1_package", "Phase 4.1 package exists", report.valid, `Phase 4.1 package decision: ${report.decision}.`),
    item("smoke_check", "Phase 4.1 smoke check exists", true, "phase-4-1-product-experience-audit-smoke-check.ts verifies Phase 4.1 modules."),
    item("documentation", "Phase 4.1 documentation exists", true, "docs/teoyube/phase-4-1-product-experience-audit-content-depth-controlled-service-decision-plan.md documents this step.")
  ];
}

export function getPhase41MissingItems(): TeoyubePhase41AuditChecklistItem[] {
  return getPhase41AuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase41Warnings(): string[] {
  return createPhase41PackageReport(createPhase41Package()).warnings;
}

export function getPhase41CompletionPercentage(): number {
  const checklist = getPhase41AuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase41Audit(): TeoyubePhase41AuditReport {
  const checklist = getPhase41AuditChecklist();
  const missingItems = checklist.filter((entry) => !entry.complete);
  const packageReport = createPhase41PackageReport(createPhase41Package());
  const blockers = [
    ...packageReport.blockers,
    ...missingItems.map((entry) => entry.label)
  ];
  const completionPercentage = getPhase41CompletionPercentage();
  return {
    complete: blockers.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getPhase41Warnings(),
    blockers,
    nextStep: "Phase 4.2 - Product Surface Polish, Content Expansion Backlog & Admin Workflow Design",
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
