import { createControlledLaunchActivationDecision, createControlledLaunchActivationReport } from "./controlled-launch-activation-checklist";
import type {
  TeoyubeControlledLaunchActivationBlocker,
  TeoyubeControlledLaunchActivationDecision,
  TeoyubeControlledLaunchActivationWarning
} from "./controlled-launch-activation-contracts";
import { createControlledLaunchCommunicationReadinessPlan, createControlledLaunchCommunicationReadinessReport } from "./controlled-launch-communication-readiness";
import { createFirstHourMonitoringReadinessPlan, createFirstHourMonitoringReadinessReport } from "./controlled-launch-first-hour-readiness";
import { createControlledLaunchIssueIntakePlan, createControlledLaunchIssueIntakeReport } from "./controlled-launch-issue-intake-readiness";
import { createControlledLaunchOwnerApprovalRecord, createControlledLaunchOwnerApprovalReport } from "./controlled-launch-owner-approval";
import { createParticipantAccessReadinessPlan, createParticipantAccessReadinessReport } from "./controlled-launch-participant-access";
import { createControlledLaunchPauseRollbackPlan, createControlledLaunchPauseRollbackReport } from "./controlled-launch-pause-rollback-readiness";
import { createControlledLaunchWindowPlan, createControlledLaunchWindowReport } from "./controlled-launch-window";
import { createFinalSoftLaunchReadinessPackage } from "./final-soft-launch-readiness-package";

export type TeoyubeControlledLaunchActivationPackage = {
  id: string;
  label: string;
  activationChecklistReport: ReturnType<typeof createControlledLaunchActivationReport>;
  ownerApprovalReport: ReturnType<typeof createControlledLaunchOwnerApprovalReport>;
  launchWindowReport: ReturnType<typeof createControlledLaunchWindowReport>;
  participantAccessReport: ReturnType<typeof createParticipantAccessReadinessReport>;
  communicationReadinessReport: ReturnType<typeof createControlledLaunchCommunicationReadinessReport>;
  firstHourReadinessReport: ReturnType<typeof createFirstHourMonitoringReadinessReport>;
  issueIntakeReadinessReport: ReturnType<typeof createControlledLaunchIssueIntakeReport>;
  pauseRollbackReadinessReport: ReturnType<typeof createControlledLaunchPauseRollbackReport>;
  finalSoftLaunchReadinessPackageReference: string;
  knownLimitations: string[];
  nextAction: string;
  inMemoryOnly: true;
  sentExternally: false;
  fileWritten: false;
  databaseWritten: false;
  analyticsSent: false;
  launchPerformed: false;
  usersContacted: false;
  realFeedbackCollected: false;
  previewUrlFetched: false;
  generatedAt: string;
};

export type TeoyubeControlledLaunchActivationPackageInput = Partial<Pick<TeoyubeControlledLaunchActivationPackage, "knownLimitations" | "nextAction">>;

function packageBlocker(id: string, reason: string): TeoyubeControlledLaunchActivationBlocker {
  return {
    id,
    label: id.replace(/_/g, " "),
    phase: "activation_decision",
    severity: "critical",
    reason,
    requiredAction: "Resolve this activation package blocker before manual activation."
  };
}

export function createControlledLaunchActivationPackage(
  input: TeoyubeControlledLaunchActivationPackageInput = {}
): TeoyubeControlledLaunchActivationPackage {
  const finalReadinessPackage = createFinalSoftLaunchReadinessPackage();

  return {
    id: "controlled_launch_activation_package_4_1",
    label: "Limited Soft Launch Execution 4.1 Controlled Launch Activation Package",
    activationChecklistReport: createControlledLaunchActivationReport(),
    ownerApprovalReport: createControlledLaunchOwnerApprovalReport(createControlledLaunchOwnerApprovalRecord()),
    launchWindowReport: createControlledLaunchWindowReport(createControlledLaunchWindowPlan()),
    participantAccessReport: createParticipantAccessReadinessReport(createParticipantAccessReadinessPlan()),
    communicationReadinessReport: createControlledLaunchCommunicationReadinessReport(createControlledLaunchCommunicationReadinessPlan()),
    firstHourReadinessReport: createFirstHourMonitoringReadinessReport(createFirstHourMonitoringReadinessPlan()),
    issueIntakeReadinessReport: createControlledLaunchIssueIntakeReport(createControlledLaunchIssueIntakePlan()),
    pauseRollbackReadinessReport: createControlledLaunchPauseRollbackReport(createControlledLaunchPauseRollbackPlan()),
    finalSoftLaunchReadinessPackageReference: finalReadinessPackage.id,
    knownLimitations: input.knownLimitations || [
      "Manual owner approval remains required before participant access is shared.",
      "Preview participants must not submit sensitive personal information.",
      "External analytics, production persistence, and live AI orchestration remain disconnected."
    ],
    nextAction: input.nextAction || "Limited Soft Launch Execution 4.2 - Launch Day Monitoring & Manual Feedback Intake",
    inMemoryOnly: true,
    sentExternally: false,
    fileWritten: false,
    databaseWritten: false,
    analyticsSent: false,
    launchPerformed: false,
    usersContacted: false,
    realFeedbackCollected: false,
    previewUrlFetched: false,
    generatedAt: new Date().toISOString()
  };
}

