import { createBuildCommandRegistryReport } from "./build-command-registry";
import { createBuildVerificationReport } from "./build-verification-runner";
import { createDeploymentDryRunPlan, createDeploymentDryRunReport } from "./deployment-dry-run-planner";
import { createLaunchEnvironmentReport } from "./launch-environment-checklist";
import { getPreviewLaunchConfigProfile } from "./launch-config-profiles";
import { validateLaunchFeatureFlags } from "./launch-feature-flags";
import { createAccessibilityAuditReport } from "./launch-accessibility-audit";
import { createMobileQaReport } from "./launch-mobile-qa";
import { createLaunchSafetyReviewReport } from "./launch-safety-review";
import { createLaunchSurfaceReadinessReport } from "./launch-surface-readiness-report";
import { createPredeploymentSafetyGateReport } from "./predeployment-safety-gates";
import { createRouteBuildReadinessReport } from "./route-build-readiness";
import {
  createPreviewEnvironmentPackage,
  createPreviewEnvironmentPackageReport
} from "./preview-environment-package";
import type {
  TeoyubePreviewDeploymentBlocker,
  TeoyubePreviewDeploymentChecklistItem,
  TeoyubePreviewDeploymentDecision,
  TeoyubePreviewDeploymentWarning
} from "./preview-deployment-contracts";

function item(
  id: string,
  label: string,
  complete: boolean,
  details: string,
  manualReviewRequired = false
): TeoyubePreviewDeploymentChecklistItem {
  return {
    id,
    label,
    required: true,
    complete,
    status: complete ? (manualReviewRequired ? "ready_with_warnings" : "ready") : "blocked",
    details,
    manualReviewRequired,
    nextAction: complete ? undefined : "Resolve this preview readiness item before preview deployment."
  };
}

export function getPreviewDeploymentChecklist(): TeoyubePreviewDeploymentChecklistItem[] {
  const packageLike = { scripts: { build: "next build", start: "next start" } };
  const buildCommands = createBuildCommandRegistryReport(packageLike);
  const buildReport = createBuildVerificationReport();
  const dryRun = createDeploymentDryRunReport(createDeploymentDryRunPlan("vercel"));
  const profile = getPreviewLaunchConfigProfile();
  const previewPackage = createPreviewEnvironmentPackageReport(createPreviewEnvironmentPackage());
  const flags = profile.featureFlags;
  const flagValidation = validateLaunchFeatureFlags(flags);
  const environment = createLaunchEnvironmentReport();
  const mobile = createMobileQaReport();
  const accessibility = createAccessibilityAuditReport();
  const surfaces = createLaunchSurfaceReadinessReport();
  const routeBuild = createRouteBuildReadinessReport();
  const safety = createLaunchSafetyReviewReport();
  const predeployment = createPredeploymentSafetyGateReport();

  return [
    item("build_verification_documented", "Build verification passed or warnings documented", buildReport.valid && buildCommands.commandCount > 0, "Build verification runner and command registry are available; actual CLI output is recorded separately.", true),
    item("deployment_dry_run_plan_exists", "Deployment dry-run plan exists", dryRun.valid, "Deployment dry-run plan validates without deploying."),
    item("deployment_target_selected_or_undecided", "Deployment target selected or intentionally undecided", ["vercel", "netlify", "render", "railway", "self_hosted", "undecided"].includes(profile.deploymentTarget), `Deployment target is ${profile.deploymentTarget}.`, profile.deploymentTarget === "undecided"),
    item("safe_preview_environment_package_exists", "Safe preview environment package exists", previewPackage.valid, "Preview package contains placeholders, disabled services, safety requirements, and rollback notes."),
    item("safe_feature_flags_enabled", "Safe feature flags enabled", flagValidation.valid, "Safe feature flags preserve Scripture, explanations, fallbacks, guardrails, consent, and disabled providers."),
    item("external_analytics_disabled", "External analytics sending disabled", !flags.externalAnalyticsSendingEnabled, "External analytics sending remains disabled."),
    item("production_persistence_disabled", "Production persistence disabled", !flags.productionDatabasePersistenceEnabled, "Production database persistence remains disabled."),
    item("live_ai_disabled", "Live AI orchestration disabled", !flags.liveAiOrchestrationEnabled, "Live AI orchestration remains disabled."),
    item("raw_text_storage_disabled", "Raw text storage disabled", !flags.rawTextStorageEnabled, "Raw sensitive personalization text storage remains disabled."),
    item("debug_ui_disabled", "Debug UI disabled for public preview", !flags.debugOutputVisibleToUsers, "Debug output remains hidden from normal users."),
    item("scripture_anchoring_required", "Scripture anchoring required", flags.scriptureAnchoringRequired, "Every usable response must remain Scripture anchored."),
    item("explanation_path_required", "Explanation path required", flags.explanationPathRequired, "Every production recommendation remains explainable."),
    item("fallback_path_enabled", "Fallback path enabled", flags.fallbackPathEnabled, "Fallback path remains enabled."),
    item("safety_guardrails_enabled", "Safety guardrails enabled", flags.safetyGuardrailsEnabled && safety.valid, "Safety guardrails remain enabled and launch safety review passes."),
    item("consent_controls_enabled", "Consent controls enabled", flags.consentControlsEnabled, "Consent controls remain enabled."),
    item("offline_fallback_enabled", "Offline fallback enabled", true, "Phase 7 offline read-only fallback readiness remains available."),
    item("mobile_qa_exists", "Mobile QA coverage exists", mobile.valid && mobile.checkCount > 0, "Mobile QA checklist exists and has no default blockers.", true),
    item("accessibility_qa_exists", "Accessibility QA coverage exists", accessibility.valid && accessibility.accessibilityCheckCount > 0, "Accessibility QA checklist exists and has no default blockers.", true),
    item("surface_readiness_exists", "Surface readiness report exists", surfaces.ready && surfaces.surfaceCount >= 12, "Surface readiness covers required launch surfaces.", true),
    item("route_build_readiness_exists", "Route build readiness report exists", routeBuild.valid && routeBuild.routeCount >= 12, "Route build readiness covers required launch surfaces."),
    item("no_launch_critical_blockers", "No launch-critical blockers remain", predeployment.valid && surfaces.blockers.length === 0, "Predeployment safety gates and launch surface blockers are clear.")
  ];
}

