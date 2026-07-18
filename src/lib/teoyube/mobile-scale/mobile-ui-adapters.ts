import type {
  GraphVisualization,
  TigProductionResponse,
  TeoyubeConsentControlState,
  TeoyubePersonalizationPreviewResponse
} from "../../tig";
import {
  toTigExplanationPanelProps,
  toTigGraphPanelProps,
  toTigResponsePanelProps
} from "../../tig";
import type {
  TeoyubeMobileLayoutMode,
  TeoyubeMobileSurface
} from "./mobile-scale-contracts";

export type TeoyubeMobileSectionPriority = "primary" | "secondary" | "diagnostic";

export type TeoyubeMobileLayoutSection = {
  id: string;
  label: string;
  priority: TeoyubeMobileSectionPriority;
  collapsible: boolean;
  defaultOpen: boolean;
  touchFriendly: boolean;
  notes: string[];
};

export type TeoyubeMobileTigResponseLayout = {
  mode: TeoyubeMobileLayoutMode;
  surface: TeoyubeMobileSurface;
  sections: TeoyubeMobileLayoutSection[];
  selectionCount: number;
  scriptureAnchorVisible: boolean;
  confidenceSummary: string;
  fallbackVisible: boolean;
  safetyVisible: boolean;
  graphDeferred: boolean;
  minTouchTargetPx: number;
};

export type TeoyubeMobileGraphPreviewLayout = {
  mode: TeoyubeMobileLayoutMode;
  displayMode: "compact_path" | "expanded_graph" | "empty";
  nodeCount: number;
  edgeCount: number;
  compactNodeIds: string[];
  rootNodeIds: string[];
  selectedNodeIds: string[];
  expandedGraphCollapsible: boolean;
  edgeLabelsHiddenOnMobile: boolean;
  minTouchTargetPx: number;
};

export type TeoyubeMobileExplanationPathLayout = {
  mode: TeoyubeMobileLayoutMode;
  stepCount: number;
  steps: Array<{
    index: number;
    label: string;
    value: string;
  }>;
  collapsible: boolean;
  defaultOpen: boolean;
  summary: string;
};

export type TeoyubeMobilePersonalizationPreviewLayout = {
  mode: TeoyubeMobileLayoutMode;
  status: string;
  sections: TeoyubeMobileLayoutSection[];
  baselineAndPersonalizedStacked: boolean;
  preferenceHintsCollapsible: boolean;
  debugHiddenByDefault: boolean;
  confidenceSummary: string;
  consentVisible: boolean;
  safetyVisible: boolean;
};

export type TeoyubeMobileConsentControlLayout = {
  mode: TeoyubeMobileLayoutMode;
  personalizationEnabled: boolean;
  signalStorageAllowed: boolean;
  rawTextStorageEnabled: false;
  actionGroups: Array<{
    id: string;
    label: string;
    actions: string[];
  }>;
  minTouchTargetPx: number;
  consentStateVisible: boolean;
  destructiveActionsRequireConfirmation: boolean;
};

export type TeoyubePhase72MobileUiReadiness = {
  phase: "Phase 7.2 - Mobile UI Optimization";
  complete: boolean;
  completionPercentage: number;
  completedItems: string[];
  missingItems: string[];
  nextStep: "Phase 7.3 - Performance, Cache & Offline Readiness";
  warnings: string[];
};

