import { createPhase7RemainingRiskRegister } from "../phase-7/phase-7-remaining-risk-register";
import type { TeoyubePhase7RemainingRisk } from "../phase-7/phase-7-completion-contracts";
import type {
  TeoyubeProductHardeningArea,
  TeoyubeProductHardeningBlocker,
  TeoyubeProductHardeningDecision,
  TeoyubeProductHardeningItem,
  TeoyubeProductHardeningPlan,
  TeoyubeProductHardeningPriority,
  TeoyubeProductHardeningReport,
  TeoyubeProductHardeningVerificationRequirement,
  TeoyubeProductHardeningWarning
} from "./product-hardening-plan-contracts";

type TeoyubePhase7ProductHardeningRiskArea = Extract<TeoyubePhase7RemainingRisk["area"], TeoyubeProductHardeningArea>;

function requirement(id: string, label: string, details: string, required = true): TeoyubeProductHardeningVerificationRequirement {
  return { id, label, details, required };
}

function isProductHardeningRiskArea(area: TeoyubePhase7RemainingRisk["area"]): area is TeoyubePhase7ProductHardeningRiskArea {
  return area === "scripture_anchor" ||
    area === "explanation_trace" ||
    area === "fallback" ||
    area === "confidence_label" ||
    area === "privacy_consent" ||
    area === "mobile" ||
    area === "accessibility" ||
    area === "support_workflow" ||
    area === "manual_feedback_review";
}

function item(input: Omit<TeoyubeProductHardeningItem, "verificationRequirements" | "preservesScriptureAnchors" | "preservesExplanationTraces" | "preservesFallbackSafety" | "preservesConfidenceLabels" | "preservesPrivacyConsent" | "noServiceConnection" | "noProductionJsonWrite" | "noAutomaticPublishing" | "noBrowserPersistence" | "noHiddenPersonalization" | "noDivineCertaintyClaimed"> & {
  verificationRequirements?: TeoyubeProductHardeningVerificationRequirement[];
}): TeoyubeProductHardeningItem {
  return {
    ...input,
    verificationRequirements: input.verificationRequirements || getProductHardeningVerificationRequirements({ area: input.area } as TeoyubeProductHardeningItem),
    preservesScriptureAnchors: true,
    preservesExplanationTraces: true,
    preservesFallbackSafety: true,
    preservesConfidenceLabels: true,
    preservesPrivacyConsent: true,
    noServiceConnection: true,
    noProductionJsonWrite: true,
    noAutomaticPublishing: true,
    noBrowserPersistence: true,
    noHiddenPersonalization: true,
    noDivineCertaintyClaimed: true
  };
}

export function getProductHardeningVerificationRequirements(item: Pick<TeoyubeProductHardeningItem, "area">): TeoyubeProductHardeningVerificationRequirement[] {
  const baseline = [
    requirement("scripture_anchor_preserved", "Scripture anchors preserved", "Verify Scripture anchors remain visible where available."),
    requirement("explanation_trace_preserved", "Explanation traces preserved", "Verify explanation paths remain visible."),
    requirement("fallback_safe", "Fallback remains safe", "Verify fallback copy is bounded and does not overclaim."),
    requirement("confidence_label_visible", "Confidence labels visible", "Verify confidence labels remain visible."),
    requirement("privacy_consent_visible", "Privacy/consent visible", "Verify privacy and consent notices remain visible when relevant.")
  ];
  if (item.area === "mobile" || item.area === "accessibility" || item.area === "tig_graph_explorer" || item.area === "promise_table") {
    return [...baseline, requirement("mobile_accessibility_review", "Mobile/accessibility review", "Verify wrapping, labels, keyboard/focus basics, and list fallback.")];
  }
  if (item.area === "performance") {
    return [...baseline, requirement("performance_manual_review", "Manual performance review", "Review app load perception, large list/graph rendering, and unnecessary client work without adding monitoring.")];
  }
  return baseline;
}

export function prioritizeProductHardeningItems(items: TeoyubeProductHardeningItem[]): TeoyubeProductHardeningItem[] {
  const order: Record<TeoyubeProductHardeningPriority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  return [...items].sort((a, b) => order[a.priority] - order[b.priority]);
}

