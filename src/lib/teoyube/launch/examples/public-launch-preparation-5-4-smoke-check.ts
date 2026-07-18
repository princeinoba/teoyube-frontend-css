import { createFinalAnalyticsGoNoGoReport } from "../final-analytics-go-no-go";
import { createFinalDatabasePersistenceGoNoGoReport } from "../final-database-persistence-go-no-go";
import { createFinalLiveAiGoNoGoReport } from "../final-live-ai-go-no-go";
import { createFinalProductionServiceDecisionReport } from "../final-production-service-decision";
import { createFinalPublicGoNoGoReport } from "../final-public-go-no-go";
import type { TeoyubeFinalPublicGoNoGoDecision } from "../final-public-go-no-go-contracts";
import { createFinalPublicLaunchPackage, createFinalPublicLaunchPackageReport } from "../final-public-launch-package";
import { addFinalPublicLaunchRisk, createFinalPublicLaunchRiskRegister, createFinalPublicLaunchRiskRegisterReport, resolveFinalPublicLaunchRisk } from "../final-public-launch-risk-register";
import { createFinalPublicOwnerGoNoGoChecklist, createFinalPublicOwnerGoNoGoRecord, createFinalPublicOwnerGoNoGoReport } from "../final-public-owner-go-no-go";
import { createFinalPublicPrivacyLegalReport } from "../final-public-privacy-legal-readiness";
import { createFinalPublicSafetyCertificationReport } from "../final-public-safety-certification";
import { createFinalPublicSurfaceQaCertificationReport, FINAL_PUBLIC_SURFACES } from "../final-public-surface-qa-certification";
import { runFinalPublicLaunchPreparationAudit } from "../final-public-launch-preparation-audit";
import { createPublicLaunchExecutionHandoffReport } from "../public-launch-execution-handoff";

export function runPublicLaunchPreparation54SmokeCheck() {
  const productionServices = createFinalProductionServiceDecisionReport();
  const database = createFinalDatabasePersistenceGoNoGoReport();
  const analytics = createFinalAnalyticsGoNoGoReport();
  const liveAi = createFinalLiveAiGoNoGoReport();
  const falseLegalApproval = createFinalPublicPrivacyLegalReport({ legalFinalApprovalClaimed: true, legalApprovalRecorded: false });
  const privacyLegal = createFinalPublicPrivacyLegalReport();
  const surfaceQa = createFinalPublicSurfaceQaCertificationReport();
  const safety = createFinalPublicSafetyCertificationReport();
  const riskRegister = createFinalPublicLaunchRiskRegister();
  const addedRiskRegister = addFinalPublicLaunchRisk(riskRegister, {
    id: "smoke_manual_review_risk",
    category: "unknown",
    label: "Manual review smoke risk",
    severity: "low",
    status: "open",
    details: "Smoke check risk remains in memory.",
    mitigation: "Resolve in memory.",
    ownerReviewRequired: false
  });
  const resolvedRiskRegister = resolveFinalPublicLaunchRisk(addedRiskRegister, "smoke_manual_review_risk", "Resolved by smoke check.");
  const riskReport = createFinalPublicLaunchRiskRegisterReport(resolvedRiskRegister);
  const pkg = createFinalPublicLaunchPackage();
  const pkgReport = createFinalPublicLaunchPackageReport(pkg);
  const ownerChecklist = createFinalPublicOwnerGoNoGoChecklist();
  const owner = createFinalPublicOwnerGoNoGoReport(createFinalPublicOwnerGoNoGoRecord());
  const goNoGo = createFinalPublicGoNoGoReport();
  const handoff = createPublicLaunchExecutionHandoffReport();
  const audit = runFinalPublicLaunchPreparationAudit();
  const structuredDecision: TeoyubeFinalPublicGoNoGoDecision = goNoGo.decision;

  const checks = [
    structuredDecision === "go_for_public_launch_execution_preparation",
    productionServices.ready && productionServices.noExternalAnalyticsSent && productionServices.noProductionPersistenceEnabled && productionServices.noLiveAiOrchestrationEnabled,
    database.ready && database.decision === "disabled_for_public_launch" && database.noDatabaseConnected && database.noMigrationsCreated && database.noProviderInstalled,
    analytics.ready && analytics.decision === "disabled_for_public_launch" && analytics.noAnalyticsSent && analytics.noSdkInstalled,
    liveAi.ready && liveAi.decision === "disabled_for_public_launch" && liveAi.noOpenAiApiCalled && liveAi.deterministicTigPreserved,
    !falseLegalApproval.ready && falseLegalApproval.blockers.some((entry) => entry.id === "final_privacy_legal_false_approval"),
    privacyLegal.ready && privacyLegal.noLegalFinalApprovalClaimedWithoutRecord && privacyLegal.noDivineCertaintyClaimed,
    surfaceQa.ready && surfaceQa.surfaceCount === FINAL_PUBLIC_SURFACES.length && surfaceQa.readySurfaceCount === surfaceQa.surfaceCount,
    safety.ready && safety.scriptureAnchoringRequired && safety.explanationPathsRequired && safety.fallbackSafetyReady && safety.consentSafetyReady,
    riskReport.ready && riskReport.inMemoryOnly && riskReport.noExternalWrite && riskReport.summary.criticalOpenCount === 0,
    pkgReport.ready && pkgReport.inMemoryOnly && pkgReport.noPublicLaunchPerformed,
    ownerChecklist.length >= 10 && owner.ready && owner.noLegalFinalApprovalClaimedWithoutRecord,
    goNoGo.ready && goNoGo.decision === "go_for_public_launch_execution_preparation" && goNoGo.nextActions.some((entry) => entry.id === "begin_public_launch_execution_6_1"),
    handoff.ready && handoff.noPublicLaunchPerformed && handoff.nextStep.includes("6.1"),
    audit.complete && audit.completionPercentage === 100 && audit.nextStep.includes("6.1"),
    goNoGo.noPublicLaunchPerformed && pkgReport.noPublicLaunchPerformed && handoff.noPublicLaunchPerformed,
    goNoGo.noUsersContacted && pkgReport.noUsersContacted && handoff.noUsersContacted,
    goNoGo.noFeedbackCollectedAutomatically && pkgReport.noFeedbackCollectedAutomatically && handoff.noFeedbackCollectedAutomatically,
    goNoGo.noExternalAnalyticsSent && pkgReport.noExternalAnalyticsSent,
    goNoGo.noProductionPersistenceEnabled && pkgReport.noProductionPersistenceEnabled,
    goNoGo.noLiveAiOrchestrationEnabled && pkgReport.noLiveAiOrchestrationEnabled,
    database.noExternalWrite && analytics.noExternalWrite && liveAi.noExternalWrite && riskReport.noExternalWrite && pkgReport.noExternalWrite,
    !pkg.fileWritten && !pkg.databaseWritten && !pkg.analyticsSent && !pkg.externalServicesCalled
  ];

  return {
    valid: checks.every(Boolean),
    checkCount: checks.length,
    passedCheckCount: checks.filter(Boolean).length,
    finalPublicGoNoGoDecision: goNoGo.decision,
    nextStep: audit.nextStep,
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalAnalyticsSent: true,
    noProductionPersistenceEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noDatabaseExternalApisAnalyticsProviderServiceWorkerLocalStorageCookiesIndexedDbOrFileWritesRequired: true,
    audit,
    generatedAt: new Date().toISOString()
  };
}
