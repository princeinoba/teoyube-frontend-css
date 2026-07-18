import { createFinalAnalyticsGoNoGoReport } from "./final-analytics-go-no-go";
import { createFinalDatabasePersistenceGoNoGoReport } from "./final-database-persistence-go-no-go";
import { createFinalLiveAiGoNoGoReport } from "./final-live-ai-go-no-go";
import { createFinalProductionServiceDecisionReport } from "./final-production-service-decision";
import { createFinalPublicGoNoGoReport } from "./final-public-go-no-go";
import { createFinalPublicLaunchPackage, createFinalPublicLaunchPackageReport } from "./final-public-launch-package";
import { createFinalPublicPrivacyLegalReport } from "./final-public-privacy-legal-readiness";
import { createFinalPublicSafetyCertificationReport } from "./final-public-safety-certification";
import { createFinalPublicSurfaceQaCertificationReport } from "./final-public-surface-qa-certification";
import { createPublicLaunchExecutionHandoffReport } from "./public-launch-execution-handoff";
import type {
  TeoyubeControlledPublicLaunchActivationBlocker,
  TeoyubeControlledPublicLaunchActivationCheck,
  TeoyubeControlledPublicLaunchActivationChecklist,
  TeoyubeControlledPublicLaunchActivationDecision,
  TeoyubeControlledPublicLaunchActivationPhase,
  TeoyubeControlledPublicLaunchActivationReport,
  TeoyubeControlledPublicLaunchActivationWarning
} from "./controlled-public-launch-activation-contracts";
import { createPublicLaunchKnownLimitationsReport } from "./public-launch-known-limitations";

export type TeoyubeControlledPublicLaunchActivationState = {
  checks?: TeoyubeControlledPublicLaunchActivationCheck[];
};

function check(
  id: string,
  label: string,
  phase: TeoyubeControlledPublicLaunchActivationPhase,
  details: string,
  launchCritical = true,
  complete = true
): TeoyubeControlledPublicLaunchActivationCheck {
  return { id, label, phase, required: true, complete, launchCritical, details };
}

function blocker(entry: TeoyubeControlledPublicLaunchActivationCheck): TeoyubeControlledPublicLaunchActivationBlocker {
  return {
    id: `controlled_public_activation_${entry.id}`,
    label: entry.label,
    phase: entry.phase,
    severity: entry.launchCritical ? "critical" : "high",
    reason: entry.details,
    requiredAction: entry.nextAction || "Complete this controlled public activation item before manual public activation."
  };
}

