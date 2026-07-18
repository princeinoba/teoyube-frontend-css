import { createFinalAnalyticsGoNoGoReport } from "./final-analytics-go-no-go";
import { createFinalDatabasePersistenceGoNoGoReport } from "./final-database-persistence-go-no-go";
import { createFinalLiveAiGoNoGoReport } from "./final-live-ai-go-no-go";
import { createFinalProductionServiceDecisionReport } from "./final-production-service-decision";
import { createFinalPublicLaunchPackage, createFinalPublicLaunchPackageReport } from "./final-public-launch-package";
import { createFinalPublicLaunchRiskRegister, createFinalPublicLaunchRiskRegisterReport } from "./final-public-launch-risk-register";
import { createFinalPublicOwnerGoNoGoRecord, createFinalPublicOwnerGoNoGoReport } from "./final-public-owner-go-no-go";
import { createFinalPublicPrivacyLegalReport } from "./final-public-privacy-legal-readiness";
import { createFinalPublicSafetyCertificationReport } from "./final-public-safety-certification";
import { createFinalPublicSurfaceQaCertificationReport } from "./final-public-surface-qa-certification";
import type {
  TeoyubeFinalPublicGoNoGoCheck,
  TeoyubeFinalPublicGoNoGoDecision,
  TeoyubeFinalPublicGoNoGoReport,
  TeoyubeFinalPublicLaunchBlocker,
  TeoyubeFinalPublicLaunchNextAction,
  TeoyubeFinalPublicLaunchWarning
} from "./final-public-go-no-go-contracts";
import { createPublicLaunchKnownLimitationsReport } from "./public-launch-known-limitations";

export type TeoyubeFinalPublicGoNoGoInput = {
  ownerReviewAccepted?: boolean;
  publicLaunchPerformed?: boolean;
  usersContacted?: boolean;
  feedbackCollectedAutomatically?: boolean;
  analyticsSent?: boolean;
  databaseWritten?: boolean;
  externalServicesCalled?: boolean;
};

function check(id: string, label: string, complete: boolean, details: string): TeoyubeFinalPublicGoNoGoCheck {
  return { id, label, category: "unknown", required: true, complete, status: complete ? "ready" : "blocked", launchCritical: true, details };
}

function blocker(id: string, category: TeoyubeFinalPublicLaunchBlocker["category"], reason: string): TeoyubeFinalPublicLaunchBlocker {
  return { id, label: id.replace(/_/g, " "), category, riskLevel: "critical", reason, requiredAction: "Resolve this final public go/no-go blocker before public launch execution preparation." };
}

export function createFinalPublicGoNoGoChecklist(input: TeoyubeFinalPublicGoNoGoInput = {}): TeoyubeFinalPublicGoNoGoCheck[] {
  const pkg = createFinalPublicLaunchPackageReport(createFinalPublicLaunchPackage());
  const owner = createFinalPublicOwnerGoNoGoReport(createFinalPublicOwnerGoNoGoRecord({ accepted: input.ownerReviewAccepted !== false }));
  const safety = createFinalPublicSafetyCertificationReport();
  const surfaces = createFinalPublicSurfaceQaCertificationReport();
  const privacy = createFinalPublicPrivacyLegalReport();
  const services = createFinalProductionServiceDecisionReport();
  const risk = createFinalPublicLaunchRiskRegisterReport(createFinalPublicLaunchRiskRegister());
  return [
    check("final_public_package_ready", "Final public launch package ready", pkg.ready, "Final public launch package combines all required reports."),
    check("final_public_owner_ready", "Owner go/no-go ready", owner.ready, "Owner go/no-go is structured and manual."),
    check("final_public_safety_ready", "Safety certification ready", safety.ready, "Safety certification preserves Scripture, explanations, fallback, consent, privacy, and disabled providers."),
    check("final_public_surface_qa_ready", "Surface QA certification ready", surfaces.ready, "Public surface QA covers required surfaces."),
    check("final_public_privacy_legal_ready", "Privacy/legal readiness ready", privacy.ready, "Privacy, terms, consent, sensitive warnings, and public copy readiness are confirmed."),
    check("final_public_services_ready", "Production service decisions ready", services.ready, "Production service decisions keep persistence, analytics, and live AI disabled by default."),
    check("final_public_risk_ready", "Risk register ready", risk.ready, "Risk register has no open critical public launch risks."),
    check("final_public_limitations_ready", "Known limitations ready", createPublicLaunchKnownLimitationsReport().ready, "Known limitations are available."),
    check("final_public_no_launch", "No public launch performed", !input.publicLaunchPerformed, "5.4 is decision readiness only."),
    check("final_public_no_user_contact", "No users contacted", !input.usersContacted, "5.4 does not contact users."),
    check("final_public_no_auto_feedback", "No automatic feedback collection", !input.feedbackCollectedAutomatically, "5.4 does not collect feedback automatically."),
    check("final_public_no_provider_side_effects", "No provider side effects", !input.analyticsSent && !input.databaseWritten && !input.externalServicesCalled, "5.4 sends no analytics, writes no database, and calls no external services.")
  ];
}

