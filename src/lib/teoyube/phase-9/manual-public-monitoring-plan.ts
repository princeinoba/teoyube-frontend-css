import type {
  TeoyubeManualPublicMonitoringArea,
  TeoyubeManualPublicMonitoringBlocker,
  TeoyubeManualPublicMonitoringCheck,
  TeoyubeManualPublicMonitoringDecision,
  TeoyubeManualPublicMonitoringReport,
  TeoyubeManualPublicMonitoringResult,
  TeoyubeManualPublicMonitoringRun,
  TeoyubeManualPublicMonitoringWarning
} from "./manual-public-monitoring-contracts";

export const MANUAL_PUBLIC_MONITORING_AREAS: TeoyubeManualPublicMonitoringArea[] = [
  "app_load_manual",
  "real_data_loading",
  "user_journey",
  "scripture_anchor",
  "explanation_trace",
  "fallback",
  "confidence_label",
  "reviewed_content_gate",
  "service_disabled_state",
  "privacy_consent",
  "manual_support",
  "manual_feedback",
  "manual_issue_triage",
  "mobile",
  "accessibility",
  "performance_manual"
];

function check(area: TeoyubeManualPublicMonitoringArea, label: string, details: string): TeoyubeManualPublicMonitoringCheck {
  return { id: `manual_public_monitoring_${area}`, area, label, required: true, passed: true, details };
}

export function getManualPublicMonitoringAreas(): TeoyubeManualPublicMonitoringArea[] {
  return [...MANUAL_PUBLIC_MONITORING_AREAS];
}

export function getManualPublicMonitoringChecklist(): TeoyubeManualPublicMonitoringCheck[] {
  return [
    check("app_load_manual", "Manual app load review", "Owner or reviewer manually confirms the app loads without automatic public URL fetching."),
    check("real_data_loading", "Real data loading review", "Reviewer confirms real Teoyube data loads or safe fallback appears."),
    check("user_journey", "User journey review", "Reviewer walks through home, canon, daily word, recommendations, prayer, calling, TIG, and table surfaces."),
    check("scripture_anchor", "Scripture anchor review", "Reviewer confirms Scripture anchors remain visible where available."),
    check("explanation_trace", "Explanation trace review", "Reviewer confirms explanation paths remain visible where required."),
    check("fallback", "Fallback safety review", "Reviewer confirms fallback states are safe, non-empty, and humble."),
    check("confidence_label", "Confidence label review", "Reviewer confirms confidence labels remain visible and bounded."),
    check("reviewed_content_gate", "Reviewed content gate review", "Reviewer confirms review-only content is not live."),
    check("service_disabled_state", "Disabled service review", "Reviewer confirms database, analytics, monitoring provider, admin auth, CMS, accounts, feedback storage, notifications, and live AI remain disabled."),
    check("privacy_consent", "Privacy/consent review", "Reviewer confirms privacy and consent notices remain visible or explicitly planned."),
    check("manual_support", "Manual support review", "Reviewer confirms support readiness remains manual."),
    check("manual_feedback", "Manual feedback review", "Reviewer confirms feedback remains manual with no automatic collection."),
    check("manual_issue_triage", "Manual issue triage review", "Reviewer confirms candidate issues can be triaged manually."),
    check("mobile", "Mobile review", "Reviewer confirms core public surfaces remain readable on mobile."),
    check("accessibility", "Accessibility review", "Reviewer confirms labels, focus, and readable text basics."),
    check("performance_manual", "Manual performance review", "Reviewer records observed load/performance concerns manually.")
  ];
}

export function createManualPublicMonitoringPlan(input: {
  id?: string;
  checklist?: TeoyubeManualPublicMonitoringCheck[];
  results?: TeoyubeManualPublicMonitoringResult[];
} = {}): TeoyubeManualPublicMonitoringRun {
  return {
    id: input.id || "phase_9_2_manual_public_monitoring_plan",
    checklist: input.checklist || getManualPublicMonitoringChecklist(),
    results: input.results || [],
    manualOnly: true,
    noPublicUrlFetch: true,
    noMonitoringProviderConnected: true,
    noAlertsSent: true,
    noAnalyticsSent: true,
    noExternalPersistence: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    createdAt: new Date().toISOString()
  };
}

