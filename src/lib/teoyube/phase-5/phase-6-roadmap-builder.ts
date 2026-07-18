import type {
  TeoyubePhase6RoadmapDecision,
  TeoyubePhase6RoadmapItem,
  TeoyubePhase6RoadmapReport,
  TeoyubePhase6RoadmapRisk,
  TeoyubePhase6RoadmapTheme
} from "./phase-6-roadmap-contracts";

function item(
  id: string,
  theme: TeoyubePhase6RoadmapTheme,
  title: string,
  priority: TeoyubePhase6RoadmapItem["priority"],
  summary: string,
  blockedBy: string[] = []
): TeoyubePhase6RoadmapItem {
  return { id, theme, title, priority, summary, blockedBy, doesNotLaunchBeta: true, doesNotConnectServices: true };
}

function risk(id: string, theme: TeoyubePhase6RoadmapTheme, severity: TeoyubePhase6RoadmapRisk["severity"], message: string, mitigation: string): TeoyubePhase6RoadmapRisk {
  return { id, theme, severity, message, mitigation };
}

export function getPhase6RoadmapThemes(): TeoyubePhase6RoadmapTheme[] {
  return [
    "controlled_beta_execution_planning",
    "manual_participant_workflow",
    "manual_feedback_intake",
    "beta_issue_triage",
    "beta_operations",
    "beta_readiness_monitoring",
    "service_gate_follow_up",
    "privacy_security_follow_up",
    "performance_hardening",
    "mobile_accessibility_hardening",
    "content_review_follow_up",
    "operational_readiness"
  ];
}

export function getPhase6RoadmapItems(): TeoyubePhase6RoadmapItem[] {
  return [
    item("phase_6_1_controlled_beta_execution_plan", "controlled_beta_execution_planning", "Controlled beta execution plan", "critical", "Prepare the manual execution plan, entry gates, owner approvals, no-go boundaries, and handoff criteria."),
    item("manual_participant_workflow", "manual_participant_workflow", "Manual participant workflow", "critical", "Define manual participant selection, consent copy review, access boundaries, and no automatic contact."),
    item("manual_feedback_intake", "manual_feedback_intake", "Manual feedback intake", "critical", "Prepare manual feedback intake and redaction boundaries without automatic collection or storage."),
    item("beta_issue_triage", "beta_issue_triage", "Beta issue triage", "high", "Carry Phase 5 issue categories into manual beta triage and safe fix routing."),
    item("beta_operations_checklist", "beta_operations", "Beta operations checklist", "high", "Define owner availability, daily review, support boundaries, pause criteria, and rollback review."),
    item("beta_readiness_monitoring", "beta_readiness_monitoring", "Manual beta readiness monitoring", "high", "Monitor readiness evidence manually without production monitoring providers or analytics."),
    item("service_gate_follow_up", "service_gate_follow_up", "Service gate follow-up", "critical", "Keep services disabled until owner/privacy/security/cost/rollback review approves future connection."),
    item("privacy_security_follow_up", "privacy_security_follow_up", "Privacy/security follow-up", "critical", "Review consent, retention, redaction, deletion, abuse boundaries, and sensitive information warnings."),
    item("performance_hardening", "performance_hardening", "Performance hardening", "medium", "Profile key surfaces and keep local fallback/list modes responsive."),
    item("mobile_accessibility_hardening", "mobile_accessibility_hardening", "Mobile/accessibility hardening", "high", "Run device, keyboard, focus, readable label, graph/list, and Promise Table checks."),
    item("content_review_follow_up", "content_review_follow_up", "Content review follow-up", "high", "Keep reviewed content gates active and route expansion through manual review."),
    item("operational_stabilization", "operational_readiness", "Operational stabilization", "medium", "Refine handoff, support workflow, known limitations, and owner review cadence.")
  ];
}

export function getPhase6RoadmapItemsByTheme(theme: TeoyubePhase6RoadmapTheme): TeoyubePhase6RoadmapItem[] {
  return getPhase6RoadmapItems().filter((entry) => entry.theme === theme);
}

export function getPhase6HighPriorityRoadmapItems(): TeoyubePhase6RoadmapItem[] {
  return getPhase6RoadmapItems().filter((entry) => entry.priority === "critical" || entry.priority === "high");
}

export function createPhase6Roadmap(): TeoyubePhase6RoadmapItem[] {
  return getPhase6RoadmapItems();
}

export function createPhase6RoadmapDecision(items: TeoyubePhase6RoadmapItem[] = createPhase6Roadmap()): TeoyubePhase6RoadmapDecision {
  if (!items.length) return "blocked";
  return items.some((entry) => entry.blockedBy.length) ? "phase_6_roadmap_ready_with_warnings" : "phase_6_roadmap_ready";
}

export function createPhase6RoadmapReport(): TeoyubePhase6RoadmapReport {
  const items = createPhase6Roadmap();
  const blockers = items.length ? [] : ["Phase 6 roadmap has no items."];
  const risks = [
    risk("phase_6_execution_scope", "controlled_beta_execution_planning", "high", "Controlled beta execution planning could drift into launch execution.", "Keep Phase 6.1 as planning/manual workflow until explicit owner approval."),
    risk("phase_6_feedback_sensitivity", "manual_feedback_intake", "high", "Manual feedback may contain sensitive personal or spiritual information.", "Use redaction, minimization, and no automatic storage boundaries."),
    risk("phase_6_service_pressure", "service_gate_follow_up", "medium", "Future service needs may pressure early service connection.", "Keep final disabled service lock active until formal service gate review.")
  ];
  return {
    valid: blockers.length === 0,
    status: "planned",
    decision: createPhase6RoadmapDecision(items),
    milestone: "TEOYUBE Phase 6 - Controlled Beta Execution Planning, Manual Feedback Loop & Operational Stabilization",
    nextStep: "Phase 6.1 - Controlled Beta Execution Plan, Manual Participant Workflow & Feedback Boundaries",
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
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
