import {
  createDefaultReviewedContentItems,
  createPhase44OwnerReviewRecord,
  createPhase44OwnerReviewReport,
  createPhase44Package,
  createPhase44PackageReport,
  createPromiseTableCardGridViewModel,
  createPromiseTableMobileListViewModel,
  createPromiseTableScriptureFocusViewModel,
  createPromiseTableUxQaReport,
  createPromiseTableUxReport,
  createReviewedContentIntegrationGate,
  createReviewedContentIntegrationGateReport,
  createReviewedContentIntegrationPlan,
  createReviewedContentIntegrationPlanReport,
  createReviewedContentIntegrationQaReport,
  createReviewedContentReleaseCandidateReport,
  createReviewedContentReleaseCandidates,
  createReleaseCandidateFromReviewedItem,
  createTigGraphExperienceQaReport,
  createTigGraphExperienceReport,
  createTigGraphExperienceViewModel,
  createTigGraphGuidedTraceViewModel,
  createTigGraphMobileListViewModel,
  createTigGraphRelationshipListViewModel,
  runPhase44Audit,
  validateReviewedContentItem
} from "../phase-4";

export function runPhase44ReviewedContentIntegrationExample() {
  const reviewedContentItems = createDefaultReviewedContentItems(6);
  const reviewedContentGate = createReviewedContentIntegrationGate({ items: reviewedContentItems });
  const reviewedContentGateReport = createReviewedContentIntegrationGateReport(reviewedContentItems);
  const firstItemValidation = reviewedContentItems[0]
    ? validateReviewedContentItem(reviewedContentItems[0])
    : undefined;
  const firstReleaseCandidate = reviewedContentItems[0]
    ? createReleaseCandidateFromReviewedItem(reviewedContentItems[0])
    : undefined;
  const releaseCandidates = createReviewedContentReleaseCandidates({ items: reviewedContentItems });
  const releaseCandidateReport = createReviewedContentReleaseCandidateReport(releaseCandidates);
  const integrationPlan = createReviewedContentIntegrationPlan({ items: reviewedContentItems });
  const integrationPlanReport = createReviewedContentIntegrationPlanReport(integrationPlan);
  const promiseTableCardGrid = createPromiseTableCardGridViewModel({ maxRows: 8 });
  const promiseTableMobileList = createPromiseTableMobileListViewModel({ maxRows: 8 });
  const promiseTableScriptureFocus = createPromiseTableScriptureFocusViewModel({ maxRows: 8 });
  const promiseTableUxReport = createPromiseTableUxReport({ viewModel: promiseTableCardGrid });
  const tigGraphExperience = createTigGraphExperienceViewModel({ maxNodes: 30, maxEdges: 30 });
  const tigGraphGuidedTrace = createTigGraphGuidedTraceViewModel({ maxNodes: 20, maxEdges: 20 });
  const tigGraphRelationshipList = createTigGraphRelationshipListViewModel({ maxNodes: 20, maxEdges: 20 });
  const tigGraphMobileList = createTigGraphMobileListViewModel({ maxNodes: 20, maxEdges: 20 });
  const tigGraphExperienceReport = createTigGraphExperienceReport({ viewModel: tigGraphExperience });
  const reviewedContentQa = createReviewedContentIntegrationQaReport(reviewedContentGateReport);
  const promiseTableUxQa = createPromiseTableUxQaReport(promiseTableUxReport);
  const tigGraphExperienceQa = createTigGraphExperienceQaReport(tigGraphExperienceReport);
  const ownerReview = createPhase44OwnerReviewRecord();
  const ownerReviewReport = createPhase44OwnerReviewReport(ownerReview);
  const phase44Package = createPhase44Package({ ownerReview });
  const phase44PackageReport = createPhase44PackageReport(phase44Package);
  const phase44Audit = runPhase44Audit();

  return {
    reviewedContentItems,
    reviewedContentGate,
    reviewedContentGateReport,
    firstItemValidation,
    firstReleaseCandidate,
    releaseCandidates,
    releaseCandidateReport,
    integrationPlan,
    integrationPlanReport,
    promiseTableCardGrid,
    promiseTableMobileList,
    promiseTableScriptureFocus,
    promiseTableUxReport,
    tigGraphExperience,
    tigGraphGuidedTrace,
    tigGraphRelationshipList,
    tigGraphMobileList,
    tigGraphExperienceReport,
    reviewedContentQa,
    promiseTableUxQa,
    tigGraphExperienceQa,
    ownerReview,
    ownerReviewReport,
    phase44Package,
    phase44PackageReport,
    phase44Audit
  };
}
