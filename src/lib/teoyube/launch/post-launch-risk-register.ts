import type { TeoyubePostLaunchReadinessRisk, TeoyubePostLaunchRiskCategory } from "./public-launch-completion-contracts";

export const TEOYUBE_POST_LAUNCH_RISK_CATEGORIES: TeoyubePostLaunchRiskCategory[] = [
  "privacy",
  "terms",
  "consent",
  "scripture_anchor",
  "explanation_path",
  "fallback",
  "confidence",
  "mobile",
  "accessibility",
  "performance",
  "feedback",
  "content_clarity",
  "ai_companion",
  "personalization",
  "offline",
  "security",
  "production_services",
  "unknown"
];

export type TeoyubePostLaunchRiskRegister = {
  id: string;
  label: string;
  risks: TeoyubePostLaunchReadinessRisk[];
  manualOnly: true;
  inMemoryOnly: true;
  fileWritten: false;
  databaseWritten: false;
  analyticsSent: false;
  externalServicesCalled: false;
  publicUrlFetched: false;
  usersContacted: false;
  generatedAt: string;
  updatedAt: string;
};

function now(): string {
  return new Date().toISOString();
}

export function createPostLaunchRiskRegister(): TeoyubePostLaunchRiskRegister {
  const generatedAt = now();
  return {
    id: "post_launch_risk_register_6_5",
    label: "Post-Launch Readiness Risk Register",
    risks: [
      {
        id: "post_launch_service_connection_risk",
        category: "production_services",
        label: "Production services remain explicitly controlled",
        severity: "medium",
        status: "accepted",
        mitigation: "Connect persistence, analytics, and live AI only through future explicit post-launch operations decisions.",
        ownerReviewRequired: true
      }
    ],
    manualOnly: true,
    inMemoryOnly: true,
    fileWritten: false,
    databaseWritten: false,
    analyticsSent: false,
    externalServicesCalled: false,
    publicUrlFetched: false,
    usersContacted: false,
    generatedAt,
    updatedAt: generatedAt
  };
}

export function addPostLaunchRisk(
  register: TeoyubePostLaunchRiskRegister,
  risk: TeoyubePostLaunchReadinessRisk
): TeoyubePostLaunchRiskRegister {
  return { ...register, risks: [...register.risks.filter((entry) => entry.id !== risk.id), risk], updatedAt: now() };
}

export function resolvePostLaunchRisk(
  register: TeoyubePostLaunchRiskRegister,
  riskId: string,
  resolution: string
): TeoyubePostLaunchRiskRegister {
  return {
    ...register,
    risks: register.risks.map((risk) => risk.id === riskId ? { ...risk, status: "resolved" as const, mitigation: resolution } : risk),
    updatedAt: now()
  };
}

export function summarizePostLaunchRisks(register: TeoyubePostLaunchRiskRegister) {
  return {
    riskCount: register.risks.length,
    criticalRiskCount: register.risks.filter((risk) => risk.severity === "critical" && risk.status !== "resolved").length,
    openRiskCount: register.risks.filter((risk) => risk.status === "open").length,
    acceptedRiskCount: register.risks.filter((risk) => risk.status === "accepted").length,
    resolvedRiskCount: register.risks.filter((risk) => risk.status === "resolved").length,
    noExternalWrite: register.inMemoryOnly && !register.fileWritten && !register.databaseWritten && !register.analyticsSent && !register.externalServicesCalled,
    noPublicUrlFetched: !register.publicUrlFetched,
    noUsersContacted: !register.usersContacted
  };
}

export function getCriticalPostLaunchRisks(register: TeoyubePostLaunchRiskRegister): TeoyubePostLaunchReadinessRisk[] {
  return register.risks.filter((risk) => risk.severity === "critical" && risk.status !== "resolved");
}

export function getPostLaunchRisksByCategory(
  register: TeoyubePostLaunchRiskRegister,
  category: TeoyubePostLaunchRiskCategory
): TeoyubePostLaunchReadinessRisk[] {
  return register.risks.filter((risk) => risk.category === category);
}

export function createPostLaunchRiskRegisterReport(register: TeoyubePostLaunchRiskRegister = createPostLaunchRiskRegister()) {
  const summary = summarizePostLaunchRisks(register);
  const criticalRisks = getCriticalPostLaunchRisks(register);
  return {
    valid: criticalRisks.length === 0 && summary.noExternalWrite && summary.noPublicUrlFetched && summary.noUsersContacted,
    ready: criticalRisks.length === 0,
    register,
    categories: TEOYUBE_POST_LAUNCH_RISK_CATEGORIES,
    summary,
    criticalRisks,
    risks: register.risks,
    manualOnly: true,
    inMemoryOnly: true,
    noUsersContacted: true,
    noPublicUrlFetched: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
