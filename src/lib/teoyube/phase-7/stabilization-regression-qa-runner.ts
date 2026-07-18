import type {
  TeoyubeStabilizationRegressionQaArea,
  TeoyubeStabilizationRegressionQaBlocker,
  TeoyubeStabilizationRegressionQaCheck,
  TeoyubeStabilizationRegressionQaDecision,
  TeoyubeStabilizationRegressionQaReport,
  TeoyubeStabilizationRegressionQaResult,
  TeoyubeStabilizationRegressionQaRun,
  TeoyubeStabilizationRegressionQaStatus,
  TeoyubeStabilizationRegressionQaWarning
} from "./stabilization-regression-qa-contracts";

function now(): string {
  return new Date().toISOString();
}

function check(id: string, area: TeoyubeStabilizationRegressionQaArea, label: string, details: string): TeoyubeStabilizationRegressionQaCheck {
  return { id, area, label, required: true, details };
}

function defaultChecks(): TeoyubeStabilizationRegressionQaCheck[] {
  return [
    check("scripture_anchors_visible", "scripture_anchor", "Scripture anchors remain visible", "Available anchors are not hidden, removed, or invented."),
    check("explanation_traces_visible", "explanation_trace", "Explanation traces remain visible", "TIG, prayer, calling, action, and fallback explanation paths remain visible."),
    check("fallback_states_safe", "fallback", "Fallback states remain safe", "Fallbacks are safe, non-empty, humble, and bounded."),
    check("confidence_labels_visible", "confidence_label", "Confidence labels remain visible", "Recommendation uncertainty and confidence boundaries remain visible."),
    check("privacy_consent_visible", "privacy_consent", "Privacy/consent visible", "Privacy, consent, and sensitive-information notices remain visible."),
    check("disabled_services_disabled", "service_disabled_state", "Disabled services remain disabled", "No database, analytics, monitoring provider, live AI, admin auth, CMS, feedback storage, URL fetching, messaging, or automatic contact is enabled."),
    check("reviewed_content_gate_blocks", "reviewed_content_gate", "Reviewed content gate blocks drafts", "Review-only content stays out of live flows."),
    check("controlled_admin_in_memory", "controlled_admin", "Controlled admin remains prototype-only", "Admin prototype remains in-memory and does not persist, authenticate, publish, or connect CMS."),
    check("manual_feedback_review_manual", "manual_feedback_review", "Manual feedback review remains manual", "Feedback review remains sanitized, redacted, and in-memory."),
    check("support_workflow_no_messages", "support_workflow", "Support workflow sends no messages", "Support produces manual recommendations only."),
    check("issue_triage_manual", "issue_triage", "Issue triage remains manual", "Support and stabilization triage remain owner-controlled."),
    check("stabilization_queue_in_memory", "product_stabilization_queue", "Stabilization queue remains in-memory", "Queue items are not persisted or sent externally."),
    check("word_card_mobile_safe", "word_card", "WordCard remains readable", "WordCard keeps readable labels, anchors, and fallback copy."),
    check("promise_table_mobile_safe", "promise_table", "Promise Table remains readable", "Promise Table keeps readable rows, filters, and anchors."),
    check("prayer_companion_mobile_safe", "prayer_companion", "PrayerCompanion remains readable", "PrayerCompanion keeps privacy/fallback boundaries and readable copy."),
    check("compass_experience_mobile_safe", "compass_experience", "CompassExperience remains readable", "Calling surfaces keep humble language and explanation paths."),
    check("tig_response_panel_explainable", "tig_response_panel", "TIGResponsePanel remains explainable", "Response panel preserves selected word, promise, confidence, reason, and explanation path."),
    check("tig_graph_list_fallback", "tig_graph_explorer", "TIG graph has list fallback", "Dense graph output keeps a readable list fallback."),
    check("mobile_not_worse", "mobile", "Mobile state is not worse", "Core surfaces remain readable on mobile."),
    check("accessibility_not_worse", "accessibility", "Accessibility basics are not worse", "Labels, focus, keyboard basics, and readable copy remain intact."),
    check("manual_performance_not_worse", "performance_manual", "Manual performance not worse", "No heavy external service or persistence dependency was added."),
    check("known_limitations_visible", "known_limitations", "Known limitations visible", "Known limitations and support boundaries remain available.")
  ];
}

function statusFromResults(total: number, results: TeoyubeStabilizationRegressionQaResult[]): TeoyubeStabilizationRegressionQaStatus {
  if (!results.length) return "not_started";
  if (results.some((entry) => entry.blocker || entry.status === "failed" || entry.status === "blocked")) return "blocked";
  if (results.length < total) return "in_progress";
  return results.some((entry) => entry.warning || entry.status === "warning") ? "passed_with_warnings" : "passed";
}

