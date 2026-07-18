import { runPhase7MobileScaleCompletionAudit } from "../phase-7-mobile-scale-completion-audit";
import { runPhase7MobileScaleSafetyCheck } from "../phase-7-mobile-scale-safety-check";
import { createPhase7SurfaceReadinessReport } from "../phase-7-surface-readiness-report";
import { createProductionLaunchPreparationReport } from "../production-launch-preparation-plan";
import { getTeoyubeRoadmapCompletionSummary } from "../teoyube-roadmap-completion-summary";

export function runPhase7FinalCompletionExample() {
  const completionAudit = runPhase7MobileScaleCompletionAudit();
  const safetyCheck = runPhase7MobileScaleSafetyCheck();
  const surfaceReadiness = createPhase7SurfaceReadinessReport();
  const productionLaunchPreparation = createProductionLaunchPreparationReport();
  const roadmapCompletionSummary = getTeoyubeRoadmapCompletionSummary();

  return {
    completionAudit,
    safetyCheck,
    surfaceReadiness,
    productionLaunchPreparation,
    roadmapCompletionSummary,
    launchPreparationReady:
      completionAudit.launchPreparationReady &&
      productionLaunchPreparation.readyToBegin &&
      roadmapCompletionSummary.nextRecommendedStage === "Soft Launch Preparation"
  };
}
