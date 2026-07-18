import type {
  TeoyubeSoftLaunchFixQueue,
  TeoyubeSoftLaunchFixQueueBlocker,
  TeoyubeSoftLaunchFixQueueDecision,
  TeoyubeSoftLaunchFixQueueItemInput,
  TeoyubeSoftLaunchFixQueueReport,
  TeoyubeSoftLaunchFixQueueWarning
} from "./soft-launch-fix-queue-contracts";
import type { TeoyubeSoftLaunchFixQueueItem } from "./soft-launch-feedback-triage-contracts";

export function createSoftLaunchFixQueue(): TeoyubeSoftLaunchFixQueue {
  return {
    id: "soft_launch_fix_queue_4_3",
    label: "Soft Launch Fix Queue",
    items: [],
    manualOnly: true,
    inMemoryOnly: true,
    fileWritten: false,
    databaseWritten: false,
    analyticsSent: false,
    externalServicesCalled: false,
    generatedAt: new Date().toISOString()
  };
}

function normalizeItem(input: TeoyubeSoftLaunchFixQueueItemInput | TeoyubeSoftLaunchFixQueueItem): TeoyubeSoftLaunchFixQueueItem {
  const launchCritical = input.launchCritical ?? input.severity === "critical";
  return {
    id: input.id || `fix_${input.category}_${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
    sourceFeedbackId: input.sourceFeedbackId,
    title: input.title,
    category: input.category,
    severity: input.severity || "medium",
    priority: input.priority || (launchCritical ? "launch_blocker" : "medium"),
    launchCritical,
    safetyCritical: input.safetyCritical ?? launchCritical,
    proposedFix: input.proposedFix || "Prepare a manual safe fix plan.",
    verificationRequired: input.verificationRequired || ["owner_review"],
    status: input.status || "new",
    manualOnly: true
  };
}

export function addSoftLaunchFixQueueItem(queue: TeoyubeSoftLaunchFixQueue, item: TeoyubeSoftLaunchFixQueueItemInput | TeoyubeSoftLaunchFixQueueItem): TeoyubeSoftLaunchFixQueue {
  return { ...queue, items: [...queue.items, normalizeItem(item)] };
}

export function addSoftLaunchFixQueueItems(queue: TeoyubeSoftLaunchFixQueue, items: Array<TeoyubeSoftLaunchFixQueueItemInput | TeoyubeSoftLaunchFixQueueItem>): TeoyubeSoftLaunchFixQueue {
  return items.reduce(addSoftLaunchFixQueueItem, queue);
}

export function updateSoftLaunchFixQueueItem(queue: TeoyubeSoftLaunchFixQueue, itemId: string, update: Partial<TeoyubeSoftLaunchFixQueueItem>): TeoyubeSoftLaunchFixQueue {
  return { ...queue, items: queue.items.map((item) => item.id === itemId ? { ...item, ...update, manualOnly: true } : item) };
}

export function prioritizeSoftLaunchFixQueue(queue: TeoyubeSoftLaunchFixQueue): TeoyubeSoftLaunchFixQueue {
  const priorityRank = { launch_blocker: 0, high: 1, medium: 2, low: 3, defer: 4, unknown: 5 };
  return { ...queue, items: [...queue.items].sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]) };
}

export function getSoftLaunchFixQueueBlockers(queue: TeoyubeSoftLaunchFixQueue): TeoyubeSoftLaunchFixQueueBlocker[] {
  return [
    ...queue.items
      .filter((item) => item.priority === "launch_blocker" && !["fixed", "verified", "deferred"].includes(item.status))
      .map((item) => ({
        id: `fix_queue_${item.id}`,
        label: item.title,
        priority: item.priority,
        riskLevel: "critical" as const,
        reason: "Launch-blocking fix remains unresolved.",
        requiredAction: "Pause or hold expansion until this fix is planned and owner-reviewed."
      })),
    queue.fileWritten ? { id: "fix_queue_file_written", label: "Fix queue wrote files", priority: "launch_blocker", riskLevel: "critical", reason: "Fix queue must remain in memory.", requiredAction: "Remove file writes." } : undefined,
    queue.databaseWritten ? { id: "fix_queue_database_written", label: "Fix queue wrote database", priority: "launch_blocker", riskLevel: "critical", reason: "Fix queue must not write a database.", requiredAction: "Remove database writes." } : undefined,
    queue.analyticsSent ? { id: "fix_queue_analytics_sent", label: "Fix queue sent analytics", priority: "launch_blocker", riskLevel: "critical", reason: "Fix queue must not send analytics.", requiredAction: "Remove analytics sending." } : undefined
  ].filter(Boolean) as TeoyubeSoftLaunchFixQueueBlocker[];
}

export function getSoftLaunchFixQueueWarnings(queue: TeoyubeSoftLaunchFixQueue): TeoyubeSoftLaunchFixQueueWarning[] {
  return queue.items
    .filter((item) => item.verificationRequired.length === 0 || item.status === "unknown")
    .map((item) => ({
      id: `fix_queue_warning_${item.id}`,
      label: item.title,
      riskLevel: "medium",
      message: "Fix queue item needs verification requirements and known status.",
      recommendedAction: "Add verification requirements before considering the fix complete."
    }));
}

export function summarizeSoftLaunchFixQueue(queue: TeoyubeSoftLaunchFixQueue) {
  return {
    itemCount: queue.items.length,
    launchBlockerCount: queue.items.filter((item) => item.priority === "launch_blocker").length,
    highPriorityCount: queue.items.filter((item) => item.priority === "high").length,
    verifiedCount: queue.items.filter((item) => item.status === "verified").length,
    manualOnly: queue.manualOnly,
    inMemoryOnly: queue.inMemoryOnly
  };
}

export function createSoftLaunchFixQueueDecision(queue: TeoyubeSoftLaunchFixQueue): TeoyubeSoftLaunchFixQueueDecision {
  const blockers = getSoftLaunchFixQueueBlockers(queue);
  if (blockers.some((entry) => /analytics|database|file/i.test(`${entry.label} ${entry.reason}`))) return "blocked";
  if (blockers.length > 0) return "pause_for_review";
  if (getSoftLaunchFixQueueWarnings(queue).length > 0) return "continue_with_warnings";
  return "continue_soft_launch";
}

export function createSoftLaunchFixQueueReport(queue: TeoyubeSoftLaunchFixQueue = createSoftLaunchFixQueue()): TeoyubeSoftLaunchFixQueueReport {
  const prioritized = prioritizeSoftLaunchFixQueue(queue);
  const blockers = getSoftLaunchFixQueueBlockers(prioritized);
  const warnings = getSoftLaunchFixQueueWarnings(prioritized);
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    decision: createSoftLaunchFixQueueDecision(prioritized),
    queue: prioritized,
    itemCount: prioritized.items.length,
    launchBlockerCount: prioritized.items.filter((item) => item.priority === "launch_blocker").length,
    blockers,
    warnings,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
