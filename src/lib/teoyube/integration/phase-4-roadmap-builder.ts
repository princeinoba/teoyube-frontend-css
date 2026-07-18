import type {
  TeoyubePhase4RoadmapDecision,
  TeoyubePhase4RoadmapItem,
  TeoyubePhase4RoadmapReport,
  TeoyubePhase4RoadmapRisk,
  TeoyubePhase4RoadmapTheme
} from "./phase-4-roadmap-contracts";

function roadmapItem(
  id: string,
  theme: TeoyubePhase4RoadmapTheme,
  title: string,
  priority: TeoyubePhase4RoadmapItem["priority"],
  summary: string,
  protects: string[],
  blockedBy: string[] = []
): TeoyubePhase4RoadmapItem {
  return {
    id,
    theme,
    title,
    priority,
    status: blockedBy.length ? "ready_for_owner_review" : "planned",
    summary,
    protects,
    blockedBy,
    doesNotConnectServices: true
  };
}

export function createPhase4Roadmap(): TeoyubePhase4RoadmapItem[] {
  return [
    roadmapItem("phase_4_1_product_experience_audit", "production_ui_hardening", "Product experience audit", "high", "Review the integrated WordCard, PrayerCompanion, CompassExperience, TIG, and Promise Table flows as one product experience.", ["Scripture anchors", "explanation paths", "fallback states", "confidence labels"]),
    roadmapItem("phase_4_1_content_depth_map", "content_expansion", "Content depth map", "high", "Map vocabulary, Scripture, promise, calling, and prayer coverage gaps for expansion.", ["real data contracts", "Scripture support"]),
    roadmapItem("promise_cluster_growth", "promise_cluster_growth", "Promise Cluster growth plan", "high", "Plan additional Promise Clusters with explicit Scripture support and review boundaries.", ["promise cluster contract", "Scripture anchor contract"]),
    roadmapItem("calling_compass_depth", "calling_compass_depth", "Calling Compass depth", "medium", "Expand calling paths and action suggestions without claiming certainty about a user's calling.", ["theology boundary", "fallback safety"]),
    roadmapItem("prayer_companion_depth", "prayer_companion_depth", "Prayer Companion depth", "medium", "Improve prayer sequences and devotional explanations while keeping raw user input in memory only.", ["privacy", "devotional boundary"]),
    roadmapItem("tig_graph_ux", "tig_graph_ux", "TIG graph UX polish", "high", "Improve graph readability, list fallback, relationship labels, and mobile-safe graph exploration.", ["TIG graph logic", "mobile fallback"]),
    roadmapItem("wordcard_surface_polish", "production_ui_hardening", "WordCard and Daily Word polish", "medium", "Improve visible anchors, related promises, and explanation summaries on the primary word surfaces.", ["WordCard adapter", "Language Engine"]),
    roadmapItem("promise_table_surface_polish", "production_ui_hardening", "Promise Table surface polish", "medium", "Improve filtering, compact rows, and Scripture anchor display for promise exploration.", ["Promise Table", "Promise Engine"]),
    roadmapItem("personalization_consent_design", "personalization_consent_design", "Personalization consent design", "medium", "Design consent-first personalization without enabling hidden personalization or sensitive browser persistence.", ["consent", "privacy"], ["owner privacy decision"]),
    roadmapItem("future_persistence_decision", "future_persistence_decision", "Controlled persistence decision", "high", "Prepare an explicit persistence decision package before any database connection.", ["privacy", "consent"], ["owner service decision"]),
    roadmapItem("future_analytics_decision", "future_analytics_decision", "Controlled analytics decision", "medium", "Prepare payload sanitization and consent requirements before analytics are considered.", ["privacy", "consent"], ["owner service decision"]),
    roadmapItem("future_live_ai_decision", "future_live_ai_decision", "Controlled live AI decision", "medium", "Plan live AI only after grounding, fallback, safety, and explanation traces remain stable.", ["TIG grounding", "fallback safety"], ["owner service decision"]),
    roadmapItem("admin_content_workflow", "admin_content_workflow", "Admin content workflow plan", "medium", "Plan reviewed content updates for words, clusters, Scripture anchors, and calling/prayer content.", ["data contracts", "owner review"]),
    roadmapItem("public_beta_readiness", "public_beta_readiness", "Public beta readiness plan", "high", "Define beta readiness gates across product UX, content depth, safety, privacy, accessibility, mobile, and support.", ["launch safety", "manual QA"]),
    roadmapItem("performance_review", "performance", "Performance review", "medium", "Review bundle, route, and graph rendering performance after product UX expansion plans are clear.", ["mobile", "TIG graph UX"]),
    roadmapItem("accessibility_review", "accessibility", "Manual accessibility review", "high", "Run browser, keyboard, screen-reader, contrast, and focus checks over the integrated surfaces.", ["accessible product flow"]),
    roadmapItem("mobile_device_review", "mobile", "Mobile device review", "high", "Run real-device checks for cards, tables, graph/list fallback, trace, Scripture anchors, and fallback readability.", ["mobile UX"])
  ];
}

export function getPhase4RoadmapThemes(): TeoyubePhase4RoadmapTheme[] {
  return [...new Set(createPhase4Roadmap().map((item) => item.theme))];
}

export function getPhase4RoadmapItems(): TeoyubePhase4RoadmapItem[] {
  return createPhase4Roadmap();
}

export function getPhase4RoadmapItemsByTheme(theme: TeoyubePhase4RoadmapTheme): TeoyubePhase4RoadmapItem[] {
  return createPhase4Roadmap().filter((item) => item.theme === theme);
}

export function getPhase4RoadmapHighPriorityItems(): TeoyubePhase4RoadmapItem[] {
  return createPhase4Roadmap().filter((item) => item.priority === "high");
}

export function createPhase4RoadmapDecision(): TeoyubePhase4RoadmapDecision {
  const blockers = createPhase4Roadmap().filter((item) => item.status === "blocked");
  const ownerReview = createPhase4Roadmap().filter((item) => item.blockedBy.length > 0);
  if (blockers.length) return "blocked";
  return ownerReview.length ? "ready_with_owner_review" : "ready_for_phase_4_1";
}

export function createPhase4RoadmapReport(): TeoyubePhase4RoadmapReport {
  const items = createPhase4Roadmap();
  const risks: TeoyubePhase4RoadmapRisk[] = [
    {
      id: "service_decisions_must_remain_controlled",
      theme: "future_persistence_decision",
      severity: "medium",
      message: "Persistence, analytics, and live AI remain future decisions and are not connected by Phase 4 roadmap planning.",
      mitigation: "Require explicit owner approval, privacy review, consent design, and safety review before any service connection."
    },
    {
      id: "manual_accessibility_device_review_needed",
      theme: "accessibility",
      severity: "medium",
      message: "Phase 3 added structured QA, but real assistive technology and device review remains manual.",
      mitigation: "Make manual accessibility and mobile review a high-priority Phase 4.1 work item."
    }
  ];

  return {
    milestone: "TEOYUBE Phase 4 - Product Experience Expansion, Content Depth & Controlled Service Decisions",
    valid: items.length > 0,
    decision: createPhase4RoadmapDecision(),
    items,
    risks,
    highPriorityItems: getPhase4RoadmapHighPriorityItems(),
    nextStep: "Phase 4.1 - Product Experience Audit, Content Depth Map & Controlled Service Decision Plan",
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
