import { createControlledAdminWorkspaceReport } from "../phase-4/controlled-admin-workspace";

export type TeoyubeBetaControlledAdminQaInput = {
  workspaceReport?: ReturnType<typeof createControlledAdminWorkspaceReport>;
  prototypePublicByDefault?: boolean;
  adminAuthAdded?: boolean;
  cmsConnected?: boolean;
  databasePersistenceEnabled?: boolean;
  reviewActionPublishesContent?: boolean;
};

export type TeoyubeBetaControlledAdminQaCheck = {
  id: string;
  label: string;
  passed: boolean;
  required: boolean;
  details: string;
};

export type TeoyubeBetaControlledAdminQaReport = {
  valid: boolean;
  checks: TeoyubeBetaControlledAdminQaCheck[];
  blockers: string[];
  warnings: string[];
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noDatabasePersistenceEnabled: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function check(id: string, label: string, passed: boolean, details: string, required = true): TeoyubeBetaControlledAdminQaCheck {
  return { id, label, passed, required, details };
}

export function validateBetaControlledAdminPrototype(input: TeoyubeBetaControlledAdminQaInput = {}): TeoyubeBetaControlledAdminQaCheck {
  const report = input.workspaceReport || createControlledAdminWorkspaceReport();
  return check("beta_controlled_admin_prototype", "Admin workspace remains prototype-only", report.workspace.prototypeOnly && report.noProductionDataModified && report.noAutomaticPublishing, "The admin surface must remain route-less/prototype-only and not mutate production data.");
}

export function validateBetaAdminWorkspaceInMemoryOnly(input: TeoyubeBetaControlledAdminQaInput = {}): TeoyubeBetaControlledAdminQaCheck {
  const report = input.workspaceReport || createControlledAdminWorkspaceReport();
  return check("beta_admin_workspace_in_memory", "Admin workspace remains in-memory only", report.inMemoryOnly && report.workspace.inMemoryOnly, "No database, CMS, or browser persistence should back the prototype.");
}

export function validateBetaAdminSimulatorDoesNotPersist(input: TeoyubeBetaControlledAdminQaInput = {}): TeoyubeBetaControlledAdminQaCheck {
  const report = input.workspaceReport || createControlledAdminWorkspaceReport();
  return check("beta_admin_simulator_no_persist", "Admin simulator does not persist or publish", report.noProductionDataModified && !input.reviewActionPublishesContent, "Review actions must remain simulated.");
}

export function validateBetaAdminPrototypeNotPublicByDefault(input: TeoyubeBetaControlledAdminQaInput = {}): TeoyubeBetaControlledAdminQaCheck {
  return check("beta_admin_not_public", "Admin prototype is not public by default", !input.prototypePublicByDefault, "Phase 5.2 must not expose production admin routes.");
}

export function validateBetaAdminNoAuthCmsService(input: TeoyubeBetaControlledAdminQaInput = {}): TeoyubeBetaControlledAdminQaCheck {
  const report = input.workspaceReport || createControlledAdminWorkspaceReport();
  return check("beta_admin_no_auth_cms", "No admin auth, CMS, or database service is connected", report.noAdminAuthAdded && report.noProductionCms && !input.adminAuthAdded && !input.cmsConnected && !input.databasePersistenceEnabled, "Admin auth, CMS, and persistence remain future service gates.");
}

export function createBetaControlledAdminQaChecklist(input: TeoyubeBetaControlledAdminQaInput = {}): TeoyubeBetaControlledAdminQaCheck[] {
  return [
    validateBetaControlledAdminPrototype(input),
    validateBetaAdminWorkspaceInMemoryOnly(input),
    validateBetaAdminSimulatorDoesNotPersist(input),
    validateBetaAdminPrototypeNotPublicByDefault(input),
    validateBetaAdminNoAuthCmsService(input)
  ];
}

export function getBetaControlledAdminQaBlockers(input: TeoyubeBetaControlledAdminQaInput = {}): string[] {
  const report = input.workspaceReport || createControlledAdminWorkspaceReport();
  return [
    ...createBetaControlledAdminQaChecklist({ ...input, workspaceReport: report })
      .filter((entry) => entry.required && !entry.passed)
      .map((entry) => `${entry.label}: ${entry.details}`),
    ...report.blockers.map((entry) => entry.message)
  ];
}

export function getBetaControlledAdminQaWarnings(input: TeoyubeBetaControlledAdminQaInput = {}): string[] {
  const report = input.workspaceReport || createControlledAdminWorkspaceReport();
  return [
    ...report.warnings.map((entry) => entry.message),
    "Manual owner review is still required before any future admin service implementation."
  ];
}

export function createBetaControlledAdminQaReport(input: TeoyubeBetaControlledAdminQaInput = {}): TeoyubeBetaControlledAdminQaReport {
  const blockers = getBetaControlledAdminQaBlockers(input);
  return {
    valid: blockers.length === 0,
    checks: createBetaControlledAdminQaChecklist(input),
    blockers,
    warnings: getBetaControlledAdminQaWarnings(input),
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noDatabasePersistenceEnabled: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
