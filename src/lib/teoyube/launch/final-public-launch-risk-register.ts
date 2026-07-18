import type { TeoyubeFinalPublicLaunchRisk, TeoyubeFinalPublicLaunchRiskCategory, TeoyubeFinalPublicLaunchWarning } from "./final-public-go-no-go-contracts";

export type TeoyubeFinalPublicLaunchRiskRegister = {
  id: string;
  label: string;
  risks: TeoyubeFinalPublicLaunchRisk[];
  manualOnly: true;
  inMemoryOnly: true;
  fileWritten: false;
  databaseWritten: false;
  analyticsSent: false;
  externalServicesCalled: false;
  publicLaunchPerformed: false;
  usersContacted: false;
  feedbackCollectedAutomatically: false;
  generatedAt: string;
};

export function createFinalPublicLaunchRiskRegister(risks: TeoyubeFinalPublicLaunchRisk[] = []): TeoyubeFinalPublicLaunchRiskRegister {
  const defaultRisks: TeoyubeFinalPublicLaunchRisk[] = [
    { id: "final_public_database_deferred", category: "database", label: "Database persistence deferred", severity: "medium", status: "accepted", details: "Production persistence remains disabled for public launch execution preparation.", mitigation: "Use later explicit persistence setup after privacy/consent review.", ownerReviewRequired: true },
    { id: "final_public_analytics_deferred", category: "analytics", label: "External analytics deferred", severity: "medium", status: "accepted", details: "External analytics remain disabled and unsent.", mitigation: "Use later explicit analytics setup after consent and payload review.", ownerReviewRequired: true },
    { id: "final_public_live_ai_deferred", category: "live_ai", label: "Live AI deferred", severity: "medium", status: "accepted", details: "Live AI orchestration remains disabled.", mitigation: "Use later explicit AI setup after safety, fallback, cost, provider, and consent review.", ownerReviewRequired: true },
    { id: "final_public_legal_review_required", category: "terms", label: "Legal review required", severity: "medium", status: "accepted", details: "Public copy is structured and reviewed but does not claim legal-final approval unless recorded.", mitigation: "Complete appropriate legal review before public launch execution.", ownerReviewRequired: true },
    { id: "final_public_scripture_safety_preserved", category: "scripture_anchor", label: "Scripture safety preserved", severity: "low", status: "mitigated", details: "Scripture anchors and explanation paths remain required.", mitigation: "Continue manual Scripture and explanation QA.", ownerReviewRequired: false }
  ];

  return {
    id: "final_public_launch_risk_register_5_4",
    label: "Final Public Launch Risk Register 5.4",
    risks: risks.length ? risks : defaultRisks,
    manualOnly: true,
    inMemoryOnly: true,
    fileWritten: false,
    databaseWritten: false,
    analyticsSent: false,
    externalServicesCalled: false,
    publicLaunchPerformed: false,
    usersContacted: false,
    feedbackCollectedAutomatically: false,
    generatedAt: new Date().toISOString()
  };
}

export function addFinalPublicLaunchRisk(
  register: TeoyubeFinalPublicLaunchRiskRegister,
  risk: TeoyubeFinalPublicLaunchRisk
): TeoyubeFinalPublicLaunchRiskRegister {
  return { ...register, risks: [...register.risks, risk] };
}

export function resolveFinalPublicLaunchRisk(
  register: TeoyubeFinalPublicLaunchRiskRegister,
  riskId: string,
  resolution: string
): TeoyubeFinalPublicLaunchRiskRegister {
  return {
    ...register,
    risks: register.risks.map((risk) =>
      risk.id === riskId
        ? { ...risk, status: "resolved", resolution, resolvedAt: new Date().toISOString() }
        : risk
    )
  };
}

export function getCriticalFinalPublicLaunchRisks(register: TeoyubeFinalPublicLaunchRiskRegister): TeoyubeFinalPublicLaunchRisk[] {
  return register.risks.filter((risk) => risk.severity === "critical" && risk.status === "open");
}

export function getFinalPublicLaunchRisksByCategory(
  register: TeoyubeFinalPublicLaunchRiskRegister,
  category: TeoyubeFinalPublicLaunchRiskCategory
): TeoyubeFinalPublicLaunchRisk[] {
  return register.risks.filter((risk) => risk.category === category);
}

export function summarizeFinalPublicLaunchRisks(register: TeoyubeFinalPublicLaunchRiskRegister) {
  const criticalOpen = getCriticalFinalPublicLaunchRisks(register);
  return {
    riskCount: register.risks.length,
    criticalOpenCount: criticalOpen.length,
    acceptedCount: register.risks.filter((risk) => risk.status === "accepted").length,
    mitigatedCount: register.risks.filter((risk) => risk.status === "mitigated").length,
    resolvedCount: register.risks.filter((risk) => risk.status === "resolved").length,
    criticalOpen
  };
}

export function createFinalPublicLaunchRiskRegisterReport(
  register: TeoyubeFinalPublicLaunchRiskRegister = createFinalPublicLaunchRiskRegister()
) {
  const summary = summarizeFinalPublicLaunchRisks(register);
  const blockers = [
    ...summary.criticalOpen.map((risk) => ({ id: risk.id, label: risk.label, category: risk.category, riskLevel: "critical" as const, reason: risk.details, requiredAction: risk.mitigation })),
    register.fileWritten ? { id: "final_public_risk_file_written", label: register.label, category: "security" as const, riskLevel: "high" as const, reason: "Risk register must not write files.", requiredAction: "Keep risk register in memory." } : undefined,
    register.databaseWritten ? { id: "final_public_risk_database_written", label: register.label, category: "database" as const, riskLevel: "critical" as const, reason: "Risk register must not write databases.", requiredAction: "Keep risk register in memory." } : undefined,
    register.analyticsSent ? { id: "final_public_risk_analytics_sent", label: register.label, category: "analytics" as const, riskLevel: "critical" as const, reason: "Risk register must not send analytics.", requiredAction: "Keep analytics disabled." } : undefined,
    register.externalServicesCalled ? { id: "final_public_risk_external_services", label: register.label, category: "security" as const, riskLevel: "critical" as const, reason: "Risk register must not call external services.", requiredAction: "Keep register local/in-memory." } : undefined,
    register.publicLaunchPerformed ? { id: "final_public_risk_launch_performed", label: register.label, category: "security" as const, riskLevel: "critical" as const, reason: "Risk register must not launch Teoyube.", requiredAction: "Remove launch action." } : undefined,
    register.usersContacted ? { id: "final_public_risk_users_contacted", label: register.label, category: "feedback" as const, riskLevel: "critical" as const, reason: "Risk register must not contact users.", requiredAction: "Keep contact outside code." } : undefined,
    register.feedbackCollectedAutomatically ? { id: "final_public_risk_feedback_collected", label: register.label, category: "feedback" as const, riskLevel: "critical" as const, reason: "Risk register must not collect feedback automatically.", requiredAction: "Use manual review only." } : undefined
  ].filter(Boolean);
  const warnings: TeoyubeFinalPublicLaunchWarning[] = [
    { id: "final_public_risk_owner_review", label: "Owner risk review required", category: "unknown", riskLevel: "medium", message: "Accepted and mitigated public-launch risks still require owner acknowledgement before execution.", recommendedAction: "Review this register during Public Launch Execution 6.1." }
  ];

  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    register,
    summary,
    blockers,
    warnings,
    manualOnly: true,
    inMemoryOnly: true,
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
