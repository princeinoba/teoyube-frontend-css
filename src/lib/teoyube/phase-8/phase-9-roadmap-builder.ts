import type {
  TeoyubePhase9RoadmapDecision,
  TeoyubePhase9RoadmapItem,
  TeoyubePhase9RoadmapPriority,
  TeoyubePhase9RoadmapReport,
  TeoyubePhase9RoadmapRisk,
  TeoyubePhase9RoadmapTheme
} from "./phase-9-roadmap-contracts";

function item(theme: TeoyubePhase9RoadmapTheme, priority: TeoyubePhase9RoadmapPriority, label: string, details: string): TeoyubePhase9RoadmapItem {
  return {
    id: `phase_9_${theme}_item`,
    theme,
    priority,
    label,
    details,
    ownerReviewRequired: true,
    doesNotLaunchPublicly: true,
    doesNotContactUsers: true,
    doesNotConnectServices: true
  };
}

export function getPhase9RoadmapThemes(): TeoyubePhase9RoadmapTheme[] {
  return [
    "controlled_public_release_preparation",
    "public_release_candidate_review",
    "owner_approval",
    "final_public_copy_review",
    "support_feedback_readiness",
    "manual_public_monitoring",
    "service_gate_follow_up",
    "privacy_security_final_review",
    "performance_mobile_accessibility_final_review",
    "operational_readiness"
  ];
}

export function getPhase9RoadmapItems(): TeoyubePhase9RoadmapItem[] {
  return [
    item("controlled_public_release_preparation", "critical", "Create controlled public release preparation plan", "Prepare release steps without launching publicly from code."),
    item("public_release_candidate_review", "critical", "Review public release candidate package", "Manually review Phase 8.4 release candidate evidence, warnings, and risks."),
    item("owner_approval", "critical", "Complete final owner approval gate", "Require owner approval before any public release decision."),
    item("final_public_copy_review", "high", "Review final public copy", "Confirm privacy, consent, limitations, Scripture, explanation, fallback, and confidence copy."),
    item("support_feedback_readiness", "high", "Confirm support and feedback readiness", "Confirm manual support, feedback triage, escalation, and sensitive-data handling."),
    item("manual_public_monitoring", "high", "Plan manual public monitoring", "Plan manual checks only; do not connect monitoring providers."),
    item("service_gate_follow_up", "high", "Review service gates", "Keep persistence, analytics, monitoring, admin auth, CMS, accounts, live AI, and notifications disabled unless future approvals exist."),
    item("privacy_security_final_review", "critical", "Complete privacy/security final review", "Review sensitive-data, privacy notice, consent, secrets, and browser persistence boundaries."),
    item("performance_mobile_accessibility_final_review", "medium", "Run performance, mobile, and accessibility final review", "Recheck core surfaces on mobile and accessibility paths."),
    item("operational_readiness", "high", "Confirm operational readiness", "Confirm manual owner, support, fallback, rollback, and known limitation workflows.")
  ];
}

export function createPhase9Roadmap(): TeoyubePhase9RoadmapItem[] {
  return getPhase9RoadmapItems();
}

export function getPhase9RoadmapItemsByTheme(theme: TeoyubePhase9RoadmapTheme): TeoyubePhase9RoadmapItem[] {
  return getPhase9RoadmapItems().filter((entry) => entry.theme === theme);
}

export function getPhase9HighPriorityRoadmapItems(): TeoyubePhase9RoadmapItem[] {
  return getPhase9RoadmapItems().filter((entry) => entry.priority === "critical" || entry.priority === "high");
}

function risks(): TeoyubePhase9RoadmapRisk[] {
  return [
    { id: "phase_9_privacy_risk", theme: "privacy_security_final_review", severity: "high", message: "Public release preparation increases privacy and sensitive-data exposure.", mitigation: "Keep privacy/security locks and complete final review before release decisions." },
    { id: "phase_9_service_gate_risk", theme: "service_gate_follow_up", severity: "high", message: "Future service activation can be confused with planning approval.", mitigation: "Keep all services disabled or future-review-only until explicit approval exists." },
    { id: "phase_9_support_capacity_risk", theme: "support_feedback_readiness", severity: "medium", message: "Manual support and feedback workflows may need capacity planning.", mitigation: "Confirm staffing, triage, sensitive-data handling, and escalation paths manually." }
  ];
}

export function createPhase9RoadmapDecision(): TeoyubePhase9RoadmapDecision {
  return "phase_9_ready_with_warnings";
}

export function createPhase9RoadmapReport(): TeoyubePhase9RoadmapReport {
  const items = getPhase9RoadmapItems();
  return {
    valid: items.length >= 10,
    status: "ready_with_warnings",
    decision: createPhase9RoadmapDecision(),
    milestone: "TEOYUBE Phase 9 - Controlled Public Release Preparation, Final Owner Approval & Operational Readiness",
    items,
    risks: risks(),
    blockers: [],
    warnings: ["Phase 9 roadmap is planning-only and does not launch publicly, contact users, or connect services."],
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
