import { createAccessibilityAuditReport, getLaunchAccessibilityChecklist } from "../launch-accessibility-audit";
import { createManualQaRun, recordManualQaResult, summarizeManualQaRun } from "../launch-manual-qa-runner";
import { createMobileQaReport, getMobileLaunchQaChecklist } from "../launch-mobile-qa";
import { createPersonalizationQaReport } from "../launch-personalization-qa";
import { createSurfaceTestMatrixReport, getLaunchSurfaceTestMatrix } from "../launch-surface-test-matrix";
import { createTigProductionQaReport } from "../launch-tig-production-qa";
import { createLaunchQaReadinessReport } from "../launch-qa-checklist";

export function createProductionLaunchQaAccessibilityExample() {
  const run = recordManualQaResult(
    recordManualQaResult(createManualQaRun(), {
      checkId: "tig_scripture_anchor",
      surface: "tig_response_panel",
      status: "pass",
      notes: "Scripture anchor visible."
    }),
    {
      checkId: "mobile_graph_simplifies",
      surface: "tig_graph_preview",
      status: "warning",
      notes: "Confirm final graph label sizing during manual device QA."
    }
  );

  return {
    surfaceMatrix: getLaunchSurfaceTestMatrix(),
    surfaceMatrixReport: createSurfaceTestMatrixReport(),
    accessibilityChecklist: getLaunchAccessibilityChecklist(),
    accessibilityReport: createAccessibilityAuditReport(),
    mobileChecklist: getMobileLaunchQaChecklist(),
    mobileReport: createMobileQaReport(),
    tigProductionQa: createTigProductionQaReport(),
    personalizationQa: createPersonalizationQaReport(),
    qaReadiness: createLaunchQaReadinessReport(),
    manualQaRun: run,
    manualQaSummary: summarizeManualQaRun(run)
  };
}

