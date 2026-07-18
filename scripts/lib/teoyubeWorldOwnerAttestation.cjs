const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const {
  generatedRoot,
  patchPaths,
  loadReviewWorkspace,
  applyPatches,
  validatePatch,
  readJson,
  writeJson
} = require("./teoyubeWorldReviewPatches.cjs");
const {
  sourcePathFor,
  ownerDeclarationsPath
} = require("./teoyubeWorldAssistedPilot.cjs");
const {
  APPROVED_TRANSLATIONS,
  ownerReconfirmationPath,
  getCanonicalPilotState,
  getCanonicalSequenceState,
  ensureCanonicalStateRevision,
  incrementCanonicalStateRevision
} = require("./teoyubeWorldCanonicalPilotState.cjs");
const {
  lifecyclePaths,
  fingerprint,
  requestOwnerApproval
} = require("./teoyubeWorldPilotLifecycle.cjs");
const {
  validateTeoyubeWorldOwnerGate
} = require("../validateTeoyubeWorldOwnerGate.cjs");

const PILOT_PLAN_ID = "pilot-2322459e34ba7e5f9645";
const SEQUENCE_ID = "sequence-402caf80cdbf4d17";
const ATTESTATION_ID = `owner-attestation-${PILOT_PLAN_ID}`;
const OWNER_ATTESTATION_TEXT = "\u201cI am the Teoyube project owner. I confirm that I personally reviewed the 12 short-video records selected in pilot plan pilot-2322459e34ba7e5f9645. I accept the final prepared titles, descriptions, and Scripture mappings for those selected records after removal of invalid placeholders. I confirm sequence-402caf80cdbf4d17 as one complete 12-segment Scripture sequence in the final displayed order. To the best of my knowledge, I created or control the rights necessary to use the selected media in the local Teoyube Scripture-media pilot, including the media elements represented in the selected records. I confirm that the selected records are safe for the intended Teoyube pilot surfaces and contain no private information, dangerous spiritual claim, misleading guarantee, prohibited professional advice, inappropriate content, or intentionally unsafe flashing content. I authorize creation of the checksum-bound owner-approved pilot artifact. This attestation does not authorize FFmpeg derivative execution and does not authorize publication.\u201d";

const ownerApprovalsRoot = path.join(generatedRoot, "owner-approvals");
const gateRecoveryRoot = path.join(generatedRoot, "gate-recovery");
const ownerAttestationPath = path.join(ownerApprovalsRoot, `${PILOT_PLAN_ID}-owner-attestation.json`);
const sequenceConfirmationPath = path.join(ownerApprovalsRoot, `${SEQUENCE_ID}-owner-confirmation.json`);

function hashFile(filePath) {
  return new Promise((resolve, reject) => {
    const digest = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath, { highWaterMark: 4 * 1024 * 1024 });
    stream.on("data", (chunk) => digest.update(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(digest.digest("hex")));
  });
}

function checksumArtifact(body) {
  return { ...body, artifactChecksumSha256: fingerprint(body) };
}

function verifyArtifactChecksum(artifact) {
  if (!artifact?.artifactChecksumSha256) return false;
  const { artifactChecksumSha256, ...body } = artifact;
  return fingerprint(body) === artifactChecksumSha256;
}

function assertNoAbsoluteAppPath(value, label) {
  if (/[A-Za-z]:[\\/]/.test(JSON.stringify(value))) throw new Error(`${label} contains a disallowed absolute path.`);
}

function parseScriptureReference(reference) {
  const text = String(reference || "").trim();
  if (!text || /^Book\s+\d+:/i.test(text)) return null;
  const match = /^(?<book>(?:[1-3]\s+)?[A-Za-z]+(?:\s+[A-Za-z]+)*)\s+(?<chapter>\d+):(?<start>\d+)(?:-(?<end>\d+))?$/.exec(text);
  return match ? {
    reference: text,
    BibleBook: match.groups.book,
    chapter: Number(match.groups.chapter),
    verseStart: Number(match.groups.start),
    verseEnd: Number(match.groups.end || match.groups.start)
  } : null;
}

