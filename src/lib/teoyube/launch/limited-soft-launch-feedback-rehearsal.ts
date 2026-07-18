import type { TeoyubeLimitedSoftLaunchFeedbackCategory } from "./limited-soft-launch-feedback-workflow";
import { createLimitedSoftLaunchFeedbackWorkflowReport } from "./limited-soft-launch-feedback-workflow";

export type TeoyubeLimitedSoftLaunchFeedbackRehearsalItem = {
  id: string;
  category: TeoyubeLimitedSoftLaunchFeedbackCategory;
  summary: string;
  sanitized: boolean;
  sampleOnly: true;
  launchCritical: boolean;
};

export type TeoyubeLimitedSoftLaunchFeedbackRehearsal = {
  id: string;
  label: string;
  items: TeoyubeLimitedSoftLaunchFeedbackRehearsalItem[];
  sampleOnly: true;
  manualOnly: true;
  realFeedbackCollected: false;
  rawSensitiveTextStoredByDefault: false;
  databaseWritten: false;
  analyticsSent: false;
  hiddenPersonalizationCreated: false;
  generatedAt: string;
};

export type TeoyubeLimitedSoftLaunchFeedbackRehearsalReport = {
  valid: boolean;
  run: TeoyubeLimitedSoftLaunchFeedbackRehearsal;
  itemCount: number;
  launchCriticalSampleCount: number;
  blockers: string[];
  warnings: string[];
  sampleFeedbackOnly: true;
  noRawSensitiveTextStorage: true;
  noExternalSending: true;
  noDatabaseWrites: true;
  noHiddenPersonalization: true;
  generatedAt: string;
};

function item(
  id: string,
  category: TeoyubeLimitedSoftLaunchFeedbackCategory,
  summary: string,
  launchCritical = false
): TeoyubeLimitedSoftLaunchFeedbackRehearsalItem {
  return { id, category, summary, sanitized: true, sampleOnly: true, launchCritical };
}

export function getDefaultFeedbackRehearsalItems(): TeoyubeLimitedSoftLaunchFeedbackRehearsalItem[] {
  return [
    item("sample_scripture_helpful", "positive_feedback", "Sample user says the Scripture was helpful."),
    item("sample_explanation_confusing", "explanation_path_issue", "Sample user says the explanation path is confusing.", true),
    item("sample_mobile_layout_issue", "mobile_accessibility_issue", "Sample user reports a mobile layout issue.", true),
    item("sample_consent_confusion", "consent_issue", "Sample user reports consent control confusion.", true),
    item("sample_fallback_unclear", "fallback_issue", "Sample user reports fallback did not feel clear.", true),
    item("sample_privacy_concern", "privacy_concern", "Sample user reports a privacy concern.", true),
    item("sample_personalization_tracking_question", "privacy_concern", "Sample user asks whether personalization is tracking them.", true)
  ];
}

export function createFeedbackIntakeRehearsal(
  items: TeoyubeLimitedSoftLaunchFeedbackRehearsalItem[] = getDefaultFeedbackRehearsalItems()
): TeoyubeLimitedSoftLaunchFeedbackRehearsal {
  return {
    id: "limited_soft_launch_feedback_rehearsal",
    label: "Limited Soft Launch Feedback Intake Rehearsal",
    items,
    sampleOnly: true,
    manualOnly: true,
    realFeedbackCollected: false,
    rawSensitiveTextStoredByDefault: false,
    databaseWritten: false,
    analyticsSent: false,
    hiddenPersonalizationCreated: false,
    generatedAt: new Date().toISOString()
  };
}

export function recordSampleFeedbackRehearsalItem(
  run: TeoyubeLimitedSoftLaunchFeedbackRehearsal,
  item: TeoyubeLimitedSoftLaunchFeedbackRehearsalItem
): TeoyubeLimitedSoftLaunchFeedbackRehearsal {
  return { ...run, items: [...run.items, { ...item, sampleOnly: true }] };
}

export function summarizeFeedbackIntakeRehearsal(run: TeoyubeLimitedSoftLaunchFeedbackRehearsal) {
  return {
    itemCount: run.items.length,
    sanitizedCount: run.items.filter((entry) => entry.sanitized).length,
    launchCriticalSampleCount: run.items.filter((entry) => entry.launchCritical).length,
    categoryCount: run.items.map((entry) => entry.category).filter((category, index, values) => values.indexOf(category) === index).length
  };
}

export function getFeedbackIntakeRehearsalBlockers(run: TeoyubeLimitedSoftLaunchFeedbackRehearsal): string[] {
  const workflow = createLimitedSoftLaunchFeedbackWorkflowReport();

  return [
    workflow.valid ? "" : "Feedback workflow must be valid.",
    run.sampleOnly ? "" : "Feedback rehearsal must use sample feedback only.",
    run.items.every((entry) => entry.sampleOnly && entry.sanitized) ? "" : "Every rehearsal feedback item must be sample-only and sanitized.",
    run.realFeedbackCollected ? "Feedback rehearsal must not collect real feedback." : "",
    run.rawSensitiveTextStoredByDefault ? "Feedback rehearsal must not store raw sensitive text by default." : "",
    run.databaseWritten ? "Feedback rehearsal must not write to a database." : "",
    run.analyticsSent ? "Feedback rehearsal must not send analytics." : "",
    run.hiddenPersonalizationCreated ? "Feedback rehearsal must not create hidden personalization." : ""
  ].filter(Boolean);
}

export function getFeedbackIntakeRehearsalWarnings(run: TeoyubeLimitedSoftLaunchFeedbackRehearsal): string[] {
  return [
    run.items.length < 7 ? "Recommended sample feedback cases are incomplete." : "",
    "Feedback intake rehearsal uses sample feedback only and stores no raw sensitive text by default."
  ].filter(Boolean);
}

export function validateFeedbackIntakePrivacyForRehearsal(run: TeoyubeLimitedSoftLaunchFeedbackRehearsal) {
  const blockers = getFeedbackIntakeRehearsalBlockers(run);

  return {
    valid: blockers.length === 0,
    blockers,
    warnings: getFeedbackIntakeRehearsalWarnings(run)
  };
}

export function createFeedbackIntakeRehearsalReport(
  run: TeoyubeLimitedSoftLaunchFeedbackRehearsal = createFeedbackIntakeRehearsal()
): TeoyubeLimitedSoftLaunchFeedbackRehearsalReport {
  const summary = summarizeFeedbackIntakeRehearsal(run);
  const validation = validateFeedbackIntakePrivacyForRehearsal(run);

  return {
    valid: validation.valid,
    run,
    itemCount: summary.itemCount,
    launchCriticalSampleCount: summary.launchCriticalSampleCount,
    blockers: validation.blockers,
    warnings: validation.warnings,
    sampleFeedbackOnly: true,
    noRawSensitiveTextStorage: true,
    noExternalSending: true,
    noDatabaseWrites: true,
    noHiddenPersonalization: true,
    generatedAt: new Date().toISOString()
  };
}
