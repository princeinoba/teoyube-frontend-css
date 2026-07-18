import type {
  TeoyubePhase5RoadmapItem,
  TeoyubePhase5RoadmapReport,
  TeoyubePhase5RoadmapRisk,
  TeoyubePhase5RoadmapTheme
} from "./phase-5-roadmap-contracts";

function item(
  id: string,
  theme: TeoyubePhase5RoadmapTheme,
  title: string,
  priority: TeoyubePhase5RoadmapItem["priority"],
  summary: string,
  blockedBy: string[] = []
): TeoyubePhase5RoadmapItem {
  return { id, theme, title, priority, summary, blockedBy, doesNotConnectServices: true };
}

function risk(id: string, theme: TeoyubePhase5RoadmapTheme, severity: TeoyubePhase5RoadmapRisk["severity"], message: string, mitigation: string): TeoyubePhase5RoadmapRisk {
  return { id, theme, severity, message, mitigation };
}

export function getPhase5RoadmapThemes(): TeoyubePhase5RoadmapTheme[] {
  return [
    "controlled_beta_preparation",
    "manual_beta_qa_execution",
    "reviewed_content_release_process",
    "admin_workflow_decision",
    "service_implementation_gate",
    "privacy_security_review",
    "performance_hardening",
    "mobile_accessibility_hardening",
    "public_feedback_readiness",
    "operational_readiness"
  ];
}

export function getPhase5RoadmapItems(): TeoyubePhase5RoadmapItem[] {
  return [
    item("phase_5_1_controlled_beta_preparation", "controlled_beta_preparation", "Controlled beta preparation", "critical", "Prepare beta scope, entry criteria, owner review, and manual QA execution plan."),
    item("manual_beta_qa_execution_plan", "manual_beta_qa_execution", "Manual beta QA execution plan", "critical", "Run manual QA for mobile, accessibility, Scripture anchors, explanation traces, fallback, consent, and disabled services."),
    item("reviewed_content_release_process", "reviewed_content_release_process", "Reviewed content release process", "high", "Define how reviewed content moves from release candidates into future production data without automatic publishing."),
    item("admin_workflow_go_no_go", "admin_workflow_decision", "Admin workflow go/no-go decision", "high", "Decide whether the prototype should remain documentation-only, become internal tooling, or stay deferred."),
    item("service_implementation_gates", "service_implementation_gate", "Service implementation gates", "critical", "Require owner/privacy/security/cost review before any database, analytics, monitoring, live AI, auth, CMS, or email implementation."),
    item("privacy_security_review_plan", "privacy_security_review", "Privacy and security review plan", "critical", "Plan consent, retention, deletion, export, secrets, abuse controls, and rollback review."),
    item("performance_hardening", "performance_hardening", "Performance hardening", "medium", "Profile key surfaces and keep graph/list fallbacks readable."),
    item("mobile_accessibility_hardening", "mobile_accessibility_hardening", "Mobile and accessibility hardening", "high", "Run real device and keyboard/focus/label checks before beta participation."),
    item("public_feedback_readiness", "public_feedback_readiness", "Public feedback readiness", "medium", "Prepare manual feedback intake and triage without storing sensitive feedback automatically."),
    item("operational_readiness", "operational_readiness", "Operational readiness", "medium", "Define owner availability, issue triage, pause/rollback criteria, and support boundaries.")
  ];
}

export function getPhase5RoadmapItemsByTheme(theme: TeoyubePhase5RoadmapTheme): TeoyubePhase5RoadmapItem[] {
  return getPhase5RoadmapItems().filter((entry) => entry.theme === theme);
}

export function getPhase5HighPriorityRoadmapItems(): TeoyubePhase5RoadmapItem[] {
  return getPhase5RoadmapItems().filter((entry) => entry.priority === "critical" || entry.priority === "high");
}

export function createPhase5Roadmap(): TeoyubePhase5RoadmapItem[] {
  return getPhase5RoadmapItems();
}

export function createPhase5RoadmapDecision(items: TeoyubePhase5RoadmapItem[] = createPhase5Roadmap()) {
  if (!items.length) return "blocked" as const;
  return items.some((entry) => entry.blockedBy.length) ? "phase_5_roadmap_ready_with_warnings" as const : "phase_5_roadmap_ready" as const;
}

export function createPhase5RoadmapReport(): TeoyubePhase5RoadmapReport {
  const items = createPhase5Roadmap();
  const blockers = items.length ? [] : ["Phase 5 roadmap has no items."];
  const risks = [
    risk("phase_5_service_scope", "service_implementation_gate", "high", "Future services could expand scope too early.", "Keep service decision lock active until explicit owner/privacy/security/cost review."),
    risk("phase_5_manual_qa", "manual_beta_qa_execution", "medium", "Manual beta QA may find mobile or accessibility gaps.", "Plan QA execution and regression mapping in Phase 5.1.")
  ];

  return {
    valid: blockers.length === 0,
    status: "planned",
    decision: createPhase5RoadmapDecision(items),
    milestone: "TEOYUBE Phase 5 - Controlled Beta Preparation, Service Gates & Operational Readiness",
    items,
    risks,
    blockers,
    warnings: risks.map((entry) => entry.message),
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