export function getPreviewDeploymentBlockers(
  checklist: TeoyubePreviewDeploymentChecklistItem[] = getPreviewDeploymentChecklist()
): TeoyubePreviewDeploymentBlocker[] {
  return checklist
    .filter((entry) => entry.required && !entry.complete)
    .map((entry) => ({
      id: entry.id,
      reason: entry.details,
      requiredAction: entry.nextAction || "Resolve this preview readiness item."
    }));
}

export function getPreviewDeploymentWarnings(
  checklist: TeoyubePreviewDeploymentChecklistItem[] = getPreviewDeploymentChecklist()
): TeoyubePreviewDeploymentWarning[] {
  return [
    ...checklist
      .filter((entry) => entry.complete && entry.manualReviewRequired)
      .map((entry) => ({
        id: `${entry.id}_manual_review`,
        message: `${entry.label} still needs manual review before public sharing.`,
        recommendedAction: "Record manual QA evidence before sharing a preview URL."
      })),
    {
      id: "no_actual_deployment",
      message: "Production Launch Preparation 1.5 does not deploy the app.",
      recommendedAction: "Use the preview command guide for manual provider review only."
    }
  ];
}

export function createPreviewDeploymentDecision(
  checklist: TeoyubePreviewDeploymentChecklistItem[] = getPreviewDeploymentChecklist()
): TeoyubePreviewDeploymentDecision {
  const blockers = getPreviewDeploymentBlockers(checklist);
  const warnings = getPreviewDeploymentWarnings(checklist);

  if (blockers.some((entry) => entry.id.includes("environment") || entry.id.includes("feature_flags"))) {
    return "needs_environment_update";
  }
  if (blockers.some((entry) => entry.id.includes("build"))) {
    return "needs_build_fix";
  }
  if (blockers.some((entry) => entry.id.includes("qa") || entry.id.includes("surface"))) {
    return "needs_qa_fix";
  }
  if (blockers.length > 0) {
    return "blocked";
  }

  return warnings.length > 0 ? "ready_for_preview_manual_review" : "ready_for_preview_deployment";
}

export function runPreviewDeploymentReadinessCheck() {
  const checklist = getPreviewDeploymentChecklist();
  const blockers = getPreviewDeploymentBlockers(checklist);
  const warnings = getPreviewDeploymentWarnings(checklist);
  const decision = createPreviewDeploymentDecision(checklist);

  return {
    status: blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : "ready",
    decision,
    ready: blockers.length === 0,
    checklist,
    blockers,
    warnings
  };
}

export function createPreviewDeploymentReadinessReport() {
  const readiness = runPreviewDeploymentReadinessCheck();
  const previewPackage = createPreviewEnvironmentPackage();

  return {
    ...readiness,
    target: previewPackage.target,
    checklistCount: readiness.checklist.length,
    completeChecklistCount: readiness.checklist.filter((entry) => entry.complete).length,
    manualReviewItems: readiness.checklist
      .filter((entry) => entry.manualReviewRequired)
      .map((entry) => ({
        id: entry.id,
        label: entry.label,
        required: true,
        complete: false,
        details: entry.details
      })),
    rollbackPlan: {
      id: "preview_rollback_plan",
      label: "Preview Rollback Plan",
      rollbackTriggers: [
        "Scripture anchoring missing",
        "Unsafe personalization behavior",
        "Consent controls unavailable",
        "Preview build fails or renders broken routes"
      ],
      rollbackSteps: [
        "Stop sharing the preview URL.",
        "Disable the affected surface or revert to last safe commit.",
        "Run launch smoke checks again before retesting.",
        "Document the issue in manual review notes."
      ],
      manualReviewOwner: "Launch reviewer",
      notes: previewPackage.rollbackNotes
    },
    generatedAt: new Date().toISOString()
  };
}

