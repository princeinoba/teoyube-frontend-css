export type TeoyubeProductSurfacePolishStatus =
  | "safe_local_patch"
  | "owner_review_required"
  | "backlog_item"
  | "blocked"
  | "complete"
  | "unknown";

export type TeoyubeProductSurfacePolishSurface =
  | "home"
  | "canon"
  | "daily_word"
  | "word_card"
  | "promise_cluster"
  | "promise_table"
  | "prayer_companion"
  | "compass_experience"
  | "tig_response_panel"
  | "tig_graph_explorer"
  | "fallback_state"
  | "privacy_notice"
  | "consent_controls"
  | "unknown";

export type TeoyubeProductSurfacePolishIssue = {
  id: string;
  surface: TeoyubeProductSurfacePolishSurface;
  status: TeoyubeProductSurfacePolishStatus;
  summary: string;
  source: string;
  safetyReason: string;
  blockedBy: string[];
};

export type TeoyubeProductSurfacePolishPatch = {
  id: string;
  surface: TeoyubeProductSurfacePolishSurface;
  filePath: string;
  description: string;
  applied: boolean;
  safetyReason: string;
  regressionCheck: string;
};

export type TeoyubeProductSurfacePolishBlocker = {
  id: string;
  surface: TeoyubeProductSurfacePolishSurface;
  message: string;
  requiredAction: string;
};

export type TeoyubeProductSurfacePolishWarning = {
  id: string;
  surface: TeoyubeProductSurfacePolishSurface;
  message: string;
  recommendedAction: string;
};

export type TeoyubeProductSurfacePolishCheck = {
  id: string;
  surface: TeoyubeProductSurfacePolishSurface;
  label: string;
  status: TeoyubeProductSurfacePolishStatus;
  passed: boolean;
  details: string;
  issues: TeoyubeProductSurfacePolishIssue[];
  blockers: TeoyubeProductSurfacePolishBlocker[];
  warnings: TeoyubeProductSurfacePolishWarning[];
};

export type TeoyubeProductSurfacePolishDecision =
  | "phase_4_2_complete"
  | "phase_4_2_complete_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubeProductSurfacePolishReport = {
  valid: boolean;
  decision: TeoyubeProductSurfacePolishDecision;
  checks: TeoyubeProductSurfacePolishCheck[];
  issues: TeoyubeProductSurfacePolishIssue[];
  safePatches: TeoyubeProductSurfacePolishPatch[];
  deferredItems: TeoyubeProductSurfacePolishIssue[];
  blockedItems: TeoyubeProductSurfacePolishIssue[];
  blockers: TeoyubeProductSurfacePolishBlocker[];
  warnings: TeoyubeProductSurfacePolishWarning[];
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export function createProductSurfacePolishWarning(
  id: string,
  surface: TeoyubeProductSurfacePolishSurface,
  message: string,
  recommendedAction = "Carry this item into the Phase 4.2 owner review or Phase 4.3 backlog."
): TeoyubeProductSurfacePolishWarning {
  return { id, surface, message, recommendedAction };
}

export function createProductSurfacePolishBlocker(
  id: string,
  surface: TeoyubeProductSurfacePolishSurface,
  message: string,
  requiredAction = "Resolve this before treating the polish plan as complete."
): TeoyubeProductSurfacePolishBlocker {
  return { id, surface, message, requiredAction };
}
