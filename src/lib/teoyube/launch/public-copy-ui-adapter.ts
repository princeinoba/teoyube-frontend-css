import { createAiTigTransparencyCopy } from "./public-launch-ai-tig-transparency-copy";
import { createPublicLaunchConsentCopy } from "./public-launch-consent-copy";
import { createPublicFeedbackNoticeCopy } from "./public-launch-feedback-notice-copy";
import { getPublicLaunchKnownLimitations } from "./public-launch-known-limitations";
import type { TeoyubePublicNoticeType } from "./public-launch-privacy-consent-contracts";
import { createPublicLaunchPrivacyNoticeDraft } from "./public-launch-privacy-notice-copy";
import { createSensitiveInformationWarningCopy } from "./public-launch-sensitive-info-copy";
import { createPublicLaunchTermsDraft } from "./public-launch-terms-copy";
import type { TeoyubePublicLaunchQaSurface } from "./public-launch-qa-contracts";
import { getPublicSurfaceCopyIntegrations } from "./public-surface-copy-registry";

export type TeoyubePublicNoticeTone = "info" | "warning" | "legal" | "safety";

export type TeoyubePublicNoticeCardProps = {
  id: string;
  noticeType: TeoyubePublicNoticeType;
  title: string;
  summary: string;
  sections: string[];
  links: Array<{ label: string; href: string }>;
  tone: TeoyubePublicNoticeTone;
  draftOnly: true;
  notLegalAdvice: boolean;
  noExternalWrite: true;
};

function card(
  noticeType: TeoyubePublicNoticeType,
  title: string,
  summary: string,
  sections: string[],
  tone: TeoyubePublicNoticeTone,
  links: Array<{ label: string; href: string }> = []
): TeoyubePublicNoticeCardProps {
  return {
    id: `public_notice_${noticeType}_5_3`,
    noticeType,
    title,
    summary,
    sections,
    links,
    tone,
    draftOnly: true,
    notLegalAdvice: noticeType === "privacy_notice" || noticeType === "terms_of_use",
    noExternalWrite: true
  };
}

export function createPublicNoticeCardProps(noticeType: TeoyubePublicNoticeType): TeoyubePublicNoticeCardProps {
  const privacy = createPublicLaunchPrivacyNoticeDraft();
  const terms = createPublicLaunchTermsDraft();
  const consent = createPublicLaunchConsentCopy();
  const ai = createAiTigTransparencyCopy();
  const sensitive = createSensitiveInformationWarningCopy();
  const feedback = createPublicFeedbackNoticeCopy();

  if (noticeType === "privacy_notice") {
    return card(
      noticeType,
      "Privacy Notice",
      privacy.dataUseSummary,
      privacy.sections,
      "legal",
      [
        { label: "Terms", href: "/terms" },
        { label: "Consent", href: "/consent" }
      ]
    );
  }

  if (noticeType === "terms_of_use") {
    return card(
      noticeType,
      "Terms of Use",
      terms.sections[0],
      terms.sections,
      "legal",
      [
        { label: "Privacy", href: "/privacy" },
        { label: "Consent", href: "/consent" }
      ]
    );
  }

  if (noticeType === "consent_notice") {
    return card(
      noticeType,
      "Consent & Personalization",
      consent.personalizationConsent,
      [
        consent.personalizationConsent,
        consent.sessionOnlyConsent,
        consent.disablePersonalization,
        consent.resetExportDelete
      ],
      "info",
      [{ label: "Privacy", href: "/privacy" }]
    );
  }

  if (noticeType === "personalization_notice") {
    return card(
      noticeType,
      "Personalization Notice",
      consent.personalizationConsent,
      [
        consent.personalizationConsent,
        consent.sessionOnlyConsent,
        "Personalization stays visible, reversible, and consent-aware.",
        consent.analyticsConsentPlaceholder,
        consent.persistenceConsentPlaceholder
      ],
      "info",
      [{ label: "Consent", href: "/consent" }]
    );
  }

  if (noticeType === "feedback_notice") {
    return card(
      noticeType,
      "Feedback Notice",
      feedback.feedbackUse,
      [
        feedback.feedbackUse,
        feedback.manualFeedback,
        feedback.feedbackPrivacy,
        feedback.notPersonalizationByDefault,
        feedback.feedbackReview
      ],
      "info"
    );
  }

  if (noticeType === "ai_notice") {
    return card(
      noticeType,
      "AI/TIG Transparency",
      ai.tigExplanation,
      [
        ai.tigExplanation,
        ai.scriptureAnchoring,
        ai.confidenceLabel,
        ai.fallbackExplanation,
        ai.liveAiNotEnabled
      ],
      "info"
    );
  }

  if (noticeType === "scripture_explanation_notice") {
    return card(
      noticeType,
      "Scripture Explanation Notice",
      ai.scriptureAnchoring,
      [ai.scriptureAnchoring, ai.confidenceLabel, ai.fallbackExplanation],
      "safety"
    );
  }

  if (noticeType === "sensitive_information_warning") {
    return card(
      noticeType,
      "Sensitive Information Warning",
      sensitive.doNotSubmitSensitiveInfo,
      [
        sensitive.doNotSubmitSensitiveInfo,
        sensitive.emergencyDisclaimer,
        sensitive.professionalAdviceDisclaimer,
        sensitive.spiritualCareBoundary,
        sensitive.feedbackPrivacyWarning
      ],
      "warning"
    );
  }

  if (noticeType === "public_launch_limitation_notice") {
    return createPublicLaunchLimitationsNoticeProps();
  }

  return card(
    "unknown",
    "Public Notice",
    "Public launch copy is still under review.",
    ["This notice is a placeholder for owner review and does not launch Teoyube."],
    "warning"
  );
}

export function createPublicLaunchLimitationsNoticeProps(): TeoyubePublicNoticeCardProps {
  const limitations = getPublicLaunchKnownLimitations();
  return card(
    "public_launch_limitation_notice",
    "Known Launch Limitations",
    "Some production services remain disconnected until later explicit review.",
    limitations.map((entry) => entry.message),
    "warning",
    [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" }
    ]
  );
}

export function getPublicNoticeCardPropsForSurface(surface: TeoyubePublicLaunchQaSurface): TeoyubePublicNoticeCardProps[] {
  const noticeTypes = Array.from(
    new Set(
      getPublicSurfaceCopyIntegrations()
        .filter((entry) => entry.surface === surface)
        .flatMap((entry) => entry.requirements.map((requirement) => requirement.noticeType))
    )
  );

  return noticeTypes.map(createPublicNoticeCardProps);
}

export function createPublicCopyUiAdapterReport() {
  const integrations = getPublicSurfaceCopyIntegrations();
  const adaptedNoticeTypes = Array.from(new Set(integrations.flatMap((entry) => entry.requirements.map((requirement) => requirement.noticeType))));
  return {
    valid: adaptedNoticeTypes.length >= 8,
    ready: adaptedNoticeTypes.length >= 8,
    adaptedNoticeTypes,
    integrationCount: integrations.length,
    componentContract: "TeoyubePublicNoticeCardProps" as const,
    draftOnly: true,
    notLegalAdvice: true,
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
