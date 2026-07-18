import { createFinalSoftLaunchGoNoGoReport } from "./final-soft-launch-go-no-go";
import { createKnownLimitationsReport } from "./final-soft-launch-known-limitations";
import { createFinalSoftLaunchOwnerGoNoGoReport } from "./final-soft-launch-owner-go-no-go";
import { createFinalSoftLaunchReadinessPackageReport } from "./final-soft-launch-readiness-package";
import type {
  TeoyubeFinalSoftLaunchReadinessBlocker,
  TeoyubeFinalSoftLaunchReadinessWarning
} from "./final-soft-launch-readiness-contracts";
import { createLimitedSoftLaunchDayRunbookReport } from "./limited-soft-launch-day-runbook";
import { createLimitedSoftLaunchFeedbackWorkflowReport } from "./limited-soft-launch-feedback-workflow";
import { createLimitedSoftLaunchSupportResponseReport } from "./limited-soft-launch-support-response";

export type TeoyubeFinalSoftLaunchExecutionHandoff = {
  id: string;
  label: string;
  readinessPackageReport: ReturnType<typeof createFinalSoftLaunchReadinessPackageReport>;
  goNoGoReport: ReturnType<typeof createFinalSoftLaunchGoNoGoReport>;
  runbookReference: ReturnType<typeof createLimitedSoftLaunchDayRunbookReport>;
  knownLimitationsReport: ReturnType<typeof createKnownLimitationsReport>;
  feedbackWorkflowReport: ReturnType<typeof createLimitedSoftLaunchFeedbackWorkflowReport>;
  supportResponseReport: ReturnType<typeof createLimitedSoftLaunchSupportResponseReport>;
  ownerDecisionRecord: ReturnType<typeof createFinalSoftLaunchOwnerGoNoGoReport>;
  nextActionChecklist: string[];
  handoffPrepared: true;
  launchExecuted: false;
  usersContacted: false;
  messagesSent: false;
  databaseWritten: false;
  analyticsSent: false;
  externalServicesCalled: false;
  generatedAt: string;
};

export function getSoftLaunchExecutionHandoffChecklist(): string[] {
  return [
    "Open Limited Soft Launch Execution 4.1 controlled activation checklist.",
    "Review limited soft launch runbook and participant guidance.",
    "Review known limitations and participant safety language.",
    "Confirm manual feedback intake workflow and redaction rules.",
    "Confirm issue triage workflow and launch-critical categories.",
    "Confirm pause and rollback criteria.",
    "Prepare daily review template.",
    "Keep owner decision record available.",
    "Run final CLI checks and smoke checks before controlled activation.",
    "Do not contact users until 4.1 owner-controlled activation."
  ];
}

export function createFinalSoftLaunchExecutionHandoff(
  input: Partial<TeoyubeFinalSoftLaunchExecutionHandoff> = {}
): TeoyubeFinalSoftLaunchExecutionHandoff {
  return {
    id: input.id || "final_soft_launch_execution_handoff_3_3",
    label: input.label || "Final Soft Launch Execution Handoff",
    readinessPackageReport: input.readinessPackageReport || createFinalSoftLaunchReadinessPackageReport(),
    goNoGoReport: input.goNoGoReport || createFinalSoftLaunchGoNoGoReport(),
    runbookReference: input.runbookReference || createLimitedSoftLaunchDayRunbookReport(),
    knownLimitationsReport: input.knownLimitationsReport || createKnownLimitationsReport(),
    feedbackWorkflowReport: input.feedbackWorkflowReport || createLimitedSoftLaunchFeedbackWorkflowReport(),
    supportResponseReport: input.supportResponseReport || createLimitedSoftLaunchSupportResponseReport(),
    ownerDecisionRecord: input.ownerDecisionRecord || createFinalSoftLaunchOwnerGoNoGoReport(),
    nextActionChecklist: input.nextActionChecklist || getSoftLaunchExecutionHandoffChecklist(),
    handoffPrepared: true,
    launchExecuted: false,
    usersContacted: false,
    messagesSent: false,
    databaseWritten: false,
    analyticsSent: false,
    externalServicesCalled: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function getSoftLaunchExecutionHandoffBlockers(
  handoff: TeoyubeFinalSoftLaunchExecutionHandoff = createFinalSoftLaunchExecutionHandoff()
): TeoyubeFinalSoftLaunchReadinessBlocker[] {
  return [
    handoff.readinessPackageReport.valid ? undefined : "Final readiness package report must be valid.",
    handoff.goNoGoReport.valid ? undefined : "Final go/no-go report must be valid.",
    handoff.runbookReference.valid ? undefined : "Limited soft launch runbook report must be valid.",
    handoff.feedbackWorkflowReport.valid ? undefined : "Feedback workflow report must be valid.",
    handoff.supportResponseReport.valid ? undefined : "Support response report must be valid.",
    handoff.ownerDecisionRecord.valid ? undefined : "Owner decision record must be valid.",
    handoff.launchExecuted ? "Handoff must not execute the launch." : undefined,
    handoff.usersContacted ? "Handoff must not contact users." : undefined,
    handoff.messagesSent ? "Handoff must not send messages." : undefined,
    handoff.databaseWritten ? "Handoff must not write databases." : undefined,
    handoff.analyticsSent ? "Handoff must not send analytics." : undefined,
    handoff.externalServicesCalled ? "Handoff must not call external services." : undefined
  ]
    .filter(Boolean)
    .map((reason, index) => ({
      id: `final_soft_launch_handoff_blocker_${index + 1}`,
      label: "Execution handoff blocker",
      category: "execution_handoff",
      severity: "critical",
      reason: reason as string,
      requiredAction: "Resolve this handoff blocker before Limited Soft Launch Execution 4.1."
    }));
}

export function getSoftLaunchExecutionHandoffWarnings(): TeoyubeFinalSoftLaunchReadinessWarning[] {
  return [
    {
      id: "final_soft_launch_handoff_does_not_execute",
      label: "Handoff does not execute",
      category: "execution_handoff",
      severity: "medium",
      message: "This handoff prepares the next stage only; it does not launch, contact users, or call providers.",
      recommendedAction: "Use 4.1 controlled activation checklist for the next manual stage."
    }
  ];
}

export function createSoftLaunchExecutionHandoffReport(
  handoff: TeoyubeFinalSoftLaunchExecutionHandoff = createFinalSoftLaunchExecutionHandoff()
) {
  const blockers = getSoftLaunchExecutionHandoffBlockers(handoff);
  const warnings = getSoftLaunchExecutionHandoffWarnings();

  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    handoff,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    blockers,
    warnings,
    nextStage: "Limited Soft Launch Execution",
    nextStep: "4.1 - Controlled Launch Activation Checklist",
    noLaunchPerformed: true,
    noUsersContacted: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
