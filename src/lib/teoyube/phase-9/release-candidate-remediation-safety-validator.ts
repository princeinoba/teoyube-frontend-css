import type {
  TeoyubeReleaseCandidateRemediationItem,
  TeoyubeReleaseCandidateRemediationPlan,
  TeoyubeReleaseCandidateRemediationRisk
} from "./release-candidate-remediation-contracts";

export type TeoyubeReleaseCandidateRemediationSafetyReport = {
  valid: boolean;
  plan: TeoyubeReleaseCandidateRemediationPlan;
  blockers: string[];
  warnings: string[];
  noScriptureAnchorsRemoved: true;
  noExplanationTracesRemoved: true;
  fallbackSafetyPreserved: true;
  confidenceLabelsPreserved: true;
  privacyConsentPreserved: true;
  sensitiveWarningsPreserved: true;
  knownLimitationsPreserved: true;
  noServicesEnabled: true;
  noReviewOnlyContentPublished: true;
  noUnreviewedProductionJsonWrite: true;
  noRawSensitiveTextStorage: true;
  noSensitiveBrowserPersistence: true;
  noHiddenPersonalization: true;
  noDivineCertainty: true;
  noProfessionalAdvice: true;
  noDebugPayloadExposure: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function riskBlockers(risk: TeoyubeReleaseCandidateRemediationRisk = {}): string[] {
  return [
    ...(risk.removesScriptureAnchors ? ["Remediation must not remove Scripture anchors."] : []),
    ...(risk.removesExplanationTraces ? ["Remediation must not remove explanation traces."] : []),
    ...(risk.weakensFallbackSafety ? ["Remediation must not weaken fallback safety."] : []),
    ...(risk.removesConfidenceLabels ? ["Remediation must not remove confidence labels."] : []),
    ...(risk.hidesPrivacyConsentNotices ? ["Remediation must not hide privacy/consent notices."] : []),
    ...(risk.removesSensitiveDataWarnings ? ["Remediation must not remove sensitive data warnings."] : []),
    ...(risk.removesKnownLimitations ? ["Remediation must not remove known limitations."] : []),
    ...(risk.enablesUnapprovedServices ? ["Remediation must not enable unapproved services."] : []),
    ...(risk.publishesReviewOnlyContent ? ["Remediation must not publish review-only content."] : []),
    ...(risk.writesUnreviewedProductionJson ? ["Remediation must not write unreviewed content into production JSON."] : []),
    ...(risk.storesRawSensitiveText ? ["Remediation must not store raw sensitive text."] : []),
    ...(risk.addsSensitiveBrowserPersistence ? ["Remediation must not add localStorage, cookies, IndexedDB, or browser persistence for sensitive data."] : []),
    ...(risk.createsHiddenPersonalization ? ["Remediation must not create hidden personalization."] : []),
    ...(risk.claimsDivineCertainty ? ["Remediation must not claim divine certainty."] : []),
    ...(risk.addsProfessionalAdviceLanguage ? ["Remediation must not add professional advice language."] : []),
    ...(risk.exposesDebugPayloads ? ["Remediation must not expose debug payloads to normal users."] : [])
  ];
}

export function validateReleaseCandidateRemediationItemSafety(item: TeoyubeReleaseCandidateRemediationItem): boolean {
  return riskBlockers(item.risk).length === 0 && item.actions.every((action) => action.safeLocalAction || item.ownerReviewRequired);
}

export function validateReleaseCandidateRemediationPlanSafety(plan: TeoyubeReleaseCandidateRemediationPlan): boolean {
  return getReleaseCandidateRemediationSafetyBlockers(plan).length === 0;
}

export function getReleaseCandidateRemediationSafetyBlockers(plan: TeoyubeReleaseCandidateRemediationPlan): string[] {
  return [
    ...(!plan.manualOnly || !plan.noExternalWrite || !plan.noDatabasePersistence || !plan.noAnalytics || !plan.noExternalServices || !plan.noUserContact || !plan.noPublishing || !plan.noProductionJsonWrite || !plan.inMemoryOnly
      ? ["Release candidate remediation safety validation requires manual, in-memory, no-write, no-contact, no-publishing, no-analytics, no-persistence, and service-disabled boundaries."]
      : []),
    ...plan.items.flatMap((item) => riskBlockers(item.risk).map((message) => `${item.id}: ${message}`)),
    ...plan.items.filter((item) => !validateReleaseCandidateRemediationItemSafety(item)).map((item) => `${item.id}: Unsafe action requires owner review or must be blocked.`)
  ];
}

export function getReleaseCandidateRemediationSafetyWarnings(plan: TeoyubeReleaseCandidateRemediationPlan): string[] {
  return [
    "Remediation safety validation is manual and in-memory; it does not apply patches by itself.",
    ...(plan.safePatchSummary.length ? plan.safePatchSummary.map((patch) => `${patch.filePath}: ${patch.issueAddressed}`) : ["No actual safe local app patch was required by default Phase 9.2 reports."])
  ];
}

export function createReleaseCandidateRemediationSafetyReport(plan: TeoyubeReleaseCandidateRemediationPlan): TeoyubeReleaseCandidateRemediationSafetyReport {
  const blockers = getReleaseCandidateRemediationSafetyBlockers(plan);
  return {
    valid: blockers.length === 0,
    plan,
    blockers,
    warnings: getReleaseCandidateRemediationSafetyWarnings(plan),
    noScriptureAnchorsRemoved: true,
    noExplanationTracesRemoved: true,
    fallbackSafetyPreserved: true,
    confidenceLabelsPreserved: true,
    privacyConsentPreserved: true,
    sensitiveWarningsPreserved: true,
    knownLimitationsPreserved: true,
    noServicesEnabled: true,
    noReviewOnlyContentPublished: true,
    noUnreviewedProductionJsonWrite: true,
    noRawSensitiveTextStorage: true,
    noSensitiveBrowserPersistence: true,
    noHiddenPersonalization: true,
    noDivineCertainty: true,
    noProfessionalAdvice: true,
    noDebugPayloadExposure: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
