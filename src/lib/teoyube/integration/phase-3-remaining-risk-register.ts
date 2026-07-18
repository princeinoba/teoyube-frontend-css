import type { TeoyubePhase3RemainingRisk } from "./phase-3-completion-contracts";

export type TeoyubePhase3RemainingRiskRegister = {
  id: string;
  risks: TeoyubePhase3RemainingRisk[];
  inMemoryOnly: true;
  noExternalWrite: true;
  generatedAt: string;
};

export type TeoyubePhase3RemainingRiskRegisterReport = {
  valid: boolean;
  riskCount: number;
  openRiskCount: number;
  criticalRiskCount: number;
  risks: TeoyubePhase3RemainingRisk[];
  blockers: string[];
  warnings: string[];
  inMemoryOnly: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  generatedAt: string;
};

export function createPhase3RemainingRiskRegister(
  risks: TeoyubePhase3RemainingRisk[] = []
): TeoyubePhase3RemainingRiskRegister {
  const defaultRisks: TeoyubePhase3RemainingRisk[] = [
    {
      id: "manual_accessibility_mobile_review",
      category: "accessibility",
      severity: "medium",
      status: "open",
      message: "Structured Phase 3 QA exists, but manual browser, keyboard, screen-reader, and device review remains.",
      mitigation: "Move manual accessibility and mobile review into Phase 4.1."
    },
    {
      id: "compass_optional_video_fetch",
      category: "ui_connection",
      severity: "medium",
      status: "accepted",
      message: "CompassExperience retains an existing optional video API fetch path, though Phase 3 engine data does not depend on it.",
      mitigation: "Review in Phase 4.1 and keep it disabled, isolated, or explicitly approved before public beta."
    },
    {
      id: "future_service_decisions",
      category: "future_persistence",
      severity: "medium",
      status: "open",
      message: "Persistence, analytics, and live AI remain future controlled decisions.",
      mitigation: "Require owner approval, consent/privacy review, payload sanitization, and fallback safety review before any service connection."
    },
    {
      id: "content_coverage_growth",
      category: "content_coverage",
      severity: "low",
      status: "open",
      message: "More Scripture, promise, calling, prayer, and action coverage can improve product depth.",
      mitigation: "Plan reviewed content expansion in Phase 4 without weakening data contracts."
    }
  ];

  return {
    id: "phase_3_remaining_risk_register",
    risks: risks.length ? risks : defaultRisks,
    inMemoryOnly: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}

export function addPhase3RemainingRisk(
  register: TeoyubePhase3RemainingRiskRegister,
  risk: TeoyubePhase3RemainingRisk
): TeoyubePhase3RemainingRiskRegister {
  return {
    ...register,
    risks: [...register.risks, risk],
    generatedAt: new Date().toISOString()
  };
}

export function resolvePhase3RemainingRisk(
  register: TeoyubePhase3RemainingRiskRegister,
  riskId: string,
  resolution: string
): TeoyubePhase3RemainingRiskRegister {
  return {
    ...register,
    risks: register.risks.map((risk) => risk.id === riskId ? { ...risk, status: "resolved", resolution } : risk),
    generatedAt: new Date().toISOString()
  };
}

export function summarizePhase3RemainingRisks(register: TeoyubePhase3RemainingRiskRegister) {
  return {
    total: register.risks.length,
    open: register.risks.filter((risk) => risk.status === "open").length,
    resolved: register.risks.filter((risk) => risk.status === "resolved").length,
    accepted: register.risks.filter((risk) => risk.status === "accepted").length,
    critical: getCriticalPhase3RemainingRisks(register).length
  };
}

export function getCriticalPhase3RemainingRisks(
  register: TeoyubePhase3RemainingRiskRegister
): TeoyubePhase3RemainingRisk[] {
  return register.risks.filter((risk) => risk.severity === "critical" && risk.status === "open");
}

export function getPhase3RemainingRisksByCategory(
  register: TeoyubePhase3RemainingRiskRegister,
  category: TeoyubePhase3RemainingRisk["category"]
): TeoyubePhase3RemainingRisk[] {
  return register.risks.filter((risk) => risk.category === category);
}

export function createPhase3RemainingRiskRegisterReport(
  register: TeoyubePhase3RemainingRiskRegister = createPhase3RemainingRiskRegister()
): TeoyubePhase3RemainingRiskRegisterReport {
  const critical = getCriticalPhase3RemainingRisks(register);
  const warnings = register.risks
    .filter((risk) => risk.status === "open" && risk.severity !== "critical")
    .map((risk) => risk.message);

  return {
    valid: critical.length === 0,
    riskCount: register.risks.length,
    openRiskCount: register.risks.filter((risk) => risk.status === "open").length,
    criticalRiskCount: critical.length,
    risks: register.risks,
    blockers: critical.map((risk) => risk.message),
    warnings,
    inMemoryOnly: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noBrowserPersistenceRequired: true,
    generatedAt: new Date().toISOString()
  };
}
