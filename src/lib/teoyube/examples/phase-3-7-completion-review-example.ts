import { createPhase3CompletionPackage, createPhase3CompletionPackageReport } from "../integration/phase-3-completion-package";
import { createPhase3CompletionReport, runPhase3CompletionReview } from "../integration/phase-3-completion-review";
import { createPhase3FeatureInventoryReport } from "../integration/phase-3-feature-inventory";
import { runPhase3FinalIntegrationAudit } from "../integration/phase-3-final-integration-audit";
import { createPhase3IntegrationLock, createPhase3IntegrationLockReport } from "../integration/phase-3-integration-lock";
import { createPhase3OwnerReviewRecord, createPhase3OwnerReviewReport } from "../integration/phase-3-owner-review";
import {
  createPhase3RemainingRiskRegister,
  createPhase3RemainingRiskRegisterReport
} from "../integration/phase-3-remaining-risk-register";
import { createPhase4RoadmapReport } from "../integration/phase-4-roadmap-builder";

export function runPhase37CompletionReviewExample() {
  const completionChecklist = runPhase3CompletionReview();
  const completionReview = createPhase3CompletionReport();
  const integrationLock = createPhase3IntegrationLock();
  const integrationLockReport = createPhase3IntegrationLockReport();
  const featureInventory = createPhase3FeatureInventoryReport();
  const remainingRiskRegister = createPhase3RemainingRiskRegister();
  const remainingRiskReport = createPhase3RemainingRiskRegisterReport(remainingRiskRegister);
  const ownerReview = createPhase3OwnerReviewRecord();
  const ownerReviewReport = createPhase3OwnerReviewReport(ownerReview);
  const phase4Roadmap = createPhase4RoadmapReport();
  const completionPackage = createPhase3CompletionPackage({ ownerReview, riskRegister: remainingRiskRegister });
  const completionPackageReport = createPhase3CompletionPackageReport(completionPackage);
  const finalAudit = runPhase3FinalIntegrationAudit();

  return {
    completionChecklist,
    completionReview,
    integrationLock,
    integrationLockReport,
    featureInventory,
    remainingRiskRegister,
    remainingRiskReport,
    ownerReview,
    ownerReviewReport,
    phase4Roadmap,
    completionPackage,
    completionPackageReport,
    finalAudit
  };
}
