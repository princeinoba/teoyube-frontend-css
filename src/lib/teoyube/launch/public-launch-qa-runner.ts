import { getPublicLaunchQaChecklist } from "./public-launch-qa-checklist";
import type {
  TeoyubePublicLaunchQaBlocker,
  TeoyubePublicLaunchQaDecision,
  TeoyubePublicLaunchQaReport,
  TeoyubePublicLaunchQaResult,
  TeoyubePublicLaunchQaRun,
  TeoyubePublicLaunchQaSurface,
  TeoyubePublicLaunchQaWarning
} from "./public-launch-qa-contracts";

export function createPublicLaunchQaRun(input: Partial<TeoyubePublicLaunchQaRun> = {}): TeoyubePublicLaunchQaRun {
  return {
    id: input.id || "public_launch_qa_run_5_2",
    label: input.label || "Public Launch QA Run 5.2",
    checklist: input.checklist || getPublicLaunchQaChecklist(),
    results: input.results || [],
    manualOnly: true,
    inMemoryOnly: true,
    fileWritten: false,
    databaseWritten: false,
    analyticsSent: false,
    externalServicesCalled: false,
    publicLaunchPerformed: false,
    usersContacted: false,
    feedbackCollectedAutomatically: false,
    createdAt: input.createdAt || new Date().toISOString()
  };
}

export function recordPublicLaunchQaResult(run: TeoyubePublicLaunchQaRun, result: TeoyubePublicLaunchQaResult): TeoyubePublicLaunchQaRun {
  return { ...run, results: [...run.results, { ...result, testedAt: result.testedAt || new Date().toISOString() }] };
}

export function recordPublicLaunchSurfaceQaResult(
  run: TeoyubePublicLaunchQaRun,
  surface: TeoyubePublicLaunchQaSurface,
  result: Omit<TeoyubePublicLaunchQaResult, "surface">
): TeoyubePublicLaunchQaRun {
  return recordPublicLaunchQaResult(run, { ...result, surface });
}

export function getPublicLaunchQaBlockers(run: TeoyubePublicLaunchQaRun): TeoyubePublicLaunchQaBlocker[] {
  const resultBlockers = run.results
    .filter((entry) => entry.status === "fail" || entry.status === "blocked")
    .map((entry) => ({ id: entry.checkId, surface: entry.surface, label: "Public QA blocker", reason: entry.notes || "Public QA failed.", requiredAction: "Resolve before public launch.", riskLevel: "critical" as const }));
  const safetyBlockers = [
    run.fileWritten ? { id: "public_qa_file_written", surface: "all" as const, label: run.label, reason: "Public QA run must not write files.", requiredAction: "Keep QA in memory.", riskLevel: "high" as const } : undefined,
    run.databaseWritten ? { id: "public_qa_database_written", surface: "all" as const, label: run.label, reason: "Public QA run must not write databases.", requiredAction: "Keep QA in memory.", riskLevel: "critical" as const } : undefined,
    run.analyticsSent ? { id: "public_qa_analytics_sent", surface: "all" as const, label: run.label, reason: "Public QA run must not send analytics.", requiredAction: "Keep analytics disabled.", riskLevel: "critical" as const } : undefined,
    run.externalServicesCalled ? { id: "public_qa_external_services", surface: "all" as const, label: run.label, reason: "Public QA run must not call external services.", requiredAction: "Keep QA offline/in-memory.", riskLevel: "critical" as const } : undefined,
    run.publicLaunchPerformed ? { id: "public_qa_launch_performed", surface: "all" as const, label: run.label, reason: "Public QA run must not launch Teoyube.", requiredAction: "Remove launch action.", riskLevel: "critical" as const } : undefined,
    run.usersContacted ? { id: "public_qa_users_contacted", surface: "all" as const, label: run.label, reason: "Public QA run must not contact users.", requiredAction: "Keep user contact outside code.", riskLevel: "critical" as const } : undefined,
    run.feedbackCollectedAutomatically ? { id: "public_qa_feedback_collected", surface: "all" as const, label: run.label, reason: "Public QA run must not collect feedback automatically.", requiredAction: "Use manual QA results only.", riskLevel: "critical" as const } : undefined
  ].filter(Boolean) as TeoyubePublicLaunchQaBlocker[];
  return [...resultBlockers, ...safetyBlockers];
}

export function getPublicLaunchQaWarnings(run: TeoyubePublicLaunchQaRun): TeoyubePublicLaunchQaWarning[] {
  return run.results
    .filter((entry) => entry.status === "warning" || entry.status === "needs_review" || entry.status === "not_tested")
    .map((entry) => ({ id: entry.checkId, surface: entry.surface, label: "Public QA warning", message: entry.notes || "Public QA needs review.", recommendedAction: "Review before public launch.", riskLevel: "medium" as const }));
}

export function summarizePublicLaunchQaRun(run: TeoyubePublicLaunchQaRun) {
  const blockers = getPublicLaunchQaBlockers(run);
  const warnings = getPublicLaunchQaWarnings(run);
  return {
    resultCount: run.results.length,
    passedCount: run.results.filter((entry) => entry.status === "pass").length,
    warningCount: warnings.length,
    blockerCount: blockers.length,
    blockers,
    warnings
  };
}

export function createPublicLaunchQaDecision(run: TeoyubePublicLaunchQaRun): TeoyubePublicLaunchQaDecision {
  const blockers = getPublicLaunchQaBlockers(run);
  if (blockers.some((entry) => entry.id.includes("privacy") || entry.id.includes("consent"))) return "needs_privacy_copy_review";
  if (blockers.some((entry) => entry.id.includes("accessibility"))) return "needs_accessibility_review";
  if (blockers.some((entry) => entry.id.includes("scripture") || entry.id.includes("fallback") || entry.id.includes("divine"))) return "needs_safety_review";
  if (blockers.length > 0) return "blocked";
  if (getPublicLaunchQaWarnings(run).length > 0 || run.results.length === 0) return "ready_after_owner_review";
  return "ready_for_public_qa";
}

export function createPublicLaunchQaReport(run: TeoyubePublicLaunchQaRun = createPublicLaunchQaRun()): TeoyubePublicLaunchQaReport {
  const summary = summarizePublicLaunchQaRun(run);
  return {
    valid: summary.blockerCount === 0,
    ready: summary.blockerCount === 0,
    decision: createPublicLaunchQaDecision(run),
    run,
    resultCount: summary.resultCount,
    passedCount: summary.passedCount,
    warningCount: summary.warningCount,
    blockerCount: summary.blockerCount,
    blockers: summary.blockers,
    warnings: summary.warnings,
    manualOnly: true,
    inMemoryOnly: true,
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
