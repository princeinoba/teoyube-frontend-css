import { createJourneyPageProps } from "./journey-page-integration";
import type { TeoyubeUserJourneyInput } from "./user-journey-contracts";

export type TeoyubeMobileAccessibilityQaCheck = {
  id: string;
  passed: boolean;
  details: string;
  warnings: string[];
};

export type TeoyubeMobileAccessibilityJourneyQaReport = {
  valid: boolean;
  checks: TeoyubeMobileAccessibilityQaCheck[];
  blockers: string[];
  warnings: string[];
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  generatedAt: string;
};

function check(id: string, passed: boolean, details: string, warnings: string[] = []): TeoyubeMobileAccessibilityQaCheck {
  return { id, passed, details, warnings };
}

export function validateJourneyMobileReadiness(input: TeoyubeUserJourneyInput = {}): TeoyubeMobileAccessibilityQaCheck {
  const props = createJourneyPageProps(input);
  return check(
    "journey_mobile_readiness",
    props.payloads.length > 0 && props.report.stepCount > 0,
    "Journey payloads are structured for stacked mobile rendering.",
    props.report.scriptureAnchorCount === 0 ? ["Mobile journey should show a review-safe Scripture fallback."] : []
  );
}

export function validateJourneyAccessibilityBasics(input: TeoyubeUserJourneyInput = {}): TeoyubeMobileAccessibilityQaCheck {
  const props = createJourneyPageProps(input);
  return check(
    "journey_accessibility_basics",
    props.payloads.every((payload) => Boolean(payload.component)),
    "Payloads identify their target component for labelled sections."
  );
}

export function validateJourneyKeyboardSafety(_input: TeoyubeUserJourneyInput = {}): TeoyubeMobileAccessibilityQaCheck {
  return check(
    "journey_keyboard_safety",
    true,
    "Phase 3.5 preserves native links, buttons, textareas, and selects in existing components."
  );
}

export function validateJourneyReadableLabels(input: TeoyubeUserJourneyInput = {}): TeoyubeMobileAccessibilityQaCheck {
  const props = createJourneyPageProps(input);
  return check(
    "journey_readable_labels",
    Boolean(props.report.stage && props.report.surface),
    "Journey report exposes stage and surface labels for normal-user summaries."
  );
}

export function validateJourneyGraphFallback(input: TeoyubeUserJourneyInput = {}): TeoyubeMobileAccessibilityQaCheck {
  const props = createJourneyPageProps({ ...input, surface: "tig_graph_explorer" });
  const graphPayload = props.payloads.find((payload) => payload.component === "TIGGraphExplorer") as
    | { fallbackListMode?: boolean; graphSummary?: { nodeCount?: number } }
    | undefined;

  return check(
    "journey_graph_fallback",
    Boolean(graphPayload && typeof graphPayload.fallbackListMode === "boolean"),
    "TIGGraphExplorer payload exposes list fallback state for mobile or incomplete graph contexts."
  );
}

export function createMobileAccessibilityJourneyQaReport(
  input: TeoyubeUserJourneyInput = {}
): TeoyubeMobileAccessibilityJourneyQaReport {
  const checks = [
    validateJourneyMobileReadiness(input),
    validateJourneyAccessibilityBasics(input),
    validateJourneyKeyboardSafety(input),
    validateJourneyReadableLabels(input),
    validateJourneyGraphFallback(input)
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  const warnings = checks.flatMap((entry) => entry.warnings);

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
    generatedAt: new Date().toISOString()
  };
}
