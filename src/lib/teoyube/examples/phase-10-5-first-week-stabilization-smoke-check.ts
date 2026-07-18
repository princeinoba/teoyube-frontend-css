import {
  addKnownIssueRegisterItem,
  addSafeFixBatchItem,
  createControlledReleaseExpansionRecord,
  createControlledReleaseExpansionReport,
  createFirstWeekStabilizationChecklist,
  createFirstWeekStabilizationDecisionLog,
  createFirstWeekStabilizationDecisionLogEntry,
  createFirstWeekStabilizationDecisionLogReport,
  createKnownIssueRegister,
  createKnownIssueRegisterItem,
  createKnownIssueRegisterReport,
  createManualFeedbackLoopItem,
  createManualFeedbackLoopReport,
  createPhase105StabilizationPackage,
  createPhase105StabilizationPackageReport,
  createRepeatedIssuePatternRecord,
  createRepeatedIssuePatternReport,
  createSafeFixBatch,
  createSafeFixBatchItem,
  createSafeFixBatchReport,
  recordFirstWeekStabilizationDecision,
  reviewManualFeedbackLoopItem,
  runPhase105Audit
} from "../phase-10";

export type TeoyubePhase105SmokeCheckResult = {
  id: string;
  passed: boolean;
  details: string;
};

