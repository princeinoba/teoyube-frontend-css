import type { TeoyubePhase4Area, TeoyubePhase4Risk } from "./phase-4-contracts";

export type TeoyubePhase4RiskRegister = {
  id: string;
  risks: TeoyubePhase4Risk[];
  inMemoryOnly: true;
  noExternalWrite: true;
  generatedAt: string;
};

export function createPhase4RiskRegister(risks: TeoyubePhase4Risk[] = []): TeoyubePhase4RiskRegister {
  const defaultRisks: TeoyubePhase4Risk[] = [
    { id: "content_depth_review", area: "content_depth", severity: "medium", status: "open", message: "Some content areas need owner review before expansion.", mitigation: "Use Phase 4.2 backlog to prioritize content depth work." },
    { id: "manual_accessibility_review", area: "accessibility", severity: "medium", status: "open", message: "Manual accessibility review remains required.", mitigation: "Run keyboard, focus, screen-reader, labels, contrast, and text wrapping review." },
    { id: "manual_mobile_review", area: "mobile", severity: "medium", status: "open", message: "Real-device mobile review remains required.", mitigation: "Run device checks for cards, tables, graph/list fallback, trace, anchors, and fallback states." },
    { id: "future_persistence_control", area: "future_persistence", severity: "high", status: "open", message: "Persistence must not be connected without owner, privacy, security, and cost review.", mitigation: "Keep Phase 4.1 decision-plan only." },
    { id: "future_analytics_control", area: "future_analytics", severity: "medium", status: "open", message: "Analytics must not be connected without consent and payload review.", mitigation: "Keep analytics disabled and plan-only." },
    { id: "future_live_ai_control", area: "future_live_ai", severity: "high", status: "open", message: "Live AI must not be connected until grounding, fallback, explanation, and safety remain stable.", mitigation: "Keep live AI disabled and plan-only." },
    { id: "admin_workflow_control", area: "admin_content_workflow", severity: "medium", status: "open", message: "Admin/content workflows need design before auth or CMS implementation.", mitigation: "Plan workflows in Phase 4.2 without implementing admin tooling yet." }
  ];

  return {
    id: "phase_4_risk_register",
    risks: risks.length ? risks : defaultRisks,
    inMemoryOnly: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}

export function addPhase4Risk(register: TeoyubePhase4RiskRegister, risk: TeoyubePhase4Risk): TeoyubePhase4RiskRegister {
  return { ...register, risks: [...register.risks, risk], generatedAt: new Date().toISOString() };
}

export function resolvePhase4Risk(register: TeoyubePhase4RiskRegister, riskId: string, resolution: string): TeoyubePhase4RiskRegister {
  return {
    ...register,
    risks: register.risks.map((risk) => risk.id === riskId ? { ...risk, status: "resolved", resolution } : risk),
    generatedAt: new Date().toISOString()
  };
}

export function getCriticalPhase4Risks(register: TeoyubePhase4RiskRegister): TeoyubePhase4Risk[] {
  return register.risks.filter((risk) => risk.severity === "critical" && risk.status === "open");
}

export function getPhase4RisksByArea(register: TeoyubePhase4RiskRegister, area: TeoyubePhase4Area): TeoyubePhase4Risk[] {
  return register.risks.filter((risk) => risk.area === area);
}

export function summarizePhase4Risks(register: TeoyubePhase4RiskRegister) {
  return {
    total: register.risks.length,
    open: register.risks.filter((risk) => risk.status === "open").length,
    accepted: register.risks.filter((risk) => risk.status === "accepted").length,
    resolved: register.risks.filter((risk) => risk.status === "resolved").length,
    critical: getCriticalPhase4Risks(register).length
  };
}

export function createPhase4RiskRegisterReport(register: TeoyubePhase4RiskRegister = createPhase4RiskRegister()) {
  const critical = getCriticalPhase4Risks(register);
  const warnings = register.risks
    .filter((risk) => risk.status === "open" && risk.severity !== "critical")
    .map((risk) => risk.message);
  return {
    valid: critical.length === 0,
    risks: register.risks,
    summary: summarizePhase4Risks(register),
    blockers: critical.map((risk) => risk.message),
    warnings,
    inMemoryOnly: true as const,
    noExternalServicesRequired: true as const,
    noDatabasePersistenceEnabled: true as const,
    noAnalyticsEnabled: true as const,
    noMonitoringProviderConnected: true as const,
    noLiveAiOrchestrationEnabled: true as const,
    noBrowserPersistenceRequired: true as const,
    generatedAt: new Date().toISOString()
  };
}
