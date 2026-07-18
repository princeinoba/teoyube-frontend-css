import type { TeoyubeBetaFixQueue, TeoyubeBetaFixQueueCategory, TeoyubeBetaFixQueueItem } from "./beta-fix-queue-contracts";

export type TeoyubeReadinessRemediationStatus =
  | "safe_to_remediate"
  | "owner_review_required"
  | "blocked"
  | "deferred"
  | "remediated"
  | "verified"
  | "unknown";

export type TeoyubeReadinessRemediationDecision =
  | "ready_for_safe_remediation"
  | "owner_review_required"
  | "blocked"
  | "deferred"
  | "verified"
  | "empty"
  | "unknown";

export type TeoyubeReadinessRemediationAction = {
  id: string;
  label: string;
  details: string;
  safeLocalOnly: boolean;
};

export type TeoyubeReadinessRemediationRisk = {
  id: string;
  category: TeoyubeBetaFixQueueCategory;
  severity: "low" | "medium" | "high" | "blocked";
  message: string;
  mitigation: string;
};

export type TeoyubeReadinessRemediationSafetyChecks = {
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

export type TeoyubeReadinessRemediationItem = {
  id: string;
  fixQueueItemId: string;
  category: TeoyubeBetaFixQueueCategory;
  title: string;
  status: TeoyubeReadinessRemediationStatus;
  actions: TeoyubeReadinessRemediationAction[];
  risks: TeoyubeReadinessRemediationRisk[];
  safetyChecks: TeoyubeReadinessRemediationSafetyChecks;
  regressionRequirements: string[];
};

export type TeoyubeReadinessRemediationPlan = {
  id: string;
  queue: TeoyubeBetaFixQueue;
  items: TeoyubeReadinessRemediationItem[];
  manualOnly: true;
  inMemoryOnly: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noUsersContacted: true;
  noAutomaticPublishing: true;
  createdAt: string;
};

export type TeoyubeReadinessRemediationResult = {
  itemId: string;
  status: TeoyubeReadinessRemediationStatus;
  notes: string;
  verifiedManually: boolean;
};

export type TeoyubeReadinessRemediationBlocker = {
  id: string;
  itemId?: string;
  category: TeoyubeBetaFixQueueCategory;
  message: string;
  requiredAction: string;
};

export type TeoyubeReadinessRemediationWarning = {
  id: string;
  itemId?: string;
  category: TeoyubeBetaFixQueueCategory;
  message: string;
  recommendedAction: string;
};

export type TeoyubeReadinessRemediationReport = {
  valid: boolean;
  decision: TeoyubeReadinessRemediationDecision;
  plan: TeoyubeReadinessRemediationPlan;
  blockers: TeoyubeReadinessRemediationBlocker[];
  warnings: TeoyubeReadinessRemediationWarning[];
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
  noAutomaticPublishing: true;
  generatedAt: string;
};

export type TeoyubeReadinessRemediationPlanInput = {
  id?: string;
  queue?: TeoyubeBetaFixQueue;
  fixItems?: TeoyubeBetaFixQueueItem[];
};
