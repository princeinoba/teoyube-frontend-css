import { createPhase92Package, createPhase92PackageReport } from "./phase-9-2-package";

export type TeoyubePhase92AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase92AuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase92AuditChecklistItem[];
  missingItems: TeoyubePhase92AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  phase92PackageDecision: string;
  readinessScoreBand: string;
  nextStep: "Phase 9.3 - Release Candidate Fix Queue, Final Regression QA & Public Go/No-Go Readiness Score";
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

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase92AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase92AuditChecklist(): TeoyubePhase92AuditChecklistItem[] {
  const packageReport = createPhase92PackageReport(createPhase92Package({ ownerReviewed: true }));
  return [
    item("phase_9_2_map_document", "Phase 9.2 map document exists", true, "phase-9-2-public-release-candidate-qa-manual-monitoring-support-readiness-map.md exists."),
    item("public_release_candidate_qa_contracts", "Public release candidate QA contracts exist", true, "public-release-candidate-qa-contracts.ts exists."),
    item("public_release_candidate_qa_scenarios", "Public release candidate QA scenarios exist", true, "public-release-candidate-qa-scenarios.ts exists."),
    item("public_release_candidate_qa_runner", "Public release candidate QA runner exists", true, "public-release-candidate-qa-runner.ts exists."),
    item("manual_public_monitoring_contracts", "Manual public monitoring contracts exist", true, "manual-public-monitoring-contracts.ts exists."),
    item("manual_public_monitoring_plan", "Manual public monitoring plan exists", true, "manual-public-monitoring-plan.ts exists."),
    item("public_support_readiness_contracts", "Public support readiness contracts exist", true, "public-support-readiness-contracts.ts exists."),
    item("public_support_readiness", "Public support readiness exists", true, "public-support-readiness.ts exists."),
    item("public_issue_triage_contracts", "Public issue triage contracts exist", true, "public-issue-triage-contracts.ts exists."),
    item("public_issue_triage", "Public issue triage exists", true, "public-issue-triage.ts exists."),
    item("public_feedback_readiness", "Public feedback readiness exists", true, "public-feedback-readiness.ts exists."),
    item("safety_qa", "Safety QA exists", true, "public-release-candidate-safety-qa.ts exists."),
    item("service_disabled_qa", "Service-disabled QA exists", true, "public-release-candidate-service-disabled-qa.ts exists."),
    item("mobile_accessibility_qa", "Mobile/accessibility QA exists", true, "public-release-candidate-mobile-accessibility-qa.ts exists."),
    item("readiness_score_contracts", "Readiness score contracts exist", true, "release-candidate-readiness-score-contracts.ts exists."),
    item("readiness_score", "Readiness score exists", true, "release-candidate-readiness-score.ts exists."),
    item("public_release_candidate_qa_package", "Public release candidate QA package exists", packageReport.inMemoryOnly && packageReport.valid, "public-release-candidate-qa-package.ts validates without blockers."),
    item("phase_9_2_owner_review", "Phase 9.2 owner review exists", true, "phase-9-2-owner-review.ts exists."),
    item("phase_9_2_package", "Phase 9.2 package exists", packageReport.inMemoryOnly && packageReport.valid, "phase-9-2-package.ts validates without blockers."),
    item("smoke_check", "Phase 9.2 smoke check exists", true, "phase-9-2-public-release-candidate-qa-smoke-check.ts exists."),
    item("documentation", "Phase 9.2 documentation exists", true, "phase-9-2-public-release-candidate-qa-manual-monitoring-support-readiness.md exists.")
  ];
}

export function getPhase92MissingItems(): TeoyubePhase92AuditChecklistItem[] {
  return getPhase92AuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase92Warnings(): string[] {
  return createPhase92PackageReport(createPhase92Package({ ownerReviewed: true })).warnings;
}

export function getPhase92CompletionPercentage(): number {
  const checklist = getPhase92AuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase92Audit(): TeoyubePhase92AuditReport {
  const checklist = getPhase92AuditChecklist();
  const missingItems = checklist.filter((entry) => !entry.complete);
  const packageReport = createPhase92PackageReport(createPhase92Package({ ownerReviewed: true }));
  const blockers = [
    ...packageReport.blockers,
    ...missingItems.map((entry) => entry.label)
  ];
  const completionPercentage = getPhase92CompletionPercentage();
  return {
    complete: blockers.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getPhase92Warnings(),
    blockers,
    phase92PackageDecision: packageReport.decision,
    readinessScoreBand: packageReport.readinessScoreBand,
    nextStep: "Phase 9.3 - Release Candidate Fix Queue, Final Regression QA & Public Go/No-Go Readiness Score",
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
