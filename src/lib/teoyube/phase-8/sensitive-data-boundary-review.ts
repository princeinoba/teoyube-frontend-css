export type TeoyubeSensitiveDataBoundaryInput = Partial<{
  sensitiveWarningsVisible: boolean;
  rawSensitiveTextStored: boolean;
  manualFeedbackSanitized: boolean;
  supportBoundaryClear: boolean;
  hiddenSensitiveInference: boolean;
  sensitiveBrowserPersistence: boolean;
  professionalAdviceProvided: boolean;
}>;

export type TeoyubeSensitiveDataBoundaryReviewReport = {
  valid: boolean;
  checklist: Array<{ id: string; passed: boolean; details: string }>;
  blockers: string[];
  warnings: string[];
  noRawSensitiveTextStorage: true;
  noHiddenSensitiveInference: true;
  noSensitiveBrowserPersistence: true;
  noProfessionalAdviceProvided: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function flag(value: boolean | undefined): boolean {
  return value !== false;
}

export function createSensitiveDataBoundaryChecklist(input: TeoyubeSensitiveDataBoundaryInput = {}) {
  return [
    { id: "sensitive_data_warnings", passed: validateSensitiveDataWarnings(input), details: "Sensitive information warnings are visible or explicitly planned." },
    { id: "no_raw_sensitive_text_storage", passed: validateNoRawSensitiveTextStorage(input), details: "Raw sensitive text is not stored by default." },
    { id: "manual_feedback_sanitization", passed: validateManualFeedbackSanitization(input), details: "Manual feedback is redacted, minimized, or flagged before use." },
    { id: "support_boundary", passed: validateSupportBoundaryForSensitiveContent(input), details: "Support boundaries avoid medical, legal, financial, emergency, or professional counseling advice." },
    { id: "no_hidden_sensitive_inference", passed: validateNoHiddenSensitiveInference(input), details: "No hidden sensitive attribute inference is introduced." },
    { id: "no_sensitive_browser_persistence", passed: validateNoSensitiveBrowserPersistence(input), details: "No sensitive data is placed in localStorage, cookies, or IndexedDB." }
  ];
}

export function validateSensitiveDataWarnings(input: TeoyubeSensitiveDataBoundaryInput = {}): boolean {
  return flag(input.sensitiveWarningsVisible);
}

export function validateNoRawSensitiveTextStorage(input: TeoyubeSensitiveDataBoundaryInput = {}): boolean {
  return !input.rawSensitiveTextStored;
}

export function validateManualFeedbackSanitization(input: TeoyubeSensitiveDataBoundaryInput = {}): boolean {
  return flag(input.manualFeedbackSanitized);
}

export function validateSupportBoundaryForSensitiveContent(input: TeoyubeSensitiveDataBoundaryInput = {}): boolean {
  return flag(input.supportBoundaryClear) && !input.professionalAdviceProvided;
}

export function validateNoHiddenSensitiveInference(input: TeoyubeSensitiveDataBoundaryInput = {}): boolean {
  return !input.hiddenSensitiveInference;
}

export function validateNoSensitiveBrowserPersistence(input: TeoyubeSensitiveDataBoundaryInput = {}): boolean {
  return !input.sensitiveBrowserPersistence;
}

export function getSensitiveDataBoundaryBlockers(input: TeoyubeSensitiveDataBoundaryInput = {}): string[] {
  return createSensitiveDataBoundaryChecklist(input)
    .filter((entry) => !entry.passed)
    .map((entry) => `${entry.id}: ${entry.details}`);
}

export function getSensitiveDataBoundaryWarnings(input: TeoyubeSensitiveDataBoundaryInput = {}): string[] {
  return [
    "Sensitive data review is manual and in-memory; no feedback storage is enabled.",
    ...(!input.manualFeedbackSanitized ? ["Manual feedback must be redacted or minimized before future use."] : [])
  ];
}

export function createSensitiveDataBoundaryReviewReport(input: TeoyubeSensitiveDataBoundaryInput = {}): TeoyubeSensitiveDataBoundaryReviewReport {
  const blockers = getSensitiveDataBoundaryBlockers(input);
  return {
    valid: blockers.length === 0,
    checklist: createSensitiveDataBoundaryChecklist(input),
    blockers,
    warnings: getSensitiveDataBoundaryWarnings(input),
    noRawSensitiveTextStorage: true,
    noHiddenSensitiveInference: true,
    noSensitiveBrowserPersistence: true,
    noProfessionalAdviceProvided: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
