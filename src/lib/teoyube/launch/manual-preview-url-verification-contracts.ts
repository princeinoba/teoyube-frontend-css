import type { TeoyubeManualPreviewDeploymentProvider } from "./manual-preview-deployment-contracts";

export type TeoyubeManualPreviewUrlStatus =
  | "provided"
  | "missing"
  | "needs_review"
  | "invalid_format"
  | "production_domain_warning"
  | "verified_manually"
  | "unknown";

export type TeoyubeManualPreviewUrlRiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical"
  | "unknown";

export type TeoyubeManualPreviewUrlDecision =
  | "ready_for_postdeployment_qa"
  | "ready_after_manual_review"
  | "blocked_missing_url"
  | "blocked_invalid_url"
  | "needs_environment_review"
  | "unknown";

export type TeoyubeManualPreviewUrlWarning = {
  id: string;
  label: string;
  riskLevel: Exclude<TeoyubeManualPreviewUrlRiskLevel, "critical">;
  message: string;
  recommendedAction: string;
};

export type TeoyubeManualPreviewUrlBlocker = {
  id: string;
  label: string;
  riskLevel: "high" | "critical";
  reason: string;
  requiredAction: string;
};

export type TeoyubeManualPreviewUrlRecord = {
  id: string;
  previewUrl?: string;
  status: TeoyubeManualPreviewUrlStatus;
  provider: TeoyubeManualPreviewDeploymentProvider;
  environmentProfile: "preview" | "production_candidate" | "local" | "unknown";
  documentedForManualQa: boolean;
  reviewedManually: boolean;
  intentionallyProductionDomain: boolean;
  hardcodedIntoAppLogic: boolean;
  shouldFetchFromCode: false;
  shouldPersistExternally: false;
  createdAt: string;
  updatedAt: string;
};

export type TeoyubeManualPreviewUrlVerificationCheck = {
  id: string;
  label: string;
  required: boolean;
  passed: boolean;
  status: TeoyubeManualPreviewUrlStatus;
  details: string;
};

export type TeoyubeManualPreviewUrlVerificationResult = {
  checkId: string;
  status: TeoyubeManualPreviewUrlStatus;
  passed: boolean;
  summary: string;
  checkedAt: string;
};

export type TeoyubeManualPreviewUrlVerificationReport = {
  status: TeoyubeManualPreviewUrlStatus;
  valid: boolean;
  decision: TeoyubeManualPreviewUrlDecision;
  record: TeoyubeManualPreviewUrlRecord;
  checks: TeoyubeManualPreviewUrlVerificationCheck[];
  blockers: TeoyubeManualPreviewUrlBlocker[];
  warnings: TeoyubeManualPreviewUrlWarning[];
  noUrlFetched: true;
  noExternalWrite: true;
  generatedAt: string;
};
