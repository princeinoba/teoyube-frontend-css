import { createAccessibilityAuditReport, getLaunchAccessibilityChecklist } from "../launch-accessibility-audit";
import { createManualQaRun, recordManualQaResult, summarizeManualQaRun } from "../launch-manual-qa-runner";
import { createMobileQaReport, getMobileLaunchQaChecklist } from "../launch-mobile-qa";
import { createPersonalizationQaReport, getPersonalizationLaunchQaChecklist } from "../launch-personalization-qa";
import { createLaunchQaReadinessReport } from "../launch-qa-checklist";
import { createSurfaceTestMatrixReport, getLaunchSurfaceTestMatrix } from "../launch-surface-test-matrix";
import { createTigProductionQaReport, getTigProductionQaChecklist } from "../launch-tig-production-qa";

export function runProductionLaunchQaAccessibilitySmokeCheck() {
  const matrix = getLaunchSurfaceTestMatrix();
  const matrixReport = createSurfaceTestMatrixReport();
  const accessibility = getLaunchAccessibilityChecklist();
  const accessibilityReport = createAccessibilityAuditReport();
  const mobile = getMobileLaunchQaChecklist();
  const mobileReport = createMobileQaReport();
  const tig = getTigProductionQaChecklist();
  const tigReport = createTigProductionQaReport();
  const personalization = getPersonalizationLaunchQaChecklist();
  const personalizationReport = createPersonalizationQaReport();
  const run = recordManualQaResult(createManualQaRun(), {
    checkId: "manual_smoke",
    surface: "all",
    status: "pass",
    notes: "Manual QA runner records pass results."
  });
  const summary = summarizeManualQaRun(run);
  const qaReadiness = createLaunchQaReadinessReport();
  const errors = [
    matrix.length > 0 && matrixReport.valid ? "" : "Surface test matrix should exist.",
    accessibility.length > 0 && accessibilityReport.valid ? "" : "Accessibility checklist should exist and pass default report.",
    mobile.length > 0 && mobileReport.valid ? "" : "Mobile QA checklist should exist and pass default report.",
    tig.length > 0 && tigReport.valid ? "" : "TIG production QA should exist and pass.",
    personalization.length > 0 && personalizationReport.valid ? "" : "Personalization QA should exist and pass.",
    summary.valid && summary.resultCount === 1 ? "" : "Manual QA runner should create and summarize a run.",
    qaReadiness.checkCount > 0 ? "" : "Launch QA readiness report should be structured."
  ].filter(Boolean);

  return {
    valid: errors.length === 0,
    errors,
    noExternalSystemsRequired: true,
    notes: [
      "No database, external APIs, analytics provider, service worker, localStorage, cookies, IndexedDB, or file writes are required."
    ],
    generatedAt: new Date().toISOString()
  };
}

