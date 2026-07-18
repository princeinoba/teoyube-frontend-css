import type {
  TeoyubeProductStabilizationCategory,
  TeoyubeProductStabilizationQueueItemSource
} from "./product-stabilization-queue-contracts";

export type TeoyubeProductStabilizationPassStatus =
  | "planned"
  | "safe_to_apply"
  | "applied"
  | "verified"
  | "owner_review_required"
  | "blocked"
  | "deferred"
  | "unknown";

export type TeoyubeProductStabilizationPassAction =
  | "apply_safe_local_fix"
  | "verify_existing_fix"
  | "owner_review"
  | "block"
  | "defer"
  | "skip"
  | "unknown";

export type TeoyubeProductStabilizationPassDecision =
  | "stabilization_pass_complete"
  | "stabilization_pass_complete_with_warnings"
  | "blocked"
  | "needs_owner_review"
  | "needs_more_regression_qa"
  | "unknown";

export type TeoyubeProductStabilizationPassVerificationRequirement = {
  id: string;
  label: string;
  required: boolean;
  details: string;
};

export type TeoyubeProductStabilizationPassItem = {
  id: string;
  sourceItemId?: string;
  title: string;
  description: string;
  source: TeoyubeProductStabilizationQueueItemSource;
  category: TeoyubeProductStabilizationCategory;
  action: TeoyubeProductStabilizationPassAction;
  status: TeoyubeProductStabilizationPassStatus;
  ownerReviewRequired: boolean;
  safeLocalFixAllowed: boolean;
  blockedReason?: string;
  deferredReason?: string;
  verificationRequirements: TeoyubeProductStabilizationPassVerificationRequirement[];
  manualOnly: true;
  inMemoryOnly: true;
  noProductionDataWrite: true;
  noServiceConnection: true;
  noUserContact: true;
  noAutomaticPublishing: true;
  noFeedbackCollection: true;
  preservesScriptureAnchors: boolean;
  preservesExplanationTraces: boolean;
  preservesFallbackSafety: boolean;
  preservesConfidenceLabels: boolean;
  preservesPrivacyConsent: boolean;
  noDivineCertaintyClaimed: boolean;
  createdAt: string;
};

export type TeoyubeProductStabilizationPassResult = {
  itemId: string;
  action: TeoyubeProductStabilizationPassAction;
  status: TeoyubeProductStabilizationPassStatus;
  notes: string;
  verified: boolean;
  blocker: boolean;
  warning: boolean;
  manualOnly: true;
  inMemoryOnly: true;
  noFilesWritten: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noExternalServicesRequired: true;
  recordedAt: string;
};

export type TeoyubeProductStabilizationPass = {
  id: string;
  status: TeoyubeProductStabilizationPassStatus;
  items: TeoyubeProductStabilizationPassItem[];
  results: TeoyubeProductStabilizationPassResult[];
  manualOnly: true;
  inMemoryOnly: true;
  noFilesWritten: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noExternalServicesRequired: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noAutomaticPublishing: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noBrowserPersistenceRequired: true;
  createdAt: string;
  updatedAt: string;
};

export type TeoyubeProductStabilizationPassBlocker = {
  id: string;
  itemId?: string;
  category: TeoyubeProductStabilizationCategory;
  message: string;
  requiredAction: string;
};

export type TeoyubeProductStabilizationPassWarning = {
  id: string;
  itemId?: string;
  category: TeoyubeProductStabilizationCategory;
  message: string;
  recommendedAction: string;
};

export type TeoyubeProductStabilizationPassReport = {
  valid: boolean;
  decision: TeoyubeProductStabilizationPassDecision;
  pass: TeoyubeProductStabilizationPass;
  summary: {
    itemCount: number;
    appliedCount: number;
    verifiedCount: number;
    ownerReviewRequiredCount: number;
    blockedCount: number;
    deferredCount: number;
    warningCount: number;
  };
  blockers: TeoyubeProductStabilizationPassBlocker[];
  warnings: TeoyubeProductStabilizationPassWarning[];
  manualOnly: true;
  inMemoryOnly: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noExternalServicesRequired: true;
  noBrowserPersistenceRequired: true;
  generatedAt: string;
};
