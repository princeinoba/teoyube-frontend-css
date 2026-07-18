import type { TeoyubePhase5RemainingRisk } from "./phase-5-completion-contracts";

export type TeoyubePhase5RemainingRiskRegister = {
  id: string;
  risks: TeoyubePhase5RemainingRisk[];
  inMemoryOnly: true;
  noExternalWrite: true;
  generatedAt: string;
};

export type TeoyubePhase5RemainingRiskRegisterReport = {
  valid: boolean;
  register: TeoyubePhase5RemainingRiskRegister;
  summary: ReturnType<typeof summarizePhase5RemainingRisks>;
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

export function createPhase5RemainingRiskRegister(risks: TeoyubePhase5RemainingRisk[] = []): TeoyubePhase5RemainingRiskRegister {
  const defaultRisks: TeoyubePhase5RemainingRisk[] = [
    { id: "phase_6_owner_approval_required", area: "owner_approval", severity: "high", status: "accepted", message: "Future controlled beta execution planning still requires explicit owner approval.", mitigation: "Carry owner approval into Phase 6.1 entry criteria." },
    { id: "manual_feedback_sensitivity", area: "privacy_security", severity: "high", status: "accepted", message: "Manual feedback could contain sensitive personal or spiritual information.", mitigation: "Use redaction, minimization, and no automatic storage boundaries." },
    { id: "future_service_gate_pressure", area: "service_gate", severity: "high", status: "accepted", message: "Future database, analytics, monitoring, auth, CMS, or live AI requests could weaken Phase 5 locks.", mitigation: "Require service gate review before any service connection." },
    { id: "mobile_accessibility_manual_review", area: "accessibility", severity: "medium", status: "accepted", message: "Manual device and assistive-technology review remains necessary before real participant use.", mitigation: "Carry mobile/accessibility hardening into Phase 6." }
  ];
  return {
    id: "phase_5_remaining_risk_register",
    risks: risks.length ? risks : defaultRisks,
    inMemoryOnly: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}

export function addPhase5RemainingRisk(register: TeoyubePhase5RemainingRiskRegister, risk: TeoyubePhase5RemainingRisk): TeoyubePhase5RemainingRiskRegister {
  return { ...register, risks: [...register.risks, risk], generatedAt: new Date().toISOString() };
}

export function resolvePhase5RemainingRisk(register: TeoyubePhase5RemainingRiskRegister, riskId: string, resolution: string): TeoyubePhase5RemainingRiskRegister {
  return {
    ...register,
    risks: register.risks.map((risk) => risk.id === riskId ? { ...risk, status: "resolved", resolution } : risk),
    generatedAt: new Date().toISOString()
  };
}

export function summarizePhase5RemainingRisks(register: TeoyubePhase5RemainingRiskRegister) {
  return {
    total: register.risks.length,
    open: register.risks.filter((risk) => risk.status === "open").length,
    accepted: register.risks.filter((risk) => risk.status === "accepted").length,
    resolved: register.risks.filter((risk) => risk.status === "resolved").length,
    critical: getCriticalPhase5RemainingRisks(register).length
  };
}

export function getCriticalPhase5RemainingRisks(register: TeoyubePhase5RemainingRiskRegister): TeoyubePhase5RemainingRisk[] {
  return register.risks.filter((risk) => risk.severity === "critical" && risk.status === "open");
}

export function getPhase5RemainingRisksByArea(register: TeoyubePhase5RemainingRiskRegister, area: TeoyubePhase5RemainingRisk["area"]): TeoyubePhase5RemainingRisk[] {
  return register.risks.filter((risk) => risk.area === area);
}

export function createPhase5RemainingRiskRegisterReport(register: TeoyubePhase5RemainingRiskRegister = createPhase5RemainingRiskRegister()): TeoyubePhase5RemainingRiskRegisterReport {
  const critical = getCriticalPhase5RemainingRisks(register);
  return {
    valid: critical.length === 0,
    register,
    summary: summarizePhase5RemainingRisks(register),
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
