const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const {
  generatedRoot,
  reportsRoot,
  loadReviewWorkspace,
  applyPatches,
  writeJson
} = require("./teoyubeWorldReviewPatches.cjs");
const {
  assistedCandidatePath,
  sourcePathFor
} = require("./teoyubeWorldAssistedPilot.cjs");

const reviewRoot = path.join(generatedRoot, "review");
const canonicalRevisionPath = path.join(reviewRoot, "canonical-pilot-state-revision.json");
const canonicalGateSnapshotPath = path.join(reportsRoot, "phase-11-6c2a3-canonical-gate-snapshot.json");
const ownerReconfirmationPath = path.join(reviewRoot, "assisted-pilot-owner-reconfirmation.json");
const ownerAttestationPath = path.join(generatedRoot, "owner-approvals", "pilot-2322459e34ba7e5f9645-owner-attestation.json");
const OWNER_RECONFIRMATION_VERSION = "2.0.0";
const APPROVED_TRANSLATIONS = new Set([
  "Unknown", "KJV", "NKJV", "NIV", "ESV", "NASB", "NLT", "CSB", "NRSV", "AMP", "WEB"
]);
const APPROVED_RIGHTS_STATUSES = new Set([
  "owner_created", "owner_controlled", "licensed", "permission_granted", "public_domain", "not_approved",
  "owner_attested_rights_controlled"
]);
const APPROVED_SAFETY_STATUSES = new Set([
  "approved_for_pilot", "needs_revision", "blocked", "unknown", "owner_attested_safe_for_pilot"
]);

const selectedRecordSchemaFields = Object.freeze([
  "recordId", "sourceChecksum", "ownerReviewed", "ownerReviewedAt", "ownerReviewVersion",
  "titleSuggested", "titleAccepted", "titleConfirmed", "descriptionSuggested", "descriptionAccepted",
  "descriptionConfirmed", "scriptureReferenceSuggested", "scriptureReferenceAccepted", "scriptureConfirmed",
  "scriptureConfirmedAt", "BibleBook", "chapter", "verseStart", "verseEnd", "translation",
  "translationConfirmed", "sourceChannel", "rightsStatus", "rightsConfirmed", "rightsConfirmedAt",
  "safetyStatus", "safetyConfirmed", "safetyConfirmedAt", "sequenceId", "sequenceOrder", "pilotSelected",
  "technicalMetadataComplete", "warnings"
]);

const noOtherGospelSuggestions = Object.freeze([
  ["Galatians 1:1", "Paul, an Apostle", "Paul introduces his apostleship as coming through Jesus Christ and God the Father."],
  ["Galatians 1:1", "Not From Men", "The opening identifies Paul as an apostle whose commission is not from human authority."],
  ["Galatians 1:2", "The Brethren With Me", "Paul includes the believers with him in the greeting."],
  ["Galatians 1:2", "To the Churches of Galatia", "The letter is addressed to the churches of Galatia."],
  ["Galatians 1:3", "Grace and Peace", "The greeting offers grace and peace from God the Father and the Lord Jesus Christ."],
  ["Galatians 1:4", "He Gave Himself", "The segment presents Christ giving himself for our sins."],
  ["Galatians 1:4", "Delivered From This Present Evil World", "The segment continues the purpose statement about deliverance according to the Father's will."],
  ["Galatians 1:5", "Glory For Ever", "The opening doxology gives glory to God for ever and ever."],
  ["Galatians 1:6", "So Soon Removed", "Paul expresses concern that the Galatians are turning from the grace of Christ."],
  ["Galatians 1:6-7", "Another Gospel", "The segment warns about turning to a different message that is not another true gospel."],
  ["Galatians 1:8-9", "No Other Gospel", "The warning rejects preaching a gospel contrary to what the churches received."],
  ["Galatians 1:11-12", "The Gospel Was Not From Man", "Paul explains that the gospel he preached was not received from human origin." ]
]);

function readJson(filePath, fallback = null) {
  try {
    return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, "utf8")) : fallback;
  } catch {
    return fallback;
  }
}

