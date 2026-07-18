import {
  createControlledBetaExecutionPlan,
  createControlledBetaExecutionReport,
  type TeoyubeControlledBetaExecutionPlanInput
} from "./controlled-beta-execution-plan";
import {
  createManualParticipantWorkflowReport,
  type TeoyubeManualParticipantWorkflowInput
} from "./manual-participant-workflow";
import {
  createManualBetaCommunicationBoundaryReport,
  type TeoyubeManualBetaCommunicationBoundaryInput
} from "./manual-beta-communication-boundaries";
import {
  createManualFeedbackBoundaryReport,
  type TeoyubeManualFeedbackBoundaryInput
} from "./manual-feedback-boundaries";
import {
  createControlledBetaIssueIntakeReport,
  type TeoyubeControlledBetaIssue
} from "./controlled-beta-issue-intake";
import { createBetaOperationsChecklistReport } from "./beta-operations-checklist";
import {
  createBetaSafetyTheologyBoundaryReport,
  type TeoyubeBetaSafetyTheologyBoundaryInput
} from "./beta-safety-theology-boundaries";
import {
  createBetaPrivacyConsentBoundaryReport,
  type TeoyubeBetaPrivacyConsentBoundaryInput
} from "./beta-privacy-consent-boundaries";
import {
  createBetaServiceDisabledBoundaryReport,
  type TeoyubeBetaServiceDisabledBoundaryInput
} from "./beta-service-disabled-boundaries";

export type TeoyubeControlledBetaExecutionPackageDecision =
  | "ready_for_phase_6_2"
  | "ready_with_warnings"
  | "blocked";

export type TeoyubeControlledBetaExecutionPackageInput = {
  executionPlanInput?: TeoyubeControlledBetaExecutionPlanInput;
  participantWorkflowInput?: TeoyubeManualParticipantWorkflowInput;
  communicationBoundaryInput?: TeoyubeManualBetaCommunicationBoundaryInput;
  feedbackBoundaryInput?: TeoyubeManualFeedbackBoundaryInput;
  issues?: TeoyubeControlledBetaIssue[];
  safetyTheologyInput?: TeoyubeBetaSafetyTheologyBoundaryInput;
  privacyConsentInput?: TeoyubeBetaPrivacyConsentBoundaryInput;
  serviceDisabledInput?: TeoyubeBetaServiceDisabledBoundaryInput;
};

