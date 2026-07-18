import type { TeoyubeControlledLaunchActivationBlocker, TeoyubeControlledLaunchActivationCheck, TeoyubeControlledLaunchActivationWarning } from "./controlled-launch-activation-contracts";

export type TeoyubeFirstHourMonitoringReadinessPlan = {
  id: string;
  label: string;
  checklist: TeoyubeControlledLaunchActivationCheck[];
  fetchesPreviewUrls: false;
  monitoringPerformed: false;
  generatedAt: string;
};

function item(id: string, label: string, complete = true): TeoyubeControlledLaunchActivationCheck {
  return { id, label, phase: "first_hour_monitoring_readiness", required: true, complete, launchCritical: true, details: label };
}

function blocker(entry: TeoyubeControlledLaunchActivationCheck): TeoyubeControlledLaunchActivationBlocker {
  return { id: `first_hour_${entry.id}`, label: entry.label, phase: "first_hour_monitoring_readiness", severity: "critical", reason: entry.details, requiredAction: "Prepare this manual first-hour monitoring check before activation." };
}

export function getFirstHourMonitoringChecklist(): TeoyubeControlledLaunchActivationCheck[] {
  return [
    item("app_loads_manual", "Verify app loads manually"),
    item("canon_manual", "Verify Canon manually"),
    item("daily_word_manual", "Verify Daily Word manually"),
    item("prayer_manual", "Verify Prayer manually"),
    item("calling_compass_manual", "Verify Calling Compass manually"),
    item("promise_cluster_manual", "Verify Promise Cluster manually"),
    item("ai_companion_manual", "Verify AI Companion manually"),
    item("onboarding_manual", "Verify Onboarding manually"),
    item("scripture_anchors_manual", "Verify Scripture anchors"),
    item("explanation_paths_manual", "Verify explanation paths"),
    item("fallback_behavior_manual", "Verify fallback behavior"),
    item("consent_controls_manual", "Verify consent controls"),
    item("feedback_instructions_manual", "Verify feedback instructions"),
    item("mobile_layout_manual", "Verify mobile layout"),
    item("no_debug_payload_exposed", "Verify no debug payload exposed"),
    item("no_external_analytics", "Verify no external analytics"),
    item("no_production_persistence", "Verify no production persistence"),
    item("no_live_ai_orchestration", "Verify no live AI orchestration")
  ];
}

export function createFirstHourMonitoringReadinessPlan(input: Partial<TeoyubeFirstHourMonitoringReadinessPlan> = {}): TeoyubeFirstHourMonitoringReadinessPlan {
  return {
    id: input.id || "controlled_launch_first_hour_4_1",
    label: input.label || "First-Hour Monitoring Readiness Plan",
    checklist: input.checklist || getFirstHourMonitoringChecklist(),
    fetchesPreviewUrls: false,
    monitoringPerformed: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function getFirstHourMonitoringBlockers(plan: TeoyubeFirstHourMonitoringReadinessPlan): TeoyubeControlledLaunchActivationBlocker[] {
  return [
    ...plan.checklist.filter((entry) => entry.required && !entry.complete).map(blocker),
    plan.fetchesPreviewUrls ? { id: "first_hour_preview_url_fetched", label: "Preview URL fetched", phase: "first_hour_monitoring_readiness", severity: "critical", reason: "First-hour readiness must not fetch URLs.", requiredAction: "Keep URL checks manual." } : undefined,
    plan.monitoringPerformed ? { id: "first_hour_monitoring_performed", label: "Monitoring performed", phase: "first_hour_monitoring_readiness", severity: "critical", reason: "This module must not perform monitoring automatically.", requiredAction: "Use this as a manual checklist only." } : undefined
  ].filter(Boolean) as TeoyubeControlledLaunchActivationBlocker[];
}

export function getFirstHourMonitoringWarnings(): TeoyubeControlledLaunchActivationWarning[] {
  return [{ id: "first_hour_manual_only", label: "First-hour monitoring is manual only", phase: "first_hour_monitoring_readiness", severity: "medium", message: "This plan prepares checks but does not fetch URLs or observe live users.", recommendedAction: "Run checks manually during the approved launch window." }];
}

export function validateFirstHourMonitoringReadiness(plan: TeoyubeFirstHourMonitoringReadinessPlan) {
  const blockers = getFirstHourMonitoringBlockers(plan);
  return { valid: blockers.length === 0, blockers, warnings: getFirstHourMonitoringWarnings() };
}

export function createFirstHourMonitoringReadinessReport(plan: TeoyubeFirstHourMonitoringReadinessPlan = createFirstHourMonitoringReadinessPlan()) {
  const validation = validateFirstHourMonitoringReadiness(plan);
  return { valid: validation.valid, ready: validation.valid, plan, checklistCount: plan.checklist.length, blockers: validation.blockers, warnings: validation.warnings, noMonitoringPerformed: true, noPreviewUrlFetched: true, generatedAt: new Date().toISOString() };
}
