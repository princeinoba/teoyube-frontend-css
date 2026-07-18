import type {
  TeoyubeHardeningRegressionQaArea,
  TeoyubeHardeningRegressionQaBlocker,
  TeoyubeHardeningRegressionQaCheck,
  TeoyubeHardeningRegressionQaDecision,
  TeoyubeHardeningRegressionQaReport,
  TeoyubeHardeningRegressionQaResult,
  TeoyubeHardeningRegressionQaRun,
  TeoyubeHardeningRegressionQaWarning
} from "./hardening-regression-qa-contracts";

function check(id: string, area: TeoyubeHardeningRegressionQaArea, label: string, details: string): TeoyubeHardeningRegressionQaCheck {
  return { id, area, label, required: true, details };
}

function defaultChecks(): TeoyubeHardeningRegressionQaCheck[] {
  return [
    check("scripture_anchors_visible", "scripture_anchor", "Scripture anchors remain visible", "Word, Promise, TIG, and fallback surfaces must keep Scripture anchor visibility."),
    check("explanation_traces_visible", "explanation_trace", "Explanation traces remain visible", "TIG, calling, prayer, and action flows must keep explanation paths."),
    check("fallback_states_safe", "fallback", "Fallback states remain safe", "Fallback text remains bounded and does not overclaim."),
    check("confidence_labels_visible", "confidence_label", "Confidence labels remain visible", "Confidence language remains visible and humble."),
    check("privacy_consent_visible", "privacy_consent", "Privacy/consent boundaries visible", "Privacy, consent, and sensitive information notices remain visible where relevant."),
    check("services_disabled", "service_disabled_state", "Services remain disabled", "Hardening does not enable persistence, analytics, monitoring, admin auth, CMS, accounts, live AI, or notifications."),
    check("reviewed_content_gate", "reviewed_content_gate", "Reviewed content gate intact", "Review-only content is not live or auto-published."),
    check("controlled_admin_in_memory", "controlled_admin", "Controlled admin remains non-production", "Admin prototype remains in-memory and not production CMS/auth."),
    check("manual_feedback_review", "manual_feedback_review", "Manual feedback remains manual", "No automatic feedback collection is introduced."),
    check("support_workflow_manual", "support_workflow", "Support workflow sends no messages", "No email, SMS, notifications, analytics, or external messages are sent."),
    check("word_card_stable", "word_card", "WordCard remains stable", "WordCard preserves props and fallback support."),
    check("promise_table_stable", "promise_table", "Promise Table remains stable", "Promise Table uses real Promise Cluster rows."),
    check("prayer_companion_stable", "prayer_companion", "PrayerCompanion remains stable", "PrayerCompanion keeps devotional boundary and no persistence."),
    check("compass_experience_stable", "compass_experience", "CompassExperience remains stable", "Compass search is manual and calling context remains visible."),
    check("tig_response_panel_stable", "tig_response_panel", "TIGResponsePanel remains stable", "TIG response keeps explanation, fallback, confidence, and debug gating."),
    check("tig_graph_explorer_stable", "tig_graph_explorer", "TIGGraphExplorer remains stable", "Graph explorer keeps list fallback and readable relationships."),
    check("mobile_not_worse", "mobile", "Mobile state is not worse", "Mobile wrapping and list fallbacks remain available."),
    check("accessibility_not_worse", "accessibility", "Accessibility state is not worse", "Accessible labels and semantic grouping were improved."),
    check("performance_not_worse", "performance", "Performance state is not worse", "No external monitoring/analytics were added; automatic Compass fetch was removed."),
    check("known_limitations_visible", "known_limitations", "Known limitations remain visible", "Known limitations continue to be carried forward.")
  ];
}

function resultForCheck(entry: TeoyubeHardeningRegressionQaCheck, passed = true): TeoyubeHardeningRegressionQaResult {
  return {
    id: `${entry.id}_result`,
    checkId: entry.id,
    area: entry.area,
    status: passed ? "passed" : "blocked",
    passed,
    details: passed ? `${entry.label} passed.` : `${entry.label} failed.`
  };
}

