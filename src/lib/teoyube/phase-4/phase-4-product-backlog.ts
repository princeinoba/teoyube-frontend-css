import type { TeoyubeUserJourneyInput } from "../journey/user-journey-contracts";
import { createContentDepthMapReport } from "./content-depth-map";
import { createProductExperienceAuditReport } from "./product-experience-audit";
import { createProductSurfaceDepthReport } from "./product-surface-depth-audit";
import type { TeoyubePhase4Area, TeoyubePhase4BacklogItem } from "./phase-4-contracts";

function item(
  id: string,
  area: TeoyubePhase4Area,
  title: string,
  priority: TeoyubePhase4BacklogItem["priority"],
  category: TeoyubePhase4BacklogItem["category"],
  summary: string,
  source: string,
  blockedBy: string[] = []
): TeoyubePhase4BacklogItem {
  return { id, area, title, priority, category, summary, source, blockedBy, doesNotConnectServices: true };
}

export function prioritizePhase4Backlog(items: TeoyubePhase4BacklogItem[]): TeoyubePhase4BacklogItem[] {
  const rank: Record<TeoyubePhase4BacklogItem["priority"], number> = { critical: 0, high: 1, medium: 2, low: 3 };
  return [...items].sort((a, b) => rank[a.priority] - rank[b.priority] || a.title.localeCompare(b.title));
}

export function createPhase4ProductBacklog(input: TeoyubeUserJourneyInput = {}): TeoyubePhase4BacklogItem[] {
  const content = createContentDepthMapReport();
  const product = createProductExperienceAuditReport(input);
  const surfaces = createProductSurfaceDepthReport(input);
  return prioritizePhase4Backlog([
    item("wordcard_polish", "word_card", "WordCard polish", "high", "ui_polish", "Improve word detail hierarchy, related promises, Scripture anchor grouping, and explanation summaries.", "Phase 4.1 product surface depth audit"),
    item("promise_cluster_expansion", "promise_clusters", "Promise Cluster expansion", content.blockers.length ? "critical" : "high", "content_coverage", `Review ${content.sections.find((entry) => entry.id === "promise_cluster_depth")?.needsOwnerReviewIds.length || 0} Promise Cluster item(s) for depth.`, "Phase 4.1 content depth map"),
    item("prayer_companion_depth", "prayer_companion", "PrayerCompanion depth", "medium", "content_coverage", "Expand prayer sequence clarity and devotional explanation boundaries from existing reviewed content.", "Phase 4.1 content depth map"),
    item("calling_compass_depth", "calling_compass", "Calling Compass depth", "medium", "content_coverage", "Improve calling path clarity, action suggestions, and humble confidence language.", "Phase 4.1 product surface depth audit"),
    item("tig_graph_ux", "tig_graph_explorer", "TIG graph UX", "high", "ui_polish", "Improve graph/list readability, relationship labels, and mobile fallback presentation.", "Phase 4.1 product experience audit"),
    item("promise_table_ux", "promise_table", "Promise Table UX", "medium", "ui_polish", "Improve filtering, compact rows, Scripture anchors, and empty states.", "Phase 4.1 product surface depth audit"),
    item("canon_daily_word_clarity", "canon", "Canon and Daily Word clarity", "medium", "ui_polish", "Improve Canon and Daily Word browsing clarity for normal users.", "Phase 4.1 product experience audit"),
    item("mobile_polish", "mobile", "Mobile polish", surfaces.warnings.some((warning) => warning.area === "mobile") ? "high" : "medium", "mobile", "Run real-device review for cards, tables, graph/list fallback, traces, and fallback readability.", "Phase 4.1 surface audit"),
    item("accessibility_polish", "accessibility", "Accessibility polish", "high", "accessibility", "Run keyboard, focus, screen-reader, labels, heading, contrast, and text wrapping review.", "Phase 4.1 product experience audit"),
    item("content_coverage", "content_depth", "Content coverage review", content.warnings.length ? "high" : "medium", "content_coverage", "Review shallow vocabulary, Scripture, promise, prayer, calling, action, and TIG relationship areas.", "Phase 4.1 content depth map"),
    item("admin_content_workflow_plan", "admin_content_workflow", "Admin/content workflow planning", "medium", "admin_workflow", "Design reviewed content update workflows without implementing admin auth or CMS tooling yet.", "Phase 4.1 controlled service decision plan", ["owner workflow decision"]),
    item("persistence_decision", "future_persistence", "Persistence decision", "high", "service_decision", "Plan database persistence requirements, consent, privacy, security, cost, and rollback decisions without connecting a database.", "Phase 4.1 controlled service decision plan", ["owner service decision"]),
    item("analytics_decision", "future_analytics", "Analytics decision", "medium", "service_decision", "Plan analytics requirements and payload minimization without connecting analytics.", "Phase 4.1 controlled service decision plan", ["owner service decision"]),
    item("monitoring_decision", "future_monitoring", "Monitoring decision", "medium", "service_decision", "Plan production monitoring requirements without connecting monitoring providers.", "Phase 4.1 controlled service decision plan", ["owner service decision"]),
    item("live_ai_decision", "future_live_ai", "Live AI decision", "medium", "service_decision", "Plan live AI requirements after grounding, safety, fallback, and explanation traces remain stable.", "Phase 4.1 controlled service decision plan", ["owner service decision"]),
    item("public_beta_readiness", "public_beta_readiness", "Public beta readiness", product.valid ? "high" : "critical", "public_beta", "Define Phase 4 beta gates across content, UX, privacy, safety, mobile, accessibility, and support.", "Phase 4.1 package")
  ]);
}

