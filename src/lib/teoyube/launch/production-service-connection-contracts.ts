export type TeoyubeProductionServiceKind =
  | "database_persistence"
  | "analytics"
  | "live_ai_orchestration"
  | "monitoring"
  | "email_or_notifications"
  | "storage"
  | "authentication"
  | "search"
  | "unknown";

export type TeoyubeProductionServiceProvider =
  | "supabase"
  | "firebase"
  | "postgres"
  | "mongodb"
  | "posthog"
  | "segment"
  | "google_analytics"
  | "mixpanel"
  | "openai"
  | "custom"
  | "none"
  | "undecided";

export type TeoyubeProductionServiceConnectionDecision =
  | "ready_for_planning"
  | "ready_after_owner_review"
  | "blocked"
  | "defer"
  | "not_required"
  | "unknown";

export type TeoyubeProductionServiceConnectionRequirement = {
  id: string;
  label: string;
  requiredBeforePublicLaunch: boolean;
  serviceKind: TeoyubeProductionServiceKind;
  satisfied: boolean;
};

export type TeoyubeProductionServiceConnectionRisk = {
  id: string;
  serviceKind: TeoyubeProductionServiceKind;
  label: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  mitigation: string;
  ownerReviewRequired: boolean;
};

export type TeoyubeProductionServiceConnectionBoundary = {
  id: string;
  serviceKind: TeoyubeProductionServiceKind;
  label: string;
  enforced: boolean;
  details: string;
};

export type TeoyubeProductionServiceConnectionPlan = {
  id: string;
  label: string;
  serviceKind: TeoyubeProductionServiceKind;
  provider: TeoyubeProductionServiceProvider;
  requiredBeforePublicLaunch: boolean;
  optionalOrDeferred: boolean;
  requirements: TeoyubeProductionServiceConnectionRequirement[];
  risks: TeoyubeProductionServiceConnectionRisk[];
  boundaries: TeoyubeProductionServiceConnectionBoundary[];
  decision: TeoyubeProductionServiceConnectionDecision;
  connected: false;
  secretsWritten: false;
  sdkInstalled: false;
  externalCallsEnabled: false;
  databasePersistenceEnabled: false;
  analyticsSendingEnabled: false;
  liveAiOrchestrationEnabled: false;
};

export type TeoyubeProductionServiceConnectionReadinessReport = {
  valid: boolean;
  ready: boolean;
  decision: TeoyubeProductionServiceConnectionDecision;
  plans: TeoyubeProductionServiceConnectionPlan[];
  requiredPlanCount: number;
  optionalPlanCount: number;
  deferredPlanCount: number;
  blockers: Array<{ id: string; label: string; reason: string; requiredAction: string; riskLevel: "high" | "critical" }>;
  warnings: Array<{ id: string; label: string; message: string; recommendedAction: string; riskLevel: "low" | "medium" | "high" }>;
  noProvidersConnected: true;
  noSecretsWritten: true;
  noExternalCallsEnabled: true;
  generatedAt: string;
};
