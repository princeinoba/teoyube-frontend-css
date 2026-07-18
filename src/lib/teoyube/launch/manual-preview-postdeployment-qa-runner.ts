import {
  getManualPreviewSurfacePostDeploymentChecklist,
  MANUAL_PREVIEW_POSTDEPLOYMENT_SURFACES
} from "./manual-preview-surface-postdeployment-checks";
import type {
  TeoyubePostDeploymentQaBlocker,
  TeoyubePostDeploymentQaDecision,
  TeoyubePostDeploymentQaReport,
  TeoyubePostDeploymentQaResult,
  TeoyubePostDeploymentQaRun,
  TeoyubePostDeploymentQaStatus,
  TeoyubePostDeploymentQaSurface,
  TeoyubePostDeploymentQaWarning
} from "./manual-preview-postdeployment-qa-contracts";
import type { TeoyubeManualPreviewUrlRecord } from "./manual-preview-url-verification-contracts";

export type TeoyubePostDeploymentQaRunInput = {
  label?: string;
  previewUrlRecord?: TeoyubeManualPreviewUrlRecord;
  surfaces?: TeoyubePostDeploymentQaSurface[];
};

function now(): string {
  return new Date().toISOString();
}

function id(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function redactNotes(notes: string | undefined): string | undefined {
  if (!notes) return undefined;
  return notes.replace(/(token|secret|password|sk-[A-Za-z0-9_-]+)/gi, "[redacted]");
}

function isBlockingStatus(status: TeoyubePostDeploymentQaStatus | undefined): boolean {
  return status === "fail" || status === "blocked";
}

function isWarningStatus(status: TeoyubePostDeploymentQaStatus | undefined): boolean {
  return status === "warning" || status === "not_tested" || status === "unknown";
}

export function createManualPreviewPostDeploymentQaRun(
  input: TeoyubePostDeploymentQaRunInput = {}
): TeoyubePostDeploymentQaRun {
  const createdAt = now();
  const surfaces = input.surfaces || MANUAL_PREVIEW_POSTDEPLOYMENT_SURFACES;
  const checks = getManualPreviewSurfacePostDeploymentChecklist().filter((check) => surfaces.includes(check.surface));

  return {
    id: id("manual_preview_postdeployment_qa_run"),
    label: input.label || "Manual Preview Deployment 2.2 Post-Deployment QA",
    previewUrlRecord: input.previewUrlRecord,
    surfaces,
    checks,
    results: [],
    inMemoryOnly: true,
    databaseWritten: false,
    analyticsSent: false,
    externalServicesCalled: false,
    filesWritten: false,
    createdAt,
    updatedAt: createdAt
  };
}

export function recordManualPreviewPostDeploymentQaResult(
  run: TeoyubePostDeploymentQaRun,
  result: Omit<TeoyubePostDeploymentQaResult, "id" | "checkedAt" | "notesRedacted"> & {
    id?: string;
    checkedAt?: string;
    notesRedacted?: boolean;
  }
): TeoyubePostDeploymentQaRun {
  const normalized: TeoyubePostDeploymentQaResult = {
    ...result,
    id: result.id || id("manual_preview_qa_result"),
    notes: redactNotes(result.notes),
    notesRedacted: result.notesRedacted ?? Boolean(result.notes && redactNotes(result.notes) !== result.notes),
    blocker:
      result.blocker ||
      isBlockingStatus(result.status) ||
      isBlockingStatus(result.mobileResult) ||
      isBlockingStatus(result.accessibilityResult) ||
      isBlockingStatus(result.scriptureAnchorResult) ||
      isBlockingStatus(result.explanationPathResult) ||
      isBlockingStatus(result.fallbackResult) ||
      isBlockingStatus(result.consentResult) ||
      isBlockingStatus(result.debugSafetyResult) ||
      isBlockingStatus(result.privacyResult),
    warning:
      result.warning ||
      isWarningStatus(result.status) ||
      isWarningStatus(result.mobileResult) ||
      isWarningStatus(result.accessibilityResult),
    checkedAt: result.checkedAt || now()
  };
  const results = run.results.filter((entry) => !(entry.surface === normalized.surface && entry.checkId === normalized.checkId));

  return {
    ...run,
    results: [...results, normalized],
    updatedAt: now()
  };
}

export function recordManualPreviewSurfaceQaResult(
  run: TeoyubePostDeploymentQaRun,
  surface: TeoyubePostDeploymentQaSurface,
  result: Omit<TeoyubePostDeploymentQaResult, "id" | "surface" | "checkedAt" | "notesRedacted"> & {
    id?: string;
    checkedAt?: string;
    notesRedacted?: boolean;
  }
): TeoyubePostDeploymentQaRun {
  return recordManualPreviewPostDeploymentQaResult(run, {
    ...result,
    surface
  });
}

export function summarizeManualPreviewPostDeploymentQa(run: TeoyubePostDeploymentQaRun) {
  return {
    surfaceCount: run.surfaces.length,
    checkCount: run.checks.length,
    resultCount: run.results.length,
    passCount: run.results.filter((result) => result.status === "pass").length,
    warningCount: run.results.filter((result) => result.warning || result.status === "warning").length,
    failCount: run.results.filter((result) => result.status === "fail" || result.status === "blocked").length,
    blockerCount: run.results.filter((result) => result.blocker).length,
    untestedRequiredCount: run.checks.filter((check) => check.required && !run.results.some((result) => result.checkId === check.id && result.surface === check.surface)).length
  };
}

export function getManualPreviewPostDeploymentQaBlockers(
  run: TeoyubePostDeploymentQaRun
): TeoyubePostDeploymentQaBlocker[] {
  return run.results
    .filter((result) => result.blocker)
    .map((result) => ({
      id: `blocker_${result.id}`,
      surface: result.surface,
      checkId: result.checkId,
      reason: result.notes || `${result.surface} ${result.checkId} did not pass launch-critical QA.`,
      requiredAction: "Resolve this postdeployment QA issue before preview review.",
      severity: result.status === "blocked" ? "critical" : "high"
    }));
}

export function getManualPreviewPostDeploymentQaWarnings(
  run: TeoyubePostDeploymentQaRun
): TeoyubePostDeploymentQaWarning[] {
  const summary = summarizeManualPreviewPostDeploymentQa(run);
  const resultWarnings = run.results
    .filter((result) => result.warning && !result.blocker)
    .map((result) => ({
      id: `warning_${result.id}`,
      surface: result.surface,
      checkId: result.checkId,
      message: result.notes || `${result.surface} ${result.checkId} needs manual review.`,
      recommendedAction: "Review this warning before preview review."
    }));
  const untestedWarning: TeoyubePostDeploymentQaWarning[] =
    summary.untestedRequiredCount > 0
      ? [{
          id: "required_checks_not_fully_recorded",
          message: `${summary.untestedRequiredCount} required postdeployment check(s) have not been recorded.`,
          recommendedAction: "Complete manual QA result recording before preview review."
        }]
      : [];

  return [
    ...resultWarnings,
    ...untestedWarning,
    run.inMemoryOnly && !run.databaseWritten && !run.analyticsSent && !run.externalServicesCalled && !run.filesWritten
      ? undefined
      : {
          id: "qa_side_effect_boundary_failed",
          message: "QA run should remain in-memory only.",
          recommendedAction: "Do not write QA results to files, databases, analytics, or external services."
        }
  ].filter((entry): entry is TeoyubePostDeploymentQaWarning => Boolean(entry));
}

export function createManualPreviewPostDeploymentQaDecision(
  run: TeoyubePostDeploymentQaRun
): TeoyubePostDeploymentQaDecision {
  const blockers = getManualPreviewPostDeploymentQaBlockers(run);
  const warnings = getManualPreviewPostDeploymentQaWarnings(run);

  if (blockers.length > 0) {
    if (blockers.some((item) => item.checkId.includes("mobile"))) return "needs_mobile_fix";
    if (blockers.some((item) => item.checkId.includes("accessibility"))) return "needs_accessibility_fix";
    if (blockers.some((item) => /(scripture|explanation|fallback|consent|debug|privacy|provider)/i.test(item.checkId))) return "needs_safety_fix";
    return "blocked_by_critical_issue";
  }

  return warnings.length ? "ready_after_manual_review" : "ready_for_preview_review";
}

export function createManualPreviewPostDeploymentQaReport(
  run: TeoyubePostDeploymentQaRun
): TeoyubePostDeploymentQaReport {
  const summary = summarizeManualPreviewPostDeploymentQa(run);
  const blockers = getManualPreviewPostDeploymentQaBlockers(run);
  const warnings = getManualPreviewPostDeploymentQaWarnings(run);
  const decision = createManualPreviewPostDeploymentQaDecision(run);

  return {
    status: blockers.length ? "blocked" : warnings.length ? "warning" : "pass",
    decision,
    ready: decision === "ready_for_preview_review" || decision === "ready_after_manual_review",
    run,
    ...summary,
    blockers,
    warnings,
    noUrlFetched: true,
    noExternalWrite: true,
    generatedAt: now()
  };
}