export const PHASE_7_2_MOBILE_UI_COMPONENTS: Array<{
  id: string;
  path: string;
  surface: TeoyubeMobileSurface | "all";
  complete: boolean;
  note: string;
}> = [
  {
    id: "mobile_page_shell",
    path: "teoyube-app/src/components/mobile/MobilePageShell.tsx",
    surface: "all",
    complete: true,
    note: "Provides a reusable mobile-first page container."
  },
  {
    id: "mobile_section_card",
    path: "teoyube-app/src/components/mobile/MobileSectionCard.tsx",
    surface: "all",
    complete: true,
    note: "Provides readable, safe-overflow mobile section cards."
  },
  {
    id: "mobile_responsive_stack",
    path: "teoyube-app/src/components/mobile/MobileResponsiveStack.tsx",
    surface: "all",
    complete: true,
    note: "Stacks content on phones and expands on tablet/desktop."
  },
  {
    id: "mobile_collapsible_section",
    path: "teoyube-app/src/components/mobile/MobileCollapsibleSection.tsx",
    surface: "all",
    complete: true,
    note: "Keeps long prayers, graph details, traces, and hints available without mobile overload."
  },
  {
    id: "mobile_action_bar",
    path: "teoyube-app/src/components/mobile/MobileActionBar.tsx",
    surface: "all",
    complete: true,
    note: "Groups consent, feedback, and response actions with touch-friendly spacing."
  },
  {
    id: "tig_response_panel_mobile",
    path: "teoyube-app/src/components/tig/TIGResponsePanel.tsx",
    surface: "tig_response_panel",
    complete: true,
    note: "Scripture, production insights, graph preview, prayer, journal, and graph trace now use mobile-safe layout."
  },
  {
    id: "tig_graph_preview_mobile",
    path: "teoyube-app/src/components/tig/TigGraphPreview.tsx",
    surface: "tig_graph_preview",
    complete: true,
    note: "Adds compact path cards before the expanded graph renderer."
  },
  {
    id: "tig_explanation_path_mobile",
    path: "teoyube-app/src/components/tig/TigExplanationPathMobile.tsx",
    surface: "tig_response_panel",
    complete: true,
    note: "Shows emotion, word, promise, Scripture, prayer, action, and confidence as a vertical mobile path."
  },
  {
    id: "personalization_preview_mobile",
    path: "teoyube-app/src/components/tig/TigPersonalizationPreviewPanel.tsx",
    surface: "personalization_preview",
    complete: true,
    note: "Stacks baseline and personalized preview, while collapsing hints and debug details."
  },
  {
    id: "consent_controls_mobile",
    path: "teoyube-app/src/components/tig/TigPersonalizationConsentPanel.tsx",
    surface: "personalization_controls",
    complete: true,
    note: "Uses touch-friendly action grouping for consent, export, reset, and delete simulations."
  },
  {
    id: "feedback_controls_mobile",
    path: "teoyube-app/src/components/tig/TigPersonalizationFeedbackControls.tsx",
    surface: "feedback_controls",
    complete: true,
    note: "Uses touch-friendly feedback actions without hidden tracking."
  }
];

export const PHASE_7_2_MOBILE_SURFACE_READINESS_NOTES: Array<{
  surface: TeoyubeMobileSurface;
  note: string;
}> = [
  { surface: "canon", note: "Canon production sections can use the shared TIG mobile surface section." },
  { surface: "daily_word", note: "Daily Word keeps Scripture, promise, prayer, and action readable in stacked cards." },
  { surface: "prayer", note: "Long prayer content is collapsible and Scripture anchoring remains visible." },
  { surface: "calling_compass", note: "Calling, journey, Scripture, and action evidence can stack on narrow screens." },
  { surface: "promise_cluster", note: "TIG promise search defers heavy graph details behind a compact preview." },
  { surface: "ai_companion", note: "AI Companion remains graph-grounded and uses compact safety/confidence indicators." },
  { surface: "onboarding", note: "Onboarding uses mobile-first cards, plain-language guide links, and local data disclosure." },
  { surface: "personalization_controls", note: "Consent controls stay visible and touch-friendly on phones." },
  { surface: "feedback_controls", note: "Feedback controls remain explicit user controls, not hidden personalization." },
  { surface: "personalization_preview", note: "Preview comparison stacks baseline and personalized responses on mobile." },
  { surface: "tig_graph_preview", note: "Graph preview uses list-first path cards and collapses the expanded graph." },
  { surface: "tig_response_panel", note: "Response panel preserves Scripture, explanation path, save, journal, graph, and fallback state." }
];

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function section(params: TeoyubeMobileLayoutSection): TeoyubeMobileLayoutSection {
  return params;
}

