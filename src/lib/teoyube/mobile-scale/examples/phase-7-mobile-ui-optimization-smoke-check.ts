import {
  createDefaultTeoyubeConsentControlState,
  runPromiseClusterTigProduction,
  runTeoyubePersonalizationProductionPreview
} from "../../../tig";
import {
  getMobileSurfaceReadinessReport,
  getTeoyubeMobileSurfaceInventory
} from "../mobile-surface-inventory";
import {
  getRecommendedLayoutMode,
  getTeoyubeResponsiveBreakpoints
} from "../responsive-layout-strategy";
import {
  getPhase72MobileUiOptimizationReadiness,
  toMobileConsentControlLayout,
  toMobileExplanationPathLayout,
  toMobileGraphPreviewLayout,
  toMobilePersonalizationPreviewLayout,
  toMobileTigResponseLayout
} from "../mobile-ui-adapters";
import { runPhase7MobileScaleArchitectureAudit } from "../phase-7-mobile-scale-architecture-audit";
import { runPhase7MobileUiOptimizationExample } from "./phase-7-mobile-ui-optimization-example";

export type Phase7MobileUiOptimizationSmokeCheckResult = {
  name: string;
  valid: boolean;
  errors: string[];
};

export type Phase7MobileUiOptimizationSmokeCheckReport = {
  valid: boolean;
  errors: string[];
  resultCount: number;
  results: Phase7MobileUiOptimizationSmokeCheckResult[];
};

function result(
  name: string,
  errors: string[]
): Phase7MobileUiOptimizationSmokeCheckResult {
  return {
    name,
    valid: errors.length === 0,
    errors
  };
}

function clean(errors: string[]): string[] {
  return errors.filter(Boolean);
}

export function runPhase7MobileUiOptimizationSmokeCheck(): Phase7MobileUiOptimizationSmokeCheckReport {
  const inventory = getTeoyubeMobileSurfaceInventory();
  const surfaceReport = getMobileSurfaceReadinessReport();
  const breakpoints = getTeoyubeResponsiveBreakpoints();
  const layoutMode = getRecommendedLayoutMode(390);
  const productionResponse = runPromiseClusterTigProduction();
  const tigLayout = toMobileTigResponseLayout(productionResponse, layoutMode);
  const graphLayout = toMobileGraphPreviewLayout(productionResponse.visualization, layoutMode);
  const explanationLayout = toMobileExplanationPathLayout(productionResponse.explanation, layoutMode);
  const consentState = createDefaultTeoyubeConsentControlState();
  const preview = runTeoyubePersonalizationProductionPreview({
    productionInput: productionResponse.input,
    mode: "comparison",
    consent: consentState.consent
  });
  const personalizationLayout = toMobilePersonalizationPreviewLayout(preview, layoutMode);
  const consentLayout = toMobileConsentControlLayout(consentState, layoutMode);
  const readiness = getPhase72MobileUiOptimizationReadiness();
  const audit = runPhase7MobileScaleArchitectureAudit();
  const example = runPhase7MobileUiOptimizationExample();
  const warningText = readiness.warnings.join(" ").toLowerCase();

  const results = [
    result("mobile surface inventory still loads", clean([
      inventory.length >= 12 ? "" : "Inventory should include the major Teoyube mobile surfaces.",
      surfaceReport.surfaceCount === inventory.length ? "" : "Surface readiness count should match inventory."
    ])),
    result("responsive layout strategy exists", clean([
      breakpoints.length >= 6 ? "" : "Responsive breakpoints should be present.",
      layoutMode === "mobile_compact" ? "" : "390px should resolve to mobile_compact."
    ])),
    result("TIG response panel mobile layout props can be created", clean([
      tigLayout.sections.length >= 7 ? "" : "TIG mobile layout should include primary and diagnostic sections.",
      tigLayout.scriptureAnchorVisible ? "" : "Scripture anchor must remain visible.",
      tigLayout.minTouchTargetPx >= 44 ? "" : "TIG response touch targets should be at least 44px."
    ])),
    result("graph preview mobile layout props can be created", clean([
      graphLayout.displayMode === "compact_path" ? "" : "Mobile graph should prefer compact_path.",
      graphLayout.compactNodeIds.length ? "" : "Compact graph path should include nodes.",
      graphLayout.expandedGraphCollapsible ? "" : "Expanded graph should be collapsible on mobile."
    ])),
    result("explanation path mobile layout props can be created", clean([
      explanationLayout.stepCount > 0 ? "" : "Explanation path should expose ordered steps.",
      explanationLayout.collapsible ? "" : "Explanation path should be collapsible on compact mobile."
    ])),
    result("personalization preview mobile layout props can be created", clean([
      personalizationLayout.baselineAndPersonalizedStacked ? "" : "Preview should stack baseline and personalized sections on mobile.",
      personalizationLayout.preferenceHintsCollapsible ? "" : "Preference hints should be collapsible.",
      personalizationLayout.debugHiddenByDefault ? "" : "Debug details should be hidden by default."
    ])),
    result("consent controls mobile layout props can be created", clean([
      consentLayout.minTouchTargetPx >= 44 ? "" : "Consent controls should use touch-friendly targets.",
      consentLayout.consentStateVisible ? "" : "Consent state should remain visible.",
      consentLayout.destructiveActionsRequireConfirmation ? "" : "Destructive data actions should require confirmation."
    ])),
    result("no prohibited runtime dependencies are required", clean([
      warningText.includes("does not connect production database persistence")
        ? ""
        : "Readiness warnings should prohibit production database persistence.",
      warningText.includes("does not send external analytics")
        ? ""
        : "Readiness warnings should prohibit external analytics sending.",
      warningText.includes("does not add live ai orchestration")
        ? ""
        : "Readiness warnings should prohibit live AI orchestration.",
      warningText.includes("does not implement service workers")
        ? ""
        : "Readiness warnings should prohibit service workers in Phase 7.2.",
      warningText.includes("does not require localstorage")
        ? ""
        : "Adapters should not require localStorage, cookies, or file writes."
    ])),
    result("Phase 7.2 readiness remains complete while architecture advances", clean([
      readiness.complete ? "" : "Phase 7.2 mobile UI readiness should be complete.",
      audit.complete ? "" : "Architecture audit should be complete.",
      audit.nextStep === "Production Launch Preparation"
        ? ""
        : "Architecture audit should advance to Production Launch Preparation after Phase 7 completion."
    ])),
    result("mobile UI example returns readiness summary", clean([
      example.mobileUiReadiness.complete ? "" : "Example should include completed Phase 7.2 readiness.",
      example.tigResponseLayout.scriptureAnchorVisible ? "" : "Example should preserve Scripture anchoring."
    ]))
  ];
  const errors = results.flatMap((item) =>
    item.errors.map((error) => `${item.name}: ${error}`)
  );

  return {
    valid: errors.length === 0,
    errors,
    resultCount: results.length,
    results
  };
}