export function getControlledLaunchActivationPackageBlockers(
  activationPackage: TeoyubeControlledLaunchActivationPackage
): TeoyubeControlledLaunchActivationBlocker[] {
  return [
    ...activationPackage.activationChecklistReport.blockers,
    ...activationPackage.ownerApprovalReport.blockers,
    ...activationPackage.launchWindowReport.blockers,
    ...activationPackage.participantAccessReport.blockers,
    ...activationPackage.communicationReadinessReport.blockers,
    ...activationPackage.firstHourReadinessReport.blockers,
    ...activationPackage.issueIntakeReadinessReport.blockers,
    ...activationPackage.pauseRollbackReadinessReport.blockers,
    activationPackage.sentExternally ? packageBlocker("controlled_launch_package_sent_externally", "Activation package must not be sent externally.") : undefined,
    activationPackage.fileWritten ? packageBlocker("controlled_launch_package_file_written", "Activation package must not write files.") : undefined,
    activationPackage.databaseWritten ? packageBlocker("controlled_launch_package_database_written", "Activation package must not write databases.") : undefined,
    activationPackage.analyticsSent ? packageBlocker("controlled_launch_package_analytics_sent", "Activation package must not send analytics.") : undefined,
    activationPackage.launchPerformed ? packageBlocker("controlled_launch_package_launched", "Activation package must not perform launch.") : undefined,
    activationPackage.usersContacted ? packageBlocker("controlled_launch_package_users_contacted", "Activation package must not contact users.") : undefined,
    activationPackage.realFeedbackCollected ? packageBlocker("controlled_launch_package_feedback_collected", "Activation package must not collect real feedback.") : undefined,
    activationPackage.previewUrlFetched ? packageBlocker("controlled_launch_package_preview_url_fetched", "Activation package must not fetch preview URLs.") : undefined
  ].filter(Boolean) as TeoyubeControlledLaunchActivationBlocker[];
}

export function getControlledLaunchActivationPackageWarnings(
  activationPackage: TeoyubeControlledLaunchActivationPackage
): TeoyubeControlledLaunchActivationWarning[] {
  return [
    ...activationPackage.activationChecklistReport.warnings,
    ...activationPackage.ownerApprovalReport.warnings,
    ...activationPackage.launchWindowReport.warnings,
    ...activationPackage.participantAccessReport.warnings,
    ...activationPackage.communicationReadinessReport.warnings,
    ...activationPackage.firstHourReadinessReport.warnings,
    ...activationPackage.issueIntakeReadinessReport.warnings,
    ...activationPackage.pauseRollbackReadinessReport.warnings
  ];
}

export function createControlledLaunchActivationPackageDecision(
  activationPackage: TeoyubeControlledLaunchActivationPackage
): TeoyubeControlledLaunchActivationDecision {
  const blockers = getControlledLaunchActivationPackageBlockers(activationPackage);
  return blockers.length === 0 ? createControlledLaunchActivationDecision() : "blocked";
}

export function validateControlledLaunchActivationPackage(
  activationPackage: TeoyubeControlledLaunchActivationPackage
) {
  const blockers = getControlledLaunchActivationPackageBlockers(activationPackage);
  return { valid: blockers.length === 0, blockers, warnings: getControlledLaunchActivationPackageWarnings(activationPackage) };
}

export function createControlledLaunchActivationPackageReport(
  activationPackage: TeoyubeControlledLaunchActivationPackage = createControlledLaunchActivationPackage()
) {
  const validation = validateControlledLaunchActivationPackage(activationPackage);
  const decision = createControlledLaunchActivationPackageDecision(activationPackage);

  return {
    valid: validation.valid,
    ready: validation.valid && decision === "ready_for_manual_controlled_activation",
    decision,
    package: activationPackage,
    blockerCount: validation.blockers.length,
    warningCount: validation.warnings.length,
    blockers: validation.blockers,
    warnings: validation.warnings,
    inMemoryOnly: true,
    noLaunchPerformed: true,
    noUsersContacted: true,
    noRealFeedbackCollected: true,
    noPreviewUrlFetched: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
