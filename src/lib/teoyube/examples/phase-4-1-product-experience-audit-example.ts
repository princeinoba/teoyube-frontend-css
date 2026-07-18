import {
  createContentDepthMapReport,
  createControlledServiceDecisionReport,
  createPhase41OwnerReviewRecord,
  createPhase41OwnerReviewReport,
  createPhase41Package,
  createPhase41PackageReport,
  createPhase4BacklogReport,
  createPhase4ProductBacklog,
  createPhase4RiskRegister,
  createPhase4RiskRegisterReport,
  createProductExperienceAuditReport,
  createProductSurfaceDepthReport,
  createScripturePromiseCoverageReport,
  runPhase41Audit,
  runProductExperienceAudit,
  runProductSurfaceDepthAudit,
  runScripturePromiseCoverageAudit
} from "../phase-4";
import type { TeoyubeUserJourneyInput } from "../journey/user-journey-contracts";

export function runPhase41ProductExperienceAuditExample(input: TeoyubeUserJourneyInput = {}) {
  const journeyInput: TeoyubeUserJourneyInput = {
    surface: input.surface || "home",
    wordId: input.wordId || "Benor",
    query: input.query || "daily word calling purpose",
    prayerInput: input.prayerInput || "Scripture-grounded prayer",
    callingInput: input.callingInput || "calling purpose",
    clusterId: input.clusterId
  };
  const productExperienceChecks = runProductExperienceAudit(journeyInput);
  const productExperienceAudit = createProductExperienceAuditReport(journeyInput);
  const contentDepthMap = createContentDepthMapReport();
  const scripturePromiseCoverage = runScripturePromiseCoverageAudit();
  const scripturePromiseCoverageReport = createScripturePromiseCoverageReport();
  const surfaceDepthChecks = runProductSurfaceDepthAudit(journeyInput);
  const productSurfaceDepth = createProductSurfaceDepthReport(journeyInput);
  const productBacklogItems = createPhase4ProductBacklog(journeyInput);
  const productBacklog = createPhase4BacklogReport(productBacklogItems);
  const controlledServiceDecisionPlan = createControlledServiceDecisionReport();
  const riskRegister = createPhase4RiskRegister();
  const riskRegisterReport = createPhase4RiskRegisterReport(riskRegister);
  const ownerReview = createPhase41OwnerReviewRecord();
  const ownerReviewReport = createPhase41OwnerReviewReport(ownerReview);
  const phase41Package = createPhase41Package({ journeyInput, ownerReview, riskRegister });
  const phase41PackageReport = createPhase41PackageReport(phase41Package);
  const phase41Audit = runPhase41Audit();

  return {
    journeyInput,
    productExperienceChecks,
    productExperienceAudit,
    contentDepthMap,
    scripturePromiseCoverage,
    scripturePromiseCoverageReport,
    surfaceDepthChecks,
    productSurfaceDepth,
    productBacklogItems,
    productBacklog,
    controlledServiceDecisionPlan,
    riskRegister,
    riskRegisterReport,
    ownerReview,
    ownerReviewReport,
    phase41Package,
    phase41PackageReport,
    phase41Audit
  };
}
