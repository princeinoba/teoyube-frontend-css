import type {
  TeoyubeReadinessRemediationBlocker,
  TeoyubeReadinessRemediationItem,
  TeoyubeReadinessRemediationPlan,
  TeoyubeReadinessRemediationSafetyChecks,
  TeoyubeReadinessRemediationWarning
} from "./readiness-remediation-contracts";

export type TeoyubeReadinessRemediationSafetyReport = {
  valid: boolean;
  plan: TeoyubeReadinessRemediationPlan;
  blockers: TeoyubeReadinessRemediationBlocker[];
  warnings: TeoyubeReadinessRemediationWarning[];
  noScriptureAnchorsRemoved: boolean;
  noExplanationTracesRemoved: boolean;
  noFallbackSafetyWeakened: boolean;
  noConfidenceLabelsRemoved: boolean;
  noConsentPrivacyNoticesHidden: boolean;
  noUnapprovedServicesEnabled: boolean;
  noReviewOnlyContentPublished: boolean;
  noUnreviewedProductionJsonWrites: boolean;
  noRawSensitiveTextStored: boolean;
  noBrowserPersistenceAdded: boolean;
  noHiddenPersonalizationCreated: boolean;
  noDivineCertaintyClaims: boolean;
  noProfessionalAdviceLanguage: boolean;
  inMemoryOnly: true;
  generatedAt: string;
};

const SAFETY_BLOCKERS: Array<{ key: keyof TeoyubeReadinessRemediationSafetyChecks; message: string; action: string }> = [
  { key: "removesScriptureAnchors", message: "Remediation removes Scripture anchors.", action: "Restore Scripture anchors before remediation." },
  { key: "removesExplanationTraces", message: "Remediation removes explanation traces.", action: "Restore explanation paths or fallback reasons." },
  { key: "weakensFallbackSafety", message: "Remediation weakens fallback safety.", action: "Restore safe fallback copy and behavior." },
  { key: "removesConfidenceLabels", message: "Remediation removes confidence labels.", action: "Keep confidence/uncertainty labels visible." },
  { key: "hidesConsentPrivacyNotices", message: "Remediation hides consent/privacy notices.", action: "Restore consent/privacy notices." },
  { key: "enablesUnapprovedServices", message: "Remediation enables unapproved services.", action: "Keep services disabled or plan-only." },
  { key: "publishesReviewOnlyContent", message: "Remediation publishes review-only content.", action: "Keep review-only content out of live flows." },
  { key: "writesUnreviewedProductionJson", message: "Remediation writes unreviewed content to production JSON.", action: "Do not write unreviewed content to production data." },
  { key: "storesRawSensitiveText", message: "Remediation stores raw sensitive text.", action: "Remove storage of raw sensitive text." },
  { key: "addsBrowserPersistence", message: "Remediation adds browser persistence.", action: "Do not use localStorage, cookies, or IndexedDB for sensitive personalization." },
  { key: "createsHiddenPersonalization", message: "Remediation creates hidden personalization.", action: "Keep personalization transparent and consent-aware." },
  { key: "claimsDivineCertainty", message: "Remediation claims divine certainty.", action: "Rewrite to preserve uncertainty and devotional boundaries." },
  { key: "addsProfessionalAdviceLanguage", message: "Remediation adds professional-advice language.", action: "Remove medical, legal, financial, emergency, or other professional advice language." }
];

export function validateReadinessRemediationItemSafety(item: TeoyubeReadinessRemediationItem): TeoyubeReadinessRemediationBlocker[] {
  return SAFETY_BLOCKERS
    .filter((entry) => item.safetyChecks[entry.key])
    .map((entry) => ({
      id: `${item.id}_${String(entry.key)}`,
      itemId: item.id,
      category: item.category,
      message: entry.message,
      requiredAction: entry.action
    }));
}

export function getReadinessRemediationSafetyBlockers(plan: TeoyubeReadinessRemediationPlan): TeoyubeReadinessRemediationBlocker[] {
  return [
    ...(!plan.inMemoryOnly || !plan.noExternalServicesRequired || !plan.noDatabasePersistenceEnabled || !plan.noAnalyticsEnabled || !plan.noUsersContacted || !plan.noAutomaticPublishing
      ? [{
          id: "remediation_safety_boundary_broken",
          category: "unknown" as const,
          message: "Remediation safety validation detected broken Phase 5.3 boundaries.",
          requiredAction: "Keep remediation in-memory, service-disabled, no-persistence, no-analytics, no-contact, and no-publishing."
        }]
      : []),
    ...plan.items.flatMap(validateReadinessRemediationItemSafety)
  ];
}

export function getReadinessRemediationSafetyWarnings(plan: TeoyubeReadinessRemediationPlan): TeoyubeReadinessRemediationWarning[] {
  return plan.items
    .filter((item) => item.risks.some((risk) => risk.severity === "high"))
    .map((item) => ({
      id: `${item.id}_high_risk`,
      itemId: item.id,
      category: item.category,
      message: `${item.title} is high risk for remediation.`,
      recommendedAction: "Route high-risk remediation through owner review and regression QA."
    }));
}

export function validateReadinessRemediationPlanSafety(plan: TeoyubeReadinessRemediationPlan): boolean {
  return getReadinessRemediationSafetyBlockers(plan).length === 0;
}

export function createReadinessRemediationSafetyReport(plan: TeoyubeReadinessRemediationPlan): TeoyubeReadinessRemediationSafetyReport {
  const blockers = getReadinessRemediationSafetyBlockers(plan);
  const allChecks = plan.items.map((item) => item.safetyChecks);
  const any = (key: keyof TeoyubeReadinessRemediationSafetyChecks) => allChecks.some((checks) => checks[key]);
  return {
    valid: blockers.length === 0,
    plan,
    blockers,
    warnings: getReadinessRemediationSafetyWarnings(plan),
    noScriptureAnchorsRemoved: !any("removesScriptureAnchors"),
    noExplanationTracesRemoved: !any("removesExplanationTraces"),
    noFallbackSafetyWeakened: !any("weakensFallbackSafety"),
    noConfidenceLabelsRemoved: !any("removesConfidenceLabels"),
    noConsentPrivacyNoticesHidden: !any("hidesConsentPrivacyNotices"),
    noUnapprovedServicesEnabled: !any("enablesUnapprovedServices"),
    noReviewOnlyContentPublished: !any("publishesReviewOnlyContent"),
    noUnreviewedProductionJsonWrites: !any("writesUnreviewedProductionJson"),
    noRawSensitiveTextStored: !any("storesRawSensitiveText"),
    noBrowserPersistenceAdded: !any("addsBrowserPersistence"),
    noHiddenPersonalizationCreated: !any("createsHiddenPersonalization"),
    noDivineCertaintyClaims: !any("claimsDivineCertainty"),
    noProfessionalAdviceLanguage: !any("addsProfessionalAdviceLanguage"),
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
