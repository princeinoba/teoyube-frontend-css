import {
  addReleaseCandidateFixQueueItems,
  createFinalMobileAccessibilityRegressionReport,
  createFinalPrivacyConsentRegressionReport,
  createFinalPublicSafetyRegressionReport,
  createFinalRegressionQaReport,
  createFinalRegressionQaRun,
  createFinalServiceDisabledRegressionReport,
  createPhase93OwnerReviewRecord,
  createPhase93Package,
  createPhase93PackageReport,
  createPublicGoNoGoReadinessScoreReport,
  createPublicIssue,
  createPublicIssueToFixConversionReport,
  createReleaseCandidateFixQueue,
  createReleaseCandidateFixQueueItem,
  createReleaseCandidateFixQueueReport,
  createReleaseCandidateRemediationPackage,
  createReleaseCandidateRemediationPackageReport,
  createReleaseCandidateRemediationPlan,
  createReleaseCandidateRemediationPlanReport,
  createReleaseCandidateRemediationSafetyReport,
  FINAL_REGRESSION_QA_AREAS,
  recordFinalRegressionQaAreaResult,
  runPhase93Audit
} from "../phase-9";

export function createPhase93ReleaseCandidateFixQueueExample() {
  const publicIssues = [
    createPublicIssue({
      id: "example_public_copy_clarity",
      title: "Clarify public copy wording",
      category: "content_clarity",
      severity: "low",
      details: "Manual clarity note for public copy wording."
    })
  ];
  const conversionReport = createPublicIssueToFixConversionReport(publicIssues);
  const queue = addReleaseCandidateFixQueueItems(createReleaseCandidateFixQueue(), conversionReport.fixItems);
  const documentationFix = createReleaseCandidateFixQueueItem({
    id: "example_documentation_fix",
    title: "Document Phase 9.3 handoff",
    category: "documentation",
    priority: "low",
    status: "verified",
    riskLevel: "safe_local",
    source: "documentation",
    details: "Record Phase 9.3 handoff without changing production behavior."
  });
  const queueWithDocumentationFix = addReleaseCandidateFixQueueItems(queue, [documentationFix]);
  const queueReport = createReleaseCandidateFixQueueReport(queueWithDocumentationFix);
  const remediationPlan = createReleaseCandidateRemediationPlan({
    queue: queueWithDocumentationFix,
    safePatchSummary: [
      {
        filePath: "docs/teoyube/phase-9-3-release-candidate-fix-queue-final-regression-public-go-no-go-score.md",
        issueAddressed: "Document Phase 9.3 release candidate fix queue and final regression readiness.",
        whySafe: "Documentation-only update; no service, data, launch, or UI runtime behavior changed.",
        regressionChecksRequired: ["Phase 9.3 audit", "Phase 9.3 smoke check"]
      }
    ]
  });
  const remediationPlanReport = createReleaseCandidateRemediationPlanReport(remediationPlan);
  const remediationSafetyReport = createReleaseCandidateRemediationSafetyReport(remediationPlan);

  let finalRegressionRun = createFinalRegressionQaRun();
  for (const area of FINAL_REGRESSION_QA_AREAS) {
    finalRegressionRun = recordFinalRegressionQaAreaResult(finalRegressionRun, area, {
      passed: true,
      status: "passed",
      notes: [`${area} reviewed in the Phase 9.3 example.`]
    });
  }
  const finalRegressionQaReport = createFinalRegressionQaReport(finalRegressionRun);
  const serviceDisabledRegressionReport = createFinalServiceDisabledRegressionReport();
  const publicSafetyRegressionReport = createFinalPublicSafetyRegressionReport();
  const privacyConsentRegressionReport = createFinalPrivacyConsentRegressionReport();
  const mobileAccessibilityRegressionReport = createFinalMobileAccessibilityRegressionReport();
  const goNoGoReadinessScoreReport = createPublicGoNoGoReadinessScoreReport();
  const remediationPackage = createReleaseCandidateRemediationPackage({ publicIssues, fixQueue: queueWithDocumentationFix, remediationPlan });
  const remediationPackageReport = createReleaseCandidateRemediationPackageReport(remediationPackage);
  const ownerReview = createPhase93OwnerReviewRecord({
    reviewed: true,
    nextPhaseAccepted: true,
    notes: ["Phase 9.3 example owner review keeps the handoff manual and service-disabled."]
  });
  const phase93Package = createPhase93Package({ ownerReview, releaseCandidateRemediationPackage: remediationPackage });
  const phase93PackageReport = createPhase93PackageReport(phase93Package);
  const audit = runPhase93Audit();

  return {
    publicIssues,
    conversionReport,
    queueReport,
    remediationPlanReport,
    remediationSafetyReport,
    finalRegressionQaReport,
    serviceDisabledRegressionReport,
    publicSafetyRegressionReport,
    privacyConsentRegressionReport,
    mobileAccessibilityRegressionReport,
    goNoGoReadinessScoreReport,
    remediationPackageReport,
    ownerReview,
    phase93PackageReport,
    audit,
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true
  };
}
