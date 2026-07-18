import { runControlledLaunchActivationAudit } from "../controlled-launch-activation-audit";
import { getControlledLaunchActivationChecklist } from "../controlled-launch-activation-checklist";
import { createControlledLaunchActivationPackage, createControlledLaunchActivationPackageReport } from "../controlled-launch-activation-package";
import { createControlledLaunchCommunicationReadinessPlan, createControlledLaunchCommunicationReadinessReport, getControlledLaunchCommunicationChecklist } from "../controlled-launch-communication-readiness";
import { createFirstHourMonitoringReadinessPlan, createFirstHourMonitoringReadinessReport } from "../controlled-launch-first-hour-readiness";
import { createControlledLaunchIssueIntakePlan, createControlledLaunchIssueIntakeReport } from "../controlled-launch-issue-intake-readiness";
import { createControlledLaunchOwnerApprovalChecklist } from "../controlled-launch-owner-approval";
import { createParticipantAccessReadinessPlan, createParticipantAccessReadinessReport } from "../controlled-launch-participant-access";
import { createControlledLaunchPauseRollbackPlan, createControlledLaunchPauseRollbackReport } from "../controlled-launch-pause-rollback-readiness";
import { createControlledLaunchWindowPlan, createControlledLaunchWindowReport } from "../controlled-launch-window";

export function runLimitedSoftLaunchExecution41SmokeCheck() {
  const checklist = getControlledLaunchActivationChecklist();
  const ownerChecklist = createControlledLaunchOwnerApprovalChecklist();
  const launchWindow = createControlledLaunchWindowPlan();
  const launchWindowReport = createControlledLaunchWindowReport(launchWindow);
  const participantAccess = createParticipantAccessReadinessPlan();
  const participantAccessReport = createParticipantAccessReadinessReport(participantAccess);
  const communication = createControlledLaunchCommunicationReadinessPlan();
  const communicationReport = createControlledLaunchCommunicationReadinessReport(communication);
  const firstHour = createFirstHourMonitoringReadinessPlan();
  const firstHourReport = createFirstHourMonitoringReadinessReport(firstHour);
  const issueIntake = createControlledLaunchIssueIntakePlan();
  const issueIntakeReport = createControlledLaunchIssueIntakeReport(issueIntake);
  const pauseRollback = createControlledLaunchPauseRollbackPlan();
  const pauseRollbackReport = createControlledLaunchPauseRollbackReport(pauseRollback);
  const activationPackage = createControlledLaunchActivationPackage();
  const activationPackageReport = createControlledLaunchActivationPackageReport(activationPackage);
  const audit = runControlledLaunchActivationAudit();

  const checks = [
    checklist.manualOnly && checklist.checks.length >= 20,
    ownerChecklist.length >= 16,
    launchWindow.manualEntryOnly && !launchWindow.scheduledByCode && launchWindowReport.noSchedulingPerformed,
    participantAccess.manualSharingOnly && !participantAccess.userContactFromCode && participantAccessReport.noUsersContacted,
    getControlledLaunchCommunicationChecklist().length >= 10 && !communication.messagesSentByCode && communicationReport.noMessagesSent,
    !firstHour.fetchesPreviewUrls && !firstHour.monitoringPerformed && firstHourReport.noPreviewUrlFetched,
    !issueIntake.feedbackCollectedAutomatically && !issueIntake.issuesSentExternally && issueIntakeReport.manualOnly,
    !pauseRollback.rollbackPerformed && !pauseRollback.providerCommandsExecuted && pauseRollbackReport.noRollbackPerformed,
    activationPackage.inMemoryOnly && !activationPackage.fileWritten && activationPackageReport.inMemoryOnly,
    audit.complete && audit.completionPercentage === 100,
    !activationPackage.launchPerformed,
    !activationPackage.usersContacted,
    !activationPackage.realFeedbackCollected,
    !activationPackage.previewUrlFetched,
    !activationPackage.databaseWritten && !activationPackage.analyticsSent,
    !activationPackage.sentExternally
  ];

  return {
    valid: checks.every(Boolean),
    checkCount: checks.length,
    passedCheckCount: checks.filter(Boolean).length,
    noActualLaunchPerformed: true,
    noUsersContacted: true,
    noRealFeedbackCollected: true,
    noPreviewUrlFetched: true,
    noDatabaseExternalApisAnalyticsStorageOrFileWritesRequired: true,
    noServiceWorkerRequired: true,
    audit,
    activationDecision: activationPackageReport.decision,
    generatedAt: new Date().toISOString()
  };
}
