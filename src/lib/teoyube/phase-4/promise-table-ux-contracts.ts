export type TeoyubePromiseTableUxStatus =
  | "ready"
  | "ready_with_warnings"
  | "empty"
  | "blocked"
  | "unknown";

export type TeoyubePromiseTableUxViewMode =
  | "compact_table"
  | "card_grid"
  | "mobile_list"
  | "scripture_focus"
  | "theme_focus"
  | "word_focus"
  | "empty_state"
  | "unknown";

export type TeoyubePromiseTableUxFilter = {
  theme?: string;
  word?: string;
  scripture?: string;
  query?: string;
};

export type TeoyubePromiseTableUxSort = {
  by: "title" | "theme" | "scripture_count" | "relationship_count" | "status";
  direction: "asc" | "desc";
};

export type TeoyubePromiseTableUxSelection = {
  promiseId?: string;
  theme?: string;
  scriptureAnchor?: string;
  word?: string;
};

export type TeoyubePromiseTableUxRow = {
  promiseId: string;
  title: string;
  theme: string;
  scriptureAnchors: string[];
  relatedTeoyubeWords: string[];
  callingLinks: string[];
  prayerLinks: string[];
  tigEdgeCount: number;
  status: TeoyubePromiseTableUxStatus;
  reviewLabel: string;
  relationshipHint: string;
  mobileSummary: string;
  warnings: string[];
  source: "real_promise_table_row" | "safe_empty_state";
  draftContentIncluded: boolean;
};

export type TeoyubePromiseTableUxBlocker = {
  id: string;
  rowId?: string;
  message: string;
  requiredAction: string;
};

export type TeoyubePromiseTableUxWarning = {
  id: string;
  rowId?: string;
  message: string;
  recommendedAction: string;
};

export type TeoyubePromiseTableUxDecision =
  | "promise_table_ux_ready"
  | "promise_table_ux_ready_with_warnings"
  | "empty_state"
  | "blocked";

export type TeoyubePromiseTableUxViewModel = {
  id: string;
  viewMode: TeoyubePromiseTableUxViewMode;
  rows: TeoyubePromiseTableUxRow[];
  filters: TeoyubePromiseTableUxFilter;
  sort: TeoyubePromiseTableUxSort;
  selection?: TeoyubePromiseTableUxSelection;
  emptyState: string;
  generatedFromRealRows: true;
  noDraftContentIncluded: true;
  mobileSafe: true;
  scriptureAnchorsVisible: true;
  explanationHintsVisible: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubePromiseTableUxReport = {
  valid: boolean;
  decision: TeoyubePromiseTableUxDecision;
  viewModel: TeoyubePromiseTableUxViewModel;
  rows: TeoyubePromiseTableUxRow[];
  blockers: TeoyubePromiseTableUxBlocker[];
  warnings: TeoyubePromiseTableUxWarning[];
  generatedFromRealRows: true;
  noDraftContentIncluded: true;
  scriptureAnchorsVisible: true;
  mobileSafe: true;
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
