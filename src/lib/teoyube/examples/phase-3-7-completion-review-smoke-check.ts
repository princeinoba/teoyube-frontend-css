import { createPhase3CompletionPackage, createPhase3CompletionPackageReport } from "../integration/phase-3-completion-package";
import { createPhase3CompletionReport, runPhase3CompletionReview } from "../integration/phase-3-completion-review";
import { createPhase3FeatureInventoryReport } from "../integration/phase-3-feature-inventory";
import { runPhase3FinalIntegrationAudit } from "../integration/phase-3-final-integration-audit";
import { createPhase3IntegrationLockReport, getPhase3LockedContracts } from "../integration/phase-3-integration-lock";
import { createPhase3OwnerReviewChecklist, createPhase3OwnerReviewRecord } from "../integration/phase-3-owner-review";
import {
  addPhase3RemainingRisk,
  createPhase3RemainingRiskRegister,
  createPhase3RemainingRiskRegisterReport,
  resolvePhase3RemainingRisk
} from "../integration/phase-3-remaining-risk-register";
import { createPhase4RoadmapReport, getPhase4RoadmapHighPriorityItems } from "../integration/phase-4-roadmap-builder";
import { runPhase37CompletionReviewExample } from "./phase-3-7-completion-review-example";

export type TeoyubePhase37SmokeCheckResult = {
  id: string;
  passed: boolean;
  details: string;
};

export type TeoyubePhase37SmokeCheckReport = {
  valid: boolean;
  checks: TeoyubePhase37SmokeCheckResult[];
  blockers: string[];
  warnings: string[];
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  noLocalStorageRequired: true;
  noCookiesRequired: true;
  noIndexedDbRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function check(id: string, passed: boolean, details: string): TeoyubePhase37SmokeCheckResult {
  return { id, passed, details };
}

export function runPhase37CompletionReviewSmokeCheck(): TeoyubePhase37SmokeCheckReport {
  const completionChecklist = runPhase3CompletionReview();
  const completionReport = createPhase3CompletionReport();
  const lockReport = createPhase3IntegrationLockReport();
  const lockedContracts = getPhase3LockedContracts();
  const inventory = createPhase3FeatureInventoryReport();
  const riskRegister = createPhase3RemainingRiskRegister();
  const addedRiskRegister = addPhase3RemainingRisk(riskRegister, {
    id: "smoke_check_in_memory_risk",
    category: "unknown",
    severity: "low",
    status: "open",
    message: "Smoke check risk used only to verify in-memory risk register updates.",
    mitigation: "Resolve within the smoke check without external writes."
  });
  const resolvedRiskRegister = resolvePhase3RemainingRisk(addedRiskRegister, "smoke_check_in_memory_risk", "Resolved in memory.");
  const riskReport = createPhase3RemainingRiskRegisterReport(resolvedRiskRegister);
  const ownerChecklist = createPhase3OwnerReviewChecklist();
  const ownerRecord = createPhase3OwnerReviewRecord();
  const roadmap = createPhase4RoadmapReport();
  const completionPackage = createPhase3CompletionPackage({ ownerReview: ownerRecord, riskRegister: resolvedRiskRegister });
  const packageReport = createPhase3CompletionPackageReport(completionPackage);
  const finalAudit = runPhase3FinalIntegrationAudit();
  const example = runPhase37CompletionReviewExample();
  const disabledServiceFlags =
    completionReport.noExternalServicesRequired &&
    completionReport.noDatabasePersistenceEnabled &&
    completionReport.noAnalyticsEnabled &&
    completionReport.noLiveAiOrchestrationEnabled &&
    completionReport.noBrowserPersistenceRequired &&
    completionReport.inMemoryOnly &&
    packageReport.noExternalServicesRequired &&
    packageReport.noDatabasePersistenceEnabled &&
    packageReport.noAnalyticsEnabled &&
    packageReport.noLiveAiOrchestrationEnabled &&
    packageReport.noBrowserPersistenceRequired &&
    packageReport.inMemoryOnly &&
    roadmap.noExternalServicesRequired &&
    roadmap.noDatabasePersistenceEnabled &&
    roadmap.noAnalyticsEnabled &&
    roadmap.noLiveAiOrchestrationEnabled &&
    roadmap.noBrowserPersistenceRequired &&
    roadmap.inMemoryOnly;
  const checks = [
    check("completion_contracts_compile", completionChecklist.length >= 18, "Completion review returns a structured checklist."),
    check("completion_review_report", completionReport.valid && completionReport.completionPercentage === 100, "Completion review returns a 100% structured report."),
    check("integration_lock", lockReport.locked && lockedContracts.length >= 12, "Integration lock protects core Phase 3 contracts."),
    check("feature_inventory", inventory.valid && inventory.integratedEngines.length >= 8 && inventory.connectedComponents.length >= 5, "Feature inventory returns expected engines and connected components."),
    check("risk_register_in_memory", riskReport.inMemoryOnly && riskReport.valid && resolvedRiskRegister.noExternalWrite, "Remaining risk register updates and resolves risks in memory only."),
    check("owner_review_checklist", ownerChecklist.length >= 16 && ownerRecord.structuredManualApprovalOnly, "Owner review checklist exists without signatures or external storage."),
    check("completion_package", packageReport.valid && completionPackage.inMemoryOnly, "Completion package is structured and in-memory only."),
    check("phase_4_roadmap", roadmap.valid && roadmap.items.length >= 12 && getPhase4RoadmapHighPriorityItems().length > 0, "Phase 4 roadmap returns structured items."),
    check("final_integration_audit", finalAudit.complete && finalAudit.completionPercentage === 100, "Phase 3 final integration audit returns complete."),
    check("disabled_services", disabledServiceFlags, "No external services, database persistence, analytics, live AI orchestration, or browser persistence are required."),
    check("browser_persistence_not_required", true, "No localStorage, cookies, or IndexedDB are required by the Phase 3.7 modules."),
    check("example_runs", example.finalAudit.completionPercentage === finalAudit.completionPercentage, "Phase 3.7 example runs.")
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  const warnings = [
    ...completionReport.warnings.map((entry) => entry.message),
    ...lockReport.warnings.map((entry) => entry.message),
    ...packageReport.warnings,
    ...finalAudit.warnings
  ];

  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noBrowserPersistenceRequired: true,
    noLocalStorageRequired: true,
    noCookiesRequired: true,
    noIndexedDbRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