export type TeoyubePhase105SmokeCheckReport = {
  valid: boolean;
  results: TeoyubePhase105SmokeCheckResult[];
  blockers: string[];
  warnings: string[];
  nextAction: "Fix build/typecheck/local verification blockers before Phase 10.6.";
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  noAutomaticFeedbackCollection: true;
  noAutomaticUserMonitoring: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function result(id: string, passed: boolean, details: string): TeoyubePhase105SmokeCheckResult {
  return { id, passed, details };
}

export function runPhase105FirstWeekStabilizationSmokeCheck(): TeoyubePhase105SmokeCheckReport {
  const checklist = createFirstWeekStabilizationChecklist();
  const feedback = createManualFeedbackLoopItem({
    source: "owner_observation",
    cadence: "daily",
    category: "confusion",
    repeatedIssue: true,
    issueSeverity: "severity_3_medium",
    summary: "Repeated manual note about confusing route label."
  });
  const feedbackReview = reviewManualFeedbackLoopItem(feedback);
  const feedbackReport = createManualFeedbackLoopReport({
    items: [feedback],
    feedbackSourceManual: true,
    noAutomaticFeedbackCollectionIntroduced: true,
    noSensitivePersonalDataStoredInCode: true,
    feedbackCategorized: true,
    repeatedIssuesFlagged: true,
    spiritualSafetyConcernsEscalated: true,
    routePageConcernsLinked: true,
    safeFixCandidatesPreserveBoundaries: true,
    futureEnhancementsSeparated: true,
    noVanityMetricsOrHiddenTracking: true
  });
  const expansionBlockingPattern = createRepeatedIssuePatternRecord({
    affectedArea: "mobile_layout",
    issueSeverity: "severity_2_high",
    manualReportCount: 3,
    reproducibilityStatus: "reproduced",
    userConfusionSummary: "Mobile layout blocks core use."
  });
  const patternReport = createRepeatedIssuePatternReport([expansionBlockingPattern]);
  const knownIssueRegister = addKnownIssueRegisterItem(createKnownIssueRegister(), createKnownIssueRegisterItem({
    severity: "severity_1_critical",
    summary: "Critical unresolved smoke-check issue."
  }));
  const knownIssueReport = createKnownIssueRegisterReport(knownIssueRegister);
  const unsafeBatch = addSafeFixBatchItem(createSafeFixBatch(), createSafeFixBatchItem({
    ownerApproved: true,
    scriptureAnchorPreserved: false,
    rollbackImpact: "Rollback by reverting the smoke-check fixture.",
    verificationMethod: "Manual code review."
  }));
  const unsafeBatchReport = createSafeFixBatchReport(unsafeBatch);
  const approvedExpansion = createControlledReleaseExpansionReport(createControlledReleaseExpansionRecord({
    status: "approved",
    selectedExpansionLevel: "expand_to_small_public_group",
    firstWeekStabilizationReviewed: true,
    manualFeedbackLoopReviewed: true,
    repeatedIssuePatternsReviewed: true,
    knownIssueRegisterReviewed: true,
    safeFixBatchReviewed: true,
    noUnresolvedSeverity1Issues: true,
    noExpansionBlockingSeverity2Issues: true,
    rollbackReadinessConfirmed: true,
    ownerApprovalRecorded: true,
    safetyBoundariesPreserved: true,
    controlledExpansionLevelSelected: true,
    conditionsDocumentedIfApplicable: true
  }));
  const conditionalExpansion = createControlledReleaseExpansionReport(createControlledReleaseExpansionRecord({
    status: "approved_with_conditions",
    selectedExpansionLevel: "remain_limited_public",
    conditions: ["Remain limited until local verification passes."],
    firstWeekStabilizationReviewed: true,
    manualFeedbackLoopReviewed: true,
    repeatedIssuePatternsReviewed: true,
    knownIssueRegisterReviewed: true,
    safeFixBatchReviewed: true,
    noUnresolvedSeverity1Issues: true,
    noExpansionBlockingSeverity2Issues: true,
    rollbackReadinessConfirmed: true,
    ownerApprovalRecorded: true,
    safetyBoundariesPreserved: true,
    controlledExpansionLevelSelected: true,
    conditionsDocumentedIfApplicable: true
  }));
  const blockedExpansion = createControlledReleaseExpansionReport(createControlledReleaseExpansionRecord({
    selectedExpansionLevel: "pause_expansion",
    firstWeekStabilizationReviewed: true,
    manualFeedbackLoopReviewed: true,
    repeatedIssuePatternsReviewed: false
  }));
  const decisionLog = recordFirstWeekStabilizationDecision(createFirstWeekStabilizationDecisionLog(), createFirstWeekStabilizationDecisionLogEntry({
    decisionType: "remain_limited",
    affectedArea: "owner_review",
    summary: "Remain limited until local verification passes.",
    actionTaken: "Recorded manual decision.",
    followUpRequired: true,
    expansionAllowed: false
  }));
  const decisionLogReport = createFirstWeekStabilizationDecisionLogReport(decisionLog);
  const phase105Package = createPhase105StabilizationPackage();
  const phase105PackageReport = createPhase105StabilizationPackageReport(phase105Package);
  const audit = runPhase105Audit();
  const results = [
    result("first_week_checklist", checklist.length >= 20, "First-week stabilization checklist can be created."),
    result("manual_feedback_loop", feedbackReview.decision === "safe_fix_candidate" && feedbackReport.noAutomaticFeedbackCollection, "Manual feedback loop categorizes feedback without automatic collection."),
    result("pattern_blocks_expansion", patternReport.decision === "expansion_blocked", "Repeated issue pattern review flags expansion blockers."),
    result("known_issue_severity_1_blocks", knownIssueReport.valid === false, "Known issue register blocks unresolved Severity 1 issues."),
    result("unsafe_batch_blocks", unsafeBatchReport.valid === false, "Safe-fix batch review blocks unsafe fixes."),
    result("expansion_approved", approvedExpansion.decision === "approved_for_limited_expansion", "Controlled release expansion can approve limited expansion."),
    result("expansion_conditioned", conditionalExpansion.decision === "approved_with_conditions", "Controlled release expansion can approve with conditions."),
    result("expansion_blocked", blockedExpansion.decision === "pause_promotion" || blockedExpansion.decision === "blocked", "Controlled release expansion can block expansion."),
    result("decision_log", decisionLogReport.log.entries.length === 1, "First-week decision log records decisions."),
    result("phase_10_5_package", phase105PackageReport.decision === "blocked_by_build_or_local_verification", "Phase 10.5 package is created and blocks on local verification by default."),
    result("phase_10_5_audit", audit.complete === true && audit.completionPercentage === 100, "Phase 10.5 audit returns structured structural results."),
    result("no_public_url_fetching", phase105Package.noPublicUrlsFetchedAutomatically, "No public URL fetching is required."),
    result("no_external_services", phase105Package.noExternalServicesRequired, "No external service connection is required.")
  ];
  const blockers = results.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  return {
    valid: blockers.length === 0,
    results,
    blockers,
    warnings: phase105PackageReport.warnings,
    nextAction: "Fix build/typecheck/local verification blockers before Phase 10.6.",
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    noAutomaticFeedbackCollection: true,
    noAutomaticUserMonitoring: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