export function recordManualPublicMonitoringResult(run: TeoyubeManualPublicMonitoringRun, result: TeoyubeManualPublicMonitoringResult): TeoyubeManualPublicMonitoringRun {
  return { ...run, results: [...run.results, result] };
}

export function recordManualPublicMonitoringAreaResult(run: TeoyubeManualPublicMonitoringRun, area: TeoyubeManualPublicMonitoringArea, result: Partial<TeoyubeManualPublicMonitoringResult> = {}): TeoyubeManualPublicMonitoringRun {
  return recordManualPublicMonitoringResult(run, {
    id: result.id || `${run.id}_${area}_result`,
    area,
    status: result.status || (result.passed === false ? "blocked" : "passed"),
    passed: result.passed !== false,
    notes: result.notes || [`${area} manually monitored.`],
    blocker: result.blocker ?? (result.passed === false)
  });
}

export function summarizeManualPublicMonitoringRun(run: TeoyubeManualPublicMonitoringRun): TeoyubeManualPublicMonitoringReport["summary"] {
  return {
    totalChecks: run.checklist.length,
    totalResults: run.results.length,
    passedResults: run.results.filter((entry) => entry.passed).length,
    blockedResults: run.results.filter((entry) => entry.blocker || !entry.passed).length
  };
}

export function getManualPublicMonitoringBlockers(run: TeoyubeManualPublicMonitoringRun): TeoyubeManualPublicMonitoringBlocker[] {
  const boundaryBlockers = run.manualOnly && run.noPublicUrlFetch && run.noMonitoringProviderConnected && run.noAlertsSent && run.noAnalyticsSent && run.noExternalPersistence && run.noExternalServicesRequired && run.inMemoryOnly
    ? []
    : [{ id: "manual_monitoring_boundary_blocker", area: "unknown" as const, message: "Manual monitoring must not fetch URLs, connect monitoring providers, send alerts, send analytics, persist externally, or require external services.", requiredAction: "Restore manual in-memory monitoring boundaries." }];
  return [
    ...boundaryBlockers,
    ...run.results.filter((entry) => entry.blocker || !entry.passed).map((entry) => ({ id: `${entry.id}_blocker`, area: entry.area, message: entry.notes.join(" "), requiredAction: "Move issue into the Phase 9.3 release candidate fix queue." }))
  ];
}

export function getManualPublicMonitoringWarnings(run: TeoyubeManualPublicMonitoringRun): TeoyubeManualPublicMonitoringWarning[] {
  return [
    { id: "manual_monitoring_only", area: "unknown", message: "Monitoring is a manual plan only; it does not connect providers or send alerts.", recommendedAction: "Review manual observations during Phase 9.3." },
    ...(run.results.length < run.checklist.length ? [{ id: "manual_monitoring_results_incomplete", area: "unknown" as const, message: "Not every manual monitoring check has a recorded result.", recommendedAction: "Record manual monitoring observations before final go/no-go." }] : [])
  ];
}

export function createManualPublicMonitoringDecision(run: TeoyubeManualPublicMonitoringRun): TeoyubeManualPublicMonitoringDecision {
  const blockers = getManualPublicMonitoringBlockers(run);
  if (blockers.length) return "manual_monitoring_blocked";
  return getManualPublicMonitoringWarnings(run).length ? "manual_monitoring_ready_with_warnings" : "manual_monitoring_ready";
}

export function createManualPublicMonitoringReport(run: TeoyubeManualPublicMonitoringRun): TeoyubeManualPublicMonitoringReport {
  const blockers = getManualPublicMonitoringBlockers(run);
  const warnings = getManualPublicMonitoringWarnings(run);
  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : warnings.length ? "passed_with_warnings" : "passed",
    decision: createManualPublicMonitoringDecision(run),
    run,
    blockers,
    warnings,
    summary: summarizeManualPublicMonitoringRun(run),
    manualOnly: true,
    noPublicUrlFetch: true,
    noMonitoringProviderConnected: true,
    noAlertsSent: true,
    noAnalyticsSent: true,
    noExternalPersistence: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
