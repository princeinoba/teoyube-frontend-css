import {
  createPromiseTable,
  type TeoyubePromiseTableRow
} from "../promises/promise-table";
import type {
  TeoyubePromiseTableUxBlocker,
  TeoyubePromiseTableUxDecision,
  TeoyubePromiseTableUxFilter,
  TeoyubePromiseTableUxReport,
  TeoyubePromiseTableUxRow,
  TeoyubePromiseTableUxSort,
  TeoyubePromiseTableUxViewMode,
  TeoyubePromiseTableUxViewModel,
  TeoyubePromiseTableUxWarning
} from "./promise-table-ux-contracts";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function includes(value: string, query = ""): boolean {
  const normalizedQuery = normalize(query);
  return !normalizedQuery || normalize(value).includes(normalizedQuery);
}

function rowToUxRow(row: TeoyubePromiseTableRow): TeoyubePromiseTableUxRow {
  const scriptureCount = row.scriptureAnchors.length;
  const relationshipCount = row.tigEdges.length + row.relatedTeoyubeWords.length + row.callingLinks.length;
  return {
    promiseId: row.promiseId,
    title: row.title,
    theme: row.theme,
    scriptureAnchors: row.scriptureAnchors,
    relatedTeoyubeWords: row.relatedTeoyubeWords,
    callingLinks: row.callingLinks,
    prayerLinks: row.prayerLinks,
    tigEdgeCount: row.tigEdges.length,
    status: row.valid && scriptureCount > 0 ? (row.warnings.length ? "ready_with_warnings" : "ready") : "ready_with_warnings",
    reviewLabel: row.valid ? "Existing reviewed data path" : "Needs Scripture review",
    relationshipHint: `${relationshipCount} relationship signal(s) across words, calling, prayer, and TIG edges.`,
    mobileSummary: `${row.theme}. ${scriptureCount || "No"} Scripture anchor(s). ${row.relatedTeoyubeWords.length} related word(s).`,
    warnings: row.scriptureAnchors.length ? row.warnings : [...row.warnings, "Missing Scripture anchor - keep visible for review."],
    source: "real_promise_table_row",
    draftContentIncluded: false
  };
}

function getBaseRows(): TeoyubePromiseTableUxRow[] {
  return createPromiseTable().rows.map(rowToUxRow);
}

export function filterPromiseTableUxRows(
  rows: TeoyubePromiseTableUxRow[],
  filters: TeoyubePromiseTableUxFilter = {}
): TeoyubePromiseTableUxRow[] {
  return rows.filter((row) => {
    const combined = [
      row.title,
      row.theme,
      ...row.scriptureAnchors,
      ...row.relatedTeoyubeWords,
      ...row.callingLinks,
      ...row.prayerLinks
    ].join(" ");
    return (
      includes(combined, filters.query) &&
      includes(row.theme, filters.theme) &&
      (!filters.word || row.relatedTeoyubeWords.some((word) => includes(word, filters.word))) &&
      (!filters.scripture || row.scriptureAnchors.some((anchor) => includes(anchor, filters.scripture)))
    );
  });
}

export function sortPromiseTableUxRows(
  rows: TeoyubePromiseTableUxRow[],
  sort: TeoyubePromiseTableUxSort = { by: "title", direction: "asc" }
): TeoyubePromiseTableUxRow[] {
  const direction = sort.direction === "desc" ? -1 : 1;
  return [...rows].sort((a, b) => {
    if (sort.by === "theme") return a.theme.localeCompare(b.theme) * direction;
    if (sort.by === "scripture_count") return (a.scriptureAnchors.length - b.scriptureAnchors.length) * direction;
    if (sort.by === "relationship_count") return (a.tigEdgeCount - b.tigEdgeCount) * direction;
    if (sort.by === "status") return a.status.localeCompare(b.status) * direction;
    return a.title.localeCompare(b.title) * direction;
  });
}

