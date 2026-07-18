import type { TeoyubeLimitedSoftLaunchDryRunDecision } from "./limited-soft-launch-dry-run-contracts";
import { createLimitedSoftLaunchCommunicationPacket } from "./limited-soft-launch-communication-packet";
import { createLimitedSoftLaunchDayRunbookReport } from "./limited-soft-launch-day-runbook";
import { createLaunchDayRehearsalReport } from "./limited-soft-launch-day-rehearsal";
import { createLimitedSoftLaunchDryRun, createLimitedSoftLaunchDryRunReport } from "./limited-soft-launch-dry-run-runner";
import { createFeedbackIntakeRehearsalReport } from "./limited-soft-launch-feedback-rehearsal";
import { createIssueTriageRehearsalReport } from "./limited-soft-launch-issue-triage-rehearsal";
import { createLimitedSoftLaunchOwnerReviewReport } from "./limited-soft-launch-owner-review";
import { createRollbackRehearsalReport } from "./limited-soft-launch-rollback-rehearsal";

export type TeoyubeLimitedSoftLaunchDryRunPackage = {
  id: string;
  label: string;
  dryRunReport: ReturnType<typeof createLimitedSoftLaunchDryRunReport>;
  launchDayRehearsalReport: ReturnType<typeof createLaunchDayRehearsalReport>;
  feedbackRehearsalReport: ReturnType<typeof createFeedbackIntakeRehearsalReport>;
  issueTriageRehearsalReport: ReturnType<typeof createIssueTriageRehearsalReport>;
  rollbackRehearsalReport: ReturnType<typeof createRollbackRehearsalReport>;
  ownerReviewReport: ReturnType<typeof createLimitedSoftLaunchOwnerReviewReport>;
  communicationPacketReference: ReturnType<typeof createLimitedSoftLaunchCommunicationPacket>;
  runbookReference: ReturnType<typeof createLimitedSoftLaunchDayRunbookReport>;
  knownLimitations: string[];
  nextRecommendedAction: string;
  inMemoryOnly: true;
  externallySent: false;
  fileWritten: false;
  databaseWritten: false;
  generatedAt: string;
};

export type TeoyubeLimitedSoftLaunchDryRunPackageInput = Partial<
  Pick<
    TeoyubeLimitedSoftLaunchDryRunPackage,
    | "dryRunReport"
    | "launchDayRehearsalReport"
    | "feedbackRehearsalReport"
    | "issueTriageRehearsalReport"
    | "rollbackRehearsalReport"
    | "ownerReviewReport"
    | "knownLimitations"
  >
>;

export type TeoyubeLimitedSoftLaunchDryRunPackageReport = {
  valid: boolean;
  decision: TeoyubeLimitedSoftLaunchDryRunDecision;
  package: TeoyubeLimitedSoftLaunchDryRunPackage;
  blockers: string[];
  warnings: string[];
  noExternalSend: true;
  noFileWrites: true;
  noDatabaseWrites: true;
  generatedAt: string;
};

export function createLimitedSoftLaunchDryRunPackage(
  input: TeoyubeLimitedSoftLaunchDryRunPackageInput = {}
): TeoyubeLimitedSoftLaunchDryRunPackage {
  const dryRun = input.dryRunReport || createLimitedSoftLaunchDryRunReport(createLimitedSoftLaunchDryRun());

  return {
    id: "limited_soft_launch_dry_run_package_3_2",
    label: "Soft Launch Preparation 3.2 Dry Run Readiness Package",
    dryRunReport: dryRun,
    launchDayRehearsalReport: input.launchDayRehearsalReport || createLaunchDayRehearsalReport(),
    feedbackRehearsalReport: input.feedbackRehearsalReport || createFeedbackIntakeRehearsalReport(),
    issueTriageRehearsalReport: input.issueTriageRehearsalReport || createIssueTriageRehearsalReport(),
    rollbackRehearsalReport: input.rollbackRehearsalReport || createRollbackRehearsalReport(),
    ownerReviewReport: input.ownerReviewReport || createLimitedSoftLaunchOwnerReviewReport(),
    communicationPacketReference: createLimitedSoftLaunchCommunicationPacket(),
    runbookReference: createLimitedSoftLaunchDayRunbookReport(),
    knownLimitations: input.knownLimitations || [
      "This package is in-memory only.",
      "It does not launch, contact users, collect real feedback, fetch preview URLs, write files, write databases, send analytics, or call external services."
    ],
    nextRecommendedAction: "Soft Launch Preparation 3.3 - Final Soft Launch Readiness Package & Go/No-Go",
    inMemoryOnly: true,
    externallySent: false,
    fileWritten: false,
    databaseWritten: false,
    generatedAt: new Date().toISOString()
  };
}

