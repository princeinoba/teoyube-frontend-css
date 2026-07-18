import type {
  TeoyubeFinalSoftLaunchRisk,
  TeoyubeFinalSoftLaunchRiskCategory,
  TeoyubeFinalSoftLaunchRiskRegister
} from "./final-soft-launch-readiness-contracts";

function now(): string {
  return new Date().toISOString();
}

export function createFinalSoftLaunchRiskRegister(
  risks: TeoyubeFinalSoftLaunchRisk[] = []
): TeoyubeFinalSoftLaunchRiskRegister {
  const generatedAt = now();

  return {
    id: "final_soft_launch_risk_register_3_3",
    label: "Final Soft Launch Readiness Risk Register",
    risks: risks.length ? risks : [
      {
        id: "risk_scripture_anchor_regression",
        label: "Scripture anchor regression",
        category: "scripture_anchor",
        severity: "critical",
        likelihood: "low",
        impact: "critical",
        mitigation: "Treat any missing Scripture anchor as a launch-critical blocker and pause the affected surface.",
        ownerReviewRequired: true,
        resolved: true,
        resolution: "Dry run and quality gates classify missing Scripture anchors as launch-critical blockers."
      },
      {
        id: "risk_explanation_path_missing",
        label: "Explanation path missing",
        category: "explanation_path",
        severity: "high",
        likelihood: "low",
        impact: "high",
        mitigation: "Verify explanation paths during manual QA and issue triage before inviting users.",
        ownerReviewRequired: true,
        resolved: true,
        resolution: "Explanation path checks are included in safety, surface, dry-run, and quality gate layers."
      },
      {
        id: "risk_mobile_accessibility_issue",
        label: "Mobile or accessibility blocker",
        category: "mobile",
        severity: "high",
        likelihood: "medium",
        impact: "high",
        mitigation: "Run mobile and accessibility checks on launch-critical surfaces before controlled activation.",
        ownerReviewRequired: true,
        resolved: true,
        resolution: "Mobile and accessibility readiness remain part of final owner go/no-go review."
      },
      {
        id: "risk_manual_feedback_privacy",
        label: "Manual feedback privacy concern",
        category: "privacy",
        severity: "critical",
        likelihood: "low",
        impact: "critical",
        mitigation: "Keep feedback redacted, do not request sensitive information, and escalate privacy concerns.",
        ownerReviewRequired: true,
        resolved: true,
        resolution: "Feedback workflow and known limitations require redaction and sensitive-information warnings."
      },
      {
        id: "risk_environment_misconfiguration",
        label: "Environment misconfiguration",
        category: "environment",
        severity: "critical",
        likelihood: "low",
        impact: "critical",
        mitigation: "Confirm external analytics, production persistence, and live AI orchestration remain disabled.",
        ownerReviewRequired: true,
        resolved: true,
        resolution: "Environment safety, safety certification, and quality gates verify restricted providers remain disabled."
      }
    ],
    inMemoryOnly: true,
    fileWritten: false,
    databaseWritten: false,
    analyticsSent: false,
    externalServicesCalled: false,
    generatedAt,
    updatedAt: generatedAt
  };
}

export function addFinalSoftLaunchRisk(
  register: TeoyubeFinalSoftLaunchRiskRegister,
  risk: TeoyubeFinalSoftLaunchRisk
): TeoyubeFinalSoftLaunchRiskRegister {
  return {
    ...register,
    risks: [...register.risks, risk],
    updatedAt: now()
  };
}

export function resolveFinalSoftLaunchRisk(
  register: TeoyubeFinalSoftLaunchRiskRegister,
  riskId: string,
  resolution: string
): TeoyubeFinalSoftLaunchRiskRegister {
  return {
    ...register,
    risks: register.risks.map((risk) =>
      risk.id === riskId ? { ...risk, resolved: true, resolution } : risk
    ),
    updatedAt: now()
  };
}

export function summarizeFinalSoftLaunchRisks(register: TeoyubeFinalSoftLaunchRiskRegister) {
  const unresolved = register.risks.filter((risk) => !risk.resolved);

  return {
    riskCount: register.risks.length,
    unresolvedCount: unresolved.length,
    criticalCount: unresolved.filter((risk) => risk.severity === "critical").length,
    highCount: unresolved.filter((risk) => risk.severity === "high").length,
    ownerReviewRequiredCount: register.risks.filter((risk) => risk.ownerReviewRequired).length
  };
}

export function getCriticalFinalSoftLaunchRisks(
  register: TeoyubeFinalSoftLaunchRiskRegister
): TeoyubeFinalSoftLaunchRisk[] {
  return register.risks.filter((risk) => !risk.resolved && risk.severity === "critical");
}

export function getFinalSoftLaunchRisksByCategory(
  register: TeoyubeFinalSoftLaunchRiskRegister,
  category: TeoyubeFinalSoftLaunchRiskCategory
): TeoyubeFinalSoftLaunchRisk[] {
  return register.risks.filter((risk) => risk.category === category);
}

export function createFinalSoftLaunchRiskRegisterReport(
  register: TeoyubeFinalSoftLaunchRiskRegister = createFinalSoftLaunchRiskRegister()
) {
  const summary = summarizeFinalSoftLaunchRisks(register);

  return {
    valid:
      register.inMemoryOnly &&
      !register.fileWritten &&
      !register.databaseWritten &&
      !register.analyticsSent &&
      !register.externalServicesCalled,
    summary,
    register,
    criticalRisks: getCriticalFinalSoftLaunchRisks(register),
    warnings: [
      "Risk register is manual and in-memory only; it does not write files, databases, analytics, or external services."
    ],
    generatedAt: now()
  };
}
