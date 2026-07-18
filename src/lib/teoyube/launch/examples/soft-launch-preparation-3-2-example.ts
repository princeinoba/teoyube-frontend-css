import type { TeoyubeLimitedSoftLaunchDryRunResult } from "../limited-soft-launch-dry-run-contracts";
import { createLaunchDayRehearsalReport } from "../limited-soft-launch-day-rehearsal";
import { runLimitedSoftLaunchDryRunAudit } from "../limited-soft-launch-dry-run-audit";
import { createLimitedSoftLaunchDryRunPackage, createLimitedSoftLaunchDryRunPackageReport } from "../limited-soft-launch-dry-run-package";
import { createLimitedSoftLaunchDryRun, createLimitedSoftLaunchDryRunReport, recordLimitedSoftLaunchDryRunScenario } from "../limited-soft-launch-dry-run-runner";
import { createDryRunScenarioMatrixReport, getCriticalDryRunScenarios } from "../limited-soft-launch-dry-run-scenarios";
import { createFeedbackIntakeRehearsalReport } from "../limited-soft-launch-feedback-rehearsal";
import { createIssueTriageRehearsalReport } from "../limited-soft-launch-issue-triage-rehearsal";
import { createLimitedSoftLaunchOwnerReviewRecord, createLimitedSoftLaunchOwnerReviewReport } from "../limited-soft-launch-owner-review";
import { createRollbackRehearsalReport } from "../limited-soft-launch-rollback-rehearsal";

function passResult(scenarioId: string, phase: TeoyubeLimitedSoftLaunchDryRunResult["phase"]): TeoyubeLimitedSoftLaunchDryRunResult {
  return {
    id: `${scenarioId}_example_result`,
    scenarioId,
    phase,
    status: "pass",
    summary: `${scenarioId} passed in dry run rehearsal.`,
    sanitized: true,
    launchCritical: true,
    checkedAt: new Date().toISOString()
  };
}

export function runSoftLaunchPreparation32Example() {
  const scenarioMatrix = createDryRunScenarioMatrixReport();
  let dryRun = createLimitedSoftLaunchDryRun();
  getCriticalDryRunScenarios().slice(0, 8).forEach((scenario) => {
    dryRun = recordLimitedSoftLaunchDryRunScenario(dryRun, passResult(scenario.id, scenario.phase));
  });
  const dryRunReport = createLimitedSoftLaunchDryRunReport(dryRun);
  const launchDayRehearsalReport = createLaunchDayRehearsalReport();
  const feedbackRehearsalReport = createFeedbackIntakeRehearsalReport();
  const issueTriageRehearsalReport = createIssueTriageRehearsalReport();
  const rollbackRehearsalReport = createRollbackRehearsalReport();
  const ownerReviewRecord = createLimitedSoftLaunchOwnerReviewRecord({ decisionAccepted: true });
  const ownerReviewReport = createLimitedSoftLaunchOwnerReviewReport(ownerReviewRecord);
  const dryRunPackage = createLimitedSoftLaunchDryRunPackage({
    dryRunReport,
    launchDayRehearsalReport,
    feedbackRehearsalReport,
    issueTriageRehearsalReport,
    rollbackRehearsalReport,
    ownerReviewReport
  });
  const dryRunPackageReport = createLimitedSoftLaunchDryRunPackageReport(dryRunPackage);
  const dryRunAudit = runLimitedSoftLaunchDryRunAudit();

  return {
    scenarioMatrix,
    dryRun,
    dryRunReport,
    launchDayRehearsalReport,
    feedbackRehearsalReport,
    issueTriageRehearsalReport,
    rollbackRehearsalReport,
    ownerReviewRecord,
    ownerReviewReport,
    dryRunPackage,
    dryRunPackageReport,
    dryRunAudit,
    noActualLaunchPerformed: true,
    noUsersContacted: true,
    noRealFeedbackCollected: true
  };
}
