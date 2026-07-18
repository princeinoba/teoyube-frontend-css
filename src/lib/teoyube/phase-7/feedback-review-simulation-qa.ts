import {
  createManualFeedbackReviewSimulation,
  createManualFeedbackReviewSimulationReport
} from "./manual-feedback-review-simulation";
import type { TeoyubeManualFeedbackReviewSimulation } from "./manual-feedback-review-simulation-contracts";

export type TeoyubePhase72QaCheck = {
  id: string;
  passed: boolean;
  details: string;
};

export type TeoyubeFeedbackReviewSimulationQaReport = {
  valid: boolean;
  checks: TeoyubePhase72QaCheck[];
  blockers: string[];
  warnings: string[];
  manualOnly: true;
  inMemoryOnly: true;
  noFeedbackCollectedAutomatically: true;
  noUsersContacted: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noHiddenPersonalizationCreated: true;
  generatedAt: string;
};

function check(id: string, passed: boolean, details: string): TeoyubePhase72QaCheck {
  return { id, passed, details };
}

function simulationFromInput(input?: TeoyubeManualFeedbackReviewSimulation): TeoyubeManualFeedbackReviewSimulation {
  return input || createManualFeedbackReviewSimulation();
}

export function validateFeedbackReviewSimulationSafety(input?: TeoyubeManualFeedbackReviewSimulation): TeoyubePhase72QaCheck {
  const report = createManualFeedbackReviewSimulationReport(simulationFromInput(input));
  return check("feedback_review_simulation_safety", report.valid && report.manualOnly && report.inMemoryOnly, `Simulation status: ${report.status}.`);
}

export function validateFeedbackReviewPrivacyBoundaries(input?: TeoyubeManualFeedbackReviewSimulation): TeoyubePhase72QaCheck {
  const report = createManualFeedbackReviewSimulationReport(simulationFromInput(input));
  return check("feedback_review_privacy_boundaries", report.noUsersContacted && report.noExternalWrite && report.noDatabasePersistenceEnabled && report.noAnalyticsEnabled, "Privacy boundaries remain no-contact, no-external-write, no-persistence, and no-analytics.");
}

export function validateFeedbackReviewSanitization(input?: TeoyubeManualFeedbackReviewSimulation): TeoyubePhase72QaCheck {
  const report = createManualFeedbackReviewSimulationReport(simulationFromInput(input));
  return check("feedback_review_sanitization", report.sanitizedOnly, "All simulated feedback items are sanitized and do not store raw sensitive text.");
}

export function validateFeedbackReviewNoAutomaticCollection(input?: TeoyubeManualFeedbackReviewSimulation): TeoyubePhase72QaCheck {
  const report = createManualFeedbackReviewSimulationReport(simulationFromInput(input));
  return check("feedback_review_no_automatic_collection", report.noFeedbackCollectedAutomatically && report.noUsersContacted, "No feedback is collected automatically and no users are contacted.");
}

export function validateFeedbackReviewNoPersistence(input?: TeoyubeManualFeedbackReviewSimulation): TeoyubePhase72QaCheck {
  const report = createManualFeedbackReviewSimulationReport(simulationFromInput(input));
  return check("feedback_review_no_persistence", report.inMemoryOnly && report.noDatabasePersistenceEnabled && report.noExternalWrite, "Simulation remains in-memory and writes no database or external store.");
}

export function validateFeedbackReviewNoHiddenPersonalization(input?: TeoyubeManualFeedbackReviewSimulation): TeoyubePhase72QaCheck {
  const report = createManualFeedbackReviewSimulationReport(simulationFromInput(input));
  return check("feedback_review_no_hidden_personalization", report.noHiddenPersonalizationCreated, "Simulation creates no hidden personalization.");
}

export function createFeedbackReviewSimulationQaReport(input?: TeoyubeManualFeedbackReviewSimulation): TeoyubeFeedbackReviewSimulationQaReport {
  const checks = [
    validateFeedbackReviewSimulationSafety(input),
    validateFeedbackReviewPrivacyBoundaries(input),
    validateFeedbackReviewSanitization(input),
    validateFeedbackReviewNoAutomaticCollection(input),
    validateFeedbackReviewNoPersistence(input),
    validateFeedbackReviewNoHiddenPersonalization(input)
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings: ["Feedback review QA is simulation-only and does not collect live feedback."],
    manualOnly: true,
    inMemoryOnly: true,
    noFeedbackCollectedAutomatically: true,
    noUsersContacted: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noHiddenPersonalizationCreated: true,
    generatedAt: new Date().toISOString()
  };
}
