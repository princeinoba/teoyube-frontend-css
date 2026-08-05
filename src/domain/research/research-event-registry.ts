import eventRegistry from "../../../config/research-event-registry.json";
import studyRegistry from "../../../config/research-study-registry.json";
import type { PurposeId } from "../memory/memory-contracts";
import { ResearchBoundaryError } from "./research-contracts";

export const RESEARCH_EVENT_REGISTRY_VERSION = eventRegistry.registryVersion;
export const RESEARCH_STUDY_VERSION = eventRegistry.studyVersion;
export const RESEARCH_EVENT_COUNT = eventRegistry.events.length;

export type ResearchEventDefinition = Readonly<{
  name: string;
  version: string;
  group: string;
  ratingRequired: boolean;
  additionalConsent: readonly PurposeId[];
}>;

const eventDefinitions = new Map<string, ResearchEventDefinition>(
  eventRegistry.events.map((event) => [
    event.name,
    Object.freeze({
      name: event.name,
      version: event.version,
      group: event.group,
      ratingRequired: "ratingRequired" in event && event.ratingRequired === true,
      additionalConsent: Object.freeze(
        ("additionalConsent" in event ? event.additionalConsent : []) as readonly PurposeId[]
      )
    })
  ])
);

export function getResearchEventDefinition(eventName: string): ResearchEventDefinition {
  const definition = eventDefinitions.get(eventName);
  if (!definition) {
    throw new ResearchBoundaryError("research_event_unknown");
  }
  return definition;
}

export function listResearchEventDefinitions(): readonly ResearchEventDefinition[] {
  return Object.freeze([...eventDefinitions.values()]);
}

export type ResearchStudyDefinition = Readonly<{
  studyId: string;
  studyVersion: string;
  status: "synthetic_test_only" | "approved";
  cohorts: readonly string[];
  allowedTaskIds: readonly string[];
  retentionDays: number;
  realParticipantCollectionAuthorized: boolean;
}>;

const studies = new Map<string, ResearchStudyDefinition>(
  studyRegistry.studies.map((study) => [study.studyId, Object.freeze({ ...study }) as ResearchStudyDefinition])
);

export function getResearchStudy(studyId: string): ResearchStudyDefinition {
  const study = studies.get(studyId);
  if (!study) {
    throw new ResearchBoundaryError("research_study_unknown");
  }
  return study;
}

export function isResearchStudyAllowed(studyId: string): boolean {
  return studies.has(studyId);
}

export function listResearchStudies(): readonly ResearchStudyDefinition[] {
  return Object.freeze([...studies.values()]);
}
