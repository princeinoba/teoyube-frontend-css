import { createJourneyPageProps } from "../journey/journey-page-integration";
import { createMobileJourneyQaReport } from "../qa/mobile-journey-qa-runner";
import { createPhase3IntegrationReadinessReport } from "../qa/phase-3-integration-readiness-checklist";
import {
  runCallingJourneyQa,
  runFallbackJourneyQa,
  runPromiseJourneyQa,
  runRealUserJourneyQa,
  runWordJourneyQa
} from "../qa/real-user-journey-qa-runner";
import { createTeoyubeAccessibilityQaReport } from "../qa/accessibility-qa-runner";
import { createScriptureExplanationConfidenceQaReport } from "../qa/scripture-explanation-confidence-qa";
import { createPhase36QaAccessibilityValidationReport } from "../integration/phase-3-6-qa-accessibility-validation";
import { runPhase36IntegrationAudit } from "../integration/phase-3-6-integration-audit";

export function runPhase36RealUserJourneyQaExample() {
  const baseInput = {
    surface: "home" as const,
    wordId: "Benor",
    query: "calling purpose",
    safeDisplayLabel: "Phase 3.6 real journey QA"
  };

  return {
    pageProps: createJourneyPageProps(baseInput),
    realUserJourneyQa: runRealUserJourneyQa(),
    wordJourneyQa: runWordJourneyQa("Benor"),
    promiseJourneyQa: runPromiseJourneyQa("PC01"),
    callingJourneyQa: runCallingJourneyQa("calling purpose builder"),
    fallbackJourneyQa: runFallbackJourneyQa("unsupported ambiguous request"),
    accessibilityQa: createTeoyubeAccessibilityQaReport(baseInput),
    mobileJourneyQa: createMobileJourneyQaReport(baseInput),
    scriptureExplanationConfidenceQa: createScriptureExplanationConfidenceQaReport(baseInput),
    readinessReport: createPhase3IntegrationReadinessReport(baseInput),
    validation: createPhase36QaAccessibilityValidationReport(baseInput),
    audit: runPhase36IntegrationAudit()
  };
}