export function getPhase4BacklogItemsByArea(area: TeoyubePhase4Area): TeoyubePhase4BacklogItem[] {
  return createPhase4ProductBacklog().filter((entry) => entry.area === area);
}

export function getPhase4HighPriorityBacklogItems(): TeoyubePhase4BacklogItem[] {
  return createPhase4ProductBacklog().filter((entry) => entry.priority === "critical" || entry.priority === "high");
}

export function getPhase4ContentBacklogItems(): TeoyubePhase4BacklogItem[] {
  return createPhase4ProductBacklog().filter((entry) => entry.category === "content_coverage");
}

export function getPhase4UiBacklogItems(): TeoyubePhase4BacklogItem[] {
  return createPhase4ProductBacklog().filter((entry) => entry.category === "ui_polish" || entry.category === "mobile" || entry.category === "accessibility");
}

export function getPhase4ServiceDecisionBacklogItems(): TeoyubePhase4BacklogItem[] {
  return createPhase4ProductBacklog().filter((entry) => entry.category === "service_decision" || entry.category === "admin_workflow");
}

export function createPhase4BacklogReport(items: TeoyubePhase4BacklogItem[] = createPhase4ProductBacklog()) {
  const prioritized = prioritizePhase4Backlog(items);
  return {
    valid: prioritized.length > 0 && prioritized.every((entry) => entry.doesNotConnectServices),
    items: prioritized,
    highPriorityItems: prioritized.filter((entry) => entry.priority === "critical" || entry.priority === "high"),
    contentItems: prioritized.filter((entry) => entry.category === "content_coverage"),
    uiItems: prioritized.filter((entry) => entry.category === "ui_polish" || entry.category === "mobile" || entry.category === "accessibility"),
    serviceDecisionItems: prioritized.filter((entry) => entry.category === "service_decision" || entry.category === "admin_workflow"),
    noExternalServicesRequired: true as const,
    noDatabasePersistenceEnabled: true as const,
    noAnalyticsEnabled: true as const,
    noMonitoringProviderConnected: true as const,
    noLiveAiOrchestrationEnabled: true as const,
    noBrowserPersistenceRequired: true as const,
    inMemoryOnly: true as const,
    generatedAt: new Date().toISOString()
  };
}