export function getControlledPublicLaunchActivationChecklist(): TeoyubeControlledPublicLaunchActivationChecklist {
  const finalGoNoGo = createFinalPublicGoNoGoReport();
  const finalPackage = createFinalPublicLaunchPackageReport(createFinalPublicLaunchPackage());
  const handoff = createPublicLaunchExecutionHandoffReport();
  const privacyLegal = createFinalPublicPrivacyLegalReport();
  const surfaceQa = createFinalPublicSurfaceQaCertificationReport();
  const safety = createFinalPublicSafetyCertificationReport();
  const services = createFinalProductionServiceDecisionReport();
  const database = createFinalDatabasePersistenceGoNoGoReport();
  const analytics = createFinalAnalyticsGoNoGoReport();
  const liveAi = createFinalLiveAiGoNoGoReport();
  const limitations = createPublicLaunchKnownLimitationsReport();

  return {
    id: "controlled_public_launch_activation_checklist_6_1",
    label: "Public Launch Execution 6.1 Controlled Public Launch Activation Checklist",
    manualOnly: true,
    checks: [
      check("final_public_go_no_go_acceptable", "Final public go/no-go is acceptable", "pre_activation_review", "Final public go/no-go must support public launch execution preparation.", true, finalGoNoGo.ready),
      check("final_public_launch_package_exists", "Final public launch package exists", "pre_activation_review", "Final public launch package must be available in memory.", true, finalPackage.ready),
      check("public_launch_execution_handoff_exists", "Public launch execution handoff exists", "pre_activation_review", "Public launch execution handoff must point to 6.1.", true, handoff.ready),
      check("owner_approval_ready", "Owner approval is ready", "owner_approval", "Structured owner approval must be complete before any manual public activation."),
      check("public_launch_scope_documented", "Public launch scope is documented", "pre_activation_review", "Public launch scope must be visible and accepted before activation."),
      check("known_limitations_documented", "Known limitations are documented", "pre_activation_review", "Public known limitations must be available.", true, limitations.ready),
      check("privacy_terms_consent_copy_exists", "Public privacy, terms, and consent copy exists", "public_surface_confirmation", "Privacy, terms, and consent notices must remain visible.", true, privacyLegal.ready),
      check("sensitive_information_warnings_exist", "Sensitive information warnings exist", "public_surface_confirmation", "Public users must be warned not to submit sensitive personal information.", true, privacyLegal.ready),
      check("public_surface_qa_certification_exists", "Public surface QA certification exists", "public_surface_confirmation", "Final public surface QA certification must be ready.", true, surfaceQa.ready),
      check("public_safety_certification_exists", "Public safety certification exists", "public_surface_confirmation", "Final public safety certification must be ready.", true, safety.ready),
      check("production_service_decisions_documented", "Production service decisions are documented", "production_service_confirmation", "Production service decisions must be visible.", true, services.ready),
      check("database_persistence_status_documented", "Database persistence status is documented", "production_service_confirmation", "Database persistence status must be disabled, approved, or deferred explicitly.", true, database.ready && database.noDatabaseConnected),
      check("analytics_status_documented", "Analytics status is documented", "production_service_confirmation", "Analytics status must be disabled, approved, or deferred explicitly.", true, analytics.ready && analytics.noAnalyticsSent),
      check("live_ai_status_documented", "Live AI orchestration status is documented", "production_service_confirmation", "Live AI status must be disabled, approved, or deferred explicitly.", true, liveAi.ready && liveAi.noOpenAiApiCalled),
      check("public_access_plan_documented", "Public access plan is documented", "public_access_confirmation", "Public access must be intentional and documented."),
      check("public_communication_packet_draft_only", "Public communication packet is ready as draft only", "public_communication_readiness", "Communication guidance must exist but send nothing from code."),
      check("public_feedback_intake_workflow_ready", "Public feedback intake workflow is ready", "public_feedback_intake_readiness", "Feedback intake remains manual or explicitly controlled."),
      check("public_issue_triage_workflow_ready", "Public issue triage workflow is ready", "public_feedback_intake_readiness", "Issue triage must classify public-launch-critical issues."),
      check("public_support_response_plan_ready", "Public support response plan is ready", "first_hour_monitoring_readiness", "Support response ownership and escalation notes must exist."),
      check("pause_criteria_ready", "Pause criteria are ready", "pause_rollback_readiness", "Pause criteria must be explicit before manual public activation."),
      check("rollback_criteria_ready", "Rollback criteria are ready", "pause_rollback_readiness", "Rollback criteria must be explicit and manual-only."),
      check("first_hour_public_monitoring_ready", "First-hour public monitoring checklist is ready", "first_hour_monitoring_readiness", "First-hour checks must be prepared for manual execution."),
      check("no_unapproved_external_analytics_enabled", "No unapproved external analytics are enabled", "environment_confirmation", "External analytics remain disconnected unless explicitly approved.", true, analytics.noAnalyticsSent),
      check("no_unapproved_production_persistence_enabled", "No unapproved production persistence is enabled", "environment_confirmation", "Production persistence remains disabled unless explicitly approved.", true, database.noDatabaseConnected),
      check("no_unapproved_live_ai_orchestration_enabled", "No unapproved live AI orchestration is enabled", "environment_confirmation", "Live AI orchestration remains disabled unless explicitly approved.", true, liveAi.noOpenAiApiCalled),
      check("scripture_anchoring_required", "Scripture anchoring is required", "public_surface_confirmation", "Every launch-critical spiritual guidance surface must preserve Scripture anchoring.", true, safety.scriptureAnchoringRequired),
      check("explanation_paths_required", "Explanation paths are required", "public_surface_confirmation", "Explanation paths must remain visible and inspectable.", true, safety.explanationPathsRequired),
      check("fallback_path_enabled", "Fallback path is enabled", "public_surface_confirmation", "Fallback behavior must remain safe and available.", true, safety.fallbackSafetyReady),
      check("consent_controls_enabled", "Consent controls are enabled", "public_surface_confirmation", "Consent and privacy controls must remain enabled.", true, safety.consentSafetyReady),
      check("debug_ui_hidden", "Debug UI is hidden from normal users", "public_surface_confirmation", "Normal public users must not see debug payloads.")
    ]
  };
}