function buildOperation(existingOperation, current, newValues, timestamp, reason) {
  const mergedNewValues = { ...(existingOperation?.newValues || {}), ...newValues };
  const previousValues = { ...(existingOperation?.previousValues || {}) };
  for (const field of Object.keys(newValues)) {
    if (!(field in previousValues)) previousValues[field] = current[field] ?? null;
  }
  return {
    mediaId: current.id,
    sourceChecksum: current.checksumSha256,
    pilotPlanId: newValues.pilotPlanId || PILOT_PLAN_ID,
    attestationArtifactId: newValues.attestationArtifactId || null,
    attestationArtifactChecksum: newValues.attestationArtifactChecksum || null,
    patchSchemaVersion: newValues.patchSchemaVersion || "2.0.0-owner-attested",
    changedFields: Object.keys(mergedNewValues),
    previousValues,
    newValues: mergedNewValues,
    reviewReason: reason,
    timestamp
  };
}

function backfillPersistedAttestationOperationBindings() {
  const state = getCanonicalPilotState();
  const { manifest, sourceChecksum, patches } = loadReviewWorkspace();
  const recordsById = new Map(manifest.records.map((record) => [record.id, record]));
  const selectedIds = new Set(state.candidate.selectedShortIds || []);
  let updatedOperationCount = 0;
  for (const name of ["owner", "sequence", "pilot"]) {
    const currentPatch = patches[name];
    if (!currentPatch) throw new Error(`${name} attestation patch is missing.`);
    const nextPatch = {
      ...currentPatch,
      operations: currentPatch.operations.map((operation) => {
        if (!selectedIds.has(operation.mediaId)) return operation;
        const record = recordsById.get(operation.mediaId);
        if (!record) throw new Error(`${operation.mediaId} is absent from the source manifest.`);
        updatedOperationCount += 1;
        return {
          ...operation,
          sourceChecksum: record.checksumSha256,
          pilotPlanId: PILOT_PLAN_ID,
          attestationArtifactId: currentPatch.attestationArtifactId,
          attestationArtifactChecksum: currentPatch.attestationArtifactChecksum,
          patchSchemaVersion: currentPatch.patchSchemaVersion || "2.0.0-owner-attested"
        };
      })
    };
    const validation = validatePatch(nextPatch, manifest, sourceChecksum, name);
    if (!validation.valid) throw new Error(`${name} attestation patch backfill is invalid: ${validation.errors.join(" ")}`);
    writeJson(patchPaths[name], nextPatch);
  }
  return { updatedOperationCount, patchCount: 3, sourceFilesModified: 0, mediaFilesCopied: 0 };
}