export function toMobileTigResponseLayout(
  response: TigProductionResponse,
  mode: TeoyubeMobileLayoutMode = "mobile_compact"
): TeoyubeMobileTigResponseLayout {
  const panel = toTigResponsePanelProps(response);
  const graph = toTigGraphPanelProps(response);
  const scriptureAnchorVisible = Boolean(response.selection.scriptureAnchor);

  return {
    mode,
    surface: response.input.surface || "tig_response_panel",
    selectionCount: panel.selectionRows.length,
    scriptureAnchorVisible,
    confidenceSummary: `${percent(panel.confidence.score)} ${panel.confidence.label}`,
    fallbackVisible: panel.fallback.used,
    safetyVisible: true,
    graphDeferred: graph.statistics.totalNodes > 0,
    minTouchTargetPx: 44,
    sections: [
      section({
        id: "message",
        label: "Main message",
        priority: "primary",
        collapsible: false,
        defaultOpen: true,
        touchFriendly: true,
        notes: ["Show the pastoral answer before diagnostic graph detail."]
      }),
      section({
        id: "scripture",
        label: "Scripture anchor",
        priority: "primary",
        collapsible: false,
        defaultOpen: true,
        touchFriendly: true,
        notes: scriptureAnchorVisible
          ? ["Scripture anchor remains visible on mobile."]
          : ["Fallback should restore a Scripture anchor before rendering."]
      }),
      section({
        id: "selection",
        label: "Selected path",
        priority: "primary",
        collapsible: false,
        defaultOpen: true,
        touchFriendly: true,
        notes: ["Word, promise, Scripture, prayer, and action use stacked cards."]
      }),
      section({
        id: "explanation",
        label: "Explanation path",
        priority: "secondary",
        collapsible: true,
        defaultOpen: mode !== "mobile_compact",
        touchFriendly: true,
        notes: ["Explainability stays available without taking the first viewport."]
      }),
      section({
        id: "prayer",
        label: "Prayer sequence",
        priority: "primary",
        collapsible: true,
        defaultOpen: true,
        touchFriendly: true,
        notes: ["Long prayer text can collapse while remaining accessible."]
      }),
      section({
        id: "action",
        label: "Faithful action",
        priority: "primary",
        collapsible: false,
        defaultOpen: true,
        touchFriendly: true,
        notes: ["The action step is displayed as a clear mobile card."]
      }),
      section({
        id: "graph",
        label: "Graph preview",
        priority: "secondary",
        collapsible: true,
        defaultOpen: false,
        touchFriendly: true,
        notes: ["The compact path appears first; expanded graph is optional."]
      }),
      section({
        id: "debug",
        label: "Debug details",
        priority: "diagnostic",
        collapsible: true,
        defaultOpen: false,
        touchFriendly: true,
        notes: ["Debug output stays hidden unless explicitly requested."]
      })
    ]
  };
}

export function toMobileGraphPreviewLayout(
  graph: GraphVisualization,
  mode: TeoyubeMobileLayoutMode = "mobile_compact"
): TeoyubeMobileGraphPreviewLayout {
  const rootNodeIds = graph.nodes.filter((node) => node.root).map((node) => node.id);
  const selectedNodeIds = graph.nodes.filter((node) => node.selected).map((node) => node.id);
  const compactNodeIds = [
    ...rootNodeIds,
    ...selectedNodeIds,
    ...graph.nodes
      .filter((node) => !node.root && !node.selected)
      .map((node) => node.id)
  ].filter((nodeId, index, all) => all.indexOf(nodeId) === index).slice(0, 8);

  return {
    mode,
    displayMode: graph.nodes.length ? (mode === "desktop" ? "expanded_graph" : "compact_path") : "empty",
    nodeCount: graph.statistics.totalNodes,
    edgeCount: graph.statistics.totalEdges,
    compactNodeIds,
    rootNodeIds,
    selectedNodeIds,
    expandedGraphCollapsible: mode !== "desktop",
    edgeLabelsHiddenOnMobile: mode === "mobile_compact" || mode === "mobile_expanded",
    minTouchTargetPx: 44
  };
}

export function toMobileExplanationPathLayout(
  explanationPath:
    | TigProductionResponse["explanation"]
    | string[]
    | undefined,
  mode: TeoyubeMobileLayoutMode = "mobile_compact"
): TeoyubeMobileExplanationPathLayout {
  const panel =
    explanationPath && !Array.isArray(explanationPath) && "summary" in explanationPath
      ? explanationPath
      : undefined;
  const path = Array.isArray(explanationPath)
    ? explanationPath
    : panel?.reasonPath || [];

  return {
    mode,
    stepCount: path.length,
    collapsible: path.length > 4 || mode === "mobile_compact",
    defaultOpen: mode !== "mobile_compact" || path.length <= 4,
    summary: panel?.summary || "Teoyube explains the selected Scripture path in ordered steps.",
    steps: path.map((value, index) => ({
      index: index + 1,
      label: `Step ${index + 1}`,
      value
    }))
  };
}

