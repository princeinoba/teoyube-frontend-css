import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { getResearchStudy } from "../../domain/research/research-event-registry";
import {
  ResearchBoundaryError,
  type ResearchSessionEnvelopePayload,
  type ResearchSessionEnvelopeVerifier,
  type VerifiedResearchSession
} from "../../domain/research/research-contracts";

type IssueSyntheticResearchEnvelope = Readonly<{
  studyId: "teoyube-phase4b-synthetic";
  participantId: `synthetic-${string}`;
  sessionId: `synthetic-${string}`;
  issuedAt: string;
  expiresAt: string;
  allowedTaskIds: readonly string[];
  consentRecordIds: ResearchSessionEnvelopePayload["consentRecordIds"];
  recordingAllowed: boolean;
  liveAiTaskAllowed: boolean;
  accessibilityObservationAllowed: boolean;
  cohort: "synthetic_ordinary" | "synthetic_expert";
}>;

function encode(value: unknown): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function parsePayload(encoded: string): ResearchSessionEnvelopePayload {
  try {
    const value: unknown = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("invalid");
    return value as ResearchSessionEnvelopePayload;
  } catch {
    throw new ResearchBoundaryError("research_envelope_malformed");
  }
}

export class ResearchSessionEnvelopeService implements ResearchSessionEnvelopeVerifier {
  private readonly revokedEnvelopeIds = new Set<string>();

  constructor(
    private readonly signingKey: Uint8Array,
    private readonly keyId: string,
    private readonly now: () => string
  ) {
    if (signingKey.byteLength < 32) throw new ResearchBoundaryError("research_envelope_key_invalid");
  }

  issueSynthetic(request: IssueSyntheticResearchEnvelope): string {
    const study = getResearchStudy(request.studyId);
    if (study.status !== "synthetic_test_only" || study.realParticipantCollectionAuthorized) {
      throw new ResearchBoundaryError("research_real_participant_not_authorized");
    }
    if (!request.participantId.startsWith("synthetic-") || !request.sessionId.startsWith("synthetic-")) {
      throw new ResearchBoundaryError("research_real_participant_not_authorized");
    }
    if (request.allowedTaskIds.length === 0 || request.allowedTaskIds.some((taskId) => !study.allowedTaskIds.includes(taskId))) {
      throw new ResearchBoundaryError("research_task_not_allowed");
    }
    const issuedAt = Date.parse(request.issuedAt);
    const expiresAt = Date.parse(request.expiresAt);
    if (!Number.isFinite(issuedAt) || !Number.isFinite(expiresAt) || expiresAt <= issuedAt || expiresAt - issuedAt > 2 * 60 * 60 * 1000) {
      throw new ResearchBoundaryError("research_envelope_lifetime_invalid");
    }
    const payload: ResearchSessionEnvelopePayload = Object.freeze({
      schemaVersion: "1.0.0",
      studyId: request.studyId,
      participantId: request.participantId,
      sessionId: request.sessionId,
      issuedAt: request.issuedAt,
      expiresAt: request.expiresAt,
      allowedTaskIds: Object.freeze([...request.allowedTaskIds]),
      consentRecordIds: Object.freeze({ ...request.consentRecordIds }),
      recordingAllowed: request.recordingAllowed,
      liveAiTaskAllowed: request.liveAiTaskAllowed,
      accessibilityObservationAllowed: request.accessibilityObservationAllowed,
      cohort: request.cohort,
      issuer: "teoyube-local-research-operator",
      keyId: this.keyId,
      nonce: randomBytes(16).toString("base64url")
    });
    const encoded = encode(payload);
    const signature = createHmac("sha256", this.signingKey).update(encoded, "utf8").digest("base64url");
    return `${encoded}.${signature}`;
  }

  verify(token: string, now = this.now()): VerifiedResearchSession {
    const [encoded, signature, extra] = token.split(".");
    if (!encoded || !signature || extra) throw new ResearchBoundaryError("research_envelope_malformed");
    const expected = createHmac("sha256", this.signingKey).update(encoded, "utf8").digest();
    const supplied = Buffer.from(signature, "base64url");
    if (expected.byteLength !== supplied.byteLength || !timingSafeEqual(expected, supplied)) {
      throw new ResearchBoundaryError("research_envelope_signature_invalid");
    }
    const payload = parsePayload(encoded);
    const study = getResearchStudy(payload.studyId);
    if (payload.schemaVersion !== "1.0.0" || payload.keyId !== this.keyId || payload.issuer !== "teoyube-local-research-operator") {
      throw new ResearchBoundaryError("research_envelope_contract_invalid");
    }
    if (!payload.participantId.startsWith("synthetic-") || !payload.sessionId.startsWith("synthetic-") || study.status !== "synthetic_test_only") {
      throw new ResearchBoundaryError("research_real_participant_not_authorized");
    }
    if (Date.parse(now) >= Date.parse(payload.expiresAt)) throw new ResearchBoundaryError("research_envelope_expired");
    const envelopeId = createHash("sha256").update(token, "utf8").digest("hex");
    if (this.revokedEnvelopeIds.has(envelopeId)) throw new ResearchBoundaryError("research_envelope_revoked");
    return Object.freeze({ payload: Object.freeze(payload), envelopeId });
  }

  revoke(token: string): void {
    this.revokedEnvelopeIds.add(createHash("sha256").update(token, "utf8").digest("hex"));
  }

  isRevoked(envelopeId: string): boolean {
    return this.revokedEnvelopeIds.has(envelopeId);
  }
}
