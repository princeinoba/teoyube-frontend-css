import type { TeoyubeFirstDayIssueSeverity } from "./first-day-issue-triage-contracts";
import type { TeoyubeStabilizedPublicOperationsArea } from "./stabilized-public-operations-contracts";

export type TeoyubeOperationsDecisionType =
  | "continue_stabilized_operations"
  | "continue_with_watch"
  | "approve_safe_fix_batch"
  | "reject_safe_fix_batch"
  | "pause_promotion"
  | "rollback_release"
  | "update_known_issues"
  | "update_roadmap"
  | "approve_phase_10_completion"
  | "block_phase_10_completion"
  | "unknown";

export type TeoyubeOperationsDecisionLogEntry = {
  id: string;
  timestamp: string;
  releaseOwner: string;
  decisionType: TeoyubeOperationsDecisionType;
  affectedArea: TeoyubeStabilizedPublicOperationsArea;
  issueSeverity?: TeoyubeFirstDayIssueSeverity;
  summary: string;
  actionTaken: string;
  followUpRequired: boolean;
  rollbackRequired: boolean;
  safeFixBatchRequired: boolean;
  phase10CompletionImpact: "supports_completion" | "completion_warning" | "blocks_completion" | "unknown";
  notes: string[];
};

export type TeoyubeOperationsDecisionLog = {
  id: string;
  entries: TeoyubeOperationsDecisionLogEntry[];
  noExternalSend: true;
  noAutomaticUserContact: true;
  inMemoryOnly: true;
  createdAt: string;
  updatedAt: string;
};

export function createOperationsDecisionLog(input: Partial<TeoyubeOperationsDecisionLog> = {}): TeoyubeOperationsDecisionLog {
  const now = new Date().toISOString();
  return {
    id: input.id || "phase_10_7_operations_decision_log",
    entries: input.entries || [],
    noExternalSend: true,
    noAutomaticUserContact: true,
    inMemoryOnly: true,
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now
  };
}

export function createOperationsDecisionLogEntry(input: Partial<TeoyubeOperationsDecisionLogEntry> = {}): TeoyubeOperationsDecisionLogEntry {
  return {
    id: input.id || `operations_decision_${Date.now()}`,
    timestamp: input.timestamp || new Date().toISOString(),
    releaseOwner: input.releaseOwner || "project_owner",
    decisionType: input.decisionType || "unknown",
    affectedArea: input.affectedArea || "unknown",
    issueSeverity: input.issueSeverity,
    summary: input.summary || "Operations decision requires owner summary.",
    actionTaken: input.actionTaken || "Manual owner action required.",
    followUpRequired: input.followUpRequired ?? true,
    rollbackRequired: input.rollbackRequired ?? false,
    safeFixBatchRequired: input.safeFixBatchRequired ?? false,
    phase10CompletionImpact: input.phase10CompletionImpact || "unknown",
    notes: input.notes || []
  };
}

export function recordOperationsDecision(log: TeoyubeOperationsDecisionLog, entry: TeoyubeOperationsDecisionLogEntry): TeoyubeOperationsDecisionLog {
  return { ...log, entries: [...log.entries.filter((item) => item.id !== entry.id), entry], updatedAt: new Date().toISOString() };
}

export function getOperationsDecisionLogBlockers(log: TeoyubeOperationsDecisionLog): string[] {
  return log.entries
    .filter((entry) => entry.rollbackRequired || entry.decisionType === "rollback_release" || entry.decisionType === "block_phase_10_completion" || entry.phase10CompletionImpact === "blocks_completion")
    .map((entry) => `${entry.id}: ${entry.summary}`);
}

export function getOperationsDecisionLogWarnings(log: TeoyubeOperationsDecisionLog): string[] {
  const warnings: string[] = [];
  if (!log.entries.length) warnings.push("Operations decision log is empty.");
  log.entries
    .filter((entry) => entry.followUpRequired || entry.safeFixBatchRequired || entry.phase10CompletionImpact === "completion_warning")
    .forEach((entry) => warnings.push(`${entry.id}: follow-up, safe-fix batch, or completion warning remains.`));
  return warnings;
}

export function createOperationsDecisionLogReport(log: TeoyubeOperationsDecisionLog) {
  const blockers = getOperationsDecisionLogBlockers(log);
  return {
    valid: blockers.length === 0,
    log,
    latestDecision: getLatestOperationsDecision(log),
    blockers,
    warnings: getOperationsDecisionLogWarnings(log),
    noExternalSend: true,
    noAutomaticUserContact: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}

export function getLatestOperationsDecision(log: TeoyubeOperationsDecisionLog): TeoyubeOperationsDecisionLogEntry | undefined {
  return [...log.entries].sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
}