export type TeoyubeControlledBetaExecutionPackageModel = {
  id: string;
  controlledBetaExecutionPlan: ReturnType<typeof createControlledBetaExecutionPlan>;
  controlledBetaExecutionReport: ReturnType<typeof createControlledBetaExecutionReport>;
  manualParticipantWorkflowReport: ReturnType<typeof createManualParticipantWorkflowReport>;
  manualCommunicationBoundaryReport: ReturnType<typeof createManualBetaCommunicationBoundaryReport>;
  manualFeedbackBoundaryReport: ReturnType<typeof createManualFeedbackBoundaryReport>;
  controlledBetaIssueIntakeReport: ReturnType<typeof createControlledBetaIssueIntakeReport>;
  betaOperationsChecklistReport: ReturnType<typeof createBetaOperationsChecklistReport>;
  safetyTheologyBoundaryReport: ReturnType<typeof createBetaSafetyTheologyBoundaryReport>;
  privacyConsentBoundaryReport: ReturnType<typeof createBetaPrivacyConsentBoundaryReport>;
  serviceDisabledBoundaryReport: ReturnType<typeof createBetaServiceDisabledBoundaryReport>;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 6.2 - Manual Beta Dry Run, Feedback Intake Simulation & Issue Triage";
  noExternalSend: true;
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

export type TeoyubeControlledBetaExecutionPackageReport = {
  valid: boolean;
  decision: TeoyubeControlledBetaExecutionPackageDecision;
  package: TeoyubeControlledBetaExecutionPackageModel;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 6.2 - Manual Beta Dry Run, Feedback Intake Simulation & Issue Triage";
  noExternalSend: true;
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

function now(): string {
  return new Date().toISOString();
}

export function createControlledBetaExecutionPackage(input: TeoyubeControlledBetaExecutionPackageInput = {}): TeoyubeControlledBetaExecutionPackageModel {
  const controlledBetaExecutionPlan = createControlledBetaExecutionPlan(input.executionPlanInput);
  const controlledBetaExecutionReport = createControlledBetaExecutionReport(controlledBetaExecutionPlan);
  const manualParticipantWorkflowReport = createManualParticipantWorkflowReport(input.participantWorkflowInput);
  const manualCommunicationBoundaryReport = createManualBetaCommunicationBoundaryReport(input.communicationBoundaryInput);
  const manualFeedbackBoundaryReport = createManualFeedbackBoundaryReport(input.feedbackBoundaryInput);
  const controlledBetaIssueIntakeReport = createControlledBetaIssueIntakeReport(input.issues || []);
  const betaOperationsChecklistReport = createBetaOperationsChecklistReport();
  const safetyTheologyBoundaryReport = createBetaSafetyTheologyBoundaryReport(input.safetyTheologyInput);
  const privacyConsentBoundaryReport = createBetaPrivacyConsentBoundaryReport(input.privacyConsentInput);
  const serviceDisabledBoundaryReport = createBetaServiceDisabledBoundaryReport(input.serviceDisabledInput);

  const blockers = [
    ...controlledBetaExecutionReport.blockers.map((entry) => entry.message),
    ...manualParticipantWorkflowReport.blockers.map((entry) => entry.message),
    ...manualCommunicationBoundaryReport.blockers,
    ...manualFeedbackBoundaryReport.blockers.map((entry) => entry.message),
    ...controlledBetaIssueIntakeReport.blockers,
    ...betaOperationsChecklistReport.blockers,
    ...safetyTheologyBoundaryReport.blockers,
    ...privacyConsentBoundaryReport.blockers,
    ...serviceDisabledBoundaryReport.blockers
  ];

  const warnings = [
    ...controlledBetaExecutionReport.warnings.map((entry) => entry.message),
    ...manualParticipantWorkflowReport.warnings.map((entry) => entry.message),
    ...manualCommunicationBoundaryReport.warnings,
    ...manualFeedbackBoundaryReport.warnings.map((entry) => entry.message),
    ...controlledBetaIssueIntakeReport.warnings,
    ...betaOperationsChecklistReport.warnings,
    ...safetyTheologyBoundaryReport.warnings,
    ...privacyConsentBoundaryReport.warnings,
    ...serviceDisabledBoundaryReport.warnings
  ];

  return {
    id: "phase_6_1_controlled_beta_execution_package",
    controlledBetaExecutionPlan,
    controlledBetaExecutionReport,
    manualParticipantWorkflowReport,
    manualCommunicationBoundaryReport,
    manualFeedbackBoundaryReport,
    controlledBetaIssueIntakeReport,
    betaOperationsChecklistReport,
    safetyTheologyBoundaryReport,
    privacyConsentBoundaryReport,
    serviceDisabledBoundaryReport,
    blockers,
    warnings,
    nextActionRecommendation: "Phase 6.2 - Manual Beta Dry Run, Feedback Intake Simulation & Issue Triage",
    noExternalSend: true,
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
    generatedAt: now()
  };
}

export function getControlledBetaExecutionPackageBlockers(pkg: TeoyubeControlledBetaExecutionPackageModel): string[] {
  return pkg.blockers;
}

export function getControlledBetaExecutionPackageWarnings(pkg: TeoyubeControlledBetaExecutionPackageModel): string[] {
  return pkg.warnings;
}

export function createControlledBetaExecutionPackageDecision(pkg: TeoyubeControlledBetaExecutionPackageModel): TeoyubeControlledBetaExecutionPackageDecision {
  const blockers = getControlledBetaExecutionPackageBlockers(pkg);
  if (blockers.length) return "blocked";
  return getControlledBetaExecutionPackageWarnings(pkg).length ? "ready_with_warnings" : "ready_for_phase_6_2";
}

export function validateControlledBetaExecutionPackage(pkg: TeoyubeControlledBetaExecutionPackageModel): TeoyubeControlledBetaExecutionPackageReport {
  return createControlledBetaExecutionPackageReport(pkg);
}

export function createControlledBetaExecutionPackageReport(pkg: TeoyubeControlledBetaExecutionPackageModel): TeoyubeControlledBetaExecutionPackageReport {
  const blockers = getControlledBetaExecutionPackageBlockers(pkg);
  return {
    valid: blockers.length === 0,
    decision: createControlledBetaExecutionPackageDecision(pkg),
    package: pkg,
    blockers,
    warnings: getControlledBetaExecutionPackageWarnings(pkg),
    nextActionRecommendation: "Phase 6.2 - Manual Beta Dry Run, Feedback Intake Simulation & Issue Triage",
    noExternalSend: true,
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
    generatedAt: now()
  };
}