async function refreshCanonicalApprovalAfterBindingRepair() {
  const attestation = readJson(ownerAttestationPath, null);
  if (!verifyArtifactChecksum(attestation)) throw new Error("The owner attestation checksum is invalid.");
  const gate = await validateTeoyubeWorldOwnerGate();
  if (!gate.gatePassed || gate.blockerCount !== 0) throw new Error("The repaired patch state does not pass the canonical gate.");
  const state = getCanonicalPilotState();
  const existingApproval = readJson(lifecyclePaths.approval, null);
  const approval = requestOwnerApproval(gate, {
    ownerConfirmation: true,
    confirmedBy: "local_project_owner_via_prompt_attestation",
    ownerAttestationArtifactId: attestation.artifactId,
    ownerAttestationArtifactChecksum: attestation.artifactChecksumSha256,
    approvalRevision: gate.stateRevision,
    approvedAt: existingApproval?.approvalTimestamp,
    acceptedTitles: Object.fromEntries(state.selectedRecords.map((record) => [record.id, record.titleAccepted])),
    acceptedScriptureMappings: Object.fromEntries(state.selectedRecords.map((record) => [record.id, record.scriptureReferenceAccepted])),
    rightsStatusSummary: Object.fromEntries(state.selectedRecords.map((record) => [record.id, record.rightsStatus])),
    safetyStatusSummary: Object.fromEntries(state.selectedRecords.map((record) => [record.id, record.safetyStatus]))
  });
  if (approval.statusCode !== 201 || !verifyArtifactChecksum(approval.payload.approvalArtifact)) throw new Error("The repaired canonical approval artifact is invalid.");
  const revision = incrementCanonicalStateRevision("attestation_patch_binding_repair_recorded");
  const finalGate = await validateTeoyubeWorldOwnerGate();
  return {
    approvalArtifactChecksum: approval.payload.approvalArtifact.artifactChecksumSha256,
    approvalRevision: approval.payload.approvalArtifact.approvalRevision,
    canonicalRevision: revision.stateRevision,
    blockerCount: finalGate.blockerCount,
    derivativeExecutionAuthorized: false,
    publicationAuthorized: false
  };
}

function buildChecksumBoundPatch(existingPatch, selectedRecords, operations, sourceChecksum, attestation, timestamp, reviewedBy) {
  const selectedIds = new Set(selectedRecords.map((record) => record.id));
  const preserved = (existingPatch?.operations || []).filter((operation) => !selectedIds.has(operation.mediaId));
  return {
    schemaVersion: "1.0.0",
    patchSchemaVersion: "2.0.0-owner-attested",
    sourceDraftManifestChecksum: sourceChecksum,
    generatedAt: timestamp,
    reviewedBy,
    pilotPlanId: PILOT_PLAN_ID,
    attestationArtifactId: attestation.artifactId,
    attestationArtifactChecksum: attestation.artifactChecksumSha256,
    attestationSource: "owner_prompt_instruction",
    operationCount: preserved.length + operations.length,
    operations: [...preserved, ...operations],
    warnings: [],
    localOnly: true,
    runtimeManifestUpdated: false
  };
}

function createPreAttestationBackup(gateSnapshot, state = getCanonicalPilotState()) {
  const timestamp = new Date().toISOString();
  const sequence = getCanonicalSequenceState(state);
  const backup = {
    artifactType: "teoyubeworld_pre_attestation_gate_backup",
    schemaVersion: "1.0.0",
    createdAt: timestamp,
    stateRevision: gateSnapshot.stateRevision,
    pilotPlanId: state.pilotPlanId,
    manifestVersion: state.manifestVersion,
    selectedRecordIds: [...(state.candidate.selectedShortIds || [])],
    selectedRecordChecksums: Object.fromEntries(state.candidateRecords.map((record) => [record.id, record.checksumSha256])),
    pilotPlan: {
      selectedShortIds: [...(state.candidate.selectedShortIds || [])],
      selectedLongFormIds: [...(state.candidate.selectedLongFormIds || [])],
      recommendedSequenceId: state.candidate.recommendedSequenceId
    },
    reviewPatches: state.patches,
    sequenceState: sequence,
    declarationState: state.ownerReconfirmation,
    blockerSnapshot: gateSnapshot,
    mediaFilesCopied: 0,
    sourceFilesModified: 0,
    publicFilesWritten: 0
  };
  assertNoAbsoluteAppPath(backup, "Gate-recovery backup");
  const safeTimestamp = timestamp.replace(/[:.]/g, "-");
  const outputPath = path.join(gateRecoveryRoot, `pre-attestation-state-${safeTimestamp}.json`);
  writeJson(outputPath, backup);
  return { outputPath, backup };
}

