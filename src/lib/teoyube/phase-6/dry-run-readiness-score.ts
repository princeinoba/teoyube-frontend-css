import { createDryRunDisabledServiceVerificationReport } from "./dry-run-disabled-service-verification";
import { createDryRunIssueTriageReport } from "./dry-run-issue-triage";
import type { TeoyubeDryRunIssue } from "./dry-run-issue-triage-contracts";
import { createDryRunMobileAccessibilityReport } from "./dry-run-mobile-accessibility-verification";
import { createDryRunPauseRollbackReport } from "./dry-run-pause-rollback-simulation";
import { createDryRunScriptureExplanationFallbackReport } from "./dry-run-scripture-explanation-fallback-verification";
import { createFeedbackIntakeSimulation, createFeedbackIntakeSimulationReport } from "./feedback-intake-simulation";
import type { TeoyubeFeedbackIntakeSimulationItem } from "./feedback-intake-simulation-contracts";
import { createManualBetaDryRun, createManualBetaDryRunReport } from "./manual-beta-dry-run-runner";
import { getManualBetaDryRunScenarios } from "./manual-beta-dry-run-scenarios";
import type { TeoyubeManualBetaDryRunResult } from "./manual-beta-dry-run-contracts";
import { createSimulatedParticipantSession, createSimulatedParticipantSessionReport } from "./simulated-participant-session";
import type { TeoyubeSimulatedParticipantObservation } from "./simulated-participant-session-contracts";

export type TeoyubeDryRunReadinessScoreBand =
  | "ready_for_owner_review"
  | "ready_with_warnings"
  | "needs_phase_6_3_fix_queue"
  | "blocked";

export type TeoyubeDryRunReadinessScoreInput = {
  issues?: TeoyubeDryRunIssue[];
  feedbackItems?: TeoyubeFeedbackIntakeSimulationItem[];
};

export type TeoyubeDryRunReadinessScoreReport = {
  valid: boolean;
  score: number;
  band: TeoyubeDryRunReadinessScoreBand;
  blockers: string[];
  warnings: string[];
  manualOnly: true;
  simulatedOnly: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function baselineDryRunResults(): TeoyubeManualBetaDryRunResult[] {
  const recordedAt = new Date().toISOString();
  return getManualBetaDryRunScenarios().map((scenario, index) => ({
    id: `baseline_dry_run_result_${index + 1}`,
    scenarioId: scenario.id,
    area: scenario.area,
    status: "passed",
    notes: "Baseline simulated dry-run result preserves manual, in-memory, service-disabled boundaries.",
    simulatedOnly: true,
    recordedAt
  }));
}

function baselineParticipantObservations(): TeoyubeSimulatedParticipantObservation[] {
  return [{
    id: "baseline_simulated_participant_observation",
    surface: "manual_beta_dry_run",
    note: "Owner confirms simulated participant can see limitations, privacy reminders, Scripture anchors, explanation paths, fallback states, and confidence labels.",
    sanitized: true,
    recordedByOwner: true,
    simulatedOnly: true,
    createdAt: new Date().toISOString()
  }];
}

export function getDryRunReadinessScoreBand(score: number, blockers: string[] = []): TeoyubeDryRunReadinessScoreBand {
  if (blockers.length || score < 75) return "blocked";
  if (score < 90) return "needs_phase_6_3_fix_queue";
  if (score < 100) return "ready_with_warnings";
  return "ready_for_owner_review";
}

export function calculateDryRunReadinessScore(input: TeoyubeDryRunReadinessScoreInput = {}): number {
  const issues = input.issues || [];
  const feedbackItems = input.feedbackItems || [];
  const dryRun = createManualBetaDryRun({ results: baselineDryRunResults() });
  const participantSession = createSimulatedParticipantSession({ observations: baselineParticipantObservations() });
  const feedbackSimulation = createFeedbackIntakeSimulation({ items: feedbackItems });
  const reports = [
    createManualBetaDryRunReport(dryRun),
    createSimulatedParticipantSessionReport(participantSession),
    createFeedbackIntakeSimulationReport(feedbackSimulation),
    createDryRunIssueTriageReport(issues),
    createDryRunPauseRollbackReport(issues),
    createDryRunDisabledServiceVerificationReport(),
    createDryRunScriptureExplanationFallbackReport(),
    createDryRunMobileAccessibilityReport()
  ];
  const invalidPenalty = reports.filter((report) => !report.valid).length * 15;
  const warningPenalty = Math.min(10, reports.reduce((total, report) => total + report.warnings.length, 0));
  return Math.max(0, 100 - invalidPenalty - warningPenalty);
}

export function createDryRunReadinessScoreReport(input: TeoyubeDryRunReadinessScoreInput = {}): TeoyubeDryRunReadinessScoreReport {
  const issues = input.issues || [];
  const feedbackItems = input.feedbackItems || [];
  const dryRun = createManualBetaDryRun({ results: baselineDryRunResults() });
  const participantSession = createSimulatedParticipantSession({ observations: baselineParticipantObservations() });
  const feedbackSimulation = createFeedbackIntakeSimulation({ items: feedbackItems });
  const dryRunReport = createManualBetaDryRunReport(dryRun);
  const participantSessionReport = createSimulatedParticipantSessionReport(participantSession);
  const feedbackSimulationReport = createFeedbackIntakeSimulationReport(feedbackSimulation);
  const issueTriageReport = createDryRunIssueTriageReport(issues);
  const pauseRollbackReport = createDryRunPauseRollbackReport(issues);
  const disabledServiceVerificationReport = createDryRunDisabledServiceVerificationReport();
  const scriptureExplanationFallbackReport = createDryRunScriptureExplanationFallbackReport();
  const mobileAccessibilityReport = createDryRunMobileAccessibilityReport();
  const blockers = [
    ...dryRunReport.blockers.map((entry) => entry.message),
    ...participantSessionReport.blockers.map((entry) => entry.message),
    ...feedbackSimulationReport.blockers.map((entry) => entry.message),
    ...issueTriageReport.blockers.map((entry) => entry.message),
    ...pauseRollbackReport.blockers,
    ...disabledServiceVerificationReport.blockers,
    ...scriptureExplanationFallbackReport.blockers,
    ...mobileAccessibilityReport.blockers
  ];
  const warnings = [
    ...dryRunReport.warnings.map((entry) => entry.message),
    ...participantSessionReport.warnings.map((entry) => entry.message),
    ...feedbackSimulationReport.warnings.map((entry) => entry.message),
    ...issueTriageReport.warnings.map((entry) => entry.message),
    ...pauseRollbackReport.warnings,
    ...disabledServiceVerificationReport.warnings,
    ...scriptureExplanationFallbackReport.warnings,
    ...mobileAccessibilityReport.warnings
  ];
  const score = calculateDryRunReadinessScore(input);
  return {
    valid: blockers.length === 0,
    score,
    band: getDryRunReadinessScoreBand(score, blockers),
    blockers,
    warnings,
    manualOnly: true,
    simulatedOnly: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
