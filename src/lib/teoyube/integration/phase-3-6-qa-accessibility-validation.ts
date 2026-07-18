import type { TeoyubeUserJourneyInput } from "../journey/user-journey-contracts";
import { createTeoyubeAccessibilityQaReport } from "../qa/accessibility-qa-runner";
import { createMobileJourneyQaReport } from "../qa/mobile-journey-qa-runner";
import {
  createPhase3IntegrationReadinessReport,
  validatePhase3IntegrationReadiness as runPhase3IntegrationReadinessChecklist
} from "../qa/phase-3-integration-readiness-checklist";
import { runRealUserJourneyQa } from "../qa/real-user-journey-qa-runner";
import { createScriptureExplanationConfidenceQaReport } from "../qa/scripture-explanation-confidence-qa";

export type TeoyubePhase36ValidationSection = {
  id: string;
  valid: boolean;
  details: string;
  blockers: string[];
  warnings: string[];
};

export type TeoyubePhase36QaAccessibilityValidationReport = {
  valid: boolean;
  status: "ready" | "ready_with_warnings" | "blocked";
  sections: TeoyubePhase36ValidationSection[];
  blockers: string[];
  warnings: string[];
  nextStep: "Phase 3.7 - Phase 3 Completion Review, Integration Lock & Phase 4 Roadmap";
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function section(
  id: string,
  valid: boolean,
  details: string,
  blockers: string[] = [],
  warnings: string[] = []
): TeoyubePhase36ValidationSection {
  return { id, valid, details, blockers, warnings };
}

export function validateRealUserJourneyQa(): TeoyubePhase36ValidationSection {
  const report = runRealUserJourneyQa();
  return section(
    "real_user_journey_qa",
    report.valid,
    `Real user journey QA ran ${report.scenarioCount} scenario(s) with decision ${report.decision}.`,
    report.blockers.map((entry) => entry.message),
    report.warnings.map((entry) => entry.message)
  );
}

export function validateAccessibilityQa(input: TeoyubeUserJourneyInput = {}): TeoyubePhase36ValidationSection {
  const report = createTeoyubeAccessibilityQaReport(input);
  return section(
    "accessibility_qa",
    report.valid,
    `Accessibility QA checked ${report.results.length} surface(s) with decision ${report.decision}.`,
    report.blockers.map((entry) => entry.message),
    report.warnings.map((entry) => entry.message)
  );
}

export function validateMobileJourneyQa(input: TeoyubeUserJourneyInput = {}): TeoyubePhase36ValidationSection {
  const report = createMobileJourneyQaReport(input);
  return section(
    "mobile_journey_qa",
    report.valid,
    `Mobile journey QA checked ${report.results.length} surface(s) with status ${report.status}.`,
    report.blockers.map((entry) => entry.message),
    report.warnings.map((entry) => entry.message)
  );
}

export function validateScriptureExplanationConfidenceQa(input: TeoyubeUserJourneyInput = {}): TeoyubePhase36ValidationSection {
  const report = createScriptureExplanationConfidenceQaReport(input);
  return section(
    "scripture_explanation_confidence_qa",
    report.valid,
    `Scripture/explanation/confidence QA ran ${report.checks.length} check(s).`,
    report.blockers.map((entry) => entry.message),
    report.warnings.map((entry) => entry.message)
  );
}

export function validatePhase3IntegrationReadinessChecklist(input: TeoyubeUserJourneyInput = {}): TeoyubePhase36ValidationSection {
  const checklist = runPhase3IntegrationReadinessChecklist(input);
  const blockers = checklist.flatMap((entry) => entry.blockers);
  const warnings = checklist.flatMap((entry) => entry.warnings);
  return section(
    "phase_3_integration_readiness_checklist",
    blockers.length === 0 && checklist.every((entry) => entry.complete),
    `Integration readiness checklist has ${checklist.length} item(s).`,
    blockers,
    warnings
  );
}

export function validatePhase36QaAccessibilityIntegration(
  input: TeoyubeUserJourneyInput = {}
): TeoyubePhase36ValidationSection[] {
  return [
    validateRealUserJourneyQa(),
    validateAccessibilityQa(input),
    validateMobileJourneyQa(input),
    validateScriptureExplanationConfidenceQa(input),
    validatePhase3IntegrationReadinessChecklist(input)
  ];
}

export function createPhase36QaAccessibilityValidationReport(
  input: TeoyubeUserJourneyInput = {}
): TeoyubePhase36QaAccessibilityValidationReport {
  const sections = validatePhase36QaAccessibilityIntegration(input);
  const readiness = createPhase3IntegrationReadinessReport(input);
  const blockers = [...sections.flatMap((entry) => entry.blockers), ...readiness.blockers];
  const warnings = [...sections.flatMap((entry) => entry.warnings), ...readiness.warnings];

  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : "ready",
    sections,
    blockers,
    warnings,
    nextStep: "Phase 3.7 - Phase 3 Completion Review, Integration Lock & Phase 4 Roadmap",
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
