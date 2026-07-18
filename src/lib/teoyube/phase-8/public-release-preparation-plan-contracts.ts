export type TeoyubePublicReleasePreparationStatus =
  | "planned"
  | "ready_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubePublicReleasePreparationArea =
  | "product_hardening"
  | "content_review"
  | "privacy_security"
  | "service_reassessment"
  | "mobile_accessibility"
  | "performance"
  | "known_limitations"
  | "owner_approval"
  | "public_copy"
  | "support_workflow"
  | "operational_readiness"
  | "unknown";

export type TeoyubePublicReleasePreparationDecision =
  | "public_release_planning_ready"
  | "public_release_planning_ready_with_warnings"
  | "blocked"
  | "needs_owner_review"
  | "unknown";

export type TeoyubePublicReleasePreparationBlocker = {
  id: string;
  area: TeoyubePublicReleasePreparationArea;
  message: string;
  requiredAction: string;
};

export type TeoyubePublicReleasePreparationWarning = {
  id: string;
  area: TeoyubePublicReleasePreparationArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubePublicReleasePreparationCheck = {
  id: string;
  area: TeoyubePublicReleasePreparationArea;
  label: string;
  passed: boolean;
  details: string;
};

export type TeoyubePublicReleasePreparationReport = {
  valid: boolean;
  status: TeoyubePublicReleasePreparationStatus;
  decision: TeoyubePublicReleasePreparationDecision;
  checks: TeoyubePublicReleasePreparationCheck[];
  blockers: TeoyubePublicReleasePreparationBlocker[];
  warnings: TeoyubePublicReleasePreparationWarning[];
  noPublicReleaseLaunched: true;
  noUsersContacted: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  inMemoryOnly: true;
  generatedAt: string;
};
