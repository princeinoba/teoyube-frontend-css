export type TeoyubeLimitedSoftLaunchIssueResponse = {
  id: string;
  label: string;
  severity: "low" | "medium" | "high" | "critical";
  trigger: string;
  response: string;
  pauseRecommended: boolean;
  rollbackRecommended: boolean;
};

export type TeoyubeLimitedSoftLaunchSupportResponseReport = {
  valid: boolean;
  supportPlan: string[];
  issueResponsePlan: TeoyubeLimitedSoftLaunchIssueResponse[];
  pauseCriteria: string[];
  rollbackCriteria: string[];
  noSupportMessagesSent: true;
  noMonitoringConnected: true;
  blockers: string[];
  warnings: string[];
  generatedAt: string;
};

export function getLimitedSoftLaunchSupportPlan(): string[] {
  return [
    "Owner reviews all launch-critical issues.",
    "Scripture, explanation, fallback, consent, privacy, mobile, and accessibility concerns receive same-day review.",
    "Support communication remains manual and unsent by code.",
    "No production monitoring provider is connected in this step."
  ];
}

export function getLimitedSoftLaunchIssueResponsePlan(): TeoyubeLimitedSoftLaunchIssueResponse[] {
  return [
    { id: "app_does_not_load", label: "App does not load", severity: "critical", trigger: "Preview app unavailable.", response: "Pause sharing and verify deployment/provider state manually.", pauseRecommended: true, rollbackRecommended: true },
    { id: "scripture_anchor_missing", label: "Scripture anchor missing", severity: "critical", trigger: "Response lacks Scripture anchor.", response: "Pause affected surface and restore Scripture anchoring.", pauseRecommended: true, rollbackRecommended: true },
    { id: "explanation_path_missing", label: "Explanation path missing", severity: "high", trigger: "User cannot see why response was selected.", response: "Pause affected feature and restore explanation path.", pauseRecommended: true, rollbackRecommended: false },
    { id: "unsafe_fallback", label: "Unsafe fallback", severity: "critical", trigger: "Fallback is empty, unsafe, or not Scripture-aware.", response: "Rollback fallback path and restore safe fallback.", pauseRecommended: true, rollbackRecommended: true },
    { id: "consent_controls_missing", label: "Consent controls missing", severity: "critical", trigger: "Personalization appears without consent controls.", response: "Disable personalization surfaces until consent controls are restored.", pauseRecommended: true, rollbackRecommended: true },
    { id: "debug_payload_exposed", label: "Debug payload exposed", severity: "critical", trigger: "Debug/internal payload appears to normal users.", response: "Stop sharing preview and hide debug output.", pauseRecommended: true, rollbackRecommended: true },
    { id: "mobile_blocker", label: "Mobile blocker", severity: "high", trigger: "Key flow unusable on mobile.", response: "Pause wider sharing and fix responsive layout.", pauseRecommended: true, rollbackRecommended: false },
    { id: "accessibility_blocker", label: "Accessibility blocker", severity: "high", trigger: "Keyboard, semantic, contrast, or focus blocker.", response: "Pause affected surface and fix accessibility issue.", pauseRecommended: true, rollbackRecommended: false },
    { id: "privacy_concern", label: "Privacy concern", severity: "critical", trigger: "User reports privacy or data concern.", response: "Stop collection, redact notes, and escalate owner review.", pauseRecommended: true, rollbackRecommended: true },
    { id: "confusing_spiritual_guidance", label: "Confusing spiritual guidance", severity: "high", trigger: "Guidance feels unclear, overcertain, or pastorally unsafe.", response: "Review theology/content and fallback language before continuing.", pauseRecommended: true, rollbackRecommended: false },
    { id: "sensitive_information_reported", label: "Sensitive information reported", severity: "critical", trigger: "User submits sensitive personal information.", response: "Do not store raw text; redact and route to owner privacy review.", pauseRecommended: true, rollbackRecommended: true }
  ];
}

export function getLimitedSoftLaunchPauseCriteria(): string[] {
  return getLimitedSoftLaunchIssueResponsePlan()
    .filter((entry) => entry.pauseRecommended)
    .map((entry) => entry.label);
}

export function getLimitedSoftLaunchRollbackCriteria(): string[] {
  return getLimitedSoftLaunchIssueResponsePlan()
    .filter((entry) => entry.rollbackRecommended)
    .map((entry) => entry.label);
}

export function createLimitedSoftLaunchSupportResponseReport(): TeoyubeLimitedSoftLaunchSupportResponseReport {
  const issueResponsePlan = getLimitedSoftLaunchIssueResponsePlan();
  const blockers = [
    issueResponsePlan.length ? "" : "Issue response plan is missing.",
    getLimitedSoftLaunchPauseCriteria().length ? "" : "Pause criteria are missing.",
    getLimitedSoftLaunchRollbackCriteria().length ? "" : "Rollback criteria are missing."
  ].filter(Boolean);

  return {
    valid: blockers.length === 0,
    supportPlan: getLimitedSoftLaunchSupportPlan(),
    issueResponsePlan,
    pauseCriteria: getLimitedSoftLaunchPauseCriteria(),
    rollbackCriteria: getLimitedSoftLaunchRollbackCriteria(),
    noSupportMessagesSent: true,
    noMonitoringConnected: true,
    blockers,
    warnings: ["Support and monitoring actions remain manual; this module sends no communications."],
    generatedAt: new Date().toISOString()
  };
}
