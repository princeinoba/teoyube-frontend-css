import type {
  TeoyubePhase7RoadmapDecision,
  TeoyubePhase7RoadmapItem,
  TeoyubePhase7RoadmapReport,
  TeoyubePhase7RoadmapRisk,
  TeoyubePhase7RoadmapTheme
} from "./phase-7-roadmap-contracts";

function item(
  id: string,
  theme: TeoyubePhase7RoadmapTheme,
  title: string,
  priority: TeoyubePhase7RoadmapItem["priority"],
  summary: string,
  blockedBy: string[] = []
): TeoyubePhase7RoadmapItem {
  return {
    id,
    theme,
    title,
    priority,
    summary,
    blockedBy,
    doesNotLaunchBeta: true,
    doesNotContactUsers: true,
    doesNotConnectServices: true
  };
}

function risk(id: string, theme: TeoyubePhase7RoadmapTheme, severity: TeoyubePhase7RoadmapRisk["severity"], message: string, mitigation: string): TeoyubePhase7RoadmapRisk {
  return { id, theme, severity, message, mitigation };
}

export function getPhase7RoadmapThemes(): TeoyubePhase7RoadmapTheme[] {
  return [
    "controlled_beta_operations",
    "manual_feedback_review",
    "manual_issue_triage",
    "beta_support_workflow",
    "operational_monitoring_manual",
    "content_review_follow_up",
    "product_stabilization",
    "mobile_accessibility_hardening",
    "performance_hardening",
    "service_gate_follow_up",
    "privacy_security_follow_up",
    "post_beta_readiness"
  ];
}

export function getPhase7RoadmapItems(): TeoyubePhase7RoadmapItem[] {
  return [
    item("phase_7_1_operations_runbook", "controlled_beta_operations", "Controlled beta operations runbook", "critical", "Prepare a manual operations runbook, owner cadence, entry checks, pause criteria, and review workflow without launching beta from code."),
    item("manual_feedback_review", "manual_feedback_review", "Manual feedback review", "critical", "Review feedback manually with redaction, minimization, owner review, and no automatic collection or storage."),
    item("manual_issue_triage", "manual_issue_triage", "Manual issue triage", "critical", "Route manually reviewed feedback into issue categories, owner review, and safe fix planning."),
    item("beta_support_workflow", "beta_support_workflow", "Beta support workflow", "high", "Document support response boundaries, escalation, known limitations, and no automatic user contact."),
    item("manual_operational_monitoring", "operational_monitoring_manual", "Manual operational monitoring", "high", "Use manual checklists and owner observations without analytics or production monitoring providers."),
    item("content_review_follow_up", "content_review_follow_up", "Content review follow-up", "high", "Keep reviewed-content gates active and route content changes through manual review."),
    item("product_stabilization", "product_stabilization", "Product stabilization", "high", "Use Phase 6 fix queue, stabilization rules, and regression QA to guide safe product hardening."),
    item("mobile_accessibility_hardening", "mobile_accessibility_hardening", "Mobile/accessibility hardening", "high", "Continue device, keyboard, focus, label, graph/list fallback, and Promise Table checks."),
    item("performance_hardening", "performance_hardening", "Performance hardening", "medium", "Profile local UI paths and keep fallback/list modes responsive without adding service workers."),
    item("service_gate_follow_up", "service_gate_follow_up", "Service gate follow-up", "critical", "Keep database, analytics, monitoring, admin auth, CMS, accounts, feedback storage, notifications, and live AI disabled until future approval."),
    item("privacy_security_follow_up", "privacy_security_follow_up", "Privacy/security follow-up", "critical", "Review consent, retention, redaction, deletion, sensitive information, and safety boundaries before future beta operations."),
    item("post_beta_readiness", "post_beta_readiness", "Post-beta readiness planning", "medium", "Define completion criteria, remaining risks, support handoff, and future production readiness gates.")
  ];
}

export function getPhase7RoadmapItemsByTheme(theme: TeoyubePhase7RoadmapTheme): TeoyubePhase7RoadmapItem[] {
  return getPhase7RoadmapItems().filter((entry) => entry.theme === theme);
}

export function getPhase7HighPriorityRoadmapItems(): TeoyubePhase7RoadmapItem[] {
  return getPhase7RoadmapItems().filter((entry) => entry.priority === "critical" || entry.priority === "high");
}

export function createPhase7Roadmap(): TeoyubePhase7RoadmapItem[] {
  return getPhase7RoadmapItems();
}

export function createPhase7RoadmapDecision(items: TeoyubePhase7RoadmapItem[] = createPhase7Roadmap()): TeoyubePhase7RoadmapDecision {
  if (!items.length) return "blocked";
  return items.some((entry) => entry.blockedBy.length) ? "phase_7_roadmap_ready_with_warnings" : "phase_7_roadmap_ready";
}

export function createPhase7RoadmapReport(): TeoyubePhase7RoadmapReport {
  const items = createPhase7Roadmap();
  const blockers = items.length ? [] : ["Phase 7 roadmap has no items."];
  const risks = [
    risk("phase_7_scope_drift", "controlled_beta_operations", "high", "Phase 7 operations planning could be mistaken for code-launched beta execution.", "Keep all participant contact, feedback intake, and operational monitoring manual unless separately approved."),
    risk("phase_7_feedback_sensitivity", "manual_feedback_review", "high", "Manual beta feedback may contain sensitive personal or spiritual information.", "Use redaction, minimization, consent review, and no automatic storage."),
    risk("phase_7_service_pressure", "service_gate_follow_up", "high", "Future service needs may pressure early database, analytics, monitoring, auth, CMS, account, or live AI connection.", "Keep the Phase 6 service-disabled lock active until formal owner/privacy/security/cost/rollback review.")
  ];
  return {
    valid: blockers.length === 0,
    status: risks.length ? "planned_with_warnings" : "planned",
    decision: createPhase7RoadmapDecision(items),
    milestone: "TEOYUBE Phase 7 - Controlled Beta Operations, Manual Feedback Review & Product Stabilization",
    nextStep: "Phase 7.1 - Controlled Beta Operations Runbook, Manual Feedback Review & Support Workflow",
    items,
    risks,
    blockers,
    warnings: risks.map((entry) => entry.message),
    noBetaLaunchPerformed: true,
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
