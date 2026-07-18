import type {
  TeoyubeMobilePriority,
  TeoyubeMobileSurface,
  TeoyubeMobileSurfaceInventoryItem,
  TeoyubeScaleReadinessStatus
} from "./mobile-scale-contracts";

const INVENTORY: TeoyubeMobileSurfaceInventoryItem[] = [
  {
    id: "canon",
    label: "Canon",
    route: "/canon",
    primaryComponent: "TigSurfaceProductionSection",
    currentMobileReadinessEstimate: 0.8,
    mobileRiskLevel: "low",
    priority: "high",
    requiredImprovements: ["Continue real-device testing", "Tune dense canon data as more content is added"],
    productionDependency: "Phase 5B.3 production surface runner",
    personalizationDependency: "Phase 6 preview-safe preference hints"
  },
  {
    id: "daily_word",
    label: "Daily Word",
    route: "/daily-word",
    primaryComponent: "TigSurfaceProductionSection",
    currentMobileReadinessEstimate: 0.84,
    mobileRiskLevel: "low",
    priority: "high",
    requiredImprovements: ["Add offline read-only devotional state in Phase 7.3"],
    productionDependency: "Phase 5B.3 daily word surface adapter",
    personalizationDependency: "Phase 6 session-safe continuity hints"
  },
  {
    id: "prayer",
    label: "Prayer",
    route: "/prayer",
    primaryComponent: "TigSurfaceProductionSection",
    currentMobileReadinessEstimate: 0.82,
    mobileRiskLevel: "low",
    priority: "high",
    requiredImprovements: ["Continue testing long prayer rendering on small devices"],
    productionDependency: "Phase 5B.3 prayer surface adapter",
    personalizationDependency: "Phase 6 feedback controls"
  },
  {
    id: "calling_compass",
    label: "Calling Compass",
    route: "/calling-compass",
    primaryComponent: "TigSurfaceProductionSection",
    currentMobileReadinessEstimate: 0.8,
    mobileRiskLevel: "medium",
    priority: "medium",
    requiredImprovements: ["Validate journey path readability with larger calling seed sets"],
    productionDependency: "Phase 5B.3 calling compass surface adapter",
    personalizationDependency: "Phase 6 consent-aware calling continuity hints"
  },
  {
    id: "promise_cluster",
    label: "Promise Cluster",
    route: "/tig",
    primaryComponent: "TIGSearchPanel",
    currentMobileReadinessEstimate: 0.86,
    mobileRiskLevel: "low",
    priority: "critical",
    requiredImprovements: ["Measure graph preview render cost in Phase 7.3"],
    productionDependency: "Phase 5B.3 promise cluster production path",
    personalizationDependency: "Phase 6 personalized production preview"
  },
  {
    id: "ai_companion",
    label: "AI Companion",
    route: "/tig",
    primaryComponent: "TIGSearchPanel",
    currentMobileReadinessEstimate: 0.8,
    mobileRiskLevel: "medium",
    priority: "high",
    requiredImprovements: ["Continue constraining future companion output length on mobile"],
    productionDependency: "Phase 5B.3 AI companion surface adapter",
    personalizationDependency: "Phase 6 consent, feedback, and preference controls"
  },
  {
    id: "onboarding",
    label: "Onboarding",
    route: "/tig/onboarding",
    primaryComponent: "TIGOnboardingPanel",
    currentMobileReadinessEstimate: 0.84,
    mobileRiskLevel: "low",
    priority: "medium",
    requiredImprovements: ["Continue first-run flow testing on small phones"],
    productionDependency: "Phase 5B.3 production explanation language",
    personalizationDependency: "Phase 6 consent education"
  },
  {
    id: "personalization_controls",
    label: "Personalization Consent Controls",
    route: "/tig/privacy",
    primaryComponent: "TigPersonalizationConsentPanel",
    currentMobileReadinessEstimate: 0.86,
    mobileRiskLevel: "low",
    priority: "critical",
    requiredImprovements: ["Preserve clear confirmation flows when production persistence is added"],
    productionDependency: "Phase 5B.3 guardrails",
    personalizationDependency: "Phase 6 consent controls"
  },
  {
    id: "feedback_controls",
    label: "Feedback Controls",
    route: "/tig",
    primaryComponent: "TigPersonalizationFeedbackControls",
    currentMobileReadinessEstimate: 0.84,
    mobileRiskLevel: "low",
    priority: "high",
    requiredImprovements: ["Keep action impact explanations short as feedback options expand"],
    productionDependency: "Phase 5B.3 event payload shape",
    personalizationDependency: "Phase 6 feedback loop"
  },
  {
    id: "tig_response_panel",
    label: "TIG Response Panel",
    route: "/tig",
    primaryComponent: "TIGResponsePanel",
    currentMobileReadinessEstimate: 0.88,
    mobileRiskLevel: "low",
    priority: "critical",
    requiredImprovements: ["Measure mobile render cost and hydration in Phase 7.3"],
    productionDependency: "Phase 5B.3 production response contract",
    personalizationDependency: "Phase 6 preview and feedback summaries"
  },
  {
    id: "tig_graph_preview",
    label: "TIG Graph Preview",
    route: "/tig/graph",
    primaryComponent: "TIGGraphMap",
    currentMobileReadinessEstimate: 0.78,
    mobileRiskLevel: "medium",
    priority: "medium",
    requiredImprovements: ["Add performance caps and caching in Phase 7.3"],
    productionDependency: "Phase 5B.2 visualization-ready graph structure",
    personalizationDependency: "Phase 6 decision trace compatibility"
  },
  {
    id: "personalization_preview",
    label: "Personalization Preview Panel",
    route: "/tig",
    primaryComponent: "TigPersonalizationPreviewPanel",
    currentMobileReadinessEstimate: 0.82,
    mobileRiskLevel: "low",
    priority: "medium",
    requiredImprovements: ["Continue tuning comparison density as preview signals expand"],
    productionDependency: "Phase 5B.3 production response comparison",
    personalizationDependency: "Phase 6 personalized preview service"
  }
];

