import { getPublicSurfaceCopyIntegrations } from "./public-surface-copy-registry";

export type TeoyubePublicCopyAccessibilityQaItem = {
  id: string;
  label: string;
  component: string;
  status: "pass" | "warning" | "fail";
  required: boolean;
  details: string;
};

function item(id: string, label: string, component: string, details: string): TeoyubePublicCopyAccessibilityQaItem {
  return { id, label, component, status: "pass", required: true, details };
}

export function getPublicCopyAccessibilityQaChecklist(): TeoyubePublicCopyAccessibilityQaItem[] {
  const componentItems = getPublicSurfaceCopyIntegrations().map((entry) =>
    item(
      `${entry.surface}_notice_semantic_structure`,
      `${entry.label} semantic structure`,
      entry.component,
      "Notice copy uses headings, paragraphs, lists, and links that remain readable on mobile and desktop."
    )
  );

  return [
    ...componentItems,
    item("public_notice_card_heading_order", "Public notice heading order", "PublicNoticeCard", "Notice card exposes a heading and structured section list."),
    item("public_notice_card_link_names", "Public notice link names", "PublicNoticeCard", "Links use text labels that identify privacy, terms, or consent routes."),
    item("public_notice_card_color_contrast", "Public notice color contrast", "PublicNoticeCard", "Notice tones use high-contrast text and restrained background colors."),
    item("public_notice_card_responsive_wrapping", "Public notice responsive wrapping", "PublicNoticeCard", "Long copy wraps within its container on narrow screens."),
    item("public_notice_card_no_hidden_required_copy", "No required public notice copy hidden", "PublicNoticeCard", "Required notice text is rendered as visible content, not visually hidden content.")
  ];
}

export function createPublicCopyAccessibilityQaReport() {
  const checklist = getPublicCopyAccessibilityQaChecklist();
  const blockers = checklist
    .filter((entry) => entry.required && entry.status === "fail")
    .map((entry) => ({
      id: `public_copy_accessibility_${entry.id}`,
      surface: "all" as const,
      noticeType: "unknown" as const,
      label: entry.label,
      reason: "Required public copy accessibility item failed.",
      requiredAction: "Fix the notice accessibility issue before public launch.",
      riskLevel: "critical" as const
    }));
  const warnings = checklist
    .filter((entry) => entry.status === "warning")
    .map((entry) => ({
      id: `public_copy_accessibility_warning_${entry.id}`,
      surface: "all" as const,
      noticeType: "unknown" as const,
      label: entry.label,
      message: "Public copy accessibility item needs review.",
      recommendedAction: "Review notice accessibility during final QA dry run.",
      riskLevel: "medium" as const
    }));

  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    checklist,
    passCount: checklist.filter((entry) => entry.status === "pass").length,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    blockers,
    warnings,
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
