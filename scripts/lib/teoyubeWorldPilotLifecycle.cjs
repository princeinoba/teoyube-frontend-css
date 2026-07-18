const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { generatedRoot } = require("./teoyubeWorldReviewPatches.cjs");

const manifestRoot = path.join(generatedRoot, "manifests");
const lifecyclePaths = Object.freeze({
  approval: path.join(manifestRoot, "teoyubeworld-approved-pilot.json"),
  derivativePlan: path.join(manifestRoot, "teoyubeworld-derivative-plan.json"),
  derivativeExecutionAuthorization: path.join(manifestRoot, "teoyubeworld-derivative-execution-authorization.json"),
  derivatives: path.join(manifestRoot, "teoyubeworld-generated-derivatives.json"),
  derivativeValidation: path.join(manifestRoot, "teoyubeworld-derivative-validation.json"),
  publicationPlan: path.join(manifestRoot, "teoyubeworld-publication-plan.json"),
  publicationAuthorization: path.join(manifestRoot, "teoyubeworld-publication-authorization.json"),
  publicationReceipt: path.join(manifestRoot, "teoyubeworld-publication-receipt.json")
});

const lifecycleStates = Object.freeze([
  "blocked",
  "ready_for_owner_approval",
  "owner_approved",
  "derivative_plan_ready",
  "derivative_execution_authorized",
  "derivatives_generated",
  "derivatives_validated",
  "publication_plan_ready",
  "publication_authorized",
  "published"
]);

