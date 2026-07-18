import { createPreviewDeploymentReadinessReport } from "./preview-deployment-readiness";
import { REQUIRED_LAUNCH_SURFACES, createLaunchSurfaceReadinessReport } from "./launch-surface-readiness-report";
import type {
  TeoyubeSoftLaunchCandidate,
  TeoyubeSoftLaunchChecklistItem,
  TeoyubeSoftLaunchDecision,
  TeoyubeSoftLaunchFeedbackPlan,
  TeoyubeSoftLaunchMonitoringPlan,
  TeoyubeSoftLaunchRollbackCriteria,
  TeoyubeSoftLaunchRisk,
  TeoyubeSoftLaunchScope,
  TeoyubeSoftLaunchSurface
} from "./soft-launch-candidate-contracts";

function idFor(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "_");
}

function checklist(id: string, label: string, complete: boolean, details: string, manualReviewRequired = true): TeoyubeSoftLaunchChecklistItem {
  return {
    id,
    label,
    required: true,
    complete,
    details,
    manualReviewRequired
  };
}

export function getSoftLaunchSurfaceScope(): TeoyubeSoftLaunchSurface[] {
  const routeReport = createLaunchSurfaceReadinessReport();

  return REQUIRED_LAUNCH_SURFACES.map((surface) => {
    const mapped = routeReport.surfaces.find((entry) => entry.surface === surface);
    return {
      id: idFor(surface),
      label: surface,
      route: mapped?.route,
      included: true,
      mobileFirstQaRequired: true,
      scriptureQaRequired: true,
      explanationQaRequired: true,
      fallbackQaRequired: true,
      consentQaRequired: surface.includes("Personalization") || surface.includes("Consent") || surface.includes("Feedback"),
      accessibilityQaRequired: true
    };
  });
}

export function getSoftLaunchFeedbackPlan(): TeoyubeSoftLaunchFeedbackPlan {
  return {
    collectionMode: "manual_only",
    channels: ["internal notes", "manual tester feedback", "private review checklist"],
    questions: [
      "Was the Scripture anchor clear and appropriate?",
      "Was the explanation path understandable?",
      "Did fallback or offline behavior remain safe?",
      "Were consent and privacy controls visible where needed?",
      "Did the mobile layout remain readable and usable?"
    ],
    privacyNotes: [
      "Do not collect raw sensitive journal text in this stage.",
      "Do not send feedback to analytics providers.",
      "Summarize issues manually before any later persistence step."
    ]
  };
}

export function getSoftLaunchMonitoringPlan(): TeoyubeSoftLaunchMonitoringPlan {
  return {
    monitoringMode: "manual_review_only",
    checks: [
      "Manual preview smoke check",
      "Manual route and surface review",
      "Manual mobile layout review",
      "Manual Scripture anchoring review",
      "Manual privacy and consent review"
    ],
    disabledUntilLater: [
      "external analytics",
      "production database persistence",
      "live AI orchestration",
      "service worker monitoring",
      "native mobile crash reporting"
    ]
  };
}

export function getSoftLaunchRollbackCriteria(): TeoyubeSoftLaunchRollbackCriteria {
  return {
    triggers: [
      "A usable TIG response is not Scripture anchored.",
      "Explanation path or confidence context is missing.",
      "Consent controls are unavailable where personalization appears.",
      "Preview route renders unsafe debug information.",
      "Mobile or accessibility review finds launch-critical blockers."
    ],
    steps: [
      "Stop sharing the preview URL.",
      "Disable affected surface or revert to last safe commit.",
      "Document the blocker in manual review notes.",
      "Run local launch smoke checks before retrying preview review."
    ]
  };
}

