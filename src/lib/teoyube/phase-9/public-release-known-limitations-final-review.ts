export type TeoyubeFinalPublicReleaseKnownLimitationArea =
  | "release_boundary"
  | "service_disabled"
  | "manual_feedback"
  | "manual_support"
  | "admin_workflow"
  | "privacy_security"
  | "safety"
  | "unknown";

export type TeoyubeFinalPublicReleaseKnownLimitation = {
  id: string;
  area: TeoyubeFinalPublicReleaseKnownLimitationArea;
  message: string;
};

export type TeoyubeFinalPublicReleaseKnownLimitationsInput = Partial<{
  limitationsVisible: boolean;
  publicReleasePerformedByThisStep: boolean;
  servicesEnabled: boolean;
  feedbackAutomatic: boolean;
  supportAutomatic: boolean;
  databasePersistenceEnabled: boolean;
  analyticsEnabled: boolean;
  monitoringProviderConnected: boolean;
  liveAiEnabled: boolean;
  adminWorkflowProduction: boolean;
  sensitiveInfoWarningVisible: boolean;
  divineCertaintyClaimed: boolean;
  professionalAdviceClaimed: boolean;
}>;

export type TeoyubeFinalPublicReleaseKnownLimitationsReport = {
  valid: boolean;
  limitations: TeoyubeFinalPublicReleaseKnownLimitation[];
  notice: string;
  blockers: string[];
  warnings: string[];
  noPublicLaunchPerformed: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function limitation(id: string, area: TeoyubeFinalPublicReleaseKnownLimitationArea, message: string): TeoyubeFinalPublicReleaseKnownLimitation {
  return { id, area, message };
}

export function getFinalPublicReleaseKnownLimitations(): TeoyubeFinalPublicReleaseKnownLimitation[] {
  return [
    limitation("public_release_not_performed", "release_boundary", "Public release is not performed by this step."),
    limitation("services_disabled", "service_disabled", "Services remain disabled unless future approval exists."),
    limitation("feedback_manual", "manual_feedback", "Feedback review is manual unless future approval exists."),
    limitation("support_manual", "manual_support", "Support workflow is manual unless future approval exists."),
    limitation("admin_prototype_only", "admin_workflow", "Admin workflow remains prototype-only unless future approval exists."),
    limitation("database_disabled", "service_disabled", "No database persistence is enabled."),
    limitation("analytics_disabled", "service_disabled", "No analytics are enabled."),
    limitation("live_ai_disabled", "service_disabled", "No live AI orchestration is enabled."),
    limitation("monitoring_disabled", "service_disabled", "No production monitoring provider is connected."),
    limitation("sensitive_info_warning", "privacy_security", "Users should not submit sensitive personal information."),
    limitation("no_divine_certainty", "safety", "Teoyube does not claim divine certainty."),
    limitation("no_professional_advice", "safety", "Teoyube is not medical, legal, financial, emergency, or professional counseling advice.")
  ];
}

export function getFinalPublicReleaseKnownLimitationsByArea(area: TeoyubeFinalPublicReleaseKnownLimitationArea): TeoyubeFinalPublicReleaseKnownLimitation[] {
  return getFinalPublicReleaseKnownLimitations().filter((entry) => entry.area === area);
}

export function createFinalPublicReleaseKnownLimitationsNotice(): string {
  return getFinalPublicReleaseKnownLimitations().map((entry) => entry.message).join(" ");
}

export function getFinalPublicReleaseKnownLimitationsBlockers(input: TeoyubeFinalPublicReleaseKnownLimitationsInput = {}): string[] {
  return [
    ...((input.limitationsVisible === false) ? ["Known limitations must remain visible."] : []),
    ...(input.publicReleasePerformedByThisStep ? ["Public release must not be performed by Phase 9.1."] : []),
    ...(input.servicesEnabled ? ["Services must remain disabled unless future approval exists."] : []),
    ...(input.feedbackAutomatic ? ["Feedback must not be collected automatically."] : []),
    ...(input.supportAutomatic ? ["Support must not contact users automatically."] : []),
    ...(input.databasePersistenceEnabled ? ["Database persistence must remain disabled."] : []),
    ...(input.analyticsEnabled ? ["Analytics must remain disabled."] : []),
    ...(input.monitoringProviderConnected ? ["Monitoring provider must remain disconnected."] : []),
    ...(input.liveAiEnabled ? ["Live AI orchestration must remain disabled."] : []),
    ...(input.adminWorkflowProduction ? ["Admin workflow must remain prototype/planning-only."] : []),
    ...(input.sensitiveInfoWarningVisible === false ? ["Sensitive personal information warning must remain visible."] : []),
    ...(input.divineCertaintyClaimed ? ["Divine-certainty claims must be removed."] : []),
    ...(input.professionalAdviceClaimed ? ["Professional-advice claims must be removed."] : [])
  ];
}

export function getFinalPublicReleaseKnownLimitationsWarnings(): string[] {
  return ["Known limitations final review is manual and in-memory; it does not publish copy or connect services."];
}

export function validateFinalPublicReleaseKnownLimitations(input: TeoyubeFinalPublicReleaseKnownLimitationsInput = {}): boolean {
  return getFinalPublicReleaseKnownLimitationsBlockers(input).length === 0;
}

export function createFinalPublicReleaseKnownLimitationsReport(input: TeoyubeFinalPublicReleaseKnownLimitationsInput = {}): TeoyubeFinalPublicReleaseKnownLimitationsReport {
  const blockers = getFinalPublicReleaseKnownLimitationsBlockers(input);
  return {
    valid: blockers.length === 0,
    limitations: getFinalPublicReleaseKnownLimitations(),
    notice: createFinalPublicReleaseKnownLimitationsNotice(),
    blockers,
    warnings: getFinalPublicReleaseKnownLimitationsWarnings(),
    noPublicLaunchPerformed: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
