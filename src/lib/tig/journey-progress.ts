import type { TIGID, ISODateString, UserJourneyState } from "./types";
import type { TIGUserActivity } from "./user-activity";
import { getTIGUserActivities } from "./user-activity";
import { getTIGSeedGraph } from "./seed";

export type TIGJourneyProgressSummary = {
  journeyId: string;
  journeyName: string;
  completedActivityIds: string[];
  completedMilestoneIds: string[];
  completedActionStepIds: string[];
  completedReflectionPromptIds: string[];
  completedPrayerSequenceIds: string[];
  progressPercent: number;
  lastUpdatedAt?: ISODateString;
};

type CompletedIds = {
  actionStepIds: string[];
  reflectionPromptIds: string[];
  prayerSequenceIds: string[];
  milestoneIds: string[];
};

type RuntimeJourneyStage = {
  id?: string;
  actionStepIds?: string[];
  reflectionPromptIds?: string[];
  prayerSequenceIds?: string[];
  milestoneIds?: string[];
};

type RuntimeJourneyNode = {
  id?: string;
  type?: string;
  slug?: string;
  title?: string;
  journeyKey?: string;
  journeyName?: string;
  fromState?: string;
  toState?: string;
  milestoneIds?: string[];
  relatedMilestones?: string[];
  stages?: RuntimeJourneyStage[];
};

type RuntimeMilestoneNode = {
  id?: string;
  type?: string;
  title?: string;
  slug?: string;
  milestoneKey?: string;
  milestoneName?: string;
  journeyId?: string;
  journeyIds?: string[];
  unlocksJourneyIds?: string[];
};

type JourneyProgressAccumulator = {
  journeyId: string;
  journeyName: string;
  journey?: RuntimeJourneyNode;
  completedActivityIds: Set<string>;
  completedMilestoneIds: Set<string>;
  completedActionStepIds: Set<string>;
  completedReflectionPromptIds: Set<string>;
  completedPrayerSequenceIds: Set<string>;
  lastUpdatedAt?: ISODateString;
};

function uniqueStrings(values: Array<string | undefined>): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