export function getFinalPublicGoNoGoBlockers(input: TeoyubeFinalPublicGoNoGoInput = {}): TeoyubeFinalPublicLaunchBlocker[] {
  const pkg = createFinalPublicLaunchPackageReport(createFinalPublicLaunchPackage());
  const owner = createFinalPublicOwnerGoNoGoReport(createFinalPublicOwnerGoNoGoRecord({ accepted: input.ownerReviewAccepted !== false, approvedForPublicLaunchExecutionPreparation: input.ownerReviewAccepted !== false }));
  const safety = createFinalPublicSafetyCertificationReport();
  const surfaces = createFinalPublicSurfaceQaCertificationReport();
  const privacy = createFinalPublicPrivacyLegalReport();
  const services = createFinalProductionServiceDecisionReport();
  const risk = createFinalPublicLaunchRiskRegisterReport(createFinalPublicLaunchRiskRegister());
  return [
    ...pkg.blockers,
    ...owner.blockers,
    ...safety.blockers,
    ...surfaces.blockers,
    ...privacy.blockers,
    ...services.blockers,
    ...risk.blockers,
    input.publicLaunchPerformed ? blocker("final_public_go_no_go_launch_performed", "security", "Final public go/no-go must not launch Teoyube.") : undefined,
    input.usersContacted ? blocker("final_public_go_no_go_users_contacted", "feedback", "Final public go/no-go must not contact users.") : undefined,
    input.feedbackCollectedAutomatically ? blocker("final_public_go_no_go_feedback_collected", "feedback", "Final public go/no-go must not collect feedback automatically.") : undefined,
    input.analyticsSent ? blocker("final_public_go_no_go_analytics_sent", "analytics", "Final public go/no-go must not send analytics.") : undefined,
    input.databaseWritten ? blocker("final_public_go_no_go_database_written", "database", "Final public go/no-go must not write databases.") : undefined,
    input.externalServicesCalled ? blocker("final_public_go_no_go_external_services", "security", "Final public go/no-go must not call external services.") : undefined
  ].filter(Boolean) as TeoyubeFinalPublicLaunchBlocker[];
}

export function getFinalPublicGoNoGoWarnings(input: TeoyubeFinalPublicGoNoGoInput = {}): TeoyubeFinalPublicLaunchWarning[] {
  return [
    ...createFinalPublicLaunchPackageReport(createFinalPublicLaunchPackage()).warnings,
    ...createFinalPublicOwnerGoNoGoReport(createFinalPublicOwnerGoNoGoRecord({ accepted: input.ownerReviewAccepted !== false })).warnings,
    { id: "final_public_go_no_go_decision_readiness_only", label: "Decision readiness only", category: "unknown", riskLevel: "medium", message: "5.4 prepares controlled public launch execution; it does not launch publicly.", recommendedAction: "Use Public Launch Execution 6.1 for controlled activation checklist." }
  ];
}

