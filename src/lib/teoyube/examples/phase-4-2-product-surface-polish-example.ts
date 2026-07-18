import {
  createAdminContentWorkflowDesign,
  createAdminContentWorkflowDesignReport,
  createAdminWorkflowServiceRequirementsReport,
  createContentExpansionBacklog,
  createContentExpansionBacklogReport,
  createPhase42OwnerReviewRecord,
  createPhase42OwnerReviewReport,
  createPhase42Package,
  createPhase42PackageReport,
  createPrayerCallingContentReviewReport,
  createProductSurfacePolishPlan,
  createProductSurfacePolishPlanReport,
  createScripturePromiseContentReviewWorkflow,
  createScripturePromiseReviewReport,
  runPhase42Audit
} from "../phase-4";

export function runPhase42ProductSurfacePolishExample() {
  const productSurfacePolishPlan = createProductSurfacePolishPlan();
  const productSurfacePolishReport = createProductSurfacePolishPlanReport(productSurfacePolishPlan);
  const contentExpansionBacklogItems = createContentExpansionBacklog();
  const contentExpansionBacklog = createContentExpansionBacklogReport(contentExpansionBacklogItems);
  const scripturePromiseReviewWorkflow = createScripturePromiseContentReviewWorkflow();
  const scripturePromiseReviewReport = createScripturePromiseReviewReport();
  const prayerCallingReviewReport = createPrayerCallingContentReviewReport();
  const adminContentWorkflowDesign = createAdminContentWorkflowDesign();
  const adminContentWorkflowDesignReport = createAdminContentWorkflowDesignReport();
  const adminWorkflowServiceRequirements = createAdminWorkflowServiceRequirementsReport();
  const ownerReview = createPhase42OwnerReviewRecord();
  const ownerReviewReport = createPhase42OwnerReviewReport(ownerReview);
  const phase42Package = createPhase42Package({ ownerReview });
  const phase42PackageReport = createPhase42PackageReport(phase42Package);
  const phase42Audit = runPhase42Audit();

  return {
    productSurfacePolishPlan,
    productSurfacePolishReport,
    contentExpansionBacklogItems,
    contentExpansionBacklog,
    scripturePromiseReviewWorkflow,
    scripturePromiseReviewReport,
    prayerCallingReviewReport,
    adminContentWorkflowDesign,
    adminContentWorkflowDesignReport,
    adminWorkflowServiceRequirements,
    ownerReview,
    ownerReviewReport,
    phase42Package,
    phase42PackageReport,
    phase42Audit
  };
}
