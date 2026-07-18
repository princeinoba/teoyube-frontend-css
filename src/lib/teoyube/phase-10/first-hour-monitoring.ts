import type {
  TeoyubeFirstHourMonitoringArea,
  TeoyubeFirstHourMonitoringBlocker,
  TeoyubeFirstHourMonitoringCheckpoint,
  TeoyubeFirstHourMonitoringDecision,
  TeoyubeFirstHourMonitoringIssue,
  TeoyubeFirstHourMonitoringObservation,
  TeoyubeFirstHourMonitoringReport,
  TeoyubeFirstHourMonitoringStatus,
  TeoyubeFirstHourMonitoringWarning,
  TeoyubeFirstHourMonitoringWindow
} from "./first-hour-monitoring-contracts";

export type TeoyubeFirstHourMonitoringInput = Partial<{
  status: TeoyubeFirstHourMonitoringStatus;
  publicAppUrlConfirmedManually: boolean;
  homepageLoads: boolean;
  appNotBlank: boolean;
  noPrivateDataOrDebugPayloadVisible: boolean;
  mainNavigationTested: boolean;
  canonPageTested: boolean;
  callingCompassPageTested: boolean;
  tigResponsePanelTested: boolean;
  visualGraphTested: boolean;
  desktopLayoutTested: boolean;
  mobileLayoutTested: boolean;
  spiritualResponseSectionsRender: boolean;
  fallbackErrorBehaviorReviewed: boolean;
  firstFeedbackReviewedManuallyIfAvailable: boolean;
  issuesClassified: boolean;
  continuePauseRollbackDecisionRecorded: boolean;
  launchDecisionRecorded: boolean;
  ownerNotesRecorded: boolean;
  phase104ActionsIdentified: boolean;
  observations: TeoyubeFirstHourMonitoringObservation[];
  issues: TeoyubeFirstHourMonitoringIssue[];
}>;

function checkpoint(id: string, window: TeoyubeFirstHourMonitoringWindow, area: TeoyubeFirstHourMonitoringArea, label: string, completed: boolean, details: string): TeoyubeFirstHourMonitoringCheckpoint {
  return { id, window, area, label, completed, details };
}

export function createFirstHourMonitoringChecklist(input: TeoyubeFirstHourMonitoringInput = {}): TeoyubeFirstHourMonitoringCheckpoint[] {
  return [
    checkpoint("manual_public_url_confirmation", "minute_0_to_10", "app_availability", "Confirm public app URL manually", input.publicAppUrlConfirmedManually === true, "Owner confirms access manually; this code does not fetch public URLs."),
    checkpoint("homepage_loads", "minute_0_to_10", "homepage", "Confirm homepage loads", input.homepageLoads === true, "Owner confirms the homepage loads."),
    checkpoint("app_not_blank", "minute_0_to_10", "app_availability", "Confirm app is not blank", input.appNotBlank === true, "Owner confirms no blank app shell is visible."),
    checkpoint("no_private_debug_payload", "minute_0_to_10", "privacy_consent", "Confirm no private data or debug payload is visible", input.noPrivateDataOrDebugPayloadVisible === true, "Owner confirms normal users do not see private/debug payloads."),
    checkpoint("main_navigation", "minute_10_to_20", "navigation", "Test main navigation", input.mainNavigationTested === true, "Owner checks primary navigation."),
    checkpoint("canon_page", "minute_10_to_20", "canon", "Test Canon page", input.canonPageTested === true, "Owner checks Canon route and Scripture anchoring."),
    checkpoint("calling_compass_page", "minute_10_to_20", "calling_compass", "Test Calling Compass page", input.callingCompassPageTested === true, "Owner checks calling language remains non-certain and bounded."),
    checkpoint("tig_response_panel", "minute_10_to_20", "tig_response_panel", "Test TIG response panel", input.tigResponsePanelTested === true, "Owner checks TIG response, confidence, explanation, and fallback states."),
    checkpoint("visual_graph", "minute_10_to_20", "visual_graph", "Test visual graph section", input.visualGraphTested === true, "Owner checks graph or list fallback readability."),
    checkpoint("desktop_layout", "minute_20_to_40", "desktop_layout", "Test desktop layout", input.desktopLayoutTested === true, "Owner checks desktop route usability."),
    checkpoint("mobile_layout", "minute_20_to_40", "mobile_layout", "Test mobile layout", input.mobileLayoutTested === true, "Owner checks mobile route usability."),
    checkpoint("spiritual_sections", "minute_20_to_40", "spiritual_response_sections", "Confirm spiritual response sections render correctly", input.spiritualResponseSectionsRender === true, "Owner checks Promise, Scripture, prayer, and action sections."),
    checkpoint("fallback_errors", "minute_20_to_40", "fallback", "Confirm fallback and error behavior", input.fallbackErrorBehaviorReviewed === true, "Owner checks fallback safety and error boundaries."),
    checkpoint("manual_feedback_review", "minute_20_to_40", "feedback_intake", "Review first feedback manually if available", input.firstFeedbackReviewedManuallyIfAvailable === true, "Feedback is manual only; nothing is collected automatically."),
    checkpoint("classify_issues", "minute_40_to_60", "error_handling", "Classify any issues", input.issuesClassified === true, "Owner classifies issues by severity."),
    checkpoint("decision_continue_pause_rollback", "minute_40_to_60", "service_disabled_state", "Decide continue, pause, or rollback", input.continuePauseRollbackDecisionRecorded === true, "Owner records a manual release decision."),
    checkpoint("launch_decision_logged", "minute_40_to_60", "service_disabled_state", "Record launch decision", input.launchDecisionRecorded === true, "Decision log stays local/in-memory unless the owner manually stores it elsewhere."),
    checkpoint("owner_notes", "minute_40_to_60", "unknown", "Record owner notes", input.ownerNotesRecorded === true, "Owner records notes manually."),
    checkpoint("phase_10_4_actions", "minute_40_to_60", "unknown", "Identify Phase 10.4 stabilization actions", input.phase104ActionsIdentified === true, "Owner identifies first-day stabilization follow-up.")
  ];
}

