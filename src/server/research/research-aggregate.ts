import type { ResearchAggregateSummary, ResearchEventRecord } from "../../domain/research/research-contracts";

function count(events: readonly ResearchEventRecord[], eventName: string): number {
  return events.filter((event) => event.eventName === eventName).length;
}

function issueCounts(events: readonly ResearchEventRecord[]): Readonly<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const event of events) {
    if (event.safeIssueCode) counts[event.safeIssueCode] = (counts[event.safeIssueCode] ?? 0) + 1;
  }
  return Object.freeze(Object.fromEntries(Object.entries(counts).sort(([left], [right]) => left.localeCompare(right))));
}

export function aggregateResearchEvents(events: readonly ResearchEventRecord[]): ResearchAggregateSummary {
  const completedWithoutRescue = events.filter(
    (event) => event.eventName === "research_task_completed" && event.moderatorRescueCount === 0
  ).length;
  const accessibilityBarriers: Record<string, number> = {};
  for (const event of events.filter((candidate) => candidate.eventName.endsWith("_barrier_observed"))) {
    accessibilityBarriers[event.eventName] = (accessibilityBarriers[event.eventName] ?? 0) + 1;
  }
  const criticalMisunderstandingCount = events.filter(
    (event) => event.eventName.endsWith("_misunderstood") || event.eventName === "research_scripture_vs_interpretation_incorrect"
  ).length;
  return Object.freeze({
    participantCount: new Set(events.map((event) => event.participantId)).size,
    sessionCount: new Set(events.map((event) => event.sessionId)).size,
    taskCompletedCount: count(events, "research_task_completed"),
    completionWithoutRescueCount: completedWithoutRescue,
    moderatorRescueCount: events.reduce((total, event) => total + event.moderatorRescueCount, 0),
    criticalMisunderstandingCount,
    sourceInspectionSuccessCount: count(events, "research_source_inspected"),
    scriptureInterpretationCorrectCount: count(events, "research_scripture_vs_interpretation_correct"),
    callingBoundaryUnderstoodCount: count(events, "research_calling_uncertainty_understood"),
    testimonyFulfillmentBoundaryUnderstoodCount:
      count(events, "research_testimony_ownership_understood") + count(events, "research_fulfillment_boundary_understood"),
    memoryConsentUnderstoodCount: count(events, "research_memory_comprehension_correct"),
    rejectUndoCount: count(events, "research_action_rejected") + count(events, "research_action_undone"),
    fallbackUnderstoodCount: count(events, "research_provider_fallback_understood"),
    accessibilityBarriersByCategory: Object.freeze(
      Object.fromEntries(Object.entries(accessibilityBarriers).sort(([left], [right]) => left.localeCompare(right)))
    ),
    clarityRatings: Object.freeze(events.filter((event) => event.eventName === "research_clarity_rating_recorded").map((event) => event.rating as number)),
    trustRatings: Object.freeze(events.filter((event) => event.eventName === "research_trust_rating_recorded").map((event) => event.rating as number)),
    safeIssueCounts: issueCounts(events),
    adverseEventCount: count(events, "research_safety_stop")
  });
}
