import type {
  TeoyubeDryRunStabilizationBlocker,
  TeoyubeDryRunStabilizationItem,
  TeoyubeDryRunStabilizationPlan,
  TeoyubeDryRunStabilizationSafetyChecks,
  TeoyubeDryRunStabilizationWarning
} from "./dry-run-stabilization-contracts";

export type TeoyubeDryRunStabilizationSafetyReport = {
  valid: boolean;
  plan: TeoyubeDryRunStabilizationPlan;
  blockers: TeoyubeDryRunStabilizationBlocker[];
  warnings: TeoyubeDryRunStabilizationWarning[];
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

const SAFETY_BLOCKERS: Array<{ key: keyof TeoyubeDryRunStabilizationSafetyChecks; message: string; action: string }> = [
  { key: "removesScriptureAnchors", message: "Stabilization removes Scripture anchors.", action: "Restore Scripture anchors before stabilization." },
  { key: "removesExplanationTraces", message: "Stabilization removes explanation traces.", action: "Restore explanation paths or fallback reasons." },
  { key: "weakensFallbackSafety", message: "Stabilization weakens fallback safety.", action: "Restore safe fallback copy and behavior." },
  { key: "removesConfidenceLabels", message: "Stabilization removes confidence labels.", action: "Keep confidence/uncertainty labels visible." },
  { key: "hidesConsentPrivacyNotices", message: "Stabilization hides consent/privacy notices.", action: "Restore consent/privacy notices." },
  { key: "enablesUnapprovedServices", message: "Stabilization enables unapproved services.", action: "Keep services disabled or plan-only." },
  { key: "publishesReviewOnlyContent", message: "Stabilization publishes review-only content.", action: "Keep review-only content out of live flows." },
  { key: "writesUnreviewedProductionJson", message: "Stabilization writes unreviewed content to production JSON.", action: "Do not write unreviewed content to production data." },
  { key: "storesRawSensitiveText", message: "Stabilization stores raw sensitive text.", action: "Remove storage of raw sensitive text." },
  { key: "addsBrowserPersistence", message: "Stabilization adds browser persistence.", action: "Do not use localStorage, cookies, or IndexedDB for sensitive personalization." },
  { key: "createsHiddenPersonalization", message: "Stabilization creates hidden personalization.", action: "Keep personalization transparent and consent-aware." },
  { key: "claimsDivineCertainty", message: "Stabilization claims divine certainty.", action: "Rewrite to preserve uncertainty and devotional boundaries." },
  { key: "addsProfessionalAdviceLanguage", message: "Stabilization adds professional-advice language.", action: "Remove medical, legal, financial, emergency, or other professional advice language." }
];

export function validateDryRunStabilizationItemSafety(item: TeoyubeDryRunStabilizationItem): TeoyubeDryRunStabilizationBlocker[] {
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

export function getDryRunStabilizationSafetyBlockers(plan: TeoyubeDryRunStabilizationPlan): TeoyubeDryRunStabilizationBlocker[] {
  return [
    ...(!plan.inMemoryOnly || !plan.noExternalServicesRequired || !plan.noDatabasePersistenceEnabled || !plan.noAnalyticsEnabled || !plan.noUsersContacted || !plan.noFeedbackCollectedAutomatically || !plan.noAutomaticPublishing
      ? [{
          id: "dry_run_stabilization_safety_boundary_broken",
          category: "unknown" as const,
          message: "Stabilization safety validation detected broken Phase 6.3 boundaries.",
          requiredAction: "Keep stabilization in-memory, service-disabled, no-persistence, no-analytics, no-contact, no-feedback-collection, and no-publishing."
        }]
      : []),
    ...plan.items.flatMap(validateDryRunStabilizationItemSafety)
  ];
}

export function getDryRunStabilizationSafetyWarnings(plan: TeoyubeDryRunStabilizationPlan): TeoyubeDryRunStabilizationWarning[] {
  return plan.items
    .filter((item) => item.risks.some((risk) => risk.severity === "high"))
    .map((item) => ({
      id: `${item.id}_high_risk`,
      itemId: item.id,
      category: item.category,
      message: `${item.title} is high risk for stabilization.`,
      recommendedAction: "Route high-risk stabilization through owner review and regression QA."
    }));
}

export function validateDryRunStabilizationPlanSafety(plan: TeoyubeDryRunStabilizationPlan): boolean {
  return getDryRunStabilizationSafetyBlockers(plan).length === 0;
}

export function createDryRunStabilizationSafetyReport(plan: TeoyubeDryRunStabilizationPlan): TeoyubeDryRunStabilizationSafetyReport {
  const blockers = getDryRunStabilizationSafetyBlockers(plan);
  const allChecks = plan.items.map((item) => item.safetyChecks);
  const any = (key: keyof TeoyubeDryRunStabilizationSafetyChecks) => allChecks.some((checks) => checks[key]);
  return {
    valid: blockers.length === 0,
    plan,
    blockers,
    warnings: getDryRunStabilizationSafetyWarnings(plan),
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
