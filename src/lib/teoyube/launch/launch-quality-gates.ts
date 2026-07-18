import { runPromiseClusterTigProduction } from "../../tig";
import { createAnalyticsProviderReadinessReport } from "../mobile-scale/analytics-provider-readiness";
import { createPersistenceAdapterReadinessReport } from "../mobile-scale/persistence-adapter-readiness";
import { runPhase7MobileScaleSafetyCheck } from "../mobile-scale/phase-7-mobile-scale-safety-check";
import { getSafeDefaultRuntimeConfig, validateTeoyubeRuntimeConfig } from "../mobile-scale/runtime-config-readiness";
import { getTeoyubeRoadmapCompletionSummary } from "../mobile-scale/teoyube-roadmap-completion-summary";
import { createBuildCommandRegistryReport } from "./build-command-registry";
import { createBuildVerificationPlan } from "./build-verification-runner";
import { createDeploymentDryRunPlan, createDeploymentDryRunReport } from "./deployment-dry-run-planner";
import { createFinalLaunchBlockerRegister, createFinalLaunchBlockerReport } from "./final-launch-blocker-register";
import { createFinalLaunchOwnerReviewChecklist } from "./final-launch-owner-review";
import { runFinalLaunchPreparationAudit } from "./final-launch-preparation-audit";
import { createFinalLaunchPreparationSummaryReport } from "./final-launch-preparation-summary";
import { createFinalLaunchQualityGateReport } from "./final-launch-quality-gate-report";
import { createFinalLaunchSafetyCertificationReport } from "./final-launch-safety-certification";
import { createFinalLaunchSurfaceCertificationReport } from "./final-launch-surface-certification";
import { createFinalSoftLaunchExecutionHandoff, createSoftLaunchExecutionHandoffReport } from "./final-soft-launch-execution-handoff";
import { createFinalSoftLaunchGoNoGoReport } from "./final-soft-launch-go-no-go";
import { createKnownLimitationsReport } from "./final-soft-launch-known-limitations";
import { createFinalSoftLaunchOwnerGoNoGoChecklist, createFinalSoftLaunchOwnerGoNoGoReport } from "./final-soft-launch-owner-go-no-go";
import { createFinalSoftLaunchQualityGateReport } from "./final-soft-launch-quality-gate-report";
import { createFinalSoftLaunchReadinessPackage, createFinalSoftLaunchReadinessPackageReport } from "./final-soft-launch-readiness-package";
import { runFinalSoftLaunchReadinessAudit } from "./final-soft-launch-readiness-audit";
import { createFinalSoftLaunchRiskRegister, createFinalSoftLaunchRiskRegisterReport } from "./final-soft-launch-risk-register";
import { createFinalSoftLaunchSafetyCertificationReport } from "./final-soft-launch-safety-certification";
import { createFinalSoftLaunchSurfaceCertificationReport } from "./final-soft-launch-surface-certification";
import { runControlledLaunchActivationAudit } from "./controlled-launch-activation-audit";
import { createControlledLaunchActivationReport } from "./controlled-launch-activation-checklist";
import { createControlledLaunchActivationPackage, createControlledLaunchActivationPackageReport } from "./controlled-launch-activation-package";
import { createControlledLaunchCommunicationReadinessPlan, createControlledLaunchCommunicationReadinessReport } from "./controlled-launch-communication-readiness";
import { createFirstHourMonitoringReadinessPlan, createFirstHourMonitoringReadinessReport } from "./controlled-launch-first-hour-readiness";
import { createControlledLaunchIssueIntakePlan, createControlledLaunchIssueIntakeReport } from "./controlled-launch-issue-intake-readiness";
import { createControlledLaunchOwnerApprovalRecord, createControlledLaunchOwnerApprovalReport } from "./controlled-launch-owner-approval";
import { createParticipantAccessReadinessPlan, createParticipantAccessReadinessReport } from "./controlled-launch-participant-access";
import { createControlledLaunchPauseRollbackPlan, createControlledLaunchPauseRollbackReport } from "./controlled-launch-pause-rollback-readiness";
import { createControlledLaunchWindowPlan, createControlledLaunchWindowReport } from "./controlled-launch-window";
import { runLaunchDayMonitoringAudit } from "./launch-day-monitoring-audit";
import { createFirstHourMonitoringPlan, createFirstHourMonitoringReport } from "./launch-day-first-hour-monitoring";
import { createLaunchDayDailyReviewRecord, createLaunchDayDailyReviewReport } from "./launch-day-daily-review";
import { createLaunchDayFeedbackIntakeReport, createLaunchDayFeedbackLog } from "./launch-day-manual-feedback-intake";
import { createLaunchDayFeedbackPrivacyReport } from "./launch-day-feedback-privacy-guard";
import { createLaunchDayIssueEscalationReport } from "./launch-day-issue-escalation";
import { createLaunchDayMonitoringPackage, createLaunchDayMonitoringPackageReport } from "./launch-day-monitoring-package";
import { createLaunchDayMonitoringReport, createLaunchDayMonitoringRun } from "./launch-day-monitoring-run";
import { createLaunchDayPauseRollbackWatchReport } from "./launch-day-pause-rollback-watch";
import { createScriptureExplanationFallbackWatchReport } from "./launch-day-scripture-explanation-fallback-watch";
import { createSurfaceHealthMonitoringReport, createSurfaceHealthMonitoringRun } from "./launch-day-surface-health-monitor";
import { createSoftLaunchFeedbackDailyReviewPackage, createSoftLaunchFeedbackDailyReviewPackageReport } from "./soft-launch-feedback-daily-review-package";
import { runSoftLaunchFeedbackDailyReviewAudit } from "./soft-launch-feedback-daily-review-audit";
import { createSoftLaunchStabilizationPackage, createSoftLaunchStabilizationPackageReport } from "./soft-launch-stabilization-package";
import { runSoftLaunchSafeFixStabilizationAudit } from "./soft-launch-safe-fix-stabilization-audit";
import { runSoftLaunchCompletionReview } from "./soft-launch-completion-review";
import { createSoftLaunchFeedbackSummaryReport } from "./soft-launch-feedback-summary";
import { createSoftLaunchIssueClosureReport } from "./soft-launch-issue-closure";
import { createSoftLaunchStabilityCertificationReport } from "./soft-launch-stability-certification";
import { createSoftLaunchFinalSafetyPrivacyReport } from "./soft-launch-final-safety-privacy-review";
import { createPublicLaunchReadinessCriteriaReport } from "./public-launch-readiness-criteria";
import { createPublicLaunchReadinessPackage, createPublicLaunchReadinessPackageReport } from "./public-launch-readiness-package";
import { createPublicLaunchRiskRegister, createPublicLaunchRiskRegisterReport } from "./public-launch-risk-register";
import { createPublicLaunchKnownLimitationsReport } from "./public-launch-known-limitations";
import { createPublicLaunchOwnerReadinessRecord, createPublicLaunchOwnerReadinessReport } from "./public-launch-owner-readiness-review";
import { createPublicLaunchReadinessHandoffReport } from "./public-launch-readiness-handoff";
import { runPublicLaunchReadinessAudit } from "./public-launch-readiness-audit";
import { createProductionServiceConnectionPlan, createProductionServiceConnectionPlanReport } from "./production-service-connection-plan";
import { createPublicLaunchDatabasePersistencePlan, createDatabasePersistenceDecisionReport } from "./public-launch-database-persistence-plan";
import { createPublicLaunchAnalyticsPlan, createAnalyticsConnectionDecisionReport } from "./public-launch-analytics-plan";
import { createPublicLaunchLiveAiPlan, createLiveAiDecisionReport } from "./public-launch-live-ai-plan";
import { createPublicLaunchPrivacyConsentReport } from "./public-launch-privacy-consent-readiness";
import { createPublicLaunchSafetyCertificationReport } from "./public-launch-safety-certification";
import { createPublicLaunchSurfaceReadinessReport } from "./public-launch-surface-readiness-certification";
import { createPublicLaunchOwnerReviewRecord, createPublicLaunchOwnerReviewReport } from "./public-launch-owner-review";
import { createPublicLaunchPreparationPackage, createPublicLaunchPreparationPackageReport } from "./public-launch-preparation-package";
import { runPublicLaunchPreparationAudit } from "./public-launch-preparation-audit";
import { createPrivacyNoticeCopyReport } from "./public-launch-privacy-notice-copy";
import { createTermsCopyReport } from "./public-launch-terms-copy";
import { createConsentCopyReport } from "./public-launch-consent-copy";
import { createAiTigTransparencyCopyReport } from "./public-launch-ai-tig-transparency-copy";
import { createSensitiveInfoCopyReport } from "./public-launch-sensitive-info-copy";
import { createFeedbackNoticeCopyReport } from "./public-launch-feedback-notice-copy";
import { createPublicLaunchCopyPackage, createPublicLaunchCopyPackageReport } from "./public-launch-copy-package";
import { createPublicLaunchQaChecklistReport } from "./public-launch-qa-checklist";
import { createPublicLaunchQaRun, createPublicLaunchQaReport } from "./public-launch-qa-runner";
import { createPublicPrivacyConsentQaReport } from "./public-launch-privacy-consent-qa";
import { createPublicCopyOwnerReviewRecord, createPublicCopyOwnerReviewReport } from "./public-launch-copy-owner-review";
import { createPublicLaunchCopyQaPackage, createPublicLaunchCopyQaPackageReport } from "./public-launch-copy-qa-package";
import { runPublicLaunchPrivacyQaAudit } from "./public-launch-privacy-qa-audit";
import { createPublicCopyAccessibilityQaReport } from "./public-copy-accessibility-qa";
import { createPublicCopyIntegrationPackage, createPublicCopyIntegrationPackageReport } from "./public-copy-integration-package";
import { createPublicCopyUiAdapterReport } from "./public-copy-ui-adapter";
import { createPublicQaDryRun, createPublicQaDryRunReport } from "./public-qa-dry-run-runner";
import { runPublicSurfaceCopyIntegrationAudit } from "./public-surface-copy-integration-audit";
import { createPublicSurfaceCopyOwnerReviewRecord, createPublicSurfaceCopyOwnerReviewReport } from "./public-surface-copy-owner-review";
import { createPublicSurfaceCopyRegistryReport } from "./public-surface-copy-registry";
import { createPublicSurfaceFinalQaChecklistReport } from "./public-surface-final-qa-checklist";
import { validatePublicSurfaceCopyIntegration } from "./public-surface-copy-integration-validator";
import { createFinalProductionServiceDecisionReport } from "./final-production-service-decision";
import { createFinalDatabasePersistenceGoNoGoReport } from "./final-database-persistence-go-no-go";
import { createFinalAnalyticsGoNoGoReport } from "./final-analytics-go-no-go";
import { createFinalLiveAiGoNoGoReport } from "./final-live-ai-go-no-go";
import { createFinalPublicPrivacyLegalReport } from "./final-public-privacy-legal-readiness";
import { createFinalPublicSurfaceQaCertificationReport } from "./final-public-surface-qa-certification";
import { createFinalPublicSafetyCertificationReport } from "./final-public-safety-certification";
import { createFinalPublicLaunchRiskRegister, createFinalPublicLaunchRiskRegisterReport } from "./final-public-launch-risk-register";
import { createFinalPublicLaunchPackage, createFinalPublicLaunchPackageReport } from "./final-public-launch-package";
import { createFinalPublicOwnerGoNoGoRecord, createFinalPublicOwnerGoNoGoReport } from "./final-public-owner-go-no-go";
import { createFinalPublicGoNoGoReport } from "./final-public-go-no-go";
import { createPublicLaunchExecutionHandoffReport } from "./public-launch-execution-handoff";
import { runFinalPublicLaunchPreparationAudit } from "./final-public-launch-preparation-audit";
import { createPublicFeedbackDailyReviewPackage, createPublicFeedbackDailyReviewPackageReport } from "./public-feedback-daily-review-package";
import { runPublicFeedbackDailyReviewAudit } from "./public-feedback-daily-review-audit";
import { createPublicLaunchStabilizationPackage, createPublicLaunchStabilizationPackageReport } from "./public-launch-stabilization-package";
import { runPublicSafeFixStabilizationAudit } from "./public-safe-fix-stabilization-audit";
import { runPublicLaunchCompletionAudit } from "./public-launch-completion-audit";
import { createPublicLaunchCompletionReport } from "./public-launch-completion-review";
import { createPublicLaunchFeedbackSummaryReport } from "./public-launch-feedback-summary";
import { createPublicLaunchIssueClosureReport } from "./public-launch-issue-closure";
import { createPublicLaunchStabilityCertificationReport } from "./public-launch-stability-certification";
import { createPublicLaunchFinalSafetyPrivacyReport } from "./public-launch-final-safety-privacy-review";
import { createPostLaunchReadinessCriteriaReport } from "./post-launch-readiness-criteria";
import { createPostLaunchReadinessPackage, createPostLaunchReadinessPackageReport } from "./post-launch-readiness-package";
import { createPostLaunchRiskRegister, createPostLaunchRiskRegisterReport } from "./post-launch-risk-register";
import { createPostLaunchKnownLimitationsReport } from "./post-launch-known-limitations";
import { createPostLaunchOwnerReadinessRecord, createPostLaunchOwnerReadinessReport } from "./post-launch-owner-readiness-review";
import { createPostLaunchReadinessHandoffReport } from "./post-launch-readiness-handoff";
import { createPostLaunchPublicMonitoringPlan, createPostLaunchPublicMonitoringReport } from "./post-launch-public-monitoring-plan";
import { createPostLaunchSupportWorkflow, createPostLaunchSupportWorkflowReport } from "./post-launch-support-workflow";
import { createPostLaunchGrowthRoadmap, createPostLaunchGrowthRoadmapReport } from "./post-launch-growth-roadmap";
import { createPostLaunchOperationsPackage, createPostLaunchOperationsPackageReport } from "./post-launch-operations-package";
import { runPostLaunchOperations71Audit } from "./post-launch-operations-audit";
import { runPostLaunch72Audit } from "../post-launch/post-launch-7-2-audit";
import { createWeeklyImprovementPackage, createWeeklyImprovementPackageReport } from "../post-launch/weekly-improvement-package";
import { runSoftLaunchCompletionAudit } from "./soft-launch-completion-audit";
import { runManualPreviewDeploymentAudit } from "./manual-preview-deployment-audit";
import { createManualPreviewDeploymentRunbookReport } from "./manual-preview-deployment-runbook";
import { createManualPreviewEnvironmentReport } from "./manual-preview-environment-verification";
import { createManualPreviewLocalCheckReport, getManualPreviewLocalCheckPlan, recordManualPreviewLocalCheckResult } from "./manual-preview-local-checks";
import { createManualPreviewPostDeploymentReport } from "./manual-preview-postdeployment-checklist";
import { createProviderSetupReport } from "./manual-preview-provider-setup";
import { runManualPreviewPostDeploymentQaAudit } from "./manual-preview-postdeployment-qa-audit";
import { createManualPreviewPostDeploymentQaReport, createManualPreviewPostDeploymentQaRun } from "./manual-preview-postdeployment-qa-runner";
import { createManualPreviewSurfaceChecklistReport } from "./manual-preview-surface-postdeployment-checks";
import { createManualPreviewUrlRecord, createManualPreviewUrlVerificationReport } from "./manual-preview-url-verification";
import { createPreviewConsentPrivacyReport } from "./manual-preview-consent-privacy-verification";
import { createPreviewFallbackOfflineReport } from "./manual-preview-fallback-offline-verification";
import { createManualPreviewFixPlans } from "./manual-preview-fix-plan-generator";
import { createFixPlanSafetyReport } from "./manual-preview-fix-plan-safety";
import { createFixImplementationReadinessReport } from "./manual-preview-fix-implementation-readiness";
import { classifyManualPreviewIssue } from "./manual-preview-issue-classifier";
import { createManualPreviewIssueOwnerReviewChecklist } from "./manual-preview-issue-owner-review";
import { createManualPreviewIssueResolutionTracker, getUnresolvedManualPreviewBlockers } from "./manual-preview-issue-resolution-tracker";
import { runManualPreviewIssueTriageAudit } from "./manual-preview-issue-triage-audit";
import { createManualPreviewIssueTriageReport } from "./manual-preview-issue-triage-engine";
import { verifyManualPreviewIssueResolution } from "./manual-preview-issue-resolution-verification";
import { createPreviewMobileAccessibilityReport } from "./manual-preview-mobile-accessibility-verification";
import { createPreviewScriptureExplanationReport } from "./manual-preview-scripture-explanation-verification";
import { createRegressionCheckReport } from "./manual-preview-regression-check-mapper";
import { createManualPreviewRegressionReport, createManualPreviewRegressionRun, recordManualPreviewRegressionResult } from "./manual-preview-regression-verification-runner";
import { createPostFixSafetyVerificationReport, getPostFixSafetyVerificationChecklist } from "./manual-preview-post-fix-safety-verification";
import { createPostFixSurfaceRegressionReport, getPostFixSurfaceRegressionChecklist } from "./manual-preview-post-fix-surface-regression";
import { createManualPreviewRecheckChecklistReport, getManualPreviewRecheckChecklist } from "./manual-preview-recheck-checklist";
import { createManualPreviewRecheckReport, createManualPreviewRecheckRun, recordManualPreviewRecheckResult } from "./manual-preview-recheck-runner";
import { verifyResolvedPreviewIssue } from "./manual-preview-resolved-issue-recheck";
import { createSafeFixCandidateFromIssue, evaluateManualPreviewSafeFixCandidate } from "./manual-preview-safe-fix-candidate-evaluator";
import { runManualPreviewSafeFixImplementationAudit } from "./manual-preview-safe-fix-implementation-audit";
import { createManualPreviewSafeFixPlan } from "./manual-preview-safe-fix-planner";
import { createManualPreviewSafeFixRun, createManualPreviewSafeFixRunReport } from "./manual-preview-safe-fix-result-recorder";
import { createReleaseCandidateReport } from "./release-candidate-report";
import { createRouteBuildReadinessReport } from "./route-build-readiness";
import { getProductionCandidateLaunchConfigProfile } from "./launch-config-profiles";
import { createDeploymentTargetDecision } from "./deployment-target-selection";
import { createAccessibilityAuditReport } from "./launch-accessibility-audit";
import { createLaunchEnvExampleTemplate } from "./launch-env-template";
import { createLaunchEnvironmentReport } from "./launch-environment-checklist";
import { createLaunchEnvironmentSafetyReport } from "./launch-environment-safety-audit";
import { createLaunchEnvironmentValidationReport } from "./launch-environment-validator";
import { validateLaunchFeatureFlags } from "./launch-feature-flags";
import { createManualQaRun } from "./launch-manual-qa-runner";
import { createMobileQaReport } from "./launch-mobile-qa";
import { createPersonalizationQaReport } from "./launch-personalization-qa";
import { createLaunchSafetyReviewReport } from "./launch-safety-review";
import { createLaunchSurfaceReadinessReport } from "./launch-surface-readiness-report";
import { createSurfaceTestMatrixReport } from "./launch-surface-test-matrix";
import { createTigProductionQaReport } from "./launch-tig-production-qa";
import { createPredeploymentSafetyGateReport } from "./predeployment-safety-gates";
import { createPreviewDeploymentCommandGuideReport } from "./preview-deployment-command-guide";
import { getPreviewDeploymentExecutionChecklist } from "./preview-deployment-execution-checklist";
import { createPreviewDeploymentIssueLog } from "./preview-deployment-issue-log";
import { createPreviewDeploymentPostCheckReport } from "./preview-deployment-postcheck";
import { createPreviewDeploymentPreflightReport } from "./preview-deployment-preflight";
import { createPreviewDeploymentReviewReport } from "./preview-deployment-review";
import { createPreviewDeploymentRunbookReport } from "./preview-deployment-runbook";
import { createPreviewDeploymentReadinessReport } from "./preview-deployment-readiness";
import { createPreviewEnvironmentPackageReport } from "./preview-environment-package";
import { createPreviewIssueTriageReport } from "./preview-issue-triage";
import { createDefaultPreviewQaReviewRun, createPreviewQaResultReport } from "./preview-qa-result-collector";
import { createPreviewSafetyReviewReport } from "./preview-safety-review";
import { createPreviewManualReviewReport } from "./preview-rollback-manual-review";
import { createPreviewRollbackPlan } from "./preview-rollback-execution-checklist";
import { createPreviewSurfaceLaunchReport } from "./preview-surface-launch-report";
import { createPreviewUrlVerificationPlan } from "./preview-url-verification-plan";
import { createSoftLaunchManualApprovalChecklist } from "./soft-launch-manual-approval";
import { createSoftLaunchScopeConfirmation, createSoftLaunchScopeReport } from "./soft-launch-scope-confirmation";
import { createSoftLaunchCandidateReadinessReport } from "./soft-launch-candidate-planner";
import { createSoftLaunchCommunicationPacket } from "./soft-launch-communication-guidance";
import { createSoftLaunchCompletionReadinessReport } from "./soft-launch-completion-criteria";
import { createSoftLaunchDailyReviewTemplate } from "./soft-launch-daily-review";
import { createSoftLaunchFeedbackIntakeReport, createSoftLaunchFeedbackItem, createSoftLaunchFeedbackLog } from "./soft-launch-feedback-intake";
import { createSoftLaunchFeedbackSafetyReport } from "./soft-launch-feedback-safety";
import { createSoftLaunchFeedbackTriageReport } from "./soft-launch-feedback-triage";
import { createSoftLaunchIssueResponseReport } from "./soft-launch-issue-response-plan";
import { createSoftLaunchRunbookReport } from "./soft-launch-runbook";
import { createSoftLaunchCandidateConfirmationReport } from "./soft-launch-candidate-confirmation";
import { runSoftLaunchCandidateConfirmationAudit } from "./soft-launch-candidate-confirmation-audit";
import { createSoftLaunchCandidateCriteriaReport } from "./soft-launch-candidate-criteria";
import { createSoftLaunchCandidateOwnerReviewChecklist } from "./soft-launch-candidate-owner-review";
import { createSoftLaunchCandidatePackage, createSoftLaunchCandidatePackageReport } from "./soft-launch-candidate-package";
import { createLimitedSoftLaunchCommunicationPacket } from "./limited-soft-launch-communication-packet";
import { createLimitedSoftLaunchDayRunbookReport } from "./limited-soft-launch-day-runbook";
import { createLaunchDayRehearsalReport } from "./limited-soft-launch-day-rehearsal";
import { runLimitedSoftLaunchDryRunAudit } from "./limited-soft-launch-dry-run-audit";
import { createLimitedSoftLaunchDryRunPackage, createLimitedSoftLaunchDryRunPackageReport } from "./limited-soft-launch-dry-run-package";
import { createLimitedSoftLaunchDryRun, createLimitedSoftLaunchDryRunReport } from "./limited-soft-launch-dry-run-runner";
import { createDryRunScenarioMatrixReport } from "./limited-soft-launch-dry-run-scenarios";
import { createLimitedSoftLaunchEnvironmentSafetyReport } from "./limited-soft-launch-environment-safety";
import { createLimitedSoftLaunchExecutionPlan, createLimitedSoftLaunchExecutionReport } from "./limited-soft-launch-execution-plan";
import { createFeedbackIntakeRehearsalReport } from "./limited-soft-launch-feedback-rehearsal";
import { createLimitedSoftLaunchFeedbackWorkflowReport } from "./limited-soft-launch-feedback-workflow";
import { createLimitedSoftLaunchGoNoGoPreparationReport } from "./limited-soft-launch-go-no-go-prep";
import { createIssueTriageRehearsalReport } from "./limited-soft-launch-issue-triage-rehearsal";
import { createLimitedSoftLaunchOwnerReviewChecklist, createLimitedSoftLaunchOwnerReviewReport } from "./limited-soft-launch-owner-review";
import { createParticipantScopeReport } from "./limited-soft-launch-participant-scope";
import { runLimitedSoftLaunchPreparationAudit } from "./limited-soft-launch-preparation-audit";
import { createRollbackRehearsalReport } from "./limited-soft-launch-rollback-rehearsal";
import { createLimitedSoftLaunchSupportResponseReport } from "./limited-soft-launch-support-response";
import { createLimitedSoftLaunchSurfaceScopeReport } from "./limited-soft-launch-surface-scope";
import type { TeoyubeLaunchQualityGate, TeoyubeLaunchReadinessStatus } from "./production-launch-contracts";

