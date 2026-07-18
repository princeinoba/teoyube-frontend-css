import {
  createManualPublicMonitoringPlan,
  createManualPublicMonitoringReport,
  createPhase92OwnerReviewRecord,
  createPhase92Package,
  createPhase92PackageReport,
  createPublicFeedbackReadinessReport,
  createPublicIssue,
  createPublicIssueTriageReport,
  createPublicReleaseCandidateMobileAccessibilityQaReport,
  createPublicReleaseCandidateQaPackage,
  createPublicReleaseCandidateQaPackageReport,
  createPublicReleaseCandidateQaReport,
  createPublicReleaseCandidateQaRun,
  createPublicReleaseCandidateSafetyQaReport,
  createPublicReleaseCandidateServiceDisabledQaReport,
  createPublicSupportReadinessReport,
  createReleaseCandidateReadinessScoreReport,
  getPublicReleaseCandidateQaScenarios,
  recordManualPublicMonitoringAreaResult,
  recordPublicReleaseCandidateQaAreaResult,
  runPhase92Audit
} from "../phase-9";

export function createPhase92PublicReleaseCandidateQaExample() {
  const scenarios = getPublicReleaseCandidateQaScenarios();
  let qaRun = createPublicReleaseCandidateQaRun({ scenarios });
  for (const scenario of scenarios) {
    qaRun = recordPublicReleaseCandidateQaAreaResult(qaRun, scenario.area, {
      passed: true,
      status: "passed",
      notes: [`${scenario.label} reviewed manually in the Phase 9.2 example.`]
    });
  }
  const qaReport = createPublicReleaseCandidateQaReport(qaRun);

  let monitoringPlan = createManualPublicMonitoringPlan();
  monitoringPlan = recordManualPublicMonitoringAreaResult(monitoringPlan, "app_load_manual", {
    passed: true,
    status: "passed",
    notes: ["Manual app load review recorded without fetching a public URL."]
  });
  const manualMonitoringReport = createManualPublicMonitoringReport(monitoringPlan);

  const supportReadinessReport = createPublicSupportReadinessReport();
  const triageReport = createPublicIssueTriageReport([
    createPublicIssue({
      id: "example_content_clarity",
      title: "Example content clarity note",
      category: "content_clarity",
      severity: "low",
      details: "Manual note kept in memory for owner review."
    })
  ]);
  const feedbackReadinessReport = createPublicFeedbackReadinessReport();
  const safetyQaReport = createPublicReleaseCandidateSafetyQaReport();
  const serviceDisabledQaReport = createPublicReleaseCandidateServiceDisabledQaReport();
  const mobileAccessibilityQaReport = createPublicReleaseCandidateMobileAccessibilityQaReport();
  const readinessScoreReport = createReleaseCandidateReadinessScoreReport();
  const publicReleaseCandidateQaPackage = createPublicReleaseCandidateQaPackage({
    publicReleaseCandidateQaReport: qaReport,
    manualPublicMonitoringReport,
    publicSupportReadinessReport: supportReadinessReport,
    publicIssueTriageReport: triageReport,
    publicFeedbackReadinessReport: feedbackReadinessReport,
    safetyQaReport,
    serviceDisabledQaReport,
    mobileAccessibilityQaReport,
    readinessScoreReport
  });
  const publicReleaseCandidateQaPackageReport = createPublicReleaseCandidateQaPackageReport(publicReleaseCandidateQaPackage);
  const ownerReview = createPhase92OwnerReviewRecord({
    reviewed: true,
    nextPhaseAccepted: true,
    notes: ["Phase 9.2 example owner review is manual and service-disabled."]
  });
  const phase92Package = createPhase92Package({ ownerReview, publicReleaseCandidateQaPackage });
  const phase92PackageReport = createPhase92PackageReport(phase92Package);
  const audit = runPhase92Audit();

  return {
    scenarios,
    qaRun,
    qaReport,
    manualMonitoringReport,
    supportReadinessReport,
    triageReport,
    feedbackReadinessReport,
    safetyQaReport,
    serviceDisabledQaReport,
    mobileAccessibilityQaReport,
    readinessScoreReport,
    publicReleaseCandidateQaPackageReport,
    ownerReview,
    phase92PackageReport,
    audit,
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true
  };
}
