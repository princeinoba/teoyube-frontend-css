import type { TeoyubeDryRunFixQueue, TeoyubeDryRunFixQueueCategory, TeoyubeDryRunFixQueueItem } from "./dry-run-fix-queue-contracts";

export type TeoyubeDryRunStabilizationStatus =
  | "safe_to_stabilize"
  | "owner_review_required"
  | "blocked"
  | "deferred"
  | "stabilized"
  | "verified"
  | "unknown";

export type TeoyubeDryRunStabilizationDecision =
  | "ready_for_safe_stabilization"
  | "owner_review_required"
  | "blocked"
  | "deferred"
  | "verified"
  | "empty"
  | "unknown";

export type TeoyubeDryRunStabilizationAction = {
  id: string;
  label: string;
  details: string;
  safeLocalOnly: boolean;
};

export type TeoyubeDryRunStabilizationRisk = {
  id: string;
  category: TeoyubeDryRunFixQueueCategory;
  severity: "low" | "medium" | "high" | "blocked";
  message: string;
  mitigation: string;
};

export type TeoyubeDryRunStabilizationSafetyChecks = {
  removesScriptureAnchors?: boolean;
  removesExplanationTraces?: boolean;
  weakensFallbackSafety?: boolean;
  removesConfidenceLabels?: boolean;
  hidesConsentPrivacyNotices?: boolean;
  enablesUnapprovedServices?: boolean;
  publishesReviewOnlyContent?: boolean;
  writesUnreviewedProductionJson?: boolean;
  storesRawSensitiveText?: boolean;
  addsBrowserPersistence?: boolean;
  createsHiddenPersonalization?: boolean;
  claimsDivineCertainty?: boolean;
  addsProfessionalAdviceLanguage?: boolean;
};

export type TeoyubeDryRunStabilizationItem = {
  id: string;
  fixQueueItemId: string;
  category: TeoyubeDryRunFixQueueCategory;
  title: string;
  status: TeoyubeDryRunStabilizationStatus;
  actions: TeoyubeDryRunStabilizationAction[];
  risks: TeoyubeDryRunStabilizationRisk[];
  safetyChecks: TeoyubeDryRunStabilizationSafetyChecks;
  regressionRequirements: string[];
};

export type TeoyubeDryRunStabilizationPlan = {
  id: string;
  queue: TeoyubeDryRunFixQueue;
  items: TeoyubeDryRunStabilizationItem[];
  manualOnly: true;
  inMemoryOnly: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noAutomaticPublishing: true;
  createdAt: string;
};

export type TeoyubeDryRunStabilizationResult = {
  itemId: string;
  status: TeoyubeDryRunStabilizationStatus;
  notes: string;
  verifiedManually: boolean;
};

export type TeoyubeDryRunStabilizationBlocker = {
  id: string;
  itemId?: string;
  category: TeoyubeDryRunFixQueueCategory;
  message: string;
  requiredAction: string;
};

export type TeoyubeDryRunStabilizationWarning = {
  id: string;
  itemId?: string;
  category: TeoyubeDryRunFixQueueCategory;
  message: string;
  recommendedAction: string;
};

export type TeoyubeDryRunStabilizationReport = {
  valid: boolean;
  decision: TeoyubeDryRunStabilizationDecision;
  plan: TeoyubeDryRunStabilizationPlan;
  blockers: TeoyubeDryRunStabilizationBlocker[];
  warnings: TeoyubeDryRunStabilizationWarning[];
  safeItemCount: number;
  ownerReviewItemCount: number;
  blockedItemCount: number;
  deferredItemCount: number;
  manualOnly: true;
  inMemoryOnly: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noAutomaticPublishing: true;
  generatedAt: string;
};

export type TeoyubeDryRunStabilizationPlanInput = {
  id?: string;
  queue?: TeoyubeDryRunFixQueue;
  fixItems?: TeoyubeDryRunFixQueueItem[];
};
