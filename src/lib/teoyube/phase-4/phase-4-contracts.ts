export type TeoyubePhase4Status =
  | "passed"
  | "passed_with_warnings"
  | "blocked"
  | "planned"
  | "needs_review";

export type TeoyubePhase4Area =
  | "product_experience"
  | "content_depth"
  | "scripture_anchor"
  | "word_card"
  | "promise_cluster"
  | "promise_clusters"
  | "promise_table"
  | "prayer_companion"
  | "calling_compass"
  | "tig_graph"
  | "tig_response_panel"
  | "tig_graph_explorer"
  | "canon"
  | "daily_word"
  | "user_journey"
  | "mobile"
  | "accessibility"
  | "privacy"
  | "security"
  | "admin_workflow"
  | "admin_content_workflow"
  | "future_persistence"
  | "future_analytics"
  | "future_monitoring"
  | "future_live_ai"
  | "public_beta"
  | "public_beta_readiness"
  | "unknown";

export type TeoyubePhase4Priority = "critical" | "high" | "medium" | "low";

export type TeoyubePhase4Decision =
  | "phase_4_1_complete"
  | "phase_4_1_complete_with_warnings"
  | "needs_owner_review"
  | "needs_fix"
  | "blocked"
  | "unknown";

export type TeoyubePhase4NextAction =
  | "Phase 4.2 - Product Surface Polish, Content Expansion Backlog & Admin Workflow Design"
  | "Owner review"
  | "Manual accessibility and mobile QA"
  | "Unknown";

export type TeoyubePhase4Blocker = {
  id: string;
  area: TeoyubePhase4Area;
  message: string;
  requiredAction: string;
};

export type TeoyubePhase4Warning = {
  id: string;
  area: TeoyubePhase4Area;
  message: string;
  recommendedAction: string;
};

export type TeoyubePhase4AuditCheck = {
  id: string;
  area: TeoyubePhase4Area;
  label: string;
  passed: boolean;
  details: string;
  blockers: TeoyubePhase4Blocker[];
  warnings: TeoyubePhase4Warning[];
};

export type TeoyubePhase4AuditReport = {
  valid: boolean;
  status: TeoyubePhase4Status;
  decision: TeoyubePhase4Decision;
  checks: TeoyubePhase4AuditCheck[];
  blockers: TeoyubePhase4Blocker[];
  warnings: TeoyubePhase4Warning[];
  nextAction: TeoyubePhase4NextAction;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubePhase4BacklogItem = {
  id: string;
  area: TeoyubePhase4Area;
  title: string;
  priority: TeoyubePhase4Priority;
  category:
    | "ui_polish"
    | "content_coverage"
    | "service_decision"
    | "admin_workflow"
    | "mobile"
    | "accessibility"
    | "public_beta";
  summary: string;
  source: string;
  blockedBy: string[];
  doesNotConnectServices: true;
};

export type TeoyubePhase4Risk = {
  id: string;
  area: TeoyubePhase4Area;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "accepted" | "resolved";
  message: string;
  mitigation: string;
  resolution?: string;
};

export function createPhase4Blocker(
  id: string,
  area: TeoyubePhase4Area,
  message: string,
  requiredAction = "Resolve this blocker before advancing the Phase 4 plan."
): TeoyubePhase4Blocker {
  return { id, area, message, requiredAction };
}

export function createPhase4Warning(
  id: string,
  area: TeoyubePhase4Area,
  message: string,
  recommendedAction = "Carry this item into the Phase 4 backlog or owner review."
): TeoyubePhase4Warning {
  return { id, area, message, recommendedAction };
}

export function createPhase4AuditCheck(
  id: string,
  area: TeoyubePhase4Area,
  label: string,
  passed: boolean,
  details: string,
  blockers: TeoyubePhase4Blocker[] = [],
  warnings: TeoyubePhase4Warning[] = []
): TeoyubePhase4AuditCheck {
  return { id, area, label, passed, details, blockers, warnings };
}
