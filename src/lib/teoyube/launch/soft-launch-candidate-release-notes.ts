export function getSoftLaunchCandidateSummary(): string {
  return "Teoyube is a soft launch candidate after manual preview re-check, regression verification, and safety review. This is not a full public production launch.";
}

export function getSoftLaunchCandidateKnownLimitations(): string[] {
  return [
    "Production database persistence is not connected.",
    "External analytics are not connected.",
    "Live AI orchestration is not enabled.",
    "Feedback collection is manual when soft launch begins.",
    "Users should not submit sensitive personal information.",
    "Production monitoring providers are not connected."
  ];
}

export function getSoftLaunchCandidateSafetyNotes(): string[] {
  return [
    "Scripture anchors and explanation paths should remain visible.",
    "Fallback paths are enabled.",
    "Personalization remains consent-aware and preview-safe.",
    "Confidence labels must remain bounded and should not claim certainty.",
    "Consent and privacy controls remain launch-critical."
  ];
}

export function getSoftLaunchCandidateFeedbackInstructions(): string[] {
  return [
    "Collect feedback manually when soft launch begins.",
    "Do not store raw sensitive personal text.",
    "Summarize issues before any later persistence step.",
    "Escalate Scripture, explanation, fallback, consent, privacy, mobile, or accessibility issues immediately."
  ];
}

export function getSoftLaunchCandidateNextSteps(): string[] {
  return [
    "Soft Launch Preparation 3.1 - Limited Soft Launch Execution Plan is complete.",
    "Soft Launch Preparation 3.2 - Soft Launch Dry Run & Owner Review is complete.",
    "Prepare Soft Launch Preparation 3.3 - Final Soft Launch Readiness Package & Go/No-Go.",
    "Confirm owner approval before contacting any real users.",
    "Keep production persistence, external analytics, and live AI orchestration disabled until later guarded steps.",
    "Run final command checks and manual QA before any limited sharing."
  ];
}

export function createSoftLaunchCandidateReleaseNotes() {
  return {
    title: "Teoyube Soft Launch Candidate Notes",
    summary: getSoftLaunchCandidateSummary(),
    knownLimitations: getSoftLaunchCandidateKnownLimitations(),
    safetyNotes: getSoftLaunchCandidateSafetyNotes(),
    feedbackInstructions: getSoftLaunchCandidateFeedbackInstructions(),
    nextSteps: getSoftLaunchCandidateNextSteps(),
    messagesSent: false,
    usersContacted: false,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
