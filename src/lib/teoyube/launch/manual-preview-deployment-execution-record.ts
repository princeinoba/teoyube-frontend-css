import type {
  TeoyubeManualPreviewDeploymentCommandResult,
  TeoyubeManualPreviewDeploymentExecutionRecord,
  TeoyubeManualPreviewDeploymentProvider,
  TeoyubeManualPreviewDeploymentStep,
  TeoyubeManualPreviewDeploymentStatus
} from "./manual-preview-deployment-contracts";

export type TeoyubeManualPreviewDeploymentExecutionRecordInput = {
  provider?: TeoyubeManualPreviewDeploymentProvider;
  environmentProfile?: string;
  localChecksCompleted?: boolean;
  manualDeploymentCommandPrepared?: boolean;
  steps?: TeoyubeManualPreviewDeploymentStep[];
  commandResults?: TeoyubeManualPreviewDeploymentCommandResult[];
  blockers?: string[];
  warnings?: string[];
  nextAction?: string;
};

export type TeoyubeManualPreviewDeploymentExecutionSummary = {
  ready: boolean;
  provider: TeoyubeManualPreviewDeploymentProvider;
  environmentProfile: string;
  localChecksCompleted: boolean;
  manualDeploymentCommandPrepared: boolean;
  previewUrlRecorded: boolean;
  postDeploymentChecksStatus: TeoyubeManualPreviewDeploymentStatus;
  stepCount: number;
  commandResultCount: number;
  blockerCount: number;
  warningCount: number;
  nextAction: string;
  deploymentPerformedByCode: false;
};

function id(): string {
  return `manual_preview_deployment_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function now(): string {
  return new Date().toISOString();
}

export function createManualPreviewDeploymentExecutionRecord(
  input: TeoyubeManualPreviewDeploymentExecutionRecordInput = {}
): TeoyubeManualPreviewDeploymentExecutionRecord {
  const createdAt = now();

  return {
    id: id(),
    provider: input.provider || "vercel",
    environmentProfile: input.environmentProfile || "preview",
    localChecksCompleted: input.localChecksCompleted ?? false,
    manualDeploymentCommandPrepared: input.manualDeploymentCommandPrepared ?? false,
    postDeploymentChecksStatus: "not_started",
    steps: [...(input.steps || [])],
    commandResults: [...(input.commandResults || [])],
    blockers: [...(input.blockers || [])],
    warnings: [...(input.warnings || [])],
    nextAction: input.nextAction || "Run local checks, confirm provider settings, then manually execute deployment after owner approval.",
    deploymentPerformedByCode: false,
    sentExternally: false,
    filesWritten: false,
    createdAt,
    updatedAt: createdAt
  };
}

export function addManualPreviewDeploymentStep(
  record: TeoyubeManualPreviewDeploymentExecutionRecord,
  step: TeoyubeManualPreviewDeploymentStep
): TeoyubeManualPreviewDeploymentExecutionRecord {
  return {
    ...record,
    steps: [...record.steps, step],
    updatedAt: now()
  };
}

export function recordManualPreviewDeploymentResult(
  record: TeoyubeManualPreviewDeploymentExecutionRecord,
  result: TeoyubeManualPreviewDeploymentCommandResult
): TeoyubeManualPreviewDeploymentExecutionRecord {
  const existing = record.commandResults.filter((entry) => entry.commandId !== result.commandId);

  return {
    ...record,
    commandResults: [...existing, result],
    localChecksCompleted: record.localChecksCompleted || result.commandId.includes("build"),
    updatedAt: now()
  };
}

export function recordManualPreviewUrl(
  record: TeoyubeManualPreviewDeploymentExecutionRecord,
  previewUrl: string
): TeoyubeManualPreviewDeploymentExecutionRecord {
  return {
    ...record,
    previewUrl,
    postDeploymentChecksStatus: "needs_review",
    nextAction: "Run the manual postdeployment checklist against the recorded preview URL.",
    updatedAt: now()
  };
}

export function summarizeManualPreviewDeploymentExecution(
  record: TeoyubeManualPreviewDeploymentExecutionRecord
): TeoyubeManualPreviewDeploymentExecutionSummary {
  const ready =
    record.provider !== "undecided" &&
    record.provider !== "unknown" &&
    record.localChecksCompleted &&
    record.manualDeploymentCommandPrepared &&
    record.blockers.length === 0;

  return {
    ready,
    provider: record.provider,
    environmentProfile: record.environmentProfile,
    localChecksCompleted: record.localChecksCompleted,
    manualDeploymentCommandPrepared: record.manualDeploymentCommandPrepared,
    previewUrlRecorded: Boolean(record.previewUrl),
    postDeploymentChecksStatus: record.postDeploymentChecksStatus,
    stepCount: record.steps.length,
    commandResultCount: record.commandResults.length,
    blockerCount: record.blockers.length,
    warningCount: record.warnings.length,
    nextAction: record.nextAction,
    deploymentPerformedByCode: false
  };
}

export function createManualPreviewDeploymentExecutionReport(
  record: TeoyubeManualPreviewDeploymentExecutionRecord
) {
  const summary = summarizeManualPreviewDeploymentExecution(record);

  return {
    status: record.blockers.length ? "blocked" : summary.ready ? "ready" : "needs_review",
    ready: summary.ready,
    summary,
    record,
    noActualDeploymentPerformed: record.deploymentPerformedByCode === false,
    noExternalSending: record.sentExternally === false,
    noFileWrites: record.filesWritten === false,
    generatedAt: now()
  };
}
