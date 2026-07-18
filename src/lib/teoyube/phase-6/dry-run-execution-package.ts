import { createDryRunDisabledServiceVerificationReport } from "./dry-run-disabled-service-verification";
import { createDryRunIssueTriageReport } from "./dry-run-issue-triage";
import type { TeoyubeDryRunIssue } from "./dry-run-issue-triage-contracts";
import { createDryRunMobileAccessibilityReport } from "./dry-run-mobile-accessibility-verification";
import { createDryRunPauseRollbackReport } from "./dry-run-pause-rollback-simulation";
import { createDryRunReadinessScoreReport } from "./dry-run-readiness-score";
import { createDryRunScriptureExplanationFallbackReport } from "./dry-run-scripture-explanation-fallback-verification";
import {
  createFeedbackIntakeSimulation,
  createFeedbackIntakeSimulationReport,
  createSimulatedFeedbackItem
} from "./feedback-intake-simulation";
import type {
  TeoyubeFeedbackIntakeSimulation,
  TeoyubeFeedbackIntakeSimulationItem
} from "./feedback-intake-simulation-contracts";
import {
  convertSimulatedFeedbackToDryRunIssues,
  createFeedbackToIssueSimulationReport
} from "./feedback-to-issue-simulation-converter";
import type { TeoyubeManualBetaDryRun, TeoyubeManualBetaDryRunResult } from "./manual-beta-dry-run-contracts";
import { createManualBetaDryRun, createManualBetaDryRunReport } from "./manual-beta-dry-run-runner";
import { getManualBetaDryRunScenarios } from "./manual-beta-dry-run-scenarios";
import type {
  TeoyubeSimulatedParticipantObservation,
  TeoyubeSimulatedParticipantSession
} from "./simulated-participant-session-contracts";
import {
  createSimulatedParticipantSession,
  createSimulatedParticipantSessionReport
} from "./simulated-participant-session";

export type TeoyubeDryRunExecutionPackageDecision =
  | "dry_run_ready_for_owner_review"
  | "dry_run_ready_with_warnings"
  | "queue_for_phase_6_3"
  | "blocked";

export type TeoyubeDryRunExecutionPackageInput = {
  dryRun?: TeoyubeManualBetaDryRun;
  participantSession?: TeoyubeSimulatedParticipantSession;
  feedbackSimulation?: TeoyubeFeedbackIntakeSimulation;
  feedbackItems?: TeoyubeFeedbackIntakeSimulationItem[];
  issues?: TeoyubeDryRunIssue[];
};

