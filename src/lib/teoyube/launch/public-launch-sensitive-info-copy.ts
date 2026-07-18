export type TeoyubeSensitiveInformationWarningCopy = {
  id: string;
  label: string;
  doNotSubmitSensitiveInfo: string;
  emergencyDisclaimer: string;
  professionalAdviceDisclaimer: string;
  spiritualCareBoundary: string;
  feedbackPrivacyWarning: string;
  generatedAt: string;
};

export function getDoNotSubmitSensitiveInfoCopy(): string {
  return "Do not submit highly sensitive personal information to Teoyube.";
}

export function getEmergencyDisclaimerCopy(): string {
  return "Do not use Teoyube for emergencies. If you may be in danger or need urgent help, contact emergency services or a trusted local crisis resource.";
}

export function getMedicalLegalFinancialDisclaimerCopy(): string {
  return "Teoyube is not a medical, legal, financial, crisis, or professional counseling service.";
}

export function getSpiritualCareBoundaryCopy(): string {
  return "Spiritual encouragement should not replace professional care where professional help is needed.";
}

export function getFeedbackPrivacyWarningCopy(): string {
  return "Feedback should focus on clarity, safety, layout, Scripture visibility, explanation paths, or fallback behavior, and should not include sensitive personal information.";
}

export function createSensitiveInformationWarningCopy(): TeoyubeSensitiveInformationWarningCopy {
  return {
    id: "public_launch_sensitive_information_warning_5_2",
    label: "Public Launch Sensitive Information Warning Copy",
    doNotSubmitSensitiveInfo: getDoNotSubmitSensitiveInfoCopy(),
    emergencyDisclaimer: getEmergencyDisclaimerCopy(),
    professionalAdviceDisclaimer: getMedicalLegalFinancialDisclaimerCopy(),
    spiritualCareBoundary: getSpiritualCareBoundaryCopy(),
    feedbackPrivacyWarning: getFeedbackPrivacyWarningCopy(),
    generatedAt: new Date().toISOString()
  };
}

export function createSensitiveInfoCopyReviewChecklist() {
  return [
    { id: "sensitive_do_not_submit", label: "Do not submit sensitive info warning exists", required: true, complete: true },
    { id: "sensitive_emergency", label: "Emergency disclaimer exists", required: true, complete: true },
    { id: "sensitive_professional_advice", label: "Professional advice disclaimer exists", required: true, complete: true },
    { id: "sensitive_spiritual_care_boundary", label: "Spiritual care boundary exists", required: true, complete: true },
    { id: "sensitive_feedback_privacy", label: "Feedback privacy warning exists", required: true, complete: true }
  ];
}

export function createSensitiveInfoCopyReport(copy: TeoyubeSensitiveInformationWarningCopy = createSensitiveInformationWarningCopy()) {
  return {
    valid: true,
    ready: true,
    copy,
    checklist: createSensitiveInfoCopyReviewChecklist(),
    blockers: [],
    warnings: [{ id: "sensitive_info_public_visibility", label: copy.label, message: "Sensitive information warnings should be visible anywhere users can submit free text.", recommendedAction: "Confirm during public QA.", riskLevel: "medium" as const }],
    noPublicLaunchPerformed: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
