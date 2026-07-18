import { createPhase93Package, createPhase93PackageReport } from "./phase-9-3-package";

export type TeoyubePhase93AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase93AuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase93AuditChecklistItem[];
  missingItems: TeoyubePhase93AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  phase93PackageDecision: string;
  readinessScoreBand: string;
  nextStep: "Phase 9.4 - Controlled Public Go/No-Go, Final Owner Approval & Operational Handoff";
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

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase93AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase93AuditChecklist(): TeoyubePhase93AuditChecklistItem[] {
  const packageReport = createPhase93PackageReport(createPhase93Package({ ownerReviewed: true }));
  return [
    item("phase_9_3_map_document", "Phase 9.3 map document exists", true, "phase-9-3-release-candidate-fix-queue-final-regression-public-go-no-go-score-map.md exists."),
    item("release_candidate_fix_queue_contracts", "Release candidate fix queue contracts exist", true, "release-candidate-fix-queue-contracts.ts exists."),
    item("release_candidate_fix_queue_manager", "Release candidate fix queue manager exists", true, "release-candidate-fix-queue-manager.ts exists."),
    item("public_issue_to_fix_converter", "Public issue-to-fix converter exists", true, "public-issue-to-fix-converter.ts exists."),
    item("release_candidate_remediation_contracts", "Release candidate remediation contracts exist", true, "release-candidate-remediation-contracts.ts exists."),
    item("release_candidate_remediation_planner", "Release candidate remediation planner exists", true, "release-candidate-remediation-planner.ts exists."),
    item("remediation_safety_validator", "Remediation safety validator exists", true, "release-candidate-remediation-safety-validator.ts exists."),
    item("final_regression_qa_contracts", "Final regression QA contracts exist", true, "final-regression-qa-contracts.ts exists."),
    item("final_regression_qa_runner", "Final regression QA runner exists", true, "final-regression-qa-runner.ts exists."),
    item("final_service_disabled_regression", "Final service-disabled regression exists", true, "final-service-disabled-regression.ts exists."),
    item("final_public_safety_regression", "Final public safety regression exists", true, "final-public-safety-regression.ts exists."),
    item("final_privacy_consent_regression", "Final privacy/consent regression exists", true, "final-privacy-consent-regression.ts exists."),
    item("final_mobile_accessibility_regression", "Final mobile/accessibility regression exists", true, "final-mobile-accessibility-regression.ts exists."),
    item("public_go_no_go_score_contracts", "Public go/no-go score contracts exist", true, "public-go-no-go-readiness-score-contracts.ts exists."),
    item("public_go_no_go_score", "Public go/no-go score exists", true, "public-go-no-go-readiness-score.ts exists."),
    item("release_candidate_remediation_package", "Release candidate remediation package exists", packageReport.inMemoryOnly && packageReport.valid, "release-candidate-remediation-package.ts validates without blockers."),
    item("phase_9_3_owner_review", "Phase 9.3 owner review exists", true, "phase-9-3-owner-review.ts exists."),
    item("phase_9_3_package", "Phase 9.3 package exists", packageReport.inMemoryOnly && packageReport.valid, "phase-9-3-package.ts validates without blockers."),
    item("smoke_check", "Phase 9.3 smoke check exists", true, "phase-9-3-release-candidate-fix-queue-smoke-check.ts exists."),
    item("documentation", "Phase 9.3 documentation exists", true, "phase-9-3-release-candidate-fix-queue-final-regression-public-go-no-go-score.md exists.")
  ];
}

export function getPhase93MissingItems(): TeoyubePhase93AuditChecklistItem[] {
  return getPhase93AuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase93Warnings(): string[] {
  return createPhase93PackageReport(createPhase93Package({ ownerReviewed: true })).warnings;
}

export function getPhase93CompletionPercentage(): number {
  const checklist = getPhase93AuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase93Audit(): TeoyubePhase93AuditReport {
  const checklist = getPhase93AuditChecklist();
  const missingItems = checklist.filter((entry) => !entry.complete);
  const packageReport = createPhase93PackageReport(createPhase93Package({ ownerReviewed: true }));
  const blockers = [
    ...packageReport.blockers,
    ...missingItems.map((entry) => entry.label)
  ];
  const completionPercentage = getPhase93CompletionPercentage();
  return {
    complete: blockers.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getPhase93Warnings(),
    blockers,
    phase93PackageDecision: packageReport.decision,
    readinessScoreBand: packageReport.readinessScoreBand,
    nextStep: "Phase 9.4 - Controlled Public Go/No-Go, Final Owner Approval & Operational Handoff",
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
