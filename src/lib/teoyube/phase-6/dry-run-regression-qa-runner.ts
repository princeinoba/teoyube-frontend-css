import { createDryRunDisabledServiceRegressionReport } from "./dry-run-disabled-service-regression";
import { createDryRunMobileAccessibilityRegressionReport } from "./dry-run-mobile-accessibility-regression";
import { createDryRunSafetyRegressionReport } from "./dry-run-safety-regression";
import { createOperationsReadinessReport } from "./operations-readiness-review";
import type {
  TeoyubeDryRunRegressionQaArea,
  TeoyubeDryRunRegressionQaBlocker,
  TeoyubeDryRunRegressionQaCheck,
  TeoyubeDryRunRegressionQaDecision,
  TeoyubeDryRunRegressionQaReport,
  TeoyubeDryRunRegressionQaResult,
  TeoyubeDryRunRegressionQaRun,
  TeoyubeDryRunRegressionQaStatus,
  TeoyubeDryRunRegressionQaWarning
} from "./dry-run-regression-qa-contracts";

function now(): string {
  return new Date().toISOString();
}

function check(id: string, area: TeoyubeDryRunRegressionQaArea, label: string, details: string): TeoyubeDryRunRegressionQaCheck {
  return { id, area, label, required: true, details };
}

function defaultChecks(): TeoyubeDryRunRegressionQaCheck[] {
  return [
    check("participant_workflow_manual", "participant_workflow", "Participant workflow remains manual", "Participant workflow does not contact users or store identities."),
    check("communication_boundary_no_contact", "communication_boundary", "Communication boundaries prevent automatic contact", "Code sends no email, SMS, notification, analytics, or external message."),
    check("feedback_boundary_no_collection", "feedback_boundary", "Feedback boundaries prevent automatic collection", "Feedback remains manual, simulated, redacted, and in-memory."),
    check("issue_intake_manual", "issue_intake", "Issue intake remains manual", "Issue intake is owner-controlled and structured."),
    check("scripture_anchors_visible", "scripture_anchor", "Scripture anchors remain visible", "Available anchors are not hidden or removed."),
    check("explanation_traces_visible", "explanation_trace", "Explanation traces remain visible", "TIG, prayer, calling, and fallback explanation paths remain visible."),
    check("fallback_states_safe", "fallback", "Fallback states remain safe", "Fallbacks are non-empty and do not invent unsupported promises or certainty."),
    check("confidence_labels_visible", "confidence_label", "Confidence labels remain visible", "Recommendation uncertainty boundaries remain visible."),
    check("privacy_consent_visible", "privacy_consent", "Privacy/consent boundaries remain visible", "Sensitive-input surfaces keep privacy and consent copy."),
    check("disabled_services_disabled", "service_disabled_state", "Disabled services remain disabled", "No database, analytics, monitoring provider, live AI, admin auth, CMS, feedback storage, URL fetching, or automatic contact is enabled."),
    check("reviewed_content_gate_blocks", "reviewed_content_gate", "Reviewed content gate still blocks drafts", "Review-only content stays out of live flows."),
    check("controlled_admin_in_memory", "controlled_admin", "Controlled admin remains prototype-only", "Admin prototype does not persist, authenticate, publish, or connect CMS."),
    check("mobile_not_worse", "mobile", "Mobile state is not worse", "Core surfaces remain readable on mobile."),
    check("accessibility_not_worse", "accessibility", "Accessibility basics are not worse", "Labels, focus, keyboard basics, and readable copy remain intact."),
    check("promise_table_mobile", "promise_table", "Promise Table remains readable", "Promise Table keeps readable rows and safe anchors."),
    check("tig_graph_list_fallback", "tig_graph_explorer", "TIG graph still has list fallback", "Dense graph output keeps a list fallback."),
    check("tig_response_explanation", "tig_response_panel", "TIGResponsePanel still shows explanation trace", "Response panel preserves explanation trace and confidence label."),
    check("operations_readiness_available", "operations_readiness", "Operations readiness remains available", "Operations readiness checklist and owner-review path remain available.")
  ];
}

function statusFromResults(total: number, results: TeoyubeDryRunRegressionQaResult[]): TeoyubeDryRunRegressionQaStatus {
  if (!results.length) return "not_started";
  if (results.some((entry) => entry.blocker || entry.status === "failed" || entry.status === "blocked")) return "blocked";
  if (results.length < total) return "in_progress";
  return results.some((entry) => entry.warning || entry.status === "warning") ? "passed_with_warnings" : "passed";
}

export function createDryRunRegressionQaRun(input: {
  id?: string;
  checks?: TeoyubeDryRunRegressionQaCheck[];
  results?: TeoyubeDryRunRegressionQaResult[];
} = {}): TeoyubeDryRunRegressionQaRun {
  const createdAt = now();
  const checks = input.checks || defaultChecks();
  const results = input.results || [];
  return {
    id: input.id || "phase_6_3_dry_run_regression_qa_run",
    status: statusFromResults(checks.length, results),
    checks,
    results,
    manualOnly: true,
    inMemoryOnly: true,
    noPublicUrlFetching: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noAnalyticsSent: true,
    noRegressionRunsPersisted: true,
    noFilesWritten: true,
    noExternalServicesConnected: true,
    createdAt,
    updatedAt: createdAt
  };
}

