import type { TeoyubeFinalSoftLaunchKnownLimitation } from "./final-soft-launch-readiness-contracts";

export function getFinalSoftLaunchKnownLimitations(): TeoyubeFinalSoftLaunchKnownLimitation[] {
  return [
    {
      id: "not_public_production_launch",
      label: "Not a full public production launch",
      category: "scope",
      surfaces: ["All"],
      message: "The final readiness package prepares limited soft launch execution only; it does not represent a public production launch.",
      ownerAcknowledgementRequired: true
    },
    {
      id: "production_persistence_not_connected",
      label: "Production persistence is not connected",
      category: "persistence",
      surfaces: ["TIG Response Panel", "Journal", "My Journey"],
      message: "Production database persistence remains intentionally disabled until a later guarded persistence step.",
      ownerAcknowledgementRequired: true
    },
    {
      id: "external_analytics_not_connected",
      label: "External analytics are not connected",
      category: "analytics",
      surfaces: ["All"],
      message: "External analytics providers are not sending events during this readiness stage.",
      ownerAcknowledgementRequired: true
    },
    {
      id: "live_ai_not_enabled",
      label: "Live AI orchestration is not enabled",
      category: "live_ai",
      surfaces: ["AI Companion", "TIG Response Panel"],
      message: "Live AI orchestration remains disabled; graph-grounded local response paths and fallbacks remain the safe baseline.",
      ownerAcknowledgementRequired: true
    },
    {
      id: "manual_feedback_only",
      label: "Feedback remains manual",
      category: "feedback",
      surfaces: ["Feedback Controls"],
      message: "Feedback intake is manual, redacted, and privacy-aware; no real feedback is collected by code in this step.",
      ownerAcknowledgementRequired: true
    },
    {
      id: "personalization_preview_safe",
      label: "Personalization remains preview-safe",
      category: "personalization",
      surfaces: ["Personalization Preview Panel", "Consent Controls"],
      message: "Personalization remains consent-aware and visible; hidden personalization and raw sensitive text storage remain disabled.",
      ownerAcknowledgementRequired: true
    },
    {
      id: "avoid_sensitive_information",
      label: "Users should not submit sensitive personal information",
      category: "privacy",
      surfaces: ["All"],
      message: "Limited soft launch guidance should ask participants not to submit sensitive personal information.",
      ownerAcknowledgementRequired: true
    },
    {
      id: "features_intentionally_limited",
      label: "Some features may be intentionally limited",
      category: "feature_scope",
      surfaces: ["All"],
      message: "Some features remain preview-safe or locally scoped until later production provider work is approved.",
      ownerAcknowledgementRequired: false
    },
    {
      id: "owner_manual_review_required",
      label: "Owner/manual review remains required",
      category: "owner_review",
      surfaces: ["All"],
      message: "Owner go/no-go review remains required before limited soft launch execution begins.",
      ownerAcknowledgementRequired: true
    }
  ];
}

export function createKnownLimitationNotice(): string {
  return getFinalSoftLaunchKnownLimitations()
    .map((limitation) => `${limitation.label}: ${limitation.message}`)
    .join("\n");
}

export function getKnownLimitationsBySurface(surface: string): TeoyubeFinalSoftLaunchKnownLimitation[] {
  return getFinalSoftLaunchKnownLimitations().filter((limitation) =>
    limitation.surfaces.includes("All") || limitation.surfaces.includes(surface)
  );
}

export function getKnownLimitationsByCategory(
  category: TeoyubeFinalSoftLaunchKnownLimitation["category"]
): TeoyubeFinalSoftLaunchKnownLimitation[] {
  return getFinalSoftLaunchKnownLimitations().filter((limitation) => limitation.category === category);
}

export function createKnownLimitationsReport() {
  const limitations = getFinalSoftLaunchKnownLimitations();

  return {
    valid: limitations.length > 0,
    limitationCount: limitations.length,
    ownerAcknowledgementRequiredCount: limitations.filter((entry) => entry.ownerAcknowledgementRequired).length,
    limitations,
    notice: createKnownLimitationNotice(),
    generatedAt: new Date().toISOString()
  };
}
