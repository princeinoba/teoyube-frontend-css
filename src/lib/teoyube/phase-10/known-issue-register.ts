import type { TeoyubeFirstDayIssueSeverity } from "./first-day-issue-triage-contracts";

export type TeoyubeKnownIssueOwnerApprovalStatus =
  | "not_reviewed"
  | "approved"
  | "approved_with_conditions"
  | "rejected"
  | "unknown";

export type TeoyubeKnownIssueRegisterItem = {
  id: string;
  severity: TeoyubeFirstDayIssueSeverity;
  affectedRouteComponentOrDataFile: string;
  summary: string;
  userImpact: string;
  acceptedRisk: boolean;
  safeFixRequired: boolean;
  rollbackRequired: boolean;
  ownerApprovalStatus: TeoyubeKnownIssueOwnerApprovalStatus;
  targetReviewPhase: string;
  scriptureAnchorsAffected: boolean;
  explanationTracesAffected: boolean;
  fallbackSafetyAffected: boolean;
  confidenceLabelsAffected: boolean;
  privacyConsentAffected: boolean;
  serviceDisabledStateAffected: boolean;
  notes: string[];
};

export type TeoyubeKnownIssueRegister = {
  id: string;
  items: TeoyubeKnownIssueRegisterItem[];
  noAutomaticIssueCollection: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  createdAt: string;
  updatedAt: string;
};

export function createKnownIssueRegister(input: Partial<TeoyubeKnownIssueRegister> = {}): TeoyubeKnownIssueRegister {
  const now = new Date().toISOString();
  return {
    id: input.id || "phase_10_5_known_issue_register",
    items: input.items || [],
    noAutomaticIssueCollection: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now
  };
}

export function createKnownIssueRegisterItem(input: Partial<TeoyubeKnownIssueRegisterItem> = {}): TeoyubeKnownIssueRegisterItem {
  return {
    id: input.id || `known_issue_${Date.now()}`,
    severity: input.severity || "severity_4_low",
    affectedRouteComponentOrDataFile: input.affectedRouteComponentOrDataFile || "manual_owner_required",
    summary: input.summary || "Known issue summary requires owner review.",
    userImpact: input.userImpact || "Owner must assess user impact manually.",
    acceptedRisk: input.acceptedRisk ?? false,
    safeFixRequired: input.safeFixRequired ?? false,
    rollbackRequired: input.rollbackRequired ?? false,
    ownerApprovalStatus: input.ownerApprovalStatus || "not_reviewed",
    targetReviewPhase: input.targetReviewPhase || "Phase 10.6",
    scriptureAnchorsAffected: input.scriptureAnchorsAffected ?? false,
    explanationTracesAffected: input.explanationTracesAffected ?? false,
    fallbackSafetyAffected: input.fallbackSafetyAffected ?? false,
    confidenceLabelsAffected: input.confidenceLabelsAffected ?? false,
    privacyConsentAffected: input.privacyConsentAffected ?? false,
    serviceDisabledStateAffected: input.serviceDisabledStateAffected ?? false,
    notes: input.notes || []
  };
}

export function addKnownIssueRegisterItem(register: TeoyubeKnownIssueRegister, item: TeoyubeKnownIssueRegisterItem): TeoyubeKnownIssueRegister {
  return { ...register, items: [...register.items, item], updatedAt: new Date().toISOString() };
}

export function updateKnownIssueRegisterItem(register: TeoyubeKnownIssueRegister, item: TeoyubeKnownIssueRegisterItem): TeoyubeKnownIssueRegister {
  return { ...register, items: [...register.items.filter((entry) => entry.id !== item.id), item], updatedAt: new Date().toISOString() };
}

function issueBlockers(item: TeoyubeKnownIssueRegisterItem): string[] {
  const blockers: string[] = [];
  if (item.severity === "severity_1_critical") blockers.push("Severity 1 issues cannot be accepted for expansion.");
  if (item.rollbackRequired) blockers.push("Rollback-required issue blocks expansion.");
  if (item.severity === "severity_2_high" && item.ownerApprovalStatus !== "approved_with_conditions") blockers.push("Severity 2 issues need explicit owner approval with conditions before expansion.");
  if ((item.scriptureAnchorsAffected || item.explanationTracesAffected || item.fallbackSafetyAffected || item.confidenceLabelsAffected || item.privacyConsentAffected || item.serviceDisabledStateAffected) && item.ownerApprovalStatus === "not_reviewed") {
    blockers.push("Issue affects Teoyube safety boundaries and needs owner review.");
  }
  return blockers;
}

export function getKnownIssueRegisterBlockers(register: TeoyubeKnownIssueRegister): string[] {
  return register.items.flatMap((item) => issueBlockers(item).map((message) => `${item.id}: ${message}`));
}

export function getKnownIssueRegisterWarnings(register: TeoyubeKnownIssueRegister): string[] {
  const warnings: string[] = [];
  if (!register.items.length) warnings.push("Known issue register is empty.");
  register.items
    .filter((item) => item.severity === "severity_3_medium" || item.severity === "severity_4_low")
    .forEach((item) => warnings.push(`${item.id}: known issue may be watched or deferred if owner accepts risk.`));
  register.items
    .filter((item) => item.acceptedRisk && item.ownerApprovalStatus === "not_reviewed")
    .forEach((item) => warnings.push(`${item.id}: accepted risk needs owner approval status.`));
  warnings.push("Known issue register is in-memory only and does not collect issues automatically.");
  return warnings;
}

export function createKnownIssueRegisterDecision(register: TeoyubeKnownIssueRegister): "register_ready" | "blocked" | "ready_with_warnings" | "empty" {
  if (getKnownIssueRegisterBlockers(register).length) return "blocked";
  if (!register.items.length) return "empty";
  return getKnownIssueRegisterWarnings(register).length ? "ready_with_warnings" : "register_ready";
}

export function createKnownIssueRegisterReport(register: TeoyubeKnownIssueRegister) {
  const blockers = getKnownIssueRegisterBlockers(register);
  return {
    valid: blockers.length === 0,
    decision: createKnownIssueRegisterDecision(register),
    register,
    blockers,
    warnings: getKnownIssueRegisterWarnings(register),
    noAutomaticIssueCollection: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