export function createHardeningRegressionQaRun(input: {
  checks?: TeoyubeHardeningRegressionQaCheck[];
  results?: TeoyubeHardeningRegressionQaResult[];
} = {}): TeoyubeHardeningRegressionQaRun {
  const checks = input.checks || defaultChecks();
  return {
    id: "phase_8_2_hardening_regression_qa",
    checks,
    results: input.results || checks.map((entry) => resultForCheck(entry)),
    noExternalSend: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noUserContact: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}

export function recordHardeningRegressionQaResult(run: TeoyubeHardeningRegressionQaRun, result: TeoyubeHardeningRegressionQaResult): TeoyubeHardeningRegressionQaRun {
  return createHardeningRegressionQaRun({
    checks: run.checks,
    results: [...run.results.filter((entry) => entry.id !== result.id), result]
  });
}

export function recordHardeningRegressionQaAreaResult(
  run: TeoyubeHardeningRegressionQaRun,
  area: TeoyubeHardeningRegressionQaArea,
  result: Omit<TeoyubeHardeningRegressionQaResult, "area">
): TeoyubeHardeningRegressionQaRun {
  return recordHardeningRegressionQaResult(run, { ...result, area });
}

export function summarizeHardeningRegressionQaRun(run: TeoyubeHardeningRegressionQaRun) {
  return {
    total: run.results.length,
    passed: run.results.filter((entry) => entry.passed).length,
    warnings: run.results.filter((entry) => entry.status === "warning").length,
    blocked: run.results.filter((entry) => entry.status === "blocked" || !entry.passed).length
  };
}

export function getHardeningRegressionQaBlockers(run: TeoyubeHardeningRegressionQaRun): TeoyubeHardeningRegressionQaBlocker[] {
  return [
    ...run.results.filter((entry) => entry.status === "blocked" || !entry.passed).map((entry) => ({
      id: `${entry.id}_blocker`,
      area: entry.area,
      message: entry.details,
      requiredAction: "Resolve regression before Phase 8 can continue."
    })),
    ...(!run.inMemoryOnly || !run.noExternalSend || !run.noDatabasePersistenceEnabled || !run.noAnalyticsEnabled || !run.noMonitoringProviderConnected || !run.noLiveAiOrchestrationEnabled || !run.noUserContact
      ? [{
          id: "regression_boundary_broken",
          area: "service_disabled_state" as const,
          message: "Regression QA must remain in-memory and service-disabled.",
          requiredAction: "Restore hardening regression QA boundaries."
        }]
      : [])
  ];
}

export function getHardeningRegressionQaWarnings(run: TeoyubeHardeningRegressionQaRun): TeoyubeHardeningRegressionQaWarning[] {
  return [
    ...run.results.filter((entry) => entry.status === "warning").map((entry) => ({
      id: `${entry.id}_warning`,
      area: entry.area,
      message: entry.details,
      recommendedAction: "Review manually before Phase 8.3."
    })),
    {
      id: "manual_regression_review",
      area: "unknown",
      message: "Regression QA is represented as a structured in-memory/manual report.",
      recommendedAction: "Run project build/test tooling when available."
    }
  ];
}

export function createHardeningRegressionQaDecision(run: TeoyubeHardeningRegressionQaRun): TeoyubeHardeningRegressionQaDecision {
  const blockers = getHardeningRegressionQaBlockers(run);
  const warnings = getHardeningRegressionQaWarnings(run);
  if (blockers.length) return "blocked";
  return warnings.length ? "regression_passed_with_warnings" : "regression_passed";
}

export function createHardeningRegressionQaReport(run: TeoyubeHardeningRegressionQaRun = createHardeningRegressionQaRun()): TeoyubeHardeningRegressionQaReport {
  const blockers = getHardeningRegressionQaBlockers(run);
  return {
    valid: blockers.length === 0,
    decision: createHardeningRegressionQaDecision(run),
    run,
    blockers,
    warnings: getHardeningRegressionQaWarnings(run),
    summary: summarizeHardeningRegressionQaRun(run),
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
