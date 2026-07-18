import {
  createBetaControlledAdminQaReport,
  createBetaDisabledServiceQaReport,
  createBetaIssue,
  createBetaIssueTriageExecutionReport,
  createBetaMobileAccessibilityQaReport,
  createBetaQaExecutionPackage,
  createBetaQaExecutionPackageReport,
  createBetaReadinessScoreReport,
  createBetaRealDataQaReport,
  createBetaReviewedContentGateQaReport,
  createBetaScriptureExplanationFallbackQaReport,
  createBetaUserJourneyQaReport,
  createManualBetaQaExecutionReport,
  createManualBetaQaExecutionRun,
  createPhase52OwnerReviewRecord,
  createPhase52OwnerReviewReport,
  createPhase52Package,
  createPhase52PackageReport,
  recordManualBetaQaAreaResult,
  runPhase52Audit
} from "../phase-5";

export function runPhase52ManualBetaQaExecutionExample() {
  const manualRun = createManualBetaQaExecutionRun();
  const manualRunWithResult = recordManualBetaQaAreaResult(manualRun, "word_card", {
    status: "passed",
    notes: "Manual reviewer confirmed WordCard keeps Scripture anchors, related promise context, confidence boundary, and safe fallback.",
    blocker: false,
    warning: false,
    evidence: []
  });
  const manualBetaQaExecutionReport = createManualBetaQaExecutionReport(manualRunWithResult);
  const realDataQaReport = createBetaRealDataQaReport();
  const userJourneyQaReport = createBetaUserJourneyQaReport();
  const scriptureExplanationFallbackQaReport = createBetaScriptureExplanationFallbackQaReport();
  const mobileAccessibilityQaReport = createBetaMobileAccessibilityQaReport();
  const reviewedContentGateQaReport = createBetaReviewedContentGateQaReport();
  const controlledAdminQaReport = createBetaControlledAdminQaReport();
  const disabledServiceQaReport = createBetaDisabledServiceQaReport();
  const betaIssue = createBetaIssue({
    title: "Confidence label spacing needs owner polish",
    description: "Manual QA note: confidence label is visible but could use copy polish.",
    category: "content_clarity",
    severity: "informational",
    source: "manual_qa",
    surface: "tig_response_panel"
  });
  const issueTriageReport = createBetaIssueTriageExecutionReport([betaIssue]);
  const readinessScoreReport = createBetaReadinessScoreReport({
    blockerCountByArea: {
      real_data: realDataQaReport.blockers.length,
      user_journey: userJourneyQaReport.blockers.length,
      scripture_anchor: scriptureExplanationFallbackQaReport.blockers.length,
      explanation_trace: scriptureExplanationFallbackQaReport.blockers.length,
      fallback: scriptureExplanationFallbackQaReport.blockers.length,
      confidence_label: scriptureExplanationFallbackQaReport.blockers.length,
      mobile: mobileAccessibilityQaReport.blockers.length,
      accessibility: mobileAccessibilityQaReport.blockers.length,
      reviewed_content_gate: reviewedContentGateQaReport.blockers.length,
      controlled_admin: controlledAdminQaReport.blockers.length,
      disabled_services: disabledServiceQaReport.blockers.length,
      privacy_consent: disabledServiceQaReport.blockers.length,
      issue_triage: issueTriageReport.blockers.length
    }
  });
  const betaQaExecutionPackage = createBetaQaExecutionPackage({
    manualBetaQaExecutionReport,
    realDataQaReport,
    userJourneyQaReport,
    scriptureExplanationFallbackQaReport,
    mobileAccessibilityQaReport,
    reviewedContentGateQaReport,
    controlledAdminQaReport,
    disabledServiceQaReport,
    issueTriageReport,
    readinessScoreReport
  });
  const betaQaExecutionPackageReport = createBetaQaExecutionPackageReport(betaQaExecutionPackage);
  const ownerReview = createPhase52OwnerReviewRecord();
  const ownerReviewReport = createPhase52OwnerReviewReport(ownerReview);
  const phase52Package = createPhase52Package({
    betaQaExecutionPackage,
    ownerReview
  });
  const phase52PackageReport = createPhase52PackageReport(phase52Package);
  const phase52Audit = runPhase52Audit();

  return {
    manualRun,
    manualRunWithResult,
    manualBetaQaExecutionReport,
    realDataQaReport,
    userJourneyQaReport,
    scriptureExplanationFallbackQaReport,
    mobileAccessibilityQaReport,
    reviewedContentGateQaReport,
    controlledAdminQaReport,
    disabledServiceQaReport,
    betaIssue,
    issueTriageReport,
    readinessScoreReport,
    betaQaExecutionPackage,
    betaQaExecutionPackageReport,
    ownerReview,
    ownerReviewReport,
    phase52Package,
    phase52PackageReport,
    phase52Audit
  };
}
