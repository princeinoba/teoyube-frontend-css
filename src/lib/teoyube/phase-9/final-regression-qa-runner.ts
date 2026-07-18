import type {
  TeoyubeFinalRegressionQaArea,
  TeoyubeFinalRegressionQaBlocker,
  TeoyubeFinalRegressionQaCheck,
  TeoyubeFinalRegressionQaDecision,
  TeoyubeFinalRegressionQaReport,
  TeoyubeFinalRegressionQaResult,
  TeoyubeFinalRegressionQaRun,
  TeoyubeFinalRegressionQaWarning
} from "./final-regression-qa-contracts";

export const FINAL_REGRESSION_QA_AREAS: TeoyubeFinalRegressionQaArea[] = [
  "public_copy",
  "privacy_consent",
  "sensitive_data_warning",
  "known_limitations",
  "scripture_anchor",
  "explanation_trace",
  "fallback",
  "confidence_label",
  "reviewed_content_gate",
  "service_disabled_state",
  "support_readiness",
  "feedback_readiness",
  "issue_triage",
  "manual_monitoring",
  "word_card",
  "promise_table",
  "prayer_companion",
  "compass_experience",
  "tig_response_panel",
  "tig_graph_explorer",
  "mobile",
  "accessibility",
  "performance_manual"
];

function check(area: TeoyubeFinalRegressionQaArea, label: string, details: string): TeoyubeFinalRegressionQaCheck {
  return { id: `final_regression_${area}`, area, label, required: true, passed: true, details };
}

export function getFinalRegressionQaChecks(): TeoyubeFinalRegressionQaCheck[] {
  return [
    check("public_copy", "Public copy remains safe", "Public copy remains clear, non-certain, and non-professional-advice."),
    check("privacy_consent", "Privacy/consent visible", "Privacy and consent notices remain visible."),
    check("sensitive_data_warning", "Sensitive data warning visible", "Sensitive data warnings remain available."),
    check("known_limitations", "Known limitations visible", "Known limitations remain visible."),
    check("scripture_anchor", "Scripture anchors visible", "Scripture anchors remain visible where available."),
    check("explanation_trace", "Explanation traces visible", "Explanation traces remain visible where required."),
    check("fallback", "Fallback safe", "Fallback states remain safe and non-empty."),
    check("confidence_label", "Confidence labels visible", "Confidence labels remain visible and humble."),
    check("reviewed_content_gate", "Reviewed content gate active", "Review-only content remains gated."),
    check("service_disabled_state", "Services disabled", "Disabled services remain disabled."),
    check("support_readiness", "Support remains manual", "Support remains manual and boundary-aware."),
    check("feedback_readiness", "Feedback remains manual", "Feedback remains manual and non-persistent."),
    check("issue_triage", "Issue triage remains manual", "Issue triage remains manual and in-memory."),
    check("manual_monitoring", "Manual monitoring no URL fetch", "Manual monitoring fetches no public URLs."),
    check("word_card", "WordCard stable", "WordCard remains stable and anchored."),
    check("promise_table", "Promise Table stable", "Promise Table remains readable and anchored."),
    check("prayer_companion", "PrayerCompanion stable", "PrayerCompanion remains devotional, bounded, and non-persistent."),
    check("compass_experience", "CompassExperience stable", "CompassExperience remains bounded and explainable."),
    check("tig_response_panel", "TIGResponsePanel stable", "TIGResponsePanel preserves confidence, explanation, fallback, and Scripture."),
    check("tig_graph_explorer", "TIGGraphExplorer stable", "TIGGraphExplorer preserves list fallback and readable relationships."),
    check("mobile", "Mobile not worse", "Mobile readability is not worse."),
    check("accessibility", "Accessibility not worse", "Labels and explanation text remain accessible."),
    check("performance_manual", "Manual performance review", "Performance concerns are recorded manually.")
  ];
}

