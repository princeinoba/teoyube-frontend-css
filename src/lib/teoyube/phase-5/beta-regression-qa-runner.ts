import { createBetaDisabledServiceQaReport } from "./beta-disabled-service-qa";
import { createBetaMobileAccessibilityQaReport } from "./beta-mobile-accessibility-qa";
import { createBetaRealDataQaReport } from "./beta-real-data-qa-execution";
import { createBetaReviewedContentGateQaReport } from "./beta-reviewed-content-gate-qa";
import { createBetaScriptureExplanationFallbackQaReport } from "./beta-scripture-explanation-fallback-qa";
import { createBetaUserJourneyQaReport } from "./beta-user-journey-qa-execution";
import type {
  TeoyubeBetaRegressionQaArea,
  TeoyubeBetaRegressionQaBlocker,
  TeoyubeBetaRegressionQaCheck,
  TeoyubeBetaRegressionQaDecision,
  TeoyubeBetaRegressionQaReport,
  TeoyubeBetaRegressionQaResult,
  TeoyubeBetaRegressionQaRun,
  TeoyubeBetaRegressionQaStatus,
  TeoyubeBetaRegressionQaWarning
} from "./beta-regression-qa-contracts";

function now(): string {
  return new Date().toISOString();
}

function check(id: string, area: TeoyubeBetaRegressionQaArea, label: string, details: string): TeoyubeBetaRegressionQaCheck {
  return { id, area, label, required: true, details };
}

function defaultChecks(): TeoyubeBetaRegressionQaCheck[] {
  return [
    check("real_data_still_loads", "real_data", "Real data still loads", "Vocabulary, Promise Cluster, and Scripture Canon data remain available."),
    check("user_journey_still_safe", "user_journey", "User journey still works safely", "Journey payloads remain stable and privacy-preserving."),
    check("scripture_anchors_visible", "scripture_anchor", "Scripture anchors remain visible", "Available anchors are not hidden or removed."),
    check("explanation_traces_visible", "explanation_trace", "Explanation traces remain visible", "TIG, prayer, calling, and fallback explanation paths remain visible."),
    check("fallback_states_safe", "fallback", "Fallback states remain safe", "Fallbacks are non-empty and do not invent unsupported promises or certainty."),
    check("confidence_labels_visible", "confidence_label", "Confidence labels remain visible", "Recommendation uncertainty boundaries remain visible."),
    check("reviewed_content_gate_blocks", "reviewed_content_gate", "Reviewed content gate still blocks drafts", "Review-only content stays out of live flows."),
    check("controlled_admin_in_memory", "controlled_admin", "Controlled admin remains in-memory", "Admin prototype does not persist or publish."),
    check("disabled_services_disabled", "disabled_services", "Disabled services remain disabled", "No database, analytics, monitoring provider, live AI, admin auth, CMS, or automatic contact is enabled."),
    check("mobile_not_worse", "mobile", "Mobile state is not worse", "Core surfaces remain readable on mobile."),
    check("accessibility_not_worse", "accessibility", "Accessibility basics are not worse", "Labels, focus, keyboard basics, and readable copy remain intact."),
    check("promise_table_safe", "promise_table", "Promise Table remains production-safe", "Promise Table continues using production-safe cluster data."),
    check("tig_graph_list_fallback", "tig_graph_explorer", "TIG graph still has list fallback", "Dense graph output keeps list fallback."),
    check("tig_response_explanation", "tig_response_panel", "TIGResponsePanel still shows explanation trace", "Response panel preserves explanation trace and confidence label."),
    check("privacy_consent_visible", "privacy_consent", "Privacy/consent notices remain visible", "Sensitive-input surfaces keep consent/privacy copy.")
  ];
}

function statusFromResults(total: number, results: TeoyubeBetaRegressionQaResult[]): TeoyubeBetaRegressionQaStatus {
  if (!results.length) return "not_started";
  if (results.some((entry) => entry.blocker || entry.status === "failed" || entry.status === "blocked")) return "blocked";
  if (results.length < total) return "in_progress";
  return results.some((entry) => entry.warning || entry.status === "warning") ? "passed_with_warnings" : "passed";
}

export function createBetaRegressionQaRun(input: {
  id?: string;
  checks?: TeoyubeBetaRegressionQaCheck[];
  results?: TeoyubeBetaRegressionQaResult[];
} = {}): TeoyubeBetaRegressionQaRun {
  const createdAt = now();
  const checks = input.checks || defaultChecks();
  const results = input.results || [];
  return {
    id: input.id || "phase_5_3_beta_regression_qa_run",
    status: statusFromResults(checks.length, results),
    checks,
    results,
    manualOnly: true,
    inMemoryOnly: true,
    noPublicUrlFetching: true,
    noUsersContacted: true,
    noAnalyticsSent: true,
    noRegressionRunsPersisted: true,
    noFilesWritten: true,
    noExternalServicesConnected: true,
    createdAt,
    updatedAt: createdAt
  };
}

export function recordBetaRegressionQaResult(run: TeoyubeBetaRegressionQaRun, result: TeoyubeBetaRegressionQaResult): TeoyubeBetaRegressionQaRun {
  const results = [
    ...run.results.filter((entry) => entry.checkId !== result.checkId),
    { ...result, recordedAt: result.recordedAt || now() }
  ];
  return {
    ...run,
    results,
    status: statusFromResults(run.checks.length, results),
    updatedAt: now()
  };
}

