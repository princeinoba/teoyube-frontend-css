import type { TeoyubePhase6RemainingRisk } from "./phase-6-completion-contracts";

export type TeoyubePhase6RemainingRiskRegister = {
  id: string;
  risks: TeoyubePhase6RemainingRisk[];
  inMemoryOnly: true;
  noExternalWrite: true;
  generatedAt: string;
};

export type TeoyubePhase6RemainingRiskRegisterReport = {
  valid: boolean;
  register: TeoyubePhase6RemainingRiskRegister;
  summary: ReturnType<typeof summarizePhase6RemainingRisks>;
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

export function createPhase6RemainingRiskRegister(risks: TeoyubePhase6RemainingRisk[] = []): TeoyubePhase6RemainingRiskRegister {
  const defaultRisks: TeoyubePhase6RemainingRisk[] = [
    { id: "phase_7_owner_approval_required", area: "manual_execution", severity: "high", status: "accepted", message: "Future controlled beta operations still require explicit owner approval before real participant use.", mitigation: "Carry owner review and manual go/no-go into Phase 7.1 entry criteria." },
    { id: "manual_feedback_sensitivity", area: "feedback_boundaries", severity: "high", status: "accepted", message: "Manual feedback may contain sensitive personal or spiritual information.", mitigation: "Use redaction, minimization, consent reminders, and no automatic storage." },
    { id: "service_gate_pressure", area: "service_disabled_state", severity: "high", status: "accepted", message: "Future database, analytics, monitoring, auth, CMS, accounts, or live AI requests could weaken Phase 6 locks.", mitigation: "Require service gate review before any service connection." },
    { id: "mobile_accessibility_manual_review", area: "accessibility", severity: "medium", status: "accepted", message: "Manual device and assistive-technology review remains necessary before real participant operations.", mitigation: "Carry mobile/accessibility hardening into Phase 7." },
    { id: "manual_operations_load", area: "operations_readiness", severity: "medium", status: "accepted", message: "Manual operations may require more owner time than expected.", mitigation: "Use Phase 7 support workflow, daily review, known limitations, pause criteria, and clear owner cadence." }
  ];
  return {
    id: "phase_6_remaining_risk_register",
    risks: risks.length ? risks : defaultRisks,
    inMemoryOnly: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}

export function addPhase6RemainingRisk(register: TeoyubePhase6RemainingRiskRegister, risk: TeoyubePhase6RemainingRisk): TeoyubePhase6RemainingRiskRegister {
  return { ...register, risks: [...register.risks, risk], generatedAt: new Date().toISOString() };
}

export function resolvePhase6RemainingRisk(register: TeoyubePhase6RemainingRiskRegister, riskId: string, resolution: string): TeoyubePhase6RemainingRiskRegister {
  return {
    ...register,
    risks: register.risks.map((risk) => risk.id === riskId ? { ...risk, status: "resolved", resolution } : risk),
    generatedAt: new Date().toISOString()
  };
}

export function summarizePhase6RemainingRisks(register: TeoyubePhase6RemainingRiskRegister) {
  return {
    total: register.risks.length,
    open: register.risks.filter((risk) => risk.status === "open").length,
    accepted: register.risks.filter((risk) => risk.status === "accepted").length,
    resolved: register.risks.filter((risk) => risk.status === "resolved").length,
    critical: getCriticalPhase6RemainingRisks(register).length
  };
}

export function getCriticalPhase6RemainingRisks(register: TeoyubePhase6RemainingRiskRegister): TeoyubePhase6RemainingRisk[] {
  return register.risks.filter((risk) => risk.severity === "critical" && risk.status === "open");
}

export function getPhase6RemainingRisksByArea(register: TeoyubePhase6RemainingRiskRegister, area: TeoyubePhase6RemainingRisk["area"]): TeoyubePhase6RemainingRisk[] {
  return register.risks.filter((risk) => risk.area === area);
}

export function createPhase6RemainingRiskRegisterReport(register: TeoyubePhase6RemainingRiskRegister = createPhase6RemainingRiskRegister()): TeoyubePhase6RemainingRiskRegisterReport {
  const critical = getCriticalPhase6RemainingRisks(register);
  return {
    valid: critical.length === 0,
    register,
    summary: summarizePhase6RemainingRisks(register),
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
