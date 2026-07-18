import { createLimitedSoftLaunchCommunicationPacket } from "../limited-soft-launch-communication-packet";
import { createLimitedSoftLaunchDayRunbookReport } from "../limited-soft-launch-day-runbook";
import { createLimitedSoftLaunchEnvironmentSafetyReport } from "../limited-soft-launch-environment-safety";
import { createLimitedSoftLaunchExecutionPlan, createLimitedSoftLaunchExecutionReport } from "../limited-soft-launch-execution-plan";
import { createLimitedSoftLaunchFeedbackWorkflowReport } from "../limited-soft-launch-feedback-workflow";
import { createLimitedSoftLaunchGoNoGoPreparationReport } from "../limited-soft-launch-go-no-go-prep";
import { createParticipantScopePlan, createParticipantScopeReport } from "../limited-soft-launch-participant-scope";
import { runLimitedSoftLaunchPreparationAudit } from "../limited-soft-launch-preparation-audit";
import { createLimitedSoftLaunchSupportResponseReport } from "../limited-soft-launch-support-response";
import { createLimitedSoftLaunchSurfaceScopeReport } from "../limited-soft-launch-surface-scope";

export function runSoftLaunchPreparation31Example() {
  const executionPlan = createLimitedSoftLaunchExecutionPlan();
  const executionReport = createLimitedSoftLaunchExecutionReport(executionPlan);
  const participantScope = createParticipantScopePlan();
  const participantScopeReport = createParticipantScopeReport(participantScope);
  const surfaceScopeReport = createLimitedSoftLaunchSurfaceScopeReport();
  const environmentSafetyReport = createLimitedSoftLaunchEnvironmentSafetyReport();
  const feedbackWorkflowReport = createLimitedSoftLaunchFeedbackWorkflowReport();
  const supportResponseReport = createLimitedSoftLaunchSupportResponseReport();
  const communicationPacket = createLimitedSoftLaunchCommunicationPacket();
  const launchDayRunbookReport = createLimitedSoftLaunchDayRunbookReport();
  const goNoGoReport = createLimitedSoftLaunchGoNoGoPreparationReport({ ownerReviewAccepted: true });
  const preparationAudit = runLimitedSoftLaunchPreparationAudit();

  return {
    executionPlan,
    executionReport,
    participantScope,
    participantScopeReport,
    surfaceScopeReport,
    environmentSafetyReport,
    feedbackWorkflowReport,
    supportResponseReport,
    communicationPacket,
    launchDayRunbookReport,
    goNoGoReport,
    preparationAudit,
    noActualLaunchPerformed: true,
    noUsersContacted: true,
    noRealFeedbackCollected: true
  };
}
