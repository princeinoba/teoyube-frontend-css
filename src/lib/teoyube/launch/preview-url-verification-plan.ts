export type TeoyubePreviewUrlVerificationState = {
  previewUrl?: string;
  sharedPreview?: boolean;
  intentionallyProductionDomain?: boolean;
  documentedForManualQa?: boolean;
  hardcodedIntoAppLogic?: boolean;
};

export type TeoyubePreviewUrlVerificationItem = {
  id: string;
  label: string;
  required: boolean;
  passed: boolean;
  details: string;
};

function item(id: string, label: string, passed: boolean, details: string): TeoyubePreviewUrlVerificationItem {
  return {
    id,
    label,
    required: true,
    passed,
    details
  };
}

function isSecretLike(value: string): boolean {
  return /(token|secret|password|key|sk-|private)/i.test(value);
}

function isProductionDomain(value: string): boolean {
  return /teoyube\.com/i.test(value) && !/preview|staging|vercel|netlify|render|railway/i.test(value);
}

export function getPreviewUrlVerificationChecklist(
  state: TeoyubePreviewUrlVerificationState = {}
): TeoyubePreviewUrlVerificationItem[] {
  const url = state.previewUrl || "";

  return [
    item("url_exists", "Preview URL exists", Boolean(url), "Preview URL should be entered manually after deployment."),
    item("https_for_shared_preview", "HTTPS for shared preview", !state.sharedPreview || url.startsWith("https://"), "Shared preview URLs should use HTTPS."),
    item("url_not_secret", "Preview URL is not secret-like", !url || !isSecretLike(url), "Preview URL must not contain tokens or secret-looking values."),
    item("not_production_domain", "Preview URL is not production domain unless intentional", !url || !isProductionDomain(url) || state.intentionallyProductionDomain === true, "Do not use production domain unless intentionally configured."),
    item("documented_for_manual_qa", "Preview URL documented for manual QA", state.documentedForManualQa !== false, "Record the URL in manual QA notes, not app logic."),
    item("not_hardcoded", "Preview URL not hardcoded into app logic", !state.hardcodedIntoAppLogic, "Do not hardcode preview URLs into source.")
  ];
}

export function createPreviewUrlVerificationPlan(previewUrl?: string) {
  const state: TeoyubePreviewUrlVerificationState = { previewUrl };

  return {
    id: "preview_url_verification_plan",
    label: "Preview URL Verification Plan",
    previewUrlProvided: Boolean(previewUrl),
    checklist: getPreviewUrlVerificationChecklist(state),
    notes: [
      "This plan does not fetch the preview URL.",
      "This plan does not deploy.",
      "This plan does not write the preview URL to persistent storage."
    ],
    generatedAt: new Date().toISOString()
  };
}

export function getPreviewUrlVerificationBlockers(state: TeoyubePreviewUrlVerificationState = {}): string[] {
  return getPreviewUrlVerificationChecklist(state)
    .filter((entry) => !entry.passed)
    .map((entry) => `${entry.label}: ${entry.details}`);
}

export function getPreviewUrlVerificationWarnings(state: TeoyubePreviewUrlVerificationState = {}): string[] {
  return [
    state.previewUrl ? "" : "Preview URL can only be validated after manual deployment creates one.",
    "Do not fetch, persist, or hardcode preview URLs from this module."
  ].filter(Boolean);
}

export function validatePreviewUrlVerificationState(state: TeoyubePreviewUrlVerificationState = {}) {
  const blockers = getPreviewUrlVerificationBlockers(state);

  return {
    valid: blockers.length === 0,
    status: blockers.length ? "needs_review" : "ready",
    blockers,
    warnings: getPreviewUrlVerificationWarnings(state)
  };
}

export function createPreviewUrlVerificationReport(state: TeoyubePreviewUrlVerificationState = {}) {
  const checklist = getPreviewUrlVerificationChecklist(state);
  const validation = validatePreviewUrlVerificationState(state);

  return {
    ...validation,
    checklist,
    checkCount: checklist.length,
    previewUrlProvided: Boolean(state.previewUrl),
    generatedAt: new Date().toISOString()
  };
}