export function createFirstHourMonitoringObservation(input: Partial<TeoyubeFirstHourMonitoringObservation> = {}): TeoyubeFirstHourMonitoringObservation {
  return {
    id: input.id || `observation_${Date.now()}`,
    window: input.window || "unknown",
    area: input.area || "unknown",
    status: input.status || "observing",
    summary: input.summary || "Manual first-hour observation placeholder.",
    observedAt: input.observedAt || new Date().toISOString(),
    ownerNotes: input.ownerNotes || []
  };
}

export function recordFirstHourMonitoringObservation(observations: TeoyubeFirstHourMonitoringObservation[], observation: TeoyubeFirstHourMonitoringObservation): TeoyubeFirstHourMonitoringObservation[] {
  return [...observations.filter((entry) => entry.id !== observation.id), observation];
}

export function createFirstHourMonitoringIssue(input: Partial<TeoyubeFirstHourMonitoringIssue> = {}): TeoyubeFirstHourMonitoringIssue {
  const severity = input.severity || "severity_4_low";
  return {
    id: input.id || `first_hour_issue_${Date.now()}`,
    window: input.window || "unknown",
    area: input.area || "unknown",
    severity,
    summary: input.summary || "Manual first-hour issue placeholder.",
    requiresPause: input.requiresPause ?? (severity === "severity_1_critical" || severity === "severity_2_high"),
    requiresRollbackReview: input.requiresRollbackReview ?? severity === "severity_1_critical",
    notes: input.notes || []
  };
}

export function getFirstHourMonitoringBlockers(input: TeoyubeFirstHourMonitoringInput = {}): TeoyubeFirstHourMonitoringBlocker[] {
  return (input.issues || [])
    .filter((entry) => entry.severity === "severity_1_critical" || entry.requiresRollbackReview)
    .map((entry) => ({ id: `${entry.id}_blocker`, window: entry.window, area: entry.area, message: entry.summary }));
}

export function getFirstHourMonitoringWarnings(input: TeoyubeFirstHourMonitoringInput = {}): TeoyubeFirstHourMonitoringWarning[] {
  const warnings = createFirstHourMonitoringChecklist(input)
    .filter((entry) => !entry.completed)
    .map((entry) => ({ id: `${entry.id}_warning`, window: entry.window, area: entry.area, message: entry.details }));
  (input.issues || [])
    .filter((entry) => entry.severity === "severity_2_high" || entry.requiresPause)
    .forEach((entry) => warnings.push({ id: `${entry.id}_pause_warning`, window: entry.window, area: entry.area, message: entry.summary }));
  warnings.push({ id: "manual_monitoring_only", window: "unknown", area: "service_disabled_state", message: "This report does not connect analytics, public URL polling, alerts, or monitoring providers." });
  return warnings;
}

export function createFirstHourMonitoringDecision(input: TeoyubeFirstHourMonitoringInput = {}): TeoyubeFirstHourMonitoringDecision {
  const issues = input.issues || [];
  if (getFirstHourMonitoringBlockers(input).length) return "rollback";
  if (issues.some((entry) => entry.severity === "severity_2_high" || entry.requiresPause)) return "pause";
  if (createFirstHourMonitoringChecklist(input).every((entry) => entry.completed)) return "continue";
  return issues.length ? "continue_with_watch" : "unknown";
}

export function createFirstHourMonitoringReport(input: TeoyubeFirstHourMonitoringInput = {}): TeoyubeFirstHourMonitoringReport {
  const blockers = getFirstHourMonitoringBlockers(input);
  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : input.status || "not_started",
    decision: createFirstHourMonitoringDecision(input),
    checklist: createFirstHourMonitoringChecklist(input),
    observations: input.observations || [],
    issues: input.issues || [],
    blockers,
    warnings: getFirstHourMonitoringWarnings(input),
    noAutomaticMonitoringProvider: true,
    noPublicUrlsFetchedAutomatically: true,
    noFeedbackCollectedAutomatically: true,
    noAnalyticsEnabled: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
