import {
  convertSimulatedFeedbackToDryRunIssues,
  createDryRunDisabledServiceVerificationReport,
  createDryRunExecutionPackage,
  createDryRunExecutionPackageReport,
  createDryRunIssue,
  createDryRunIssueFromSimulatedFeedback,
  createDryRunIssueTriageReport,
  createDryRunMobileAccessibilityReport,
  createDryRunPauseRollbackReport,
  createDryRunReadinessScoreReport,
  createDryRunScriptureExplanationFallbackReport,
  createFeedbackIntakeSimulation,
  createFeedbackIntakeSimulationReport,
  createFeedbackToIssueSimulationReport,
  createManualBetaDryRun,
  createManualBetaDryRunReport,
  createPhase62OwnerReviewRecord,
  createPhase62OwnerReviewReport,
  createPhase62Package,
  createPhase62PackageReport,
  createSimulatedFeedbackItem,
  createSimulatedParticipantSession,
  createSimulatedParticipantSessionReport,
  getManualBetaDryRunScenarios,
  runPhase62Audit
} from "../phase-6";

export function runPhase62ManualBetaDryRunExample() {
  const dryRunScenarios = getManualBetaDryRunScenarios();
  const dryRun = createManualBetaDryRun({
    results: dryRunScenarios.map((scenario, index) => ({
      id: `example_dry_run_result_${index + 1}`,
      scenarioId: scenario.id,
      area: scenario.area,
      status: "passed",
      notes: "Example simulated dry-run step passed without launching beta or contacting users.",
      simulatedOnly: true,
      recordedAt: new Date().toISOString()
    }))
  });
  const dryRunReport = createManualBetaDryRunReport(dryRun);

  const participantSession = createSimulatedParticipantSession({
    observations: [{
      id: "example_simulated_participant_observation",
      surface: "manual_beta_dry_run",
      note: "Owner confirms the simulated participant saw limitations, privacy reminders, Scripture anchors, explanation paths, fallback states, and confidence labels.",
      sanitized: true,
      recordedByOwner: true,
      simulatedOnly: true,
      createdAt: new Date().toISOString()
    }]
  });
  const participantSessionReport = createSimulatedParticipantSessionReport(participantSession);

  const feedbackItem = createSimulatedFeedbackItem({
    id: "example_feedback_content_clarity",
    category: "content_clarity",
    note: "Simulated owner note: the Promise Table filter label could be clearer."
  });
  const feedbackSimulation = createFeedbackIntakeSimulation({ items: [feedbackItem] });
  const feedbackSimulationReport = createFeedbackIntakeSimulationReport(feedbackSimulation);
  const feedbackToIssueReport = createFeedbackToIssueSimulationReport(feedbackSimulation.items);
  const issueFromFeedback = createDryRunIssueFromSimulatedFeedback(feedbackItem);
  const convertedIssues = convertSimulatedFeedbackToDryRunIssues(feedbackSimulation.items);
  const ownerIssue = createDryRunIssue({
    id: "example_owner_content_clarity_issue",
    title: "Example owner clarity note",
    description: "Manual owner review should clarify one scenario label.",
    category: "content_clarity",
    source: "owner_observation"
  });
  const issueTriageReport = createDryRunIssueTriageReport([...convertedIssues, ownerIssue]);

  const pauseRollbackReport = createDryRunPauseRollbackReport(issueTriageReport.issues);
  const disabledServiceVerificationReport = createDryRunDisabledServiceVerificationReport();
  const scriptureExplanationFallbackReport = createDryRunScriptureExplanationFallbackReport();
  const mobileAccessibilityReport = createDryRunMobileAccessibilityReport();
  const readinessScoreReport = createDryRunReadinessScoreReport({
    issues: issueTriageReport.issues,
    feedbackItems: feedbackSimulation.items
  });

  const dryRunExecutionPackage = createDryRunExecutionPackage({
    dryRun,
    participantSession,
    feedbackSimulation
  });
  const dryRunExecutionPackageReport = createDryRunExecutionPackageReport(dryRunExecutionPackage);
  const ownerReviewRecord = createPhase62OwnerReviewRecord({ reviewed: true });
  const ownerReviewReport = createPhase62OwnerReviewReport(ownerReviewRecord);
  const phase62Package = createPhase62Package({
    dryRunExecutionPackage,
    ownerReview: ownerReviewRecord
  });
  const phase62PackageReport = createPhase62PackageReport(phase62Package);
  const phase62Audit = runPhase62Audit();

  return {
    dryRunScenarios,
    dryRun,
    dryRunReport,
    participantSession,
    participantSessionReport,
    feedbackSimulation,
    feedbackSimulationReport,
    feedbackToIssueReport,
    issueFromFeedback,
    convertedIssues,
    ownerIssue,
    issueTriageReport,
    pauseRollbackReport,
    disabledServiceVerificationReport,
    scriptureExplanationFallbackReport,
    mobileAccessibilityReport,
    readinessScoreReport,
    dryRunExecutionPackage,
    dryRunExecutionPackageReport,
    ownerReviewRecord,
    ownerReviewReport,
    phase62Package,
    phase62PackageReport,
    phase62Audit
  };
}
