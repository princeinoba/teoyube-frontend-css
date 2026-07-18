import { createPublicCopyAccessibilityQaReport } from "./public-copy-accessibility-qa";
import { createPublicCopyIntegrationPackage, createPublicCopyIntegrationPackageReport } from "./public-copy-integration-package";
import { createPublicCopyUiAdapterReport } from "./public-copy-ui-adapter";
import { createPublicQaDryRun, createPublicQaDryRunReport } from "./public-qa-dry-run-runner";
import { createPublicSurfaceCopyOwnerReviewRecord, createPublicSurfaceCopyOwnerReviewReport } from "./public-surface-copy-owner-review";
import { createPublicSurfaceCopyRegistryReport } from "./public-surface-copy-registry";
import { createPublicSurfaceFinalQaChecklistReport } from "./public-surface-final-qa-checklist";
import { validatePublicSurfaceCopyIntegration } from "./public-surface-copy-integration-validator";

export type TeoyubePublicSurfaceCopyIntegrationAuditItem = {
  id: string;
  label: string;
  complete: boolean;
  required: boolean;
  details: string;
};

function item(id: string, label: string, complete = true, details = "Public Launch Preparation 5.3 artifact exists."): TeoyubePublicSurfaceCopyIntegrationAuditItem {
  return { id, label, complete, required: true, details };
}

export function getPublicSurfaceCopyIntegrationAuditChecklist(): TeoyubePublicSurfaceCopyIntegrationAuditItem[] {
  const registry = createPublicSurfaceCopyRegistryReport();
  const adapter = createPublicCopyUiAdapterReport();
  const validation = validatePublicSurfaceCopyIntegration();
  const checklist = createPublicSurfaceFinalQaChecklistReport();
  const dryRun = createPublicQaDryRunReport(createPublicQaDryRun());
  const accessibility = createPublicCopyAccessibilityQaReport();
  const owner = createPublicSurfaceCopyOwnerReviewReport(createPublicSurfaceCopyOwnerReviewRecord());
  const pkg = createPublicCopyIntegrationPackage();
  const packageReport = createPublicCopyIntegrationPackageReport(pkg);

  return [
    item("public_surface_copy_contracts_exist", "Public surface copy contracts exist"),
    item("public_surface_copy_registry_exists", "Public surface copy registry exists", registry.ready && registry.requirementCount >= 20, "Registry maps public notices to TIG, onboarding, feedback, privacy/terms, fallback, and offline surfaces."),
    item("public_copy_ui_adapter_exists", "Public copy UI adapter exists", adapter.ready && adapter.adaptedNoticeTypes.length >= 8, "UI adapter converts 5.2 copy package into notice card props."),
    item("public_surface_copy_validator_exists", "Public surface copy validator exists", validation.ready && validation.noExternalWrite, "Validator checks visible notices and no launch/provider side effects."),
    item("public_final_qa_checklist_exists", "Public final QA checklist exists", checklist.ready && checklist.checkCount >= 14, "Final QA dry-run checklist covers public notice integration and no side effects."),
    item("public_final_qa_dry_run_exists", "Public final QA dry run exists", dryRun.ready && dryRun.noExternalWrite, "Dry run is manual, in-memory, and does not launch or contact users."),
    item("public_copy_accessibility_qa_exists", "Public copy accessibility QA exists", accessibility.ready, "Accessibility QA covers semantic structure, links, contrast, mobile wrapping, and visible required copy."),
    item("public_surface_owner_review_exists", "Public surface owner review exists", owner.ready && owner.noLegalFinalApprovalClaimedWithoutRecord, "Owner review is manual and does not claim legal approval without a record."),
    item("public_copy_integration_package_exists", "Public copy integration package exists", packageReport.ready && packageReport.noPublicLaunchPerformed, "Package combines registry, adapter, validation, dry run, accessibility QA, owner review, and no-side-effect assertions."),
    item("public_launch_5_3_smoke_check_exists", "Public Launch Preparation 5.3 smoke check exists"),
    item("public_launch_5_3_documentation_exists", "Public Launch Preparation 5.3 documentation exists")
  ];
}

export function getPublicSurfaceCopyIntegrationMissingItems(): TeoyubePublicSurfaceCopyIntegrationAuditItem[] {
  return getPublicSurfaceCopyIntegrationAuditChecklist().filter((entry) => entry.required && !entry.complete);
}

export function getPublicSurfaceCopyIntegrationWarnings() {
  return [
    {
      id: "public_launch_5_3_legal_review_required",
      label: "Legal review required",
      message: "5.3 integrates draft public privacy/terms copy but does not provide final legal approval.",
      recommendedAction: "Complete appropriate human/legal review before public launch.",
      riskLevel: "medium" as const
    },
    {
      id: "public_launch_5_4_go_no_go_required",
      label: "Public launch go/no-go package required",
      message: "5.3 completes copy integration and final QA dry-run scaffolding; 5.4 should prepare the public launch go/no-go package.",
      recommendedAction: "Continue to Public Launch Preparation 5.4.",
      riskLevel: "medium" as const
    }
  ];
}

export function getPublicSurfaceCopyIntegrationCompletionPercentage(): number {
  const checklist = getPublicSurfaceCopyIntegrationAuditChecklist();
  const complete = checklist.filter((entry) => entry.complete);
  return Math.round((complete.length / Math.max(1, checklist.length)) * 100);
}

export function runPublicSurfaceCopyIntegrationAudit() {
  const missingItems = getPublicSurfaceCopyIntegrationMissingItems();
  return {
    complete: missingItems.length === 0,
    ready: missingItems.length === 0,
    completionPercentage: getPublicSurfaceCopyIntegrationCompletionPercentage(),
    checklist: getPublicSurfaceCopyIntegrationAuditChecklist(),
    missingItems,
    warnings: getPublicSurfaceCopyIntegrationWarnings(),
    nextStep: "Public Launch Preparation 5.4 - Public Launch Go/No-Go Package" as const,
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
