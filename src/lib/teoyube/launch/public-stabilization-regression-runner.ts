import type {
  TeoyubePublicStabilizationRegressionBlocker,
  TeoyubePublicStabilizationRegressionCheck,
  TeoyubePublicStabilizationRegressionCheckType,
  TeoyubePublicStabilizationRegressionDecision,
  TeoyubePublicStabilizationRegressionReport,
  TeoyubePublicStabilizationRegressionResult,
  TeoyubePublicStabilizationRegressionRun,
  TeoyubePublicStabilizationRegressionWarning
} from "./public-stabilization-regression-contracts";

function normalizeId(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "public_stabilization_regression";
}

function check(type: TeoyubePublicStabilizationRegressionCheckType, label: string, publicLaunchCritical = true): TeoyubePublicStabilizationRegressionCheck {
  return {
    id: normalizeId(`public_${type}`),
    label,
    type,
    required: true,
    publicLaunchCritical
  };
}

export function createPublicStabilizationRegressionChecks(): TeoyubePublicStabilizationRegressionCheck[] {
  return [
    check("scripture_anchor_regression", "Scripture anchors remain visible and unchanged"),
    check("explanation_path_regression", "Explanation paths remain available"),
    check("fallback_safety_regression", "Fallback and safety messaging remains available"),
    check("confidence_label_regression", "Confidence labels remain visible"),
    check("privacy_terms_consent_regression", "Public privacy, terms, and consent notices remain visible"),
    check("consent_controls_regression", "Consent controls remain available"),
    check("mobile_accessibility_regression", "Mobile layout and accessibility remain usable"),
    check("offline_fallback_regression", "Offline and loading fallback states remain usable"),
    check("debug_visibility_regression", "Debug or internal safety state remains hidden from public users"),
    check("public_copy_regression", "Public copy remains clear, humble, and non-claiming"),
    check("fix_specific_regression", "Fix-specific regression checks pass"),
    check("performance_smoke", "Manual performance smoke remains acceptable", false)
  ];
}

