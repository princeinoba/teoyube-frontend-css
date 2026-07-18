import type { TeoyubeFirstDayIssueSeverity } from "./first-day-issue-triage-contracts";
import type { TeoyubeFirstWeekStabilizationArea } from "./first-week-stabilization-contracts";

export type TeoyubeFirstWeekStabilizationDecisionType =
  | "continue_controlled_release"
  | "continue_with_watch"
  | "pause_promotion"
  | "approve_safe_fix_batch"
  | "reject_safe_fix_batch"
  | "rollback_release"
  | "remain_limited"
  | "approve_limited_expansion"
  | "block_expansion"
  | "unknown";

export type TeoyubeFirstWeekStabilizationDecisionLogEntry = {
  id: string;
  timestamp: string;
  releaseOwner: string;
  decisionType: TeoyubeFirstWeekStabilizationDecisionType;
  affectedArea: TeoyubeFirstWeekStabilizationArea;
  issueSeverity?: TeoyubeFirstDayIssueSeverity;
  summary: string;
  actionTaken: string;
  followUpRequired: boolean;
  rollbackRequired: boolean;
  safeFixBatchRequired: boolean;
  expansionAllowed: boolean;
  expansionConditions: string[];
  notes: string[];
};

export type TeoyubeFirstWeekStabilizationDecisionLog = {
  id: string;
  entries: TeoyubeFirstWeekStabilizationDecisionLogEntry[];
  noExternalSend: true;
  noAutomaticUserContact: true;
  inMemoryOnly: true;
  createdAt: string;
  updatedAt: string;
};

export function createFirstWeekStabilizationDecisionLog(input: Partial<TeoyubeFirstWeekStabilizationDecisionLog> = {}): TeoyubeFirstWeekStabilizationDecisionLog {
  const now = new Date().toISOString();
  return {
    id: input.id || "phase_10_5_first_week_stabilization_decision_log",
    entries: input.entries || [],
    noExternalSend: true,
    noAutomaticUserContact: true,
    inMemoryOnly: true,
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now
  };
}

export function createFirstWeekStabilizationDecisionLogEntry(input: Partial<TeoyubeFirstWeekStabilizationDecisionLogEntry> = {}): TeoyubeFirstWeekStabilizationDecisionLogEntry {
  return {
    id: input.id || `first_week_stabilization_decision_${Date.now()}`,
    timestamp: input.timestamp || new Date().toISOString(),
    releaseOwner: input.releaseOwner || "project_owner",
    decisionType: input.decisionType || "unknown",
    affectedArea: input.affectedArea || "unknown",
    issueSeverity: input.issueSeverity,
    summary: input.summary || "First-week stabilization decision requires owner summary.",
    actionTaken: input.actionTaken || "Manual owner action required.",
    followUpRequired: input.followUpRequired ?? true,
    rollbackRequired: input.rollbackRequired ?? false,
    safeFixBatchRequired: input.safeFixBatchRequired ?? false,
    expansionAllowed: input.expansionAllowed ?? false,
    expansionConditions: input.expansionConditions || [],
    notes: input.notes || []
  };
}

export function recordFirstWeekStabilizationDecision(log: TeoyubeFirstWeekStabilizationDecisionLog, entry: TeoyubeFirstWeekStabilizationDecisionLogEntry): TeoyubeFirstWeekStabilizationDecisionLog {
  return { ...log, entries: [...log.entries.filter((item) => item.id !== entry.id), entry], updatedAt: new Date().toISOString() };
}

export function getFirstWeekStabilizationDecisionLogBlockers(log: TeoyubeFirstWeekStabilizationDecisionLog): string[] {
  return log.entries
    .filter((entry) => entry.rollbackRequired || entry.decisionType === "rollback_release" || entry.decisionType === "block_expansion")
    .map((entry) => `${entry.id}: ${entry.summary}`);
}

export function getFirstWeekStabilizationDecisionLogWarnings(log: TeoyubeFirstWeekStabilizationDecisionLog): string[] {
  const warnings: string[] = [];
  if (!log.entries.length) warnings.push("First-week stabilization decision log is empty.");
  log.entries
    .filter((entry) => entry.followUpRequired || entry.safeFixBatchRequired)
    .forEach((entry) => warnings.push(`${entry.id}: follow-up or safe-fix batch review remains required.`));
  log.entries
    .filter((entry) => entry.expansionAllowed && !entry.expansionConditions.length)
    .forEach((entry) => warnings.push(`${entry.id}: expansion was allowed without written conditions.`));
  return warnings;
}

export function createFirstWeekStabilizationDecisionLogReport(log: TeoyubeFirstWeekStabilizationDecisionLog) {
  const blockers = getFirstWeekStabilizationDecisionLogBlockers(log);
  return {
    valid: blockers.length === 0,
    log,
    latestDecision: getLatestFirstWeekStabilizationDecision(log),
    blockers,
    warnings: getFirstWeekStabilizationDecisionLogWarnings(log),
    noExternalSend: true,
    noAutomaticUserContact: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}

export function getLatestFirstWeekStabilizationDecision(log: TeoyubeFirstWeekStabilizationDecisionLog): TeoyubeFirstWeekStabilizationDecisionLogEntry | undefined {
  return [...log.entries].sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
}