function fingerprint(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function readArtifact(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeArtifact(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function artifactSnapshot(paths = lifecyclePaths) {
  return Object.fromEntries(Object.entries(paths).map(([name, filePath]) => [name, readArtifact(filePath)]));
}

function determineLifecycleState(gateReport, artifacts = artifactSnapshot()) {
  if (!gateReport?.gatePassed || (gateReport.blockers || []).length) return "blocked";
  if (!artifacts.approval) return "ready_for_owner_approval";
  if (!artifacts.derivativePlan) return "owner_approved";
  if (!artifacts.derivativeExecutionAuthorization) return "derivative_plan_ready";
  if (!artifacts.derivatives) return "derivative_execution_authorized";
  if (!artifacts.derivativeValidation?.valid) return "derivatives_generated";
  if (!artifacts.publicationPlan) return "derivatives_validated";
  if (!artifacts.publicationAuthorization) return "publication_plan_ready";
  if (!artifacts.publicationReceipt) return "publication_authorized";
  return "published";
}

function blockerPayload(gateReport, operation = "owner_approval") {
  return {
    accepted: false,
    operation,
    state: "blocked",
    gatePassed: false,
    blockerCount: gateReport?.blockers?.length || 0,
    blockers: gateReport?.blockers || [{ code: "gate_unavailable", message: "Complete owner-gate validation is unavailable.", mediaId: null }],
    validation: gateReport || null,
    mediaFilesCreated: 0,
    sourceFilesModified: 0,
    publicFilesWritten: 0
  };
}

function createApprovalControlResponse(gateReport, artifacts = artifactSnapshot()) {
  if (!gateReport?.gatePassed || (gateReport.blockers || []).length) {
    return { statusCode: 409, payload: blockerPayload(gateReport, "render_owner_approval_control") };
  }
  const outOfOrderArtifact = [
    artifacts.derivativePlan,
    artifacts.derivativeExecutionAuthorization,
    artifacts.derivatives,
    artifacts.derivativeValidation,
    artifacts.publicationPlan,
    artifacts.publicationAuthorization,
    artifacts.publicationReceipt
  ].some(Boolean);
  if (!artifacts.approval && outOfOrderArtifact) {
    return {
      statusCode: 409,
      payload: {
        accepted: false,
        operation: "render_owner_approval_control",
        state: "blocked",
        gatePassed: false,
        blockerCount: 1,
        blockers: [{ code: "lifecycle_state_order", message: "A downstream lifecycle artifact exists before owner approval and must be reviewed.", mediaId: null }]
      }
    };
  }
  if (artifacts.approval) {
    return {
      statusCode: 200,
      payload: {
        state: determineLifecycleState(gateReport, artifacts),
        gatePassed: true,
        blockerCount: 0,
        approvalRecorded: true,
        notice: "The checksum-bound pilot definition is already owner-approved. No approval control is rendered."
      }
    };
  }
  return {
    statusCode: 200,
    payload: {
      state: "ready_for_owner_approval",
      gatePassed: true,
      blockerCount: 0,
      validationFingerprint: fingerprint(gateReport),
      approvalControlHtml: '<button id="approve-pilot-definition" class="primary" type="button">Approve Owner-Reviewed Pilot</button>',
      notice: "Approval records the validated pilot definition only. It does not plan, copy, transcode, generate, or publish media."
    }
  };
}

function createApprovalArtifact(gateReport, options = {}) {
  if (!gateReport?.gatePassed || (gateReport.blockers || []).length) return null;
  const approvedAt = options.approvedAt || new Date().toISOString();
  const artifact = {
    artifactType: "teoyubeworld_owner_approved_pilot",
    schemaVersion: "2.0.0",
    approvalState: "owner_approved",
    lifecycleState: "owner_approved",
    pilotPlanId: gateReport.pilotPlanId || null,
    manifestVersion: gateReport.manifestVersion || "unknown",
    sourceDraftManifestChecksum: gateReport.sourceDraftManifestChecksum,
    approvedRecordIds: [...(gateReport.selectedMediaIds || [])],
    approvedSequenceIds: [...(gateReport.selectedSequenceIds || [])],
    approvedSequenceOrder: [...(gateReport.selectedSequenceOrder || [])],
    sourceChecksums: { ...(gateReport.selectedSourceChecksums || {}) },
    approvalTimestamp: approvedAt,
    ownerConfirmation: {
      confirmed: options.ownerConfirmation === true,
      confirmedBy: options.confirmedBy || "local_project_owner",
      scope: "pilot_definition_only"
    },
    ownerDeclarations: { ...(gateReport.ownerDeclarations?.declarations || {}) },
    acceptedTitles: { ...(options.acceptedTitles || {}) },
    acceptedScriptureMappings: { ...(options.acceptedScriptureMappings || {}) },
    rightsStatusSummary: { ...(options.rightsStatusSummary || {}) },
    safetyStatusSummary: { ...(options.safetyStatusSummary || {}) },
    ownerAttestationArtifactId: options.ownerAttestationArtifactId || null,
    ownerAttestationArtifactChecksum: options.ownerAttestationArtifactChecksum || null,
    approvalRevision: options.approvalRevision || gateReport.stateRevision || null,
    exactValidationResult: gateReport,
    validationFingerprint: fingerprint(gateReport),
    reversibleBeforeDerivativeExecution: true,
    derivativeExecutionAuthorized: false,
    publicationAuthorized: false,
    mediaFilesCreated: 0,
    sourceFilesModified: 0,
    publicFilesWritten: 0
  };
  return { ...artifact, artifactChecksumSha256: fingerprint(artifact) };
}

function requestOwnerApproval(gateReport, options = {}) {
  if (!gateReport?.gatePassed || (gateReport.blockers || []).length) {
    return { statusCode: 409, payload: blockerPayload(gateReport) };
  }
  if (options.ownerConfirmation !== true) {
    return {
      statusCode: 422,
      payload: {
        accepted: false,
        operation: "owner_approval",
        state: "ready_for_owner_approval",
        blockerCount: 1,
        blockers: [{ code: "owner_confirmation", message: "Explicit owner confirmation is required.", mediaId: null }],
        mediaFilesCreated: 0,
        sourceFilesModified: 0,
        publicFilesWritten: 0
      }
    };
  }
  const artifact = createApprovalArtifact(gateReport, options);
  const outputPath = options.outputPath || lifecyclePaths.approval;
  (options.writeArtifact || writeArtifact)(outputPath, artifact);
  return {
    statusCode: 201,
    payload: {
      accepted: true,
      state: "owner_approved",
      approvalArtifact: artifact,
      reversibleBeforeDerivativeExecution: true,
      mediaFilesCreated: 0,
      sourceFilesModified: 0,
      publicFilesWritten: 0
    }
  };
}

function revokeOwnerApproval(options = {}) {
  const paths = options.paths || lifecyclePaths;
  const downstream = [
    paths.derivativeExecutionAuthorization,
    paths.derivatives,
    paths.derivativeValidation,
    paths.publicationPlan,
    paths.publicationAuthorization,
    paths.publicationReceipt
  ];
  if (downstream.some((filePath) => filePath && fs.existsSync(filePath))) {
    return {
      statusCode: 409,
      payload: {
        revoked: false,
        state: "blocked",
        blockers: [{ code: "approval_locked", message: "Approval cannot be revoked after derivative execution authorization.", mediaId: null }]
      }
    };
  }
  if (fs.existsSync(paths.approval)) fs.unlinkSync(paths.approval);
  if (paths.derivativePlan && fs.existsSync(paths.derivativePlan)) fs.unlinkSync(paths.derivativePlan);
  return { statusCode: 200, payload: { revoked: true, state: "ready_for_owner_approval", mediaFilesDeleted: 0 } };
}

function authorizeDerivativeExecution(gateReport, options = {}) {
  const artifacts = options.artifacts || artifactSnapshot(options.paths || lifecyclePaths);
  const state = determineLifecycleState(gateReport, artifacts);
  if (state !== "derivative_plan_ready" || options.ownerConfirmation !== true) {
    return {
      statusCode: 409,
      payload: {
        authorized: false,
        operation: "derivative_execution_authorization",
        state,
        blockers: [{ code: "derivative_execution_authorization_required", message: "A valid owner approval, completed derivative plan, and separate owner confirmation are required.", mediaId: null }],
        commandsExecuted: 0,
        mediaFilesCreated: 0
      }
    };
  }
  const artifact = {
    schemaVersion: "1.0.0",
    lifecycleState: "derivative_execution_authorized",
    authorizedAt: options.authorizedAt || new Date().toISOString(),
    ownerConfirmation: true,
    approvalFingerprint: artifacts.approval.validationFingerprint,
    derivativePlanFingerprint: fingerprint(artifacts.derivativePlan),
    commandsExecuted: 0,
    mediaFilesCreated: 0
  };
  if (options.outputPath) (options.writeArtifact || writeArtifact)(options.outputPath, artifact);
  return { statusCode: 201, payload: { authorized: true, state: "derivative_execution_authorized", authorizationArtifact: artifact, commandsExecuted: 0 } };
}

function authorizePublication(gateReport, options = {}) {
  const artifacts = options.artifacts || artifactSnapshot(options.paths || lifecyclePaths);
  const state = determineLifecycleState(gateReport, artifacts);
  const validationReady = state === "publication_plan_ready" && artifacts.derivativeValidation?.valid === true && Boolean(artifacts.publicationPlan);
  const checksumsUnchanged = options.sourceChecksumsUnchanged === true;
  const runtimeManifestApproved = options.runtimeManifestApproved === true;
  if (!validationReady || !checksumsUnchanged || !runtimeManifestApproved || options.ownerConfirmation !== true) {
    return {
      statusCode: 409,
      payload: {
        authorized: false,
        operation: "publication_authorization",
        state,
        blockers: [{ code: "publication_authorization_required", message: "Validated derivatives, unchanged checksums, an approved runtime manifest, and explicit owner publication confirmation are required.", mediaId: null }],
        filesPublished: 0
      }
    };
  }
  const artifact = {
    schemaVersion: "1.0.0",
    lifecycleState: "publication_authorized",
    authorizedAt: options.authorizedAt || new Date().toISOString(),
    ownerConfirmation: true,
    sourceChecksumsUnchanged: true,
    runtimeManifestApproved: true,
    derivativeValidationFingerprint: fingerprint(artifacts.derivativeValidation),
    filesPublished: 0
  };
  if (options.outputPath) (options.writeArtifact || writeArtifact)(options.outputPath, artifact);
  return { statusCode: 201, payload: { authorized: true, state: "publication_authorized", authorizationArtifact: artifact, filesPublished: 0 } };
}

function requireDerivativeExecutionAuthorization(gateReport, options = {}) {
  const state = determineLifecycleState(gateReport, options.artifacts || artifactSnapshot(options.paths || lifecyclePaths));
  return state === "derivative_execution_authorized"
    ? { allowed: true, state }
    : { allowed: false, state, blockers: [{ code: "derivative_execution_not_authorized", message: "Derivative execution requires its own explicit owner authorization.", mediaId: null }] };
}

function requirePublicationAuthorization(gateReport, options = {}) {
  const state = determineLifecycleState(gateReport, options.artifacts || artifactSnapshot(options.paths || lifecyclePaths));
  return state === "publication_authorized"
    ? { allowed: true, state }
    : { allowed: false, state, blockers: [{ code: "publication_not_authorized", message: "Publication requires its own explicit owner authorization after derivative validation.", mediaId: null }] };
}

module.exports = {
  lifecyclePaths,
  lifecycleStates,
  fingerprint,
  artifactSnapshot,
  determineLifecycleState,
  blockerPayload,
  createApprovalControlResponse,
  createApprovalArtifact,
  requestOwnerApproval,
  revokeOwnerApproval,
  authorizeDerivativeExecution,
  authorizePublication,
  requireDerivativeExecutionAuthorization,
  requirePublicationAuthorization
};