async function validateAttestationPreflight(state = getCanonicalPilotState()) {
  const selectedIds = state.candidate.selectedShortIds || [];
  const recordsById = new Map(state.candidateRecords.map((record) => [record.id, record]));
  const errors = [];
  const records = [];
  const seenChecksums = new Set();
  if (state.pilotPlanId !== PILOT_PLAN_ID) errors.push(`Pilot plan mismatch: ${state.pilotPlanId}.`);
  if (selectedIds.length !== 12 || new Set(selectedIds).size !== 12) errors.push("The owner-attested pilot must contain exactly 12 unique short record IDs.");
  if ((state.candidate.selectedLongFormIds || []).length !== 0) errors.push("The owner-attested pilot must contain zero long-form records.");
  if (state.candidate.recommendedSequenceId !== SEQUENCE_ID) errors.push("The selected sequence ID does not match the owner attestation.");

  for (const [index, mediaId] of selectedIds.entries()) {
    const record = recordsById.get(mediaId);
    const suggestion = state.suggestions[mediaId];
    if (!record) {
      errors.push(`${mediaId}: record is unavailable.`);
      continue;
    }
    const sourcePath = sourcePathFor(record);
    const sourceExists = Boolean(sourcePath && fs.existsSync(sourcePath) && fs.statSync(sourcePath).isFile());
    const actualChecksum = sourceExists ? await hashFile(sourcePath) : null;
    const scripture = parseScriptureReference(suggestion?.scriptureReference);
    const translation = APPROVED_TRANSLATIONS.has(record.translation) ? record.translation : "Unknown";
    const recordErrors = [];
    if (!sourceExists) recordErrors.push("source_missing");
    if (actualChecksum !== record.checksumSha256) recordErrors.push("checksum_mismatch");
    if (!record.mimeType?.startsWith("video/") || record.browserPlayable === false) recordErrors.push("browser_unsupported");
    if (record.metadataProbeStatus !== "complete") recordErrors.push("technical_metadata_incomplete");
    if (record.doNotPublish === true || ["blocked", "unsafe", "rejected"].includes(record.reviewStatus)) recordErrors.push("record_blocked");
    if ((record.warnings || []).some((warning) => /corrupt|unsupported|unsafe|blocked/i.test(warning))) recordErrors.push("blocking_warning");
    if (seenChecksums.has(record.checksumSha256)) recordErrors.push("selected_exact_duplicate");
    seenChecksums.add(record.checksumSha256);
    if (!String(suggestion?.title || "").trim() || /review clip|owner must describe/i.test(suggestion?.title || "")) recordErrors.push("invalid_title_suggestion");
    if (!String(suggestion?.description || "").trim() || /owner must describe/i.test(suggestion?.description || "")) recordErrors.push("invalid_description_suggestion");
    if (!scripture) recordErrors.push("invalid_scripture_suggestion");
    if (translation === "Owner reviewed") recordErrors.push("translation_field_corruption");
    if (recordErrors.length) errors.push(`${mediaId}: ${recordErrors.join(", ")}.`);
    records.push({
      recordId: mediaId,
      sequenceOrder: index + 1,
      sourceExists,
      checksumMatches: actualChecksum === record.checksumSha256,
      sourceChecksum: actualChecksum,
      browserSupported: record.mimeType?.startsWith("video/") && record.browserPlayable !== false,
      technicalMetadataComplete: record.metadataProbeStatus === "complete",
      titleSuggestion: suggestion?.title || null,
      descriptionSuggestion: suggestion?.description || null,
      scriptureSuggestion: scripture?.reference || null,
      translation,
      errors: recordErrors
    });
  }

  return {
    valid: errors.length === 0,
    checkedAt: new Date().toISOString(),
    pilotPlanId: state.pilotPlanId,
    sequenceId: SEQUENCE_ID,
    selectedRecordCount: selectedIds.length,
    selectedLongFormCount: (state.candidate.selectedLongFormIds || []).length,
    records,
    sourceChecksums: Object.fromEntries(records.map((record) => [record.recordId, record.sourceChecksum])),
    errors
  };
}

