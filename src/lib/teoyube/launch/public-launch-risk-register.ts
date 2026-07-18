import type { TeoyubePublicLaunchReadinessRisk, TeoyubePublicLaunchRiskCategory } from "./soft-launch-completion-contracts";

export type TeoyubePublicLaunchRiskRegister = {
  id: string;
  label: string;
  risks: TeoyubePublicLaunchReadinessRisk[];
  manualOnly: true;
  inMemoryOnly: true;
  fileWritten: false;
  databaseWritten: false;
  analyticsSent: false;
  externalServicesCalled: false;
  publicLaunchPerformed: false;
  usersContacted: false;
  generatedAt: string;
  updatedAt: string;
};

function now(): string {
  return new Date().toISOString();
}

export function createPublicLaunchRiskRegister(): TeoyubePublicLaunchRiskRegister {
  const generatedAt = now();
  return {
    id: "public_launch_risk_register_4_5",
    label: "Public Launch Preparation Risk Register",
    risks: [
      {
        id: "production_services_connection_risk",
        category: "production_services",
        label: "Production services are intentionally disconnected",
        severity: "medium",
        status: "accepted",
        mitigation: "Connect persistence, analytics, and live AI only through future explicit public launch preparation steps.",
        ownerReviewRequired: true
      }
    ],
    manualOnly: true,
    inMemoryOnly: true,
    fileWritten: false,
    databaseWritten: false,
    analyticsSent: false,
    externalServicesCalled: false,
    publicLaunchPerformed: false,
    usersContacted: false,
    generatedAt,
    updatedAt: generatedAt
  };
}

export function addPublicLaunchRisk(
  register: TeoyubePublicLaunchRiskRegister,
  risk: TeoyubePublicLaunchReadinessRisk
): TeoyubePublicLaunchRiskRegister {
  return { ...register, risks: [...register.risks.filter((entry) => entry.id !== risk.id), risk], updatedAt: now() };
}

export function resolvePublicLaunchRisk(
  register: TeoyubePublicLaunchRiskRegister,
  riskId: string,
  resolution: string
): TeoyubePublicLaunchRiskRegister {
  return {
    ...register,
    risks: register.risks.map((risk) => risk.id === riskId ? { ...risk, status: "resolved" as const, mitigation: resolution } : risk),
    updatedAt: now()
  };
}

export function summarizePublicLaunchRisks(register: TeoyubePublicLaunchRiskRegister) {
  return {
    riskCount: register.risks.length,
    criticalRiskCount: register.risks.filter((risk) => risk.severity === "critical" && risk.status !== "resolved").length,
    openRiskCount: register.risks.filter((risk) => risk.status === "open").length,
    acceptedRiskCount: register.risks.filter((risk) => risk.status === "accepted").length,
    resolvedRiskCount: register.risks.filter((risk) => risk.status === "resolved").length,
    noExternalWrite: register.inMemoryOnly && !register.fileWritten && !register.databaseWritten && !register.analyticsSent && !register.externalServicesCalled,
    noPublicLaunchPerformed: !register.publicLaunchPerformed,
    noUsersContacted: !register.usersContacted
  };
}

export function getCriticalPublicLaunchRisks(register: TeoyubePublicLaunchRiskRegister): TeoyubePublicLaunchReadinessRisk[] {
  return register.risks.filter((risk) => risk.severity === "critical" && risk.status !== "resolved");
}

export function getPublicLaunchRisksByCategory(
  register: TeoyubePublicLaunchRiskRegister,
  category: TeoyubePublicLaunchRiskCategory
): TeoyubePublicLaunchReadinessRisk[] {
  return register.risks.filter((risk) => risk.category === category);
}

export function createPublicLaunchRiskRegisterReport(register: TeoyubePublicLaunchRiskRegister = createPublicLaunchRiskRegister()) {
  const summary = summarizePublicLaunchRisks(register);
  const criticalRisks = getCriticalPublicLaunchRisks(register);
  return {
    valid: criticalRisks.length === 0 && summary.noExternalWrite && summary.noPublicLaunchPerformed && summary.noUsersContacted,
    ready: criticalRisks.length === 0,
    register,
    summary,
    criticalRisks,
    risks: register.risks,
    manualOnly: true,
    inMemoryOnly: true,
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
