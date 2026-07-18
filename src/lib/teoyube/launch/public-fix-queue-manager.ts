import type {
  TeoyubePublicFixQueue,
  TeoyubePublicFixQueueBlocker,
  TeoyubePublicFixQueueDecision,
  TeoyubePublicFixQueueItemInput,
  TeoyubePublicFixQueueReport,
  TeoyubePublicFixQueueWarning
} from "./public-fix-queue-contracts";
import type { TeoyubePublicFixQueueItem } from "./public-feedback-triage-contracts";

export function createPublicFixQueue(): TeoyubePublicFixQueue {
  return {
    id: "public_fix_queue_6_3",
    label: "Public Launch Fix Queue",
    items: [],
    manualOnly: true,
    inMemoryOnly: true,
    fileWritten: false,
    databaseWritten: false,
    analyticsSent: false,
    externalServicesCalled: false,
    usersContacted: false,
    feedbackCollectedAutomatically: false,
    publicUrlFetched: false,
    liveAiOrchestrationEnabled: false,
    generatedAt: new Date().toISOString()
  };
}

function normalizePublicFixQueueItem(input: TeoyubePublicFixQueueItemInput | TeoyubePublicFixQueueItem): TeoyubePublicFixQueueItem {
  const publicLaunchCritical = input.publicLaunchCritical ?? input.severity === "critical";
  return {
    id: input.id || `public_fix_${input.category}_${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
    sourceFeedbackId: input.sourceFeedbackId,
    title: input.title,
    category: input.category,
    severity: input.severity || "medium",
    priority: input.priority || (publicLaunchCritical ? "public_launch_blocker" : "medium"),
    publicLaunchCritical,
    publicSafetyCritical: input.publicSafetyCritical ?? publicLaunchCritical,
    proposedFix: input.proposedFix || "Prepare a manual public safe fix plan.",
    verificationRequired: input.verificationRequired || ["owner_review"],
    status: input.status || "new",
    manualOnly: true
  };
}

export function addPublicFixQueueItem(queue: TeoyubePublicFixQueue, item: TeoyubePublicFixQueueItemInput | TeoyubePublicFixQueueItem): TeoyubePublicFixQueue {
  return { ...queue, items: [...queue.items, normalizePublicFixQueueItem(item)] };
}

export function addPublicFixQueueItems(queue: TeoyubePublicFixQueue, items: Array<TeoyubePublicFixQueueItemInput | TeoyubePublicFixQueueItem>): TeoyubePublicFixQueue {
  return items.reduce(addPublicFixQueueItem, queue);
}

export function updatePublicFixQueueItem(queue: TeoyubePublicFixQueue, itemId: string, update: Partial<TeoyubePublicFixQueueItem>): TeoyubePublicFixQueue {
  return { ...queue, items: queue.items.map((item) => item.id === itemId ? { ...item, ...update, manualOnly: true } : item) };
}

export function prioritizePublicFixQueue(queue: TeoyubePublicFixQueue): TeoyubePublicFixQueue {
  const priorityRank = { public_launch_blocker: 0, high: 1, medium: 2, low: 3, defer: 4, unknown: 5 };
  return { ...queue, items: [...queue.items].sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]) };
}

export function getPublicFixQueueBlockers(queue: TeoyubePublicFixQueue): TeoyubePublicFixQueueBlocker[] {
  return [
    ...queue.items
      .filter((item) => item.priority === "public_launch_blocker" && !["fixed", "verified", "deferred"].includes(item.status))
      .map((item) => ({
        id: `public_fix_queue_${item.id}`,
        label: item.title,
        priority: item.priority,
        riskLevel: "critical" as const,
        reason: "Public-launch-blocking fix remains unresolved.",
        requiredAction: "Pause public promotion or keep launch expansion held until this fix is planned and owner-reviewed."
      })),
    queue.fileWritten ? { id: "public_fix_queue_file_written", label: "Fix queue wrote files", priority: "public_launch_blocker", riskLevel: "critical", reason: "Public fix queue must remain in memory.", requiredAction: "Remove file writes." } : undefined,
    queue.databaseWritten ? { id: "public_fix_queue_database_written", label: "Fix queue wrote database", priority: "public_launch_blocker", riskLevel: "critical", reason: "Public fix queue must not write a database.", requiredAction: "Remove database writes." } : undefined,
    queue.analyticsSent ? { id: "public_fix_queue_analytics_sent", label: "Fix queue sent analytics", priority: "public_launch_blocker", riskLevel: "critical", reason: "Public fix queue must not send analytics.", requiredAction: "Remove analytics sending." } : undefined,
    queue.externalServicesCalled ? { id: "public_fix_queue_external_service", label: "Fix queue called external service", priority: "public_launch_blocker", riskLevel: "critical", reason: "Public fix queue must not call external services.", requiredAction: "Keep queue local and manual." } : undefined,
    queue.usersContacted ? { id: "public_fix_queue_users_contacted", label: "Fix queue contacted users", priority: "public_launch_blocker", riskLevel: "critical", reason: "Public fix queue must not contact users.", requiredAction: "Remove user contact from code." } : undefined,
    queue.feedbackCollectedAutomatically ? { id: "public_fix_queue_feedback_auto_collected", label: "Fix queue collected feedback automatically", priority: "public_launch_blocker", riskLevel: "critical", reason: "Public fix queue must not collect feedback automatically.", requiredAction: "Use manual feedback intake only." } : undefined,
    queue.publicUrlFetched ? { id: "public_fix_queue_url_fetched", label: "Fix queue fetched public URL", priority: "public_launch_blocker", riskLevel: "critical", reason: "Public fix queue must not fetch public URLs.", requiredAction: "Keep URL checks manual." } : undefined,
    queue.liveAiOrchestrationEnabled ? { id: "public_fix_queue_live_ai_enabled", label: "Fix queue enabled live AI", priority: "public_launch_blocker", riskLevel: "critical", reason: "Public fix queue must not enable live AI orchestration.", requiredAction: "Keep deterministic TIG and disabled-provider defaults." } : undefined
  ].filter(Boolean) as TeoyubePublicFixQueueBlocker[];
}

export function getPublicFixQueueWarnings(queue: TeoyubePublicFixQueue): TeoyubePublicFixQueueWarning[] {
  return queue.items
    .filter((item) => item.verificationRequired.length === 0 || item.status === "unknown")
    .map((item) => ({
      id: `public_fix_queue_warning_${item.id}`,
      label: item.title,
      riskLevel: "medium",
      message: "Public fix queue item needs verification requirements and known status.",
      recommendedAction: "Add regression verification before considering the fix complete."
    }));
}

export function summarizePublicFixQueue(queue: TeoyubePublicFixQueue) {
  return {
    itemCount: queue.items.length,
    publicLaunchBlockerCount: queue.items.filter((item) => item.priority === "public_launch_blocker").length,
    highPriorityCount: queue.items.filter((item) => item.priority === "high").length,
    verifiedCount: queue.items.filter((item) => item.status === "verified").length,
    manualOnly: queue.manualOnly,
    inMemoryOnly: queue.inMemoryOnly
  };
}

export function createPublicFixQueueDecision(queue: TeoyubePublicFixQueue): TeoyubePublicFixQueueDecision {
  const blockers = getPublicFixQueueBlockers(queue);
  if (blockers.some((entry) => /analytics|database|file|external|live ai|url/i.test(`${entry.label} ${entry.reason}`))) return "blocked";
  if (blockers.length > 0) return "pause_for_review";
  if (getPublicFixQueueWarnings(queue).length > 0) return "continue_with_warnings";
  return "continue_public_launch";
}

export function createPublicFixQueueReport(queue: TeoyubePublicFixQueue = createPublicFixQueue()): TeoyubePublicFixQueueReport {
  const prioritized = prioritizePublicFixQueue(queue);
  const blockers = getPublicFixQueueBlockers(prioritized);
  const warnings = getPublicFixQueueWarnings(prioritized);
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    decision: createPublicFixQueueDecision(prioritized),
    queue: prioritized,
    itemCount: prioritized.items.length,
    publicLaunchBlockerCount: prioritized.items.filter((item) => item.priority === "public_launch_blocker").length,
    blockers,
    warnings,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlFetched: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
