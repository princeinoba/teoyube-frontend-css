import { createLimitedSoftLaunchCommunicationPacket } from "../limited-soft-launch-communication-packet";
import { createLimitedSoftLaunchDayRunbookReport } from "../limited-soft-launch-day-runbook";
import { createLimitedSoftLaunchEnvironmentSafetyReport } from "../limited-soft-launch-environment-safety";
import { createLimitedSoftLaunchExecutionPlan, createLimitedSoftLaunchExecutionReport } from "../limited-soft-launch-execution-plan";
import { createLimitedSoftLaunchFeedbackWorkflowReport } from "../limited-soft-launch-feedback-workflow";
import { createLimitedSoftLaunchGoNoGoPreparationReport } from "../limited-soft-launch-go-no-go-prep";
import { createParticipantScopeReport } from "../limited-soft-launch-participant-scope";
import { runLimitedSoftLaunchPreparationAudit } from "../limited-soft-launch-preparation-audit";
import { createLimitedSoftLaunchSupportResponseReport } from "../limited-soft-launch-support-response";
import { createLimitedSoftLaunchSurfaceScopeReport } from "../limited-soft-launch-surface-scope";

export type SoftLaunchPreparation31SmokeCheckReport = {
  valid: boolean;
  errors: string[];
  noActualLaunchPerformed: true;
  noUsersContacted: true;
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

export function runSoftLaunchPreparation31SmokeCheck(): SoftLaunchPreparation31SmokeCheckReport {
  const executionPlan = createLimitedSoftLaunchExecutionPlan();
  const executionReport = createLimitedSoftLaunchExecutionReport(executionPlan);
  const participantScope = createParticipantScopeReport();
  const surfaceScope = createLimitedSoftLaunchSurfaceScopeReport();
  const environment = createLimitedSoftLaunchEnvironmentSafetyReport();
  const feedback = createLimitedSoftLaunchFeedbackWorkflowReport();
  const support = createLimitedSoftLaunchSupportResponseReport();
  const communication = createLimitedSoftLaunchCommunicationPacket();
  const runbook = createLimitedSoftLaunchDayRunbookReport();
  const goNoGo = createLimitedSoftLaunchGoNoGoPreparationReport({ ownerReviewAccepted: true });
  const audit = runLimitedSoftLaunchPreparationAudit();
  const errors = [
    assert(Boolean(executionPlan.id && executionPlan.phases.length), "Execution contracts and plan should return structured output."),
    assert(executionReport.ready && executionReport.noActualLaunchPerformed && executionReport.noUsersContacted && executionReport.noPreviewUrlFetched, "Execution report should be ready and perform no launch actions."),
    assert(participantScope.valid && participantScope.noRealUserContactInThisStep && participantScope.noFeedbackCollectedInThisStep, "Participant scope should not contact users or collect feedback."),
    assert(surfaceScope.valid && surfaceScope.includedSurfaceCount >= 13, "Surface scope should cover required surfaces."),
    assert(environment.valid && environment.externalAnalyticsDisabled, "Environment safety should keep analytics disabled."),
    assert(environment.productionPersistenceDisabled, "Environment safety should keep persistence disabled."),
    assert(environment.liveAiOrchestrationDisabled, "Environment safety should keep live AI orchestration disabled."),
    assert(feedback.valid && feedback.inMemoryOnly && feedback.noAnalyticsSending && feedback.noDatabaseWrites && feedback.noRawSensitiveTextStorage, "Feedback workflow should be manual and privacy-safe."),
    assert(support.valid && support.noSupportMessagesSent && support.noMonitoringConnected, "Support response should send no communications and connect no monitoring tools."),
    assert(!communication.messagesSent && !communication.usersContacted, "Communication packet should be draft-only."),
    assert(runbook.valid && runbook.noActionsPerformed && runbook.noPreviewUrlFetched && runbook.noMessagesSent, "Launch day runbook should perform no actions."),
    assert(goNoGo.valid && ["ready_for_limited_soft_launch_plan_review", "ready_after_owner_review"].includes(goNoGo.decision), "Go/no-go prep should return a structured ready decision."),
    assert(audit.complete && audit.completionPercentage === 100, "Limited soft launch preparation audit should be complete."),
    assert(!executionPlan.databaseWritten && !executionPlan.analyticsSent && !executionPlan.externalServicesCalled, "Execution plan should not require database, external APIs, or analytics providers."),
    assert(!executionPlan.actualLaunchPerformed && !executionPlan.usersContacted && !executionPlan.realFeedbackCollected, "No actual launch, users contacted, or real feedback collection should occur.")
  ].filter(Boolean);

  return {
    valid: errors.length === 0,
    errors,
    noActualLaunchPerformed: true,
    noUsersContacted: true,
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
