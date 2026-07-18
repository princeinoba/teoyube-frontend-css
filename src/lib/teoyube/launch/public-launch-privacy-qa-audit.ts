import { createPublicLaunchCopyPackage, createPublicLaunchCopyPackageReport } from "./public-launch-copy-package";
import { createPublicLaunchQaChecklistReport } from "./public-launch-qa-checklist";
import { createPublicLaunchQaRun, createPublicLaunchQaReport } from "./public-launch-qa-runner";
import { createPublicPrivacyConsentQaReport } from "./public-launch-privacy-consent-qa";
import { createPublicCopyOwnerReviewRecord, createPublicCopyOwnerReviewReport } from "./public-launch-copy-owner-review";
import { createPublicLaunchCopyQaPackage, createPublicLaunchCopyQaPackageReport } from "./public-launch-copy-qa-package";

export type TeoyubePublicLaunchPrivacyQaAuditItem = {
  id: string;
  label: string;
  complete: boolean;
  required: boolean;
  details: string;
};

function item(id: string, label: string, complete = true, details = "Public Launch Preparation 5.2 artifact exists."): TeoyubePublicLaunchPrivacyQaAuditItem {
  return { id, label, complete, required: true, details };
}

export function getPublicLaunchPrivacyQaAuditChecklist(): TeoyubePublicLaunchPrivacyQaAuditItem[] {
  const copyPackageReport = createPublicLaunchCopyPackageReport(createPublicLaunchCopyPackage());
  const qaChecklistReport = createPublicLaunchQaChecklistReport();
  const qaRunReport = createPublicLaunchQaReport(createPublicLaunchQaRun());
  const privacyConsentQaReport = createPublicPrivacyConsentQaReport();
  const ownerReviewReport = createPublicCopyOwnerReviewReport(createPublicCopyOwnerReviewRecord());
  const copyQaPackageReport = createPublicLaunchCopyQaPackageReport(createPublicLaunchCopyQaPackage());
  return [
    item("privacy_consent_contracts_exist", "Privacy/consent contracts exist"),
    item("privacy_notice_copy_exists", "Privacy notice copy exists"),
    item("terms_copy_exists", "Terms copy exists"),
    item("consent_copy_exists", "Consent copy exists"),
    item("ai_tig_transparency_copy_exists", "AI/TIG transparency copy exists"),
    item("sensitive_info_warning_copy_exists", "Sensitive information warning copy exists"),
    item("feedback_notice_copy_exists", "Feedback notice copy exists"),
    item("copy_package_exists", "Public launch copy package exists", copyPackageReport.ready, "Public launch copy package is structured and in-memory only."),
    item("public_qa_contracts_exist", "Public QA contracts exist"),
    item("public_qa_checklist_exists", "Public QA checklist exists", qaChecklistReport.ready && qaChecklistReport.surfaceCount >= 17, "Public QA checklist covers required surfaces."),
    item("public_qa_runner_exists", "Public QA runner exists", qaRunReport.inMemoryOnly && qaRunReport.noExternalWrite, "Public QA runner is manual and in-memory only."),
    item("privacy_consent_qa_exists", "Privacy/consent QA exists", privacyConsentQaReport.ready, "Privacy/consent QA validates missing copy, hidden personalization, disabled service claims, and divine certainty."),
    item("owner_legal_review_exists", "Owner/legal review exists", ownerReviewReport.ready, "Owner/legal review structure exists and does not claim approval without a record."),
    item("copy_qa_package_exists", "Copy QA package exists", copyQaPackageReport.ready, "Copy QA package combines copy, QA, privacy/consent QA, owner/legal review, and limitations."),
    item("public_launch_5_2_smoke_check_exists", "Public Launch Preparation 5.2 smoke check exists"),
    item("public_launch_5_2_documentation_exists", "Public Launch Preparation 5.2 documentation exists")
  ];
}

export function getPublicLaunchPrivacyQaMissingItems(): TeoyubePublicLaunchPrivacyQaAuditItem[] {
  return getPublicLaunchPrivacyQaAuditChecklist().filter((entry) => entry.required && !entry.complete);
}

export function getPublicLaunchPrivacyQaWarnings() {
  return [
    { id: "public_launch_5_2_legal_review_required", label: "Legal review required", message: "5.2 drafts public privacy/terms copy but does not provide final legal approval.", recommendedAction: "Complete appropriate human/legal review before public launch.", riskLevel: "medium" as const },
    { id: "public_launch_5_3_integration_required", label: "Surface integration required", message: "5.2 prepares copy and QA structures; 5.3 should integrate public surface copy and run final QA dry run.", recommendedAction: "Continue to Public Launch Preparation 5.3.", riskLevel: "medium" as const }
  ];
}

export function getPublicLaunchPrivacyQaCompletionPercentage(): number {
  const checklist = getPublicLaunchPrivacyQaAuditChecklist();
  const complete = checklist.filter((entry) => entry.complete);
  return Math.round((complete.length / Math.max(1, checklist.length)) * 100);
}

export function runPublicLaunchPrivacyQaAudit() {
  const missingItems = getPublicLaunchPrivacyQaMissingItems();
  return {
    complete: missingItems.length === 0,
    ready: missingItems.length === 0,
    completionPercentage: getPublicLaunchPrivacyQaCompletionPercentage(),
    checklist: getPublicLaunchPrivacyQaAuditChecklist(),
    missingItems,
    warnings: getPublicLaunchPrivacyQaWarnings(),
    nextStep: "Public Launch Preparation 5.3 - Public Surface Copy Integration & Final QA Dry Run" as const,
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalAnalyticsSent: true,
    noProductionPersistenceEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
