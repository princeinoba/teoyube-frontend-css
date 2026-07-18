import { runControlledLaunchActivationAudit } from "../controlled-launch-activation-audit";
import { createControlledLaunchActivationReport } from "../controlled-launch-activation-checklist";
import { createControlledLaunchActivationPackage, createControlledLaunchActivationPackageReport } from "../controlled-launch-activation-package";
import { createControlledLaunchCommunicationReadinessPlan, createControlledLaunchCommunicationReadinessReport } from "../controlled-launch-communication-readiness";
import { createFirstHourMonitoringReadinessPlan, createFirstHourMonitoringReadinessReport } from "../controlled-launch-first-hour-readiness";
import { createControlledLaunchIssueIntakePlan, createControlledLaunchIssueIntakeReport } from "../controlled-launch-issue-intake-readiness";
import { createControlledLaunchOwnerApprovalRecord, createControlledLaunchOwnerApprovalReport } from "../controlled-launch-owner-approval";
import { createParticipantAccessReadinessPlan, createParticipantAccessReadinessReport } from "../controlled-launch-participant-access";
import { createControlledLaunchPauseRollbackPlan, createControlledLaunchPauseRollbackReport } from "../controlled-launch-pause-rollback-readiness";
import { createControlledLaunchWindowPlan, createControlledLaunchWindowReport } from "../controlled-launch-window";

export function runLimitedSoftLaunchExecution41Example() {
  const activationChecklistReport = createControlledLaunchActivationReport();
  const ownerApprovalRecord = createControlledLaunchOwnerApprovalRecord();
  const ownerApprovalReport = createControlledLaunchOwnerApprovalReport(ownerApprovalRecord);
  const launchWindowPlan = createControlledLaunchWindowPlan();
  const launchWindowReport = createControlledLaunchWindowReport(launchWindowPlan);
  const participantAccessPlan = createParticipantAccessReadinessPlan();
  const participantAccessReport = createParticipantAccessReadinessReport(participantAccessPlan);
  const communicationPlan = createControlledLaunchCommunicationReadinessPlan();
  const communicationReadinessReport = createControlledLaunchCommunicationReadinessReport(communicationPlan);
  const firstHourPlan = createFirstHourMonitoringReadinessPlan();
  const firstHourReadinessReport = createFirstHourMonitoringReadinessReport(firstHourPlan);
  const issueIntakePlan = createControlledLaunchIssueIntakePlan();
  const issueIntakeReadinessReport = createControlledLaunchIssueIntakeReport(issueIntakePlan);
  const pauseRollbackPlan = createControlledLaunchPauseRollbackPlan();
  const pauseRollbackReadinessReport = createControlledLaunchPauseRollbackReport(pauseRollbackPlan);
  const activationPackage = createControlledLaunchActivationPackage();
  const activationPackageReport = createControlledLaunchActivationPackageReport(activationPackage);
  const audit = runControlledLaunchActivationAudit();

  return {
    activationChecklistReport,
    ownerApprovalRecord,
    ownerApprovalReport,
    launchWindowPlan,
    launchWindowReport,
    participantAccessPlan,
    participantAccessReport,
    communicationReadinessReport,
    firstHourReadinessReport,
    issueIntakeReadinessReport,
    pauseRollbackReadinessReport,
    activationPackageReport,
    audit
  };
}