function createOwnerAttestationArtifact(preflight, stateRevisionBeforeApplication, timestamp = new Date().toISOString()) {
  if (!preflight.valid) throw new Error(`Owner attestation preflight failed: ${preflight.errors.join(" ")}`);
  const body = {
    artifactType: "teoyubeworld_pilot_owner_attestation",
    schemaVersion: "1.0.0",
    artifactId: ATTESTATION_ID,
    ownerAttestationText: OWNER_ATTESTATION_TEXT,
    attestationSource: "owner_prompt_instruction",
    pilotPlanId: PILOT_PLAN_ID,
    canonicalStateRevisionBeforeApplication: stateRevisionBeforeApplication,
    selectedRecordIds: preflight.records.map((record) => record.recordId),
    sourceChecksums: { ...preflight.sourceChecksums },
    selectedSequenceId: SEQUENCE_ID,
    proposedSequenceOrder: preflight.records.map((record) => ({ recordId: record.recordId, order: record.sequenceOrder })),
    titleDescriptionAcceptance: { accepted: true, status: "owner_attested", source: "owner_prompt_attestation" },
    scriptureMappingAcceptance: { accepted: true, status: "owner_attested_scripture_confirmed", source: "owner_prompt_attestation" },
    rightsAttestation: { confirmed: true, status: "owner_attested_rights_controlled", externalLegalVerificationClaimed: false },
    safetyAttestation: { confirmed: true, status: "owner_attested_safe_for_pilot", externalSafetyCertificationClaimed: false },
    reviewAttestation: { confirmed: true, status: "owner_attested", independentVerificationByCodex: false },
    longFormSelectedCount: 0,
    timestamp,
    projectPhase: "11.6C.2A.4",
    derivativeExecutionAuthorized: false,
    publicationAuthorized: false,
    externalVerificationClaimed: false
  };
  return checksumArtifact(body);
}

