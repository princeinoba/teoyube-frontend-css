import { createHash } from "node:crypto";
import {
  TEO_GUIDE_LIMITS,
  type TeoGuideConversationTurn,
  type TeoGuideResponse
} from "../../domain/teo-guide/orchestration-contracts";

export type TeoGuideConversationRecord = Readonly<{
  id: string;
  turns: readonly TeoGuideConversationTurn[];
  createdAt: string;
  updatedAt: string;
  rawUserTextStored: false;
}>;

function fingerprint(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export class TeoGuideConversationRepository {
  readonly #records = new Map<string, TeoGuideConversationRecord>();

  record(input: string, response: TeoGuideResponse, now: string): TeoGuideConversationRecord {
    const current = this.#records.get(response.conversationId);
    const turns = [
      ...(current?.turns || []),
      Object.freeze({ id: `turn-${fingerprint(`${response.id}:user`).slice(0, 16)}`, role: "user" as const, createdAt: now, inputFingerprint: fingerprint(input) }),
      Object.freeze({ id: `turn-${fingerprint(`${response.id}:guide`).slice(0, 16)}`, role: "teo-guide" as const, createdAt: now, responseId: response.id, sourceIds: Object.freeze(response.sources.map((source) => source.id)) })
    ].slice(-TEO_GUIDE_LIMITS.conversationTurns);
    const record = Object.freeze({
      id: response.conversationId,
      turns: Object.freeze(turns),
      createdAt: current?.createdAt || now,
      updatedAt: now,
      rawUserTextStored: false as const
    });
    this.#records.set(record.id, record);
    while (this.#records.size > TEO_GUIDE_LIMITS.conversationCount) {
      const oldest = this.#records.keys().next();
      if (oldest.done) break;
      this.#records.delete(oldest.value);
    }
    return record;
  }

  inspect(conversationId: string): TeoGuideConversationRecord | null {
    return this.#records.get(conversationId) || null;
  }

  delete(conversationId: string): boolean {
    return this.#records.delete(conversationId);
  }
}

export const teoGuideConversations = new TeoGuideConversationRepository();
