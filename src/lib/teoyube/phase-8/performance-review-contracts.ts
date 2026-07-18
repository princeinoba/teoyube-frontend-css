export type TeoyubePerformanceReviewStatus =
  | "planned"
  | "reviewed"
  | "reviewed_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubePerformanceReviewArea =
  | "app_load_perception"
  | "word_card"
  | "promise_table"
  | "prayer_companion"
  | "compass_experience"
  | "tig_response_panel"
  | "tig_graph_explorer"
  | "graph_list_fallback"
  | "mobile_rendering"
  | "bundle_awareness"
  | "data_loading"
  | "unknown";

export type TeoyubePerformanceReviewDecision =
  | "performance_review_complete"
  | "performance_review_complete_with_warnings"
  | "blocked"
  | "needs_manual_review"
  | "unknown";

export type TeoyubePerformanceReviewBlocker = {
  id: string;
  area: TeoyubePerformanceReviewArea;
  message: string;
  requiredAction: string;
};

export type TeoyubePerformanceReviewWarning = {
  id: string;
  area: TeoyubePerformanceReviewArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubePerformanceReviewCheck = {
  id: string;
  area: TeoyubePerformanceReviewArea;
  label: string;
  passed: boolean;
  details: string;
};

export type TeoyubePerformanceReviewResult = {
  id: string;
  area: TeoyubePerformanceReviewArea;
  status: TeoyubePerformanceReviewStatus;
  notes: string[];
  noExternalMonitoringConnected: true;
  noAnalyticsEnabled: true;
};

export type TeoyubePerformanceReviewReport = {
  valid: boolean;
  decision: TeoyubePerformanceReviewDecision;
  checks: TeoyubePerformanceReviewCheck[];
  results: TeoyubePerformanceReviewResult[];
  blockers: TeoyubePerformanceReviewBlocker[];
  warnings: TeoyubePerformanceReviewWarning[];
  noExternalMonitoringConnected: true;
  noAnalyticsEnabled: true;
  noPerformanceVendorAdded: true;
  noPublicUrlsFetchedAutomatically: true;
  inMemoryOnly: true;
  generatedAt: string;
};
