export type TeoyubeSurfaceUxRefinementStatus =
  | "safe_local_patch"
  | "owner_review_required"
  | "backlog_item"
  | "blocked"
  | "verified"
  | "unknown";

export type TeoyubeSurfaceUxRefinementSurface =
  | "word_card"
  | "promise_table"
  | "prayer_companion"
  | "compass_experience"
  | "tig_response_panel"
  | "tig_graph_explorer"
  | "canon"
  | "daily_word"
  | "fallback_state"
  | "mobile_navigation"
  | "unknown";

export type TeoyubeSurfaceUxRefinementPriority = "critical" | "high" | "medium" | "low";

export type TeoyubeSurfaceUxRefinementItem = {
  id: string;
  surface: TeoyubeSurfaceUxRefinementSurface;
  status: TeoyubeSurfaceUxRefinementStatus;
  priority: TeoyubeSurfaceUxRefinementPriority;
  summary: string;
  source: string;
  safetyReason: string;
  blockedBy: string[];
};

export type TeoyubeSurfaceUxRefinementPatch = {
  id: string;
  surface: TeoyubeSurfaceUxRefinementSurface;
  filePath: string;
  description: string;
  applied: boolean;
  safetyReason: string;
  regressionCheck: string;
};

export type TeoyubeSurfaceUxRefinementBlocker = {
  id: string;
  surface: TeoyubeSurfaceUxRefinementSurface;
  message: string;
  requiredAction: string;
};

export type TeoyubeSurfaceUxRefinementWarning = {
  id: string;
  surface: TeoyubeSurfaceUxRefinementSurface;
  message: string;
  recommendedAction: string;
};

export type TeoyubeSurfaceUxRefinementDecision =
  | "phase_4_3_ux_ready"
  | "phase_4_3_ux_ready_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubeSurfaceUxRefinementPlan = {
  id: string;
  items: TeoyubeSurfaceUxRefinementItem[];
  safePatches: TeoyubeSurfaceUxRefinementPatch[];
  deferredItems: TeoyubeSurfaceUxRefinementItem[];
  blockedItems: TeoyubeSurfaceUxRefinementItem[];
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

export type TeoyubeSurfaceUxRefinementReport = {
  valid: boolean;
  decision: TeoyubeSurfaceUxRefinementDecision;
  items: TeoyubeSurfaceUxRefinementItem[];
  safePatches: TeoyubeSurfaceUxRefinementPatch[];
  deferredItems: TeoyubeSurfaceUxRefinementItem[];
  blockedItems: TeoyubeSurfaceUxRefinementItem[];
  blockers: TeoyubeSurfaceUxRefinementBlocker[];
  warnings: TeoyubeSurfaceUxRefinementWarning[];
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
