import type { TeoyubeFinalLaunchPreparationBlocker } from "./final-launch-preparation-contracts";

export type TeoyubeFinalLaunchBlockerCategory =
  | "build"
  | "environment"
  | "qa"
  | "mobile"
  | "accessibility"
  | "scripture_anchor"
  | "explanation_path"
  | "fallback"
  | "consent"
  | "privacy"
  | "personalization"
  | "offline"
  | "security"
  | "deployment"
  | "soft_launch"
  | "unknown";

export type TeoyubeFinalLaunchBlockerRegister = {
  id: string;
  blockers: Array<TeoyubeFinalLaunchPreparationBlocker & {
    category: TeoyubeFinalLaunchBlockerCategory;
    createdAt: string;
    resolvedAt?: string;
  }>;
  inMemoryOnly: true;
  databaseWritten: false;
  analyticsSent: false;
  fileWritten: false;
  generatedAt: string;
};

function createRegisterId(): string {
  return `final_launch_blockers_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createFinalLaunchBlockerRegister(): TeoyubeFinalLaunchBlockerRegister {
  return {
    id: createRegisterId(),
    blockers: [],
    inMemoryOnly: true,
    databaseWritten: false,
    analyticsSent: false,
    fileWritten: false,
    generatedAt: new Date().toISOString()
  };
}

export function addFinalLaunchBlocker(
  register: TeoyubeFinalLaunchBlockerRegister,
  blocker: TeoyubeFinalLaunchPreparationBlocker & { category: TeoyubeFinalLaunchBlockerCategory }
): TeoyubeFinalLaunchBlockerRegister {
  return {
    ...register,
    blockers: [
      {
        ...blocker,
        resolved: false,
        createdAt: new Date().toISOString()
      },
      ...register.blockers
    ]
  };
}

export function resolveFinalLaunchBlocker(
  register: TeoyubeFinalLaunchBlockerRegister,
  blockerId: string,
  resolution: string
): TeoyubeFinalLaunchBlockerRegister {
  return {
    ...register,
    blockers: register.blockers.map((blocker) =>
      blocker.id === blockerId
        ? {
            ...blocker,
            resolved: true,
            resolution,
            resolvedAt: new Date().toISOString()
          }
        : blocker
    )
  };
}

export function getCriticalFinalLaunchBlockers(
  register: TeoyubeFinalLaunchBlockerRegister
): TeoyubeFinalLaunchBlockerRegister["blockers"] {
  return register.blockers.filter((blocker) => blocker.riskLevel === "critical" && !blocker.resolved);
}

export function getFinalLaunchBlockingCategories(register: TeoyubeFinalLaunchBlockerRegister): TeoyubeFinalLaunchBlockerCategory[] {
  return [...new Set(register.blockers.filter((blocker) => !blocker.resolved).map((blocker) => blocker.category))];
}

export function summarizeFinalLaunchBlockers(register: TeoyubeFinalLaunchBlockerRegister) {
  const openBlockers = register.blockers.filter((blocker) => !blocker.resolved);

  return {
    totalCount: register.blockers.length,
    openCount: openBlockers.length,
    resolvedCount: register.blockers.length - openBlockers.length,
    criticalCount: getCriticalFinalLaunchBlockers(register).length,
    categories: getFinalLaunchBlockingCategories(register),
    inMemoryOnly: register.inMemoryOnly,
    databaseWritten: register.databaseWritten,
    analyticsSent: register.analyticsSent,
    fileWritten: register.fileWritten
  };
}

export function createFinalLaunchBlockerReport(register: TeoyubeFinalLaunchBlockerRegister) {
  const summary = summarizeFinalLaunchBlockers(register);

  return {
    valid: summary.criticalCount === 0,
    status: summary.criticalCount === 0 ? "ready" : "blocked",
    summary,
    blockers: register.blockers,
    generatedAt: new Date().toISOString()
  };
}
