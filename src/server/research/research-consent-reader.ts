import type { ConsentLedger, PurposeId } from "../../domain/memory/memory-contracts";
import type {
  ResearchConsentReader,
  ResearchConsentState,
  ResearchParticipantId
} from "../../domain/research/research-contracts";

export class ConsentLedgerResearchConsentReader implements ResearchConsentReader {
  constructor(
    private readonly consentLedger: ConsentLedger,
    private readonly now: () => string
  ) {}

  async getEffectiveConsent(
    participantId: ResearchParticipantId,
    purposeId: PurposeId
  ): Promise<ResearchConsentState> {
    const consent = await this.consentLedger.getEffective(participantId, purposeId, this.now());
    return Object.freeze({
      purposeId,
      granted: consent?.status === "granted",
      consentRecordId: consent?.status === "granted" ? consent.id : null
    });
  }
}

export class InMemoryResearchConsentReader implements ResearchConsentReader {
  private readonly states = new Map<string, ResearchConsentState>();

  set(participantId: ResearchParticipantId, purposeId: PurposeId, granted: boolean, consentRecordId?: string): void {
    this.states.set(`${participantId}:${purposeId}`, Object.freeze({
      purposeId,
      granted,
      consentRecordId: granted ? consentRecordId ?? `consent-${purposeId}` : null
    }));
  }

  async getEffectiveConsent(participantId: ResearchParticipantId, purposeId: PurposeId): Promise<ResearchConsentState> {
    return this.states.get(`${participantId}:${purposeId}`) ?? Object.freeze({ purposeId, granted: false, consentRecordId: null });
  }
}
