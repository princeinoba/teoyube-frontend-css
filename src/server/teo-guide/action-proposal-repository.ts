import { createHash } from "node:crypto";
import type { AuthorizationContext } from "../../domain/identity/identity-contracts";
import {
  TEO_GUIDE_LIMITS,
  type TeoGuideActionProposal,
  type TeoGuideProposalDecision,
  type TeoGuideProposalDecisionResult
} from "../../domain/teo-guide/orchestration-contracts";
import type { PrivacySafeEventSink } from "../observability/privacy-safe-events";
import { nullPrivacySafeEventSink } from "../observability/privacy-safe-events";

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export class TeoGuideActionProposalRepository {
  readonly #records = new Map<string, Readonly<{ proposal: TeoGuideActionProposal; ownerHash?: string }>>();
  readonly #decisions = new Map<string, TeoGuideProposalDecisionResult>();
  constructor(
    private readonly now: () => string = () => new Date().toISOString(),
    private readonly events: PrivacySafeEventSink = nullPrivacySafeEventSink
  ) {}

  create(input: Readonly<{
    kind: TeoGuideActionProposal["kind"];
    label: string;
    summary: string;
    sourceIds: readonly string[];
    payload: TeoGuideActionProposal["payload"];
    ownerUserId?: string;
    undoPolicy?: string;
  }>): TeoGuideActionProposal {
    const createdAt = this.now();
    const id = `teo-proposal-${digest(JSON.stringify({ ...input, createdAt })).slice(0, 20)}`;
    const proposal: TeoGuideActionProposal = Object.freeze({
      id,
      kind: input.kind,
      status: "proposed",
      label: input.label,
      summary: input.summary,
      sourceIds: Object.freeze([...input.sourceIds]),
      requiresAuthentication: true,
      requiresCsrf: true,
      requiresExplicitConfirmation: true,
      reversible: true,
      undoPolicy: input.undoPolicy || "Reject before confirmation; after an application write, use that capability's existing undo action.",
      createdAt,
      expiresAt: new Date(Date.parse(createdAt) + TEO_GUIDE_LIMITS.proposalTtlMs).toISOString(),
      confirmationRevision: 1,
      payload: Object.freeze({ ...input.payload })
    });
    this.#records.set(id, Object.freeze({ proposal, ...(input.ownerUserId ? { ownerHash: digest(input.ownerUserId) } : {}) }));
    return proposal;
  }

  get(id: string, ownerUserId?: string): TeoGuideActionProposal | null {
    const stored = this.#records.get(id);
    if (!stored) return null;
    if (!ownerUserId || !stored.ownerHash || stored.ownerHash !== digest(ownerUserId)) return null;
    return stored.proposal;
  }

  decide(context: AuthorizationContext, decision: TeoGuideProposalDecision): TeoGuideProposalDecisionResult {
    const decisionKey = digest(`${context.user.id}|${decision.idempotencyKey}`);
    const prior = this.#decisions.get(decisionKey);
    if (prior) return prior;
    const stored = this.#records.get(decision.proposalId);
    if (!stored || !stored.ownerHash || stored.ownerHash !== digest(context.user.id)) throw new Error("Action proposal is unavailable.");
    const current = stored.proposal;
    if (current.status !== "proposed" || current.confirmationRevision !== decision.expectedRevision) throw new Error("Action proposal conflict.");
    const occurredAt = this.now();
    const expired = Date.parse(current.expiresAt) <= Date.parse(occurredAt);
    const status = expired ? "expired" : decision.decision === "confirm" ? "confirmed" : "rejected";
    const proposal = Object.freeze({ ...current, status, confirmationRevision: current.confirmationRevision + 1 });
    this.#records.set(proposal.id, Object.freeze({ proposal, ownerHash: stored.ownerHash }));
    if (expired) throw new Error("Action proposal is unavailable.");
    const event = status === "confirmed" ? "teo_guide_action_confirmed" : "teo_guide_action_rejected";
    const subjectHash = digest(context.user.id);
    const proposalHash = digest(proposal.id);
    this.events.emit({ name: event, occurredAt, subjectHash, result: status === "confirmed" ? "allowed" : "denied" });
    const result = Object.freeze({
      proposal,
      applicationActionAuthorized: status === "confirmed",
      durableWritePerformed: false,
      audit: Object.freeze({ event, subjectHash, proposalHash, occurredAt })
    });
    this.#decisions.set(decisionKey, result);
    return result;
  }
}

export const teoGuideActionProposals = new TeoGuideActionProposalRepository();
