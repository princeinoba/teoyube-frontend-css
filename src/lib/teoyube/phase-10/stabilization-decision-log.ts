import type { TeoyubeFirstDayIssueSeverity } from "./first-day-issue-triage-contracts";
import type { TeoyubeFirstDayReviewArea } from "./first-day-review-contracts";

export type TeoyubeStabilizationDecisionType =
  | "continue_controlled_release"
  | "continue_with_watch"
  | "pause_promotion"
  | "approve_safe_fix"
  | "reject_safe_fix"
  | "rollback_release"
  | "move_to_first_week_stabilization"
  | "unknown";

export type TeoyubeStabilizationDecisionLogEntry = {
  id: string;
  timestamp: string;
  releaseOwner: string;
  decisionType: TeoyubeStabilizationDecisionType;
  issueSeverity?: TeoyubeFirstDayIssueSeverity;
  affectedArea: TeoyubeFirstDayReviewArea | "unknown";
  summary: string;
  actionTaken: string;
  followUpRequired: boolean;
  rollbackRequired: boolean;
  safeFixRequired: boolean;
  notes: string[];
};

export type TeoyubeStabilizationDecisionLog = {
  id: string;
  entries: TeoyubeStabilizationDecisionLogEntry[];
  noExternalStorage: true;
  noAutomaticUserContact: true;
  inMemoryOnly: true;
  createdAt: string;
  updatedAt: string;
};

export function createStabilizationDecisionLog(input: Partial<TeoyubeStabilizationDecisionLog> = {}): TeoyubeStabilizationDecisionLog {
  const now = new Date().toISOString();
  return {
    id: input.id || "phase_10_4_stabilization_decision_log",
    entries: input.entries || [],
    noExternalStorage: true,
    noAutomaticUserContact: true,
    inMemoryOnly: true,
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now
  };
}

export function createStabilizationDecisionLogEntry(input: Partial<TeoyubeStabilizationDecisionLogEntry> = {}): TeoyubeStabilizationDecisionLogEntry {
  return {
    id: input.id || `stabilization_decision_${Date.now()}`,
    timestamp: input.timestamp || new Date().toISOString(),
    releaseOwner: input.releaseOwner || "manual_owner_required",
    decisionType: input.decisionType || "unknown",
    issueSeverity: input.issueSeverity,
    affectedArea: input.affectedArea || "unknown",
    summary: input.summary || "Manual stabilization decision placeholder.",
    actionTaken: input.actionTaken || "No automated action taken.",
    followUpRequired: input.followUpRequired ?? false,
    rollbackRequired: input.rollbackRequired ?? false,
    safeFixRequired: input.safeFixRequired ?? false,
    notes: input.notes || []
  };
}

export function recordStabilizationDecision(log: TeoyubeStabilizationDecisionLog, entry: TeoyubeStabilizationDecisionLogEntry): TeoyubeStabilizationDecisionLog {
  return { ...log, entries: [...log.entries.filter((item) => item.id !== entry.id), entry], updatedAt: new Date().toISOString() };
}

export function getLatestStabilizationDecision(log: TeoyubeStabilizationDecisionLog): TeoyubeStabilizationDecisionLogEntry | undefined {
  const sorted = [...log.entries].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  return sorted[sorted.length - 1];
}

export function getStabilizationDecisionLogBlockers(log: TeoyubeStabilizationDecisionLog): string[] {
  return log.entries.flatMap((entry) => {
    const blockers: string[] = [];
    if (!entry.releaseOwner || entry.releaseOwner === "manual_owner_required") blockers.push(`${entry.id}: release owner is required.`);
    if (entry.rollbackRequired && entry.decisionType !== "rollback_release") blockers.push(`${entry.id}: rollback-required entry must record rollback_release or owner override.`);
    if (entry.safeFixRequired && entry.decisionType !== "approve_safe_fix" && entry.decisionType !== "reject_safe_fix") blockers.push(`${entry.id}: safe-fix-required entry must approve or reject the safe fix.`);
    return blockers;
  });
}

export function getStabilizationDecisionLogWarnings(log: TeoyubeStabilizationDecisionLog): string[] {
  const warnings: string[] = [];
  if (!log.entries.length) warnings.push("No stabilization decisions have been recorded yet.");
  log.entries.filter((entry) => entry.followUpRequired).forEach((entry) => warnings.push(`${entry.id}: follow-up required.`));
  warnings.push("Stabilization decision log is in-memory only and sends nothing externally.");
  return warnings;
}

export function createStabilizationDecisionLogReport(log: TeoyubeStabilizationDecisionLog) {
  const blockers = getStabilizationDecisionLogBlockers(log);
  return {
    valid: blockers.length === 0,
    log,
    latestDecision: getLatestStabilizationDecision(log),
    blockers,
    warnings: getStabilizationDecisionLogWarnings(log),
    noExternalStorage: true,
    noAutomaticUserContact: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
