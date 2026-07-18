import type { TeoyubeUserJourneyInput } from "../journey/user-journey-contracts";
import { createContentDepthMapReport } from "./content-depth-map";
import { createControlledServiceDecisionReport } from "./controlled-service-decision-plan";
import { createPhase41OwnerReviewRecord, createPhase41OwnerReviewReport, type TeoyubePhase41OwnerReviewRecord } from "./phase-4-1-owner-review";
import { createPhase4BacklogReport, createPhase4ProductBacklog } from "./phase-4-product-backlog";
import { createPhase4RiskRegister, createPhase4RiskRegisterReport, type TeoyubePhase4RiskRegister } from "./phase-4-risk-register";
import { createProductExperienceAuditReport } from "./product-experience-audit";
import { createProductSurfaceDepthReport } from "./product-surface-depth-audit";
import { createScripturePromiseCoverageReport } from "./scripture-promise-coverage-audit";

export type TeoyubePhase41PackageDecision =
  | "phase_4_1_complete"
  | "phase_4_1_complete_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubePhase41Package = {
  id: string;
  productExperienceAudit: ReturnType<typeof createProductExperienceAuditReport>;
  contentDepthMap: ReturnType<typeof createContentDepthMapReport>;
  scripturePromiseCoverageAudit: ReturnType<typeof createScripturePromiseCoverageReport>;
  productSurfaceDepthAudit: ReturnType<typeof createProductSurfaceDepthReport>;
  productBacklog: ReturnType<typeof createPhase4BacklogReport>;
  controlledServiceDecisionPlan: ReturnType<typeof createControlledServiceDecisionReport>;
  riskRegister: TeoyubePhase4RiskRegister;
  riskRegisterReport: ReturnType<typeof createPhase4RiskRegisterReport>;
  ownerReview: TeoyubePhase41OwnerReviewRecord;
  ownerReviewReport: ReturnType<typeof createPhase41OwnerReviewReport>;
  recommendedNextAction: "Phase 4.2 - Product Surface Polish, Content Expansion Backlog & Admin Workflow Design";
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubePhase41PackageReport = {
  valid: boolean;
  decision: TeoyubePhase41PackageDecision;
  blockers: string[];
  warnings: string[];
  phase41Package: TeoyubePhase41Package;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export function createPhase41Package(input: {
  journeyInput?: TeoyubeUserJourneyInput;
  ownerReview?: TeoyubePhase41OwnerReviewRecord;
  riskRegister?: TeoyubePhase4RiskRegister;
  ownerReviewed?: boolean;
} = {}): TeoyubePhase41Package {
  const journeyInput = input.journeyInput || { surface: "home" as const, wordId: "Benor" };
  const riskRegister = input.riskRegister || createPhase4RiskRegister();
  const ownerReview = input.ownerReview || createPhase41OwnerReviewRecord({ reviewed: input.ownerReviewed ?? false });
  const backlogItems = createPhase4ProductBacklog(journeyInput);

  return {
    id: "phase_4_1_package",
    productExperienceAudit: createProductExperienceAuditReport(journeyInput),
    contentDepthMap: createContentDepthMapReport(),
    scripturePromiseCoverageAudit: createScripturePromiseCoverageReport(),
    productSurfaceDepthAudit: createProductSurfaceDepthReport(journeyInput),
    productBacklog: createPhase4BacklogReport(backlogItems),
    controlledServiceDecisionPlan: createControlledServiceDecisionReport(),
    riskRegister,
    riskRegisterReport: createPhase4RiskRegisterReport(riskRegister),
    ownerReview,
    ownerReviewReport: createPhase41OwnerReviewReport(ownerReview),
    recommendedNextAction: "Phase 4.2 - Product Surface Polish, Content Expansion Backlog & Admin Workflow Design",
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}

export function getPhase41PackageBlockers(phase41Package: TeoyubePhase41Package): string[] {
  return [
    ...phase41Package.productExperienceAudit.blockers.map((entry) => entry.message),
    ...phase41Package.contentDepthMap.blockers,
    ...phase41Package.scripturePromiseCoverageAudit.blockers,
    ...phase41Package.productSurfaceDepthAudit.blockers.map((entry) => entry.message),
    ...(phase41Package.productBacklog.valid ? [] : ["Phase 4 product backlog is incomplete."]),
    ...phase41Package.controlledServiceDecisionPlan.blockers,
    ...phase41Package.riskRegisterReport.blockers
  ];
}

export function getPhase41PackageWarnings(phase41Package: TeoyubePhase41Package): string[] {
  return [
    ...phase41Package.productExperienceAudit.warnings.map((entry) => entry.message),
    ...phase41Package.contentDepthMap.warnings,
    ...phase41Package.scripturePromiseCoverageAudit.warnings,
    ...phase41Package.productSurfaceDepthAudit.warnings.map((entry) => entry.message),
    ...phase41Package.controlledServiceDecisionPlan.warnings,
    ...phase41Package.riskRegisterReport.warnings,
    ...phase41Package.ownerReviewReport.warnings
  ];
}

export function createPhase41PackageDecision(phase41Package: TeoyubePhase41Package): TeoyubePhase41PackageDecision {
  const blockers = getPhase41PackageBlockers(phase41Package);
  const warnings = getPhase41PackageWarnings(phase41Package);
  if (blockers.length) return "blocked";
  if (phase41Package.ownerReviewReport.blockers.length) return "needs_owner_review";
  return warnings.length ? "phase_4_1_complete_with_warnings" : "phase_4_1_complete";
}

export function validatePhase41Package(phase41Package: TeoyubePhase41Package): TeoyubePhase41PackageReport {
  return createPhase41PackageReport(phase41Package);
}

export function createPhase41PackageReport(phase41Package: TeoyubePhase41Package): TeoyubePhase41PackageReport {
  const blockers = getPhase41PackageBlockers(phase41Package);
  const warnings = getPhase41PackageWarnings(phase41Package);
  return {
    valid: blockers.length === 0,
    decision: createPhase41PackageDecision(phase41Package),
    blockers,
    warnings,
    phase41Package,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
