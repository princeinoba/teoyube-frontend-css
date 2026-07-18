import {
  createDefaultTeoyubeConsentControlState,
  runPromiseClusterTigProduction,
  runTeoyubePersonalizationProductionPreview
} from "../../../tig";
import { getMobileSurfaceReadinessReport } from "../mobile-surface-inventory";
import {
  getRecommendedLayoutMode,
  getSurfaceResponsiveStrategy
} from "../responsive-layout-strategy";
import {
  getPhase72MobileUiOptimizationReadiness,
  toMobileConsentControlLayout,
  toMobileExplanationPathLayout,
  toMobileGraphPreviewLayout,
  toMobilePersonalizationPreviewLayout,
  toMobileTigResponseLayout
} from "../mobile-ui-adapters";

export function runPhase7MobileUiOptimizationExample() {
  const mobileWidth = 390;
  const layoutMode = getRecommendedLayoutMode(mobileWidth);
  const productionResponse = runPromiseClusterTigProduction({
    input: "I feel stuck and need a Scripture-backed promise.",
    userState: "feeling stuck and discouraged",
    emotion: "discouragement",
    selectedWordId: "word_strength",
    selectedClusterId: "cluster_strength_in_waiting"
  });
  const consentState = createDefaultTeoyubeConsentControlState();
  const personalizationPreview = runTeoyubePersonalizationProductionPreview({
    productionInput: productionResponse.input,
    mode: "comparison",
    consent: consentState.consent,
    preferenceHints: ["prefer concise prayers", "show action step early"]
  });

  return {
    mobileWidth,
    layoutMode,
    responsiveStrategy: getSurfaceResponsiveStrategy("tig_response_panel"),
    tigResponseLayout: toMobileTigResponseLayout(productionResponse, layoutMode),
    graphPreviewLayout: toMobileGraphPreviewLayout(productionResponse.visualization, layoutMode),
    explanationPathLayout: toMobileExplanationPathLayout(productionResponse.explanation, layoutMode),
    personalizationPreviewLayout: toMobilePersonalizationPreviewLayout(
      personalizationPreview,
      layoutMode
    ),
    consentControlLayout: toMobileConsentControlLayout(consentState, layoutMode),
    surfaceReadiness: getMobileSurfaceReadinessReport(),
    mobileUiReadiness: getPhase72MobileUiOptimizationReadiness()
  };
}
