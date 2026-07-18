import { createFinalAnalyticsGoNoGoReport } from "./final-analytics-go-no-go";
import { createFinalDatabasePersistenceGoNoGoReport } from "./final-database-persistence-go-no-go";
import { createFinalLiveAiGoNoGoReport } from "./final-live-ai-go-no-go";
import { createFinalProductionServiceDecisionReport } from "./final-production-service-decision";
import { createFinalPublicGoNoGoReport } from "./final-public-go-no-go";
import { createFinalPublicLaunchPackage, createFinalPublicLaunchPackageReport } from "./final-public-launch-package";
import { createFinalPublicLaunchRiskRegister, createFinalPublicLaunchRiskRegisterReport } from "./final-public-launch-risk-register";
import { createFinalPublicOwnerGoNoGoRecord, createFinalPublicOwnerGoNoGoReport } from "./final-public-owner-go-no-go";
import { createFinalPublicPrivacyLegalReport } from "./final-public-privacy-legal-readiness";
import { createFinalPublicSafetyCertificationReport } from "./final-public-safety-certification";
import { createFinalPublicSurfaceQaCertificationReport } from "./final-public-surface-qa-certification";
import { createPublicLaunchExecutionHandoffReport } from "./public-launch-execution-handoff";

export type TeoyubeFinalPublicLaunchPreparationAuditItem = {
  id: string;
  label: string;
  complete: boolean;
  required: boolean;
  details: string;
};

function item(id: string, label: string, complete = true, details = "Public Launch Preparation 5.4 artifact exists."): TeoyubeFinalPublicLaunchPreparationAuditItem {
  return { id, label, complete, required: true, details };
}

export function getFinalPublicLaunchPreparationAuditChecklist(): TeoyubeFinalPublicLaunchPreparationAuditItem[] {
  const services = createFinalProductionServiceDecisionReport();
  const database = createFinalDatabasePersistenceGoNoGoReport();
  const analytics = createFinalAnalyticsGoNoGoReport();
  const liveAi = createFinalLiveAiGoNoGoReport();
  const privacy = createFinalPublicPrivacyLegalReport();
  const surfaces = createFinalPublicSurfaceQaCertificationReport();
  const safety = createFinalPublicSafetyCertificationReport();
  const risk = createFinalPublicLaunchRiskRegisterReport(createFinalPublicLaunchRiskRegister());
  const pkg = createFinalPublicLaunchPackageReport(createFinalPublicLaunchPackage());
  const owner = createFinalPublicOwnerGoNoGoReport(createFinalPublicOwnerGoNoGoRecord());
  const goNoGo = createFinalPublicGoNoGoReport();
  const handoff = createPublicLaunchExecutionHandoffReport();
  return [
    item("final_public_go_no_go_contracts_exist", "Final public go/no-go contracts exist"),
    item("final_production_service_decision_exists", "Production service final decision exists", services.ready, "Production service decision keeps providers disabled/deferred."),
    item("final_database_go_no_go_exists", "Database go/no-go exists", database.ready && database.noDatabaseConnected, "Database persistence remains disabled."),
    item("final_analytics_go_no_go_exists", "Analytics go/no-go exists", analytics.ready && analytics.noAnalyticsSent, "Analytics remain disabled and unsent."),
    item("final_live_ai_go_no_go_exists", "Live AI go/no-go exists", liveAi.ready && liveAi.noOpenAiApiCalled, "Live AI remains disabled and no OpenAI call is made."),
    item("final_privacy_legal_readiness_exists", "Privacy/legal readiness exists", privacy.ready && privacy.noLegalFinalApprovalClaimedWithoutRecord, "Privacy/legal readiness does not claim unrecorded legal approval."),
    item("final_public_surface_qa_exists", "Public surface QA certification exists", surfaces.ready && surfaces.surfaceCount >= 18, "Surface QA covers all final public surfaces."),
    item("final_public_safety_certification_exists", "Public safety certification exists", safety.ready && safety.scriptureAnchoringRequired && safety.explanationPathsRequired, "Safety certification preserves Scripture, explanations, fallback, consent, privacy, and disabled providers."),
    item("final_public_risk_register_exists", "Final public launch risk register exists", risk.ready && risk.inMemoryOnly, "Risk register is in-memory/manual-only."),
    item("final_public_launch_package_exists", "Final public launch package exists", pkg.ready && pkg.inMemoryOnly, "Final package combines service, privacy, QA, safety, risk, copy integration, owner, and limitations reports."),
    item("final_public_owner_go_no_go_exists", "Final public owner go/no-go exists", owner.ready && owner.noLegalFinalApprovalClaimedWithoutRecord, "Owner go/no-go is structured and manual-only."),
    item("final_public_go_no_go_exists", "Final public go/no-go exists", goNoGo.ready && goNoGo.decision === "go_for_public_launch_execution_preparation", "Final public go/no-go returns a structured execution-preparation decision."),
    item("public_launch_execution_handoff_exists", "Public launch execution handoff exists", handoff.ready && handoff.noPublicLaunchPerformed, "Execution handoff prepares 6.1 without launching."),
    item("public_launch_5_4_smoke_check_exists", "Public Launch Preparation 5.4 smoke check exists"),
    item("public_launch_5_4_documentation_exists", "Public Launch Preparation 5.4 documentation exists")
  ];
}

export function getFinalPublicLaunchPreparationMissingItems(): TeoyubeFinalPublicLaunchPreparationAuditItem[] {
  return getFinalPublicLaunchPreparationAuditChecklist().filter((entry) => entry.required && !entry.complete);
}

export function getFinalPublicLaunchPreparationWarnings() {
  return [
    { id: "final_public_launch_not_performed", label: "Public launch not performed", message: "5.4 completes final public go/no-go readiness but does not launch Teoyube.", recommendedAction: "Continue to Public Launch Execution 6.1.", riskLevel: "medium" as const },
    { id: "final_public_services_deferred", label: "Production services deferred", message: "Production persistence, external analytics, live AI, service workers, native mobile builds, paid infrastructure, and production monitoring remain disconnected unless explicitly reviewed later.", recommendedAction: "Keep deferred services disabled until controlled setup.", riskLevel: "medium" as const }
  ];
}

export function getFinalPublicLaunchPreparationCompletionPercentage(): number {
  const checklist = getFinalPublicLaunchPreparationAuditChecklist();
  const complete = checklist.filter((entry) => entry.complete);
  return Math.round((complete.length / Math.max(1, checklist.length)) * 100);
}

export function runFinalPublicLaunchPreparationAudit() {
  const missingItems = getFinalPublicLaunchPreparationMissingItems();
  return {
    complete: missingItems.length === 0,
    ready: missingItems.length === 0,
    completionPercentage: getFinalPublicLaunchPreparationCompletionPercentage(),
    checklist: getFinalPublicLaunchPreparationAuditChecklist(),
    missingItems,
    warnings: getFinalPublicLaunchPreparationWarnings(),
    nextStep: "Public Launch Execution 6.1 - Controlled Public Launch Activation Checklist" as const,
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