export function getTeoyubeMobileSurfaceInventory(): TeoyubeMobileSurfaceInventoryItem[] {
  return INVENTORY.map((surface) => ({
    ...surface,
    requiredImprovements: [...surface.requiredImprovements]
  }));
}

export function getMobileSurfaceById(
  id: TeoyubeMobileSurface
): TeoyubeMobileSurfaceInventoryItem | undefined {
  return getTeoyubeMobileSurfaceInventory().find((surface) => surface.id === id);
}

export function getMobileSurfacesByPriority(
  priority: TeoyubeMobilePriority
): TeoyubeMobileSurfaceInventoryItem[] {
  return getTeoyubeMobileSurfaceInventory().filter((surface) => surface.priority === priority);
}

export function getMobileSurfaceReadinessReport(): {
  status: TeoyubeScaleReadinessStatus;
  surfaceCount: number;
  averageReadiness: number;
  highRiskSurfaceIds: TeoyubeMobileSurface[];
  criticalSurfaceIds: TeoyubeMobileSurface[];
  warnings: string[];
} {
  const inventory = getTeoyubeMobileSurfaceInventory();
  const averageReadiness =
    inventory.reduce((sum, surface) => sum + surface.currentMobileReadinessEstimate, 0) /
    Math.max(1, inventory.length);
  const highRiskSurfaceIds = inventory
    .filter((surface) => surface.mobileRiskLevel === "high")
    .map((surface) => surface.id);

  return {
    status: averageReadiness >= 0.7 ? "ready" : "planned",
    surfaceCount: inventory.length,
    averageReadiness: Number(averageReadiness.toFixed(2)),
    highRiskSurfaceIds,
    criticalSurfaceIds: inventory
      .filter((surface) => surface.priority === "critical")
      .map((surface) => surface.id),
    warnings: highRiskSurfaceIds.length
      ? ["High-risk mobile surfaces should receive compact layouts before broad mobile launch."]
      : []
  };
}
