import { createPhase36QaAccessibilityValidationReport } from "../integration/phase-3-6-qa-accessibility-validation";
import { runPhase36IntegrationAudit } from "../integration/phase-3-6-integration-audit";
import { createTeoyubeAccessibilityQaReport } from "../qa/accessibility-qa-runner";
import { createMobileJourneyQaReport } from "../qa/mobile-journey-qa-runner";
import { createPhase3IntegrationReadinessReport } from "../qa/phase-3-integration-readiness-checklist";
import {
  runCallingJourneyQa,
  runFallbackJourneyQa,
  runPromiseJourneyQa,
  runRealUserJourneyQa,
  runWordJourneyQa
} from "../qa/real-user-journey-qa-runner";
import { getRealUserJourneyQaScenarios } from "../qa/real-user-journey-qa-scenarios";
import { createScriptureExplanationConfidenceQaReport } from "../qa/scripture-explanation-confidence-qa";
import { runPhase36RealUserJourneyQaExample } from "./phase-3-6-real-user-journey-qa-example";

export type TeoyubePhase36SmokeCheckResult = {
  id: string;
  passed: boolean;
  details: string;
};

export type TeoyubePhase36SmokeCheckReport = {
  valid: boolean;
  checks: TeoyubePhase36SmokeCheckResult[];
  blockers: string[];
  warnings: string[];
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function check(id: string, passed: boolean, details: string): TeoyubePhase36SmokeCheckResult {
  return { id, passed, details };
}

export function runPhase36RealUserJourneyQaSmokeCheck(): TeoyubePhase36SmokeCheckReport {
  const scenarios = getRealUserJourneyQaScenarios();
  const realUserJourneyQa = runRealUserJourneyQa();
  const wordQa = runWordJourneyQa("Benor");
  const promiseQa = runPromiseJourneyQa("PC01");
  const callingQa = runCallingJourneyQa("calling purpose");
  const fallbackQa = runFallbackJourneyQa("unsupported ambiguous request");
  const accessibilityQa = createTeoyubeAccessibilityQaReport({ surface: "home", wordId: "Benor" });
  const mobileQa = createMobileJourneyQaReport({ surface: "home", wordId: "Benor" });
  const scriptureQa = createScriptureExplanationConfidenceQaReport({ surface: "home", wordId: "Benor" });
  const readiness = createPhase3IntegrationReadinessReport({ surface: "home", wordId: "Benor" });
  const validation = createPhase36QaAccessibilityValidationReport({ surface: "home", wordId: "Benor" });
  const audit = runPhase36IntegrationAudit();
  const example = runPhase36RealUserJourneyQaExample();
  const disabledServiceFlags =
    realUserJourneyQa.noExternalServicesRequired &&
    realUserJourneyQa.noDatabasePersistenceEnabled &&
    realUserJourneyQa.noAnalyticsEnabled &&
    realUserJourneyQa.noLiveAiOrchestrationEnabled &&
    realUserJourneyQa.noBrowserPersistenceRequired &&
    realUserJourneyQa.inMemoryOnly &&
    readiness.noExternalServicesRequired &&
    readiness.noDatabasePersistenceEnabled &&
    readiness.noAnalyticsEnabled &&
    readiness.noLiveAiOrchestrationEnabled &&
    readiness.noBrowserPersistenceRequired &&
    readiness.inMemoryOnly;
  const checks = [
    check("qa_contracts_compile", scenarios.length >= 6, "Real user journey QA scenarios are available."),
    check("real_user_journey_qa", realUserJourneyQa.valid, "Real user journey QA returns a structured report."),
    check("word_journey_qa", wordQa.valid, "Word journey QA preserves real data, Scripture anchors, trace, confidence, and fallback safety."),
    check("promise_journey_qa", promiseQa.valid, "Promise journey QA preserves real cluster data and anchors."),
    check("calling_journey_qa", callingQa.valid, "Calling journey QA preserves the calling path and explanation trace."),
    check("fallback_journey_qa", fallbackQa.valid, "Fallback journey QA returns safe fallback structure."),
    check("accessibility_qa", accessibilityQa.valid, "Accessibility QA returns structured surface results."),
    check("mobile_qa", mobileQa.valid, "Mobile QA returns structured surface results."),
    check("scripture_trace_confidence_qa", scriptureQa.valid, "Scripture, explanation, confidence, and fallback QA passes."),
    check("readiness_report", readiness.valid && readiness.nextStep === "Phase 3.7 - Phase 3 Completion Review, Integration Lock & Phase 4 Roadmap", "Phase 3 readiness report is structured."),
    check("phase_3_6_validation", validation.valid, "Phase 3.6 validation report passes."),
    check("phase_3_6_audit", audit.complete && audit.completionPercentage === 100, "Phase 3.6 audit reports completion."),
    check("disabled_services", disabledServiceFlags, "No external services, database persistence, analytics, live AI orchestration, or browser persistence are required."),
    check("example_runs", example.audit.completionPercentage === audit.completionPercentage, "Phase 3.6 example runs.")
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  const warnings = [
    ...realUserJourneyQa.warnings.map((entry) => entry.message),
    ...accessibilityQa.warnings.map((entry) => entry.message),
    ...mobileQa.warnings.map((entry) => entry.message),
    ...scriptureQa.warnings.map((entry) => entry.message),
    ...readiness.warnings,
    ...validation.warnings,
    ...audit.warnings
  ];

  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
