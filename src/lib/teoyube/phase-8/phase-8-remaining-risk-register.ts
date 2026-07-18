import type { TeoyubePhase8RemainingRisk, TeoyubePhase8RemainingRiskArea } from "./phase-8-completion-contracts";

export type TeoyubePhase8RemainingRiskRegister = {
  id: string;
  risks: TeoyubePhase8RemainingRisk[];
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubePhase8RemainingRiskRegisterReport = {
  valid: boolean;
  register: TeoyubePhase8RemainingRiskRegister;
  openRisks: TeoyubePhase8RemainingRisk[];
  criticalRisks: TeoyubePhase8RemainingRisk[];
  warnings: string[];
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function risk(area: TeoyubePhase8RemainingRiskArea, severity: TeoyubePhase8RemainingRisk["severity"], message: string, mitigation: string): TeoyubePhase8RemainingRisk {
  return {
    id: `phase_8_${area}_risk`,
    area,
    severity,
    status: "open",
    message,
    mitigation
  };
}

export function createPhase8RemainingRiskRegister(risks: TeoyubePhase8RemainingRisk[] = [
  risk("privacy_security", "high", "Public release preparation can expose consent, sensitive-data, or privacy notice gaps.", "Keep final privacy/security lock active and require owner/privacy/security review before release decisions."),
  risk("service_decision", "high", "Future service eligibility can be mistaken for activation approval.", "Keep final service decision lock disabled or future-review-only until explicit approval exists."),
  risk("manual_support_feedback", "medium", "Manual support and feedback workflows can become overloaded in public release preparation.", "Use Phase 9 to confirm staffing, triage, escalation, and sensitive-data handling."),
  risk("scripture_anchor", "medium", "Scripture anchors, explanation traces, fallback, or confidence labels can regress during final polish.", "Run Phase 9 QA against Scripture, explanation, fallback, and confidence surfaces.")
]): TeoyubePhase8RemainingRiskRegister {
  return {
    id: "phase_8_remaining_risk_register",
    risks,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}

export function addPhase8RemainingRisk(register: TeoyubePhase8RemainingRiskRegister, riskItem: TeoyubePhase8RemainingRisk): TeoyubePhase8RemainingRiskRegister {
  return { ...register, risks: [...register.risks, riskItem], generatedAt: new Date().toISOString() };
}

export function resolvePhase8RemainingRisk(register: TeoyubePhase8RemainingRiskRegister, riskId: string, resolution: string): TeoyubePhase8RemainingRiskRegister {
  return {
    ...register,
    risks: register.risks.map((entry) => entry.id === riskId ? { ...entry, status: "resolved", resolution } : entry),
    generatedAt: new Date().toISOString()
  };
}

export function summarizePhase8RemainingRisks(register: TeoyubePhase8RemainingRiskRegister): { open: number; accepted: number; resolved: number; total: number } {
  return {
    open: register.risks.filter((entry) => entry.status === "open").length,
    accepted: register.risks.filter((entry) => entry.status === "accepted").length,
    resolved: register.risks.filter((entry) => entry.status === "resolved").length,
    total: register.risks.length
  };
}

export function getCriticalPhase8RemainingRisks(register: TeoyubePhase8RemainingRiskRegister): TeoyubePhase8RemainingRisk[] {
  return register.risks.filter((entry) => entry.severity === "critical");
}

export function getPhase8RemainingRisksByArea(register: TeoyubePhase8RemainingRiskRegister, area: TeoyubePhase8RemainingRiskArea): TeoyubePhase8RemainingRisk[] {
  return register.risks.filter((entry) => entry.area === area);
}

export function createPhase8RemainingRiskRegisterReport(register: TeoyubePhase8RemainingRiskRegister): TeoyubePhase8RemainingRiskRegisterReport {
  return {
    valid: register.inMemoryOnly && register.noExternalServicesRequired,
    register,
    openRisks: register.risks.filter((entry) => entry.status === "open"),
    criticalRisks: getCriticalPhase8RemainingRisks(register),
    warnings: ["Phase 8 remaining risk register is in-memory/manual only and does not persist, analyze, or transmit risk data externally."],
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
