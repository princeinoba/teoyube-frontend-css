import { runSoftLaunchCompletionReview } from "../soft-launch-completion-review";
import { createSoftLaunchFeedbackSummaryReport } from "../soft-launch-feedback-summary";
import { createSoftLaunchIssueClosureReport } from "../soft-launch-issue-closure";
import { runSoftLaunchStabilityCertification } from "../soft-launch-stability-certification";
import { runSoftLaunchFinalSafetyPrivacyReview } from "../soft-launch-final-safety-privacy-review";
import { createPublicLaunchReadinessCriteriaReport } from "../public-launch-readiness-criteria";
import { createPublicLaunchReadinessPackage, createPublicLaunchReadinessPackageReport } from "../public-launch-readiness-package";
import { addPublicLaunchRisk, createPublicLaunchRiskRegister, createPublicLaunchRiskRegisterReport } from "../public-launch-risk-register";
import { createPublicLaunchKnownLimitationsReport } from "../public-launch-known-limitations";
import { createPublicLaunchOwnerReadinessRecord, createPublicLaunchOwnerReadinessReport } from "../public-launch-owner-readiness-review";
import { createPublicLaunchReadinessHandoff, createPublicLaunchReadinessHandoffReport } from "../public-launch-readiness-handoff";
import { runSoftLaunchCompletionAudit } from "../soft-launch-completion-audit";

export function runLimitedSoftLaunchExecution45Example() {
  const completionReview = runSoftLaunchCompletionReview();
  const feedbackSummary = createSoftLaunchFeedbackSummaryReport();
  const issueClosure = createSoftLaunchIssueClosureReport();
  const stabilityCertification = runSoftLaunchStabilityCertification({
    feedbackSummaryReport: feedbackSummary,
    issueClosureReport: issueClosure
  });
  const finalSafetyPrivacyReview = runSoftLaunchFinalSafetyPrivacyReview();
  const readinessCriteria = createPublicLaunchReadinessCriteriaReport({
    completionReport: completionReview,
    feedbackSummaryReport: feedbackSummary,
    issueClosureReport: issueClosure,
    stabilityCertificationReport: stabilityCertification,
    finalSafetyPrivacyReport: finalSafetyPrivacyReview
  });
  const readinessPackage = createPublicLaunchReadinessPackage({
    completionReport: completionReview,
    feedbackSummaryReport: feedbackSummary,
    issueClosureReport: issueClosure,
    stabilityCertificationReport: stabilityCertification,
    finalSafetyPrivacyReport: finalSafetyPrivacyReview,
    readinessCriteriaReport: readinessCriteria
  });
  const readinessPackageReport = createPublicLaunchReadinessPackageReport(readinessPackage);
  const riskRegister = addPublicLaunchRisk(createPublicLaunchRiskRegister(), {
    id: "example_privacy_terms_review",
    category: "privacy",
    label: "Privacy/legal content review required before public launch",
    severity: "medium",
    status: "accepted",
    mitigation: "Complete public launch privacy/legal content review during Public Launch Preparation 5.1.",
    ownerReviewRequired: true
  });
  const riskRegisterReport = createPublicLaunchRiskRegisterReport(riskRegister);
  const knownLimitationsReport = createPublicLaunchKnownLimitationsReport();
  const ownerReadinessReport = createPublicLaunchOwnerReadinessReport(createPublicLaunchOwnerReadinessRecord());
  const handoff = createPublicLaunchReadinessHandoff();
  const handoffReport = createPublicLaunchReadinessHandoffReport();
  const audit = runSoftLaunchCompletionAudit();

  return {
    completionReview,
    feedbackSummary,
    issueClosure,
    stabilityCertification,
    finalSafetyPrivacyReview,
    readinessCriteria,
    readinessPackageReport,
    riskRegisterReport,
    knownLimitationsReport,
    ownerReadinessReport,
    handoff,
    handoffReport,
    audit
  };
}
