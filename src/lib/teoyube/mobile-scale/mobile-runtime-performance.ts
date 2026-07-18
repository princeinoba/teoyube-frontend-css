import type { TigProductionResponse } from "../../tig";
import type {
  TeoyubeDeferredRenderPlan,
  TeoyubePerformanceOptimizationReport
} from "./performance-optimization-contracts";
import {
  createTigResponsePerformanceReport,
  estimateExplanationPathRenderCost,
  estimateTigGraphRenderCost,
  getDefaultTigResponseSizeBudget
} from "./response-performance-budget";

export type TeoyubeMobileRenderSection =
  | "scripture_anchor"
  | "selected_word"
  | "promise_cluster"
  | "prayer_sequence"
  | "action_step"
  | "explanation_path"
  | "graph_preview"
  | "debug_info"
  | "event_payload_preview"
  | "personalization_preview";

export function getMobileRuntimePerformancePlan(): TeoyubeDeferredRenderPlan[] {
  return [
    {
      section: "scripture_anchor",
      priority: "highest",
      defer: false,
      collapse: false,
      defaultOpen: true,
      reason: "Every usable response must keep Scripture visible."
    },
    {
      section: "selected_word",
      priority: "highest",
      defer: false,
      collapse: false,
      defaultOpen: true,
      reason: "The selected Teoyube word explains the Scripture-backed theme."
    },
    {
      section: "promise_cluster",
      priority: "high",
      defer: false,
      collapse: false,
      defaultOpen: true,
      reason: "Promise clusters summarize the graph path for normal users."
    },
    {
      section: "prayer_sequence",
      priority: "high",
      defer: false,
      collapse: true,
      defaultOpen: true,
      reason: "Prayer stays available, but long text can collapse."
    },
    {
      section: "action_step",
      priority: "high",
      defer: false,
      collapse: false,
      defaultOpen: true,
      reason: "The faithful next step should remain easy to find."
    },
    {
      section: "explanation_path",
      priority: "medium",
      defer: false,
      collapse: true,
      defaultOpen: false,
      reason: "Explanation remains available without overwhelming mobile screens."
    },
    {
      section: "graph_preview",
      priority: "low",
      defer: true,
      collapse: true,
      defaultOpen: false,
      reason: "Graph visualization is useful but can be expensive on mobile."
    },
    {
      section: "debug_info",
      priority: "debug",
      defer: true,
      collapse: true,
      defaultOpen: false,
      reason: "Debug payloads are for developers and should stay hidden."
    },
    {
      section: "event_payload_preview",
      priority: "debug",
      defer: true,
      collapse: true,
      defaultOpen: false,
      reason: "Analytics-ready event payloads should not render for normal users."
    }
  ];
}

export function shouldDeferGraphPreview(response: TigProductionResponse): boolean {
  return estimateTigGraphRenderCost(
    response.visualization,
    getDefaultTigResponseSizeBudget().graph
  ).shouldDefer;
}

export function shouldCollapseExplanationPath(response: TigProductionResponse): boolean {
  return estimateExplanationPathRenderCost(response.explanation).shouldCollapse;
}

export function shouldHideDebugByDefault(_response: TigProductionResponse): boolean {
  return true;
}

export function getMobileRenderPriority(
  section: TeoyubeMobileRenderSection
): TeoyubeDeferredRenderPlan["priority"] {
  return (
    getMobileRuntimePerformancePlan().find((item) => item.section === section)?.priority ||
    "low"
  );
}

export function createDeferredTigRenderPlan(
  response: TigProductionResponse
): TeoyubeDeferredRenderPlan[] {
  return getMobileRuntimePerformancePlan().map((plan) => {
    if (plan.section === "graph_preview") {
      const defer = shouldDeferGraphPreview(response);
      return {
        ...plan,
        defer,
        collapse: true,
        defaultOpen: !defer,
        reason: defer
          ? "Graph preview crosses the mobile threshold, so render the compact path first."
          : "Graph preview is within the mobile budget."
      };
    }

    if (plan.section === "explanation_path") {
      const collapse = shouldCollapseExplanationPath(response);
      return {
        ...plan,
        collapse,
        defaultOpen: !collapse,
        reason: collapse
          ? "Explanation path is long enough to collapse by default."
          : "Explanation path is short enough to show."
      };
    }

    if (plan.section === "debug_info" || plan.section === "event_payload_preview") {
      return {
        ...plan,
        defer: shouldHideDebugByDefault(response),
        collapse: true,
        defaultOpen: false
      };
    }

    return plan;
  });
}

export function createMobilePerformanceReadinessReport(
  response: TigProductionResponse
): TeoyubePerformanceOptimizationReport {
  const report = createTigResponsePerformanceReport(response);
  const deferredRenderPlan = createDeferredTigRenderPlan(response);
  const warnings = [
    ...report.warnings,
    shouldDeferGraphPreview(response) ? "Graph preview should be deferred on mobile." : "",
    shouldCollapseExplanationPath(response) ? "Explanation path should be collapsible on mobile." : ""
  ].filter(Boolean);

  return {
    ...report,
    deferredRenderPlan,
    warnings,
    recommendations: [
      ...report.recommendations,
      "Use the deferred render plan to keep the first mobile viewport focused on Scripture and action."
    ]
  };
}