export function getSoftLaunchCandidateChecklist(): TeoyubeSoftLaunchChecklistItem[] {
  const preview = createPreviewDeploymentReadinessReport();
  const surfaces = createLaunchSurfaceReadinessReport();

  return [
    checklist("internal_preview_review", "Internal preview review planned", true, "Internal review is the first audience for the soft-launch candidate."),
    checklist("limited_user_preview_later", "Limited user-facing preview deferred", true, "Limited user preview is a later manual step after internal review."),
    checklist("preview_deployment_readiness", "Preview deployment readiness exists", preview.ready, "Preview deployment readiness report is available."),
    checklist("surface_by_surface_validation", "Surface-by-surface validation planned", surfaces.surfaceCount >= 12, "All launch-critical surfaces are included in the soft-launch scope."),
    checklist("mobile_first_qa", "Mobile-first QA planned", true, "Mobile layout remains a required manual review dimension."),
    checklist("scripture_qa", "Scripture anchoring QA planned", true, "Every usable response must be checked for Scripture anchoring."),
    checklist("explanation_qa", "Explanation path QA planned", true, "Every production recommendation should be explainable."),
    checklist("fallback_offline_qa", "Fallback and offline QA planned", true, "Fallback and offline-safe behavior remain required."),
    checklist("consent_feedback_qa", "Consent and feedback QA planned", true, "Consent and feedback controls remain part of manual review."),
    checklist("accessibility_qa", "Accessibility QA planned", true, "Basic accessibility checks remain required before sharing."),
    checklist("privacy_review", "Privacy review planned", true, "No raw sensitive text storage, external analytics, or hidden personalization is allowed."),
    checklist("manual_feedback_collection", "Manual feedback collection plan exists", true, "Feedback remains manual-only in this stage."),
    checklist("rollback_criteria", "Rollback criteria documented", true, "Rollback triggers and steps are documented.")
  ];
}

export function createSoftLaunchCandidatePlan(): TeoyubeSoftLaunchCandidate {
  const checklistItems = getSoftLaunchCandidateChecklist();
  const blockers = checklistItems.filter((entry) => !entry.complete);

  return {
    id: "soft_launch_candidate_1_5",
    label: "Production Launch Preparation 1.5 Soft Launch Candidate",
    status: blockers.length ? "blocked" : "ready_after_manual_review",
    scope: {
      id: "internal_preview_first",
      label: "Internal Preview First",
      audience: "internal_review",
      notes: [
        "This plan does not create cohorts.",
        "This plan does not collect real user data.",
        "Limited public sharing should wait for preview deployment execution review."
      ]
    } satisfies TeoyubeSoftLaunchScope,
    surfaces: getSoftLaunchSurfaceScope(),
    checklist: checklistItems,
    risks: [
      {
        id: "manual_qa_pending",
        label: "Manual QA pending",
        severity: "medium",
        mitigation: "Complete preview manual review before public sharing."
      },
      {
        id: "providers_disconnected",
        label: "Production providers disconnected",
        severity: "low",
        mitigation: "Keep providers disconnected until a later guarded launch step."
      }
    ],
    feedbackPlan: getSoftLaunchFeedbackPlan(),
    monitoringPlan: getSoftLaunchMonitoringPlan(),
    rollbackCriteria: getSoftLaunchRollbackCriteria(),
    generatedAt: new Date().toISOString()
  };
}

export function createSoftLaunchCandidateDecision(
  candidate: TeoyubeSoftLaunchCandidate = createSoftLaunchCandidatePlan()
): TeoyubeSoftLaunchDecision {
  const incomplete = candidate.checklist.filter((entry) => entry.required && !entry.complete);

  if (incomplete.some((entry) => entry.id.includes("preview"))) {
    return "needs_preview_deployment_first";
  }
  if (incomplete.some((entry) => entry.id.includes("qa") || entry.id.includes("surface"))) {
    return "needs_qa_fix";
  }
  if (incomplete.length > 0 || candidate.status === "blocked") {
    return "blocked";
  }

  return candidate.status === "ready" ? "ready_for_soft_launch_candidate" : "ready_after_manual_review";
}

export function createSoftLaunchCandidateReadinessReport() {
  const candidate = createSoftLaunchCandidatePlan();
  const decision = createSoftLaunchCandidateDecision(candidate);

  return {
    status: candidate.status,
    decision,
    ready: decision === "ready_for_soft_launch_candidate" || decision === "ready_after_manual_review",
    checklistCount: candidate.checklist.length,
    completeChecklistCount: candidate.checklist.filter((entry) => entry.complete).length,
    surfaceCount: candidate.surfaces.length,
    risks: candidate.risks,
    candidate,
    generatedAt: new Date().toISOString()
  };
}