function normalizeMatchValue(value: string | undefined): string {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function addAll(target: Set<string>, values: string[]): void {
  values.forEach((value) => {
    if (value) target.add(value);
  });
}

function getJourneysFromSeedGraph(): RuntimeJourneyNode[] {
  return getTIGSeedGraph().nodes.filter((node) => node.type === "JOURNEY") as RuntimeJourneyNode[];
}

function getMilestonesFromSeedGraph(): RuntimeMilestoneNode[] {
  return getTIGSeedGraph().nodes.filter(
    (node) => node.type === "GROWTH_MILESTONE"
  ) as RuntimeMilestoneNode[];
}

function getJourneyDisplayName(journey: RuntimeJourneyNode | undefined, fallback: string): string {
  return journey?.journeyName || journey?.title || journey?.journeyKey || journey?.slug || fallback;
}

function getJourneyMatchCandidates(journey: RuntimeJourneyNode): string[] {
  const statePair =
    journey.fromState && journey.toState ? `${journey.fromState} to ${journey.toState}` : undefined;

  return uniqueStrings([
    journey.id,
    journey.slug,
    journey.title,
    journey.journeyKey,
    journey.journeyName,
    statePair
  ]);
}

function findJourneyByReference(
  journeyReference: string | undefined,
  journeys: RuntimeJourneyNode[]
): RuntimeJourneyNode | undefined {
  const normalizedReference = normalizeMatchValue(journeyReference);
  if (!normalizedReference) return undefined;

  return journeys.find((journey) =>
    getJourneyMatchCandidates(journey).some(
      (candidate) => normalizeMatchValue(candidate) === normalizedReference
    )
  );
}

function getJourneyMilestoneIds(
  journey: RuntimeJourneyNode | undefined,
  milestones: RuntimeMilestoneNode[]
): string[] {
  if (!journey?.id) return [];

  const stageMilestones =
    journey.stages?.reduce<string[]>(
      (ids, stage) => [...ids, ...(stage.milestoneIds || [])],
      []
    ) || [];

  const directMilestones = [
    ...(journey.milestoneIds || []),
    ...(journey.relatedMilestones || []),
    ...stageMilestones
  ];

  const connectedMilestones = milestones
    .filter((milestone) => {
      const journeyIds = [
        milestone.journeyId,
        ...(milestone.journeyIds || []),
        ...(milestone.unlocksJourneyIds || [])
      ];
      return journeyIds.some((journeyId) => journeyId === journey.id);
    })
    .map((milestone) => milestone.id);

  return uniqueStrings([...directMilestones, ...connectedMilestones]);
}

function compareIsoDates(a: ISODateString | undefined, b: ISODateString | undefined): number {
  const aTime = a ? Date.parse(a) : 0;
  const bTime = b ? Date.parse(b) : 0;
  return bTime - aTime;
}

function isDecisionItemType(nodeType: string | undefined, label: string, expectedType: string): boolean {
  const normalizedNodeType = (nodeType || "").toUpperCase();
  const normalizedLabel = label.trim().toLowerCase();

  return (
    normalizedNodeType === expectedType ||
    (!normalizedNodeType && normalizedLabel.includes(expectedType.toLowerCase().replace("_", " ")))
  );
}

export function extractCompletedIdsFromActivity(activity: TIGUserActivity): CompletedIds {
  const completed: CompletedIds = {
    actionStepIds: [],
    reflectionPromptIds: [],
    prayerSequenceIds: [],
    milestoneIds: []
  };

  for (const item of activity.decisionSummaryItems || []) {
    if (!item.nodeId) continue;

    if (isDecisionItemType(item.nodeType, item.label, "ACTION_STEP")) {
      completed.actionStepIds.push(item.nodeId);
    }

    if (isDecisionItemType(item.nodeType, item.label, "REFLECTION_PROMPT")) {
      completed.reflectionPromptIds.push(item.nodeId);
    }

    if (isDecisionItemType(item.nodeType, item.label, "PRAYER_SEQUENCE")) {
      completed.prayerSequenceIds.push(item.nodeId);
    }

    if (isDecisionItemType(item.nodeType, item.label, "GROWTH_MILESTONE")) {
      completed.milestoneIds.push(item.nodeId);
    }
  }

  return {
    actionStepIds: uniqueStrings(completed.actionStepIds),
    reflectionPromptIds: uniqueStrings(completed.reflectionPromptIds),
    prayerSequenceIds: uniqueStrings(completed.prayerSequenceIds),
    milestoneIds: uniqueStrings(completed.milestoneIds)
  };
}

export function calculateJourneyProgressFromActivities(
  activities: TIGUserActivity[]
): TIGJourneyProgressSummary[] {
  const journeys = getJourneysFromSeedGraph();
  const milestones = getMilestonesFromSeedGraph();
  const groupedProgress = new Map<string, JourneyProgressAccumulator>();

  for (const activity of activities) {
    if (!activity.journey) continue;

    const journey = findJourneyByReference(activity.journey, journeys);
    const journeyId = journey?.id || activity.journey;
    const journeyName = getJourneyDisplayName(journey, activity.journey);

    const existing = groupedProgress.get(journeyId);
    const accumulator =
      existing ||
      ({
        journeyId,
        journeyName,
        journey,
        completedActivityIds: new Set<string>(),
        completedMilestoneIds: new Set<string>(),
        completedActionStepIds: new Set<string>(),
        completedReflectionPromptIds: new Set<string>(),
        completedPrayerSequenceIds: new Set<string>()
      } satisfies JourneyProgressAccumulator);

    const completed = extractCompletedIdsFromActivity(activity);
    accumulator.completedActivityIds.add(activity.id);
    addAll(accumulator.completedMilestoneIds, completed.milestoneIds);
    addAll(accumulator.completedActionStepIds, completed.actionStepIds);
    addAll(accumulator.completedReflectionPromptIds, completed.reflectionPromptIds);
    addAll(accumulator.completedPrayerSequenceIds, completed.prayerSequenceIds);

    if (!accumulator.lastUpdatedAt || Date.parse(activity.createdAt) > Date.parse(accumulator.lastUpdatedAt)) {
      accumulator.lastUpdatedAt = activity.createdAt;
    }

    groupedProgress.set(journeyId, accumulator);
  }

  return Array.from(groupedProgress.values())
    .map((accumulator) => {
      const journeyMilestoneIds = getJourneyMilestoneIds(accumulator.journey, milestones);
      const completedMilestoneIds = Array.from(accumulator.completedMilestoneIds);
      const completedJourneyMilestones = completedMilestoneIds.filter((id) =>
        journeyMilestoneIds.includes(id)
      );

      const progressPercent = journeyMilestoneIds.length
        ? clampPercent((completedJourneyMilestones.length / journeyMilestoneIds.length) * 100)
        : clampPercent(completedMilestoneIds.length > 0 ? 100 : 0);

      return {
        journeyId: accumulator.journeyId,
        journeyName: accumulator.journeyName,
        completedActivityIds: Array.from(accumulator.completedActivityIds),
        completedMilestoneIds,
        completedActionStepIds: Array.from(accumulator.completedActionStepIds),
        completedReflectionPromptIds: Array.from(accumulator.completedReflectionPromptIds),
        completedPrayerSequenceIds: Array.from(accumulator.completedPrayerSequenceIds),
        progressPercent,
        lastUpdatedAt: accumulator.lastUpdatedAt
      };
    })
    .sort((a, b) => compareIsoDates(a.lastUpdatedAt, b.lastUpdatedAt));
}

export function getLocalJourneyProgressSummaries(): TIGJourneyProgressSummary[] {
  return calculateJourneyProgressFromActivities(getTIGUserActivities());
}

export function buildUserJourneyStateFromSummary(params: {
  userId: string;
  summary: TIGJourneyProgressSummary;
}): UserJourneyState {
  const now = new Date().toISOString();
  const journey = findJourneyByReference(params.summary.journeyId, getJourneysFromSeedGraph());
  const completedMilestoneSet = new Set(params.summary.completedMilestoneIds);

  const completedStageIds =
    journey?.stages
      ?.filter((stage) => {
        const stageMilestones = stage.milestoneIds || [];
        return (
          stageMilestones.length > 0 &&
          stageMilestones.every((milestoneId) => completedMilestoneSet.has(milestoneId))
        );
      })
      .map((stage) => stage.id)
      .filter((stageId): stageId is string => Boolean(stageId)) || [];

  const currentStage =
    journey?.stages?.find((stage) => !stage.id || !completedStageIds.includes(stage.id)) ||
    journey?.stages?.[0];

  const activeActionStepIds = uniqueStrings(
    (currentStage?.actionStepIds || []).filter(
      (actionStepId) => !params.summary.completedActionStepIds.includes(actionStepId)
    )
  );

  return {
    userId: params.userId as TIGID,
    journeyId: params.summary.journeyId as TIGID,
    currentStageId: (currentStage?.id || `${params.summary.journeyId}_current_stage`) as TIGID,
    completedStageIds: completedStageIds as TIGID[],
    completedMilestoneIds: params.summary.completedMilestoneIds as TIGID[],
    activeActionStepIds: (activeActionStepIds.length
      ? activeActionStepIds
      : params.summary.completedActionStepIds) as TIGID[],
    startedAt: (params.summary.lastUpdatedAt || now) as ISODateString,
    lastAdvancedAt: params.summary.completedMilestoneIds.length
      ? params.summary.lastUpdatedAt
      : undefined,
    updatedAt: now as ISODateString
  };
}