export function getFinalPublicGoNoGoReasons(input: TeoyubeFinalPublicGoNoGoInput = {}) {
  const blockers = getFinalPublicGoNoGoBlockers(input);
  return [
    { id: "final_public_package", label: "Final public launch package", supportsDecision: blockers.every((entry) => !entry.id.includes("package")), details: "Final package includes services, privacy/legal, QA, safety, risks, copy integration, owner review, and known limitations." },
    { id: "owner_go_no_go", label: "Owner go/no-go", supportsDecision: blockers.every((entry) => !entry.id.includes("owner")), details: "Structured owner decision is accepted by default and remains manual-only." },
    { id: "no_side_effects", label: "No launch/provider side effects", supportsDecision: blockers.every((entry) => !/launch|analytics|database|external|users|feedback/.test(entry.id)), details: "Final decision sends no analytics, writes no database, contacts no users, and performs no launch." }
  ];
}

export function evaluateFinalPublicGoNoGo(input: TeoyubeFinalPublicGoNoGoInput = {}): TeoyubeFinalPublicGoNoGoDecision {
  const blockers = getFinalPublicGoNoGoBlockers(input);
  if (blockers.some((entry) => ["privacy", "terms", "consent", "public_copy"].includes(entry.category))) return "needs_privacy_review";
  if (blockers.some((entry) => ["mobile", "accessibility"].includes(entry.category))) return "needs_qa_review";
  if (blockers.some((entry) => ["scripture_anchor", "explanation_path", "fallback", "confidence"].includes(entry.category))) return "needs_safety_review";
  if (blockers.some((entry) => ["database", "analytics", "live_ai", "security"].includes(entry.category))) return "needs_service_decision";
  if (blockers.length > 0) return "no_go_blocked";
  if (input.ownerReviewAccepted === false) return "go_after_owner_review";
  return "go_for_public_launch_execution_preparation";
}

export function getFinalPublicGoNoGoNextActions(input: TeoyubeFinalPublicGoNoGoInput = {}): TeoyubeFinalPublicLaunchNextAction[] {
  const blockers = getFinalPublicGoNoGoBlockers(input);
  if (blockers.length > 0) {
    return blockers.map((entry) => ({ id: `${entry.id}_action`, label: entry.requiredAction, requiredBeforePublicLaunchExecution: true, ownerActionRequired: true, details: entry.reason }));
  }
  return [
    {
      id: "begin_public_launch_execution_6_1",
      label: "Begin Public Launch Execution 6.1 - Controlled Public Launch Activation Checklist",
      requiredBeforePublicLaunchExecution: false,
      ownerActionRequired: true,
      details: "Use the controlled public launch activation checklist; do not launch from this 5.4 module."
    }
  ];
}

export function createFinalPublicGoNoGoReport(input: TeoyubeFinalPublicGoNoGoInput = {}): TeoyubeFinalPublicGoNoGoReport & { reasons: ReturnType<typeof getFinalPublicGoNoGoReasons> } {
  const blockers = getFinalPublicGoNoGoBlockers(input);
  const warnings = getFinalPublicGoNoGoWarnings(input);
  const decision = evaluateFinalPublicGoNoGo(input);
  return {
    valid: blockers.length === 0,
    ready: decision === "go_for_public_launch_execution_preparation",
    status: blockers.length > 0 ? "blocked" : warnings.length > 0 ? "ready_with_warnings" : "ready",
    decision,
    checklist: createFinalPublicGoNoGoChecklist(input),
    reasons: getFinalPublicGoNoGoReasons(input),
    blockers,
    warnings,
    nextActions: getFinalPublicGoNoGoNextActions(input),
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
