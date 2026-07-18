import type { TeoyubePhase4RemainingRisk } from "./phase-4-completion-contracts";

export type TeoyubePhase4RemainingRiskRegister = {
  id: string;
  risks: TeoyubePhase4RemainingRisk[];
  inMemoryOnly: true;
  noExternalWrite: true;
  generatedAt: string;
};

export type TeoyubePhase4RemainingRiskRegisterReport = {
  valid: boolean;
  register: TeoyubePhase4RemainingRiskRegister;
  summary: ReturnType<typeof summarizePhase4RemainingRisks>;
  blockers: string[];
  warnings: string[];
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export function createPhase4RemainingRiskRegister(risks: TeoyubePhase4RemainingRisk[] = []): TeoyubePhase4RemainingRiskRegister {
  const defaultRisks: TeoyubePhase4RemainingRisk[] = [
    { id: "manual_beta_mobile_accessibility", area: "mobile", severity: "medium", status: "accepted", message: "Manual beta mobile and accessibility QA still need execution.", mitigation: "Carry into Phase 5.1 manual QA execution plan." },
    { id: "future_service_connection_control", area: "service_decision", severity: "high", status: "accepted", message: "Future service connections require owner/privacy/security/cost review.", mitigation: "Use service decision lock before any provider work." },
    { id: "reviewed_content_release_process", area: "reviewed_content_gate", severity: "medium", status: "accepted", message: "Reviewed content release process remains manual.", mitigation: "Define release process in Phase 5 before production publishing." },
    { id: "admin_prototype_not_cms", area: "admin_prototype", severity: "medium", status: "accepted", message: "Admin prototype is not a production CMS.", mitigation: "Keep prototype route-less/in-memory until a future go/no-go decision." }
  ];

  return {
    id: "phase_4_remaining_risk_register",
    risks: risks.length ? risks : defaultRisks,
    inMemoryOnly: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}

export function addPhase4RemainingRisk(
  register: TeoyubePhase4RemainingRiskRegister,
  risk: TeoyubePhase4RemainingRisk
): TeoyubePhase4RemainingRiskRegister {
  return { ...register, risks: [...register.risks, risk], generatedAt: new Date().toISOString() };
}

export function resolvePhase4RemainingRisk(
  register: TeoyubePhase4RemainingRiskRegister,
  riskId: string,
  resolution: string
): TeoyubePhase4RemainingRiskRegister {
  return {
    ...register,
    risks: register.risks.map((risk) => risk.id === riskId ? { ...risk, status: "resolved", resolution } : risk),
    generatedAt: new Date().toISOString()
  };
}

export function summarizePhase4RemainingRisks(register: TeoyubePhase4RemainingRiskRegister) {
  return {
    total: register.risks.length,
    open: register.risks.filter((risk) => risk.status === "open").length,
    accepted: register.risks.filter((risk) => risk.status === "accepted").length,
    resolved: register.risks.filter((risk) => risk.status === "resolved").length,
    critical: getCriticalPhase4RemainingRisks(register).length
  };
}

export function getCriticalPhase4RemainingRisks(register: TeoyubePhase4RemainingRiskRegister): TeoyubePhase4RemainingRisk[] {
  return register.risks.filter((risk) => risk.severity === "critical" && risk.status === "open");
}

export function getPhase4RemainingRisksByArea(
  register: TeoyubePhase4RemainingRiskRegister,
  area: TeoyubePhase4RemainingRisk["area"]
): TeoyubePhase4RemainingRisk[] {
  return register.risks.filter((risk) => risk.area === area);
}

export function createPhase4RemainingRiskRegisterReport(
  register: TeoyubePhase4RemainingRiskRegister = createPhase4RemainingRiskRegister()
): TeoyubePhase4RemainingRiskRegisterReport {
  const critical = getCriticalPhase4RemainingRisks(register);
  return {
    valid: critical.length === 0,
    register,
    summary: summarizePhase4RemainingRisks(register),
    blockers: critical.map((risk) => risk.message),
    warnings: register.risks.filter((risk) => risk.status !== "resolved").map((risk) => risk.message),
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
