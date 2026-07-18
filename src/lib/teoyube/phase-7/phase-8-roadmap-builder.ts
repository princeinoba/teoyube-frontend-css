import type {
  TeoyubePhase8RoadmapDecision,
  TeoyubePhase8RoadmapItem,
  TeoyubePhase8RoadmapReport,
  TeoyubePhase8RoadmapRisk,
  TeoyubePhase8RoadmapTheme
} from "./phase-8-roadmap-contracts";

function item(
  id: string,
  theme: TeoyubePhase8RoadmapTheme,
  title: string,
  priority: TeoyubePhase8RoadmapItem["priority"],
  summary: string,
  blockedBy: string[] = []
): TeoyubePhase8RoadmapItem {
  return {
    id,
    theme,
    title,
    priority,
    summary,
    blockedBy,
    doesNotLaunchPublicly: true,
    doesNotContactUsers: true,
    doesNotConnectServices: true
  };
}

function risk(id: string, theme: TeoyubePhase8RoadmapTheme, severity: TeoyubePhase8RoadmapRisk["severity"], message: string, mitigation: string): TeoyubePhase8RoadmapRisk {
  return { id, theme, severity, message, mitigation };
}

export function getPhase8RoadmapThemes(): TeoyubePhase8RoadmapTheme[] {
  return [
    "post_beta_readiness",
    "manual_operations_review",
    "product_hardening",
    "content_review_follow_up",
    "public_release_preparation",
    "service_gate_reassessment",
    "privacy_security_review",
    "performance_hardening",
    "mobile_accessibility_hardening",
    "controlled_service_decisions",
    "owner_approval"
  ];
}

export function getPhase8RoadmapItems(): TeoyubePhase8RoadmapItem[] {
  return [
    item("phase_8_1_post_beta_readiness_audit", "post_beta_readiness", "Post-beta readiness audit", "critical", "Review Phase 7 operations evidence, remaining risks, owner decisions, and readiness criteria without launching publicly."),
    item("manual_operations_review", "manual_operations_review", "Manual operations review", "critical", "Reassess manual operations load, owner cadence, support boundaries, pause criteria, and no-contact constraints."),
    item("product_hardening_plan", "product_hardening", "Product hardening plan", "high", "Prioritize low-risk product hardening from stabilization evidence while preserving Scripture, explanation, fallback, confidence, and consent boundaries."),
    item("content_review_follow_up", "content_review_follow_up", "Content review follow-up", "high", "Carry reviewed-content gates and manual review into any future content changes."),
    item("public_release_preparation", "public_release_preparation", "Public release preparation planning", "high", "Plan public-release readiness without publishing, contacting users, fetching public URLs, or connecting services."),
    item("service_gate_reassessment", "service_gate_reassessment", "Controlled service gate reassessment", "critical", "Reassess database, analytics, monitoring, auth, CMS, account, feedback storage, notification, and live AI gates before any connection."),
    item("privacy_security_review", "privacy_security_review", "Privacy/security review", "critical", "Review consent, retention, redaction, deletion, sensitive information, and safety boundaries before broader release planning."),
    item("performance_hardening", "performance_hardening", "Performance hardening", "medium", "Profile local UI paths and preserve mobile-safe list/fallback modes without adding service workers or persistence."),
    item("mobile_accessibility_hardening", "mobile_accessibility_hardening", "Mobile/accessibility hardening", "high", "Continue device, keyboard, focus, label, graph/list fallback, and Promise Table checks."),
    item("controlled_service_decisions", "controlled_service_decisions", "Controlled service decision review", "critical", "Keep services disabled unless future owner/privacy/security/cost/rollback/data-protection review approves them."),
    item("owner_approval", "owner_approval", "Owner approval and operational readiness", "critical", "Require explicit owner approval for every Phase 8 service, release, content, or operational decision.")
  ];
}

export function getPhase8RoadmapItemsByTheme(theme: TeoyubePhase8RoadmapTheme): TeoyubePhase8RoadmapItem[] {
  return getPhase8RoadmapItems().filter((entry) => entry.theme === theme);
}

export function getPhase8HighPriorityRoadmapItems(): TeoyubePhase8RoadmapItem[] {
  return getPhase8RoadmapItems().filter((entry) => entry.priority === "critical" || entry.priority === "high");
}

export function createPhase8Roadmap(): TeoyubePhase8RoadmapItem[] {
  return getPhase8RoadmapItems();
}

export function createPhase8RoadmapDecision(items: TeoyubePhase8RoadmapItem[] = createPhase8Roadmap()): TeoyubePhase8RoadmapDecision {
  if (!items.length) return "blocked";
  return items.some((entry) => entry.blockedBy.length) ? "phase_8_roadmap_ready_with_warnings" : "phase_8_roadmap_ready";
}

export function createPhase8RoadmapReport(): TeoyubePhase8RoadmapReport {
  const items = createPhase8Roadmap();
  const blockers = items.length ? [] : ["Phase 8 roadmap has no items."];
  const risks = [
    risk("phase_8_public_release_scope_drift", "public_release_preparation", "high", "Phase 8 planning could be mistaken for public launch execution.", "Keep public launch, user contact, URL fetching, and service connection out of Phase 8 unless separately approved."),
    risk("phase_8_service_gate_pressure", "service_gate_reassessment", "high", "Future service needs may pressure early database, analytics, monitoring, auth, CMS, account, notification, or live AI connection.", "Keep the Phase 7 service-disabled lock active until formal owner/privacy/security/cost/rollback review."),
    risk("phase_8_feedback_sensitivity", "privacy_security_review", "high", "Manual feedback and support evidence may contain sensitive personal or spiritual information.", "Use redaction, minimization, consent review, and no automatic storage.")
  ];
  return {
    valid: blockers.length === 0,
    status: risks.length ? "planned_with_warnings" : "planned",
    decision: createPhase8RoadmapDecision(items),
    milestone: "TEOYUBE Phase 8 - Post-Beta Readiness, Product Hardening & Controlled Service Reassessment",
    nextStep: "Phase 8.1 - Post-Beta Readiness Audit, Product Hardening Plan & Service Reassessment Gate",
    items,
    risks,
    blockers,
    warnings: risks.map((entry) => entry.message),
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noUserAccountsAdded: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