export function recordDryRunRegressionQaResult(run: TeoyubeDryRunRegressionQaRun, result: TeoyubeDryRunRegressionQaResult): TeoyubeDryRunRegressionQaRun {
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

export function recordDryRunRegressionQaAreaResult(
  run: TeoyubeDryRunRegressionQaRun,
  area: TeoyubeDryRunRegressionQaArea,
  result: Omit<TeoyubeDryRunRegressionQaResult, "checkId" | "area" | "recordedAt">
): TeoyubeDryRunRegressionQaRun {
  const regressionCheck = run.checks.find((entry) => entry.area === area);
  return recordDryRunRegressionQaResult(run, {
    ...result,
    checkId: regressionCheck?.id || `${area}_manual_regression`,
    area,
    recordedAt: now()
  });
}

function structuralBlockers(): TeoyubeDryRunRegressionQaBlocker[] {
  const disabled = createDryRunDisabledServiceRegressionReport();
  const safety = createDryRunSafetyRegressionReport();
  const mobile = createDryRunMobileAccessibilityRegressionReport();
  const operations = createOperationsReadinessReport();
  return [
    ...disabled.blockers.map((message) => ({ id: "disabled_service_regression", area: "service_disabled_state" as const, message, requiredAction: "Restore disabled service gate before Phase 6.4." })),
    ...safety.blockers.map((message) => ({ id: "safety_regression", area: "scripture_anchor" as const, message, requiredAction: "Fix Scripture/explanation/fallback/privacy regression before Phase 6.4." })),
    ...mobile.blockers.map((message) => ({ id: "mobile_regression", area: "mobile" as const, message, requiredAction: "Fix mobile/accessibility regression before Phase 6.4." })),
    ...operations.blockers.map((entry) => ({ id: "operations_regression", area: "operations_readiness" as const, message: entry.message, requiredAction: entry.requiredAction }))
  ];
}

export function getDryRunRegressionQaBlockers(run: TeoyubeDryRunRegressionQaRun): TeoyubeDryRunRegressionQaBlocker[] {
  return [
    ...(!run.manualOnly || !run.inMemoryOnly || !run.noPublicUrlFetching || !run.noUsersContacted || !run.noFeedbackCollectedAutomatically || !run.noAnalyticsSent || !run.noRegressionRunsPersisted || !run.noFilesWritten || !run.noExternalServicesConnected
      ? [{
          id: "dry_run_regression_boundary_broken",
          area: "unknown" as const,
          message: "Dry-run regression QA must remain manual, in-memory, no-fetch, no-contact, no-feedback-collection, no-analytics, no-persistence, no-file-write, and no-service.",
          requiredAction: "Restore Phase 6.3 regression QA boundaries."
        }]
      : []),
    ...run.results
      .filter((entry) => entry.blocker || entry.status === "failed" || entry.status === "blocked")
      .map((entry) => ({
        id: `${entry.checkId}_regression_blocker`,
        area: entry.area,
        message: entry.notes || `${entry.checkId} is blocking regression QA.`,
        requiredAction: "Move regression blocker back to stabilization before Phase 6.4."
      })),
    ...structuralBlockers()
  ];
}

export function getDryRunRegressionQaWarnings(run: TeoyubeDryRunRegressionQaRun): TeoyubeDryRunRegressionQaWarning[] {
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
        recommendedAction: "Review warning before Phase 6.4 owner lock."
      }))
  ];
}

export function summarizeDryRunRegressionQaRun(run: TeoyubeDryRunRegressionQaRun) {
  const blockers = getDryRunRegressionQaBlockers(run);
  const warnings = getDryRunRegressionQaWarnings(run);
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

export function createDryRunRegressionQaDecision(run: TeoyubeDryRunRegressionQaRun): TeoyubeDryRunRegressionQaDecision {
  const blockers = getDryRunRegressionQaBlockers(run);
  if (blockers.length) return "regression_blocked";
  if (run.results.length < run.checks.length) return "manual_regression_required";
  return getDryRunRegressionQaWarnings(run).length ? "regression_passed_with_warnings" : "regression_passed";
}

export function createDryRunRegressionQaReport(run: TeoyubeDryRunRegressionQaRun = createDryRunRegressionQaRun()): TeoyubeDryRunRegressionQaReport {
  const blockers = getDryRunRegressionQaBlockers(run);
  return {
    valid: blockers.length === 0,
    decision: createDryRunRegressionQaDecision(run),
    run,
    completedCheckCount: run.results.filter((entry) => entry.status !== "not_run").length,
    totalCheckCount: run.checks.length,
    blockers,
    warnings: getDryRunRegressionQaWarnings(run),
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
