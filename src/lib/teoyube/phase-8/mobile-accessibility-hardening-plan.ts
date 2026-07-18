export type TeoyubeMobileAccessibilitySurface =
  | "word_card"
  | "prayer_companion"
  | "compass_experience"
  | "tig_response_panel"
  | "tig_graph_explorer"
  | "promise_table"
  | "unknown";

export type TeoyubeMobileAccessibilityHardeningItem = {
  id: string;
  surface: TeoyubeMobileAccessibilitySurface;
  label: string;
  priority: "high" | "medium" | "low";
  details: string;
};

export type TeoyubeMobileAccessibilityHardeningReport = {
  valid: boolean;
  items: TeoyubeMobileAccessibilityHardeningItem[];
  highPriorityItems: TeoyubeMobileAccessibilityHardeningItem[];
  blockers: string[];
  warnings: string[];
  preservesScriptureAnchors: true;
  preservesExplanationText: true;
  preservesConfidenceLabels: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubeMobileAccessibilityHardeningInput = Partial<{
  items: TeoyubeMobileAccessibilityHardeningItem[];
}>;

function item(id: string, surface: TeoyubeMobileAccessibilitySurface, label: string, priority: TeoyubeMobileAccessibilityHardeningItem["priority"], details: string): TeoyubeMobileAccessibilityHardeningItem {
  return { id, surface, label, priority, details };
}

export function getMobileHardeningChecklist(): TeoyubeMobileAccessibilityHardeningItem[] {
  return [
    item("word_card_mobile_readability", "word_card", "WordCard mobile readability", "high", "Review wrapping, Scripture anchors, related Promise Cluster, and fallback copy."),
    item("prayer_mobile_readability", "prayer_companion", "PrayerCompanion mobile readability", "high", "Review devotional boundaries, prayer copy, and Scripture anchors."),
    item("compass_mobile_readability", "compass_experience", "CompassExperience mobile readability", "medium", "Review calling path, action suggestion, and confidence language."),
    item("tig_response_mobile_readability", "tig_response_panel", "TIGResponsePanel mobile readability", "high", "Review explanation trace, confidence label, and fallback reason visibility."),
    item("tig_graph_list_fallback", "tig_graph_explorer", "TIGGraphExplorer list fallback", "high", "Keep graph/list fallback readable on small screens."),
    item("promise_table_mobile_view", "promise_table", "Promise Table mobile view", "high", "Review table wrapping, anchors, and filter labels.")
  ];
}

export function getAccessibilityHardeningChecklist(): TeoyubeMobileAccessibilityHardeningItem[] {
  return [
    item("button_labels", "unknown", "Button labels", "high", "Review button labels and icon labels where obvious."),
    item("keyboard_basics", "unknown", "Keyboard basics", "medium", "Review keyboard path for major surfaces."),
    item("focus_basics", "unknown", "Focus basics", "medium", "Review visible focus and tab order where applicable."),
    item("screen_reader_labels", "unknown", "Screen-reader labels", "medium", "Add screen-reader friendly labels where obvious and safe."),
    item("no_hidden_explanation_text", "unknown", "No hidden explanation text", "high", "Ensure important explanation text is not hidden on mobile.")
  ];
}

export function createMobileAccessibilityHardeningPlan(input: TeoyubeMobileAccessibilityHardeningInput = {}): TeoyubeMobileAccessibilityHardeningItem[] {
  return input.items || [...getMobileHardeningChecklist(), ...getAccessibilityHardeningChecklist()];
}

export function getMobileAccessibilityItemsBySurface(surface: TeoyubeMobileAccessibilitySurface): TeoyubeMobileAccessibilityHardeningItem[] {
  return createMobileAccessibilityHardeningPlan().filter((entry) => entry.surface === surface);
}

export function getHighPriorityMobileAccessibilityItems(): TeoyubeMobileAccessibilityHardeningItem[] {
  return createMobileAccessibilityHardeningPlan().filter((entry) => entry.priority === "high");
}

export function createMobileAccessibilityHardeningReport(input: TeoyubeMobileAccessibilityHardeningInput = {}): TeoyubeMobileAccessibilityHardeningReport {
  const items = createMobileAccessibilityHardeningPlan(input);
  return {
    valid: items.length > 0,
    items,
    highPriorityItems: getHighPriorityMobileAccessibilityItems(),
    blockers: items.length ? [] : ["Mobile/accessibility hardening plan is empty."],
    warnings: ["Mobile/accessibility hardening must not hide Scripture anchors, confidence labels, or explanation text."],
    preservesScriptureAnchors: true,
    preservesExplanationText: true,
    preservesConfidenceLabels: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