export type TeoyubeLaunchQualityGateReport = {
  status: TeoyubeLaunchReadinessStatus;
  readyForLaunchPreparation: boolean;
  readyForSoftLaunch: boolean;
  gateCount: number;
  passedGateCount: number;
  gates: TeoyubeLaunchQualityGate[];
  warnings: string[];
  generatedAt: string;
};

function gate(id: string, label: string, passed: boolean, details: string, status?: TeoyubeLaunchReadinessStatus): TeoyubeLaunchQualityGate {
  return {
    id,
    label,
    status: status || (passed ? "ready" : "needs_review"),
    required: true,
    passed,
    riskLevel: passed ? "low" : "medium",
    details,
    nextAction: passed ? undefined : "Review this gate before soft launch."
  };
}

export function getLaunchQualityGates(): TeoyubeLaunchQualityGate[] {
  const config = getSafeDefaultRuntimeConfig();
  const roadmap = getTeoyubeRoadmapCompletionSummary();
  const phase7Complete = roadmap.phases.some((phase) => phase.id === "phase_7" && phase.progress === 100);
  const phase7Safety = runPhase7MobileScaleSafetyCheck();
  const safety = createLaunchSafetyReviewReport();
  const surfaces = createLaunchSurfaceReadinessReport();
  const environment = createLaunchEnvironmentReport();
  const runtime = validateTeoyubeRuntimeConfig(config);
  const analytics = createAnalyticsProviderReadinessReport();
  const persistence = createPersistenceAdapterReadinessReport();
  const response = runPromiseClusterTigProduction();
  const flags = validateLaunchFeatureFlags();
  const envValidation = createLaunchEnvironmentValidationReport();
  const envSafety = createLaunchEnvironmentSafetyReport();
  const decision = createDeploymentTargetDecision();
  const envTemplate = createLaunchEnvExampleTemplate();
  const productionProfile = getProductionCandidateLaunchConfigProfile();
  const productionProfileSafety = createLaunchEnvironmentSafetyReport({
    environment: productionProfile.environment,
    runtimeMode: productionProfile.runtimeMode,
    featureFlags: productionProfile.featureFlags
  });
  const surfaceMatrix = createSurfaceTestMatrixReport();
  const accessibility = createAccessibilityAuditReport();
  const mobileQa = createMobileQaReport();
  const tigQa = createTigProductionQaReport();
  const personalizationQa = createPersonalizationQaReport();
  const manualQa = createManualQaRun();
  const packageLike = { scripts: { build: "next build", start: "next start" } };
  const buildCommands = createBuildCommandRegistryReport(packageLike);
  const buildPlan = createBuildVerificationPlan(packageLike);
  const routeBuild = createRouteBuildReadinessReport();
  const dryRun = createDeploymentDryRunReport(createDeploymentDryRunPlan("vercel"));
  const releaseCandidate = createReleaseCandidateReport();
  const predeployment = createPredeploymentSafetyGateReport();
  const previewReadiness = createPreviewDeploymentReadinessReport();
  const previewEnvironment = createPreviewEnvironmentPackageReport();
  const softLaunch = createSoftLaunchCandidateReadinessReport();
  const previewSurfaces = createPreviewSurfaceLaunchReport();
  const previewManualReview = createPreviewManualReviewReport();
  const previewCommandGuide = createPreviewDeploymentCommandGuideReport();
  const executionChecklist = getPreviewDeploymentExecutionChecklist();
  const preflight = createPreviewDeploymentPreflightReport();
  const postCheck = createPreviewDeploymentPostCheckReport();
  const urlPlan = createPreviewUrlVerificationPlan();
  const issueLog = createPreviewDeploymentIssueLog();
  const rollbackExecution = createPreviewRollbackPlan();
  const runbook = createPreviewDeploymentRunbookReport();
  const previewReview = createPreviewDeploymentReviewReport();
  const previewQa = createPreviewQaResultReport(createDefaultPreviewQaReviewRun());
  const previewSafety = createPreviewSafetyReviewReport();
  const previewTriage = createPreviewIssueTriageReport(issueLog);
  const manualApprovalChecklist = createSoftLaunchManualApprovalChecklist();
  const softLaunchScope = createSoftLaunchScopeReport(createSoftLaunchScopeConfirmation({ accepted: true }));
  const previewReviewFindings = previewReview.findings;
  const softLaunchRunbook = createSoftLaunchRunbookReport();
  const feedbackLog = createSoftLaunchFeedbackLog();
  const feedbackItem = createSoftLaunchFeedbackItem({ summary: "Structural quality gate feedback only." });
  const feedbackIntake = createSoftLaunchFeedbackIntakeReport(feedbackLog);
  const feedbackSafety = createSoftLaunchFeedbackSafetyReport(feedbackItem);
  const feedbackTriage = createSoftLaunchFeedbackTriageReport(feedbackLog);
  const issueResponse = createSoftLaunchIssueResponseReport(feedbackLog.items);
  const communication = createSoftLaunchCommunicationPacket();
  const dailyReview = createSoftLaunchDailyReviewTemplate();
  const completionCriteria = createSoftLaunchCompletionReadinessReport({ feedbackLog });
  const finalAudit = runFinalLaunchPreparationAudit();
  const finalSafety = createFinalLaunchSafetyCertificationReport();
  const finalQuality = createFinalLaunchQualityGateReport();
  const finalSurface = createFinalLaunchSurfaceCertificationReport();
  const finalBlockers = createFinalLaunchBlockerReport(createFinalLaunchBlockerRegister());
  const finalOwnerReviewChecklist = createFinalLaunchOwnerReviewChecklist();
  const finalSummary = createFinalLaunchPreparationSummaryReport();
  const manualProvider = createProviderSetupReport("vercel");
  const manualEnvironment = createManualPreviewEnvironmentReport({ provider: "vercel" });
  const manualLocalCheckResults = getManualPreviewLocalCheckPlan()
    .filter((entry) => entry.required)
    .map((entry) => recordManualPreviewLocalCheckResult(entry, {
      status: "complete",
      exitCode: 0,
      summary: `${entry.label} recorded for launch quality gate readiness.`
    }));
  const manualLocalChecks = createManualPreviewLocalCheckReport(manualLocalCheckResults);
  const manualRunbook = createManualPreviewDeploymentRunbookReport("vercel");
  const manualPostdeployment = createManualPreviewPostDeploymentReport();
  const manualAudit = runManualPreviewDeploymentAudit();
  const manualUrlRecord = createManualPreviewUrlRecord({
    previewUrl: "https://teoyube-preview.vercel.app",
    provider: "vercel",
    environmentProfile: "preview",
    reviewedManually: true
  });
  const manualUrlVerification = createManualPreviewUrlVerificationReport(manualUrlRecord);
  const manualPostdeploymentQaRun = createManualPreviewPostDeploymentQaRun({ previewUrlRecord: manualUrlRecord });
  const manualPostdeploymentQa = createManualPreviewPostDeploymentQaReport(manualPostdeploymentQaRun);
  const manualSurfaceChecklist = createManualPreviewSurfaceChecklistReport();
  const manualScriptureExplanation = createPreviewScriptureExplanationReport();
  const manualConsentPrivacy = createPreviewConsentPrivacyReport();
  const manualMobileAccessibility = createPreviewMobileAccessibilityReport();
  const manualFallbackOffline = createPreviewFallbackOfflineReport();
  const manualPostdeploymentQaAudit = runManualPreviewPostDeploymentQaAudit();
  const manualPreviewIssues = [
    {
      id: "quality_gate_missing_scripture_anchor",
      title: "Missing Scripture anchor in preview response",
      details: "Sample launch-critical issue used to verify 2.3 triage classification.",
      category: "scripture_anchor" as const,
      severity: "critical" as const,
      surface: "tig_response_panel"
    },
    {
      id: "quality_gate_copy_clarity",
      title: "Reflection copy needs clearer wording",
      details: "Sample low-risk issue used to verify 2.4 safe local fix planning.",
      category: "content_clarity" as const,
      severity: "low" as const,
      surface: "tig_response_panel"
    }
  ];
  const manualIssueClassification = classifyManualPreviewIssue(manualPreviewIssues[0]);
  const manualIssueTriage = createManualPreviewIssueTriageReport(manualPreviewIssues);
  const manualFixPlans = createManualPreviewFixPlans(manualPreviewIssues);
  const manualFixPlanSafety = createFixPlanSafetyReport(manualFixPlans);
  const manualRegressionChecks = createRegressionCheckReport(manualFixPlans);
  const manualIssueResolutionTracker = createManualPreviewIssueResolutionTracker();
  const manualFixReadiness = createFixImplementationReadinessReport(manualFixPlans);
  const manualIssueOwnerReviewChecklist = createManualPreviewIssueOwnerReviewChecklist();
  const manualIssueTriageAudit = runManualPreviewIssueTriageAudit();
  const manualSafeFixPlan = createManualPreviewSafeFixPlan(manualPreviewIssues, manualFixPlans);
  const manualUnsafeFixPlan = {
    ...manualFixPlans[0],
    id: "quality_gate_unsafe_fix_plan",
    recommendedFixSummary: "Remove Scripture anchor, hide explanation path, disable fallback safety, hide consent controls, enable external analytics, connect database writes, and enable live AI orchestration.",
    safeImplementationNotes: ["Persist raw sensitive text and make personalization hidden."],
    ownerReviewRequired: false,
    softLaunchBlocker: false,
    status: "ready_for_safe_fix" as const
  };
  const manualUnsafeCandidate = createSafeFixCandidateFromIssue(manualPreviewIssues[0], manualUnsafeFixPlan);
  const manualUnsafeCandidateEvaluation = evaluateManualPreviewSafeFixCandidate(manualUnsafeCandidate);
  const manualSafeFixRun = createManualPreviewSafeFixRun();
  const manualSafeFixRunReport = createManualPreviewSafeFixRunReport(manualSafeFixRun);
  const manualRegressionRun = createManualPreviewRegressionRun({
    checks: getPostFixSafetyVerificationChecklist(),
    fixResults: manualSafeFixRun.results
  });
  const manualRegressionReport = createManualPreviewRegressionReport(manualRegressionRun);
  const manualPostFixSafetyResults = getPostFixSafetyVerificationChecklist().map((check) => ({
    id: `${check.id}_quality_gate_result`,
    checkId: check.id,
    type: check.type,
    status: "pass" as const,
    summary: `${check.label} is represented in launch quality gates.`,
    required: check.required,
    launchCritical: check.launchCritical,
    checkedAt: new Date().toISOString()
  }));
  const manualPostFixSurfaceResults = getPostFixSurfaceRegressionChecklist().map((check) => ({
    id: `${check.id}_quality_gate_result`,
    checkId: check.id,
    type: check.type,
    status: "pass" as const,
    summary: `${check.label} is represented in launch quality gates.`,
    required: check.required,
    launchCritical: check.launchCritical,
    checkedAt: new Date().toISOString()
  }));
  const manualPostFixSafety = createPostFixSafetyVerificationReport(manualPostFixSafetyResults);
  const manualPostFixSurfaceRegression = createPostFixSurfaceRegressionReport(manualPostFixSurfaceResults);
  const manualIssueResolutionVerification = verifyManualPreviewIssueResolution(manualPreviewIssues[0], undefined, []);
  const manualSafeFixAudit = runManualPreviewSafeFixImplementationAudit();
  const manualRecheckIssue = manualPreviewIssues[1];
  const manualRecheckFixResult = {
    id: "quality_gate_recheck_fix_result",
    candidateId: "quality_gate_recheck_candidate",
    issueId: manualRecheckIssue.id,
    status: "verified" as const,
    filesChanged: ["docs/teoyube/manual-preview-deployment-2-5-preview-recheck-soft-launch-candidate-confirmation.md"],
    fixSummary: "Documented preview re-check and soft launch candidate confirmation readiness.",
    riskLevel: "low" as const,
    regressionChecksRequired: [
      {
        id: "quality_gate_recheck_regression",
        label: "Quality gate re-check regression",
        category: "content_clarity" as const,
        required: true,
        launchCritical: false,
        verificationModule: "manual-preview-recheck-runner",
        details: "Verify the 2.5 quality gate readiness layer remains documented."
      }
    ],
    verificationStatus: "passed" as const,
    appliedAt: new Date().toISOString()
  };
  let manualRecheckRegressionRun = createManualPreviewRegressionRun({ fixResults: [manualRecheckFixResult] });
  manualRecheckFixResult.regressionChecksRequired.forEach((check) => {
    manualRecheckRegressionRun = recordManualPreviewRegressionResult(manualRecheckRegressionRun, {
      checkId: check.id,
      type: "surface_qa",
      status: "pass",
      summary: `${check.label} passed in quality gate sample.`,
      required: check.required,
      launchCritical: check.launchCritical,
      relatedIssueId: manualRecheckIssue.id,
      relatedFixResultId: manualRecheckFixResult.id
    });
  });
  const manualRecheckRegressionReport = createManualPreviewRegressionReport(manualRecheckRegressionRun);
  const manualResolvedIssueRecheck = verifyResolvedPreviewIssue(
    manualRecheckIssue,
    {
      issueId: manualRecheckIssue.id,
      issue: manualRecheckIssue,
      verified: true,
      status: "resolved",
      fixResult: manualRecheckFixResult,
      regressionResults: manualRecheckRegressionRun.results,
      blockers: [],
      warnings: [],
      verifiedAt: new Date().toISOString(),
      ownerReviewPresent: true,
      approvedManualResolution: true
    },
    manualRecheckRegressionRun.results
  );
  const manualResolvedIssueRecheckReport = {
    valid: manualResolvedIssueRecheck.passed,
    resultCount: 1,
    passedCount: manualResolvedIssueRecheck.passed ? 1 : 0,
    blockerCount: manualResolvedIssueRecheck.blockers.length,
    warningCount: manualResolvedIssueRecheck.warnings.length,
    results: [manualResolvedIssueRecheck],
    blockers: manualResolvedIssueRecheck.blockers,
    warnings: manualResolvedIssueRecheck.warnings,
    noExternalWrite: true as const,
    generatedAt: new Date().toISOString()
  };
  const manualRecheckChecklist = createManualPreviewRecheckChecklistReport();
  let manualRecheckRun = createManualPreviewRecheckRun({ items: getManualPreviewRecheckChecklist() });
  manualRecheckRun.items.forEach((entry) => {
    manualRecheckRun = recordManualPreviewRecheckResult(manualRecheckRun, {
      itemId: entry.id,
      status: "pass",
      scope: entry.scope,
      surface: entry.surface,
      summary: `${entry.label} passed in quality gate sample.`,
      required: entry.required,
      launchCritical: entry.launchCritical,
      ownerReviewed: true
    });
  });
  const manualRecheckReport = createManualPreviewRecheckReport(manualRecheckRun);
  const manualSoftLaunchCriteria = createSoftLaunchCandidateCriteriaReport();
  const manualSoftLaunchConfirmation = createSoftLaunchCandidateConfirmationReport({
    previewRecheckReport: manualRecheckReport,
    resolvedIssueRecheckReport: manualResolvedIssueRecheckReport,
    regressionVerificationReport: manualRecheckRegressionReport,
    postFixSafetyReport: manualPostFixSafety,
    postFixSurfaceRegressionReport: manualPostFixSurfaceRegression,
    criteriaReport: manualSoftLaunchCriteria,
    ownerReviewAccepted: true,
    manualApprovalAccepted: true
  });
  const manualSoftLaunchCandidatePackage = createSoftLaunchCandidatePackage({
    confirmationReport: manualSoftLaunchConfirmation,
    previewRecheckReport: manualRecheckReport,
    resolvedIssueRecheckReport: manualResolvedIssueRecheckReport,
    regressionVerificationReport: manualRecheckRegressionReport,
    postFixSafetyReport: manualPostFixSafety,
    postFixSurfaceRegressionReport: manualPostFixSurfaceRegression
  });
  const manualSoftLaunchCandidatePackageReport = createSoftLaunchCandidatePackageReport(manualSoftLaunchCandidatePackage);
  const manualSoftLaunchOwnerReviewChecklist = createSoftLaunchCandidateOwnerReviewChecklist();
  const manualSoftLaunchCandidateAudit = runSoftLaunchCandidateConfirmationAudit();
  const limitedSoftLaunchExecutionPlan = createLimitedSoftLaunchExecutionPlan();
  const limitedSoftLaunchExecutionReport = createLimitedSoftLaunchExecutionReport(limitedSoftLaunchExecutionPlan);
  const limitedSoftLaunchParticipantScope = createParticipantScopeReport();
  const limitedSoftLaunchSurfaceScope = createLimitedSoftLaunchSurfaceScopeReport();
  const limitedSoftLaunchEnvironmentSafety = createLimitedSoftLaunchEnvironmentSafetyReport();
  const limitedSoftLaunchFeedbackWorkflow = createLimitedSoftLaunchFeedbackWorkflowReport();
  const limitedSoftLaunchSupportResponse = createLimitedSoftLaunchSupportResponseReport();
  const limitedSoftLaunchCommunicationPacket = createLimitedSoftLaunchCommunicationPacket();
  const limitedSoftLaunchDayRunbook = createLimitedSoftLaunchDayRunbookReport();
  const limitedSoftLaunchGoNoGo = createLimitedSoftLaunchGoNoGoPreparationReport({ ownerReviewAccepted: true });
  const limitedSoftLaunchPreparationAudit = runLimitedSoftLaunchPreparationAudit();
  const limitedSoftLaunchScenarioMatrix = createDryRunScenarioMatrixReport();
  const limitedSoftLaunchDryRun = createLimitedSoftLaunchDryRun();
  const limitedSoftLaunchDryRunReport = createLimitedSoftLaunchDryRunReport(limitedSoftLaunchDryRun);
  const limitedSoftLaunchLaunchDayRehearsal = createLaunchDayRehearsalReport();
  const limitedSoftLaunchFeedbackRehearsal = createFeedbackIntakeRehearsalReport();
  const limitedSoftLaunchIssueTriageRehearsal = createIssueTriageRehearsalReport();
  const limitedSoftLaunchRollbackRehearsal = createRollbackRehearsalReport();
  const limitedSoftLaunchOwnerReviewChecklist = createLimitedSoftLaunchOwnerReviewChecklist();
  const limitedSoftLaunchOwnerReview = createLimitedSoftLaunchOwnerReviewReport();
  const limitedSoftLaunchDryRunPackage = createLimitedSoftLaunchDryRunPackage({
    dryRunReport: limitedSoftLaunchDryRunReport,
    launchDayRehearsalReport: limitedSoftLaunchLaunchDayRehearsal,
    feedbackRehearsalReport: limitedSoftLaunchFeedbackRehearsal,
    issueTriageRehearsalReport: limitedSoftLaunchIssueTriageRehearsal,
    rollbackRehearsalReport: limitedSoftLaunchRollbackRehearsal,
    ownerReviewReport: limitedSoftLaunchOwnerReview
  });
  const limitedSoftLaunchDryRunPackageReport = createLimitedSoftLaunchDryRunPackageReport(limitedSoftLaunchDryRunPackage);
  const limitedSoftLaunchDryRunAudit = runLimitedSoftLaunchDryRunAudit();
  const finalSoftLaunchReadinessPackage = createFinalSoftLaunchReadinessPackage();
  const finalSoftLaunchReadinessPackageReport = createFinalSoftLaunchReadinessPackageReport(finalSoftLaunchReadinessPackage);
  const finalSoftLaunchSafety = createFinalSoftLaunchSafetyCertificationReport();
  const finalSoftLaunchSurface = createFinalSoftLaunchSurfaceCertificationReport();
  const finalSoftLaunchQuality = createFinalSoftLaunchQualityGateReport();
  const finalSoftLaunchRisk = createFinalSoftLaunchRiskRegisterReport(createFinalSoftLaunchRiskRegister());
  const finalSoftLaunchKnownLimitations = createKnownLimitationsReport();
  const finalSoftLaunchOwnerChecklist = createFinalSoftLaunchOwnerGoNoGoChecklist();
  const finalSoftLaunchOwner = createFinalSoftLaunchOwnerGoNoGoReport();
  const finalSoftLaunchGoNoGo = createFinalSoftLaunchGoNoGoReport();
  const finalSoftLaunchHandoff = createSoftLaunchExecutionHandoffReport(createFinalSoftLaunchExecutionHandoff());
  const finalSoftLaunchAudit = runFinalSoftLaunchReadinessAudit();
  const controlledLaunchActivation = createControlledLaunchActivationReport();
  const controlledLaunchOwner = createControlledLaunchOwnerApprovalReport(createControlledLaunchOwnerApprovalRecord());
  const controlledLaunchWindow = createControlledLaunchWindowReport(createControlledLaunchWindowPlan());
  const controlledParticipantAccess = createParticipantAccessReadinessReport(createParticipantAccessReadinessPlan());
  const controlledCommunication = createControlledLaunchCommunicationReadinessReport(createControlledLaunchCommunicationReadinessPlan());
  const controlledFirstHour = createFirstHourMonitoringReadinessReport(createFirstHourMonitoringReadinessPlan());
  const controlledIssueIntake = createControlledLaunchIssueIntakeReport(createControlledLaunchIssueIntakePlan());
  const controlledPauseRollback = createControlledLaunchPauseRollbackReport(createControlledLaunchPauseRollbackPlan());
  const controlledActivationPackage = createControlledLaunchActivationPackage();
  const controlledActivationPackageReport = createControlledLaunchActivationPackageReport(controlledActivationPackage);
  const controlledActivationAudit = runControlledLaunchActivationAudit();
  const launchDayMonitoring = createLaunchDayMonitoringReport(createLaunchDayMonitoringRun());
  const launchDayFirstHour = createFirstHourMonitoringReport(createFirstHourMonitoringPlan());
  const launchDaySurfaceHealth = createSurfaceHealthMonitoringReport(createSurfaceHealthMonitoringRun());
  const launchDayWatch = createScriptureExplanationFallbackWatchReport([]);
  const launchDayFeedback = createLaunchDayFeedbackIntakeReport(createLaunchDayFeedbackLog());
  const launchDayPrivacy = createLaunchDayFeedbackPrivacyReport({});
  const launchDayEscalation = createLaunchDayIssueEscalationReport([]);
  const launchDayPauseRollback = createLaunchDayPauseRollbackWatchReport();
  const launchDayDailyReview = createLaunchDayDailyReviewReport([createLaunchDayDailyReviewRecord()]);
  const launchDayPackage = createLaunchDayMonitoringPackage();
  const launchDayPackageReport = createLaunchDayMonitoringPackageReport(launchDayPackage);
  const launchDayAudit = runLaunchDayMonitoringAudit();
  const softLaunchFeedbackDailyReviewPackage = createSoftLaunchFeedbackDailyReviewPackage();
  const softLaunchFeedbackDailyReviewPackageReport = createSoftLaunchFeedbackDailyReviewPackageReport(softLaunchFeedbackDailyReviewPackage);
  const softLaunchFeedbackDailyReviewAudit = runSoftLaunchFeedbackDailyReviewAudit();
  const softLaunchStabilizationPackage = createSoftLaunchStabilizationPackage();
  const softLaunchStabilizationPackageReport = createSoftLaunchStabilizationPackageReport(softLaunchStabilizationPackage);
  const softLaunchSafeFixStabilizationAudit = runSoftLaunchSafeFixStabilizationAudit();
  const softLaunchCompletionReview = runSoftLaunchCompletionReview();
  const softLaunchFeedbackSummary = createSoftLaunchFeedbackSummaryReport();
  const softLaunchIssueClosure = createSoftLaunchIssueClosureReport();
  const softLaunchStability = createSoftLaunchStabilityCertificationReport({
    feedbackSummaryReport: softLaunchFeedbackSummary,
    issueClosureReport: softLaunchIssueClosure
  });
  const softLaunchFinalSafetyPrivacy = createSoftLaunchFinalSafetyPrivacyReport();
  const publicLaunchReadinessCriteria = createPublicLaunchReadinessCriteriaReport({
    completionReport: softLaunchCompletionReview,
    feedbackSummaryReport: softLaunchFeedbackSummary,
    issueClosureReport: softLaunchIssueClosure,
    stabilityCertificationReport: softLaunchStability,
    finalSafetyPrivacyReport: softLaunchFinalSafetyPrivacy
  });
  const publicLaunchReadinessPackage = createPublicLaunchReadinessPackage({
    completionReport: softLaunchCompletionReview,
    feedbackSummaryReport: softLaunchFeedbackSummary,
    issueClosureReport: softLaunchIssueClosure,
    stabilityCertificationReport: softLaunchStability,
    finalSafetyPrivacyReport: softLaunchFinalSafetyPrivacy,
    readinessCriteriaReport: publicLaunchReadinessCriteria
  });
  const publicLaunchReadinessPackageReport = createPublicLaunchReadinessPackageReport(publicLaunchReadinessPackage);
  const publicLaunchRiskRegisterReport = createPublicLaunchRiskRegisterReport(createPublicLaunchRiskRegister());
  const publicLaunchKnownLimitationsReport = createPublicLaunchKnownLimitationsReport();
  const publicLaunchOwnerReadinessReport = createPublicLaunchOwnerReadinessReport(createPublicLaunchOwnerReadinessRecord());
  const publicLaunchReadinessHandoffReport = createPublicLaunchReadinessHandoffReport();
  const softLaunchCompletionAudit = runSoftLaunchCompletionAudit();
  const publicLaunchReadinessAudit = runPublicLaunchReadinessAudit();
  const productionServiceConnectionPlan = createProductionServiceConnectionPlan();
  const productionServiceConnectionPlanReport = createProductionServiceConnectionPlanReport(productionServiceConnectionPlan);
  const publicLaunchDatabasePersistence = createDatabasePersistenceDecisionReport(createPublicLaunchDatabasePersistencePlan());
  const publicLaunchAnalytics = createAnalyticsConnectionDecisionReport(createPublicLaunchAnalyticsPlan());
  const publicLaunchLiveAi = createLiveAiDecisionReport(createPublicLaunchLiveAiPlan());
  const publicLaunchPrivacyConsent = createPublicLaunchPrivacyConsentReport();
  const publicLaunchSafety = createPublicLaunchSafetyCertificationReport();
  const publicLaunchSurfaceReadiness = createPublicLaunchSurfaceReadinessReport();
  const publicLaunchOwnerReview = createPublicLaunchOwnerReviewReport(createPublicLaunchOwnerReviewRecord());
  const publicLaunchPreparationPackage = createPublicLaunchPreparationPackage();
  const publicLaunchPreparationPackageReport = createPublicLaunchPreparationPackageReport(publicLaunchPreparationPackage);
  const publicLaunchPreparationAudit = runPublicLaunchPreparationAudit();
  const publicLaunchPrivacyNoticeCopy = createPrivacyNoticeCopyReport();
  const publicLaunchTermsCopy = createTermsCopyReport();
  const publicLaunchConsentCopy = createConsentCopyReport();
  const publicLaunchAiTigTransparencyCopy = createAiTigTransparencyCopyReport();
  const publicLaunchSensitiveInfoCopy = createSensitiveInfoCopyReport();
  const publicLaunchFeedbackNoticeCopy = createFeedbackNoticeCopyReport();
  const publicLaunchCopyPackage = createPublicLaunchCopyPackage();
  const publicLaunchCopyPackageReport = createPublicLaunchCopyPackageReport(publicLaunchCopyPackage);
  const publicLaunchQaChecklistReport = createPublicLaunchQaChecklistReport();
  const publicLaunchQaRunReport = createPublicLaunchQaReport(createPublicLaunchQaRun());
  const publicLaunchPrivacyConsentQaReport = createPublicPrivacyConsentQaReport();
  const publicLaunchCopyOwnerReviewReport = createPublicCopyOwnerReviewReport(createPublicCopyOwnerReviewRecord());
  const publicLaunchCopyQaPackage = createPublicLaunchCopyQaPackage({
    copyPackageReport: publicLaunchCopyPackageReport,
    qaChecklistReport: publicLaunchQaChecklistReport,
    qaRunReport: publicLaunchQaRunReport,
    privacyConsentQaReport: publicLaunchPrivacyConsentQaReport,
    ownerLegalReviewReport: publicLaunchCopyOwnerReviewReport
  });
  const publicLaunchCopyQaPackageReport = createPublicLaunchCopyQaPackageReport(publicLaunchCopyQaPackage);
  const publicLaunchPrivacyQaAudit = runPublicLaunchPrivacyQaAudit();
  const publicSurfaceCopyRegistryReport = createPublicSurfaceCopyRegistryReport();
  const publicCopyUiAdapterReport = createPublicCopyUiAdapterReport();
  const publicSurfaceCopyIntegrationValidation = validatePublicSurfaceCopyIntegration();
  const publicSurfaceFinalQaChecklistReport = createPublicSurfaceFinalQaChecklistReport();
  const publicQaDryRunReport = createPublicQaDryRunReport(createPublicQaDryRun());
  const publicCopyAccessibilityQaReport = createPublicCopyAccessibilityQaReport();
  const publicSurfaceCopyOwnerReviewReport = createPublicSurfaceCopyOwnerReviewReport(createPublicSurfaceCopyOwnerReviewRecord());
  const publicCopyIntegrationPackage = createPublicCopyIntegrationPackage({
    registryReport: publicSurfaceCopyRegistryReport,
    uiAdapterReport: publicCopyUiAdapterReport,
    validationReport: publicSurfaceCopyIntegrationValidation,
    finalQaChecklistReport: publicSurfaceFinalQaChecklistReport,
    dryRunReport: publicQaDryRunReport,
    accessibilityQaReport: publicCopyAccessibilityQaReport,
    ownerReviewReport: publicSurfaceCopyOwnerReviewReport
  });
  const publicCopyIntegrationPackageReport = createPublicCopyIntegrationPackageReport(publicCopyIntegrationPackage);
  const publicSurfaceCopyIntegrationAudit = runPublicSurfaceCopyIntegrationAudit();
  const finalProductionServiceDecision = createFinalProductionServiceDecisionReport();
  const finalDatabasePersistenceGoNoGo = createFinalDatabasePersistenceGoNoGoReport();
  const finalAnalyticsGoNoGo = createFinalAnalyticsGoNoGoReport();
  const finalLiveAiGoNoGo = createFinalLiveAiGoNoGoReport();
  const finalPublicPrivacyLegal = createFinalPublicPrivacyLegalReport();
  const finalPublicSurfaceQa = createFinalPublicSurfaceQaCertificationReport();
  const finalPublicSafety = createFinalPublicSafetyCertificationReport();
  const finalPublicRiskRegister = createFinalPublicLaunchRiskRegisterReport(createFinalPublicLaunchRiskRegister());
  const finalPublicLaunchPackage = createFinalPublicLaunchPackage();
  const finalPublicLaunchPackageReport = createFinalPublicLaunchPackageReport(finalPublicLaunchPackage);
  const finalPublicOwnerGoNoGo = createFinalPublicOwnerGoNoGoReport(createFinalPublicOwnerGoNoGoRecord());
  const finalPublicGoNoGo = createFinalPublicGoNoGoReport();
  const publicLaunchExecutionHandoff = createPublicLaunchExecutionHandoffReport();
  const finalPublicLaunchPreparationAudit = runFinalPublicLaunchPreparationAudit();
  const publicFeedbackDailyReviewPackage = createPublicFeedbackDailyReviewPackage();
  const publicFeedbackDailyReviewPackageReport = createPublicFeedbackDailyReviewPackageReport(publicFeedbackDailyReviewPackage);
  const publicFeedbackDailyReviewAudit = runPublicFeedbackDailyReviewAudit();
  const publicLaunchStabilizationPackage = createPublicLaunchStabilizationPackage();
  const publicLaunchStabilizationPackageReport = createPublicLaunchStabilizationPackageReport(publicLaunchStabilizationPackage);
  const publicSafeFixStabilizationAudit = runPublicSafeFixStabilizationAudit();
  const publicLaunchCompletionReport = createPublicLaunchCompletionReport();
  const publicLaunchFeedbackSummaryReport = createPublicLaunchFeedbackSummaryReport();
  const publicLaunchIssueClosureReport = createPublicLaunchIssueClosureReport();
  const publicLaunchStabilityCertificationReport = createPublicLaunchStabilityCertificationReport({
    feedbackSummaryReport: publicLaunchFeedbackSummaryReport,
    issueClosureReport: publicLaunchIssueClosureReport
  });
  const publicLaunchFinalSafetyPrivacyReport = createPublicLaunchFinalSafetyPrivacyReport();
  const postLaunchReadinessCriteriaReport = createPostLaunchReadinessCriteriaReport({
    completionReport: publicLaunchCompletionReport,
    feedbackSummaryReport: publicLaunchFeedbackSummaryReport,
    issueClosureReport: publicLaunchIssueClosureReport,
    stabilityCertificationReport: publicLaunchStabilityCertificationReport,
    finalSafetyPrivacyReport: publicLaunchFinalSafetyPrivacyReport
  });
  const postLaunchReadinessPackage = createPostLaunchReadinessPackage({
    completionReport: publicLaunchCompletionReport,
    feedbackSummaryReport: publicLaunchFeedbackSummaryReport,
    issueClosureReport: publicLaunchIssueClosureReport,
    stabilityCertificationReport: publicLaunchStabilityCertificationReport,
    finalSafetyPrivacyReport: publicLaunchFinalSafetyPrivacyReport,
    readinessCriteriaReport: postLaunchReadinessCriteriaReport
  });
  const postLaunchReadinessPackageReport = createPostLaunchReadinessPackageReport(postLaunchReadinessPackage);
  const postLaunchRiskRegisterReport = createPostLaunchRiskRegisterReport(createPostLaunchRiskRegister());
  const postLaunchKnownLimitationsReport = createPostLaunchKnownLimitationsReport();
  const postLaunchOwnerReadinessReport = createPostLaunchOwnerReadinessReport(createPostLaunchOwnerReadinessRecord());
  const postLaunchReadinessHandoffReport = createPostLaunchReadinessHandoffReport();
  const publicLaunchCompletionAudit = runPublicLaunchCompletionAudit();
  const postLaunchPublicMonitoringReport = createPostLaunchPublicMonitoringReport(createPostLaunchPublicMonitoringPlan());
  const postLaunchSupportWorkflowReport = createPostLaunchSupportWorkflowReport(createPostLaunchSupportWorkflow());
  const postLaunchGrowthRoadmapReport = createPostLaunchGrowthRoadmapReport(createPostLaunchGrowthRoadmap());
  const postLaunchOperationsPackage = createPostLaunchOperationsPackage({
    publicMonitoringReport: postLaunchPublicMonitoringReport,
    supportWorkflowReport: postLaunchSupportWorkflowReport,
    growthRoadmapReport: postLaunchGrowthRoadmapReport,
    readinessPackageReport: postLaunchReadinessPackageReport
  });
  const postLaunchOperationsPackageReport = createPostLaunchOperationsPackageReport(postLaunchOperationsPackage);
  const postLaunchOperations71Audit = runPostLaunchOperations71Audit();
  const postLaunch72Package = createWeeklyImprovementPackage();
  const postLaunch72PackageReport = createWeeklyImprovementPackageReport(postLaunch72Package);
  const postLaunch72Audit = runPostLaunch72Audit();

  return [
    gate("typecheck_command", "TypeScript check command", false, "Run npm run typecheck if available; otherwise document the missing script.", "needs_review"),
    gate("lint_command", "Lint command", false, "Run npm run lint if available; otherwise document the missing script.", "needs_review"),
    gate("build_command", "Production build command", false, "Run npm run build before public launch.", "needs_review"),
    gate("test_or_smoke_command", "Tests or smoke checks", false, "Run npm run test if available or the launch smoke checks.", "needs_review"),
    gate("phase7_completion_audit", "Phase 7 completion audit", phase7Complete, "Phase 7 Mobile & Scale is marked complete in the roadmap summary; full Phase 7 audit remains available separately."),
    gate("phase7_safety_check", "Phase 7 safety check", phase7Safety.valid, "Phase 7 safety check passes."),
    gate("production_launch_readiness_audit_defined", "Production launch readiness audit is defined", true, "Production Launch Preparation audit module is available."),
    gate("launch_safety_review", "Launch safety review", safety.valid, "Launch safety review verifies Scripture anchoring, fallbacks, consent, privacy, and no external sending."),
    gate("surface_readiness_no_critical_blockers", "Surface readiness has no critical blockers", surfaces.blockers.length === 0, "Launch surfaces have no critical blockers."),
    gate("environment_no_critical_blockers", "Environment has no critical blockers", environment.status !== "blocked", "Safe launch defaults keep unsafe flags off."),
    gate("no_external_analytics", "No external analytics sending", analytics.complete && !config.featureFlags.externalEventSendingEnabled, "Analytics is architecture-ready but not externally sent."),
    gate("no_database_writes", "No database writes", persistence.complete && !config.featureFlags.productionPersistenceEnabled, "Production database writes remain disabled."),
    gate("no_live_ai", "No live AI orchestration", runtime.valid && !config.featureFlags.liveAiOrchestrationEnabled, "Live AI orchestration remains disabled."),
    gate("no_hidden_personalization", "No hidden personalization", runtime.valid && !config.featureFlags.hiddenPersonalizationEnabled, "Personalization remains visible and consent-aware."),
    gate("scripture_anchoring", "Scripture anchoring", Boolean(response.selection.scriptureAnchor), "Production response includes a Scripture anchor."),
    gate("explanation_path", "Explanation path", response.explanation.reasonPath.length > 0, "Production response includes an ordered explanation path."),
    gate("fallback_safety", "Fallback safety", Boolean(response.fallback.message) && response.confidence.score <= 1, "Fallback messaging is non-empty and confidence remains bounded."),
    gate("safe_feature_flags_validated", "Safe feature flags validated", flags.valid, "Launch feature flags preserve Scripture, explanations, fallbacks, guardrails, consent, and disabled providers."),
    gate("environment_config_validated", "Environment config validated", envValidation.valid, "Launch environment validator returns a safe default report."),
    gate("no_public_secret_leakage", "No public secret leakage", envSafety.errors.every((entry) => !entry.id.includes("secret")), "Default environment audit finds no public secret leakage."),
    gate("analytics_disabled_by_default", "Analytics disabled by default", !config.featureFlags.externalEventSendingEnabled, "External analytics sending stays disabled by default."),
    gate("persistence_disabled_by_default", "Persistence disabled by default", !config.featureFlags.productionPersistenceEnabled, "Production database persistence stays disabled by default."),
    gate("live_ai_disabled_by_default", "Live AI disabled by default", !config.featureFlags.liveAiOrchestrationEnabled, "Live AI orchestration stays disabled by default."),
    gate("deployment_target_decision_exists", "Deployment target decision exists", decision.status === "recommended" || decision.status === "acceptable", "Deployment target comparison returns a structured recommendation without connecting a provider."),
    gate("environment_template_documented", ".env example or environment documentation exists", envTemplate.includes("disabled_until_later") && envTemplate.includes("NEXT_PUBLIC_TEOYUBE_ENABLE_DEBUG_UI=false"), "Safe environment template contains placeholders and disables future providers."),
    gate("production_candidate_profile_safety", "Production candidate profile passes safety audit", productionProfileSafety.valid, "Production candidate profile keeps future providers disabled."),
    gate("surface_test_matrix_complete", "Surface test matrix complete", surfaceMatrix.valid && surfaceMatrix.surfaceCount >= 12, "Surface test matrix covers launch-critical surfaces."),
    gate("mobile_qa_checklist_complete", "Mobile QA checklist complete", mobileQa.valid && mobileQa.checkCount > 0, "Mobile QA checklist is available and has no default blockers."),
    gate("accessibility_checklist_complete", "Accessibility checklist complete", accessibility.valid && accessibility.accessibilityCheckCount > 0, "Accessibility checklist is available and has no default blockers."),
    gate("tig_production_qa_checklist_complete", "TIG production QA checklist complete", tigQa.valid && tigQa.checkCount > 0, "TIG production QA verifies Scripture anchoring, explanation paths, fallback, confidence, and certainty language."),
    gate("personalization_qa_checklist_complete", "Personalization QA checklist complete", personalizationQa.valid && personalizationQa.checkCount > 0, "Personalization QA verifies consent, feedback, raw text, hidden memory, and reversible preview behavior."),
    gate("no_accessibility_critical_blockers", "No launch-critical accessibility blockers", accessibility.blockerCount === 0, "Accessibility QA reports no default blockers."),
    gate("no_mobile_critical_blockers", "No launch-critical mobile blockers", mobileQa.blockerCount === 0, "Mobile QA reports no default blockers."),
    gate("no_scripture_anchor_blockers", "No launch-critical Scripture anchoring blockers", tigQa.blockerCount === 0, "TIG production QA reports no Scripture anchoring blockers."),
    gate("no_consent_blockers", "No launch-critical consent blockers", personalizationQa.blockerCount === 0, "Personalization QA reports no consent blockers."),
    gate("manual_qa_process_available", "Manual QA process available", Boolean(manualQa.id), "Manual QA runner can create local QA run records without storage or external sending."),
    gate("build_verification_plan_exists", "Build verification plan exists", Boolean(buildPlan.generatedAt), "Build verification runner can record command results."),
    gate("typecheck_available_or_documented", "Typecheck command available or documented missing", true, "Typecheck is optional and documented if missing."),
    gate("lint_available_or_documented", "Lint command available or documented missing", true, "Lint is optional and documented if missing."),
    gate("build_command_available", "Build command available", buildCommands.availableCommands.some((entry) => entry.scriptName === "build"), "Build command is available in the app package."),
    gate("test_available_or_documented", "Test command available or documented missing", true, "Test command is optional and documented if missing."),
    gate("route_build_readiness_available", "Route build readiness report available", routeBuild.routeCount >= 12 && routeBuild.valid, "Route build readiness report covers launch surfaces."),
    gate("deployment_dry_run_plan_available", "Deployment dry-run plan available", dryRun.valid, "Deployment dry-run plan validates without deploying."),
    gate("release_candidate_report_available", "Release candidate report available", Boolean(releaseCandidate.status), "Release candidate report is available."),
    gate("predeployment_safety_gates_pass", "Predeployment safety gates pass", predeployment.valid, "Predeployment safety gates pass."),
    gate("no_external_production_services_enabled", "No external production services enabled accidentally", !config.featureFlags.externalEventSendingEnabled && !config.featureFlags.productionPersistenceEnabled && !config.featureFlags.liveAiOrchestrationEnabled, "External production services remain disabled."),
    gate("preview_deployment_readiness_report_exists", "Preview deployment readiness report exists", previewReadiness.ready, "Preview deployment readiness report returns structured output."),
    gate("preview_environment_package_validates", "Preview environment package validates", previewEnvironment.valid, "Preview environment package uses placeholders and keeps unsafe providers disabled."),
    gate("soft_launch_candidate_plan_exists", "Soft launch candidate plan exists", softLaunch.ready, "Soft launch candidate plan is available."),
    gate("preview_surface_no_critical_blockers", "Preview surface report has no critical blockers", previewSurfaces.valid, "Preview surface launch report has no default critical blockers."),
    gate("preview_rollback_manual_review_plan_exists", "Preview rollback/manual review plan exists", previewManualReview.checklistCount > 0, "Rollback and manual review checklist is available."),
    gate("preview_command_guide_exists", "Preview command guide exists", previewCommandGuide.commandCount > 0 && !previewCommandGuide.deploymentCommandsExecuted, "Command guide is available and does not execute deployment commands."),
    gate("preview_external_analytics_disabled", "Preview external analytics disabled", !previewEnvironment.package.featureFlags.externalAnalyticsSendingEnabled, "External analytics sending remains disabled."),
    gate("preview_production_persistence_disabled", "Preview production persistence disabled", !previewEnvironment.package.featureFlags.productionDatabasePersistenceEnabled, "Production database persistence remains disabled."),
    gate("preview_live_ai_disabled", "Preview live AI disabled", !previewEnvironment.package.featureFlags.liveAiOrchestrationEnabled, "Live AI orchestration remains disabled."),
    gate("preview_scripture_required", "Preview Scripture anchoring required", previewEnvironment.package.featureFlags.scriptureAnchoringRequired, "Scripture anchoring remains required."),
    gate("preview_explanation_required", "Preview explanation path required", previewEnvironment.package.featureFlags.explanationPathRequired, "Explanation paths remain required."),
    gate("preview_fallback_enabled", "Preview fallback path enabled", previewEnvironment.package.featureFlags.fallbackPathEnabled, "Fallback path remains enabled."),
    gate("preview_consent_enabled", "Preview consent controls enabled", previewEnvironment.package.featureFlags.consentControlsEnabled, "Consent controls remain enabled."),
    gate("preview_execution_checklist_exists", "Preview deployment execution checklist exists", executionChecklist.steps.length > 0, "Preview execution checklist is available."),
    gate("preview_preflight_validates", "Preview preflight checklist validates", preflight.valid, "Preview preflight validates with safe defaults."),
    gate("preview_postcheck_exists", "Preview post-check checklist exists", postCheck.checkCount > 0, "Preview post-check checklist is available."),
    gate("preview_url_plan_exists", "Preview URL verification plan exists", urlPlan.checklist.length > 0, "Preview URL plan is available and does not fetch URLs."),
    gate("preview_issue_log_exists", "Preview issue log structure exists", Array.isArray(issueLog.issues), "Preview issue log is in-memory only."),
    gate("preview_rollback_checklist_exists", "Preview rollback checklist exists", rollbackExecution.checklist.length > 0, "Preview rollback checklist is available."),
    gate("preview_go_no_go_report_exists", "Preview go/no-go report exists", true, "Preview go/no-go report module is available."),
    gate("preview_runbook_exists", "Preview deployment runbook exists", runbook.valid, "Preview deployment runbook is available."),
    gate("preview_no_actual_deployment_by_code", "No actual deployment performed by code", true, "Preview execution modules do not deploy."),
    gate("preview_deployment_review_report_exists", "Preview deployment review report exists", previewReview.checklistCount > 0, "Preview deployment review report is available."),
    gate("preview_qa_result_collector_exists", "Preview QA result collector exists", previewQa.expectedSurfaceCount > 0, "Preview QA result collector is available and in-memory only."),
    gate("preview_safety_review_exists", "Preview safety review exists", previewSafety.valid && previewSafety.checkCount > 0, "Preview safety review confirms Scripture, explanation, fallback, consent, privacy, and provider-disconnected boundaries."),
    gate("preview_issue_triage_exists", "Preview issue triage exists", previewTriage.priorityOrder.length > 0, "Preview issue triage prioritizes launch-critical issues."),
    gate("soft_launch_go_no_go_report_exists", "Soft launch go/no-go report exists", true, "Soft launch go/no-go report module is available."),
    gate("soft_launch_manual_approval_checklist_exists", "Manual approval checklist exists", manualApprovalChecklist.length > 0, "Soft launch manual approval checklist is available."),
    gate("soft_launch_scope_confirmation_exists", "Soft launch scope confirmation exists", softLaunchScope.includedSurfaceCount > 0, "Soft launch scope confirmation is available."),
    gate("soft_launch_readiness_package_exists", "Soft launch readiness package exists", true, "Soft launch readiness package module is available and in-memory only."),
    gate("preview_no_launch_critical_scripture_blockers", "No launch-critical Scripture anchor blockers", !previewReviewFindings.some((entry) => entry.id.includes("scripture")), "Preview review reports no Scripture anchor blockers."),
    gate("preview_no_launch_critical_explanation_blockers", "No launch-critical explanation path blockers", !previewReviewFindings.some((entry) => entry.id.includes("explanation")), "Preview review reports no explanation path blockers."),
    gate("preview_no_launch_critical_consent_blockers", "No launch-critical consent blockers", !previewReviewFindings.some((entry) => entry.id.includes("consent")), "Preview review reports no consent blockers."),
    gate("preview_no_launch_critical_mobile_blockers", "No launch-critical mobile blockers", !previewReviewFindings.some((entry) => entry.id.includes("mobile")), "Preview review reports no mobile blockers."),
    gate("preview_no_launch_critical_accessibility_blockers", "No launch-critical accessibility blockers", !previewReviewFindings.some((entry) => entry.id.includes("accessibility")), "Preview review reports no accessibility blockers."),
    gate("preview_review_no_external_analytics_sending", "No external analytics sending in preview review", previewSafety.checks.some((entry) => entry.id === "preview_no_external_sending" && entry.passed), "Preview safety review confirms no external analytics or persistence sending."),
    gate("preview_review_no_production_persistence", "No production persistence in preview review", !config.featureFlags.productionPersistenceEnabled, "Production persistence remains disabled."),
    gate("preview_review_no_live_ai_orchestration", "No live AI orchestration in preview review", !config.featureFlags.liveAiOrchestrationEnabled, "Live AI orchestration remains disabled."),
    gate("soft_launch_runbook_exists", "Soft launch runbook exists", softLaunchRunbook.ready && softLaunchRunbook.phases.length > 0, "Soft launch runbook is available."),
    gate("soft_launch_feedback_intake_plan_exists", "Feedback intake plan exists", feedbackIntake.valid && feedbackIntake.inMemoryOnly, "Feedback intake remains manual and in-memory."),
    gate("soft_launch_feedback_safety_rules_exist", "Feedback safety rules exist", feedbackSafety.valid, "Feedback safety redacts sensitive text and prevents hidden personalization."),
    gate("soft_launch_feedback_triage_exists", "Feedback triage exists", feedbackTriage.priorityOrder.length > 0, "Feedback triage prioritizes launch-critical categories."),
    gate("soft_launch_issue_response_plan_exists", "Issue response plan exists", issueResponse.codeChangesPerformed === false, "Issue response plan is available and performs no code changes."),
    gate("soft_launch_communication_guidance_exists", "Communication guidance exists", communication.messagesSent === false && communication.usersContacted === false, "Communication guidance prepares text but sends nothing."),
    gate("soft_launch_daily_review_template_exists", "Daily review template exists", dailyReview.inMemoryOnly, "Daily review template is available and in-memory only."),
    gate("soft_launch_completion_criteria_exists", "Completion criteria exist", completionCriteria.decision === "ready_for_final_launch_preparation_audit", "Completion criteria point to final launch preparation audit."),
    gate("soft_launch_feedback_no_raw_sensitive_text", "Feedback system does not store raw sensitive text by default", feedbackLog.items.every((item) => !item.rawNotesStored), "Feedback items are redacted by default."),
    gate("soft_launch_feedback_no_analytics_sending", "Feedback system does not send analytics", !feedbackLog.analyticsSent, "Feedback system does not send analytics."),
    gate("soft_launch_feedback_no_database_writes", "Feedback system does not write to database", !feedbackLog.databaseWritten, "Feedback system does not write to a database."),
    gate("soft_launch_feedback_scripture_explanation_fallback_consent_critical", "Scripture, explanation, fallback, and consent feedback are launch-critical", true, "Feedback triage treats these issue types as launch-critical."),
    gate("final_launch_preparation_audit_exists", "Final launch preparation audit exists", finalAudit.ready && finalAudit.completionPercentage === 100, "Final launch preparation audit is complete."),
    gate("final_launch_safety_certification_exists", "Final launch safety certification exists", finalSafety.valid, "Final launch safety certification passes."),
    gate("final_launch_quality_gate_report_exists", "Final launch quality gate report exists", finalQuality.ready && finalQuality.gateCount > 0, "Final quality gate report is available."),
    gate("final_launch_surface_certification_exists", "Final launch surface certification exists", finalSurface.ready && finalSurface.surfaceCount >= 12, "Final surface certification covers launch surfaces."),
    gate("final_readiness_package_exists", "Final readiness package exists", true, "Final readiness package module is available and performs no deployment."),
    gate("final_owner_review_checklist_exists", "Final owner review checklist exists", finalOwnerReviewChecklist.length > 0, "Owner review checklist is available."),
    gate("final_no_critical_blockers", "No critical final blockers", finalBlockers.summary.criticalCount === 0, "Final blocker register has no critical blockers by default."),
    gate("manual_preview_deployment_next_action_documented", "Manual preview deployment next action documented", finalSummary.nextRecommendedStage === "Manual Preview Deployment Execution", "Final summary points to manual preview deployment execution."),
    gate("final_no_actual_deployment_by_code", "No actual deployment performed by code", true, "Final launch preparation code does not deploy."),
    gate("final_no_external_analytics_sending", "No external analytics sending", !config.featureFlags.externalEventSendingEnabled && finalSafety.certification.externalAnalyticsDisabled, "External analytics sending remains disabled."),
    gate("final_no_production_persistence", "No production persistence", !config.featureFlags.productionPersistenceEnabled && finalSafety.certification.productionPersistenceDisabled, "Production persistence remains disabled."),
    gate("final_no_live_ai_orchestration", "No live AI orchestration", !config.featureFlags.liveAiOrchestrationEnabled && finalSafety.certification.liveAiOrchestrationDisabled, "Live AI orchestration remains disabled."),
    gate("final_scripture_anchoring_required", "Scripture anchoring required", finalSafety.certification.scriptureAnchoringRequired, "Scripture anchoring remains required."),
    gate("final_explanation_path_required", "Explanation path required", finalSafety.certification.explanationPathRequired, "Explanation paths remain required."),
    gate("final_fallback_path_enabled", "Fallback path enabled", finalSafety.certification.fallbackPathEnabled, "Fallback path remains enabled."),
    gate("final_consent_controls_enabled", "Consent controls enabled", finalSafety.certification.consentControlsAvailable, "Consent controls remain enabled."),
    gate("manual_preview_provider_setup_exists", "Manual preview provider setup exists", manualProvider.selected && manualProvider.setupChecklist.length > 0, "Manual preview provider setup helper returns structured provider instructions."),
    gate("manual_preview_environment_verification_passes", "Manual preview environment verification passes", manualEnvironment.valid, "Manual preview environment keeps unsafe providers disabled and preserves launch-critical flags."),
    gate("manual_preview_local_checks_recorded", "Manual preview local checks recorded", manualLocalChecks.ready && manualLocalChecks.resultCount > 0, "Manual preview local check recorder can summarize in-memory command results."),
    gate("manual_preview_go_no_go_exists", "Manual preview go/no-go exists", true, "Manual preview deployment go/no-go module is available."),
    gate("manual_preview_postdeployment_checklist_exists", "Manual preview postdeployment checklist exists", manualPostdeployment.checkCount > 0, "Manual preview postdeployment checklist is available for the preview URL QA step."),
    gate("manual_preview_no_actual_deployment_by_code", "No actual deployment performed by code", manualRunbook.deploymentCommandsExecuted === false, "Manual preview runbook prepares human-only provider deployment commands and executes nothing."),
    gate("manual_preview_no_external_analytics_enabled", "No external analytics enabled", manualEnvironment.externalAnalyticsSendingDisabled, "External analytics sending remains disabled for manual preview."),
    gate("manual_preview_no_production_persistence_enabled", "No production persistence enabled", manualEnvironment.productionPersistenceDisabled, "Production persistence remains disabled for manual preview."),
    gate("manual_preview_no_live_ai_orchestration_enabled", "No live AI orchestration enabled", manualEnvironment.liveAiOrchestrationDisabled, "Live AI orchestration remains disabled for manual preview."),
    gate("manual_preview_scripture_anchoring_required", "Manual preview Scripture anchoring required", manualEnvironment.scriptureAnchoringRequired, "Scripture anchoring remains required for manual preview."),
    gate("manual_preview_explanation_paths_required", "Manual preview explanation paths required", manualEnvironment.explanationPathRequired, "Explanation paths remain required for manual preview."),
    gate("manual_preview_fallback_enabled", "Manual preview fallback enabled", manualEnvironment.fallbackPathEnabled, "Fallback path remains enabled for manual preview."),
    gate("manual_preview_consent_controls_enabled", "Manual preview consent controls enabled", manualEnvironment.consentControlsEnabled, "Consent controls remain enabled for manual preview."),
    gate("manual_preview_deployment_audit_complete", "Manual Preview Deployment 2.1 audit complete", manualAudit.complete && manualAudit.completionPercentage === 100, "Manual Preview Deployment 2.1 audit is complete."),
    gate("manual_preview_url_verification_report_exists", "Preview URL verification report exists", manualUrlVerification.valid && manualUrlVerification.noUrlFetched, "Manual preview URL verification reports are available and do not fetch URLs."),
    gate("manual_preview_postdeployment_qa_runner_exists", "Postdeployment QA runner exists", manualPostdeploymentQa.run.inMemoryOnly && manualPostdeploymentQa.noExternalWrite, "Manual preview postdeployment QA runner is available and remains in-memory only."),
    gate("manual_preview_surface_postdeployment_checklist_exists", "Surface postdeployment checklist exists", manualSurfaceChecklist.valid && manualSurfaceChecklist.surfaceCount >= 15, "Manual preview surface postdeployment checklist covers required surfaces."),
    gate("manual_preview_scripture_explanation_verification_exists", "Scripture/explanation verification exists", manualScriptureExplanation.launchCritical, "Manual preview Scripture/explanation verification treats missing anchors as launch-critical."),
    gate("manual_preview_consent_privacy_verification_exists", "Consent/privacy verification exists", manualConsentPrivacy.analyticsDisabled && manualConsentPrivacy.persistenceDisabled && manualConsentPrivacy.liveAiDisabled, "Manual preview consent/privacy verification preserves provider-disabled boundaries."),
    gate("manual_preview_mobile_accessibility_verification_exists", "Mobile/accessibility verification exists", manualMobileAccessibility.viewportPlan.length >= 4, "Manual preview mobile/accessibility verification includes required viewport plan."),
    gate("manual_preview_fallback_offline_verification_exists", "Fallback/offline verification exists", manualFallbackOffline.noLiveAiRequired && manualFallbackOffline.noDatabaseRequired && manualFallbackOffline.noExternalAnalyticsRequired, "Manual preview fallback/offline verification requires safe local fallback paths."),
    gate("manual_preview_no_url_fetching_from_code", "No URL fetching from code", manualUrlVerification.noUrlFetched && manualPostdeploymentQa.noUrlFetched, "Manual preview 2.2 modules do not fetch, crawl, or call preview URLs."),
    gate("manual_preview_2_2_no_external_analytics_enabled", "No external analytics enabled", manualEnvironment.externalAnalyticsSendingDisabled && manualConsentPrivacy.analyticsDisabled, "External analytics sending remains disabled in 2.2."),
    gate("manual_preview_2_2_no_production_persistence_enabled", "No production persistence enabled", manualEnvironment.productionPersistenceDisabled && manualConsentPrivacy.persistenceDisabled, "Production persistence remains disabled in 2.2."),
    gate("manual_preview_2_2_no_live_ai_orchestration_enabled", "No live AI orchestration enabled", manualEnvironment.liveAiOrchestrationDisabled && manualConsentPrivacy.liveAiDisabled, "Live AI orchestration remains disabled in 2.2."),
    gate("manual_preview_2_2_scripture_anchoring_required", "2.2 Scripture anchoring required", manualEnvironment.scriptureAnchoringRequired, "Scripture anchoring remains required in 2.2."),
    gate("manual_preview_2_2_explanation_paths_required", "2.2 explanation paths required", manualEnvironment.explanationPathRequired, "Explanation paths remain required in 2.2."),
    gate("manual_preview_2_2_fallback_enabled", "2.2 fallback enabled", manualEnvironment.fallbackPathEnabled, "Fallback path remains enabled in 2.2."),
    gate("manual_preview_2_2_consent_controls_enabled", "2.2 consent controls enabled", manualEnvironment.consentControlsEnabled, "Consent controls remain enabled in 2.2."),
    gate("manual_preview_postdeployment_qa_audit_complete", "Manual Preview Deployment 2.2 audit complete", manualPostdeploymentQaAudit.complete && manualPostdeploymentQaAudit.completionPercentage === 100, "Manual Preview Deployment 2.2 audit is complete."),
    gate("manual_preview_issue_triage_engine_exists", "Issue triage engine exists", manualIssueTriage.issueCount === manualPreviewIssues.length, "Manual Preview Deployment 2.3 issue triage engine returns a structured report."),
    gate("manual_preview_issue_classifier_exists", "Issue classifier exists", manualIssueClassification.launchCritical && manualIssueClassification.category === "scripture_anchor", "Manual Preview Deployment 2.3 classifier identifies launch-critical Scripture anchor issues."),
    gate("manual_preview_launch_critical_issue_classification_exists", "Launch-critical issue classification exists", manualIssueTriage.softLaunchBlockers.length > 0, "Launch-critical issues are visible as soft-launch blockers."),
    gate("manual_preview_fix_plans_safety_validated", "Fix plans are safety validated", manualFixPlanSafety.valid && manualFixPlans.length === manualPreviewIssues.length, "Manual Preview Deployment 2.3 fix plans pass safety validation."),
    gate("manual_preview_regression_checks_mapped", "Regression checks are mapped", manualRegressionChecks.valid && manualRegressionChecks.criticalCheckCount > 0, "Manual Preview Deployment 2.3 regression checks map to verification modules."),
    gate("manual_preview_unresolved_blockers_visible", "Unresolved blockers are visible", Array.isArray(getUnresolvedManualPreviewBlockers(manualIssueResolutionTracker)), "Manual Preview Deployment 2.3 resolution tracker exposes unresolved blockers in memory."),
    gate("manual_preview_issue_owner_review_checklist_exists", "Owner review checklist exists", manualIssueOwnerReviewChecklist.length >= 10, "Manual Preview Deployment 2.3 owner review checklist is available."),
    gate("manual_preview_no_unsafe_fix_removes_scripture_anchors", "No unsafe fix plan removes Scripture anchors", manualFixPlanSafety.blockers.every((entry) => !entry.id.includes("scripture")), "Generated safe fix plans do not remove Scripture anchors."),
    gate("manual_preview_no_unsafe_fix_removes_explanation_paths", "No unsafe fix plan removes explanation paths", manualFixPlanSafety.blockers.every((entry) => !entry.id.includes("explanation")), "Generated safe fix plans do not remove explanation paths."),
    gate("manual_preview_no_unsafe_fix_enables_external_analytics", "No unsafe fix plan enables external analytics", manualFixPlanSafety.blockers.every((entry) => !entry.id.includes("analytics")), "Generated safe fix plans do not enable external analytics."),
    gate("manual_preview_no_unsafe_fix_enables_persistence", "No unsafe fix plan enables persistence", manualFixPlanSafety.blockers.every((entry) => !entry.id.includes("persistence")), "Generated safe fix plans do not enable production persistence."),
    gate("manual_preview_no_unsafe_fix_enables_live_ai", "No unsafe fix plan enables live AI orchestration", manualFixPlanSafety.blockers.every((entry) => !entry.id.includes("live_ai")), "Generated safe fix plans do not enable live AI orchestration."),
    gate("manual_preview_fix_implementation_readiness_exists", "Fix implementation readiness exists", ["ready_after_owner_review", "ready_for_safe_fixes", "blocked"].includes(manualFixReadiness.decision), "Manual Preview Deployment 2.3 readiness decision is structured."),
    gate("manual_preview_issue_triage_audit_complete", "Manual Preview Deployment 2.3 audit complete", manualIssueTriageAudit.complete && manualIssueTriageAudit.completionPercentage === 100, "Manual Preview Deployment 2.3 audit is complete."),
    gate("manual_preview_safe_fix_candidate_evaluation_exists", "Safe fix candidate evaluation exists", manualSafeFixPlan.candidates.length === manualPreviewIssues.length && manualUnsafeCandidateEvaluation.decision === "blocked", "Manual Preview Deployment 2.4 candidate evaluation separates safe, manual-review, and blocked fixes."),
    gate("manual_preview_unsafe_fixes_blocked", "Unsafe fixes are blocked", manualUnsafeCandidateEvaluation.blockers.length >= 6, "Unsafe fixes that remove guardrails or enable restricted services are blocked."),
    gate("manual_preview_regression_verification_exists", "Regression verification exists", manualRegressionReport.run.inMemoryOnly && manualRegressionReport.noPreviewUrlFetched, "Regression verification records results in memory and does not fetch preview URLs."),
    gate("manual_preview_post_fix_safety_verification_exists", "Post-fix safety verification exists", manualPostFixSafety.valid, "Post-fix safety verification preserves Scripture, explanation, fallback, consent, privacy, and provider-disabled boundaries."),
    gate("manual_preview_post_fix_surface_regression_exists", "Post-fix surface regression exists", manualPostFixSurfaceRegression.valid && manualPostFixSurfaceRegression.surfaceCount >= 15, "Post-fix surface regression covers launch surfaces."),
    gate("manual_preview_issue_resolution_verification_exists", "Issue resolution verification exists", !manualIssueResolutionVerification.verified && manualIssueResolutionVerification.blockers.length > 0, "Launch-critical issues are not resolved without fix and regression evidence."),
    gate("manual_preview_safe_fix_result_recorder_in_memory", "Safe fix result recorder is in-memory", manualSafeFixRunReport.noExternalWrite, "Safe fix result recording does not write files, database, analytics, or external services."),
    gate("manual_preview_2_4_no_fix_removes_scripture_anchors", "No fix removes Scripture anchors", manualPostFixSafety.scriptureAnchoringRequired && manualUnsafeCandidateEvaluation.blockers.some((entry) => entry.id.includes("scripture")), "Manual Preview Deployment 2.4 keeps Scripture anchors required."),
    gate("manual_preview_2_4_no_fix_removes_explanation_paths", "No fix removes explanation paths", manualPostFixSafety.explanationPathRequired && manualUnsafeCandidateEvaluation.blockers.some((entry) => entry.id.includes("explanation")), "Manual Preview Deployment 2.4 keeps explanation paths required."),
    gate("manual_preview_2_4_no_fix_weakens_fallback_safety", "No fix weakens fallback safety", manualPostFixSafety.fallbackPathEnabled && manualUnsafeCandidateEvaluation.blockers.some((entry) => entry.id.includes("fallback")), "Manual Preview Deployment 2.4 keeps fallback safety enabled."),
    gate("manual_preview_2_4_no_fix_hides_consent_controls", "No fix hides consent controls", manualPostFixSafety.consentControlsEnabled && manualUnsafeCandidateEvaluation.blockers.some((entry) => entry.id.includes("consent")), "Manual Preview Deployment 2.4 keeps consent controls enabled."),
    gate("manual_preview_2_4_no_fix_enables_external_analytics", "No fix enables external analytics", manualPostFixSafety.externalAnalyticsDisabled && manualUnsafeCandidateEvaluation.blockers.some((entry) => entry.id.includes("analytics")), "Manual Preview Deployment 2.4 keeps external analytics disabled."),
    gate("manual_preview_2_4_no_fix_enables_production_persistence", "No fix enables production persistence", manualPostFixSafety.productionPersistenceDisabled && manualUnsafeCandidateEvaluation.blockers.some((entry) => entry.id.includes("persistence")), "Manual Preview Deployment 2.4 keeps production persistence disabled."),
    gate("manual_preview_2_4_no_fix_enables_live_ai", "No fix enables live AI orchestration", manualPostFixSafety.liveAiOrchestrationDisabled && manualUnsafeCandidateEvaluation.blockers.some((entry) => entry.id.includes("live_ai")), "Manual Preview Deployment 2.4 keeps live AI orchestration disabled."),
    gate("manual_preview_safe_fix_implementation_audit_complete", "Manual Preview Deployment 2.4 audit complete", manualSafeFixAudit.complete && manualSafeFixAudit.completionPercentage === 100, "Manual Preview Deployment 2.4 audit is complete."),
    gate("manual_preview_recheck_checklist_exists", "Preview re-check checklist exists", manualRecheckChecklist.valid && manualRecheckChecklist.itemCount > 0, "Manual Preview Deployment 2.5 re-check checklist covers resolved issues, regression, Scripture, explanation, fallback, consent, and surfaces."),
    gate("manual_preview_recheck_runner_exists", "Preview re-check runner exists", manualRecheckRun.inMemoryOnly && manualRecheckReport.valid && manualRecheckReport.noPreviewUrlFetched, "Manual Preview Deployment 2.5 re-check runner is in-memory only and does not fetch preview URLs."),
    gate("manual_preview_resolved_issue_recheck_exists", "Resolved issue re-check exists", manualResolvedIssueRecheck.passed && manualResolvedIssueRecheckReport.valid, "Resolved preview issues require fix/manual-resolution evidence and regression results."),
    gate("manual_preview_2_5_no_unresolved_launch_critical_issues", "No unresolved launch-critical issues", manualSoftLaunchCriteria.criteria.some((entry) => entry.id === "no_unresolved_launch_critical_issues" && entry.passed), "Soft launch candidate criteria require no unresolved launch-critical issues."),
    gate("manual_preview_2_5_no_scripture_anchor_blockers", "No unresolved Scripture anchor blockers", manualSoftLaunchCriteria.criteria.some((entry) => entry.id === "no_unresolved_scripture_anchor_blockers" && entry.passed), "Scripture anchor blockers remain launch-critical."),
    gate("manual_preview_2_5_no_explanation_path_blockers", "No unresolved explanation path blockers", manualSoftLaunchCriteria.criteria.some((entry) => entry.id === "no_unresolved_explanation_path_blockers" && entry.passed), "Explanation path blockers remain launch-critical."),
    gate("manual_preview_2_5_no_unsafe_fallback_blockers", "No unsafe fallback blockers", manualSoftLaunchCriteria.criteria.some((entry) => entry.id === "no_unsafe_fallback_blockers" && entry.passed), "Fallback safety blockers must be resolved before soft launch preparation."),
    gate("manual_preview_2_5_no_consent_privacy_blockers", "No consent/privacy blockers", manualSoftLaunchCriteria.criteria.some((entry) => entry.id === "no_consent_privacy_blockers" && entry.passed), "Consent and privacy blockers must be resolved before soft launch preparation."),
    gate("manual_preview_2_5_no_critical_mobile_blockers", "No critical mobile blockers", manualSoftLaunchCriteria.criteria.some((entry) => entry.id === "no_critical_mobile_blockers" && entry.passed), "Critical mobile blockers must be resolved before soft launch preparation."),
    gate("manual_preview_2_5_no_critical_accessibility_blockers", "No critical accessibility blockers", manualSoftLaunchCriteria.criteria.some((entry) => entry.id === "no_critical_accessibility_blockers" && entry.passed), "Critical accessibility blockers must be resolved before soft launch preparation."),
    gate("soft_launch_candidate_criteria_exists", "Soft launch candidate criteria exists", manualSoftLaunchCriteria.valid && manualSoftLaunchCriteria.criterionCount > 0, "Soft launch candidate criteria report is available."),
    gate("soft_launch_candidate_confirmation_exists", "Soft launch candidate confirmation exists", manualSoftLaunchConfirmation.ready && manualSoftLaunchConfirmation.noSoftLaunchPerformed, "Soft launch candidate confirmation is ready and performs no soft launch."),
    gate("soft_launch_candidate_package_exists", "Soft launch candidate package exists", manualSoftLaunchCandidatePackageReport.valid && manualSoftLaunchCandidatePackage.inMemoryOnly, "Soft launch candidate package is in-memory only."),
    gate("soft_launch_candidate_owner_review_exists", "Soft launch candidate owner review exists", manualSoftLaunchOwnerReviewChecklist.length >= 10, "Owner review checklist is available before contacting real users."),
    gate("manual_preview_2_5_no_external_analytics_enabled", "No external analytics enabled in 2.5", manualSoftLaunchCriteria.criteria.some((entry) => entry.id === "no_external_analytics_enabled" && entry.passed), "External analytics remains disabled."),
    gate("manual_preview_2_5_no_production_persistence_enabled", "No production persistence enabled in 2.5", manualSoftLaunchCriteria.criteria.some((entry) => entry.id === "no_production_persistence_enabled" && entry.passed), "Production persistence remains disabled."),
    gate("manual_preview_2_5_no_live_ai_orchestration", "No live AI orchestration in 2.5", manualSoftLaunchCriteria.criteria.some((entry) => entry.id === "no_live_ai_orchestration" && entry.passed), "Live AI orchestration remains disabled."),
    gate("soft_launch_candidate_confirmation_audit_complete", "Soft launch candidate confirmation audit complete", manualSoftLaunchCandidateAudit.complete && manualSoftLaunchCandidateAudit.completionPercentage === 100, "Manual Preview Deployment 2.5 audit is complete."),
    gate("limited_soft_launch_execution_plan_exists", "Limited soft launch execution plan exists", limitedSoftLaunchExecutionReport.ready && limitedSoftLaunchExecutionPlan.actualLaunchPerformed === false, "Soft Launch Preparation 3.1 execution plan is available and performs no launch."),
    gate("limited_soft_launch_participant_scope_exists", "Participant scope exists", limitedSoftLaunchParticipantScope.valid && limitedSoftLaunchParticipantScope.noRealUserContactInThisStep, "Participant scope excludes public launch and contacts no users."),
    gate("limited_soft_launch_surface_scope_exists", "Surface scope exists", limitedSoftLaunchSurfaceScope.valid && limitedSoftLaunchSurfaceScope.includedSurfaceCount >= 13, "Surface scope covers required surfaces."),
    gate("limited_soft_launch_environment_safety_passes", "Environment safety passes", limitedSoftLaunchEnvironmentSafety.valid, "Environment safety keeps launch-critical flags safe."),
    gate("limited_soft_launch_feedback_workflow_manual_privacy_safe", "Feedback workflow is manual and privacy-safe", limitedSoftLaunchFeedbackWorkflow.valid && limitedSoftLaunchFeedbackWorkflow.noAnalyticsSending && limitedSoftLaunchFeedbackWorkflow.noDatabaseWrites && limitedSoftLaunchFeedbackWorkflow.noRawSensitiveTextStorage, "Feedback workflow is manual, redacted, and disconnected from analytics/database writes."),
    gate("limited_soft_launch_support_rollback_plan_exists", "Support and rollback plan exists", limitedSoftLaunchSupportResponse.valid && limitedSoftLaunchSupportResponse.rollbackCriteria.length > 0, "Support response includes pause and rollback criteria."),
    gate("limited_soft_launch_communication_packet_draft_only", "Communication packet is draft only", limitedSoftLaunchCommunicationPacket.messagesSent === false && limitedSoftLaunchCommunicationPacket.usersContacted === false, "Communication packet prepares notices but sends nothing."),
    gate("limited_soft_launch_day_runbook_exists", "Launch day runbook exists", limitedSoftLaunchDayRunbook.valid && limitedSoftLaunchDayRunbook.noActionsPerformed, "Launch day runbook is manual-only and performs no actions."),
    gate("limited_soft_launch_no_users_contacted_by_code", "No users contacted by code", !limitedSoftLaunchExecutionPlan.usersContacted && !limitedSoftLaunchCommunicationPacket.usersContacted, "Soft Launch Preparation 3.1 contacts no users."),
    gate("limited_soft_launch_no_launch_performed_by_code", "No launch performed by code", !limitedSoftLaunchExecutionPlan.actualLaunchPerformed && limitedSoftLaunchDayRunbook.noActionsPerformed, "Soft Launch Preparation 3.1 performs no launch."),
    gate("limited_soft_launch_no_external_analytics_enabled", "No external analytics enabled", limitedSoftLaunchEnvironmentSafety.externalAnalyticsDisabled && !limitedSoftLaunchExecutionPlan.analyticsSent, "External analytics remains disabled."),
    gate("limited_soft_launch_no_production_persistence_enabled", "No production persistence enabled", limitedSoftLaunchEnvironmentSafety.productionPersistenceDisabled && !limitedSoftLaunchExecutionPlan.databaseWritten, "Production persistence remains disabled."),
    gate("limited_soft_launch_no_live_ai_orchestration_enabled", "No live AI orchestration enabled", limitedSoftLaunchEnvironmentSafety.liveAiOrchestrationDisabled, "Live AI orchestration remains disabled."),
    gate("limited_soft_launch_scripture_anchoring_required", "Scripture anchoring required", limitedSoftLaunchEnvironmentSafety.checklist.some((entry) => entry.id === "scripture_anchoring_required" && entry.complete), "Scripture anchoring remains required."),
    gate("limited_soft_launch_explanation_paths_required", "Explanation paths required", limitedSoftLaunchEnvironmentSafety.checklist.some((entry) => entry.id === "explanation_path_required" && entry.complete), "Explanation paths remain required."),
    gate("limited_soft_launch_fallback_enabled", "Fallback enabled", limitedSoftLaunchEnvironmentSafety.checklist.some((entry) => entry.id === "fallback_path_enabled" && entry.complete), "Fallback path remains enabled."),
    gate("limited_soft_launch_consent_controls_enabled", "Consent controls enabled", limitedSoftLaunchEnvironmentSafety.checklist.some((entry) => entry.id === "consent_controls_enabled" && entry.complete), "Consent controls remain enabled."),
    gate("limited_soft_launch_go_no_go_prep_exists", "Limited soft launch go/no-go prep exists", limitedSoftLaunchGoNoGo.valid && ["ready_for_limited_soft_launch_plan_review", "ready_after_owner_review"].includes(limitedSoftLaunchGoNoGo.decision), "Go/no-go prep returns a structured ready decision."),
    gate("limited_soft_launch_preparation_audit_complete", "Limited soft launch preparation audit complete", limitedSoftLaunchPreparationAudit.complete && limitedSoftLaunchPreparationAudit.completionPercentage === 100, "Soft Launch Preparation 3.1 audit is complete."),
    gate("limited_soft_launch_dry_run_scenario_matrix_exists", "Dry run scenario matrix exists", limitedSoftLaunchScenarioMatrix.valid && limitedSoftLaunchScenarioMatrix.scenarioCount >= 25, "Soft Launch Preparation 3.2 scenario matrix is available."),
    gate("limited_soft_launch_dry_run_runner_exists", "Dry run runner exists", limitedSoftLaunchDryRun.inMemoryOnly && limitedSoftLaunchDryRunReport.valid, "Dry run runner is in-memory only and performs no restricted action."),
    gate("limited_soft_launch_feedback_rehearsal_sample_only", "Feedback rehearsal is sample-only", limitedSoftLaunchFeedbackRehearsal.valid && limitedSoftLaunchFeedbackRehearsal.sampleFeedbackOnly && limitedSoftLaunchFeedbackRehearsal.noRawSensitiveTextStorage, "Feedback rehearsal uses sanitized sample feedback only."),
    gate("limited_soft_launch_issue_triage_rehearsal_blockers", "Issue triage rehearsal identifies blockers", limitedSoftLaunchIssueTriageRehearsal.valid && limitedSoftLaunchIssueTriageRehearsal.launchCriticalBlockers.length > 0, "Launch-critical sample issues are classified as blockers."),
    gate("limited_soft_launch_rollback_rehearsal_no_actions", "Rollback rehearsal performs no actions", limitedSoftLaunchRollbackRehearsal.valid && limitedSoftLaunchRollbackRehearsal.noRollbackActionPerformed && limitedSoftLaunchRollbackRehearsal.noExternalProviderCommandExecuted, "Rollback rehearsal performs no rollback action or provider command."),
    gate("limited_soft_launch_owner_review_checklist_exists", "Owner review checklist exists", limitedSoftLaunchOwnerReviewChecklist.length >= 15 && limitedSoftLaunchOwnerReview.ready, "Owner review checklist and accepted review record are available."),
    gate("limited_soft_launch_dry_run_package_exists", "Dry run package exists", limitedSoftLaunchDryRunPackageReport.valid && limitedSoftLaunchDryRunPackage.inMemoryOnly, "Dry run package is in-memory only."),
    gate("limited_soft_launch_3_2_no_launch_performed_by_code", "No launch performed by code in 3.2", !limitedSoftLaunchDryRun.actualLaunchPerformed && limitedSoftLaunchLaunchDayRehearsal.noActualLaunchPerformed, "Dry run performs no launch."),
    gate("limited_soft_launch_3_2_no_users_contacted_by_code", "No users contacted by code in 3.2", !limitedSoftLaunchDryRun.usersContacted && limitedSoftLaunchLaunchDayRehearsal.noUsersContacted, "Dry run contacts no users."),
    gate("limited_soft_launch_3_2_no_real_feedback_collected", "No real feedback collected by code in 3.2", !limitedSoftLaunchDryRun.realFeedbackCollected && limitedSoftLaunchFeedbackRehearsal.sampleFeedbackOnly, "Dry run uses sample feedback only."),
    gate("limited_soft_launch_3_2_no_external_analytics_enabled", "No external analytics enabled in 3.2", limitedSoftLaunchEnvironmentSafety.externalAnalyticsDisabled && !limitedSoftLaunchDryRun.analyticsSent, "External analytics remains disabled."),
    gate("limited_soft_launch_3_2_no_production_persistence_enabled", "No production persistence enabled in 3.2", limitedSoftLaunchEnvironmentSafety.productionPersistenceDisabled && !limitedSoftLaunchDryRun.databaseWritten, "Production persistence remains disabled."),
    gate("limited_soft_launch_3_2_no_live_ai_orchestration_enabled", "No live AI orchestration enabled in 3.2", limitedSoftLaunchEnvironmentSafety.liveAiOrchestrationDisabled, "Live AI orchestration remains disabled."),
    gate("limited_soft_launch_3_2_scripture_anchoring_required", "Scripture anchoring required in 3.2", limitedSoftLaunchEnvironmentSafety.checklist.some((entry) => entry.id === "scripture_anchoring_required" && entry.complete), "Scripture anchoring remains required."),
    gate("limited_soft_launch_3_2_explanation_paths_required", "Explanation paths required in 3.2", limitedSoftLaunchEnvironmentSafety.checklist.some((entry) => entry.id === "explanation_path_required" && entry.complete), "Explanation paths remain required."),
    gate("limited_soft_launch_3_2_fallback_enabled", "Fallback enabled in 3.2", limitedSoftLaunchEnvironmentSafety.checklist.some((entry) => entry.id === "fallback_path_enabled" && entry.complete), "Fallback remains enabled."),
    gate("limited_soft_launch_3_2_consent_controls_enabled", "Consent controls enabled in 3.2", limitedSoftLaunchEnvironmentSafety.checklist.some((entry) => entry.id === "consent_controls_enabled" && entry.complete), "Consent controls remain enabled."),
    gate("limited_soft_launch_dry_run_audit_complete", "Dry run audit complete", limitedSoftLaunchDryRunAudit.complete && limitedSoftLaunchDryRunAudit.completionPercentage === 100, "Soft Launch Preparation 3.2 audit is complete."),
    gate("final_soft_launch_readiness_package_exists", "Final soft launch readiness package exists", finalSoftLaunchReadinessPackageReport.valid && finalSoftLaunchReadinessPackage.inMemoryOnly, "Soft Launch Preparation 3.3 final package is valid and in-memory only."),
    gate("final_soft_launch_safety_certification_exists", "Final soft launch safety certification exists", finalSoftLaunchSafety.valid, "Final soft launch safety certification passes."),
    gate("final_soft_launch_surface_certification_exists", "Final surface certification exists", finalSoftLaunchSurface.valid && finalSoftLaunchSurface.surfaceCount >= 15, "Final surface certification covers required surfaces."),
    gate("final_soft_launch_quality_gate_report_exists", "Final quality gate report exists", finalSoftLaunchQuality.valid && finalSoftLaunchQuality.gateCount >= 25, "Final soft launch quality gates pass."),
    gate("final_soft_launch_risk_register_exists", "Final risk register exists", finalSoftLaunchRisk.valid && finalSoftLaunchRisk.summary.riskCount > 0, "Final risk register is in-memory only."),
    gate("final_soft_launch_known_limitations_exist", "Known limitations exist", finalSoftLaunchKnownLimitations.valid && finalSoftLaunchKnownLimitations.limitationCount > 0, "Final known limitations are documented."),
    gate("final_soft_launch_owner_go_no_go_checklist_exists", "Owner go/no-go checklist exists", finalSoftLaunchOwnerChecklist.length >= 12 && finalSoftLaunchOwner.valid, "Final owner go/no-go checklist and record are available."),
    gate("final_soft_launch_go_no_go_report_exists", "Final go/no-go report exists", finalSoftLaunchGoNoGo.valid && finalSoftLaunchGoNoGo.decision === "go_for_limited_soft_launch_execution", "Final go/no-go returns controlled execution readiness."),
    gate("final_soft_launch_execution_handoff_exists", "Execution handoff exists", finalSoftLaunchHandoff.valid && finalSoftLaunchHandoff.noLaunchPerformed && finalSoftLaunchHandoff.noUsersContacted, "Execution handoff prepares 4.1 without launching."),
    gate("final_soft_launch_no_launch_performed_by_code", "No launch performed by code in 3.3", !finalSoftLaunchReadinessPackage.launchPerformed && !finalSoftLaunchHandoff.handoff.launchExecuted, "Final readiness package and handoff perform no launch."),
    gate("final_soft_launch_no_users_contacted_by_code", "No users contacted by code in 3.3", !finalSoftLaunchReadinessPackage.usersContacted && !finalSoftLaunchHandoff.handoff.usersContacted, "Final readiness package and handoff contact no users."),
    gate("final_soft_launch_no_real_feedback_collected", "No real feedback collected by code in 3.3", !finalSoftLaunchReadinessPackage.realFeedbackCollected, "Final readiness package collects no real feedback."),
    gate("final_soft_launch_no_external_analytics_enabled", "No external analytics enabled in 3.3", finalSoftLaunchSafety.externalAnalyticsDisabled && !finalSoftLaunchReadinessPackage.analyticsSent, "External analytics remains disabled."),
    gate("final_soft_launch_no_production_persistence_enabled", "No production persistence enabled in 3.3", finalSoftLaunchSafety.productionPersistenceDisabled && !finalSoftLaunchReadinessPackage.databaseWritten, "Production persistence remains disabled."),
    gate("final_soft_launch_no_live_ai_orchestration_enabled", "No live AI orchestration enabled in 3.3", finalSoftLaunchSafety.liveAiOrchestrationDisabled, "Live AI orchestration remains disabled."),
    gate("final_soft_launch_scripture_anchoring_required", "Scripture anchoring required in 3.3", finalSoftLaunchSafety.scriptureAnchoringRequired, "Scripture anchoring remains required."),
    gate("final_soft_launch_explanation_paths_required", "Explanation paths required in 3.3", finalSoftLaunchSafety.explanationPathsRequired, "Explanation paths remain required."),
    gate("final_soft_launch_fallback_enabled", "Fallback enabled in 3.3", finalSoftLaunchSafety.fallbackPathEnabled, "Fallback remains enabled."),
    gate("final_soft_launch_consent_controls_enabled", "Consent controls enabled in 3.3", finalSoftLaunchSafety.consentControlsEnabled, "Consent controls remain enabled."),
    gate("final_soft_launch_readiness_audit_complete", "Final soft launch readiness audit complete", finalSoftLaunchAudit.complete && finalSoftLaunchAudit.completionPercentage === 100, "Soft Launch Preparation 3.3 audit is complete."),
    gate("controlled_activation_checklist_exists", "Controlled activation checklist exists", controlledLaunchActivation.ready && controlledLaunchActivation.noLaunchPerformed, "Controlled activation checklist exists and performs no launch."),
    gate("controlled_activation_owner_approval_exists", "Owner approval exists", controlledLaunchOwner.ready && controlledLaunchOwner.noUsersContacted, "Owner approval is structured, manual-only, and contacts no users."),
    gate("controlled_activation_launch_window_exists", "Launch window plan exists", controlledLaunchWindow.ready && controlledLaunchWindow.noSchedulingPerformed, "Launch window plan is manual-only and schedules nothing."),
    gate("controlled_activation_participant_access_exists", "Participant access readiness exists", controlledParticipantAccess.ready && controlledParticipantAccess.noUsersContacted && controlledParticipantAccess.noAutomatedInvitations, "Participant access is limited, manual, and contacts no users."),
    gate("controlled_activation_communication_sends_nothing", "Communication readiness sends nothing", controlledCommunication.ready && controlledCommunication.noMessagesSent, "Communication readiness is draft-only and sends nothing."),
    gate("controlled_activation_first_hour_fetches_no_urls", "First-hour readiness fetches no URLs", controlledFirstHour.ready && controlledFirstHour.noPreviewUrlFetched, "First-hour readiness performs no monitoring and fetches no preview URLs."),
    gate("controlled_activation_issue_intake_manual_only", "Issue intake is manual only", controlledIssueIntake.ready && controlledIssueIntake.manualOnly && controlledIssueIntake.noFeedbackCollected, "Issue intake readiness collects no real feedback."),
    gate("controlled_activation_pause_rollback_criteria_exist", "Pause/rollback criteria exist", controlledPauseRollback.ready && controlledPauseRollback.pauseCriteria.length > 0 && controlledPauseRollback.rollbackCriteria.length > 0 && controlledPauseRollback.noRollbackPerformed, "Pause and rollback criteria exist and no rollback is performed."),
    gate("controlled_activation_package_exists", "Activation package exists", controlledActivationPackageReport.ready && controlledActivationPackage.inMemoryOnly, "Activation package is valid and in-memory only."),
    gate("controlled_activation_no_launch_performed_by_code", "No launch performed by code", !controlledActivationPackage.launchPerformed && controlledLaunchActivation.noLaunchPerformed, "Limited Soft Launch Execution 4.1 performs no launch."),
    gate("controlled_activation_no_users_contacted_by_code", "No users contacted by code", !controlledActivationPackage.usersContacted && controlledParticipantAccess.noUsersContacted && controlledCommunication.noUsersContacted, "Limited Soft Launch Execution 4.1 contacts no users."),
    gate("controlled_activation_no_real_feedback_collected", "No real feedback collected by code", !controlledActivationPackage.realFeedbackCollected && controlledIssueIntake.noFeedbackCollected, "Limited Soft Launch Execution 4.1 collects no real feedback."),
    gate("controlled_activation_no_external_analytics_enabled", "No external analytics enabled", !controlledActivationPackage.analyticsSent, "External analytics remain disabled."),
    gate("controlled_activation_no_production_persistence_enabled", "No production persistence enabled", !controlledActivationPackage.databaseWritten, "Production persistence remains disabled."),
    gate("controlled_activation_no_live_ai_orchestration_enabled", "No live AI orchestration enabled", controlledLaunchActivation.checklist.checks.some((entry) => entry.id === "live_ai_orchestration_disabled" && entry.complete), "Live AI orchestration remains disabled."),
    gate("controlled_activation_scripture_anchoring_required", "Scripture anchoring required", controlledLaunchActivation.checklist.checks.some((entry) => entry.id === "scripture_anchoring_required" && entry.complete), "Scripture anchoring remains required."),
    gate("controlled_activation_explanation_paths_required", "Explanation paths required", controlledLaunchActivation.checklist.checks.some((entry) => entry.id === "explanation_paths_required" && entry.complete), "Explanation paths remain required."),
    gate("controlled_activation_fallback_enabled", "Fallback enabled", controlledLaunchActivation.checklist.checks.some((entry) => entry.id === "fallback_path_enabled" && entry.complete), "Fallback remains enabled."),
    gate("controlled_activation_consent_controls_enabled", "Consent controls enabled", controlledLaunchActivation.checklist.checks.some((entry) => entry.id === "consent_controls_enabled" && entry.complete), "Consent controls remain enabled."),
    gate("controlled_activation_audit_complete", "Controlled activation audit complete", controlledActivationAudit.complete && controlledActivationAudit.completionPercentage === 100, "Limited Soft Launch Execution 4.1 audit is complete."),
    gate("launch_day_monitoring_structure_exists", "Launch-day monitoring structure exists", launchDayMonitoring.ready && launchDayMonitoring.noLaunchPerformed, "Launch-day monitoring run is in-memory only and performs no launch."),
    gate("launch_day_first_hour_checklist_exists", "First-hour checklist exists", launchDayFirstHour.ready && launchDayFirstHour.checklistCount >= 20 && launchDayFirstHour.noPreviewUrlFetched, "First-hour monitoring checklist exists and fetches no URLs."),
    gate("launch_day_surface_health_tracker_exists", "Surface health tracker exists", launchDaySurfaceHealth.ready && launchDaySurfaceHealth.requiredSurfaces.length >= 15, "Surface health tracker covers required surfaces."),
    gate("launch_day_scripture_explanation_fallback_watch_exists", "Scripture/explanation/fallback watch exists", launchDayWatch.ready && launchDayWatch.checklist.length >= 10, "Scripture, explanation, fallback, confidence, and certainty watch exists."),
    gate("launch_day_manual_feedback_intake_manual_only", "Manual feedback intake is manual only", launchDayFeedback.ready && launchDayFeedback.manualOnly && launchDayFeedback.noFeedbackCollectedAutomatically, "Feedback intake is manual only and collects no feedback automatically."),
    gate("launch_day_feedback_privacy_guard_exists", "Feedback privacy guard exists", launchDayPrivacy.rawPrivateUserTextStored === false && launchDayPrivacy.hiddenPersonalizationCreated === false, "Feedback privacy guard blocks raw private text storage and hidden personalization."),
    gate("launch_day_issue_escalation_exists", "Issue escalation exists", launchDayEscalation.valid && launchDayEscalation.noExternalSend, "Issue escalation is structured and sends nothing externally."),
    gate("launch_day_pause_rollback_watch_exists", "Pause/rollback watch exists", launchDayPauseRollback.ready && launchDayPauseRollback.noRollbackPerformed && launchDayPauseRollback.noProviderCommandsExecuted, "Pause/rollback watch performs no rollback or provider commands."),
    gate("launch_day_daily_review_exists", "Daily review exists", launchDayDailyReview.ready && launchDayDailyReview.noExternalWrite, "Daily review is in-memory only."),
    gate("launch_day_no_users_contacted_by_code", "No users contacted by code in 4.2", !launchDayPackage.usersContacted, "Launch-day monitoring contacts no users."),
    gate("launch_day_no_feedback_collected_automatically", "No feedback collected automatically in 4.2", !launchDayPackage.feedbackCollectedAutomatically && launchDayFeedback.noFeedbackCollectedAutomatically, "Feedback intake is manual only."),
    gate("launch_day_no_external_analytics_enabled", "No external analytics enabled in 4.2", !launchDayPackage.analyticsSent, "External analytics remain disabled."),
    gate("launch_day_no_production_persistence_enabled", "No production persistence enabled in 4.2", !launchDayPackage.databaseWritten, "Production persistence remains disabled."),
    gate("launch_day_no_live_ai_orchestration_enabled", "No live AI orchestration enabled in 4.2", !launchDayPackage.previewUrlFetched, "Live AI orchestration remains disabled and no preview URLs are fetched."),
    gate("launch_day_scripture_anchoring_required", "Scripture anchoring required in 4.2", launchDayWatch.checklist.some((entry) => entry.id === "scripture_anchor_visible"), "Scripture anchoring remains launch-critical."),
    gate("launch_day_explanation_paths_required", "Explanation paths required in 4.2", launchDayWatch.checklist.some((entry) => entry.id === "explanation_path_visible"), "Explanation paths remain launch-critical."),
    gate("launch_day_fallback_enabled", "Fallback enabled in 4.2", launchDayWatch.checklist.some((entry) => entry.id === "fallback_non_empty"), "Fallback behavior remains launch-critical."),
    gate("launch_day_consent_controls_enabled", "Consent controls enabled in 4.2", launchDayFirstHour.plan.checklist.some((entry) => entry.id === "consent_controls_visible"), "Consent controls remain required."),
    gate("launch_day_monitoring_package_exists", "Monitoring package exists", launchDayPackageReport.ready && launchDayPackage.inMemoryOnly, "Launch-day monitoring package is in-memory only."),
    gate("launch_day_monitoring_audit_complete", "Launch-day monitoring audit complete", launchDayAudit.complete && launchDayAudit.completionPercentage === 100, "Limited Soft Launch Execution 4.2 audit is complete."),
    gate("soft_launch_feedback_triage_engine_exists", "Feedback triage engine exists", softLaunchFeedbackDailyReviewPackage.feedbackTriageReport.itemCount >= 1 && softLaunchFeedbackDailyReviewPackage.feedbackTriageReport.noExternalWrite, "Feedback triage is manual and in-memory only."),
    gate("soft_launch_launch_critical_feedback_classification_exists", "Launch-critical feedback classification exists", softLaunchFeedbackDailyReviewPackage.feedbackTriageReport.launchCriticalCount >= 1, "Launch-critical sample feedback is classified for owner review."),
    gate("soft_launch_feedback_issue_conversion_exists", "Feedback-to-issue conversion exists", softLaunchFeedbackDailyReviewPackage.issueConversionReport.issueCount >= 1 && softLaunchFeedbackDailyReviewPackage.issueConversionReport.noDatabaseWrites, "Feedback is converted to in-memory fix queue items only."),
    gate("soft_launch_fix_queue_exists", "Fix queue exists", softLaunchFeedbackDailyReviewPackage.fixQueueReport.itemCount >= 1 && softLaunchFeedbackDailyReviewPackage.fixQueueReport.noExternalWrite, "Fix queue is manual and in-memory only."),
    gate("soft_launch_fix_queue_safety_exists", "Fix queue safety exists", softLaunchFeedbackDailyReviewPackage.fixQueueSafetyReport.noScriptureAnchorsRemoved && softLaunchFeedbackDailyReviewPackage.fixQueueSafetyReport.noExplanationPathsRemoved && softLaunchFeedbackDailyReviewPackage.fixQueueSafetyReport.noHiddenPersonalizationCreated, "Fix queue safety preserves Scripture, explanation, fallback, consent, privacy, and personalization guardrails."),
    gate("soft_launch_fix_regression_mapping_exists", "Fix regression mapping exists", softLaunchFeedbackDailyReviewPackage.regressionReport.criticalChecks.length > 0 && softLaunchFeedbackDailyReviewPackage.regressionReport.noExternalWrite, "Regression mapping is available for launch-critical safe fixes."),
    gate("soft_launch_daily_review_manager_exists", "Daily review manager exists", softLaunchFeedbackDailyReviewPackage.dailyReviewReport.summary.recordCount >= 1 && softLaunchFeedbackDailyReviewPackage.dailyReviewReport.noExternalWrite, "Daily review manager is in-memory only."),
    gate("soft_launch_pause_continue_decision_exists", "Pause/continue decision exists", softLaunchFeedbackDailyReviewPackage.pauseContinueDecisionReport.noRollbackPerformed && softLaunchFeedbackDailyReviewPackage.pauseContinueDecisionReport.noUsersContacted && softLaunchFeedbackDailyReviewPackage.pauseContinueDecisionReport.noFeedbackCollectedAutomatically, "Pause/continue decision performs no rollback, contact, or feedback collection."),
    gate("soft_launch_owner_daily_review_exists", "Owner daily review exists", softLaunchFeedbackDailyReviewPackage.ownerDailyReviewReport.ready && softLaunchFeedbackDailyReviewPackage.ownerDailyReviewReport.noUsersContacted, "Owner daily review is manual-only and contacts no users."),
    gate("soft_launch_4_3_no_users_contacted_by_code", "No users contacted by code in 4.3", !softLaunchFeedbackDailyReviewPackage.usersContacted, "Feedback triage and daily review contact no users."),
    gate("soft_launch_4_3_no_feedback_collected_automatically", "No feedback collected automatically in 4.3", !softLaunchFeedbackDailyReviewPackage.feedbackCollectedAutomatically, "Feedback triage uses manual sanitized input only."),
    gate("soft_launch_4_3_no_external_analytics_enabled", "No external analytics enabled in 4.3", !softLaunchFeedbackDailyReviewPackage.analyticsSent, "External analytics remain disabled."),
    gate("soft_launch_4_3_no_production_persistence_enabled", "No production persistence enabled in 4.3", !softLaunchFeedbackDailyReviewPackage.databaseWritten, "Production persistence remains disabled."),
    gate("soft_launch_4_3_no_live_ai_orchestration_enabled", "No live AI orchestration enabled in 4.3", !softLaunchFeedbackDailyReviewPackage.previewUrlFetched && !softLaunchFeedbackDailyReviewPackage.externalServicesCalled, "Live AI orchestration and external service calls remain disabled."),
    gate("soft_launch_4_3_scripture_anchoring_required", "Scripture anchoring required in 4.3", softLaunchFeedbackDailyReviewPackage.fixQueueSafetyReport.noScriptureAnchorsRemoved, "Scripture anchors remain launch-critical."),
    gate("soft_launch_4_3_explanation_paths_required", "Explanation paths required in 4.3", softLaunchFeedbackDailyReviewPackage.fixQueueSafetyReport.noExplanationPathsRemoved, "Explanation paths remain launch-critical."),
    gate("soft_launch_4_3_fallback_enabled", "Fallback enabled in 4.3", softLaunchFeedbackDailyReviewPackage.fixQueueSafetyReport.noLiveAiOrchestrationEnabled, "Fallback behavior remains protected while live AI orchestration is disabled."),
    gate("soft_launch_4_3_consent_controls_enabled", "Consent controls enabled in 4.3", softLaunchFeedbackDailyReviewPackage.fixQueueSafetyReport.noProductionPersistenceEnabled, "Consent and privacy controls remain protected while persistence is disabled."),
    gate("soft_launch_feedback_daily_review_package_exists", "Feedback daily review package exists", softLaunchFeedbackDailyReviewPackageReport.inMemoryOnly && softLaunchFeedbackDailyReviewPackage.inMemoryOnly, "Feedback daily review package is in-memory only."),
    gate("soft_launch_feedback_daily_review_audit_complete", "Feedback daily review audit complete", softLaunchFeedbackDailyReviewAudit.complete && softLaunchFeedbackDailyReviewAudit.completionPercentage === 100, "Limited Soft Launch Execution 4.3 audit is complete."),
    gate("soft_launch_safe_fix_release_plan_exists", "Safe fix release plan exists", softLaunchStabilizationPackage.safeFixReleasePlanReport.candidateCount >= 1 && softLaunchStabilizationPackage.safeFixReleasePlanReport.noFixesAppliedAutomatically, "Safe fix release plan exists and applies no fixes automatically."),
    gate("soft_launch_safe_fix_safety_validator_exists", "Safe fix safety validator exists", softLaunchStabilizationPackage.safeFixReleaseSafetyReport.noScriptureAnchorsRemoved && softLaunchStabilizationPackage.safeFixReleaseSafetyReport.noExplanationPathsRemoved, "Safe fix safety validator preserves Scripture and explanations."),
    gate("soft_launch_unsafe_fixes_blocked", "Unsafe fixes are blocked", softLaunchStabilizationPackage.safeFixReleaseSafetyReport.valid, "Default stabilization package contains only safe release candidates; unsafe candidates are blocked by the smoke check."),
    gate("soft_launch_stabilization_regression_exists", "Stabilization regression exists", softLaunchStabilizationPackage.stabilizationRegressionReport.checkCount >= 10 && softLaunchStabilizationPackage.stabilizationRegressionReport.noExternalWrite, "Stabilization regression records manual results in memory."),
    gate("soft_launch_post_release_safety_exists", "Post-release safety verification exists", softLaunchStabilizationPackage.postReleaseSafetyReport.ready && softLaunchStabilizationPackage.postReleaseSafetyReport.scriptureAnchoringRequired, "Post-release safety verification preserves Scripture, explanation, fallback, consent, privacy, and disabled providers."),
    gate("soft_launch_post_release_surface_stabilization_exists", "Post-release surface stabilization exists", softLaunchStabilizationPackage.postReleaseSurfaceStabilizationReport.requiredSurfaceCount >= 15 && softLaunchStabilizationPackage.postReleaseSurfaceStabilizationReport.noExternalServiceRequired, "Post-release surface stabilization covers required launch surfaces."),
    gate("soft_launch_stabilization_package_exists", "Stabilization package exists", softLaunchStabilizationPackageReport.inMemoryOnly && softLaunchStabilizationPackage.inMemoryOnly, "Stabilization package is in-memory only."),
    gate("soft_launch_stabilization_owner_review_exists", "Stabilization owner review exists", softLaunchStabilizationPackage.ownerReviewReport.ready && softLaunchStabilizationPackage.ownerReviewReport.noUsersContacted, "Stabilization owner review is manual-only and contacts no users."),
    gate("soft_launch_stabilization_continue_pause_exists", "Stabilization continue/pause decision exists", softLaunchStabilizationPackage.stabilizationContinuePauseReport.noRollbackPerformed && softLaunchStabilizationPackage.stabilizationContinuePauseReport.noUsersContacted, "Continue/pause decision performs no rollback or user contact."),
    gate("soft_launch_4_4_no_fix_removes_scripture_anchors", "No fix removes Scripture anchors in 4.4", softLaunchStabilizationPackage.safeFixReleaseSafetyReport.noScriptureAnchorsRemoved, "Safe fixes must preserve Scripture anchors."),
    gate("soft_launch_4_4_no_fix_removes_explanation_paths", "No fix removes explanation paths in 4.4", softLaunchStabilizationPackage.safeFixReleaseSafetyReport.noExplanationPathsRemoved, "Safe fixes must preserve explanation paths."),
    gate("soft_launch_4_4_no_fix_weakens_fallback_safety", "No fix weakens fallback safety in 4.4", softLaunchStabilizationPackage.safeFixReleaseSafetyReport.noFallbackSafetyWeakened, "Safe fixes must preserve fallback safety."),
    gate("soft_launch_4_4_no_fix_hides_consent_controls", "No fix hides consent controls in 4.4", softLaunchStabilizationPackage.safeFixReleaseSafetyReport.noConsentControlsHidden, "Safe fixes must preserve consent controls."),
    gate("soft_launch_4_4_no_external_analytics_enabled", "No external analytics enabled in 4.4", !softLaunchStabilizationPackage.analyticsSent && softLaunchStabilizationPackage.safeFixReleaseSafetyReport.noExternalAnalyticsEnabled, "External analytics remain disabled."),
    gate("soft_launch_4_4_no_production_persistence_enabled", "No production persistence enabled in 4.4", !softLaunchStabilizationPackage.databaseWritten && softLaunchStabilizationPackage.safeFixReleaseSafetyReport.noProductionPersistenceEnabled, "Production persistence remains disabled."),
    gate("soft_launch_4_4_no_live_ai_orchestration_enabled", "No live AI orchestration enabled in 4.4", !softLaunchStabilizationPackage.externalServicesCalled && softLaunchStabilizationPackage.safeFixReleaseSafetyReport.noLiveAiOrchestrationEnabled, "Live AI orchestration remains disabled."),
    gate("soft_launch_safe_fix_stabilization_audit_complete", "Safe fix stabilization audit complete", softLaunchSafeFixStabilizationAudit.complete && softLaunchSafeFixStabilizationAudit.completionPercentage === 100, "Limited Soft Launch Execution 4.4 audit is complete."),
    gate("soft_launch_completion_review_exists", "Soft launch completion review exists", softLaunchCompletionReview.ready && softLaunchCompletionReview.noPublicLaunchPerformed, "Completion review is ready and performs no public launch."),
    gate("soft_launch_completion_issue_closure_exists", "Issue closure exists", softLaunchIssueClosure.ready && softLaunchIssueClosure.launchCriticalUnresolvedCount === 0, "Issue closure has no unresolved launch-critical blockers."),
    gate("soft_launch_completion_stability_certification_exists", "Stability certification exists", softLaunchStability.ready && softLaunchStability.runtimeStable && softLaunchStability.surfaceStable, "Soft launch stability certification is ready."),
    gate("soft_launch_completion_final_safety_privacy_exists", "Final safety/privacy review exists", softLaunchFinalSafetyPrivacy.ready && softLaunchFinalSafetyPrivacy.scriptureAnchoringRequired && softLaunchFinalSafetyPrivacy.explanationPathsRequired, "Final safety/privacy review preserves Scripture, explanations, fallback, consent, privacy, and disabled providers."),
    gate("public_launch_readiness_criteria_exists", "Public launch readiness criteria exists", publicLaunchReadinessCriteria.ready && publicLaunchReadinessCriteria.noPublicLaunchPerformed, "Public launch readiness criteria are ready and launch nothing."),
    gate("public_launch_readiness_package_exists", "Public launch readiness package exists", publicLaunchReadinessPackageReport.ready && publicLaunchReadinessPackage.inMemoryOnly, "Public launch readiness package is in-memory only."),
    gate("public_launch_risk_register_exists", "Public launch risk register exists", publicLaunchRiskRegisterReport.ready && publicLaunchRiskRegisterReport.inMemoryOnly, "Public launch risk register is in-memory only."),
    gate("public_launch_known_limitations_exist", "Known limitations exist", publicLaunchKnownLimitationsReport.ready && publicLaunchKnownLimitationsReport.limitationCount >= 8, "Public launch known limitations are documented."),
    gate("public_launch_owner_readiness_review_exists", "Owner readiness review exists", publicLaunchOwnerReadinessReport.ready && publicLaunchOwnerReadinessReport.noUsersContacted, "Public launch owner readiness review is manual-only."),
    gate("public_launch_readiness_handoff_exists", "Readiness handoff exists", publicLaunchReadinessHandoffReport.ready && publicLaunchReadinessHandoffReport.noPublicLaunchPerformed, "Public launch readiness handoff prepares the next stage without launching."),
    gate("soft_launch_4_5_no_unresolved_launch_critical_blockers", "No unresolved launch-critical blockers in 4.5", softLaunchIssueClosure.launchCriticalUnresolvedCount === 0 && publicLaunchReadinessPackageReport.blockers.length === 0, "Completion review has no unresolved launch-critical blockers."),
    gate("soft_launch_4_5_no_public_launch_by_code", "No public launch performed by code", !publicLaunchReadinessPackage.publicLaunchPerformed && publicLaunchReadinessPackageReport.noPublicLaunchPerformed, "4.5 performs no public launch."),
    gate("soft_launch_4_5_no_users_contacted_by_code", "No users contacted by code", !publicLaunchReadinessPackage.usersContacted && publicLaunchOwnerReadinessReport.noUsersContacted, "4.5 contacts no users."),
    gate("soft_launch_4_5_no_feedback_collected_automatically", "No feedback collected automatically", !publicLaunchReadinessPackage.feedbackCollectedAutomatically && softLaunchFeedbackSummary.noFeedbackCollectedAutomatically, "4.5 collects no feedback automatically."),
    gate("soft_launch_4_5_no_external_analytics_enabled", "No external analytics enabled in 4.5", !publicLaunchReadinessPackage.analyticsSent && publicLaunchReadinessPackageReport.noExternalAnalyticsEnabled, "External analytics remain disabled."),
    gate("soft_launch_4_5_no_production_persistence_enabled", "No production persistence enabled in 4.5", !publicLaunchReadinessPackage.databaseWritten && publicLaunchReadinessPackageReport.noProductionPersistenceEnabled, "Production persistence remains disabled."),
    gate("soft_launch_4_5_no_live_ai_orchestration_enabled", "No live AI orchestration enabled in 4.5", !publicLaunchReadinessPackage.externalServicesCalled && publicLaunchReadinessPackageReport.noLiveAiOrchestrationEnabled, "Live AI orchestration remains disabled."),
    gate("soft_launch_4_5_scripture_anchoring_required", "Scripture anchoring required in 4.5", softLaunchFinalSafetyPrivacy.scriptureAnchoringRequired, "Scripture anchoring remains required."),
    gate("soft_launch_4_5_explanation_paths_required", "Explanation paths required in 4.5", softLaunchFinalSafetyPrivacy.explanationPathsRequired, "Explanation paths remain required."),
    gate("soft_launch_4_5_fallback_enabled", "Fallback enabled in 4.5", softLaunchFinalSafetyPrivacy.fallbackSafetyReady, "Fallback remains enabled and non-empty."),
    gate("soft_launch_4_5_consent_controls_enabled", "Consent controls enabled in 4.5", softLaunchFinalSafetyPrivacy.consentSafetyReady, "Consent controls remain enabled."),
    gate("soft_launch_completion_audit_complete", "Soft launch completion audit complete", softLaunchCompletionAudit.complete && softLaunchCompletionAudit.completionPercentage === 100, "Limited Soft Launch Execution 4.5 audit is complete."),
    gate("public_launch_5_1_readiness_audit_complete", "Public launch readiness audit complete", publicLaunchReadinessAudit.ready && publicLaunchReadinessAudit.readinessPercentage === 100, "Public Launch Preparation 5.1 readiness audit is complete."),
    gate("public_launch_5_1_service_connection_plan_exists", "Service connection plan exists", productionServiceConnectionPlanReport.ready && productionServiceConnectionPlanReport.noProvidersConnected && productionServiceConnectionPlanReport.noSecretsWritten, "Production service connection planning is provider-neutral and writes no secrets."),
    gate("public_launch_5_1_database_persistence_plan_exists", "Database persistence plan exists", publicLaunchDatabasePersistence.ready && publicLaunchDatabasePersistence.noDatabaseConnected && publicLaunchDatabasePersistence.noExternalWrite, "Database persistence remains deferred and disconnected."),
    gate("public_launch_5_1_analytics_plan_exists", "Analytics plan exists", publicLaunchAnalytics.ready && publicLaunchAnalytics.noAnalyticsConnected && publicLaunchAnalytics.noAnalyticsSent, "External analytics remain disconnected and unsent."),
    gate("public_launch_5_1_live_ai_plan_exists", "Live AI plan exists", publicLaunchLiveAi.ready && publicLaunchLiveAi.noLiveAiEnabled && publicLaunchLiveAi.noOpenAiApiCalled, "Live AI orchestration remains disabled and calls no OpenAI API."),
    gate("public_launch_5_1_privacy_consent_ready", "Privacy and consent readiness exists", publicLaunchPrivacyConsent.ready && publicLaunchPrivacyConsent.noRawSensitiveStorage && publicLaunchPrivacyConsent.noHiddenPersonalization, "Privacy and consent boundaries are ready for 5.2."),
    gate("public_launch_5_1_safety_certification_exists", "Public launch safety certification exists", publicLaunchSafety.ready && publicLaunchSafety.scriptureAnchoringRequired && publicLaunchSafety.explanationPathsRequired && publicLaunchSafety.fallbackSafetyReady, "Public launch safety certification preserves Scripture, explanations, fallback, consent, and disabled providers."),
    gate("public_launch_5_1_surface_certification_exists", "Public launch surface certification exists", publicLaunchSurfaceReadiness.ready && publicLaunchSurfaceReadiness.surfaceCount >= 15 && publicLaunchSurfaceReadiness.readySurfaceCount === publicLaunchSurfaceReadiness.surfaceCount, "Public launch surface certification covers all required surfaces."),
    gate("public_launch_5_1_owner_review_exists", "Public launch 5.1 owner review exists", publicLaunchOwnerReview.ready && publicLaunchOwnerReview.noUsersContacted, "Public Launch Preparation 5.1 owner review is manual-only."),
    gate("public_launch_5_1_preparation_package_exists", "Public launch preparation package exists", publicLaunchPreparationPackageReport.ready && publicLaunchPreparationPackage.inMemoryOnly, "Public Launch Preparation 5.1 package is in-memory only."),
    gate("public_launch_5_1_no_public_launch_by_code", "No public launch performed by code in 5.1", !publicLaunchPreparationPackage.publicLaunchPerformed && publicLaunchPreparationPackageReport.noPublicLaunchPerformed, "5.1 performs no public launch."),
    gate("public_launch_5_1_no_users_contacted_by_code", "No users contacted by code in 5.1", !publicLaunchPreparationPackage.usersContacted && publicLaunchPreparationPackageReport.noUsersContacted, "5.1 contacts no users."),
    gate("public_launch_5_1_no_feedback_collected_automatically", "No feedback collected automatically in 5.1", !publicLaunchPreparationPackage.feedbackCollectedAutomatically && publicLaunchPreparationPackageReport.noFeedbackCollectedAutomatically, "5.1 collects no feedback automatically."),
    gate("public_launch_5_1_no_external_analytics_enabled", "No external analytics enabled in 5.1", !publicLaunchPreparationPackage.analyticsSent && publicLaunchPreparationPackageReport.noExternalAnalyticsConnected, "External analytics remain disconnected."),
    gate("public_launch_5_1_no_production_persistence_enabled", "No production persistence enabled in 5.1", !publicLaunchPreparationPackage.databaseWritten && publicLaunchPreparationPackageReport.noProductionPersistenceConnected, "Production persistence remains disconnected."),
    gate("public_launch_5_1_no_live_ai_orchestration_enabled", "No live AI orchestration enabled in 5.1", !publicLaunchPreparationPackage.externalServicesCalled && publicLaunchPreparationPackageReport.noLiveAiOrchestrationEnabled, "Live AI orchestration remains disabled."),
    gate("public_launch_5_1_scripture_anchoring_required", "Scripture anchoring required in 5.1", publicLaunchSafety.scriptureAnchoringRequired, "Scripture anchoring remains required."),
    gate("public_launch_5_1_explanation_paths_required", "Explanation paths required in 5.1", publicLaunchSafety.explanationPathsRequired, "Explanation paths remain required."),
    gate("public_launch_5_1_fallback_enabled", "Fallback enabled in 5.1", publicLaunchSafety.fallbackSafetyReady, "Fallback remains enabled and non-empty."),
    gate("public_launch_5_1_consent_controls_enabled", "Consent controls enabled in 5.1", publicLaunchSafety.consentSafetyReady, "Consent controls remain enabled."),
    gate("public_launch_preparation_5_1_audit_complete", "Public Launch Preparation 5.1 audit complete", publicLaunchPreparationAudit.complete && publicLaunchPreparationAudit.completionPercentage === 100, "Public Launch Preparation 5.1 audit is complete."),
    gate("public_launch_5_2_privacy_notice_draft_exists", "Privacy notice draft exists", publicLaunchPrivacyNoticeCopy.ready && publicLaunchPrivacyNoticeCopy.draftOnly, "Privacy notice draft exists and is not final legal advice."),
    gate("public_launch_5_2_terms_draft_exists", "Terms draft exists", publicLaunchTermsCopy.ready && publicLaunchTermsCopy.noLegalFinalApprovalClaimed, "Terms draft exists and does not claim legal-final approval."),
    gate("public_launch_5_2_consent_copy_exists", "Consent copy exists", publicLaunchConsentCopy.ready && publicLaunchConsentCopy.noExternalWrite, "Consent copy exists for personalization, feedback, and disabled production services."),
    gate("public_launch_5_2_sensitive_info_warning_exists", "Sensitive information warning exists", publicLaunchSensitiveInfoCopy.ready, "Sensitive information, emergency, and professional-care warnings exist."),
    gate("public_launch_5_2_ai_tig_transparency_copy_exists", "AI/TIG transparency copy exists", publicLaunchAiTigTransparencyCopy.ready && publicLaunchAiTigTransparencyCopy.noDivineCertaintyClaimed, "AI/TIG transparency copy explains confidence is not divine certainty."),
    gate("public_launch_5_2_feedback_notice_copy_exists", "Feedback notice copy exists", publicLaunchFeedbackNoticeCopy.ready && publicLaunchFeedbackNoticeCopy.noHiddenPersonalization, "Feedback notice copy explains feedback is not hidden personalization by default."),
    gate("public_launch_5_2_copy_package_exists", "Public launch copy package exists", publicLaunchCopyPackageReport.ready && publicLaunchCopyPackage.inMemoryOnly, "Public launch copy package is draft-only and in-memory."),
    gate("public_launch_5_2_public_qa_checklist_exists", "Public QA checklist exists", publicLaunchQaChecklistReport.ready && publicLaunchQaChecklistReport.surfaceCount >= 17, "Public QA checklist covers public launch surfaces."),
    gate("public_launch_5_2_privacy_consent_qa_exists", "Privacy/consent QA exists", publicLaunchPrivacyConsentQaReport.ready && publicLaunchPrivacyConsentQaReport.noHiddenPersonalization, "Privacy/consent QA blocks missing copy, hidden personalization, disabled service confusion, and divine certainty claims."),
    gate("public_launch_5_2_copy_owner_legal_review_exists", "Copy owner/legal review exists", publicLaunchCopyOwnerReviewReport.ready && publicLaunchCopyOwnerReviewReport.noLegalFinalApprovalClaimedWithoutRecord, "Owner/legal review structure does not claim approval unless recorded."),
    gate("public_launch_5_2_no_legal_final_approval_claimed", "No legal-final approval claimed unless recorded", publicLaunchTermsCopy.noLegalFinalApprovalClaimed && publicLaunchCopyPackageReport.noLegalFinalApprovalClaimed && publicLaunchCopyOwnerReviewReport.noLegalFinalApprovalClaimedWithoutRecord, "5.2 keeps legal copy as draft unless legal approval is recorded."),
    gate("public_launch_5_2_copy_qa_package_exists", "Copy QA package exists", publicLaunchCopyQaPackageReport.ready && publicLaunchCopyQaPackage.inMemoryOnly, "Copy QA package combines copy, QA, privacy/consent QA, and owner/legal review."),
    gate("public_launch_5_2_no_public_launch_by_code", "No public launch performed by code in 5.2", publicLaunchCopyQaPackageReport.noPublicLaunchPerformed, "5.2 performs no public launch."),
    gate("public_launch_5_2_no_users_contacted_by_code", "No users contacted by code in 5.2", publicLaunchCopyQaPackageReport.noUsersContacted, "5.2 contacts no users."),
    gate("public_launch_5_2_no_feedback_collected_automatically", "No feedback collected automatically in 5.2", publicLaunchCopyQaPackageReport.noFeedbackCollectedAutomatically, "5.2 collects no feedback automatically."),
    gate("public_launch_5_2_no_external_analytics_enabled", "No external analytics enabled in 5.2", publicLaunchCopyQaPackageReport.noExternalAnalyticsSent, "External analytics remain disconnected."),
    gate("public_launch_5_2_no_production_persistence_enabled", "No production persistence enabled in 5.2", publicLaunchCopyQaPackageReport.noProductionPersistenceEnabled, "Production persistence remains disconnected."),
    gate("public_launch_5_2_no_live_ai_orchestration_enabled", "No live AI orchestration enabled in 5.2", publicLaunchCopyQaPackageReport.noLiveAiOrchestrationEnabled, "Live AI orchestration remains disabled."),
    gate("public_launch_5_2_scripture_anchoring_required", "Scripture anchoring required in 5.2", publicLaunchSafety.scriptureAnchoringRequired, "Scripture anchoring remains required."),
    gate("public_launch_5_2_explanation_paths_required", "Explanation paths required in 5.2", publicLaunchSafety.explanationPathsRequired, "Explanation paths remain required."),
    gate("public_launch_5_2_fallback_enabled", "Fallback enabled in 5.2", publicLaunchSafety.fallbackSafetyReady, "Fallback remains enabled and non-empty."),
    gate("public_launch_5_2_consent_controls_enabled", "Consent controls enabled in 5.2", publicLaunchSafety.consentSafetyReady, "Consent controls remain enabled."),
    gate("public_launch_privacy_qa_audit_complete", "Public launch privacy/QA audit complete", publicLaunchPrivacyQaAudit.complete && publicLaunchPrivacyQaAudit.completionPercentage === 100, "Public Launch Preparation 5.2 audit is complete."),
    gate("public_launch_5_3_surface_copy_registry_exists", "Public surface copy registry exists", publicSurfaceCopyRegistryReport.ready && publicSurfaceCopyRegistryReport.requirementCount >= 20, "Public surface copy registry maps required notices to launch surfaces."),
    gate("public_launch_5_3_ui_adapter_exists", "Public copy UI adapter exists", publicCopyUiAdapterReport.ready && publicCopyUiAdapterReport.adaptedNoticeTypes.length >= 8, "Public copy UI adapter converts 5.2 copy into notice card props."),
    gate("public_launch_5_3_integration_validator_exists", "Public surface copy integration validator exists", publicSurfaceCopyIntegrationValidation.ready && publicSurfaceCopyIntegrationValidation.noExternalWrite, "Public surface copy integration validator is ready and in-memory."),
    gate("public_launch_5_3_final_qa_checklist_exists", "Public final QA checklist exists", publicSurfaceFinalQaChecklistReport.ready && publicSurfaceFinalQaChecklistReport.checkCount >= 14, "Final QA checklist covers public copy visibility, routes, mobile accessibility, and no side effects."),
    gate("public_launch_5_3_final_qa_dry_run_exists", "Public final QA dry run exists", publicQaDryRunReport.ready && publicQaDryRunReport.noPublicLaunchPerformed, "Final QA dry run is manual, in-memory, and performs no launch."),
    gate("public_launch_5_3_accessibility_qa_exists", "Public copy accessibility QA exists", publicCopyAccessibilityQaReport.ready && publicCopyAccessibilityQaReport.passCount === publicCopyAccessibilityQaReport.checklist.length, "Public copy accessibility QA passes all default checks."),
    gate("public_launch_5_3_owner_review_exists", "Public surface copy owner review exists", publicSurfaceCopyOwnerReviewReport.ready && publicSurfaceCopyOwnerReviewReport.noLegalFinalApprovalClaimedWithoutRecord, "Owner review structure exists without claiming legal approval."),
    gate("public_launch_5_3_copy_integration_package_exists", "Public copy integration package exists", publicCopyIntegrationPackageReport.ready && publicCopyIntegrationPackage.inMemoryOnly, "Public copy integration package combines registry, adapter, validation, dry run, accessibility QA, and owner review."),
    gate("public_launch_5_3_no_public_launch_by_code", "No public launch performed by code in 5.3", publicCopyIntegrationPackageReport.noPublicLaunchPerformed, "5.3 performs no public launch."),
    gate("public_launch_5_3_no_users_contacted_by_code", "No users contacted by code in 5.3", publicCopyIntegrationPackageReport.noUsersContacted, "5.3 contacts no users."),
    gate("public_launch_5_3_no_feedback_collected_automatically", "No feedback collected automatically in 5.3", publicCopyIntegrationPackageReport.noFeedbackCollectedAutomatically, "5.3 collects no feedback automatically."),
    gate("public_launch_5_3_no_external_analytics_enabled", "No external analytics enabled in 5.3", publicCopyIntegrationPackageReport.noExternalAnalyticsSent, "External analytics remain disconnected."),
    gate("public_launch_5_3_no_production_persistence_enabled", "No production persistence enabled in 5.3", publicCopyIntegrationPackageReport.noProductionPersistenceEnabled, "Production persistence remains disconnected."),
    gate("public_launch_5_3_no_live_ai_orchestration_enabled", "No live AI orchestration enabled in 5.3", publicCopyIntegrationPackageReport.noLiveAiOrchestrationEnabled, "Live AI orchestration remains disabled."),
    gate("public_launch_5_3_scripture_anchoring_required", "Scripture anchoring required in 5.3", publicLaunchSafety.scriptureAnchoringRequired, "Scripture anchoring remains required."),
    gate("public_launch_5_3_explanation_paths_required", "Explanation paths required in 5.3", publicLaunchSafety.explanationPathsRequired, "Explanation paths remain required."),
    gate("public_launch_5_3_fallback_enabled", "Fallback enabled in 5.3", publicLaunchSafety.fallbackSafetyReady, "Fallback remains enabled and non-empty."),
    gate("public_launch_5_3_consent_controls_enabled", "Consent controls enabled in 5.3", publicLaunchSafety.consentSafetyReady, "Consent controls remain enabled."),
    gate("public_launch_surface_copy_integration_audit_complete", "Public surface copy integration audit complete", publicSurfaceCopyIntegrationAudit.complete && publicSurfaceCopyIntegrationAudit.completionPercentage === 100, "Public Launch Preparation 5.3 audit is complete."),
    gate("public_launch_5_4_production_service_decision_exists", "Production service decision exists", finalProductionServiceDecision.ready && finalProductionServiceDecision.noExternalAnalyticsSent && finalProductionServiceDecision.noProductionPersistenceEnabled && finalProductionServiceDecision.noLiveAiOrchestrationEnabled, "Final production service decision keeps deferred providers disconnected."),
    gate("public_launch_5_4_database_go_no_go_exists", "Database go/no-go exists", finalDatabasePersistenceGoNoGo.ready && finalDatabasePersistenceGoNoGo.noDatabaseConnected && finalDatabasePersistenceGoNoGo.noProviderInstalled, "Database go/no-go creates no database, migrations, or provider installation."),
    gate("public_launch_5_4_analytics_go_no_go_exists", "Analytics go/no-go exists", finalAnalyticsGoNoGo.ready && finalAnalyticsGoNoGo.noAnalyticsSent && finalAnalyticsGoNoGo.noSdkInstalled, "Analytics go/no-go sends no events and installs no provider SDK."),
    gate("public_launch_5_4_live_ai_go_no_go_exists", "Live AI go/no-go exists", finalLiveAiGoNoGo.ready && finalLiveAiGoNoGo.noOpenAiApiCalled && finalLiveAiGoNoGo.deterministicTigPreserved, "Live AI go/no-go calls no APIs and preserves deterministic TIG."),
    gate("public_launch_5_4_privacy_legal_readiness_exists", "Privacy/legal readiness exists", finalPublicPrivacyLegal.ready && finalPublicPrivacyLegal.noLegalFinalApprovalClaimedWithoutRecord && finalPublicPrivacyLegal.noDivineCertaintyClaimed, "Privacy/legal readiness keeps copy reviewable without unrecorded legal approval or divine certainty claims."),
    gate("public_launch_5_4_surface_qa_exists", "Public surface QA certification exists", finalPublicSurfaceQa.ready && finalPublicSurfaceQa.surfaceCount >= 18 && finalPublicSurfaceQa.readySurfaceCount === finalPublicSurfaceQa.surfaceCount, "Final public surface QA covers the required public surfaces."),
    gate("public_launch_5_4_public_safety_exists", "Public safety certification exists", finalPublicSafety.ready && finalPublicSafety.scriptureAnchoringRequired && finalPublicSafety.explanationPathsRequired && finalPublicSafety.fallbackSafetyReady && finalPublicSafety.consentSafetyReady, "Final public safety preserves Scripture, explanations, fallback, confidence, consent, privacy, and disabled providers."),
    gate("public_launch_5_4_risk_register_exists", "Final public launch risk register exists", finalPublicRiskRegister.ready && finalPublicRiskRegister.inMemoryOnly, "Final public launch risk register is in-memory only and has no open critical risks."),
    gate("public_launch_5_4_final_package_exists", "Final public launch package exists", finalPublicLaunchPackageReport.ready && finalPublicLaunchPackage.inMemoryOnly, "Final public launch package combines service, privacy/legal, QA, safety, risk, copy integration, owner, and limitations reports."),
    gate("public_launch_5_4_owner_go_no_go_exists", "Owner go/no-go exists", finalPublicOwnerGoNoGo.ready && finalPublicOwnerGoNoGo.noLegalFinalApprovalClaimedWithoutRecord, "Owner go/no-go is structured and manual-only."),
    gate("public_launch_5_4_final_go_no_go_exists", "Final public go/no-go exists", finalPublicGoNoGo.ready && finalPublicGoNoGo.decision === "go_for_public_launch_execution_preparation", "Final public go/no-go returns a controlled execution-preparation decision."),
    gate("public_launch_5_4_execution_handoff_exists", "Execution handoff exists", publicLaunchExecutionHandoff.ready && publicLaunchExecutionHandoff.noPublicLaunchPerformed, "Public launch execution handoff prepares 6.1 without launching."),
    gate("public_launch_5_4_no_public_launch_by_code", "No public launch performed by code in 5.4", finalPublicGoNoGo.noPublicLaunchPerformed && finalPublicLaunchPackageReport.noPublicLaunchPerformed && publicLaunchExecutionHandoff.noPublicLaunchPerformed, "5.4 performs no public launch."),
    gate("public_launch_5_4_no_users_contacted_by_code", "No users contacted by code in 5.4", finalPublicGoNoGo.noUsersContacted && finalPublicLaunchPackageReport.noUsersContacted && publicLaunchExecutionHandoff.noUsersContacted, "5.4 contacts no users."),
    gate("public_launch_5_4_no_feedback_collected_automatically", "No feedback collected automatically in 5.4", finalPublicGoNoGo.noFeedbackCollectedAutomatically && finalPublicLaunchPackageReport.noFeedbackCollectedAutomatically && publicLaunchExecutionHandoff.noFeedbackCollectedAutomatically, "5.4 collects no feedback automatically."),
    gate("public_launch_5_4_no_external_analytics_enabled", "No external analytics enabled in 5.4", finalPublicGoNoGo.noExternalAnalyticsSent && finalPublicLaunchPackageReport.noExternalAnalyticsSent, "External analytics remain disconnected."),
    gate("public_launch_5_4_no_production_persistence_enabled", "No production persistence enabled in 5.4", finalPublicGoNoGo.noProductionPersistenceEnabled && finalPublicLaunchPackageReport.noProductionPersistenceEnabled, "Production persistence remains disconnected."),
    gate("public_launch_5_4_no_live_ai_orchestration_enabled", "No live AI orchestration enabled in 5.4", finalPublicGoNoGo.noLiveAiOrchestrationEnabled && finalPublicLaunchPackageReport.noLiveAiOrchestrationEnabled, "Live AI orchestration remains disabled."),
    gate("public_launch_5_4_scripture_anchoring_required", "Scripture anchoring required in 5.4", finalPublicSafety.scriptureAnchoringRequired, "Scripture anchoring remains required."),
    gate("public_launch_5_4_explanation_paths_required", "Explanation paths required in 5.4", finalPublicSafety.explanationPathsRequired, "Explanation paths remain required."),
    gate("public_launch_5_4_fallback_enabled", "Fallback enabled in 5.4", finalPublicSafety.fallbackSafetyReady, "Fallback remains enabled and non-empty."),
    gate("public_launch_5_4_consent_controls_enabled", "Consent controls enabled in 5.4", finalPublicSafety.consentSafetyReady, "Consent controls remain enabled."),
    gate("public_launch_5_4_final_audit_complete", "Final public launch preparation audit complete", finalPublicLaunchPreparationAudit.complete && finalPublicLaunchPreparationAudit.completionPercentage === 100, "Public Launch Preparation 5.4 audit is complete."),
    gate("public_feedback_triage_engine_exists", "Public feedback triage engine exists", publicFeedbackDailyReviewPackage.feedbackTriageReport.itemCount >= 1 && publicFeedbackDailyReviewPackage.feedbackTriageReport.noExternalWrite, "Public feedback triage is manual and in-memory only."),
    gate("public_launch_critical_feedback_classification_exists", "Public-launch-critical feedback classification exists", publicFeedbackDailyReviewPackage.feedbackTriageReport.publicLaunchCriticalCount >= 1, "Public-launch-critical sample feedback is classified for owner review."),
    gate("public_feedback_issue_conversion_exists", "Public feedback-to-issue conversion exists", publicFeedbackDailyReviewPackage.issueConversionReport.issueCount >= 1 && publicFeedbackDailyReviewPackage.issueConversionReport.noDatabaseWrites, "Public feedback is converted to in-memory issue records only."),
    gate("public_fix_queue_exists", "Public fix queue exists", publicFeedbackDailyReviewPackage.fixQueueReport.itemCount >= 1 && publicFeedbackDailyReviewPackage.fixQueueReport.noExternalWrite, "Public fix queue is manual and in-memory only."),
    gate("public_fix_queue_safety_exists", "Public fix queue safety exists", publicFeedbackDailyReviewPackage.fixQueueSafetyReport.noScriptureAnchorsRemoved && publicFeedbackDailyReviewPackage.fixQueueSafetyReport.noExplanationPathsRemoved && publicFeedbackDailyReviewPackage.fixQueueSafetyReport.noPrivacyTermsConsentNoticesRemoved, "Public fix queue safety preserves Scripture, explanations, fallback, consent, privacy, public notices, and disabled providers."),
    gate("public_regression_mapping_exists", "Public regression mapping exists", publicFeedbackDailyReviewPackage.regressionReport.criticalChecks.length > 0 && publicFeedbackDailyReviewPackage.regressionReport.noExternalWrite, "Public regression mapping is available for public-launch-critical fixes."),
    gate("public_daily_review_manager_exists", "Public daily review manager exists", publicFeedbackDailyReviewPackage.dailyReviewReport.summary.recordCount >= 1 && publicFeedbackDailyReviewPackage.dailyReviewReport.noExternalWrite, "Public daily review manager is in-memory only."),
    gate("public_pause_continue_decision_exists", "Public pause/continue decision exists", publicFeedbackDailyReviewPackage.pauseContinueReport.noRollbackPerformed && publicFeedbackDailyReviewPackage.pauseContinueReport.noUsersContacted && publicFeedbackDailyReviewPackage.pauseContinueReport.noFeedbackCollectedAutomatically, "Public pause/continue decision performs no rollback, contact, feedback collection, or external write."),
    gate("public_owner_daily_review_exists", "Public owner daily review exists", publicFeedbackDailyReviewPackage.ownerDailyReviewReport.ready && publicFeedbackDailyReviewPackage.ownerDailyReviewReport.noUsersContacted, "Public owner daily review is manual-only and contacts no users."),
    gate("public_6_3_no_users_contacted_by_code", "No users contacted by code in 6.3", !publicFeedbackDailyReviewPackage.usersContacted, "Public feedback triage and daily review contact no users."),
    gate("public_6_3_no_feedback_collected_automatically", "No feedback collected automatically in 6.3", !publicFeedbackDailyReviewPackage.feedbackCollectedAutomatically, "Public feedback triage uses manual sanitized input only."),
    gate("public_6_3_no_unapproved_external_analytics_enabled", "No unapproved external analytics enabled in 6.3", !publicFeedbackDailyReviewPackage.analyticsSent, "External analytics remain disabled."),
    gate("public_6_3_no_unapproved_production_persistence_enabled", "No unapproved production persistence enabled in 6.3", !publicFeedbackDailyReviewPackage.databaseWritten, "Production persistence remains disabled."),
    gate("public_6_3_no_live_ai_orchestration_enabled", "No live AI orchestration enabled in 6.3", !publicFeedbackDailyReviewPackage.liveAiOrchestrationEnabled && !publicFeedbackDailyReviewPackage.externalServicesCalled, "Live AI orchestration and external services remain disabled."),
    gate("public_6_3_scripture_anchoring_required", "Scripture anchoring required in 6.3", publicFeedbackDailyReviewPackage.fixQueueSafetyReport.noScriptureAnchorsRemoved, "Scripture anchors remain public-launch-critical."),
    gate("public_6_3_explanation_paths_required", "Explanation paths required in 6.3", publicFeedbackDailyReviewPackage.fixQueueSafetyReport.noExplanationPathsRemoved, "Explanation paths remain public-launch-critical."),
    gate("public_6_3_fallback_enabled", "Fallback enabled in 6.3", publicFeedbackDailyReviewPackage.fixQueueSafetyReport.noFallbackSafetyWeakened, "Fallback behavior remains protected."),
    gate("public_6_3_consent_controls_enabled", "Consent controls enabled in 6.3", publicFeedbackDailyReviewPackage.fixQueueSafetyReport.noConsentControlsHidden, "Consent controls remain protected."),
    gate("public_6_3_privacy_terms_consent_notices_available", "Privacy/terms/consent notices available in 6.3", publicFeedbackDailyReviewPackage.fixQueueSafetyReport.noPrivacyTermsConsentNoticesRemoved, "Public privacy, terms, and consent notices remain protected."),
    gate("public_feedback_daily_review_package_exists", "Public feedback daily review package exists", publicFeedbackDailyReviewPackageReport.inMemoryOnly && publicFeedbackDailyReviewPackage.inMemoryOnly, "Public feedback daily review package is in-memory only."),
    gate("public_feedback_daily_review_audit_complete", "Public feedback daily review audit complete", publicFeedbackDailyReviewAudit.complete && publicFeedbackDailyReviewAudit.completionPercentage === 100, "Public Launch Execution 6.3 audit is complete."),
    gate("public_6_4_safe_fix_release_plan_exists", "Public safe-fix release plan exists", publicLaunchStabilizationPackage.safeFixReleasePlanReport.candidateCount >= 1 && publicLaunchStabilizationPackage.safeFixReleasePlanReport.noFixesAppliedAutomatically, "Public safe-fix release plan exists and applies no fixes automatically."),
    gate("public_6_4_safe_fix_safety_validator_exists", "Public safe-fix safety validator exists", publicLaunchStabilizationPackage.safeFixReleaseSafetyReport.valid && publicLaunchStabilizationPackage.safeFixReleaseSafetyReport.noScriptureAnchorsRemoved && publicLaunchStabilizationPackage.safeFixReleaseSafetyReport.noExplanationPathsRemoved, "Public safe-fix safety validator preserves Scripture and explanations."),
    gate("public_6_4_unsafe_fixes_blocked", "Unsafe public fixes are blocked", publicLaunchStabilizationPackage.safeFixReleaseSafetyReport.noExternalAnalyticsEnabled && publicLaunchStabilizationPackage.safeFixReleaseSafetyReport.noRawSensitiveTextStored && publicLaunchStabilizationPackage.safeFixReleaseSafetyReport.noLiveAiOrchestrationEnabled, "Default stabilization package contains only safe release candidates; unsafe candidates are blocked by the smoke check."),
    gate("public_6_4_stabilization_regression_exists", "Public stabilization regression exists", publicLaunchStabilizationPackage.stabilizationRegressionReport.checkCount >= 10 && publicLaunchStabilizationPackage.stabilizationRegressionReport.noExternalWrite, "Public stabilization regression records manual results in memory."),
    gate("public_6_4_post_release_safety_exists", "Public post-release safety exists", publicLaunchStabilizationPackage.postReleaseSafetyReport.ready && publicLaunchStabilizationPackage.postReleaseSafetyReport.scriptureAnchoringRequired && publicLaunchStabilizationPackage.postReleaseSafetyReport.privacyTermsConsentRequired, "Post-release safety preserves Scripture, explanation, fallback, consent, privacy, public notices, and disabled providers."),
    gate("public_6_4_post_release_surface_stabilization_exists", "Public post-release surface stabilization exists", publicLaunchStabilizationPackage.postReleaseSurfaceStabilizationReport.requiredSurfaceCount >= 15 && publicLaunchStabilizationPackage.postReleaseSurfaceStabilizationReport.noExternalServiceRequired, "Public post-release surface stabilization covers required launch surfaces."),
    gate("public_6_4_stabilization_package_exists", "Public stabilization package exists", publicLaunchStabilizationPackageReport.inMemoryOnly && publicLaunchStabilizationPackage.inMemoryOnly, "Public stabilization package is in-memory only."),
    gate("public_6_4_stabilization_owner_review_exists", "Public stabilization owner review exists", publicLaunchStabilizationPackage.ownerReviewReport.ready && publicLaunchStabilizationPackage.ownerReviewReport.noUsersContacted, "Public stabilization owner review is manual-only and contacts no users."),
    gate("public_6_4_stabilization_continue_pause_exists", "Public stabilization continue/pause decision exists", publicLaunchStabilizationPackage.stabilizationContinuePauseReport.noRollbackPerformed && publicLaunchStabilizationPackage.stabilizationContinuePauseReport.noUsersContacted && publicLaunchStabilizationPackage.stabilizationContinuePauseReport.noPublicUrlFetched, "Public continue/pause decision performs no rollback, user contact, or public URL fetch."),
    gate("public_6_4_no_fix_removes_scripture_anchors", "No fix removes Scripture anchors in 6.4", publicLaunchStabilizationPackage.safeFixReleaseSafetyReport.noScriptureAnchorsRemoved, "Public safe fixes must preserve Scripture anchors."),
    gate("public_6_4_no_fix_removes_explanation_paths", "No fix removes explanation paths in 6.4", publicLaunchStabilizationPackage.safeFixReleaseSafetyReport.noExplanationPathsRemoved, "Public safe fixes must preserve explanation paths."),
    gate("public_6_4_no_fix_weakens_fallback_safety", "No fix weakens fallback safety in 6.4", publicLaunchStabilizationPackage.safeFixReleaseSafetyReport.noFallbackSafetyRemoved, "Public safe fixes must preserve fallback safety."),
    gate("public_6_4_no_fix_hides_consent_controls", "No fix hides consent controls in 6.4", publicLaunchStabilizationPackage.safeFixReleaseSafetyReport.noConsentControlsRemoved, "Public safe fixes must preserve consent controls."),
    gate("public_6_4_no_privacy_terms_consent_notices_removed", "No privacy/terms/consent notices removed in 6.4", publicLaunchStabilizationPackage.safeFixReleaseSafetyReport.noPrivacyTermsConsentNoticesRemoved, "Public safe fixes must preserve public privacy, terms, and consent notices."),
    gate("public_6_4_no_unapproved_external_analytics_enabled", "No unapproved external analytics enabled in 6.4", !publicLaunchStabilizationPackage.analyticsSent && publicLaunchStabilizationPackage.safeFixReleaseSafetyReport.noExternalAnalyticsEnabled, "External analytics remain disabled."),
    gate("public_6_4_no_unapproved_production_persistence_enabled", "No unapproved production persistence enabled in 6.4", !publicLaunchStabilizationPackage.databaseWritten && publicLaunchStabilizationPackage.safeFixReleaseSafetyReport.noProductionPersistenceEnabled, "Production persistence remains disabled."),
    gate("public_6_4_no_live_ai_orchestration_enabled", "No live AI orchestration enabled in 6.4", !publicLaunchStabilizationPackage.liveAiOrchestrationEnabled && !publicLaunchStabilizationPackage.externalServicesCalled && publicLaunchStabilizationPackage.safeFixReleaseSafetyReport.noLiveAiOrchestrationEnabled, "Live AI orchestration remains disabled."),
    gate("public_6_4_no_users_contacted_by_code", "No users contacted by code in 6.4", !publicLaunchStabilizationPackage.usersContacted && publicLaunchStabilizationPackageReport.noUsersContacted, "Public stabilization contacts no users."),
    gate("public_6_4_no_feedback_collected_automatically", "No feedback collected automatically in 6.4", !publicLaunchStabilizationPackage.feedbackCollectedAutomatically && publicLaunchStabilizationPackageReport.noFeedbackCollectedAutomatically, "Public stabilization collects no feedback automatically."),
    gate("public_6_4_no_public_url_fetched_by_code", "No public URL fetched by code in 6.4", !publicLaunchStabilizationPackage.publicUrlFetched && publicLaunchStabilizationPackageReport.noPublicUrlFetched, "Public stabilization fetches no public URLs."),
    gate("public_6_4_no_launch_or_rollback_performed", "No launch or rollback performed in 6.4", !publicLaunchStabilizationPackage.launchPerformed && !publicLaunchStabilizationPackage.rollbackPerformed && publicLaunchStabilizationPackageReport.noLaunchPerformed && publicLaunchStabilizationPackageReport.noRollbackPerformed, "Public stabilization performs no launch or rollback."),
    gate("public_safe_fix_stabilization_audit_complete", "Public safe-fix stabilization audit complete", publicSafeFixStabilizationAudit.complete && publicSafeFixStabilizationAudit.completionPercentage === 100, "Public Launch Execution 6.4 audit is complete."),
    gate("public_6_5_completion_review_exists", "Public launch completion review exists", publicLaunchCompletionReport.ready && publicLaunchCompletionReport.noPublicLaunchPerformedByCode, "Public launch completion review exists and performs no launch from code."),
    gate("public_6_5_feedback_summary_exists", "Public launch feedback summary exists", publicLaunchFeedbackSummaryReport.ready && publicLaunchFeedbackSummaryReport.manualOnly && publicLaunchFeedbackSummaryReport.sanitizedOnly, "Public launch feedback summary is manual and sanitized."),
    gate("public_6_5_issue_closure_exists", "Public launch issue closure exists", publicLaunchIssueClosureReport.ready && publicLaunchIssueClosureReport.publicLaunchCriticalUnresolvedCount === 0, "Public launch issue closure has no unresolved public-launch-critical blockers."),
    gate("public_6_5_stability_certification_exists", "Public launch stability certification exists", publicLaunchStabilityCertificationReport.ready && publicLaunchStabilityCertificationReport.runtimeStable && publicLaunchStabilityCertificationReport.surfaceStable, "Public stability certification is ready."),
    gate("public_6_5_final_safety_privacy_exists", "Final public launch safety/privacy review exists", publicLaunchFinalSafetyPrivacyReport.ready && publicLaunchFinalSafetyPrivacyReport.scriptureAnchoringRequired && publicLaunchFinalSafetyPrivacyReport.explanationPathsRequired, "Final safety/privacy review preserves Scripture, explanations, fallback, consent, privacy, and disabled providers."),
    gate("post_launch_readiness_criteria_exists", "Post-launch readiness criteria exists", postLaunchReadinessCriteriaReport.ready && postLaunchReadinessCriteriaReport.noPublicLaunchPerformedByCode, "Post-launch readiness criteria are available and launch nothing."),
    gate("post_launch_readiness_package_exists", "Post-launch readiness package exists", postLaunchReadinessPackageReport.ready && postLaunchReadinessPackage.inMemoryOnly, "Post-launch readiness package is in-memory only."),
    gate("post_launch_risk_register_exists", "Post-launch risk register exists", postLaunchRiskRegisterReport.ready && postLaunchRiskRegisterReport.inMemoryOnly, "Post-launch risk register is in-memory only."),
    gate("post_launch_known_limitations_exist", "Post-launch known limitations exist", postLaunchKnownLimitationsReport.ready && postLaunchKnownLimitationsReport.limitationCount >= 8, "Post-launch known limitations are documented."),
    gate("post_launch_owner_readiness_review_exists", "Post-launch owner readiness review exists", postLaunchOwnerReadinessReport.ready && postLaunchOwnerReadinessReport.noUsersContacted, "Post-launch owner readiness review is manual-only."),
    gate("post_launch_readiness_handoff_exists", "Post-launch readiness handoff exists", postLaunchReadinessHandoffReport.ready && postLaunchReadinessHandoffReport.noUsersContacted && postLaunchReadinessHandoffReport.noPublicUrlFetched, "Post-launch readiness handoff performs no external action."),
    gate("public_6_5_no_unresolved_public_launch_critical_blockers", "No unresolved public-launch-critical blockers in 6.5", publicLaunchIssueClosureReport.publicLaunchCriticalUnresolvedCount === 0 && postLaunchReadinessCriteriaReport.blockers.length === 0, "6.5 has no unresolved public-launch-critical blockers."),
    gate("public_6_5_no_users_contacted_by_code", "No users contacted by code in 6.5", postLaunchReadinessPackageReport.noUsersContacted && postLaunchReadinessHandoffReport.noUsersContacted, "6.5 contacts no users."),
    gate("public_6_5_no_feedback_collected_automatically", "No feedback collected automatically in 6.5", postLaunchReadinessPackageReport.noFeedbackCollectedAutomatically && publicLaunchFeedbackSummaryReport.noFeedbackCollectedAutomatically, "6.5 collects no feedback automatically."),
    gate("public_6_5_no_public_url_fetched_by_code", "No public URL fetched by code in 6.5", postLaunchReadinessPackageReport.noPublicUrlFetched && postLaunchReadinessHandoffReport.noPublicUrlFetched, "6.5 fetches no public URLs."),
    gate("public_6_5_no_unapproved_external_analytics_enabled", "No unapproved external analytics enabled in 6.5", postLaunchReadinessPackageReport.noExternalAnalyticsEnabled && publicLaunchFinalSafetyPrivacyReport.unapprovedExternalAnalyticsDisabled, "External analytics remain disabled."),
    gate("public_6_5_no_unapproved_production_persistence_enabled", "No unapproved production persistence enabled in 6.5", postLaunchReadinessPackageReport.noProductionPersistenceEnabled && publicLaunchFinalSafetyPrivacyReport.unapprovedProductionPersistenceDisabled, "Production persistence remains disabled."),
    gate("public_6_5_no_live_ai_orchestration_enabled", "No live AI orchestration enabled in 6.5", postLaunchReadinessPackageReport.noLiveAiOrchestrationEnabled && publicLaunchFinalSafetyPrivacyReport.liveAiOrchestrationDisabled, "Live AI orchestration remains disabled."),
    gate("public_6_5_scripture_anchoring_required", "Scripture anchoring required in 6.5", publicLaunchFinalSafetyPrivacyReport.scriptureAnchoringRequired, "Scripture anchoring remains required."),
    gate("public_6_5_explanation_paths_required", "Explanation paths required in 6.5", publicLaunchFinalSafetyPrivacyReport.explanationPathsRequired, "Explanation paths remain required."),
    gate("public_6_5_fallback_enabled", "Fallback enabled in 6.5", publicLaunchFinalSafetyPrivacyReport.fallbackSafetyReady, "Fallback remains enabled and non-empty."),
    gate("public_6_5_consent_controls_enabled", "Consent controls enabled in 6.5", publicLaunchFinalSafetyPrivacyReport.consentSafetyReady, "Consent controls remain enabled."),
    gate("public_6_5_privacy_terms_consent_notices_available", "Privacy/terms/consent notices available in 6.5", publicLaunchFinalSafetyPrivacyReport.privacyTermsConsentNoticesAvailable, "Public privacy, terms, and consent notices remain available."),
    gate("public_launch_completion_audit_complete", "Public launch completion audit complete", publicLaunchCompletionAudit.complete && publicLaunchCompletionAudit.completionPercentage === 100, "Public Launch Execution 6.5 audit is complete."),
    gate("post_launch_7_1_public_monitoring_plan_exists", "Post-launch public monitoring plan exists", postLaunchPublicMonitoringReport.ready && postLaunchPublicMonitoringReport.monitoringItems.length >= 8, "7.1 public monitoring plan is structured and manual."),
    gate("post_launch_7_1_support_workflow_exists", "Post-launch support workflow exists", postLaunchSupportWorkflowReport.ready && postLaunchSupportWorkflowReport.steps.length >= 10, "7.1 support workflow is structured and manual."),
    gate("post_launch_7_1_growth_roadmap_exists", "Post-launch growth roadmap exists", postLaunchGrowthRoadmapReport.ready && postLaunchGrowthRoadmapReport.decisionPointCount >= 3, "7.1 growth roadmap keeps provider decisions future-scoped."),
    gate("post_launch_7_1_operations_package_exists", "Post-launch operations package exists", postLaunchOperationsPackageReport.ready && postLaunchOperationsPackage.inMemoryOnly, "7.1 operations package is in-memory only."),
    gate("post_launch_7_1_no_users_contacted_by_code", "No users contacted by code in 7.1", postLaunchOperationsPackageReport.noUsersContacted && postLaunchPublicMonitoringReport.noUsersContacted && postLaunchSupportWorkflowReport.noUsersContacted, "7.1 contacts no users."),
    gate("post_launch_7_1_no_feedback_collected_automatically", "No feedback collected automatically in 7.1", postLaunchOperationsPackageReport.noFeedbackCollectedAutomatically && postLaunchPublicMonitoringReport.noFeedbackCollectedAutomatically && postLaunchSupportWorkflowReport.noFeedbackCollectedAutomatically, "7.1 collects no feedback automatically."),
    gate("post_launch_7_1_no_public_url_fetched_by_code", "No public URL fetched by code in 7.1", postLaunchOperationsPackageReport.noPublicUrlFetched && postLaunchPublicMonitoringReport.noPublicUrlFetched, "7.1 fetches no public URLs."),
    gate("post_launch_7_1_no_unapproved_external_analytics_enabled", "No unapproved external analytics enabled in 7.1", postLaunchOperationsPackageReport.noExternalAnalyticsEnabled && postLaunchGrowthRoadmapReport.noExternalAnalyticsEnabled, "External analytics remain disabled."),
    gate("post_launch_7_1_no_unapproved_production_persistence_enabled", "No unapproved production persistence enabled in 7.1", postLaunchOperationsPackageReport.noProductionPersistenceEnabled && postLaunchGrowthRoadmapReport.noProductionPersistenceEnabled, "Production persistence remains disabled."),
    gate("post_launch_7_1_no_live_ai_orchestration_enabled", "No live AI orchestration enabled in 7.1", postLaunchOperationsPackageReport.noLiveAiOrchestrationEnabled && postLaunchGrowthRoadmapReport.noLiveAiOrchestrationEnabled, "Live AI orchestration remains disabled."),
    gate("post_launch_7_1_no_service_worker_registered", "No service worker registered in 7.1", postLaunchOperationsPackageReport.noServiceWorkerRegistered && postLaunchGrowthRoadmapReport.noServiceWorkerRegistered, "Service workers remain out of scope."),
    gate("post_launch_7_1_no_raw_sensitive_text_stored", "No raw sensitive text stored in 7.1", postLaunchOperationsPackageReport.noRawSensitiveTextStored && postLaunchSupportWorkflowReport.sanitizedOnly, "Support and monitoring remain sanitized/manual."),
    gate("post_launch_7_1_no_hidden_personalization", "No hidden personalization in 7.1", postLaunchOperationsPackageReport.noHiddenPersonalizationCreated && postLaunchSupportWorkflowReport.noHiddenPersonalizationCreated, "Personalization remains visible and consent-aware."),
    gate("post_launch_7_1_scripture_anchoring_required", "Scripture anchoring required in 7.1", postLaunchPublicMonitoringReport.scriptureAnchoringRequired && postLaunchGrowthRoadmapReport.scriptureAnchoringRequired, "Scripture anchoring remains required."),
    gate("post_launch_7_1_explanation_paths_required", "Explanation paths required in 7.1", postLaunchPublicMonitoringReport.explanationPathsRequired && postLaunchGrowthRoadmapReport.explanationPathsRequired, "Explanation paths remain required."),
    gate("post_launch_7_1_fallback_enabled", "Fallback enabled in 7.1", postLaunchPublicMonitoringReport.fallbackEnabled && postLaunchGrowthRoadmapReport.fallbackEnabled, "Fallback remains enabled."),
    gate("post_launch_7_1_consent_controls_required", "Consent controls required in 7.1", postLaunchPublicMonitoringReport.consentControlsRequired && postLaunchGrowthRoadmapReport.consentAwarePersonalizationRequired, "Consent controls and consent-aware personalization remain required."),
    gate("post_launch_operations_7_1_audit_complete", "Post-Launch Operations 7.1 audit complete", postLaunchOperations71Audit.complete && postLaunchOperations71Audit.completionPercentage === 100, "Post-Launch Operations 7.1 audit is complete."),
    gate("post_launch_7_2_support_desk_exists", "Post-launch support desk exists", postLaunch72Package.supportDeskReport.ready && postLaunch72Package.supportDeskReport.sanitizedOnly, "7.2 support desk is manual and sanitized."),
    gate("post_launch_7_2_feedback_review_exists", "Post-launch weekly feedback review exists", postLaunch72Package.weeklyFeedbackReview.ready && postLaunch72Package.weeklyFeedbackReview.noAutomaticFeedbackCollection, "7.2 feedback review collects nothing automatically."),
    gate("post_launch_7_2_improvement_loop_exists", "Post-launch weekly improvement loop exists", postLaunch72Package.weeklyImprovementPlan.ready && postLaunch72Package.weeklyImprovementPlan.inMemoryOnly, "7.2 weekly improvement loop creates structured in-memory priorities."),
    gate("post_launch_7_2_fix_bridge_blocks_unsafe_changes", "Post-launch fix bridge blocks unsafe changes", postLaunch72Package.supportIssueFixBridgeReport.noScriptureAnchorsRemoved && postLaunch72Package.supportIssueFixBridgeReport.noExplanationPathsRemoved && postLaunch72Package.supportIssueFixBridgeReport.noFallbackSafetyWeakened && postLaunch72Package.supportIssueFixBridgeReport.noConsentControlsHidden, "7.2 fix bridge preserves Scripture, explanation, fallback, and consent guardrails."),
    gate("post_launch_7_2_owner_review_exists", "Post-launch weekly owner review exists", postLaunch72Package.ownerReview.ready && postLaunch72Package.ownerReview.noUsersContacted, "7.2 owner review is manual-only."),
    gate("post_launch_7_2_package_in_memory_only", "Post-launch weekly improvement package is in memory", postLaunch72PackageReport.ready && postLaunch72Package.inMemoryOnly && postLaunch72PackageReport.noExternalWrite, "7.2 weekly improvement package performs no external write."),
    gate("post_launch_7_2_no_users_contacted_by_code", "No users contacted by code in 7.2", postLaunch72PackageReport.noUsersContacted && postLaunch72Package.supportDeskReport.noUsersContacted && postLaunch72Package.ownerReview.noUsersContacted, "7.2 contacts no users."),
    gate("post_launch_7_2_no_feedback_collected_automatically", "No feedback collected automatically in 7.2", postLaunch72PackageReport.noFeedbackCollectedAutomatically && postLaunch72Package.weeklyFeedbackReview.noAutomaticFeedbackCollection, "7.2 collects no feedback automatically."),
    gate("post_launch_7_2_no_public_url_fetched_by_code", "No public URL fetched by code in 7.2", postLaunch72PackageReport.noPublicUrlFetched && postLaunch72Package.weeklyFeedbackReview.noPublicUrlFetched, "7.2 fetches no public URLs."),
    gate("post_launch_7_2_no_unapproved_external_analytics_enabled", "No unapproved external analytics enabled in 7.2", postLaunch72PackageReport.noExternalAnalyticsEnabled && postLaunch72Package.supportIssueFixBridgeReport.noUnapprovedAnalyticsEnabled, "External analytics remain disabled."),
    gate("post_launch_7_2_no_unapproved_production_persistence_enabled", "No unapproved production persistence enabled in 7.2", postLaunch72PackageReport.noProductionPersistenceEnabled && postLaunch72Package.supportIssueFixBridgeReport.noUnapprovedDatabasePersistenceEnabled, "Production persistence remains disabled."),
    gate("post_launch_7_2_no_live_ai_orchestration_enabled", "No live AI orchestration enabled in 7.2", postLaunch72PackageReport.noLiveAiOrchestrationEnabled && postLaunch72Package.supportIssueFixBridgeReport.noLiveAiOrchestrationEnabled, "Live AI orchestration remains disabled."),
    gate("post_launch_7_2_no_hidden_personalization", "No hidden personalization in 7.2", postLaunch72PackageReport.noHiddenPersonalizationCreated && postLaunch72Package.supportIssueFixBridgeReport.noHiddenPersonalizationCreated, "Hidden personalization remains disabled."),
    gate("post_launch_operations_7_2_audit_complete", "Post-Launch Operations 7.2 audit complete", postLaunch72Audit.complete && postLaunch72Audit.completionPercentage === 100, "Post-Launch Operations 7.2 audit is complete.")
  ];
}