export function createPublicStabilizationRegressionRun(input: Partial<TeoyubePublicStabilizationRegressionRun> = {}): TeoyubePublicStabilizationRegressionRun {
  return {
    id: input.id || "public_stabilization_regression_run_6_4",
    label: input.label || "Public Stabilization Regression Run",
    checks: input.checks || createPublicStabilizationRegressionChecks(),
    results: input.results || [],
    manualOnly: true,
    inMemoryOnly: true,
    fileWritten: false,
    databaseWritten: false,
    analyticsSent: false,
    externalServicesCalled: false,
    usersContacted: false,
    feedbackCollectedAutomatically: false,
    publicUrlFetched: false,
    liveAiOrchestrationEnabled: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function recordPublicStabilizationRegressionResult(
  run: TeoyubePublicStabilizationRegressionRun,
  result: Partial<TeoyubePublicStabilizationRegressionResult> & { checkId: string; type: TeoyubePublicStabilizationRegressionCheckType }
): TeoyubePublicStabilizationRegressionRun {
  const sourceCheck = run.checks.find((entry) => entry.id === result.checkId);
  const normalized: TeoyubePublicStabilizationRegressionResult = {
    id: result.id || normalizeId(`public_stabilization_regression_result_${result.checkId}`),
    checkId: result.checkId,
    type: result.type,
    status: result.status || "not_run",
    summary: result.summary || "Public stabilization regression result recorded manually.",
    required: result.required ?? sourceCheck?.required ?? true,
    publicLaunchCritical: result.publicLaunchCritical ?? sourceCheck?.publicLaunchCritical ?? true,
    sourceSafeFixResult: result.sourceSafeFixResult,
    notes: result.notes,
    generatedAt: result.generatedAt || new Date().toISOString()
  };
  return { ...run, results: [...run.results, normalized] };
}

export function getPublicStabilizationRegressionBlockers(run: TeoyubePublicStabilizationRegressionRun): TeoyubePublicStabilizationRegressionBlocker[] {
  const resultByCheck = new Map(run.results.map((result) => [result.checkId, result]));
  return [
    ...run.results
      .filter((result) => result.required && (result.status === "fail" || result.status === "blocked"))
      .map((result) => ({
        id: normalizeId(`public_stabilization_regression_blocker_${result.id}`),
        checkId: result.checkId,
        message: result.summary || "Public stabilization regression failed or was blocked.",
        requiredAction: "Resolve the regression failure before continuing public launch stabilization."
      })),
    ...run.checks
      .filter((entry) => entry.required && !resultByCheck.has(entry.id))
      .map((entry) => ({
        id: normalizeId(`public_stabilization_regression_missing_${entry.id}`),
        checkId: entry.id,
        message: "Required public stabilization regression result is missing.",
        requiredAction: "Record this regression result before stabilization owner review."
      })),
    run.fileWritten ? { id: "public_stabilization_regression_file_written", message: "Regression runner must not write files.", requiredAction: "Keep regression evidence in memory." } : undefined,
    run.databaseWritten ? { id: "public_stabilization_regression_database_written", message: "Regression runner must not write a database.", requiredAction: "Remove persistence." } : undefined,
    run.analyticsSent ? { id: "public_stabilization_regression_analytics_sent", message: "Regression runner must not send analytics.", requiredAction: "Remove analytics sending." } : undefined,
    run.externalServicesCalled ? { id: "public_stabilization_regression_external_service", message: "Regression runner must not call external services.", requiredAction: "Keep checks manual." } : undefined,
    run.usersContacted ? { id: "public_stabilization_regression_users_contacted", message: "Regression runner must not contact users.", requiredAction: "Keep user contact outside code." } : undefined,
    run.feedbackCollectedAutomatically ? { id: "public_stabilization_regression_feedback_auto", message: "Regression runner must not collect feedback automatically.", requiredAction: "Use manual feedback intake only." } : undefined,
    run.publicUrlFetched ? { id: "public_stabilization_regression_url_fetched", message: "Regression runner must not fetch public URLs.", requiredAction: "Keep URL checks manual." } : undefined,
    run.liveAiOrchestrationEnabled ? { id: "public_stabilization_regression_live_ai", message: "Regression runner must not enable live AI orchestration.", requiredAction: "Keep live AI orchestration disabled." } : undefined
  ].filter(Boolean) as TeoyubePublicStabilizationRegressionBlocker[];
}

export function getPublicStabilizationRegressionWarnings(run: TeoyubePublicStabilizationRegressionRun): TeoyubePublicStabilizationRegressionWarning[] {
  const resultByCheck = new Map(run.results.map((result) => [result.checkId, result]));
  return [
    ...run.results
      .filter((result) => result.status === "warning" || result.status === "not_run")
      .map((result) => ({
        id: normalizeId(`public_stabilization_regression_warning_${result.id}`),
        checkId: result.checkId,
        message: result.summary || "Public stabilization regression warning recorded.",
        recommendedAction: "Keep this warning visible in owner stabilization review."
      })),
    ...run.checks
      .filter((entry) => !entry.required && !resultByCheck.has(entry.id))
      .map((entry) => ({
        id: normalizeId(`public_stabilization_regression_optional_missing_${entry.id}`),
        checkId: entry.id,
        message: "Optional public stabilization regression result is missing.",
        recommendedAction: "Record if relevant before closing stabilization."
      }))
  ];
}

export function createPublicStabilizationRegressionDecision(run: TeoyubePublicStabilizationRegressionRun): TeoyubePublicStabilizationRegressionDecision {
  const blockers = getPublicStabilizationRegressionBlockers(run);
  if (blockers.length > 0) return "blocked";
  const warnings = getPublicStabilizationRegressionWarnings(run);
  if (warnings.length > 0) return "stabilized_with_warnings";
  if (run.results.length === 0) return "needs_more_testing";
  return "stabilized";
}

export function createPublicStabilizationRegressionReport(run: TeoyubePublicStabilizationRegressionRun = createPublicStabilizationRegressionRun()): TeoyubePublicStabilizationRegressionReport {
  const blockers = getPublicStabilizationRegressionBlockers(run);
  const warnings = getPublicStabilizationRegressionWarnings(run);
  const decision = createPublicStabilizationRegressionDecision(run);
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0 && ["stabilized", "stabilized_with_warnings"].includes(decision),
    decision,
    run,
    checkCount: run.checks.length,
    resultCount: run.results.length,
    passedCount: run.results.filter((result) => result.status === "pass").length,
    warningCount: warnings.length,
    blockedCount: blockers.length,
    blockers,
    warnings,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlFetched: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
