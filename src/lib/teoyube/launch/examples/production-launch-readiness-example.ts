import { createLaunchDecision } from "../launch-decision-helper";
import { createLaunchQualityGateReport } from "../launch-quality-gates";
import { createLaunchSafetyReviewReport } from "../launch-safety-review";
import { createLaunchSurfaceReadinessReport } from "../launch-surface-readiness-report";
import { runProductionLaunchReadinessAudit } from "../production-launch-readiness-audit";

export function createProductionLaunchReadinessExample() {
  const audit = runProductionLaunchReadinessAudit();

  return {
    audit,
    safety: createLaunchSafetyReviewReport(),
    surfaces: createLaunchSurfaceReadinessReport(),
    qualityGates: createLaunchQualityGateReport(),
    decision: createLaunchDecision(audit),
    currentStage: "Production Launch Preparation",
    currentStep: "1.1 - Pre-Launch Readiness Audit & Safe Launch Plan",
    nextRecommendedStep: audit.recommendedNextStep
  };
}

