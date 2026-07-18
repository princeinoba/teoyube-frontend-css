export type TeoyubePerformanceHardeningSurface =
  | "app_load"
  | "word_card"
  | "promise_table"
  | "tig_response_panel"
  | "tig_graph_explorer"
  | "mobile"
  | "unknown";

export type TeoyubePerformanceHardeningItem = {
  id: string;
  surface: TeoyubePerformanceHardeningSurface;
  label: string;
  priority: "high" | "medium" | "low";
  details: string;
};

export type TeoyubePerformanceHardeningReport = {
  valid: boolean;
  items: TeoyubePerformanceHardeningItem[];
  highPriorityItems: TeoyubePerformanceHardeningItem[];
  blockers: string[];
  warnings: string[];
  noExternalMonitoringConnected: true;
  noAnalyticsEnabled: true;
  noNewToolingAdded: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubePerformanceHardeningInput = Partial<{
  items: TeoyubePerformanceHardeningItem[];
}>;

function item(id: string, surface: TeoyubePerformanceHardeningSurface, label: string, priority: TeoyubePerformanceHardeningItem["priority"], details: string): TeoyubePerformanceHardeningItem {
  return { id, surface, label, priority, details };
}

export function getPerformanceHardeningChecklist(): TeoyubePerformanceHardeningItem[] {
  return [
    item("app_load_perception", "app_load", "App load perception", "high", "Review perceived load and avoid unnecessary client-side work where safe."),
    item("large_graph_list_rendering", "tig_graph_explorer", "Large graph/list rendering", "high", "Keep graph outputs readable and preserve list fallback."),
    item("promise_table_rendering", "promise_table", "Promise Table rendering", "medium", "Review table rendering and mobile-safe layout."),
    item("word_card_rendering", "word_card", "WordCard rendering", "medium", "Review WordCard rendering and stable fallback states."),
    item("tig_response_panel_rendering", "tig_response_panel", "TIGResponsePanel rendering", "medium", "Review explanation and confidence rendering."),
    item("mobile_rendering", "mobile", "Mobile rendering", "high", "Review mobile rendering without adding monitoring or analytics."),
    item("bundle_awareness", "app_load", "Bundle awareness", "low", "Use existing project tooling only if available.")
  ];
}

export function createPerformanceHardeningPlan(input: TeoyubePerformanceHardeningInput = {}): TeoyubePerformanceHardeningItem[] {
  return input.items || getPerformanceHardeningChecklist();
}

export function getPerformanceHardeningItemsBySurface(surface: TeoyubePerformanceHardeningSurface): TeoyubePerformanceHardeningItem[] {
  return createPerformanceHardeningPlan().filter((entry) => entry.surface === surface);
}

export function getHighPriorityPerformanceHardeningItems(): TeoyubePerformanceHardeningItem[] {
  return createPerformanceHardeningPlan().filter((entry) => entry.priority === "high");
}

export function createPerformanceHardeningReport(input: TeoyubePerformanceHardeningInput = {}): TeoyubePerformanceHardeningReport {
  const items = createPerformanceHardeningPlan(input);
  return {
    valid: items.length > 0,
    items,
    highPriorityItems: getHighPriorityPerformanceHardeningItems(),
    blockers: items.length ? [] : ["Performance hardening plan is empty."],
    warnings: ["Performance hardening uses existing tooling only; no external monitoring or analytics are connected."],
    noExternalMonitoringConnected: true,
    noAnalyticsEnabled: true,
    noNewToolingAdded: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
