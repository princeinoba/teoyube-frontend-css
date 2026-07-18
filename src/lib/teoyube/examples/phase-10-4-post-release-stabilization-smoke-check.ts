import {
  addSafeFixQueueItem,
  createFirstDayIssueTriageReport,
  createFirstDayReviewRecord,
  createFirstDayReviewReport,
  createManualFeedbackItem,
  createManualFeedbackReviewReport,
  createPhase104StabilizationPackage,
  createPhase104StabilizationPackageReport,
  createPostReleaseStabilizationChecklist,
  createSafeFixQueue,
  createSafeFixQueueItem,
  createSafeFixQueueReport,
  createStabilizationDecisionLog,
  createStabilizationDecisionLogEntry,
  createStabilizationDecisionLogReport,
  recordStabilizationDecision,
  reviewManualFeedbackItem,
  runPhase104Audit
} from "../phase-10";

export type TeoyubePhase104SmokeCheckResult = {
  id: string;
  passed: boolean;
  details: string;
};

export type TeoyubePhase104SmokeCheckReport = {
  valid: boolean;
  results: TeoyubePhase104SmokeCheckResult[];
  blockers: string[];
  warnings: string[];
  nextAction: "Fix build/typecheck/local verification blockers before Phase 10.5.";
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  noAutomaticFeedbackCollection: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function result(id: string, passed: boolean, details: string): TeoyubePhase104SmokeCheckResult {
  return { id, passed, details };
}

export function runPhase104PostReleaseStabilizationSmokeCheck(): TeoyubePhase104SmokeCheckReport {
  const stabilizationChecklist = createPostReleaseStabilizationChecklist();
  const severity1 = createFirstDayIssueTriageReport({ appDoesNotLoad: true, summary: "App does not load." });
  const severity2 = createFirstDayIssueTriageReport({ tigResponsePanelFails: true, summary: "TIG panel fails." });
  const severity3 = createFirstDayIssueTriageReport({ typo: true, summary: "Typo in one section." });
  const severity4 = createFirstDayIssueTriageReport({ futureFeatureIdea: true, summary: "Future feature idea." });
  const feedback = createManualFeedbackItem({
    source: "owner_note",
    category: "content_clarity",
    summary: "Owner notes one confusing label.",
    issueSeverity: "severity_3_medium"
  });
  const feedbackReview = reviewManualFeedbackItem(feedback);
  const feedbackReport = createManualFeedbackReviewReport({
    items: [feedback],
    feedbackSourceManual: true,
    noAutomaticFeedbackCollectionIntroduced: true,
    noSensitivePersonalDataStoredInCode: true,
    feedbackCategorized: true,
    issueSeverityAssignedWhereNeeded: true,
    spiritualSafetyConcernsEscalated: true,
    routePageConcernsLinked: true,
    safeFixCandidatesPreserveBoundaries: true,
    futureEnhancementsSeparated: true
  });
  const unsafeQueue = addSafeFixQueueItem(createSafeFixQueue(), createSafeFixQueueItem({
    ownerApproved: true,
    scriptureAnchorsPreserved: false,
    proposedFix: "Unsafe smoke-check fix that removes anchors."
  }));
  const unsafeQueueReport = createSafeFixQueueReport(unsafeQueue);
  const firstDayReviewReport = createFirstDayReviewReport(createFirstDayReviewRecord({
    firstHourMonitoringReviewed: true,
    launchDecisionLogReviewed: true,
    allSeverity1IssuesReviewed: true,
    allSeverity2IssuesReviewed: true,
    severity3And4IssuesCategorized: true,
    manualFeedbackReviewed: true,
    safeFixQueueReviewed: true,
    rollbackReadinessReconfirmed: true,
    knownIssuesAcceptedOrRejected: true,
    ownerDecisionRecorded: true,
    nextDayWatchItemsIdentified: true,
    firstWeekStabilizationReadinessAssessed: true,
    ownerDecision: "move_to_first_week_stabilization",
    nextDayWatchItems: ["Watch safe-fix queue manually."]
  }));
  const decisionLog = recordStabilizationDecision(createStabilizationDecisionLog(), createStabilizationDecisionLogEntry({
    releaseOwner: "manual_owner",
    decisionType: "continue_with_watch",
    affectedArea: "safe_fix_queue",
    summary: "Continue with watch after first-day review.",
    actionTaken: "No automated action taken.",
    followUpRequired: true
  }));
  const decisionLogReport = createStabilizationDecisionLogReport(decisionLog);
  const phase104Package = createPhase104StabilizationPackage();
  const phase104PackageReport = createPhase104StabilizationPackageReport(phase104Package);
  const audit = runPhase104Audit();

  const results = [
    result("stabilization_checklist", stabilizationChecklist.length >= 15, "Post-release stabilization checklist can be created."),
    result("severity_1", severity1.result.issue.severity === "severity_1_critical" && !severity1.valid, "Severity 1 first-day issue blocks release continuation."),
    result("severity_2", severity2.result.issue.severity === "severity_2_high" && severity2.result.decision === "fix_before_continue", "Severity 2 first-day issue requires fix before continuing."),
    result("severity_3", severity3.result.issue.severity === "severity_3_medium" && severity3.result.decision === "add_to_safe_fix_queue", "Severity 3 first-day issue enters safe-fix queue or backlog."),
    result("severity_4", severity4.result.issue.severity === "severity_4_low" && severity4.result.decision === "defer_to_backlog", "Severity 4 first-day issue defers to backlog."),
    result("manual_feedback", feedbackReview.decision === "safe_fix_candidate" && feedbackReport.valid, "Manual feedback review categorizes feedback without automatic collection."),
    result("unsafe_fix_queue_blocked", !unsafeQueueReport.valid && unsafeQueueReport.blockers.length > 0, "Safe-fix queue blocks unsafe fixes."),
    result("first_day_review", firstDayReviewReport.valid && firstDayReviewReport.decision === "move_to_first_week_stabilization", "First-day review record can be validated."),
    result("stabilization_decision_log", decisionLogReport.valid && Boolean(decisionLogReport.latestDecision), "Stabilization decision log can record decisions."),
    result("phase_10_4_package", phase104PackageReport.decision === "blocked_by_build_or_local_verification", "Phase 10.4 package surfaces the local verification blocker."),
    result("phase_10_4_audit", audit.complete && audit.completionPercentage === 100, "Phase 10.4 audit returns structural completion."),
    result("no_public_url_fetching", phase104Package.noPublicUrlsFetchedAutomatically, "No public URL fetching is required."),
    result("no_external_services", phase104Package.noExternalServicesRequired, "No external service connection is required."),
    result("no_auto_feedback", phase104Package.noAutomaticFeedbackCollection, "No automatic feedback collection is required.")
  ];
  const blockers = results.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  return {
    valid: blockers.length === 0,
    results,
    blockers,
    warnings: phase104PackageReport.warnings,
    nextAction: "Fix build/typecheck/local verification blockers before Phase 10.5.",
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    noAutomaticFeedbackCollection: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