export function createProductHardeningPlan(input: {
  items?: TeoyubeProductHardeningItem[];
} = {}): TeoyubeProductHardeningPlan {
  const risks = createPhase7RemainingRiskRegister().risks;
  const defaultItems: TeoyubeProductHardeningItem[] = [
    item({ id: "mobile_accessibility_hardening", area: "mobile", title: "Mobile/accessibility hardening pass", summary: "Continue manual review for WordCard, PrayerCompanion, CompassExperience, TIG panels, Promise Table, and graph/list fallback.", status: "planned", priority: "high", riskLevel: "medium", source: "phase_7_remaining_risk", safeLocalPatchCandidate: false }),
    item({ id: "product_stabilization_follow_up", area: "user_journey", title: "Product stabilization follow-up", summary: "Use Phase 7 stabilization package and regression QA to prioritize safe product hardening.", status: "planned", priority: "high", riskLevel: "medium", source: "product_stabilization_queue", safeLocalPatchCandidate: false }),
    item({ id: "performance_hardening_plan", area: "performance", title: "Performance hardening planning", summary: "Review app load perception, graph/list rendering, Promise Table rendering, and unnecessary client work using existing tooling only.", status: "planned", priority: "medium", riskLevel: "low", source: "performance_review", safeLocalPatchCandidate: false }),
    item({ id: "content_clarity_follow_up", area: "content_clarity", title: "Content clarity follow-up", summary: "Clarify copy only through reviewed, Scripture-anchored, theology-safe content review.", status: "planned", priority: "medium", riskLevel: "medium", source: "owner_planning", safeLocalPatchCandidate: false }),
    item({ id: "manual_feedback_support_patterns", area: "support_workflow", title: "Manual feedback/support pattern review", summary: "Look for recurring manually reviewed feedback/support issues without storing raw sensitive text.", status: "planned", priority: "medium", riskLevel: "medium", source: "manual_feedback_support", safeLocalPatchCandidate: false }),
    ...risks
      .filter((risk): risk is TeoyubePhase7RemainingRisk & { area: TeoyubePhase7ProductHardeningRiskArea } => isProductHardeningRiskArea(risk.area))
      .map((risk) => item({
        id: `risk_${risk.id}`,
        area: risk.area,
        title: risk.message,
        summary: risk.mitigation,
        status: "planned",
        priority: risk.severity === "critical" ? "critical" : risk.severity === "high" ? "high" : "medium",
        riskLevel: risk.severity === "critical" ? "blocked" : risk.severity,
        source: "phase_7_remaining_risk",
        safeLocalPatchCandidate: false
      }))
  ];
  return {
    id: "phase_8_1_product_hardening_plan",
    items: prioritizeProductHardeningItems(input.items || defaultItems),
    noProductChangesApplied: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}

export function getProductHardeningItemsByArea(plan: TeoyubeProductHardeningPlan, area: TeoyubeProductHardeningArea): TeoyubeProductHardeningItem[] {
  return plan.items.filter((entry) => entry.area === area);
}

export function getHighPriorityProductHardeningItems(plan: TeoyubeProductHardeningPlan): TeoyubeProductHardeningItem[] {
  return plan.items.filter((entry) => entry.priority === "critical" || entry.priority === "high");
}

export function getDeferredProductHardeningItems(plan: TeoyubeProductHardeningPlan): TeoyubeProductHardeningItem[] {
  return plan.items.filter((entry) => entry.status === "deferred");
}

export function getBlockedProductHardeningItems(plan: TeoyubeProductHardeningPlan): TeoyubeProductHardeningItem[] {
  return plan.items.filter((entry) => entry.status === "blocked" || entry.riskLevel === "blocked");
}

function getProductHardeningBlockers(plan: TeoyubeProductHardeningPlan): TeoyubeProductHardeningBlocker[] {
  return [
    ...getBlockedProductHardeningItems(plan).map((entry) => ({
      id: `${entry.id}_blocked`,
      itemId: entry.id,
      area: entry.area,
      message: entry.blockedReason || `${entry.title} is blocked.`,
      requiredAction: "Resolve or defer with owner review before Phase 8.2 execution."
    })),
    ...(!plan.noProductChangesApplied || !plan.inMemoryOnly || !plan.noExternalServicesRequired || !plan.noDatabasePersistenceEnabled || !plan.noAnalyticsEnabled || !plan.noLiveAiOrchestrationEnabled
      ? [{ id: "hardening_plan_boundary_broken", area: "unknown" as const, message: "Product hardening plan must remain planning-only, in-memory, service-disabled, no-persistence, no-analytics, and no-live-AI.", requiredAction: "Restore Phase 8.1 planning boundaries." }]
      : [])
  ];
}

function getProductHardeningWarnings(plan: TeoyubeProductHardeningPlan): TeoyubeProductHardeningWarning[] {
  return [
    ...getDeferredProductHardeningItems(plan).map((entry) => ({
      id: `${entry.id}_deferred`,
      itemId: entry.id,
      area: entry.area,
      message: entry.deferredReason || `${entry.title} is deferred.`,
      recommendedAction: "Carry deferred item into owner review."
    })),
    ...plan.items.filter((entry) => entry.safeLocalPatchCandidate).map((entry) => ({
      id: `${entry.id}_safe_patch_candidate`,
      itemId: entry.id,
      area: entry.area,
      message: `${entry.title} may be a safe local hardening candidate but was not applied in Phase 8.1.`,
      recommendedAction: "Validate with safe hardening patch validator before Phase 8.2 execution."
    }))
  ];
}

export function createProductHardeningPlanDecision(plan: TeoyubeProductHardeningPlan): TeoyubeProductHardeningDecision {
  const blockers = getProductHardeningBlockers(plan);
  const warnings = getProductHardeningWarnings(plan);
  if (blockers.length) return "blocked";
  return warnings.length ? "hardening_plan_ready_with_warnings" : "hardening_plan_ready";
}

export function createProductHardeningPlanReport(plan: TeoyubeProductHardeningPlan = createProductHardeningPlan()): TeoyubeProductHardeningReport {
  const blockers = getProductHardeningBlockers(plan);
  return {
    valid: blockers.length === 0,
    decision: createProductHardeningPlanDecision(plan),
    plan,
    blockers,
    warnings: getProductHardeningWarnings(plan),
    highPriorityItems: getHighPriorityProductHardeningItems(plan),
    deferredItems: getDeferredProductHardeningItems(plan),
    blockedItems: getBlockedProductHardeningItems(plan),
    noProductChangesApplied: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