export function getControlledPublicLaunchCriticalActivationChecks(): TeoyubeControlledPublicLaunchActivationCheck[] {
  return getControlledPublicLaunchActivationChecklist().checks.filter((entry) => entry.launchCritical);
}

export function getControlledPublicLaunchActivationChecksByPhase(
  phase: TeoyubeControlledPublicLaunchActivationPhase
): TeoyubeControlledPublicLaunchActivationCheck[] {
  return getControlledPublicLaunchActivationChecklist().checks.filter((entry) => entry.phase === phase);
}

function checksFromState(state: TeoyubeControlledPublicLaunchActivationState = {}): TeoyubeControlledPublicLaunchActivationCheck[] {
  return state.checks || getControlledPublicLaunchActivationChecklist().checks;
}

export function getControlledPublicLaunchActivationBlockers(
  state: TeoyubeControlledPublicLaunchActivationState = {}
): TeoyubeControlledPublicLaunchActivationBlocker[] {
  return checksFromState(state)
    .filter((entry) => entry.required && !entry.complete)
    .map(blocker);
}

export function getControlledPublicLaunchActivationWarnings(
  state: TeoyubeControlledPublicLaunchActivationState = {}
): TeoyubeControlledPublicLaunchActivationWarning[] {
  const checks = checksFromState(state);

  return [
    {
      id: "controlled_public_activation_manual_only",
      label: "Manual public activation only",
      phase: "activation_decision",
      severity: "medium",
      message: "This checklist prepares public activation controls but does not launch Teoyube.",
      recommendedAction: "Use the checklist for owner-led manual public activation only."
    },
    checks.some((entry) => entry.id === "debug_ui_hidden" && entry.complete)
      ? undefined
      : {
          id: "controlled_public_activation_debug_review_needed",
          label: "Debug visibility review needed",
          phase: "public_surface_confirmation",
          severity: "high",
          message: "Debug UI visibility must be reviewed before public access expands.",
          recommendedAction: "Confirm normal public users cannot see debug payloads."
        }
  ].filter(Boolean) as TeoyubeControlledPublicLaunchActivationWarning[];
}

export function createControlledPublicLaunchActivationDecision(
  state: TeoyubeControlledPublicLaunchActivationState = {}
): TeoyubeControlledPublicLaunchActivationDecision {
  const blockers = getControlledPublicLaunchActivationBlockers(state);

  if (blockers.some((entry) => /database|analytics|live ai|production service|provider/i.test(`${entry.label} ${entry.reason}`))) return "needs_service_review";
  if (blockers.some((entry) => /environment|debug/i.test(`${entry.label} ${entry.reason}`))) return "needs_environment_review";
  if (blockers.some((entry) => /privacy|terms|consent|sensitive/i.test(`${entry.label} ${entry.reason}`))) return "needs_privacy_review";
  if (blockers.some((entry) => /scripture|explanation|fallback|safety|divine/i.test(`${entry.label} ${entry.reason}`))) return "needs_safety_review";
  if (blockers.some((entry) => /surface|copy|mobile|accessibility/i.test(`${entry.label} ${entry.reason}`))) return "needs_surface_review";
  if (blockers.some((entry) => /qa|first-hour|monitoring/i.test(`${entry.label} ${entry.reason}`))) return "needs_qa_review";
  if (blockers.some((entry) => /owner/i.test(`${entry.label} ${entry.reason}`))) return "ready_after_owner_review";
  if (blockers.length > 0) return "blocked";
  return "ready_for_manual_public_activation";
}

export function createControlledPublicLaunchActivationReport(
  state: TeoyubeControlledPublicLaunchActivationState = {}
): TeoyubeControlledPublicLaunchActivationReport {
  const checklist = { ...getControlledPublicLaunchActivationChecklist(), checks: checksFromState(state) };
  const blockers = getControlledPublicLaunchActivationBlockers(state);
  const warnings = getControlledPublicLaunchActivationWarnings(state);
  const decision = createControlledPublicLaunchActivationDecision(state);

  return {
    status: blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : "ready",
    ready: blockers.length === 0 && decision === "ready_for_manual_public_activation",
    decision,
    checklist,
    checklistCount: checklist.checks.length,
    completedChecklistCount: checklist.checks.filter((entry) => entry.complete).length,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    blockers,
    warnings,
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlFetched: true,
    noExternalAnalyticsSent: true,
    noProductionPersistenceEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