export function getPromiseTableUxEmptyState(input: {
  filters?: TeoyubePromiseTableUxFilter;
  reason?: string;
} = {}): string {
  if (input.reason) return input.reason;
  if (input.filters && Object.values(input.filters).some(Boolean)) {
    return "No Promise Table rows match this filter yet. No unsupported promise is invented for the empty state.";
  }
  return "Promise Table rows are not available yet. Use a safe empty state until real rows load.";
}

export function createPromiseTableUxViewModel(input: {
  viewMode?: TeoyubePromiseTableUxViewMode;
  filters?: TeoyubePromiseTableUxFilter;
  sort?: TeoyubePromiseTableUxSort;
  maxRows?: number;
} = {}): TeoyubePromiseTableUxViewModel {
  const sort = input.sort || { by: "title", direction: "asc" as const };
  const filters = input.filters || {};
  const rows = sortPromiseTableUxRows(filterPromiseTableUxRows(getBaseRows(), filters), sort).slice(0, input.maxRows || 50);
  return {
    id: "phase_4_4_promise_table_ux_view_model",
    viewMode: rows.length ? input.viewMode || "card_grid" : "empty_state",
    rows,
    filters,
    sort,
    emptyState: getPromiseTableUxEmptyState({ filters }),
    generatedFromRealRows: true,
    noDraftContentIncluded: true,
    mobileSafe: true,
    scriptureAnchorsVisible: true,
    explanationHintsVisible: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}

export function createPromiseTableMobileListViewModel(input: Parameters<typeof createPromiseTableUxViewModel>[0] = {}) {
  return createPromiseTableUxViewModel({ ...input, viewMode: "mobile_list" });
}

export function createPromiseTableCardGridViewModel(input: Parameters<typeof createPromiseTableUxViewModel>[0] = {}) {
  return createPromiseTableUxViewModel({ ...input, viewMode: "card_grid" });
}

export function createPromiseTableScriptureFocusViewModel(input: Parameters<typeof createPromiseTableUxViewModel>[0] = {}) {
  return createPromiseTableUxViewModel({ ...input, viewMode: "scripture_focus", sort: input.sort || { by: "scripture_count", direction: "desc" } });
}

function blockersForRows(rows: TeoyubePromiseTableUxRow[]): TeoyubePromiseTableUxBlocker[] {
  return rows
    .filter((row) => row.draftContentIncluded)
    .map((row) => ({
      id: `${row.promiseId}_draft_content`,
      rowId: row.promiseId,
      message: `${row.title} includes draft content.`,
      requiredAction: "Remove unreviewed draft content from live Promise Table rows."
    }));
}

function warningsForRows(rows: TeoyubePromiseTableUxRow[]): TeoyubePromiseTableUxWarning[] {
  return rows.flatMap((row) => [
    ...(row.scriptureAnchors.length
      ? []
      : [{
          id: `${row.promiseId}_missing_scripture`,
          rowId: row.promiseId,
          message: `${row.title} has no visible Scripture anchors.`,
          recommendedAction: "Keep missing-anchor warning visible until reviewed."
        }]),
    ...row.warnings.map((warning, index) => ({
      id: `${row.promiseId}_warning_${index}`,
      rowId: row.promiseId,
      message: warning,
      recommendedAction: "Keep warning visible in review-aware Promise Table UX."
    }))
  ]);
}

export function createPromiseTableUxReport(input: {
  viewModel?: TeoyubePromiseTableUxViewModel;
} = {}): TeoyubePromiseTableUxReport {
  const viewModel = input.viewModel || createPromiseTableUxViewModel();
  const blockers = blockersForRows(viewModel.rows);
  const warnings = warningsForRows(viewModel.rows);
  const decision: TeoyubePromiseTableUxDecision = blockers.length
    ? "blocked"
    : viewModel.rows.length
      ? warnings.length
        ? "promise_table_ux_ready_with_warnings"
        : "promise_table_ux_ready"
      : "empty_state";

  return {
    valid: blockers.length === 0,
    decision,
    viewModel,
    rows: viewModel.rows,
    blockers,
    warnings,
    generatedFromRealRows: true,
    noDraftContentIncluded: true,
    scriptureAnchorsVisible: true,
    mobileSafe: true,
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