export function createFinalRegressionQaRun(input: {
  id?: string;
  checks?: TeoyubeFinalRegressionQaCheck[];
  results?: TeoyubeFinalRegressionQaResult[];
} = {}): TeoyubeFinalRegressionQaRun {
  return {
    id: input.id || "phase_9_3_final_regression_qa_run",
    checks: input.checks || getFinalRegressionQaChecks(),
    results: input.results || [],
    manualOnly: true,
    noPublicLaunchPerformed: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noAnalyticsSent: true,
    noQaRunPersisted: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    createdAt: new Date().toISOString()
  };
}

export function recordFinalRegressionQaResult(run: TeoyubeFinalRegressionQaRun, result: TeoyubeFinalRegressionQaResult): TeoyubeFinalRegressionQaRun {
  return { ...run, results: [...run.results, result] };
}

export function recordFinalRegressionQaAreaResult(run: TeoyubeFinalRegressionQaRun, area: TeoyubeFinalRegressionQaArea, result: Partial<TeoyubeFinalRegressionQaResult> = {}): TeoyubeFinalRegressionQaRun {
  return recordFinalRegressionQaResult(run, {
    id: result.id || `${run.id}_${area}_result`,
    area,
    status: result.status || (result.passed === false ? "blocked" : "passed"),
    passed: result.passed !== false,
    blocker: result.blocker ?? (result.passed === false),
    notes: result.notes || [`${area} final regression reviewed.`]
  });
}

export function summarizeFinalRegressionQaRun(run: TeoyubeFinalRegressionQaRun): TeoyubeFinalRegressionQaReport["summary"] {
  return {
    totalChecks: run.checks.length,
    totalResults: run.results.length,
    passedResults: run.results.filter((entry) => entry.passed).length,
    blockedResults: run.results.filter((entry) => entry.blocker || !entry.passed).length
  };
}

export function getFinalRegressionQaBlockers(run: TeoyubeFinalRegressionQaRun): TeoyubeFinalRegressionQaBlocker[] {
  const boundaryBlockers = run.manualOnly && run.noPublicLaunchPerformed && run.noBetaLaunchPerformed && run.noUsersContacted && run.noFeedbackCollectedAutomatically && run.noPublicUrlsFetchedAutomatically && run.noAnalyticsSent && run.noQaRunPersisted && run.noExternalServicesRequired && run.inMemoryOnly
    ? []
    : [{ id: "final_regression_boundary_blocker", area: "unknown" as const, message: "Final regression QA must remain manual, in-memory, no-launch, no-contact, no-feedback-collection, no-fetch, no-analytics, no-persistence, and service-disabled.", requiredAction: "Restore final regression QA boundaries." }];
  return [
    ...boundaryBlockers,
    ...run.results.filter((entry) => entry.blocker || !entry.passed).map((entry) => ({ id: `${entry.id}_blocker`, area: entry.area, message: entry.notes.join(" "), requiredAction: "Fix or defer with owner review before public go/no-go." }))
  ];
}

export function getFinalRegressionQaWarnings(run: TeoyubeFinalRegressionQaRun): TeoyubeFinalRegressionQaWarning[] {
  return [
    { id: "final_regression_manual_only", area: "unknown", message: "Final regression QA is manual and in-memory only.", recommendedAction: "Review final regression report before Phase 9.4." },
    ...(run.results.length < run.checks.length ? [{ id: "final_regression_results_incomplete", area: "unknown" as const, message: "Not every final regression area has a recorded result.", recommendedAction: "Record final regression results before final go/no-go." }] : [])
  ];
}

export function createFinalRegressionQaDecision(run: TeoyubeFinalRegressionQaRun): TeoyubeFinalRegressionQaDecision {
  if (getFinalRegressionQaBlockers(run).length) return "final_regression_blocked";
  return getFinalRegressionQaWarnings(run).length ? "final_regression_passed_with_warnings" : "final_regression_passed";
}

export function createFinalRegressionQaReport(run: TeoyubeFinalRegressionQaRun): TeoyubeFinalRegressionQaReport {
  const blockers = getFinalRegressionQaBlockers(run);
  return {
    valid: blockers.length === 0,
    decision: createFinalRegressionQaDecision(run),
    run,
    blockers,
    warnings: getFinalRegressionQaWarnings(run),
    summary: summarizeFinalRegressionQaRun(run),
    noPublicLaunchPerformed: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