function fingerprint(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function verifyChecksumBoundArtifact(artifact) {
  if (!artifact?.artifactChecksumSha256) return false;
  const { artifactChecksumSha256, ...body } = artifact;
  return fingerprint(body) === artifactChecksumSha256;
}

function getValidOwnerAttestation(state = getCanonicalPilotState()) {
  const artifact = readJson(ownerAttestationPath, null);
  if (!verifyChecksumBoundArtifact(artifact) || artifact.pilotPlanId !== state.pilotPlanId) return null;
  const selectedIds = state.candidate.selectedShortIds || [];
  const checksums = Object.fromEntries(state.candidateRecords.map((record) => [record.id, record.checksumSha256]));
  if (fingerprint(artifact.selectedRecordIds || []) !== fingerprint(selectedIds)) return null;
  if (fingerprint(artifact.sourceChecksums || {}) !== fingerprint(checksums)) return null;
  if (artifact.derivativeExecutionAuthorized !== false || artifact.publicationAuthorized !== false) return null;
  return artifact;
}

function derivePilotPlanId(candidate, sourceChecksum) {
  const selected = [...(candidate?.selectedShortIds || [])].sort();
  return `pilot-${fingerprint({ sourceChecksum, selected }).slice(0, 20)}`;
}

function suggestionFor(record, index) {
  const existing = readJson(assistedCandidatePath, {})?.metadataSuggestions?.find((item) => item.mediaId === record.id) || {};
  const isNoOtherGospel = /(?:^|\/)No Other Gospel(?:\/|$)/i.test(String(record.relativeSourcePath || ""));
  const local = isNoOtherGospel ? noOtherGospelSuggestions[index] : null;
  const scriptureReference = local?.[0] || existing.probableScriptureReference || null;
  const segment = String(index + 1).padStart(2, "0");
  return {
    title: local ? `No Other Gospel - Segment ${segment} - ${local[1]}` : (existing.title || record.title || record.sourceFileName),
    description: local
      ? `${local[2]} This is a short Scripture-animation segment prepared for owner review on local Teoyube pilot surfaces.`
      : (existing.description || record.description || ""),
    scriptureReference,
    translation: "Unknown",
    confidence: local ? "probable" : (existing.confidence || "needs_review"),
    evidenceSummary: local
      ? "Local source-family order and visible text in the generated contact sheet align with the opening of Galatians 1."
      : "Local draft metadata only; owner confirmation is required.",
    warnings: [
      ...(existing.warnings || []),
      "This is a local suggestion, not an owner-confirmed Scripture mapping."
    ],
    recommendedSurfaces: existing.recommendedSurfaces || record.recommendedSurfaces || []
  };
}

function emptyOwnerReconfirmation(pilotPlanId, manifestVersion, selectedRecords) {
  return {
    schemaVersion: OWNER_RECONFIRMATION_VERSION,
    declarationVersion: OWNER_RECONFIRMATION_VERSION,
    pilotPlanId,
    manifestVersion,
    appliedAt: null,
    selectedRecordIds: selectedRecords.map((record) => record.id),
    sourceChecksums: Object.fromEntries(selectedRecords.map((record) => [record.id, record.checksumSha256])),
    declarations: {
      watchedAndReviewed: { confirmed: false, confirmedAt: null },
      rights: { confirmed: false, confirmedAt: null },
      scriptureAndSequence: { confirmed: false, confirmedAt: null },
      safety: { confirmed: false, confirmedAt: null }
    },
    localOnly: true,
    runtimeManifestUpdated: false
  };
}

function getCanonicalOwnerReconfirmation(pilotPlanId, manifestVersion, selectedRecords) {
  const empty = emptyOwnerReconfirmation(pilotPlanId, manifestVersion, selectedRecords);
  const saved = readJson(ownerReconfirmationPath, null);
  const checksums = Object.fromEntries(selectedRecords.map((record) => [record.id, record.checksumSha256]));
  if (!saved || saved.pilotPlanId !== pilotPlanId || saved.manifestVersion !== manifestVersion ||
      fingerprint(saved.selectedRecordIds || []) !== fingerprint(empty.selectedRecordIds) ||
      fingerprint(saved.sourceChecksums || {}) !== fingerprint(checksums)) return empty;
  return {
    ...empty,
    ...saved,
    declarations: { ...empty.declarations, ...(saved.declarations || {}) }
  };
}

function getCanonicalPilotState() {
  const candidate = readJson(assistedCandidatePath, null);
  if (!candidate) throw new Error("The assisted pilot candidate is unavailable.");
  const { manifest, sourceChecksum, patches } = loadReviewWorkspace();
  const merged = applyPatches(manifest, patches, sourceChecksum);
  const candidateIds = new Set(candidate.selectedShortIds || []);
  const candidateRecords = merged.manifest.records.filter((record) => candidateIds.has(record.id));
  const selectedRecords = candidateRecords.filter((record) => record.pilotSelected === true);
  const pilotPlanId = derivePilotPlanId(candidate, sourceChecksum);
  const manifestVersion = manifest.schemaVersion || manifest.version || "unknown";
  const ownerReconfirmation = getCanonicalOwnerReconfirmation(pilotPlanId, manifestVersion, selectedRecords);
  const suggestions = Object.fromEntries(candidateRecords.map((record, index) => [record.id, suggestionFor(record, index)]));
  return {
    candidate: { ...candidate, pilotPlanId, manifestVersion, metadataSuggestions: Object.entries(suggestions).map(([mediaId, value]) => ({ mediaId, ...value })) },
    manifest,
    sourceChecksum,
    patches,
    merged,
    candidateRecords,
    selectedRecords,
    pilotPlanId,
    manifestVersion,
    ownerReconfirmation,
    suggestions
  };
}

function getCanonicalOwnerReviewPatches() {
  const state = getCanonicalPilotState();
  return state.patches.owner?.operations || [];
}

function getCanonicalSequenceState(state = getCanonicalPilotState()) {
  const approved = state.selectedRecords
    .filter((record) => record.sequenceReviewStatus === "approved" && record.sequenceId)
    .sort((left, right) => Number(left.sequenceOrder) - Number(right.sequenceOrder));
  const suggestedOrder = state.candidate.selectedShortIds.filter((id) => state.selectedRecords.some((record) => record.id === id));
  return {
    sequenceId: approved[0]?.sequenceId || null,
    title: approved[0]?.sequenceTitle || null,
    scriptureReference: approved[0]?.segmentScripture || null,
    confirmed: approved.length > 0 && approved.length === new Set(approved.map((record) => record.sequenceId)).size * approved.length,
    segmentIds: approved.map((record) => record.id),
    suggestedSequenceId: state.candidate.recommendedSequenceId,
    suggestedSegmentIds: suggestedOrder,
    standaloneRecordIds: state.selectedRecords.filter((record) => !approved.some((item) => item.id === record.id)).map((record) => record.id)
  };
}

function getCanonicalDeclarationState(state = getCanonicalPilotState()) {
  return state.ownerReconfirmation;
}

function normalizeCanonicalRecord(record, suggestion) {
  const acceptedScripture = String(record.scriptureReferenceAccepted || record.ScriptureReferences?.[0] || "").trim();
  return {
    ...record,
    recordId: record.id,
    sourceChecksum: record.checksumSha256,
    ownerReviewed: record.ownerReviewed === true,
    ownerReviewedAt: record.ownerReviewedAt || null,
    ownerReviewVersion: record.ownerReviewVersion || null,
    titleSuggested: suggestion.title,
    titleAccepted: record.titleAccepted || null,
    titleConfirmed: record.titleConfirmed === true,
    descriptionSuggested: suggestion.description,
    descriptionAccepted: record.descriptionAccepted || null,
    descriptionConfirmed: record.descriptionConfirmed === true,
    scriptureReferenceSuggested: suggestion.scriptureReference,
    scriptureReferenceAccepted: acceptedScripture || null,
    scriptureConfirmed: record.scriptureConfirmed === true,
    scriptureConfirmedAt: record.scriptureConfirmedAt || null,
    translation: APPROVED_TRANSLATIONS.has(record.translation) ? record.translation : "Unknown",
    translationConfirmed: record.translationConfirmed === true,
    rightsStatus: APPROVED_RIGHTS_STATUSES.has(record.rightsStatus) ? record.rightsStatus : "not_approved",
    rightsConfirmed: record.rightsConfirmed === true,
    rightsConfirmedAt: record.rightsConfirmedAt || null,
    safetyStatus: APPROVED_SAFETY_STATUSES.has(record.safetyStatus) ? record.safetyStatus : (record.safetyStatus === "approved" ? "approved_for_pilot" : "unknown"),
    safetyConfirmed: record.safetyConfirmed === true,
    safetyConfirmedAt: record.safetyConfirmedAt || null,
    technicalMetadataComplete: record.metadataProbeStatus === "complete",
    suggestionConfidence: suggestion.confidence,
    suggestionEvidence: suggestion.evidenceSummary,
    warnings: [...new Set([...(record.warnings || []), ...(suggestion.warnings || [])])]
  };
}

function currentStateFingerprint(state = getCanonicalPilotState()) {
  return fingerprint({
    sourceChecksum: state.sourceChecksum,
    pilotPlanId: state.pilotPlanId,
    selected: state.selectedRecords.map((record) => record.id),
    patches: Object.fromEntries(Object.entries(state.patches).map(([name, patch]) => [name, patch ? fingerprint(patch) : null])),
    ownerReconfirmation: state.ownerReconfirmation
  });
}

function ensureCanonicalStateRevision(reason = "canonical_state_loaded") {
  const state = getCanonicalPilotState();
  const stateFingerprint = currentStateFingerprint(state);
  const current = readJson(canonicalRevisionPath, null);
  if (current?.stateFingerprint === stateFingerprint) return current;
  const next = {
    schemaVersion: "1.0.0",
    revisionNumber: Number(current?.revisionNumber || 0) + 1,
    stateRevision: `pilot-r${Number(current?.revisionNumber || 0) + 1}-${stateFingerprint.slice(0, 12)}`,
    stateFingerprint,
    updatedAt: new Date().toISOString(),
    reason,
    pilotPlanId: state.pilotPlanId,
    manifestVersion: state.manifestVersion
  };
  writeJson(canonicalRevisionPath, next);
  return next;
}

function incrementCanonicalStateRevision(reason) {
  const current = readJson(canonicalRevisionPath, null);
  const state = getCanonicalPilotState();
  const stateFingerprint = currentStateFingerprint(state);
  const nextNumber = Number(current?.revisionNumber || 0) + 1;
  const next = {
    schemaVersion: "1.0.0",
    revisionNumber: nextNumber,
    stateRevision: `pilot-r${nextNumber}-${stateFingerprint.slice(0, 12)}`,
    stateFingerprint,
    updatedAt: new Date().toISOString(),
    reason,
    pilotPlanId: state.pilotPlanId,
    manifestVersion: state.manifestVersion
  };
  writeJson(canonicalRevisionPath, next);
  return next;
}

function assertCurrentStateRevision(expectedRevision) {
  const current = ensureCanonicalStateRevision();
  if (!expectedRevision || expectedRevision !== current.stateRevision) {
    const error = new Error("The review state changed. Refresh the canonical wizard state before saving.");
    error.statusCode = 409;
    error.code = "stale_state_revision";
    error.canonicalRevision = current;
    throw error;
  }
  return current;
}

function blockerCategory(code) {
  if (/technical|patch_validation|media_kind|source_channel/.test(code)) return "technical";
  if (/title|description|record_metadata|owner_patch/.test(code)) return "record_metadata";
  if (/owner_review|watched/.test(code)) return "owner_review";
  if (/scripture|translation/.test(code)) return "scripture";
  if (/rights|copyright/.test(code)) return "rights";
  if (/safety/.test(code)) return "safety";
  if (/sequence/.test(code)) return "sequence";
  if (/duplicate/.test(code)) return "duplicate";
  if (/checksum|missing_source|absolute/.test(code)) return "checksum_source";
  if (/short_count|long_form_count|pilot/.test(code)) return "pilot_count";
  if (/approval/.test(code)) return "approval_artifact";
  return "technical";
}

function blockerAction(blocker) {
  const category = blockerCategory(blocker.code);
  const actions = {
    technical: "Re-run canonical technical validation.", record_metadata: "Open the record and accept or edit its title and description.",
    owner_review: "Use the final owner reconfirmation after reviewing the record.", scripture: "Accept or edit the Scripture suggestion, then confirm it in the final reconfirmation.",
    rights: "Select an explicit rights status and complete the rights reconfirmation.", safety: "Select an explicit safety status and complete the safety reconfirmation.",
    sequence: "Open Sequence and confirm one contiguous sequence.", duplicate: "Review the pilot-scoped duplicate decision.",
    checksum_source: "Re-run source and checksum validation.", pilot_count: "Restore exactly 12 selected shorts and no long-form records.",
    approval_artifact: "Complete all blockers before owner approval."
  };
  return actions[category];
}

function requirementIdForBlocker(blocker) {
  const mediaId = blocker.mediaId || "pilot";
  const code = String(blocker.code || "unknown");
  if (/^(title|description|record_metadata)/.test(code)) return `record:${mediaId}:metadata`;
  if (/^(scripture|translation)/.test(code) && !/_declaration$/.test(code)) return `record:${mediaId}:scripture`;
  if (/^(rights|copyright)/.test(code) && !/_declaration$/.test(code)) return `record:${mediaId}:rights`;
  if (/^safety/.test(code) && !/_declaration$/.test(code)) return `record:${mediaId}:safety`;
  if (/^(owner_review|owner_patch)/.test(code)) return `record:${mediaId}:owner_review`;
  if (/sequence/.test(code) && !/_declaration$/.test(code)) return "pilot:sequence";
  if (/short_count|long_form_count/.test(code)) return `pilot:${code}`;
  if (/_declaration$/.test(code)) return `pilot:attestation:${code.replace(/_declaration$/, "")}`;
  if (/duplicate/.test(code)) return `record:${mediaId}:duplicate`;
  if (/checksum|missing_source|absolute/.test(code)) return `record:${mediaId}:source_integrity:${code}`;
  return `${mediaId}:${code}`;
}

function calculateCanonicalPilotRequirements(baseBlockers, state = getCanonicalPilotState()) {
  const requirements = [...baseBlockers].map((blocker) => ({ ...blocker, requirementId: requirementIdForBlocker(blocker) }));
  for (const record of state.selectedRecords) {
    const normalized = normalizeCanonicalRecord(record, state.suggestions[record.id]);
    if (!normalized.titleConfirmed || !normalized.titleAccepted || !normalized.descriptionConfirmed || !normalized.descriptionAccepted) {
      requirements.push({ code: "record_metadata_confirmation", mediaId: record.id, message: "Accepted and confirmed title and description are required.", requirementId: `record:${record.id}:metadata` });
    }
    if (!normalized.ownerReviewed) {
      requirements.push({ code: "owner_review", mediaId: record.id, message: "Owner review confirmation is required.", requirementId: `record:${record.id}:owner_review` });
    }
    if (!normalized.scriptureReferenceAccepted || !normalized.scriptureConfirmed || !normalized.translationConfirmed) {
      requirements.push({ code: "scripture_review", mediaId: record.id, message: "Accepted Scripture, translation status, and owner confirmation are required.", requirementId: `record:${record.id}:scripture` });
    }
    if (!normalized.rightsConfirmed || normalized.rightsStatus === "not_approved") {
      requirements.push({ code: "rights", mediaId: record.id, message: "An eligible owner-attested rights status is required.", requirementId: `record:${record.id}:rights` });
    }
    if (!normalized.safetyConfirmed || !["approved_for_pilot", "owner_attested_safe_for_pilot"].includes(normalized.safetyStatus)) {
      requirements.push({ code: "safety", mediaId: record.id, message: "An eligible owner-attested pilot safety status is required.", requirementId: `record:${record.id}:safety` });
    }
  }
  for (const [name, value] of Object.entries(state.ownerReconfirmation.declarations)) {
    if (value?.confirmed !== true) requirements.push({
      code: `${name}_declaration`,
      mediaId: null,
      message: `The ${name} pilot-level owner attestation is required.`,
      requirementId: `pilot:attestation:${name}`
    });
  }
  return requirements;
}

function applyOwnerAttestationToRequirements(requirements, state = getCanonicalPilotState()) {
  const attestation = getValidOwnerAttestation(state);
  if (!attestation) return requirements;
  return requirements.filter((requirement) => !String(requirement.requirementId || "").startsWith("pilot:attestation:"));
}

function calculateDeduplicatedPilotBlockers(requirements) {
  const unique = new Map();
  for (const requirement of requirements) {
    const requirementId = requirement.requirementId || requirementIdForBlocker(requirement);
    if (!unique.has(requirementId)) unique.set(requirementId, { ...requirement, requirementId });
  }
  return [...unique.values()].sort((left, right) => left.requirementId.localeCompare(right.requirementId)).map((blocker) => {
    const category = blockerCategory(blocker.code);
    const technical = ["technical", "duplicate", "checksum_source"].includes(category);
    return {
      ...blocker,
      blockerId: `requirement:${blocker.requirementId}`,
      category,
      requiredAction: blockerAction(blocker),
      codexCanFixTechnically: technical,
      ownerConfirmationRequired: !technical
    };
  });
}

function getCanonicalPilotGateResult(baseBlockers, state = getCanonicalPilotState()) {
  const requirements = calculateCanonicalPilotRequirements(baseBlockers, state);
  const outstandingRequirements = applyOwnerAttestationToRequirements(requirements, state);
  const blockers = calculateDeduplicatedPilotBlockers(outstandingRequirements);
  return { requirements, outstandingRequirements, blockers, blockerCount: blockers.length, gatePassed: blockers.length === 0 };
}

function calculateCanonicalPilotBlockers(baseBlockers, state = getCanonicalPilotState()) {
  return getCanonicalPilotGateResult(baseBlockers, state).blockers;
}

function blockersByCategory(blockers) {
  const categories = ["technical", "record_metadata", "owner_review", "scripture", "rights", "safety", "sequence", "duplicate", "checksum_source", "pilot_count", "approval_artifact"];
  return Object.fromEntries(categories.map((category) => [category, blockers.filter((blocker) => blocker.category === category).length]));
}

function persistCanonicalGateSnapshot(snapshot) {
  writeJson(canonicalGateSnapshotPath, snapshot);
  return snapshot;
}

module.exports = {
  APPROVED_TRANSLATIONS,
  APPROVED_RIGHTS_STATUSES,
  APPROVED_SAFETY_STATUSES,
  selectedRecordSchemaFields,
  canonicalRevisionPath,
  canonicalGateSnapshotPath,
  ownerReconfirmationPath,
  ownerAttestationPath,
  OWNER_RECONFIRMATION_VERSION,
  derivePilotPlanId,
  getCanonicalPilotState,
  getCanonicalOwnerReviewPatches,
  getCanonicalSequenceState,
  getCanonicalDeclarationState,
  getCanonicalOwnerReconfirmation,
  emptyOwnerReconfirmation,
  normalizeCanonicalRecord,
  ensureCanonicalStateRevision,
  incrementCanonicalStateRevision,
  assertCurrentStateRevision,
  verifyChecksumBoundArtifact,
  getValidOwnerAttestation,
  calculateCanonicalPilotRequirements,
  applyOwnerAttestationToRequirements,
  calculateDeduplicatedPilotBlockers,
  getCanonicalPilotGateResult,
  calculateCanonicalPilotBlockers,
  blockersByCategory,
  persistCanonicalGateSnapshot,
  sourcePathFor,
  readJson
};
