import type {
  TeoyubeMobileLayoutMode,
  TeoyubeMobileSurface,
  TeoyubeResponsiveBreakpoint,
  TeoyubeResponsiveRule
} from "./mobile-scale-contracts";

export type TeoyubeBreakpointDefinition = {
  id: TeoyubeResponsiveBreakpoint;
  minWidth: number;
  label: string;
};

const BREAKPOINTS: TeoyubeBreakpointDefinition[] = [
  { id: "xs", minWidth: 0, label: "Small phone" },
  { id: "sm", minWidth: 480, label: "Large phone" },
  { id: "md", minWidth: 768, label: "Tablet" },
  { id: "lg", minWidth: 1024, label: "Small desktop" },
  { id: "xl", minWidth: 1280, label: "Desktop" },
  { id: "2xl", minWidth: 1536, label: "Wide desktop" }
];

const BASE_RULES: TeoyubeResponsiveRule[] = [
  {
    id: "mobile_stacked_cards",
    surface: "all",
    layoutMode: "mobile_compact",
    rule: "Stack cards in a single column and place Scripture, prayer, reflection, and action before secondary diagnostics.",
    rationale: "Mobile users need the pastoral response before graph or debug detail."
  },
  {
    id: "mobile_collapsible_explanations",
    surface: "all",
    layoutMode: "mobile_compact",
    rule: "Collapse explanation paths, graph traces, and decision details behind short summaries.",
    rationale: "Explanation should remain available without overwhelming the first viewport."
  },
  {
    id: "mobile_compact_indicators",
    surface: "all",
    layoutMode: "mobile_expanded",
    rule: "Use compact confidence, fallback, and safety chips instead of large metric panels.",
    rationale: "Important status remains visible while preserving reading flow."
  },
  {
    id: "tablet_two_column",
    surface: "all",
    layoutMode: "tablet",
    rule: "Use two columns only when both columns can keep readable Scripture and action content.",
    rationale: "Tablet layouts can compare response and explanation without desktop density."
  },
  {
    id: "desktop_expanded_detail",
    surface: "all",
    layoutMode: "desktop",
    rule: "Show expanded graph, decision trace, and production details alongside the primary response.",
    rationale: "Desktop has space for diagnostic context without hiding the primary answer."
  }
];

export function getTeoyubeResponsiveBreakpoints(): TeoyubeBreakpointDefinition[] {
  return BREAKPOINTS.map((breakpoint) => ({ ...breakpoint }));
}

export function getRecommendedLayoutMode(width: number): TeoyubeMobileLayoutMode {
  if (!Number.isFinite(width) || width < 0) return "unknown";
  if (width < 480) return "mobile_compact";
  if (width < 768) return "mobile_expanded";
  if (width < 1024) return "tablet";
  return "desktop";
}

export function getSurfaceResponsiveStrategy(
  surface: TeoyubeMobileSurface
): TeoyubeResponsiveRule[] {
  return [
    ...BASE_RULES,
    ...getTigPanelResponsiveRules().filter((rule) =>
      ["tig_response_panel", "promise_cluster", "ai_companion"].includes(surface)
        ? true
        : rule.surface === surface
    ),
    ...getGraphPreviewResponsiveRules().filter((rule) =>
      surface === "tig_graph_preview" ? true : rule.surface === surface
    ),
    ...getPersonalizationControlsResponsiveRules().filter((rule) =>
      ["personalization_controls", "feedback_controls", "personalization_preview"].includes(surface)
        ? true
        : rule.surface === surface
    )
  ];
}

export function getTigPanelResponsiveRules(): TeoyubeResponsiveRule[] {
  return [
    {
      id: "tig_primary_order_mobile",
      surface: "tig_response_panel",
      layoutMode: "mobile_compact",
      rule: "Order response sections as message, Scripture, prayer, reflection, journal input, action, save action, then graph.",
      rationale: "The most useful faith response should not be pushed below visual diagnostics."
    },
    {
      id: "tig_decision_trace_collapsible",
      surface: "tig_response_panel",
      layoutMode: "mobile_expanded",
      rule: "Render the decision trace as a compact accordion or horizontal step list on mobile.",
      rationale: "Explanation remains inspectable without forcing long scrolling."
    },
    {
      id: "tig_desktop_split",
      surface: "tig_response_panel",
      layoutMode: "desktop",
      rule: "Allow response text and graph/detail panes to sit side-by-side with equal reading priority.",
      rationale: "Desktop can support richer traceability."
    }
  ];
}

export function getGraphPreviewResponsiveRules(): TeoyubeResponsiveRule[] {
  return [
    {
      id: "graph_mobile_limit_nodes",
      surface: "tig_graph_preview",
      layoutMode: "mobile_compact",
      rule: "Limit graph previews to root, Scripture, primary promise, primary word, journey, and one action node.",
      rationale: "Tiny graph labels are not useful on phones."
    },
    {
      id: "graph_mobile_hide_edge_labels",
      surface: "tig_graph_preview",
      layoutMode: "mobile_expanded",
      rule: "Hide edge labels and use color/line weight only when the viewport is narrow.",
      rationale: "Edge labels compete with node labels on small screens."
    },
    {
      id: "graph_list_fallback",
      surface: "tig_graph_preview",
      layoutMode: "mobile_compact",
      rule: "Provide a list fallback for graph nodes and relationships.",
      rationale: "Graph meaning must remain accessible if the visual map is too dense."
    }
  ];
}

export function getPersonalizationControlsResponsiveRules(): TeoyubeResponsiveRule[] {
  return [
    {
      id: "personalization_touch_targets",
      surface: "personalization_controls",
      layoutMode: "mobile_compact",
      rule: "Use touch targets of at least 44px and plain-language labels for consent, reset, export, and delete actions.",
      rationale: "Privacy controls must be easy to understand and use."
    },
    {
      id: "feedback_controls_compact",
      surface: "feedback_controls",
      layoutMode: "mobile_expanded",
      rule: "Group feedback actions into simple positive, reduce, disable, reset, export, and delete controls.",
      rationale: "Feedback should feel like user control, not hidden learning."
    },
    {
      id: "preview_tabs_mobile",
      surface: "personalization_preview",
      layoutMode: "mobile_compact",
      rule: "Use tabs or accordions for baseline versus personalized preview comparison.",
      rationale: "Side-by-side preview comparisons are too dense on phones."
    }
  ];
}
