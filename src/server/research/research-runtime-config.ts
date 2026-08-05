import { getResearchStudy, isResearchStudyAllowed } from "../../domain/research/research-event-registry";

export type ResearchRuntimeConfiguration = Readonly<{
  enabled: boolean;
  studyId: string | null;
  studyAllowed: boolean;
  syntheticOnly: boolean;
}>;

export function readResearchRuntimeConfiguration(
  environment: Readonly<Record<string, string | undefined>> = process.env
): ResearchRuntimeConfiguration {
  const enabled = environment.TEOYUBE_RESEARCH_MODE_ENABLED === "true";
  const studyId = enabled && environment.TEOYUBE_RESEARCH_STUDY_ID
    ? environment.TEOYUBE_RESEARCH_STUDY_ID
    : null;
  const studyAllowed = Boolean(studyId && isResearchStudyAllowed(studyId));
  const syntheticOnly = studyAllowed
    ? getResearchStudy(studyId as string).status === "synthetic_test_only"
    : false;
  return Object.freeze({ enabled, studyId, studyAllowed, syntheticOnly });
}

export function researchDiagnosticsMetadata(
  configuration: ResearchRuntimeConfiguration
): Readonly<{ researchModeEnabled: boolean }> {
  return Object.freeze({ researchModeEnabled: configuration.enabled });
}