export function toMobilePersonalizationPreviewLayout(
  preview: TeoyubePersonalizationPreviewResponse,
  mode: TeoyubeMobileLayoutMode = "mobile_compact"
): TeoyubeMobilePersonalizationPreviewLayout {
  return {
    mode,
    status: preview.status,
    baselineAndPersonalizedStacked: mode !== "desktop",
    preferenceHintsCollapsible: true,
    debugHiddenByDefault: true,
    confidenceSummary: `Baseline ${percent(preview.confidenceComparison.baselineScore)}, preview ${
      preview.confidenceComparison.personalizedScore !== undefined
        ? percent(preview.confidenceComparison.personalizedScore)
        : "not run"
    }`,
    consentVisible: true,
    safetyVisible: true,
    sections: [
      section({
        id: "baseline",
        label: "Baseline response",
        priority: "primary",
        collapsible: false,
        defaultOpen: true,
        touchFriendly: true,
        notes: ["Baseline production response remains available."]
      }),
      section({
        id: "personalized_preview",
        label: "Personalized preview",
        priority: "primary",
        collapsible: !preview.personalized,
        defaultOpen: Boolean(preview.personalized),
        touchFriendly: true,
        notes: ["Preview remains consent-aware and cannot replace Scripture anchoring."]
      }),
      section({
        id: "what_changed",
        label: "What changed",
        priority: "secondary",
        collapsible: true,
        defaultOpen: mode !== "mobile_compact",
        touchFriendly: true,
        notes: preview.explanation.whatChanged
      }),
      section({
        id: "preference_hints",
        label: "Preference hints used",
        priority: "secondary",
        collapsible: true,
        defaultOpen: false,
        touchFriendly: true,
        notes: preview.preferenceHintsUsed
      }),
      section({
        id: "debug",
        label: "Debug comparison",
        priority: "diagnostic",
        collapsible: true,
        defaultOpen: false,
        touchFriendly: true,
        notes: ["Raw comparison details stay hidden by default."]
      })
    ]
  };
}

export function toMobileConsentControlLayout(
  consentState: TeoyubeConsentControlState,
  mode: TeoyubeMobileLayoutMode = "mobile_compact"
): TeoyubeMobileConsentControlLayout {
  return {
    mode,
    personalizationEnabled: consentState.personalizationEnabled,
    signalStorageAllowed: consentState.signalStorageAllowed,
    rawTextStorageEnabled: false,
    minTouchTargetPx: 44,
    consentStateVisible: true,
    destructiveActionsRequireConfirmation: true,
    actionGroups: [
      {
        id: "personalization",
        label: "Personalization",
        actions: [
          "Enable session-only personalization",
          "Enable profile preview personalization",
          "Disable personalization"
        ]
      },
      {
        id: "preferences",
        label: "Preference controls",
        actions: ["Enable preference hints", "Disable preference hints", "Reset preferences"]
      },
      {
        id: "data_controls",
        label: "Data controls",
        actions: ["Request export", "Request delete", "Disable raw text storage"]
      }
    ]
  };
}

export function getPhase72MobileUiOptimizationReadiness(): TeoyubePhase72MobileUiReadiness {
  const missingItems = PHASE_7_2_MOBILE_UI_COMPONENTS
    .filter((item) => !item.complete)
    .map((item) => item.id);
  const completedItems = PHASE_7_2_MOBILE_UI_COMPONENTS
    .filter((item) => item.complete)
    .map((item) => item.id);
  const complete =
    missingItems.length === 0 &&
    PHASE_7_2_MOBILE_SURFACE_READINESS_NOTES.length >= 12;

  return {
    phase: "Phase 7.2 - Mobile UI Optimization",
    complete,
    completionPercentage: complete ? 100 : Math.round((completedItems.length / Math.max(1, PHASE_7_2_MOBILE_UI_COMPONENTS.length)) * 100),
    completedItems,
    missingItems,
    nextStep: "Phase 7.3 - Performance, Cache & Offline Readiness",
    warnings: [
      "Phase 7.2 does not connect production database persistence.",
      "Phase 7.2 does not send external analytics.",
      "Phase 7.2 does not add live AI orchestration.",
      "Phase 7.2 does not implement service workers.",
      "Phase 7.2 does not start native mobile app work.",
      "Phase 7.2 does not require localStorage, cookies, file writes, or external providers for mobile layout adapters."
    ]
  };
}
