import type { TeoyubePhase7RemainingRisk } from "./phase-7-completion-contracts";

export type TeoyubePhase7RemainingRiskRegister = {
  id: string;
  risks: TeoyubePhase7RemainingRisk[];
  inMemoryOnly: true;
  noExternalWrite: true;
  generatedAt: string;
};

export type TeoyubePhase7RemainingRiskRegisterReport = {
  valid: boolean;
  register: TeoyubePhase7RemainingRiskRegister;
  summary: ReturnType<typeof summarizePhase7RemainingRisks>;
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

export function createPhase7RemainingRiskRegister(risks: TeoyubePhase7RemainingRisk[] = []): TeoyubePhase7RemainingRiskRegister {
  const defaultRisks: TeoyubePhase7RemainingRisk[] = [
    { id: "phase_8_owner_approval_required", area: "manual_operations", severity: "high", status: "accepted", message: "Phase 8 planning still requires explicit owner approval before public release or service connection decisions.", mitigation: "Carry owner review and manual go/no-go into Phase 8.1 entry criteria." },
    { id: "manual_feedback_sensitivity", area: "manual_feedback_review", severity: "high", status: "accepted", message: "Manual feedback and support notes may contain sensitive personal or spiritual information.", mitigation: "Continue redaction, minimization, consent reminders, and no automatic storage." },
    { id: "service_gate_pressure", area: "service_disabled_state", severity: "high", status: "accepted", message: "Future database, analytics, monitoring, auth, CMS, account, notification, or live AI requests could weaken Phase 7 locks.", mitigation: "Require service gate reassessment before any service connection." },
    { id: "product_stabilization_follow_up", area: "product_stabilization", severity: "medium", status: "accepted", message: "Product hardening items may need additional manual prioritization before public release planning.", mitigation: "Use Phase 8 product hardening and controlled service reassessment gates." },
    { id: "mobile_accessibility_manual_review", area: "accessibility", severity: "medium", status: "accepted", message: "Manual device and assistive-technology review remains necessary before broader release decisions.", mitigation: "Carry mobile/accessibility hardening into Phase 8." }
  ];
  return {
    id: "phase_7_remaining_risk_register",
    risks: risks.length ? risks : defaultRisks,
    inMemoryOnly: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}

export function addPhase7RemainingRisk(register: TeoyubePhase7RemainingRiskRegister, risk: TeoyubePhase7RemainingRisk): TeoyubePhase7RemainingRiskRegister {
  return { ...register, risks: [...register.risks, risk], generatedAt: new Date().toISOString() };
}

export function resolvePhase7RemainingRisk(register: TeoyubePhase7RemainingRiskRegister, riskId: string, resolution: string): TeoyubePhase7RemainingRiskRegister {
  return {
    ...register,
    risks: register.risks.map((risk) => risk.id === riskId ? { ...risk, status: "resolved", resolution } : risk),
    generatedAt: new Date().toISOString()
  };
}

export function summarizePhase7RemainingRisks(register: TeoyubePhase7RemainingRiskRegister) {
  return {
    total: register.risks.length,
    open: register.risks.filter((risk) => risk.status === "open").length,
    accepted: register.risks.filter((risk) => risk.status === "accepted").length,
    resolved: register.risks.filter((risk) => risk.status === "resolved").length,
    critical: getCriticalPhase7RemainingRisks(register).length
  };
}

export function getCriticalPhase7RemainingRisks(register: TeoyubePhase7RemainingRiskRegister): TeoyubePhase7RemainingRisk[] {
  return register.risks.filter((risk) => risk.severity === "critical" && risk.status === "open");
}

export function getPhase7RemainingRisksByArea(register: TeoyubePhase7RemainingRiskRegister, area: TeoyubePhase7RemainingRisk["area"]): TeoyubePhase7RemainingRisk[] {
  return register.risks.filter((risk) => risk.area === area);
}

export function createPhase7RemainingRiskRegisterReport(register: TeoyubePhase7RemainingRiskRegister = createPhase7RemainingRiskRegister()): TeoyubePhase7RemainingRiskRegisterReport {
  const critical = getCriticalPhase7RemainingRisks(register);
  return {
    valid: critical.length === 0,
    register,
    summary: summarizePhase7RemainingRisks(register),
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
