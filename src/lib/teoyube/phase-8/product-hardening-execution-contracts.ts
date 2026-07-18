import type {
  TeoyubeProductHardeningArea,
  TeoyubeProductHardeningVerificationRequirement as TeoyubeProductHardeningPlanVerificationRequirement
} from "./product-hardening-plan-contracts";
export type { TeoyubeProductHardeningVerificationRequirement } from "./product-hardening-plan-contracts";

export type TeoyubeProductHardeningExecutionStatus =
  | "planned"
  | "safe_to_apply"
  | "applied"
  | "verified"
  | "owner_review_required"
  | "blocked"
  | "deferred"
  | "unknown";

export type TeoyubeProductHardeningExecutionDecision =
  | "hardening_complete"
  | "hardening_complete_with_warnings"
  | "blocked"
  | "needs_owner_review"
  | "needs_regression_qa"
  | "unknown";

export type TeoyubeProductHardeningExecutionVerificationRequirement = TeoyubeProductHardeningPlanVerificationRequirement & {
  verified: boolean;
};

export type TeoyubeProductHardeningExecutionAction =
  | "apply_safe_patch"
  | "skip"
  | "block"
  | "defer"
  | "verify"
  | "owner_review";

export type TeoyubeProductHardeningExecutionItem = {
  id: string;
  sourcePlanItemId?: string;
  area: TeoyubeProductHardeningArea;
  title: string;
  summary: string;
  status: TeoyubeProductHardeningExecutionStatus;
  action: TeoyubeProductHardeningExecutionAction;
  file?: string;
  issueAddressed?: string;
  safetyReason?: string;
  skipReason?: string;
  blockedReason?: string;
  deferredReason?: string;
  ownerReviewRequired: boolean;
  regressionChecksRequired: string[];
  verificationRequirements: TeoyubeProductHardeningExecutionVerificationRequirement[];
  preservesScriptureAnchors: true;
  preservesExplanationTraces: true;
  preservesFallbackSafety: true;
  preservesConfidenceLabels: true;
  preservesPrivacyConsent: true;
  preservesReviewedContentGate: true;
  preservesDisabledServiceBoundary: true;
  preservesExistingPropsSupport: true;
  preservesMobileAccessibilityBasics: true;
  noExternalWrite: true;
  noAutomaticPublishing: true;
  noUserContact: true;
  inMemoryOnly: true;
};

export type TeoyubeProductHardeningExecutionResult = {
  id: string;
  itemId: string;
  action: TeoyubeProductHardeningExecutionAction;
  status: TeoyubeProductHardeningExecutionStatus;
  file?: string;
  issueAddressed: string;
  safetyReason: string;
  regressionChecksRequired: string[];
  verified: boolean;
  notes: string[];
};

export type TeoyubeProductHardeningExecutionRun = {
  id: string;
  items: TeoyubeProductHardeningExecutionItem[];
  results: TeoyubeProductHardeningExecutionResult[];
  summary: {
    totalItems: number;
    applied: number;
    skipped: number;
    blocked: number;
    deferred: number;
    ownerReviewRequired: number;
    verified: number;
  };
  noExternalSend: true;
  noFileWrite: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noUserContact: true;
  noAutomaticPublishing: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubeProductHardeningExecutionBlocker = {
  id: string;
  itemId?: string;
  area: TeoyubeProductHardeningArea | "unknown";
  message: string;
  requiredAction: string;
};

export type TeoyubeProductHardeningExecutionWarning = {
  id: string;
  itemId?: string;
  area: TeoyubeProductHardeningArea | "unknown";
  message: string;
  recommendedAction: string;
};

export type TeoyubeProductHardeningExecutionReport = {
  valid: boolean;
  decision: TeoyubeProductHardeningExecutionDecision;
  run: TeoyubeProductHardeningExecutionRun;
  blockers: TeoyubeProductHardeningExecutionBlocker[];
  warnings: TeoyubeProductHardeningExecutionWarning[];
  safePatchSummary: TeoyubeProductHardeningExecutionResult[];
  noExternalSend: true;
  noFileWrite: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noUserContact: true;
  noAutomaticPublishing: true;
  inMemoryOnly: true;
  generatedAt: string;
};