export function getLimitedSoftLaunchDryRunPackageBlockers(packageReport: TeoyubeLimitedSoftLaunchDryRunPackage): string[] {
  return [
    packageReport.dryRunReport.valid ? "" : "Dry run report must be valid.",
    packageReport.launchDayRehearsalReport.valid ? "" : "Launch-day rehearsal report must be valid.",
    packageReport.feedbackRehearsalReport.valid ? "" : "Feedback rehearsal report must be valid.",
    packageReport.issueTriageRehearsalReport.valid ? "" : "Issue triage rehearsal report must be valid.",
    packageReport.rollbackRehearsalReport.valid ? "" : "Rollback rehearsal report must be valid.",
    packageReport.ownerReviewReport.valid ? "" : "Owner review report must be valid.",
    packageReport.communicationPacketReference.messagesSent ? "Communication packet must not send messages." : "",
    packageReport.communicationPacketReference.usersContacted ? "Communication packet must not contact users." : "",
    packageReport.runbookReference.noActionsPerformed ? "" : "Runbook must perform no actions.",
    packageReport.externallySent ? "Dry run package must not be sent externally." : "",
    packageReport.fileWritten ? "Dry run package must not write files." : "",
    packageReport.databaseWritten ? "Dry run package must not write to a database." : ""
  ].filter(Boolean);
}

export function getLimitedSoftLaunchDryRunPackageWarnings(packageReport: TeoyubeLimitedSoftLaunchDryRunPackage): string[] {
  return [
    packageReport.ownerReviewReport.ready ? "" : "Owner review must be accepted before moving beyond dry run.",
    "Dry run package is a preparation artifact only; final go/no-go remains a later manual step."
  ].filter(Boolean);
}

export function createLimitedSoftLaunchDryRunPackageDecision(
  packageReport: TeoyubeLimitedSoftLaunchDryRunPackage
): TeoyubeLimitedSoftLaunchDryRunDecision {
  const blockers = getLimitedSoftLaunchDryRunPackageBlockers(packageReport);

  if (blockers.some((entry) => /scripture|explanation|fallback|consent|privacy|analytics|persistence|live ai/i.test(entry))) return "needs_safety_review";
  if (blockers.some((entry) => /runbook|preview url/i.test(entry))) return "needs_runbook_fix";
  if (blockers.some((entry) => /surface|mobile|accessibility|qa|launch-day/i.test(entry))) return "needs_qa_review";
  if (blockers.length > 0) return "blocked";
  if (!packageReport.ownerReviewReport.ready) return "ready_after_owner_review";
  return "ready_for_final_soft_launch_readiness_package";
}

export function validateLimitedSoftLaunchDryRunPackage(packageReport: TeoyubeLimitedSoftLaunchDryRunPackage) {
  const blockers = getLimitedSoftLaunchDryRunPackageBlockers(packageReport);

  return {
    valid: blockers.length === 0,
    blockers,
    warnings: getLimitedSoftLaunchDryRunPackageWarnings(packageReport)
  };
}

export function createLimitedSoftLaunchDryRunPackageReport(
  packageReport: TeoyubeLimitedSoftLaunchDryRunPackage = createLimitedSoftLaunchDryRunPackage()
): TeoyubeLimitedSoftLaunchDryRunPackageReport {
  const validation = validateLimitedSoftLaunchDryRunPackage(packageReport);

  return {
    valid: validation.valid,
    decision: createLimitedSoftLaunchDryRunPackageDecision(packageReport),
    package: packageReport,
    blockers: validation.blockers,
    warnings: validation.warnings,
    noExternalSend: true,
    noFileWrites: true,
    noDatabaseWrites: true,
    generatedAt: new Date().toISOString()
  };
}
