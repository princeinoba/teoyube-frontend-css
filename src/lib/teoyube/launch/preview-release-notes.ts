export type TeoyubePreviewReleaseNotes = {
  title: string;
  summary: string;
  knownLimitations: string[];
  safetyNotes: string[];
  manualReviewNotes: string[];
  nextSteps: string[];
  generatedAt: string;
};

export function getPreviewReleaseSummary(): string {
  return "Teoyube is structurally ready for preview deployment review. The preview candidate remains Scripture-anchored, explainable, fallback-safe, consent-aware, and provider-disconnected.";
}

export function getPreviewKnownLimitations(): string[] {
  return [
    "Production database persistence is not connected.",
    "External analytics providers are not connected.",
    "Live AI orchestration is not enabled.",
    "Service workers and native mobile app builds are not included.",
    "Preview deployment has not been executed yet.",
    "Manual mobile and accessibility QA should be completed before public sharing."
  ];
}

export function getPreviewSafetyNotes(): string[] {
  return [
    "Every usable TIG response must remain Scripture anchored.",
    "Explanation paths and confidence labels remain required.",
    "Fallback paths remain enabled.",
    "Personalization remains preview-safe, consent-aware, visible, and reversible.",
    "Raw sensitive personalization text storage remains disabled.",
    "Debug UI must remain hidden from public preview users."
  ];
}

export function getPreviewManualReviewNotes(): string[] {
  return [
    "Run available local checks before creating a preview deployment.",
    "Review all launch-critical surfaces on mobile and desktop.",
    "Confirm fallback, offline, consent, and safe error states.",
    "Confirm no real secrets are present in preview environment configuration.",
    "Record any manual review concerns before proceeding to the execution checklist."
  ];
}

export function getPreviewNextSteps(): string[] {
  return [
    "Proceed to Production Launch Preparation 1.9 - Final Launch Preparation Audit.",
    "Choose and review the preview deployment provider target.",
    "Run final available build, smoke, and manual QA checks.",
    "Only then perform a controlled preview deployment in a later step."
  ];
}

export function createPreviewReleaseNotes(): TeoyubePreviewReleaseNotes {
  return {
    title: "Teoyube Preview Deployment Readiness Notes",
    summary: getPreviewReleaseSummary(),
    knownLimitations: getPreviewKnownLimitations(),
    safetyNotes: getPreviewSafetyNotes(),
    manualReviewNotes: getPreviewManualReviewNotes(),
    nextSteps: getPreviewNextSteps(),
    generatedAt: new Date().toISOString()
  };
}
