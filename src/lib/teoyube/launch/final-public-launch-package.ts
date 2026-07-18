import { createFinalAnalyticsGoNoGoReport } from "./final-analytics-go-no-go";
import { createFinalDatabasePersistenceGoNoGoReport } from "./final-database-persistence-go-no-go";
import { createFinalLiveAiGoNoGoReport } from "./final-live-ai-go-no-go";
import { createFinalProductionServiceDecisionReport } from "./final-production-service-decision";
import type { TeoyubeFinalPublicGoNoGoDecision, TeoyubeFinalPublicLaunchBlocker, TeoyubeFinalPublicLaunchPackage, TeoyubeFinalPublicLaunchWarning } from "./final-public-go-no-go-contracts";
import { createFinalPublicLaunchRiskRegister, createFinalPublicLaunchRiskRegisterReport } from "./final-public-launch-risk-register";
import { createFinalPublicOwnerGoNoGoRecord, createFinalPublicOwnerGoNoGoReport } from "./final-public-owner-go-no-go";
import { createFinalPublicPrivacyLegalReport } from "./final-public-privacy-legal-readiness";
import { createFinalPublicSafetyCertificationReport } from "./final-public-safety-certification";
import { createFinalPublicSurfaceQaCertificationReport } from "./final-public-surface-qa-certification";
import { createPublicCopyIntegrationPackage, createPublicCopyIntegrationPackageReport } from "./public-copy-integration-package";
import { createPublicLaunchKnownLimitationsReport } from "./public-launch-known-limitations";
import { createPublicLaunchPreparationPackage, createPublicLaunchPreparationPackageReport } from "./public-launch-preparation-package";

export type TeoyubeFinalPublicLaunchPackageInput = Partial<TeoyubeFinalPublicLaunchPackage>;

function convertBlocker(entry: { id: string; label: string; reason: string; requiredAction: string; riskLevel: "high" | "critical"; category?: string }): TeoyubeFinalPublicLaunchBlocker {
  return {
    id: entry.id,
    label: entry.label,
    category: (entry.category as TeoyubeFinalPublicLaunchBlocker["category"]) || "unknown",
    riskLevel: entry.riskLevel,
    reason: entry.reason,
    requiredAction: entry.requiredAction
  };
}

function convertWarning(entry: { id: string; label: string; message: string; recommendedAction: string; riskLevel: "low" | "medium" | "high"; category?: string }): TeoyubeFinalPublicLaunchWarning {
  return {
    id: entry.id,
    label: entry.label,
    category: (entry.category as TeoyubeFinalPublicLaunchWarning["category"]) || "unknown",
    riskLevel: entry.riskLevel,
    message: entry.message,
    recommendedAction: entry.recommendedAction
  };
}