export function recordBetaRegressionQaAreaResult(
  run: TeoyubeBetaRegressionQaRun,
  area: TeoyubeBetaRegressionQaArea,
  result: Omit<TeoyubeBetaRegressionQaResult, "checkId" | "area" | "recordedAt">
): TeoyubeBetaRegressionQaRun {
  const regressionCheck = run.checks.find((entry) => entry.area === area);
  return recordBetaRegressionQaResult(run, {
    ...result,
    checkId: regressionCheck?.id || `${area}_manual_regression`,
    area,
    recordedAt: now()
  });
}

function structuralBlockers(): TeoyubeBetaRegressionQaBlocker[] {
  const realData = createBetaRealDataQaReport();
  const journey = createBetaUserJourneyQaReport();
  const scripture = createBetaScriptureExplanationFallbackQaReport();
  const mobile = createBetaMobileAccessibilityQaReport();
  const reviewed = createBetaReviewedContentGateQaReport();
  const disabled = createBetaDisabledServiceQaReport();
  return [
    ...realData.blockers.map((message) => ({ id: "real_data_regression", area: "real_data" as const, message, requiredAction: "Fix real data regression before beta go/no-go." })),
    ...journey.blockers.map((message) => ({ id: "journey_regression", area: "user_journey" as const, message, requiredAction: "Fix journey regression before beta go/no-go." })),
    ...scripture.blockers.map((message) => ({ id: "scripture_regression", area: "scripture_anchor" as const, message, requiredAction: "Fix Scripture/explanation/fallback regression before beta go/no-go." })),
    ...mobile.blockers.map((message) => ({ id: "mobile_regression", area: "mobile" as const, message, requiredAction: "Fix mobile/accessibility regression before beta go/no-go." })),
    ...reviewed.blockers.map((message) => ({ id: "reviewed_gate_regression", area: "reviewed_content_gate" as const, message, requiredAction: "Fix reviewed content gate regression before beta go/no-go." })),
    ...disabled.blockers.map((message) => ({ id: "disabled_service_regression", area: "disabled_services" as const, message, requiredAction: "Restore disabled service gate before beta go/no-go." }))
  ];
}

export function getBetaRegressionQaBlockers(run: TeoyubeBetaRegressionQaRun): TeoyubeBetaRegressionQaBlocker[] {
  return [
    ...(!run.manualOnly || !run.inMemoryOnly || !run.noPublicUrlFetching || !run.noUsersContacted || !run.noAnalyticsSent || !run.noRegressionRunsPersisted || !run.noFilesWritten || !run.noExternalServicesConnected
      ? [{
          id: "beta_regression_boundary_broken",
          area: "unknown" as const,
          message: "Beta regression QA must remain manual, in-memory, no-fetch, no-contact, no-analytics, no-persistence, no-file-write, and no-service.",
          requiredAction: "Restore Phase 5.3 regression QA boundaries."
        }]
      : []),
    ...run.results
      .filter((entry) => entry.blocker || entry.status === "failed" || entry.status === "blocked")
      .map((entry) => ({
        id: `${entry.checkId}_regression_blocker`,
        area: entry.area,
        message: entry.notes || `${entry.checkId} is blocking regression QA.`,
        requiredAction: "Move regression blocker back to remediation before beta go/no-go."
      })),
    ...structuralBlockers()
  ];
}

export function getBetaRegressionQaWarnings(run: TeoyubeBetaRegressionQaRun): TeoyubeBetaRegressionQaWarning[] {
  const recorded = new Set(run.results.map((entry) => entry.checkId));
  return [
    ...run.checks
      .filter((entry) => !recorded.has(entry.id))
      .map((entry) => ({
        id: `${entry.id}_manual_pending`,
        area: entry.area,
        message: `${entry.label} still needs manual regression confirmation.`,
        recommendedAction: entry.details
      })),
    ...run.results
      .filter((entry) => entry.warning || entry.status === "warning")
      .map((entry) => ({
        id: `${entry.checkId}_warning`,
        area: entry.area,
        message: entry.notes || `${entry.checkId} has a regression warning.`,
        recommendedAction: "Review warning before owner go/no-go."
      }))
  ];
}

export function summarizeBetaRegressionQaRun(run: TeoyubeBetaRegressionQaRun) {
  const blockers = getBetaRegressionQaBlockers(run);
  const warnings = getBetaRegressionQaWarnings(run);
  return {
    runId: run.id,
    status: run.status,
    completedCheckCount: run.results.filter((entry) => entry.status !== "not_run").length,
    totalCheckCount: run.checks.length,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    manualOnly: run.manualOnly,
    inMemoryOnly: run.inMemoryOnly
  };
}

export function createBetaRegressionQaDecision(run: TeoyubeBetaRegressionQaRun): TeoyubeBetaRegressionQaDecision {
  const blockers = getBetaRegressionQaBlockers(run);
  if (blockers.length) return "regression_blocked";
  if (run.results.length < run.checks.length) return "manual_regression_required";
  return getBetaRegressionQaWarnings(run).length ? "regression_passed_with_warnings" : "regression_passed";
}

export function createBetaRegressionQaReport(run: TeoyubeBetaRegressionQaRun = createBetaRegressionQaRun()): TeoyubeBetaRegressionQaReport {
  const blockers = getBetaRegressionQaBlockers(run);
  return {
    valid: blockers.length === 0,
    decision: createBetaRegressionQaDecision(run),
    run,
    completedCheckCount: run.results.filter((entry) => entry.status !== "not_run").length,
    totalCheckCount: run.checks.length,
    blockers,
    warnings: getBetaRegressionQaWarnings(run),
    manualOnly: true,
    inMemoryOnly: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlFetching: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noExternalServicesRequired: true,
    noBrowserPersistenceRequired: true,
    generatedAt: now()
  };
}