export function createStabilizationRegressionQaRun(input: {
  id?: string;
  checks?: TeoyubeStabilizationRegressionQaCheck[];
  results?: TeoyubeStabilizationRegressionQaResult[];
} = {}): TeoyubeStabilizationRegressionQaRun {
  const createdAt = now();
  const checks = input.checks || defaultChecks();
  const results = input.results || [];
  return {
    id: input.id || "phase_7_3_stabilization_regression_qa_run",
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

export function recordStabilizationRegressionQaResult(
  run: TeoyubeStabilizationRegressionQaRun,
  result: TeoyubeStabilizationRegressionQaResult
): TeoyubeStabilizationRegressionQaRun {
  const results = [
    ...run.results.filter((entry) => entry.checkId !== result.checkId),
    { ...result, recordedAt: result.recordedAt || now() }
  ];
  return { ...run, results, status: statusFromResults(run.checks.length, results), updatedAt: now() };
}

export function recordStabilizationRegressionQaAreaResult(
  run: TeoyubeStabilizationRegressionQaRun,
  area: TeoyubeStabilizationRegressionQaArea,
  result: Omit<TeoyubeStabilizationRegressionQaResult, "checkId" | "area" | "recordedAt">
): TeoyubeStabilizationRegressionQaRun {
  const regressionCheck = run.checks.find((entry) => entry.area === area);
  return recordStabilizationRegressionQaResult(run, {
    ...result,
    checkId: regressionCheck?.id || `${area}_manual_regression`,
    area,
    recordedAt: now()
  });
}

export function getStabilizationRegressionQaBlockers(run: TeoyubeStabilizationRegressionQaRun): TeoyubeStabilizationRegressionQaBlocker[] {
  return [
    ...(!run.manualOnly || !run.inMemoryOnly || !run.noPublicUrlFetching || !run.noUsersContacted || !run.noFeedbackCollectedAutomatically || !run.noAnalyticsSent || !run.noRegressionRunsPersisted || !run.noFilesWritten || !run.noExternalServicesConnected
      ? [{
          id: "stabilization_regression_boundary_broken",
          area: "unknown" as const,
          message: "Stabilization regression QA must remain manual, in-memory, no-fetch, no-contact, no-feedback-collection, no-analytics, no-persistence, no-file-write, and no-service.",
          requiredAction: "Restore Phase 7.3 regression QA boundaries."
        }]
      : []),
    ...run.results
      .filter((entry) => entry.blocker || entry.status === "failed" || entry.status === "blocked")
      .map((entry) => ({
        id: `${entry.checkId}_regression_blocker`,
        area: entry.area,
        message: entry.notes || `${entry.checkId} is blocking regression QA.`,
        requiredAction: "Move regression blocker back to product stabilization before Phase 7.4."
      }))
  ];
}

export function getStabilizationRegressionQaWarnings(run: TeoyubeStabilizationRegressionQaRun): TeoyubeStabilizationRegressionQaWarning[] {
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
        recommendedAction: "Review warning before Phase 7.4 owner lock."
      }))
  ];
}

export function summarizeStabilizationRegressionQaRun(run: TeoyubeStabilizationRegressionQaRun) {
  const blockers = getStabilizationRegressionQaBlockers(run);
  const warnings = getStabilizationRegressionQaWarnings(run);
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

export function createStabilizationRegressionQaDecision(run: TeoyubeStabilizationRegressionQaRun): TeoyubeStabilizationRegressionQaDecision {
  const blockers = getStabilizationRegressionQaBlockers(run);
  if (blockers.length) return "regression_blocked";
  if (run.results.length < run.checks.length) return "manual_regression_required";
  return getStabilizationRegressionQaWarnings(run).length ? "regression_passed_with_warnings" : "regression_passed";
}

export function createStabilizationRegressionQaReport(run: TeoyubeStabilizationRegressionQaRun = createStabilizationRegressionQaRun()): TeoyubeStabilizationRegressionQaReport {
  const blockers = getStabilizationRegressionQaBlockers(run);
  return {
    valid: blockers.length === 0,
    decision: createStabilizationRegressionQaDecision(run),
    run,
    completedCheckCount: run.results.filter((entry) => entry.status !== "not_run").length,
    totalCheckCount: run.checks.length,
    blockers,
    warnings: getStabilizationRegressionQaWarnings(run),
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