function applyAttestationPatches(attestation, preflight, timestamp = new Date().toISOString()) {
  const state = getCanonicalPilotState();
  const { manifest, sourceChecksum, patches } = loadReviewWorkspace();
  const merged = applyPatches(manifest, patches, sourceChecksum);
  const currentById = new Map(merged.manifest.records.map((record) => [record.id, record]));
  const selectedRecords = preflight.records.map((item) => currentById.get(item.recordId));
  const existingOwner = new Map((patches.owner?.operations || []).map((operation) => [operation.mediaId, operation]));
  const existingSequence = new Map((patches.sequence?.operations || []).map((operation) => [operation.mediaId, operation]));
  const existingPilot = new Map((patches.pilot?.operations || []).map((operation) => [operation.mediaId, operation]));

  const ownerOperations = preflight.records.map((item) => {
    const current = currentById.get(item.recordId);
    const scripture = parseScriptureReference(item.scriptureSuggestion);
    const newValues = {
      title: item.titleSuggestion,
      description: item.descriptionSuggestion,
      mediaKind: "short",
      shortOrLong: "short",
      BibleBook: scripture.BibleBook,
      chapter: scripture.chapter,
      verseStart: scripture.verseStart,
      verseEnd: scripture.verseEnd,
      ScriptureReferences: [scripture.reference],
      translation: item.translation,
      mappingConfidence: "confirmed",
      ScriptureMappingStatus: "confirmed",
      sourceChannel: "TeoyubeWorld",
      copyrightStatus: "owner_owned",
      safetyStatus: "owner_attested_safe_for_pilot",
      reviewStatus: "approved",
      titleSuggested: item.titleSuggestion,
      titleAccepted: item.titleSuggestion,
      titleConfirmed: true,
      descriptionSuggested: item.descriptionSuggestion,
      descriptionAccepted: item.descriptionSuggestion,
      descriptionConfirmed: true,
      scriptureReferenceSuggested: scripture.reference,
      scriptureReferenceAccepted: scripture.reference,
      scriptureConfirmed: true,
      scriptureConfirmedAt: timestamp,
      scriptureConfirmationSource: "owner_prompt_attestation",
      scriptureConfirmationStatus: "owner_attested_scripture_confirmed",
      translationConfirmed: true,
      rightsStatus: "owner_attested_rights_controlled",
      rightsConfirmed: true,
      rightsConfirmedAt: timestamp,
      rightsConfirmationSource: "owner_prompt_attestation",
      rightsAttestationStatus: "owner_attested_rights_controlled",
      safetyConfirmed: true,
      safetyConfirmedAt: timestamp,
      safetyConfirmationSource: "owner_prompt_attestation",
      safetyAttestationStatus: "owner_attested_safe_for_pilot",
      ownerReviewed: true,
      ownerReviewedAt: timestamp,
      ownerReviewVersion: "3.0.0-owner-attested",
      ownerReviewSource: "owner_prompt_attestation",
      ownerReviewAttestationId: attestation.artifactId,
      ownerAttestationStatus: "owner_attested",
      pilotPlanId: PILOT_PLAN_ID,
      attestationArtifactId: attestation.artifactId,
      attestationArtifactChecksum: attestation.artifactChecksumSha256,
      patchSchemaVersion: "2.0.0-owner-attested",
      pilotSelected: true,
      technicalMetadataComplete: true
    };
    return buildOperation(existingOwner.get(current.id), current, newValues, timestamp, "Owner prompt attestation accepted prepared metadata, Scripture, rights, safety, and review status for this selected pilot record.");
  });

  const sequenceOperations = preflight.records.map((item) => {
    const current = currentById.get(item.recordId);
    return buildOperation(existingSequence.get(current.id), current, {
      sequenceId: SEQUENCE_ID,
      sequenceOrder: item.sequenceOrder,
      sequenceTitle: "No Other Gospel - Galatians 1 Opening",
      sequenceDescription: "Owner-attested complete 12-segment Scripture sequence.",
      sequenceReviewStatus: "approved",
      segmentTitle: item.titleSuggestion,
      segmentScripture: item.scriptureSuggestion,
      sequenceRole: "segment",
      sequenceConfirmationSource: "owner_prompt_attestation",
      sequenceConfirmationStatus: "owner_attested_scripture_confirmed",
      sequenceOrderConfirmed: true,
      pilotPlanId: PILOT_PLAN_ID,
      attestationArtifactId: attestation.artifactId,
      attestationArtifactChecksum: attestation.artifactChecksumSha256,
      patchSchemaVersion: "2.0.0-owner-attested"
    }, timestamp, "Owner prompt attestation confirmed the one complete 12-segment pilot sequence and contiguous order.");
  });

  const pilotOperations = preflight.records.map((item) => {
    const current = currentById.get(item.recordId);
    return buildOperation(existingPilot.get(current.id), current, {
      pilotSelected: true,
      pilotPlanId: PILOT_PLAN_ID,
      attestationArtifactId: attestation.artifactId,
      attestationArtifactChecksum: attestation.artifactChecksumSha256,
      patchSchemaVersion: "2.0.0-owner-attested"
    }, timestamp, "Owner prompt attestation confirmed this record belongs to the 12-record pilot.");
  });

  const ownerPatch = buildChecksumBoundPatch(patches.owner, selectedRecords, ownerOperations, sourceChecksum, attestation, timestamp, "local_project_owner_via_prompt_attestation");
  const sequencePatch = buildChecksumBoundPatch(patches.sequence, selectedRecords, sequenceOperations, sourceChecksum, attestation, timestamp, "local_project_owner_via_prompt_attestation");
  const pilotPatch = buildChecksumBoundPatch(patches.pilot, selectedRecords, pilotOperations, sourceChecksum, attestation, timestamp, "local_project_owner_via_prompt_attestation");
  for (const [name, patch] of [["owner", ownerPatch], ["sequence", sequencePatch], ["pilot", pilotPatch]]) {
    const validation = validatePatch(patch, manifest, sourceChecksum, name);
    if (!validation.valid) throw new Error(`${name} attestation patch is invalid: ${validation.errors.join(" ")}`);
  }
  writeJson(patchPaths.owner, ownerPatch);
  writeJson(patchPaths.sequence, sequencePatch);
  writeJson(patchPaths.pilot, pilotPatch);

  const declarations = {
    schemaVersion: "3.0.0",
    declarationVersion: "3.0.0-owner-attested",
    pilotPlanId: PILOT_PLAN_ID,
    manifestVersion: state.manifestVersion,
    appliedAt: timestamp,
    selectedRecordIds: preflight.records.map((item) => item.recordId),
    sourceChecksums: { ...preflight.sourceChecksums },
    attestationArtifactId: attestation.artifactId,
    attestationArtifactChecksum: attestation.artifactChecksumSha256,
    declarations: Object.fromEntries(["watchedAndReviewed", "rights", "scriptureAndSequence", "safety"].map((name) => [name, {
      confirmed: true,
      confirmedAt: timestamp,
      confirmedBy: "local_project_owner",
      source: "owner_prompt_attestation"
    }])),
    localOnly: true,
    runtimeManifestUpdated: false
  };
  writeJson(ownerReconfirmationPath, declarations);
  writeJson(ownerDeclarationsPath, {
    schemaVersion: "2.0.0",
    sourceDraftManifestChecksum: sourceChecksum,
    updatedAt: timestamp,
    attestationArtifactId: attestation.artifactId,
    attestationArtifactChecksum: attestation.artifactChecksumSha256,
    declarations: Object.fromEntries(["rights", "scripture", "safety"].map((name) => [name, {
      confirmed: true,
      confirmedAt: timestamp,
      confirmedBy: "local_project_owner",
      source: "owner_prompt_attestation"
    }])),
    localOnly: true,
    runtimeManifestUpdated: false
  });

  const sequenceArtifact = checksumArtifact({
    artifactType: "teoyubeworld_owner_attested_sequence_confirmation",
    schemaVersion: "1.0.0",
    artifactId: `owner-confirmation-${SEQUENCE_ID}`,
    sequenceId: SEQUENCE_ID,
    sequenceTitle: "No Other Gospel - Galatians 1 Opening",
    acceptedScripturePassage: "Galatians 1:1-12",
    segmentIds: preflight.records.map((item) => item.recordId),
    contiguousSequenceOrder: preflight.records.map((item) => item.sequenceOrder),
    sourceChecksums: { ...preflight.sourceChecksums },
    ownerAttestationArtifactId: attestation.artifactId,
    ownerAttestationArtifactChecksum: attestation.artifactChecksumSha256,
    sequenceConfirmed: true,
    sequenceConfirmationSource: "owner_prompt_attestation",
    sequenceOrderConfirmed: true,
    confirmedAt: timestamp,
    derivativeExecutionAuthorized: false,
    publicationAuthorized: false
  });
  writeJson(sequenceConfirmationPath, sequenceArtifact);
  return { ownerPatch, sequencePatch, pilotPatch, declarations, sequenceArtifact };
}