export type TeoyubeDryRunExecutionPackageModel = {
  id: string;
  dryRun: TeoyubeManualBetaDryRun;
  dryRunReport: ReturnType<typeof createManualBetaDryRunReport>;
  participantSession: TeoyubeSimulatedParticipantSession;
  participantSessionReport: ReturnType<typeof createSimulatedParticipantSessionReport>;
  feedbackSimulation: TeoyubeFeedbackIntakeSimulation;
  feedbackSimulationReport: ReturnType<typeof createFeedbackIntakeSimulationReport>;
  feedbackToIssueReport: ReturnType<typeof createFeedbackToIssueSimulationReport>;
  issueTriageReport: ReturnType<typeof createDryRunIssueTriageReport>;
  pauseRollbackReport: ReturnType<typeof createDryRunPauseRollbackReport>;
  disabledServiceVerificationReport: ReturnType<typeof createDryRunDisabledServiceVerificationReport>;
  scriptureExplanationFallbackReport: ReturnType<typeof createDryRunScriptureExplanationFallbackReport>;
  mobileAccessibilityReport: ReturnType<typeof createDryRunMobileAccessibilityReport>;
  readinessScoreReport: ReturnType<typeof createDryRunReadinessScoreReport>;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 6.3 - Dry Run Fix Queue, Stabilization Pass & Operations Readiness";
  manualOnly: true;
  simulatedOnly: true;
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

export type TeoyubeDryRunExecutionPackageReport = {
  valid: boolean;
  decision: TeoyubeDryRunExecutionPackageDecision;
  package: TeoyubeDryRunExecutionPackageModel;
  blockers: string[];
  warnings: string[];
  readinessScore: number;
  readinessBand: ReturnType<typeof createDryRunReadinessScoreReport>["band"];
  nextActionRecommendation: "Phase 6.3 - Dry Run Fix Queue, Stabilization Pass & Operations Readiness";
  manualOnly: true;
  simulatedOnly: true;
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

function baselineDryRunResults(): TeoyubeManualBetaDryRunResult[] {
  const recordedAt = now();
  return getManualBetaDryRunScenarios().map((scenario, index) => ({
    id: `phase_6_2_dry_run_result_${index + 1}`,
    scenarioId: scenario.id,
    area: scenario.area,
    status: "passed",
    notes: "Simulated owner dry-run step passed while preserving manual, in-memory, service-disabled boundaries.",
    simulatedOnly: true,
    recordedAt
  }));
}

function baselineParticipantObservations(): TeoyubeSimulatedParticipantObservation[] {
  return [{
    id: "phase_6_2_simulated_participant_observation",
    surface: "manual_beta_dry_run",
    note: "Simulated participant flow shows limitations, privacy reminders, Scripture anchors, explanation paths, fallback states, and confidence labels.",
    sanitized: true,
    recordedByOwner: true,
    simulatedOnly: true,
    createdAt: now()
  }];
}

function baselineFeedbackItems(): TeoyubeFeedbackIntakeSimulationItem[] {
  return [
    createSimulatedFeedbackItem({
      id: "phase_6_2_positive_feedback_simulation",
      category: "positive_feedback",
      note: "Simulated owner note: the manual dry-run instructions are understandable."
    })
  ];
}

export function createDryRunExecutionPackage(input: TeoyubeDryRunExecutionPackageInput = {}): TeoyubeDryRunExecutionPackageModel {
  const dryRun = input.dryRun || createManualBetaDryRun({ results: baselineDryRunResults() });
  const dryRunReport = createManualBetaDryRunReport(dryRun);
  const participantSession = input.participantSession || createSimulatedParticipantSession({ observations: baselineParticipantObservations() });
  const participantSessionReport = createSimulatedParticipantSessionReport(participantSession);
  const feedbackItems = input.feedbackItems || baselineFeedbackItems();
  const feedbackSimulation = input.feedbackSimulation || createFeedbackIntakeSimulation({ items: feedbackItems });
  const feedbackSimulationReport = createFeedbackIntakeSimulationReport(feedbackSimulation);
  const feedbackToIssueReport = createFeedbackToIssueSimulationReport(feedbackSimulation.items);
  const issues = [...(input.issues || []), ...convertSimulatedFeedbackToDryRunIssues(feedbackSimulation.items)];
  const issueTriageReport = createDryRunIssueTriageReport(issues);
  const pauseRollbackReport = createDryRunPauseRollbackReport(issueTriageReport.issues);
  const disabledServiceVerificationReport = createDryRunDisabledServiceVerificationReport();
  const scriptureExplanationFallbackReport = createDryRunScriptureExplanationFallbackReport();
  const mobileAccessibilityReport = createDryRunMobileAccessibilityReport();
  const readinessScoreReport = createDryRunReadinessScoreReport({ issues, feedbackItems: feedbackSimulation.items });
  const blockers = [
    ...dryRunReport.blockers.map((entry) => entry.message),
    ...participantSessionReport.blockers.map((entry) => entry.message),
    ...feedbackSimulationReport.blockers.map((entry) => entry.message),
    ...issueTriageReport.blockers.map((entry) => entry.message),
    ...pauseRollbackReport.blockers,
    ...disabledServiceVerificationReport.blockers,
    ...scriptureExplanationFallbackReport.blockers,
    ...mobileAccessibilityReport.blockers,
    ...readinessScoreReport.blockers
  ];
  const warnings = [
    ...dryRunReport.warnings.map((entry) => entry.message),
    ...participantSessionReport.warnings.map((entry) => entry.message),
    ...feedbackSimulationReport.warnings.map((entry) => entry.message),
    ...feedbackToIssueReport.warnings,
    ...issueTriageReport.warnings.map((entry) => entry.message),
    ...pauseRollbackReport.warnings,
    ...disabledServiceVerificationReport.warnings,
    ...scriptureExplanationFallbackReport.warnings,
    ...mobileAccessibilityReport.warnings,
    ...readinessScoreReport.warnings
  ];
  return {
    id: "phase_6_2_dry_run_execution_package",
    dryRun,
    dryRunReport,
    participantSession,
    participantSessionReport,
    feedbackSimulation,
    feedbackSimulationReport,
    feedbackToIssueReport,
    issueTriageReport,
    pauseRollbackReport,
    disabledServiceVerificationReport,
    scriptureExplanationFallbackReport,
    mobileAccessibilityReport,
    readinessScoreReport,
    blockers,
    warnings,
    nextActionRecommendation: "Phase 6.3 - Dry Run Fix Queue, Stabilization Pass & Operations Readiness",
    manualOnly: true,
    simulatedOnly: true,
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

export function getDryRunExecutionPackageBlockers(pkg: TeoyubeDryRunExecutionPackageModel): string[] {
  return pkg.blockers;
}

export function getDryRunExecutionPackageWarnings(pkg: TeoyubeDryRunExecutionPackageModel): string[] {
  return pkg.warnings;
}

export function createDryRunExecutionPackageDecision(pkg: TeoyubeDryRunExecutionPackageModel): TeoyubeDryRunExecutionPackageDecision {
  if (pkg.blockers.length) return "blocked";
  if (pkg.issueTriageReport.warnings.length || pkg.readinessScoreReport.band === "needs_phase_6_3_fix_queue") return "queue_for_phase_6_3";
  return pkg.warnings.length ? "dry_run_ready_with_warnings" : "dry_run_ready_for_owner_review";
}

export function validateDryRunExecutionPackage(pkg: TeoyubeDryRunExecutionPackageModel): TeoyubeDryRunExecutionPackageReport {
  return createDryRunExecutionPackageReport(pkg);
}

export function createDryRunExecutionPackageReport(pkg: TeoyubeDryRunExecutionPackageModel): TeoyubeDryRunExecutionPackageReport {
  const blockers = getDryRunExecutionPackageBlockers(pkg);
  return {
    valid: blockers.length === 0,
    decision: createDryRunExecutionPackageDecision(pkg),
    package: pkg,
    blockers,
    warnings: getDryRunExecutionPackageWarnings(pkg),
    readinessScore: pkg.readinessScoreReport.score,
    readinessBand: pkg.readinessScoreReport.band,
    nextActionRecommendation: "Phase 6.3 - Dry Run Fix Queue, Stabilization Pass & Operations Readiness",
    manualOnly: true,
    simulatedOnly: true,
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