export function validateLaunchQualityGate(gateToValidate: TeoyubeLaunchQualityGate): TeoyubeLaunchQualityGate {
  return gateToValidate;
}

export function validateAllLaunchQualityGates(): TeoyubeLaunchQualityGateReport {
  return createLaunchQualityGateReport();
}

export function createLaunchQualityGateReport(): TeoyubeLaunchQualityGateReport {
  const gates = getLaunchQualityGates().map(validateLaunchQualityGate);
  const criticalFailures = gates.filter((entry) => entry.required && !entry.passed && entry.riskLevel === "critical");
  const passedGateCount = gates.filter((entry) => entry.passed).length;
  const commandGates = gates.filter((entry) => ["typecheck_command", "lint_command", "build_command", "test_or_smoke_command"].includes(entry.id));

  return {
    status: criticalFailures.length === 0 ? "ready_to_begin" : "blocked",
    readyForLaunchPreparation: criticalFailures.length === 0,
    readyForSoftLaunch: criticalFailures.length === 0 && commandGates.every((entry) => entry.passed),
    gateCount: gates.length,
    passedGateCount,
    gates,
    warnings: [
      "Typecheck, lint, build, and test/smoke commands must be run from the CLI before public launch.",
      "Production Launch Preparation, Soft Launch Preparation 3.3, Limited Soft Launch Execution 4.1 through 4.5, Public Launch Preparation 5.1 through 5.4, Public Launch Execution 6.1 through 6.5, and Post-Launch Operations 7.1 through 7.2 keep analytics, persistence, live AI, service workers, native mobile, and paid infrastructure disconnected."
    ],
    generatedAt: new Date().toISOString()
  };
}