async function completeEmergencyGateRecovery() {
  for (const forbiddenPath of [lifecyclePaths.derivativeExecutionAuthorization, lifecyclePaths.derivatives, lifecyclePaths.derivativeValidation, lifecyclePaths.publicationAuthorization, lifecyclePaths.publicationReceipt]) {
    if (fs.existsSync(forbiddenPath)) throw new Error(`A downstream lifecycle artifact already exists: ${path.basename(forbiddenPath)}.`);
  }
  const canonicalBefore = ensureCanonicalStateRevision("phase_11_6c2a4_pre_attestation_freeze");
  const gateBefore = await validateTeoyubeWorldOwnerGate();
  const backup = createPreAttestationBackup(gateBefore);
  const preflight = await validateAttestationPreflight();
  if (!preflight.valid) throw new Error(`Attestation preflight failed: ${preflight.errors.join(" ")}`);

  const timestamp = new Date().toISOString();
  const attestation = createOwnerAttestationArtifact(preflight, canonicalBefore.stateRevision, timestamp);
  assertNoAbsoluteAppPath(attestation, "Owner attestation artifact");
  writeJson(ownerAttestationPath, attestation);
  const applied = applyAttestationPatches(attestation, preflight, timestamp);
  const postAttestationRevision = incrementCanonicalStateRevision("owner_prompt_attestation_applied");
  const zeroBlockerGate = await validateTeoyubeWorldOwnerGate();
  if (!zeroBlockerGate.gatePassed || zeroBlockerGate.blockerCount !== 0) {
    throw new Error(`Canonical gate did not reach zero blockers: ${zeroBlockerGate.blockers.map((blocker) => blocker.blockerId).join(", ")}`);
  }

  const postState = getCanonicalPilotState();
  const acceptedTitles = Object.fromEntries(postState.selectedRecords.map((record) => [record.id, record.titleAccepted]));
  const acceptedScriptureMappings = Object.fromEntries(postState.selectedRecords.map((record) => [record.id, record.scriptureReferenceAccepted]));
  const rightsStatusSummary = Object.fromEntries(postState.selectedRecords.map((record) => [record.id, record.rightsStatus]));
  const safetyStatusSummary = Object.fromEntries(postState.selectedRecords.map((record) => [record.id, record.safetyStatus]));
  const approval = requestOwnerApproval(zeroBlockerGate, {
    ownerConfirmation: true,
    confirmedBy: "local_project_owner_via_prompt_attestation",
    ownerAttestationArtifactId: attestation.artifactId,
    ownerAttestationArtifactChecksum: attestation.artifactChecksumSha256,
    approvalRevision: postAttestationRevision.stateRevision,
    acceptedTitles,
    acceptedScriptureMappings,
    rightsStatusSummary,
    safetyStatusSummary
  });
  if (approval.statusCode !== 201 || !verifyArtifactChecksum(approval.payload.approvalArtifact)) throw new Error("The canonical owner approval artifact was not created with a valid checksum.");
  const finalRevision = incrementCanonicalStateRevision("checksum_bound_owner_approval_recorded");
  const finalGate = await validateTeoyubeWorldOwnerGate();

  return {
    valid: finalGate.gatePassed && finalGate.blockerCount === 0,
    phase: "11.6C.2A.4",
    backupPath: path.relative(generatedRoot, backup.outputPath).replace(/\\/g, "/"),
    preflight,
    attestation,
    applied,
    stateRevisionBefore: canonicalBefore.stateRevision,
    stateRevisionAfterAttestation: postAttestationRevision.stateRevision,
    stateRevisionAfterApproval: finalRevision.stateRevision,
    gateBefore,
    zeroBlockerGate,
    finalGate,
    approval: approval.payload.approvalArtifact,
    derivativeExecutionAuthorized: false,
    publicationAuthorized: false,
    mediaFilesCopied: 0,
    mediaFilesTranscoded: 0,
    publicFilesWritten: 0,
    sourceFilesModified: 0
  };
}

module.exports = {
  PILOT_PLAN_ID,
  SEQUENCE_ID,
  ATTESTATION_ID,
  OWNER_ATTESTATION_TEXT,
  ownerApprovalsRoot,
  gateRecoveryRoot,
  ownerAttestationPath,
  sequenceConfirmationPath,
  hashFile,
  checksumArtifact,
  verifyArtifactChecksum,
  createPreAttestationBackup,
  validateAttestationPreflight,
  createOwnerAttestationArtifact,
  applyAttestationPatches,
  backfillPersistedAttestationOperationBindings,
  refreshCanonicalApprovalAfterBindingRepair,
  completeEmergencyGateRecovery
};
