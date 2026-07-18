import type {
  TeoyubeLaunchDecisionLog,
  TeoyubeLaunchDecisionLogBlocker,
  TeoyubeLaunchDecisionLogEntry,
  TeoyubeLaunchDecisionLogReport,
  TeoyubeLaunchDecisionLogWarning
} from "./launch-decision-log-contracts";

export function createLaunchDecisionLog(input: Partial<TeoyubeLaunchDecisionLog> = {}): TeoyubeLaunchDecisionLog {
  const now = new Date().toISOString();
  return {
    id: input.id || "phase_10_3_launch_decision_log",
    entries: input.entries || [],
    noExternalStorage: true,
    noAutomaticUserContact: true,
    inMemoryOnly: true,
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now
  };
}

export function createLaunchDecisionLogEntry(input: Partial<TeoyubeLaunchDecisionLogEntry> = {}): TeoyubeLaunchDecisionLogEntry {
  return {
    id: input.id || `launch_decision_${Date.now()}`,
    timestamp: input.timestamp || new Date().toISOString(),
    decisionType: input.decisionType || "unknown",
    status: input.status || "draft",
    releaseOwner: input.releaseOwner || "manual_owner_required",
    decisionReason: input.decisionReason || "unknown",
    affectedArea: input.affectedArea || "unknown",
    issueSeverity: input.issueSeverity,
    summary: input.summary || "Manual launch decision placeholder.",
    actionTaken: input.actionTaken || "No automated action taken.",
    conditions: input.conditions || [],
    rollbackRequired: input.rollbackRequired ?? false,
    followUpRequired: input.followUpRequired ?? false,
    notes: input.notes || []
  };
}

export function recordLaunchDecision(log: TeoyubeLaunchDecisionLog, entry: TeoyubeLaunchDecisionLogEntry): TeoyubeLaunchDecisionLog {
  return {
    ...log,
    entries: [...log.entries.filter((item) => item.id !== entry.id), { ...entry, status: entry.status === "draft" ? "recorded" : entry.status }],
    updatedAt: new Date().toISOString()
  };
}

export function getLatestLaunchDecision(log: TeoyubeLaunchDecisionLog): TeoyubeLaunchDecisionLogEntry | undefined {
  const sorted = [...log.entries].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  return sorted[sorted.length - 1];
}

export function getLaunchDecisionLogBlockers(log: TeoyubeLaunchDecisionLog): TeoyubeLaunchDecisionLogBlocker[] {
  const blockers: TeoyubeLaunchDecisionLogBlocker[] = [];
  log.entries.forEach((entry) => {
    if (!entry.releaseOwner || entry.releaseOwner === "manual_owner_required") blockers.push({ id: `${entry.id}_owner`, message: "Launch decision entry requires a release owner." });
    if (!entry.summary || entry.summary === "Manual launch decision placeholder.") blockers.push({ id: `${entry.id}_summary`, message: "Launch decision entry requires a specific summary." });
    if (entry.rollbackRequired && entry.decisionType !== "rollback_release") blockers.push({ id: `${entry.id}_rollback`, message: "Rollback-required entries must record a rollback decision or owner override." });
  });
  return blockers;
}

export function getLaunchDecisionLogWarnings(log: TeoyubeLaunchDecisionLog): TeoyubeLaunchDecisionLogWarning[] {
  const warnings: TeoyubeLaunchDecisionLogWarning[] = [];
  if (!log.entries.length) warnings.push({ id: "no_decisions_recorded", message: "No launch decisions have been recorded yet." });
  log.entries
    .filter((entry) => entry.followUpRequired)
    .forEach((entry) => warnings.push({ id: `${entry.id}_follow_up`, message: "Launch decision requires manual follow-up." }));
  warnings.push({ id: "local_only_decision_log", message: "Decision log is in-memory only and sends nothing externally." });
  return warnings;
}

export function createLaunchDecisionLogReport(log: TeoyubeLaunchDecisionLog): TeoyubeLaunchDecisionLogReport {
  const blockers = getLaunchDecisionLogBlockers(log);
  return {
    valid: blockers.length === 0,
    log,
    latestDecision: getLatestLaunchDecision(log),
    blockers,
    warnings: getLaunchDecisionLogWarnings(log),
    noExternalStorage: true,
    noAutomaticUserContact: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
