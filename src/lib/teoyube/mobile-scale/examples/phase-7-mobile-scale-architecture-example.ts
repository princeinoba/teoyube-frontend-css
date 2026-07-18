import { getTeoyubeAnalyticsReadinessPlan } from "../analytics-readiness-plan";
import {
  getTeoyubeMobileCacheStrategy,
  getTeoyubeOfflineReadOnlyStrategy
} from "../cache-offline-strategy";
import {
  getMobileSurfaceReadinessReport,
  getTeoyubeMobileSurfaceInventory
} from "../mobile-surface-inventory";
import {
  getMobileAccessibilityChecklist,
  getMobileConsentControlRequirements,
  getMobileSafetyChecklist
} from "../mobile-safety-accessibility";
import { runPhase7MobileScaleArchitectureAudit } from "../phase-7-mobile-scale-architecture-audit";
import { createPhase7PerformanceReadinessReport } from "../performance-budget";
import { getTeoyubePersistenceReadinessPlan } from "../persistence-readiness-plan";
import {
  getGraphPreviewResponsiveRules,
  getPersonalizationControlsResponsiveRules,
  getTeoyubeResponsiveBreakpoints,
  getTigPanelResponsiveRules
} from "../responsive-layout-strategy";

export function runPhase7MobileScaleArchitectureExample() {
  const inventory = getTeoyubeMobileSurfaceInventory();
  const surfaceReadiness = getMobileSurfaceReadinessReport();
  const breakpoints = getTeoyubeResponsiveBreakpoints();
  const responsiveRules = {
    tigPanel: getTigPanelResponsiveRules(),
    graphPreview: getGraphPreviewResponsiveRules(),
    personalizationControls: getPersonalizationControlsResponsiveRules()
  };
  const performance = createPhase7PerformanceReadinessReport();
  const cache = getTeoyubeMobileCacheStrategy();
  const offline = getTeoyubeOfflineReadOnlyStrategy();
  const analytics = getTeoyubeAnalyticsReadinessPlan();
  const persistence = getTeoyubePersistenceReadinessPlan();
  const safety = getMobileSafetyChecklist();
  const accessibility = getMobileAccessibilityChecklist();
  const consentControls = getMobileConsentControlRequirements();
  const audit = runPhase7MobileScaleArchitectureAudit();

  return {
    inventory,
    surfaceReadiness,
    breakpoints,
    responsiveRules,
    performance,
    cache,
    offline,
    analytics,
    persistence,
    safety,
    accessibility,
    consentControls,
    audit
  };
}
