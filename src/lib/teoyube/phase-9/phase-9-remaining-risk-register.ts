export type TeoyubePhase9RemainingRiskArea =
  | "public_release_preparation"
  | "public_copy"
  | "privacy_consent"
  | "sensitive_data"
  | "known_limitations"
  | "support_readiness"
  | "feedback_readiness"
  | "issue_triage"
  | "manual_monitoring"
  | "go_no_go"
  | "owner_approval"
  | "operational_handoff"
  | "service_disabled_state"
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "reviewed_content_gate"
  | "mobile"
  | "accessibility"
  | "future_persistence"
  | "future_analytics"
  | "future_monitoring"
  | "future_live_ai"
  | "unknown";

export type TeoyubePhase9RemainingRisk = {
  id: string;
  area: TeoyubePhase9RemainingRiskArea;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "accepted" | "resolved";
  message: string;
  mitigation: string;
  resolution?: string;
};

export type TeoyubePhase9RemainingRiskRegister = {
  id: string;
  risks: TeoyubePhase9RemainingRisk[];
  inMemoryOnly: true;
  updatedAt: string;
};

export function createPhase9RemainingRiskRegister(): TeoyubePhase9RemainingRiskRegister {
  return {
    id: "phase_9_remaining_risk_register",
    risks: [
      { id: "manual_monitoring_capacity", area: "manual_monitoring", severity: "medium", status: "accepted", message: "Future public execution planning depends on manual monitoring capacity.", mitigation: "Carry manual monitoring into Phase 10.1 checklist." },
      { id: "manual_support_capacity", area: "support_readiness", severity: "medium", status: "accepted", message: "Support and feedback remain manual.", mitigation: "Keep any future public cohort bounded and owner-reviewed." },
      { id: "future_service_activation", area: "service_disabled_state", severity: "high", status: "accepted", message: "Future service activation could weaken the service-disabled boundary.", mitigation: "Require explicit service gate follow-up before persistence, analytics, monitoring, or live AI." },
      { id: "privacy_follow_up", area: "privacy_consent", severity: "high", status: "accepted", message: "Future release execution requires privacy/security recheck.", mitigation: "Run Phase 10 privacy/security follow-up before any public execution." }
    ],
    inMemoryOnly: true,
    updatedAt: new Date().toISOString()
  };
}

export function addPhase9RemainingRisk(register: TeoyubePhase9RemainingRiskRegister, risk: TeoyubePhase9RemainingRisk): TeoyubePhase9RemainingRiskRegister {
  return { ...register, risks: [...register.risks, risk], updatedAt: new Date().toISOString() };
}

export function resolvePhase9RemainingRisk(register: TeoyubePhase9RemainingRiskRegister, riskId: string, resolution: string): TeoyubePhase9RemainingRiskRegister {
  return {
    ...register,
    risks: register.risks.map((risk) => risk.id === riskId ? { ...risk, status: "resolved", resolution } : risk),
    updatedAt: new Date().toISOString()
  };
}

export function summarizePhase9RemainingRisks(register: TeoyubePhase9RemainingRiskRegister): string[] {
  return register.risks.map((risk) => `${risk.severity}: ${risk.area} - ${risk.message}`);
}

export function getCriticalPhase9RemainingRisks(register: TeoyubePhase9RemainingRiskRegister): TeoyubePhase9RemainingRisk[] {
  return register.risks.filter((risk) => risk.severity === "critical" && risk.status !== "resolved");
}

export function getPhase9RemainingRisksByArea(register: TeoyubePhase9RemainingRiskRegister, area: TeoyubePhase9RemainingRiskArea): TeoyubePhase9RemainingRisk[] {
  return register.risks.filter((risk) => risk.area === area);
}

export function createPhase9RemainingRiskRegisterReport(register: TeoyubePhase9RemainingRiskRegister) {
  const critical = getCriticalPhase9RemainingRisks(register);
  return {
    valid: critical.length === 0,
    register,
    risks: register.risks,
    criticalRisks: critical,
    summary: summarizePhase9RemainingRisks(register),
    blockers: critical.map((risk) => risk.message),
    warnings: ["Phase 9 remaining risk register is in-memory/manual only."],
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
