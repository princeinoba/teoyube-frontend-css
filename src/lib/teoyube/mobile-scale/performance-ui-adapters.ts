import type {
  GraphVisualization,
  TigProductionExplanation,
  TigProductionResponse,
  TeoyubePersonalizationPreviewResponse
} from "../../tig";
import {
  createDeferredTigRenderPlan,
  shouldCollapseExplanationPath,
  shouldDeferGraphPreview,
  shouldHideDebugByDefault
} from "./mobile-runtime-performance";
import type { TeoyubePerformanceOptimizationReport } from "./performance-optimization-contracts";
import {
  createTigResponsePerformanceReport,
  estimateExplanationPathRenderCost,
  estimateTigGraphRenderCost
} from "./response-performance-budget";

export type TeoyubePerformanceUiOptions = {
  debugMode?: boolean;
  mobile?: boolean;
};

export function toPerformanceAwareTigPanelProps(
  response: TigProductionResponse,
  options: TeoyubePerformanceUiOptions = {}
) {
  const report = createTigResponsePerformanceReport(response);

  return {
    responseId: response.id,
    showScriptureFirst: true,
    deferGraphPreview: shouldDeferGraphPreview(response),
    collapseExplanationPath: shouldCollapseExplanationPath(response),
    hideDebugByDefault: shouldHideDebugByDefault(response),
    showPerformanceWarnings: Boolean(options.debugMode),
    warnings: options.debugMode ? report.warnings : [],
    deferredRenderPlan: createDeferredTigRenderPlan(response)
  };
}

export function toPerformanceAwareGraphPreviewProps(
  graph: GraphVisualization,
  options: TeoyubePerformanceUiOptions = {}
) {
  const cost = estimateTigGraphRenderCost(graph);

  return {
    nodeCount: cost.nodeCount,
    edgeCount: cost.edgeCount,
    compactPathFirst: true,
    deferExpandedGraph: options.mobile !== false && cost.shouldDefer,
    hideEdgeLabelsOnMobile: options.mobile !== false,
    showPerformanceWarnings: Boolean(options.debugMode),
    warnings: options.debugMode ? cost.warnings : []
  };
}

export function toPerformanceAwareExplanationPathProps(
  explanationPath: TigProductionExplanation | string[],
  options: TeoyubePerformanceUiOptions = {}
) {
  const cost = estimateExplanationPathRenderCost(explanationPath);

  return {
    stepCount: cost.stepCount,
    collapseByDefault: options.mobile !== false && cost.shouldCollapse,
    showCompactSummary: options.mobile !== false,
    showPerformanceWarnings: Boolean(options.debugMode),
    warnings: options.debugMode ? cost.warnings : []
  };
}

export function toPerformanceAwarePersonalizationPreviewProps(
  preview: TeoyubePersonalizationPreviewResponse,
  options: TeoyubePerformanceUiOptions = {}
) {
  const comparisonItemCount = preview.comparison.items.length;
  const shouldCollapseComparison = options.mobile !== false && comparisonItemCount > 4;

  return {
    previewId: preview.id,
    stackBaselineAndPreview: options.mobile !== false,
    collapseComparison: shouldCollapseComparison,
    collapsePreferenceHints: true,
    hideDebugByDefault: true,
    showPerformanceWarnings: Boolean(options.debugMode),
    warnings:
      options.debugMode && shouldCollapseComparison
        ? ["Personalization comparison is long enough to collapse on mobile."]
        : []
  };
}

export function toPerformanceDebugPanelProps(
  report: TeoyubePerformanceOptimizationReport
) {
  return {
    title: "Performance Readiness",
    status: report.status,
    riskLevel: report.riskLevel,
    complete: report.complete,
    warnings: report.warnings,
    recommendations: report.recommendations,
    checks: report.checks.map((check) => ({
      id: check.id,
      label: check.label,
      passed: check.passed,
      metric: check.metric,
      budget: check.budget,
      unit: check.unit,
      riskLevel: check.riskLevel
    }))
  };
}