export function createFinalPublicLaunchPackage(input: TeoyubeFinalPublicLaunchPackageInput = {}): TeoyubeFinalPublicLaunchPackage {
  const productionServiceDecisionReport = createFinalProductionServiceDecisionReport();
  const databasePersistenceReport = createFinalDatabasePersistenceGoNoGoReport();
  const analyticsReport = createFinalAnalyticsGoNoGoReport();
  const liveAiReport = createFinalLiveAiGoNoGoReport();
  const privacyLegalReport = createFinalPublicPrivacyLegalReport();
  const surfaceQaReport = createFinalPublicSurfaceQaCertificationReport();
  const safetyCertificationReport = createFinalPublicSafetyCertificationReport();
  const riskRegisterReport = createFinalPublicLaunchRiskRegisterReport(createFinalPublicLaunchRiskRegister());
  const copyIntegrationPackageReport = createPublicCopyIntegrationPackageReport(createPublicCopyIntegrationPackage());
  const publicLaunchPreparationPackageReport = createPublicLaunchPreparationPackageReport(createPublicLaunchPreparationPackage());
  const knownLimitationsReport = createPublicLaunchKnownLimitationsReport();
  const ownerDecisionReport = createFinalPublicOwnerGoNoGoReport(createFinalPublicOwnerGoNoGoRecord());
  const evidence = {
    productionServiceDecisionReport,
    databasePersistenceReport,
    analyticsReport,
    liveAiReport,
    privacyLegalReport,
    surfaceQaReport,
    safetyCertificationReport,
    riskRegisterReport,
    copyIntegrationPackageReport,
    publicLaunchPreparationPackageReport,
    knownLimitationsReport,
    ownerDecisionReport
  };
  const blockers = [
    ...productionServiceDecisionReport.blockers,
    ...databasePersistenceReport.blockers,
    ...analyticsReport.blockers,
    ...liveAiReport.blockers,
    ...privacyLegalReport.blockers,
    ...surfaceQaReport.blockers,
    ...safetyCertificationReport.blockers,
    ...riskRegisterReport.blockers.map(convertBlocker),
    ...copyIntegrationPackageReport.blockers.map(convertBlocker),
    ...publicLaunchPreparationPackageReport.blockers.map(convertBlocker),
    ...ownerDecisionReport.blockers,
    input.fileWritten ? convertBlocker({ id: "final_public_package_file_written", label: input.label || "Final public package", category: "security", riskLevel: "high", reason: "Final public launch package must not write files.", requiredAction: "Keep the package in memory." }) : undefined,
    input.publicLaunchPerformed ? convertBlocker({ id: "final_public_package_launch_performed", label: input.label || "Final public package", category: "security", riskLevel: "critical", reason: "Final public launch package must not launch Teoyube.", requiredAction: "Remove launch action." }) : undefined,
    input.usersContacted ? convertBlocker({ id: "final_public_package_users_contacted", label: input.label || "Final public package", category: "feedback", riskLevel: "critical", reason: "Final public launch package must not contact users.", requiredAction: "Keep user contact outside code." }) : undefined,
    input.feedbackCollectedAutomatically ? convertBlocker({ id: "final_public_package_feedback_collected", label: input.label || "Final public package", category: "feedback", riskLevel: "critical", reason: "Final public launch package must not collect feedback automatically.", requiredAction: "Use manual feedback only." }) : undefined,
    input.analyticsSent ? convertBlocker({ id: "final_public_package_analytics_sent", label: input.label || "Final public package", category: "analytics", riskLevel: "critical", reason: "Final public launch package must not send analytics.", requiredAction: "Keep analytics disabled." }) : undefined,
    input.databaseWritten ? convertBlocker({ id: "final_public_package_database_written", label: input.label || "Final public package", category: "database", riskLevel: "critical", reason: "Final public launch package must not write databases.", requiredAction: "Keep persistence disabled." }) : undefined,
    input.externalServicesCalled ? convertBlocker({ id: "final_public_package_external_services", label: input.label || "Final public package", category: "security", riskLevel: "critical", reason: "Final public launch package must not call external services.", requiredAction: "Keep providers disconnected." }) : undefined
  ].filter(Boolean) as TeoyubeFinalPublicLaunchBlocker[];
  const warnings = [
    ...productionServiceDecisionReport.warnings,
    ...databasePersistenceReport.warnings,
    ...analyticsReport.warnings,
    ...liveAiReport.warnings,
    ...privacyLegalReport.warnings,
    ...surfaceQaReport.warnings,
    ...safetyCertificationReport.warnings,
    ...riskRegisterReport.warnings,
    ...copyIntegrationPackageReport.warnings.map(convertWarning),
    ...publicLaunchPreparationPackageReport.warnings.map(convertWarning),
    ...ownerDecisionReport.warnings
  ];
  const decision = blockers.length > 0 ? "no_go_blocked" : ownerDecisionReport.ready ? "go_for_public_launch_execution_preparation" : "go_after_owner_review";

  return {
    id: input.id || "final_public_launch_package_5_4",
    label: input.label || "Final Public Launch Package 5.4",
    status: blockers.length > 0 ? "blocked" : warnings.length > 0 ? "ready_with_warnings" : "ready",
    decision,
    evidence,
    blockers,
    warnings,
    nextActionRecommendation: "Public Launch Execution 6.1 - Controlled Public Launch Activation Checklist",
    manualOnly: true,
    inMemoryOnly: true,
    fileWritten: false,
    publicLaunchPerformed: false,
    usersContacted: false,
    feedbackCollectedAutomatically: false,
    analyticsSent: false,
    databaseWritten: false,
    externalServicesCalled: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function getFinalPublicLaunchPackageBlockers(pkg: TeoyubeFinalPublicLaunchPackage = createFinalPublicLaunchPackage()): TeoyubeFinalPublicLaunchBlocker[] {
  return pkg.blockers;
}

export function getFinalPublicLaunchPackageWarnings(pkg: TeoyubeFinalPublicLaunchPackage = createFinalPublicLaunchPackage()): TeoyubeFinalPublicLaunchWarning[] {
  return pkg.warnings;
}

export function createFinalPublicLaunchPackageDecision(pkg: TeoyubeFinalPublicLaunchPackage = createFinalPublicLaunchPackage()): TeoyubeFinalPublicGoNoGoDecision {
  if (pkg.blockers.some((entry) => entry.category === "privacy" || entry.category === "terms" || entry.category === "consent")) return "needs_privacy_review";
  if (pkg.blockers.some((entry) => entry.category === "mobile" || entry.category === "accessibility")) return "needs_qa_review";
  if (pkg.blockers.some((entry) => ["scripture_anchor", "explanation_path", "fallback", "confidence"].includes(entry.category))) return "needs_safety_review";
  if (pkg.blockers.some((entry) => ["database", "analytics", "live_ai", "security"].includes(entry.category))) return "needs_service_decision";
  if (pkg.blockers.length > 0) return "no_go_blocked";
  return pkg.decision;
}

export function validateFinalPublicLaunchPackage(pkg: TeoyubeFinalPublicLaunchPackage = createFinalPublicLaunchPackage()) {
  const blockers = getFinalPublicLaunchPackageBlockers(pkg);
  return { valid: blockers.length === 0, ready: blockers.length === 0, blockers, warnings: getFinalPublicLaunchPackageWarnings(pkg) };
}

export function createFinalPublicLaunchPackageReport(pkg: TeoyubeFinalPublicLaunchPackage = createFinalPublicLaunchPackage()) {
  const validation = validateFinalPublicLaunchPackage(pkg);
  return {
    valid: validation.valid,
    ready: validation.ready,
    status: pkg.status,
    decision: createFinalPublicLaunchPackageDecision(pkg),
    package: pkg,
    blockerCount: validation.blockers.length,
    warningCount: validation.warnings.length,
    blockers: validation.blockers,
    warnings: validation.warnings,
    inMemoryOnly: true,
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalAnalyticsSent: true,
    noProductionPersistenceEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noExternalWrite: true,
    nextActionRecommendation: pkg.nextActionRecommendation,
    generatedAt: new Date().toISOString()
  };
}
