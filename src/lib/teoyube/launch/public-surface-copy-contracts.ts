import type { TeoyubePublicNoticeType } from "./public-launch-privacy-consent-contracts";
import type {
  TeoyubePublicLaunchQaDecision,
  TeoyubePublicLaunchQaStatus,
  TeoyubePublicLaunchQaSurface
} from "./public-launch-qa-contracts";

export type TeoyubePublicSurfaceCopyStatus =
  | "ready"
  | "ready_with_warnings"
  | "missing"
  | "needs_review"
  | "blocked"
  | "not_applicable"
  | "unknown";

export type TeoyubePublicNoticePlacement =
  | "page"
  | "banner"
  | "inline"
  | "below_input"
  | "near_recommendation"
  | "footer"
  | "modal"
  | "unknown";

export type TeoyubePublicNoticeVisibility =
  | "visible"
  | "available_by_link"
  | "hidden"
  | "missing"
  | "unknown";

export type TeoyubePublicNoticeReviewStatus =
  | "draft"
  | "owner_reviewed"
  | "legal_reviewed"
  | "needs_review"
  | "blocked"
  | "unknown";

export type TeoyubePublicSurfaceCopyRequirement = {
  id: string;
  surface: TeoyubePublicLaunchQaSurface;
  noticeType: TeoyubePublicNoticeType;
  label: string;
  required: boolean;
  launchCritical: boolean;
  placement: TeoyubePublicNoticePlacement;
  visibility: TeoyubePublicNoticeVisibility;
  status: TeoyubePublicSurfaceCopyStatus;
  copySource: "public_launch_5_2" | "public_surface_5_3" | "component" | "route" | "unknown";
  details: string;
};

export type TeoyubePublicSurfaceCopyIntegration = {
  id: string;
  surface: TeoyubePublicLaunchQaSurface;
  label: string;
  route: string;
  component: string;
  requirements: TeoyubePublicSurfaceCopyRequirement[];
  integrated: boolean;
  ownerReviewStatus: TeoyubePublicNoticeReviewStatus;
  accessibilityStatus: TeoyubePublicLaunchQaStatus;
  manualOnly: true;
  noExternalWrite: true;
};

export type TeoyubePublicSurfaceCopyBlocker = {
  id: string;
  surface: TeoyubePublicLaunchQaSurface;
  noticeType: TeoyubePublicNoticeType;
  label: string;
  reason: string;
  requiredAction: string;
  riskLevel: "high" | "critical";
};

export type TeoyubePublicSurfaceCopyWarning = {
  id: string;
  surface: TeoyubePublicLaunchQaSurface;
  noticeType: TeoyubePublicNoticeType;
  label: string;
  message: string;
  recommendedAction: string;
  riskLevel: "low" | "medium" | "high";
};

export type TeoyubePublicSurfaceCopyIntegrationReport = {
  valid: boolean;
  ready: boolean;
  decision: TeoyubePublicLaunchQaDecision | "ready_for_final_qa_dry_run";
  integrationCount: number;
  readyIntegrationCount: number;
  requirementCount: number;
  visibleNoticeCount: number;
  integrations: TeoyubePublicSurfaceCopyIntegration[];
  blockers: TeoyubePublicSurfaceCopyBlocker[];
  warnings: TeoyubePublicSurfaceCopyWarning[];
  draftOnly: true;
  notLegalAdvice: true;
  manualOnly: true;
  inMemoryOnly: true;
  noPublicLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalAnalyticsSent: true;
  noProductionPersistenceEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noExternalWrite: true;
  generatedAt: string;
};
