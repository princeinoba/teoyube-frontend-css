import { getDryRunProfileForTarget } from "./deployment-target-dry-run-profiles";
import type { TeoyubePreviewDeploymentTarget } from "./preview-deployment-contracts";

export type TeoyubePreviewDeploymentRunbookSection = {
  id: string;
  title: string;
  steps: string[];
  notes: string[];
};

export function getPreviewDeploymentPreflightRunbook(target: TeoyubePreviewDeploymentTarget = "vercel"): TeoyubePreviewDeploymentRunbookSection {
  return {
    id: "preflight",
    title: "Preflight",
    steps: [
      "Confirm branch and working tree state.",
      "Run available typecheck, lint, build, and smoke checks.",
      "Confirm preview environment package uses placeholders or safe values.",
      "Confirm no real secrets are committed or exposed.",
      "Confirm analytics, persistence, and live AI remain disabled."
    ],
    notes: [`Target selected for review: ${target}.`]
  };
}

export function getPreviewDeploymentManualExecutionRunbook(target: TeoyubePreviewDeploymentTarget = "vercel"): TeoyubePreviewDeploymentRunbookSection {
  const profile = getDryRunProfileForTarget(target);

  return {
    id: "manual_execution",
    title: "Manual Execution",
    steps: [
      "Open the selected provider manually.",
      "Review build command, output behavior, and environment settings.",
      "Run the provider deployment manually only after human approval.",
      "Capture the preview URL manually after deployment.",
      "Review deployment logs manually."
    ],
    notes: [
      "This runbook does not execute deployment commands.",
      `Expected build command: ${profile.expectedBuildCommand}.`,
      `Preview support: ${profile.previewDeploymentSupport}.`
    ]
  };
}

export function getPreviewDeploymentPostCheckRunbook(target: TeoyubePreviewDeploymentTarget = "vercel"): TeoyubePreviewDeploymentRunbookSection {
  return {
    id: "post_check",
    title: "Post-Deployment Verification",
    steps: [
      "Verify preview URL loads.",
      "Verify launch-critical surfaces load.",
      "Verify mobile layout, Scripture anchors, explanation paths, fallbacks, confidence labels, consent, and feedback controls.",
      "Verify debug UI is hidden.",
      "Verify no external analytics, production persistence, or live AI orchestration is enabled."
    ],
    notes: [`Post-checks are manual for ${target}; this module does not fetch the preview URL.`]
  };
}

export function getPreviewDeploymentRollbackRunbook(target: TeoyubePreviewDeploymentTarget = "vercel"): TeoyubePreviewDeploymentRunbookSection {
  const profile = getDryRunProfileForTarget(target);

  return {
    id: "rollback",
    title: "Rollback and Manual Review",
    steps: [
      "Stop sharing the preview URL if a critical issue appears.",
      "Disable affected surface or revert to the last safe commit.",
      "Document the issue in the in-memory/manual issue log structure.",
      "Rerun local checks before retrying."
    ],
    notes: [
      ...profile.rollbackNotes,
      "Rollback/manual review should be documented by the launch reviewer."
    ]
  };
}

export function getPreviewDeploymentRunbookSections(target: TeoyubePreviewDeploymentTarget = "vercel"): TeoyubePreviewDeploymentRunbookSection[] {
  return [
    getPreviewDeploymentPreflightRunbook(target),
    getPreviewDeploymentManualExecutionRunbook(target),
    getPreviewDeploymentPostCheckRunbook(target),
    getPreviewDeploymentRollbackRunbook(target)
  ];
}

export function createPreviewDeploymentRunbook(target: TeoyubePreviewDeploymentTarget = "vercel") {
  return {
    id: "preview_deployment_execution_runbook",
    title: "Preview Deployment Execution Runbook",
    target,
    sections: getPreviewDeploymentRunbookSections(target),
    guardrails: [
      "Deployment must be executed manually.",
      "No secrets should be committed.",
      "External analytics should not be enabled.",
      "Database persistence should not be enabled.",
      "Live AI orchestration remains disabled.",
      "Preview URL should be reviewed manually.",
      "Rollback/manual review should be documented."
    ],
    generatedAt: new Date().toISOString()
  };
}

export function createPreviewDeploymentRunbookReport(target: TeoyubePreviewDeploymentTarget = "vercel") {
  const runbook = createPreviewDeploymentRunbook(target);

  return {
    valid: runbook.sections.length >= 4,
    sectionCount: runbook.sections.length,
    target,
    runbook,
    generatedAt: new Date().toISOString()
  };
}
