import { createLaunchDayRehearsalReport } from "../limited-soft-launch-day-rehearsal";
import { runLimitedSoftLaunchDryRunAudit } from "../limited-soft-launch-dry-run-audit";
import { createLimitedSoftLaunchDryRunPackage, createLimitedSoftLaunchDryRunPackageReport } from "../limited-soft-launch-dry-run-package";
import { createLimitedSoftLaunchDryRun, createLimitedSoftLaunchDryRunReport, recordLimitedSoftLaunchDryRunScenario } from "../limited-soft-launch-dry-run-runner";
import { createDryRunScenarioMatrixReport, getCriticalDryRunScenarios } from "../limited-soft-launch-dry-run-scenarios";
import { createFeedbackIntakeRehearsalReport } from "../limited-soft-launch-feedback-rehearsal";
import { createIssueTriageRehearsalReport } from "../limited-soft-launch-issue-triage-rehearsal";
import { createLimitedSoftLaunchOwnerReviewChecklist, createLimitedSoftLaunchOwnerReviewRecord, createLimitedSoftLaunchOwnerReviewReport } from "../limited-soft-launch-owner-review";
import { createRollbackRehearsalReport } from "../limited-soft-launch-rollback-rehearsal";

export type SoftLaunchPreparation32SmokeCheckReport = {
  valid: boolean;
  errors: string[];
  dryRunDecision: string;
  ownerReviewStatus: string;
  packageDecision: string;
  noActualLaunchPerformed: true;
  noUsersContacted: true;
  noRealFeedbackCollected: true;
  noPreviewUrlFetched: true;
  noDatabaseRequired: true;
  noExternalApisRequired: true;
  noAnalyticsProviderRequired: true;
  noServiceWorkerRequired: true;
  noBrowserStorageRequired: true;
  noFileWritesRequired: true;
  generatedAt: string;
};

function assert(condition: boolean, message: string): string {
  return condition ? "" : message;
}

export function runSoftLaunchPreparation32SmokeCheck(): SoftLaunchPreparation32SmokeCheckReport {
  const matrix = createDryRunScenarioMatrixReport();
  let dryRun = createLimitedSoftLaunchDryRun();
  const firstCriticalScenario = getCriticalDryRunScenarios()[0];
  dryRun = recordLimitedSoftLaunchDryRunScenario(dryRun, {
    id: "soft_launch_3_2_smoke_scenario_result",
    scenarioId: firstCriticalScenario.id,
    phase: firstCriticalScenario.phase,
    status: "pass",
    summary: "Smoke check recorded one launch-critical scenario result in memory only.",
    sanitized: true,
    launchCritical: true,
    checkedAt: new Date().toISOString()
  });
  const dryRunReport = createLimitedSoftLaunchDryRunReport(dryRun);
  const launchDay = createLaunchDayRehearsalReport();
  const feedback = createFeedbackIntakeRehearsalReport();
  const triage = createIssueTriageRehearsalReport();
  const rollback = createRollbackRehearsalReport();
  const ownerReview = createLimitedSoftLaunchOwnerReviewReport(createLimitedSoftLaunchOwnerReviewRecord({ decisionAccepted: true }));
  const dryRunPackage = createLimitedSoftLaunchDryRunPackage({
    dryRunReport,
    launchDayRehearsalReport: launchDay,
    feedbackRehearsalReport: feedback,
    issueTriageRehearsalReport: triage,
    rollbackRehearsalReport: rollback,
    ownerReviewReport: ownerReview
  });
  const packageReport = createLimitedSoftLaunchDryRunPackageReport(dryRunPackage);
  const audit = runLimitedSoftLaunchDryRunAudit();
  const errors = [
    assert(matrix.valid && matrix.scenarioCount >= 25, "Scenario matrix should exist with broad dry run coverage."),
    assert(dryRun.inMemoryOnly && dryRun.sampleOnly, "Dry run runner should work in memory only with sample data."),
    assert(dryRunReport.valid && dryRunReport.noActualLaunchPerformed && dryRunReport.noUsersContacted && dryRunReport.noPreviewUrlFetched, "Dry run report should perform no launch, user contact, or preview URL fetch."),
    assert(launchDay.valid && launchDay.noActualLaunchPerformed && launchDay.noUsersContacted, "Launch-day rehearsal should perform no launch actions."),
    assert(feedback.valid && feedback.sampleFeedbackOnly && feedback.noRawSensitiveTextStorage, "Feedback rehearsal should use sample feedback only and store no raw sensitive text by default."),
    assert(feedback.noExternalSending && feedback.noDatabaseWrites && feedback.noHiddenPersonalization, "Feedback rehearsal should not send externally, write databases, or create hidden personalization."),
    assert(triage.valid && triage.launchCriticalBlockers.length > 0, "Issue triage rehearsal should identify launch-critical blockers."),
    assert(rollback.valid && rollback.noRollbackActionPerformed && rollback.noExternalProviderCommandExecuted, "Rollback rehearsal should perform no rollback action or provider command."),
    assert(createLimitedSoftLaunchOwnerReviewChecklist().length >= 15 && ownerReview.ready, "Owner review checklist should exist and accepted owner review should be ready."),
    assert(packageReport.valid && packageReport.package.inMemoryOnly && packageReport.noExternalSend && packageReport.noFileWrites && packageReport.noDatabaseWrites, "Dry run package should be created in memory only."),
    assert(packageReport.decision === "ready_for_final_soft_launch_readiness_package", "Dry run package should be ready for final soft launch readiness package."),
    assert(audit.complete && audit.completionPercentage === 100, "Dry run audit should be complete."),
    assert(!dryRun.actualLaunchPerformed && !dryRun.usersContacted && !dryRun.realFeedbackCollected, "No actual launch, users contacted, or real feedback collection should occur."),
    assert(!dryRun.previewUrlFetched && !dryRun.databaseWritten && !dryRun.analyticsSent && !dryRun.externalServicesCalled, "No preview URL fetch, database, analytics, or external API should be required."),
    assert(!dryRun.browserStorageWritten && !dryRun.fileWritten, "No localStorage, cookies, IndexedDB, or file writes should be required.")
  ].filter(Boolean);

  return {
    valid: errors.length === 0,
    errors,
    dryRunDecision: dryRunReport.decision,
    ownerReviewStatus: ownerReview.status,
    packageDecision: packageReport.decision,
    noActualLaunchPerformed: true,
    noUsersContacted: true,
    noRealFeedbackCollected: true,
    noPreviewUrlFetched: true,
    noDatabaseRequired: true,
    noExternalApisRequired: true,
    noAnalyticsProviderRequired: true,
    noServiceWorkerRequired: true,
    noBrowserStorageRequired: true,
    noFileWritesRequired: true,
    generatedAt: new Date().toISOString()
  };
}
